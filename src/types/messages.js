/**
 * 성공 메시지 상수
 */
export const SUCCESS_MESSAGES = {
  // 인증 관련
  LOGIN_SUCCESS: '로그인되었습니다.',
  LOGOUT_SUCCESS: '로그아웃되었습니다.',
  SIGNUP_SUCCESS: '회원가입이 완료되었습니다.',
  PASSWORD_CHANGED: '비밀번호가 변경되었습니다.',
  
  // 방 관련
  ROOM_CREATED: '새로운 방이 생성되었습니다.',
  ROOM_JOINED: '방에 입장했습니다.',
  ROOM_EXITED: '방을 나갔습니다.',
  ROOM_SAVED: '방 내용이 저장되었습니다.',
  ROOM_DELETED: '방이 삭제되었습니다.',
  
  // 글 관련
  WRITING_SAVED: '글이 저장되었습니다.',
  WRITING_DELETED: '글이 삭제되었습니다.',
  WRITING_UPDATED: '글이 수정되었습니다.',
  
  // 댓글 관련
  COMMENT_ADDED: '댓글이 등록되었습니다.',
  COMMENT_DELETED: '댓글이 삭제되었습니다.',
  COMMENT_UPDATED: '댓글이 수정되었습니다.',
  
  // 좋아요 관련
  LIKE_ADDED: '좋아요를 눌렀습니다.',
  LIKE_REMOVED: '좋아요를 취소했습니다.',
  
  // 신고 관련
  REPORT_SUBMITTED: '신고가 접수되었습니다.',
  
  // 프로필 관련
  PROFILE_UPDATED: '프로필이 수정되었습니다.',
  
  // 기타
  SETTINGS_SAVED: '설정이 저장되었습니다.',
  CHANGES_SAVED: '변경사항이 저장되었습니다.'
};

/**
 * UI 관련 상수
 */
export const UI_CONSTANTS = {
  // 로딩 관련
  LOADING_DELAY: 500, // ms
  DEBOUNCE_DELAY: 300, // ms
  THROTTLE_DELAY: 100, // ms
  
  // 페이지네이션
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  
  // 입력 제한
  MAX_TITLE_LENGTH: 100,
  MAX_CONTENT_LENGTH: 10000,
  MAX_COMMENT_LENGTH: 500,
  
  // 파일 업로드
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  
  // 웹소켓
  WS_RECONNECT_DELAY: 3000, // ms
  WS_HEARTBEAT_INTERVAL: 30000, // ms
  
  // 애니메이션
  TRANSITION_DURATION: 300, // ms
  FADE_DURATION: 200, // ms
  
  // 반응형
  MOBILE_BREAKPOINT: 640, // px
  TABLET_BREAKPOINT: 1024, // px
  DESKTOP_BREAKPOINT: 1280, // px
  
  // 기타
  DEFAULT_AVATAR: '/images/default-avatar.png',
  DEFAULT_COVER: '/images/default-cover.jpg',
  MAX_TAG_COUNT: 5,
  MAX_GENRE_COUNT: 3
};

/**
 * 웹소켓 관련 상수
 */
export const WS_CONSTANTS = {
  // 메시지 타입
  MESSAGE_TYPES: {
    CONNECT: 'CONNECT',
    DISCONNECT: 'DISCONNECT',
    EDIT: 'EDIT',
    JOIN: 'JOIN',
    LEAVE: 'LEAVE',
    ERROR: 'ERROR',
    HEARTBEAT: 'HEARTBEAT'
  },
  
  // 상태
  STATUS: {
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    DISCONNECTED: 'DISCONNECTED',
    ERROR: 'ERROR'
  },
  
  // 설정
  RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 3000, // ms
  HEARTBEAT_INTERVAL: 30000, // ms
  MESSAGE_QUEUE_SIZE: 100
}; 