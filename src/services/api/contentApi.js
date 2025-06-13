import { api } from './index';
import { LikeType } from '@/types/enums/likeType';

/**
 * @typedef {import('@/types/dto/content').ContentDto} ContentDto
 */

export const contentApi = {
  /**
   * coverId로 컨텐츠를 조회합니다. (조회 시 없으면 생성)
   * @param {number} coverId 
   * @returns {Promise<ContentDto>}
   */
  get: (coverId) => api.get(`/contents/${coverId}`), //

  /**
   * 좋아요/싫어요를 토글합니다.
   * @param {number} contentId 
   * @param {LikeType} likeType 
   * @returns {Promise<ContentDto>}
   */
  toggleLike: (contentId, likeType) => 
    api.post(`/contents/like-toggle?contentId=${contentId}&likeType=${likeType}`), //

  /**
   * 장르를 설정합니다.
   * @param {number} contentId 
   * @param {string[]} genres 
   * @returns {Promise<string[]>}
   */
  setGenres: (contentId, genres) => 
    api.post(`/genres/set?contentId=${contentId}`, genres), //

  /**
   * 특정 컨텐츠의 장르 목록을 조회합니다.
   * @param {number} contentId 
   * @returns {Promise<string[]>}
   */
  getGenres: (contentId) => 
    api.get(`/genres/content/${contentId}`) //
};