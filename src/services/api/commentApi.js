import { api } from './index';
import { LikeType } from '@/types/enums/likeType';

/**
 * @typedef {import('@/types/dto/comment').ResCommentDto} ResCommentDto
 * @typedef {import('@/types/dto/comment').ReqCommentDto} ReqCommentDto
 */

export const commentApi = {
  /**
   * 댓글을 작성합니다
   * @param {ReqCommentDto} commentDto 
   * @returns {Promise<ResCommentDto[]>}
   */
  write: (commentDto) => api.post('/comments/write', commentDto),

  /**
   * 댓글의 좋아요/싫어요를 토글합니다
   * @param {number} commentId 
   * @param {LikeType} likeType 
   * @returns {Promise<ResCommentDto[]>}
   */
  toggleLike: (commentId, likeType) => 
    api.post(`/comments/like-toggle?commentId=${commentId}&likeType=${likeType}`),

  /**
   * 특정 글의 댓글을 조회합니다
   * @param {number} contentId 
   * @returns {Promise<ResCommentDto[]>}
   */
  getByContent: (contentId) => 
    api.get(`/comments/by-content?contentId=${contentId}`),

  /**
   * 댓글을 삭제합니다
   * @param {number} commentId 
   * @param {number} contentId 
   * @returns {Promise<ResCommentDto[]>}
   */
  delete: (commentId, contentId) => 
    api.delete(`/comments/delete?commentId=${commentId}&contentId=${contentId}`)
}; 