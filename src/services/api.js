// src/services/api.js - 강화된 인터셉터 버전
import axios from 'axios'
import { authService } from './authService'

const BASE_URL = import.meta.env.VITE_USE_MOCK_API === 'true' 
  ? ''  // Mock API는 상대 경로를 사용
  : 'http://localhost:8080'  // 실제 API 서버

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10초 타임아웃
  validateStatus: function (status) {
    // 2xx와 401은 정상 응답으로 처리 (401은 인터셉터에서 처리)
    return (status >= 200 && status < 300) || status === 401
  }
})

// 토큰 갱신 중인지 확인하는 플래그
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// 요청 인터셉터
api.interceptors.request.use(
  async (config) => {
    // 공개 엔드포인트는 토큰 불필요
    const publicEndpoints = [
      '/auth/login', 
      '/auth/refresh', 
      '/', 
      '/oauth2',
      '/api/covers/all',
      '/api/covers/views',
      '/api/covers/likes',
      '/api/covers/search'
    ]
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url.includes(endpoint)
    )
    
    // 🔧 로깅 추가
    console.log('📤 API 요청:', {
      url: config.url,
      method: config.method,
      isPublic: isPublicEndpoint,
      hasAuth: !!authService.getAccessToken()
    })
    
    if (!isPublicEndpoint) {
      const token = authService.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('🔑 토큰 추가:', token.substring(0, 20) + '...')
      } else {
        console.warn('⚠️ 토큰이 없는 상태로 비공개 API 요청')
      }
    }
    
    return config
  },
  (error) => {
    console.error('❌ 요청 인터셉터 에러:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터 
api.interceptors.response.use(
  (response) => {
    console.log('✅ API 응답:', response.status, response.config.url)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    console.log('📥 API 에러 응답:', {
      status: error.response?.status,
      url: originalRequest?.url,
      hasRetried: originalRequest?._retry
    })

    // 401 에러이고, 재시도하지 않은 요청이며, refresh 요청이 아닌 경우
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/refresh')) {
      
      console.log('🔄 401 에러 감지, 토큰 갱신 처리 시작...')

      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 큐에 추가
        console.log('⏳ 토큰 갱신 중이므로 큐에 추가')
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        console.log('🔄 토큰 갱신 시도...')
        const newToken = await authService.refreshToken()
        
        console.log('✅ 토큰 갱신 성공')
        processQueue(null, newToken)
        
        // 원래 요청에 새 토큰 적용하여 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        console.log('🔄 원래 요청 재시도:', originalRequest.url)
        
        return api(originalRequest)
        
      } catch (refreshError) {
        console.error('❌ 토큰 갱신 실패:', refreshError)
        processQueue(refreshError, null)
        
        // 🔧 개선: 토큰 갱신 실패 시 더 자세한 처리
        if (refreshError.message.includes('401') || 
            refreshError.message.includes('403') || 
            refreshError.message.includes('Unauthorized')) {
          
          console.log('🚪 인증 만료로 인한 로그아웃 처리')
          authService.logout()
          
          // 현재 페이지가 로그인 관련 페이지가 아닌 경우에만 리다이렉트
          const currentPath = window.location.pathname
          if (!currentPath.includes('/login') && !currentPath.includes('/oauth2')) {
            console.log('🔀 로그인 페이지로 리다이렉트')
            window.location.href = '/login'
          }
        }
        
        return Promise.reject(refreshError)
        
      } finally {
        isRefreshing = false
      }
    }

    // 🔧 개선: 기타 에러에 대한 상세 로깅
    if (error.response) {
      console.error('❌ HTTP 에러:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: originalRequest?.url,
        data: error.response.data
      })
    } else if (error.request) {
      console.error('❌ 네트워크 에러:', {
        url: originalRequest?.url,
        message: error.message
      })
    } else {
      console.error('❌ 요청 설정 에러:', error.message)
    }

    return Promise.reject(error)
  }
)

export default api