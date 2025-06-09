import api from './api'

export const coverService = {
  // 기존 API들
  getAllCovers: () => api.get('/api/covers/all'),
  
  getCoversByViews: () => api.get('/api/covers/views'),
  
  getCoversByLikes: () => api.get('/api/covers/likes'),
  
  searchCovers: (keyword) => api.get(`/api/covers/search?keyword=${encodeURIComponent(keyword)}`),
  
  createCover: (coverData) => api.post('/api/covers', coverData),
  
  deleteCover: (id) => api.delete(`/api/covers/${id}`),

  // 클라이언트에서 필터링하는 헬퍼 함수들
  
  /**
   * 작업 중인 캔버스들을 필터링해서 반환
   * contentId가 null인 것들 = 작업 중
   */
  getWorkingCovers: async () => {
    try {
      const response = await api.get('/api/covers/all')
      
      if (response.data) {
        // contentId가 null이거나 undefined인 것들만 필터링
        response.data = response.data.filter(cover => 
          cover.contentId === null || cover.contentId === undefined
        )
      }
      
      return response
    } catch (error) {
      console.error('작업 중인 캔버스 조회 실패:', error)
      throw error
    }
  },

  /**
   * 완성된 캔버스들을 필터링해서 반환  
   * contentId가 있는 것들 = 완성작
   */
  getCompletedCovers: async () => {
    try {
      const response = await api.get('/api/covers/all')
      
      if (response.data) {
        // contentId가 있는 것들만 필터링
        response.data = response.data.filter(cover => 
          cover.contentId !== null && cover.contentId !== undefined
        )
      }
      
      return response
    } catch (error) {
      console.error('완성된 캔버스 조회 실패:', error)
      throw error
    }
  },

  /**
   * 사용자별 캔버스 조회 (추후 백엔드 API 구현 시 사용)
   */
  getUserCovers: async () => {
    try {
      // TODO: 백엔드에서 사용자별 캔버스 조회 API 구현 시 활성화
      // const response = await api.get('/api/users/covers')
      console.log('getUserCovers - 아직 구현되지 않음')
      return { data: [] }
    } catch (error) {
      console.error('사용자 캔버스 조회 실패:', error)
      throw error
    }
  }
}