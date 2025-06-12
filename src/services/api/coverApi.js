import { api } from './index';
import { RoomType } from '@/types/enums/roomType';

/**
 * @typedef {import('@/types/dto/cover').CoverDto} CoverDto
 */

export const coverApi = {
  /**
   * 새로운 커버를 생성합니다
   * @param {Partial<CoverDto>} data 
   * @returns {Promise<CoverDto>}
   */
  create: (data) => api.post('/covers', data),

  /**
   * 모든 커버를 최신순으로 조회합니다
   * @returns {Promise<CoverDto[]>}
   */
  getAll: () => api.get('/covers/all'),

  /**
   * 조회수 기준으로 커버를 조회합니다
   * @returns {Promise<CoverDto[]>}
   */
  getByViews: () => api.get('/covers/views'),

  /**
   * 좋아요 수 기준으로 커버를 조회합니다
   * @returns {Promise<CoverDto[]>}
   */
  getByLikes: () => api.get('/covers/likes'),

  /**
   * 제목으로 커버를 검색합니다
   * @param {string} keyword 
   * @returns {Promise<CoverDto[]>}
   */
  search: (keyword) => api.get(`/covers/search?keyword=${keyword}`),

  /**
   * 커버의 상태를 확인합니다
   * @param {number} coverId 
   * @returns {Promise<CoverDto>}
   */
  checkStatus: (coverId) => api.get(`/covers/check?coverId=${coverId}`),

  /**
   * 커버를 삭제합니다 (관리자만 가능)
   * @param {number} id 
   * @returns {Promise<string>}
   */
  delete: (id) => api.delete(`/covers/${id}`)
}; 