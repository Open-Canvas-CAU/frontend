/**
 * 애플리케이션의 모든 라우트 경로를 정의합니다.
 */
export const ROUTES = {
  // 기본 라우트
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
  
  // 에디터 관련 라우트
  EDITOR: {
    NEW: '/editor/new',
    EDIT: (roomId) => `/editor/${roomId}`,
    VIEW: (roomId) => `/editor/${roomId}/view`,
    COMPLETED: (roomId) => `/editor/${roomId}/completed`
  },
  
  // 캔버스 관련 라우트
  CANVAS: {
    NEW: '/canvas/new',
    VIEW: (coverId) => `/canvas/${coverId}`,
    EDIT: (coverId) => `/canvas/${coverId}/edit`,
    COMPLETED: (coverId) => `/canvas/${coverId}/completed`,
    COVER: (coverId) => `/cover/${coverId}`
  },
  
  // 관리자 라우트
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings'
  }
}; 