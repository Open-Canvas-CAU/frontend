import { api } from './index';

/**
 * @typedef {import('@/types/dto/user').UserDto} UserDto
 * @typedef {import('@/types/dto/cover').CoverDto} CoverDto
 */

export const userApi = {
  /**
   * 현재 로그인한 사용자 정보를 조회합니다
   * @returns {Promise<UserDto>}
   */
  getCurrentUser: () => api.get('/users/'),

  /**
   * 사용자가 좋아요한 커버 목록을 조회합니다
   * @returns {Promise<CoverDto[]>}
   */
  getLikedContents: () => api.get('/users/likes'),

  /**
   * 사용자의 글쓰기 색상을 변경합니다
   * @param {string} color 
   * @returns {Promise<string>}
   */
  updateColor: (color) => api.put(`/users/color?color=${color}`)
}; 