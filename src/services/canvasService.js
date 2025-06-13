// src/services/canvasService.js - Refactored
import api from './api';

/**
 * 캔버스(컨텐츠)와 관련된 API 요청을 처리합니다.
 */
export const canvasService = {
  /**
   * coverId를 이용해 컨텐츠 상세 정보를 조회합니다.
   * @param {string | number} coverId - 조회할 커버의 ID
   * @returns {Promise<import('@/types').ContentDto>}
   */
  getContentByCoverId: (coverId) => {
    return api.get(`/api/contents/${coverId}`);
  },

  /**
   * 컨텐츠에 대한 '좋아요' 또는 '싫어요' 상태를 토글합니다.
   * @param {number} contentId - 대상 컨텐츠의 ID
   * @param {'LIKE' | 'DISLIKE'} likeType - 설정할 상태
   * @returns {Promise<import('@/types').ContentDto>}
   */
  toggleLike: (contentId, likeType) => {
    return api.post(`/api/contents/like-toggle?contentId=${contentId}&likeType=${likeType}`);
  },

  /**
   * 특정 컨텐츠에 달린 댓글 목록을 조회합니다.
   * @param {number} contentId - 댓글을 조회할 컨텐츠의 ID
   * @returns {Promise<import('@/types').ResCommentDto[]>}
   */
  getComments: (contentId) => {
    return api.get(`/api/comments/by-content?contentId=${contentId}`);
  },

  /**
   * 새로운 댓글을 작성합니다.
   * @param {import('@/types').ReqCommentDto} commentData - 댓글 데이터
   * @returns {Promise<import('@/types').ResCommentDto[]>}
   */
  addComment: (commentData) => {
    return api.post('/api/comments/write', commentData);
  },

  /**
   * 댓글을 삭제합니다.
   * @param {number} commentId - 삭제할 댓글의 ID
   * @param {number} contentId - 댓글이 속한 컨텐츠의 ID
   * @returns {Promise<object>}
   */
  deleteComment: (commentId, contentId) => {
    return api.delete('/api/comments/delete', { params: { commentId, contentId } });
  },
  
  /**
   * 특정 글 내용을 신고합니다.
   * @param {import('@/types').ReportDto} reportData - 신고 데이터
   * @returns {Promise<object>}
   */
  reportContent: (reportData) => {
    return api.post('/api/reports', reportData);
  }
};