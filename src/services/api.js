// src/services/api.js - isPublic 버그 수정 및 인증 로직 강화
import axios from 'axios'
import { authService } from './authService'

const BASE_URL = import.meta.env.VITE_USE_MOCK_API === 'true' 
  ? ''
  : 'http://localhost:8080'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    // 공개 API 엔드포인트 목록
    const publicEndpoints = [
      '/auth/login', 
      '/auth/refresh', 
      '/oauth2', // '/oauth2'로 시작하는 모든 경로 포함
      '/api/covers/all',
      '/api/covers/views',
      '/api/covers/likes',
      '/api/covers/search'
    ];
    
    // ✅ [버그 수정] startsWith로 각 엔드포인트를 명확하게 확인하도록 변경
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url.startsWith(endpoint)
    );

    console.log('📤 API 요청:', {
      url: config.url,
      method: config.method,
      isPublic: isPublicEndpoint, // 이제 정확하게 false가 나옵니다.
    });
    
    // 비공개 API라면 토큰 유효성 검사
    if (!isPublicEndpoint) {
      try {
        await authService.validateTokens();
      } catch (error) {
        console.error("토큰 유효성 확보 실패. API 요청을 취소합니다.", error);
        return Promise.reject(error);
      }
    }

    // 유효한 토큰을 헤더에 추가
    const token = authService.getAccessToken();
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// 응답 인터셉터 (변경 없음)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const newAccessToken = await authService.refreshToken();
        processQueue(null, newAccessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
