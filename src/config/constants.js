// API 엔드포인트
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  AUTH: '/auth',
  USER: '/user',
  // 추가 엔드포인트들...
};

// 앱 설정
export const APP_CONFIG = {
  APP_NAME: 'OpenCanvas',
  VERSION: '1.0.0',
  // 추가 설정들...
};

// 라우트 경로
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EDITOR: '/editor',
  // 추가 라우트들...
}; 