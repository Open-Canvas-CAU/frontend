/**
 * 기본 이미지 URL 상수
 */
export const DEFAULT_IMAGES = {
  // 커버 이미지
  COVER: {
    DEFAULT: '/images/default-cover.jpg',
    PLACEHOLDER: '/images/cover-placeholder.jpg',
    THUMBNAIL: '/images/cover-thumbnail.jpg'
  },
  
  // 프로필 이미지
  PROFILE: {
    DEFAULT: '/images/default-avatar.png',
    PLACEHOLDER: '/images/avatar-placeholder.png',
    THUMBNAIL: '/images/avatar-thumbnail.png'
  },
  
  // 배경 이미지
  BACKGROUND: {
    DEFAULT: '/images/default-background.jpg',
    PLACEHOLDER: '/images/background-placeholder.jpg'
  },
  
  // 아이콘
  ICON: {
    LOGO: '/images/logo.png',
    FAVICON: '/images/favicon.ico',
    APPLE_TOUCH: '/images/apple-touch-icon.png'
  }
};

/**
 * 기본 설정 상수
 */
export const DEFAULT_SETTINGS = {
  // 방 설정
  ROOM: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
    MIN_LIMIT: 2,
    DEFAULT_TITLE: '새로운 이야기',
    MAX_TITLE_LENGTH: 100
  },
  
  // 글 설정
  WRITING: {
    DEFAULT_TITLE: '새로운 글',
    MAX_TITLE_LENGTH: 200,
    MAX_CONTENT_LENGTH: 10000,
    DEFAULT_CONTENT: '<p>새로운 이야기를 시작하세요...</p>'
  },
  
  // 댓글 설정
  COMMENT: {
    MAX_LENGTH: 500,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },
  
  // 좋아요 설정
  LIKE: {
    MAX_PER_USER: 100,
    MAX_PER_CONTENT: 1000
  }
};

/**
 * 장르 상수
 */
export const GENRES = {
  FANTASY: '판타지',
  MYSTERY: '미스터리',
  ROMANCE: '로맨스',
  SF: 'SF',
  THRILLER: '스릴러',
  HORROR: '공포',
  COMEDY: '코미디',
  DRAMA: '드라마',
  ACTION: '액션',
  ADVENTURE: '모험',
  HISTORICAL: '역사',
  EDUCATIONAL: '교육',
  POETRY: '시',
  ESSAY: '에세이',
  OTHER: '기타'
};

/**
 * API 상태 코드 상수
 */
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * 파일 업로드 상수
 */
export const UPLOAD_CONSTANTS = {
  // 이미지
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    MAX_DIMENSION: 4096, // px
    COMPRESSION_QUALITY: 0.8
  },
  
  // 문서
  DOCUMENT: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    MAX_PAGES: 100
  },
  
  // 기타
  MAX_FILES_PER_UPLOAD: 10,
  MAX_TOTAL_SIZE: 50 * 1024 * 1024 // 50MB
};

/**
 * 캐시 상수
 */
export const CACHE_CONSTANTS = {
  // 로컬 스토리지 키
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_INFO: 'user_info',
    THEME: 'theme',
    LANGUAGE: 'language',
    RECENT_ROOMS: 'recent_rooms',
    DRAFT: 'draft'
  },
  
  // 캐시 만료 시간 (ms)
  EXPIRATION: {
    SHORT: 5 * 60 * 1000, // 5분
    MEDIUM: 30 * 60 * 1000, // 30분
    LONG: 24 * 60 * 60 * 1000, // 24시간
    VERY_LONG: 7 * 24 * 60 * 60 * 1000 // 7일
  }
};

/**
 * 테마 상수
 */
export const THEME_CONSTANTS = {
  // 색상
  COLORS: {
    PRIMARY: '#FF4B4B',
    SECONDARY: '#4B4BFF',
    SUCCESS: '#4BFF4B',
    WARNING: '#FFB74B',
    ERROR: '#FF4B4B',
    INFO: '#4B4BFF',
    BACKGROUND: {
      LIGHT: '#FFFFFF',
      DARK: '#000000',
      GRAY: '#1A1A1A'
    },
    TEXT: {
      LIGHT: '#FFFFFF',
      DARK: '#000000',
      GRAY: '#666666'
    }
  },
  
  // 폰트
  FONTS: {
    PRIMARY: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
    SECONDARY: 'Noto Sans KR, sans-serif',
    MONO: 'Fira Code, monospace'
  },
  
  // 그림자
  SHADOWS: {
    SMALL: '0 2px 4px rgba(0, 0, 0, 0.1)',
    MEDIUM: '0 4px 8px rgba(0, 0, 0, 0.1)',
    LARGE: '0 8px 16px rgba(0, 0, 0, 0.1)'
  },
  
  // 반응형
  BREAKPOINTS: {
    MOBILE: '640px',
    TABLET: '1024px',
    DESKTOP: '1280px',
    WIDE: '1536px'
  }
}; 