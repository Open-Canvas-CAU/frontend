// src/services/api.js - isPublic 버그 수정 및 인증 로직 강화
import axios from 'axios'
import { API_BASE_URL } from '@/config'
import { authService } from './authService'

const API_URL = import.meta.env.VITE_USE_MOCK_API === 'true'
  ? 'http://localhost:5173/mock-api'
  : API_BASE_URL

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // 쿠키 포함
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
});

// 요청 인터셉터
api.interceptors.request.use(
  async (config) => {
    try {
      // 토큰 유효성 검사 및 갱신
      const token = await authService.validateTokens();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('API 요청 준비 중 오류:', error);
      // 토큰 관련 에러인 경우 로그인 페이지로 리다이렉트
      if (error.message.includes('토큰') || error.message.includes('인증')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('API 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료로 인한 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 재발급 시도
        const newToken = await authService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('토큰 재발급 실패:', refreshError);
        // 토큰 재발급 실패 시 에러 반환
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const _request = async ({ url, method, data, isPublic = false }) => {
  try {
    console.log('API 요청:', { url, method, isPublic });
    const response = await api({
      url,
      method,
      data,
      headers: isPublic ? {} : undefined
    });
    return response.data;
  } catch (error) {
    console.error('API 요청 실패:', error);
    throw error;
  }
};

export default api;
