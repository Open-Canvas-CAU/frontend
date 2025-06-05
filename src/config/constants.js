// API 엔드포인트
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  AUTH: '/auth',
  USER: '/user',
};

// 앱 설정
export const APP_CONFIG = {
  APP_NAME: 'OpenCanvas',
  VERSION: '1.0.0',
};

// 라우트 경로
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EDITOR: '/editor',
}; 