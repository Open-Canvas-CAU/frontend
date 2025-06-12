// API 및 WebSocket 서버 설정
const config = {
  // 개발 환경
  development: {
    apiBaseUrl: 'http://localhost:8080',
    wsBaseUrl: 'ws://localhost:8080'
  },
  // 프로덕션 환경
  production: {
    apiBaseUrl: 'http://ec2-54-180-117-21.ap-northeast-2.compute.amazonaws.com',
    wsBaseUrl: 'ws://ec2-54-180-117-21.ap-northeast-2.compute.amazonaws.com'
  }
};

// 현재 환경 설정 (개발/프로덕션)
const env = import.meta.env.MODE || 'development';
const currentConfig = config[env];

export const API_BASE_URL = currentConfig.apiBaseUrl;
export const WS_BASE_URL = currentConfig.wsBaseUrl; 