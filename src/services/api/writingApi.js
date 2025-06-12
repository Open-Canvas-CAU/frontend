import { api } from './index';

/**
 * @typedef {import('@/types/dto/writing').WritingDto} WritingDto
 */

export const writingApi = {
  /**
   * 글을 저장합니다
   * @param {WritingDto} writingDto 
   * @returns {Promise<Object>}
   */
  save: (writingDto) => api.post('/writings', writingDto),

  /**
   * 간단한 글 목록을 조회합니다
   * @param {string} title 
   * @returns {Promise<WritingDto[]>}
   */
  getSimple: (title) => api.get(`/writings/simple?title=${title}`),

  /**
   * 부모 글들을 조회합니다
   * @param {Partial<WritingDto>} writingDto 
   * @returns {Promise<WritingDto[]>}
   */
  getParents: (writingDto) => api.post('/writings/parents', writingDto),

  /**
   * official로 지정합니다
   * @param {Partial<WritingDto>} writingDto 
   * @returns {Promise<WritingDto[]>}
   */
  setOfficial: (writingDto) => api.post('/writings/set/official', writingDto),

  /**
   * official을 제외한 글들을 삭제합니다
   * @param {import('@/types/dto/content').ContentDto} contentDto 
   * @returns {Promise<WritingDto[]>}
   */
  deleteExceptOfficial: (contentDto) => 
    api.post('/writings/delete/except-official', contentDto),

  /**
   * 글 작성 가능 여부를 확인합니다
   * @param {number} parentDepth 
   * @param {number} parentSiblingIndex 
   * @param {string} title 
   * @returns {Promise<Object>}
   */
  checkWriting: (parentDepth, parentSiblingIndex, title) => 
    api.post(`/writings/check?parentDepth=${parentDepth}&parentSiblingIndex=${parentSiblingIndex}&title=${title}`),

  /**
   * 문서방의 글 트리를 조회합니다
   * @param {string} roomId 
   * @returns {Promise<WritingDto[]>}
   */
  getRoomWritings: (roomId) => api.get(`/writings/room/${roomId}`),

  /**
   * official로 지정된 글을 조회합니다
   * @param {import('@/types/dto/content').ContentDto} contentDto 
   * @returns {Promise<WritingDto[]>}
   */
  getOfficial: (contentDto) => api.get('/writings/get/offical', { params: contentDto }),

  /**
   * 루트 글을 삭제합니다
   * @param {Partial<WritingDto>} writingDto 
   * @returns {Promise<Object>}
   */
  deleteRoot: (writingDto) => api.delete('/writings/delete/root', { data: writingDto }),

  /**
   * 관리자가 글을 삭제합니다
   * @param {Partial<WritingDto>} writingDto 
   * @returns {Promise<Object>}
   */
  deleteByAdmin: (writingDto) => api.delete('/writings/delete/admin', { data: writingDto })
}; 