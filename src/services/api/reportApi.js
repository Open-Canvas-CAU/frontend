import { api } from './index';

/**
 * @typedef {import('@/types/dto/report').ReportDto} ReportDto
 */

export const reportApi = {
  /**
   * 글을 신고합니다
   * @param {ReportDto} reportDto 
   * @returns {Promise<Object>}
   */
  reportWriting: (reportDto) => api.post('/reports', reportDto)
}; 