/**
 * @typedef {Object} ApiError
 * @property {string} message - 에러 메시지
 * @property {number} status - HTTP 상태 코드
 * @property {string} code - 에러 코드
 */

/**
 * @enum {string}
 */
export const ErrorCode = {
  // 인증 관련 에러
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // 입력값 관련 에러
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // 리소스 관련 에러
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // 권한 관련 에러
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // 서버 관련 에러
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // 비즈니스 로직 관련 에러
  ROOM_FULL: 'ROOM_FULL',
  ROOM_CLOSED: 'ROOM_CLOSED',
  ROOM_EXIT_FAILED: 'ROOM_EXIT_FAILED',
  INVALID_ROOM_STATE: 'INVALID_ROOM_STATE',
  INVALID_OPERATION: 'INVALID_OPERATION'
};

/**
 * @enum {number}
 */
export const ErrorStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * 에러 메시지
 * @type {Object.<string, string>}
 */
export const ERROR_MESSAGES = {
  [ErrorCode.AUTH_REQUIRED]: '로그인이 필요한 서비스입니다.',
  [ErrorCode.INVALID_TOKEN]: '유효하지 않은 토큰입니다.',
  [ErrorCode.TOKEN_EXPIRED]: '만료된 토큰입니다. 다시 로그인해주세요.',
  [ErrorCode.UNAUTHORIZED]: '인증이 필요합니다.',
  [ErrorCode.INVALID_INPUT]: '잘못된 입력값입니다.',
  [ErrorCode.MISSING_REQUIRED_FIELD]: '필수 입력값이 누락되었습니다.',
  [ErrorCode.INVALID_FORMAT]: '잘못된 형식입니다.',
  [ErrorCode.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ErrorCode.ALREADY_EXISTS]: '이미 존재하는 리소스입니다.',
  [ErrorCode.RESOURCE_LOCKED]: '리소스가 잠겨있습니다.',
  [ErrorCode.FORBIDDEN]: '접근이 거부되었습니다.',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: '권한이 부족합니다.',
  [ErrorCode.SERVER_ERROR]: '서버 오류가 발생했습니다.',
  [ErrorCode.DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다.',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: '외부 서비스 오류가 발생했습니다.',
  [ErrorCode.ROOM_FULL]: '방이 가득 찼습니다.',
  [ErrorCode.ROOM_CLOSED]: '닫힌 방입니다.',
  [ErrorCode.ROOM_EXIT_FAILED]: '방을 나가는데 실패했습니다.',
  [ErrorCode.INVALID_ROOM_STATE]: '잘못된 방 상태입니다.',
  [ErrorCode.INVALID_OPERATION]: '잘못된 작업입니다.'
};

/**
 * API 에러 생성 함수
 * @param {ErrorCode} code - 에러 코드
 * @param {string} [message] - 커스텀 에러 메시지
 * @param {number} [status] - HTTP 상태 코드
 * @returns {ApiError}
 */
export function createApiError(code, message, status) {
  return {
    code,
    message: message || ERROR_MESSAGES[code] || '알 수 없는 오류가 발생했습니다.',
    status: status || ErrorStatus.INTERNAL_SERVER_ERROR
  };
}

/**
 * 에러 코드로부터 HTTP 상태 코드를 가져오는 함수
 * @param {ErrorCode} code - 에러 코드
 * @returns {number} HTTP 상태 코드
 */
export function getErrorStatus(code) {
  const statusMap = {
    [ErrorCode.AUTH_REQUIRED]: ErrorStatus.UNAUTHORIZED,
    [ErrorCode.INVALID_TOKEN]: ErrorStatus.UNAUTHORIZED,
    [ErrorCode.TOKEN_EXPIRED]: ErrorStatus.UNAUTHORIZED,
    [ErrorCode.UNAUTHORIZED]: ErrorStatus.UNAUTHORIZED,
    [ErrorCode.INVALID_INPUT]: ErrorStatus.BAD_REQUEST,
    [ErrorCode.MISSING_REQUIRED_FIELD]: ErrorStatus.BAD_REQUEST,
    [ErrorCode.INVALID_FORMAT]: ErrorStatus.BAD_REQUEST,
    [ErrorCode.NOT_FOUND]: ErrorStatus.NOT_FOUND,
    [ErrorCode.ALREADY_EXISTS]: ErrorStatus.CONFLICT,
    [ErrorCode.RESOURCE_LOCKED]: ErrorStatus.CONFLICT,
    [ErrorCode.FORBIDDEN]: ErrorStatus.FORBIDDEN,
    [ErrorCode.INSUFFICIENT_PERMISSIONS]: ErrorStatus.FORBIDDEN,
    [ErrorCode.SERVER_ERROR]: ErrorStatus.INTERNAL_SERVER_ERROR,
    [ErrorCode.DATABASE_ERROR]: ErrorStatus.INTERNAL_SERVER_ERROR,
    [ErrorCode.EXTERNAL_SERVICE_ERROR]: ErrorStatus.SERVICE_UNAVAILABLE,
    [ErrorCode.ROOM_FULL]: ErrorStatus.CONFLICT,
    [ErrorCode.ROOM_CLOSED]: ErrorStatus.FORBIDDEN,
    [ErrorCode.ROOM_EXIT_FAILED]: ErrorStatus.INTERNAL_SERVER_ERROR,
    [ErrorCode.INVALID_ROOM_STATE]: ErrorStatus.BAD_REQUEST,
    [ErrorCode.INVALID_OPERATION]: ErrorStatus.BAD_REQUEST
  };

  return statusMap[code] || ErrorStatus.INTERNAL_SERVER_ERROR;
} 