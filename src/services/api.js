import axios from 'axios'
import { authService } from './authService'

const BASE_URL = import.meta.env.VITE_USE_MOCK_API === 'true' 
  ? ''  // Mock API는 상대 경로를 사용
  : 'http://localhost:8080'  // 실제 API 서버

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터
api.interceptors.request.use(
  async (config) => {
    // 토큰이 필요한 요청인 경우에만 토큰 추가
    if (!config.url.includes('/auth/login')) {
      const token = await authService.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 토큰 만료로 인한 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // 토큰 갱신 시도
        const tokens = authService.getTokens()
        if (tokens?.refreshToken) {
          await authService.refreshToken(tokens.refreshToken)
          
          // 새로운 토큰으로 원래 요청 재시도
          const newToken = await authService.getAccessToken()
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        authService.logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api 