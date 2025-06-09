import api from './api';

/**
 * 캔버스(컨텐츠)와 관련된 API 요청을 처리하는 서비스 객체입니다.
 */
export const canvasService = {
  /**
   * 특정 컨텐츠의 상세 정보를 조회합니다.
   * @param {string | number} contentId - 조회할 컨텐츠의 ID
   * @returns {Promise<object>} ContentDto 객체를 포함하는 Promise
   */
  getCanvasDetail: async (contentId) => {
    try {
      const response = await api.get(`/api/contents/${contentId}`);
      return response.data;
    } catch (error) {
      console.error('캔버스 상세 정보 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 컨텐츠에 대한 '좋아요' 또는 '싫어요' 상태를 토글합니다.
   * @param {string | number} contentId - 대상 컨텐츠의 ID
   * @param {'LIKE' | 'DISLIKE'} likeType - 설정할 상태
   * @returns {Promise<object>} 업데이트된 ContentDto 객체
   */
  toggleLike: async (contentId, likeType) => {
    try {
      const response = await api.post(`/api/contents/like-toggle`, null, {
        params: { contentId, likeType },
      });
      return response.data;
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
      throw error;
    }
  },

  /**
   * 특정 컨텐츠에 달린 댓글 목록을 조회합니다.
   * @param {string | number} contentId - 댓글을 조회할 컨텐츠의 ID
   * @returns {Promise<Array<object>>} ResCommentDto 배열
   */
  getComments: async (contentId) => {
    try {
      const response = await api.get('/api/comments/by-content', {
        params: { contentId },
      });
      return response.data;
    } catch (error) {
      console.error('댓글 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 새로운 댓글을 작성합니다.
   * @param {object} commentData - 댓글 데이터 (contentId, body 포함)
   * @returns {Promise<object>} 생성된 ResCommentDto 객체
   */
  addComment: async (commentData) => {
    try {
      // API 명세에 따라 time 필드를 추가합니다.
      const payload = {
        ...commentData,
        time: new Date().toISOString(),
      };
      const response = await api.post('/api/comments/write', payload);
      return response.data;
    } catch (error)      {
      console.error('댓글 작성 실패:', error);
      throw error;
    }
  },
  
  /**
   * 댓글을 삭제합니다.
   * @param {string | number} commentId - 삭제할 댓글의 ID
   * @param {string | number} contentId - 댓글이 속한 컨텐츠의 ID
   * @returns {Promise<object>} API 응답 데이터
   */
  deleteComment: async (commentId, contentId) => {
      try {
          const response = await api.delete('/api/comments/delete', {
              params: { commentId, contentId }
          });
          return response.data;
      } catch (error) {
          console.error('댓글 삭제 실패:', error);
          throw error;
      }
  },

/**
 * 특정 글 내용을 신고합니다.
 * @param {object} reportData - 신고 데이터를 담은 ReportDto 객체
 * @returns {Promise<object>} API 응답 데이터
 */
  reportContent: async (reportData) => {
    try {
      // API 명세에 따라 ReportDto 형식으로 payload를 구성합니다.
      const payload = {
        title: reportData.title,
        depth: reportData.depth,
        siblingIndex: reportData.siblingIndex,
        body: reportData.body, // 신고 사유 + 신고된 텍스트
        time: new Date().toISOString(),
      };
      const response = await api.post('/api/reports', payload);
      return response.data;
    } catch (error) {
      console.error('글 신고 실패:', error);
      throw error;
    }
  },

  /**
   * 공식(Official)으로 채택된 글의 내용을 가져옵니다.
   * @param {object} contentDto - 현재 컨텐츠 DTO
   * @returns {Promise<Array<object>>} 공식 버전의 WritingDto 배열
   */
  getOfficialWritings: async (contentDto) => {
    try {
      // GET 요청이지만 body에 데이터를 보내야 하므로 params로 전달합니다.
      const response = await api.get('/api/writings/get/offical', {
        params: { arg0: contentDto }
      });
      return response.data;
    } catch (error) {
      console.error('공식 글 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 특정 버전을 공식(Official) 버전으로 설정합니다.
   * @param {object} writingDto - 공식으로 지정할 버전의 WritingDto (depth, siblingIndex, title 필요)
   * @returns {Promise<Array<object>>} 새로 설정된 공식 버전의 WritingDto 배열
   */
  setOfficialWriting: async (writingDto) => {
    try {
      const response = await api.post('/api/writings/set/official', writingDto);
      return response.data;
    } catch (error) {
      console.error('공식 글 지정 실패:', error);
      throw error;
    }
  }
};
