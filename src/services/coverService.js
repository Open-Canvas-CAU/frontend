import api from './api'
import { authService } from './authService'

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
  },

  /**
   * 특정 ID의 cover 정보를 조회합니다.
   * @param {string | number} coverId - 조회할 cover의 ID
   * @returns {Promise<object>} CoverDto 객체를 포함하는 Promise
   */
  getCoverById: async (coverId) => {
    try {
      const response = await api.get(`/api/covers/${coverId}`)
      return response
    } catch (error) {
      console.error('Cover 조회 실패:', error)
      throw error
    }
  },

  /**
   * Cover의 상태를 업데이트합니다.
   * @param {string | number} coverId - 업데이트할 cover의 ID
   * @param {'EDITING' | 'AVAILABLE' | 'COMPLETE'} status - 변경할 상태
   * @returns {Promise<object>} 업데이트된 CoverDto 객체
   */
  updateCoverStatus: async (coverId, status) => {
    try {
      const response = await api.patch(`/api/covers/${coverId}/status`, null, {
        params: { status }
      })
      return response
    } catch (error) {
      console.error('Cover 상태 업데이트 실패:', error)
      throw error
    }
  },

  /**
   * 새로운 문서방을 생성합니다.
   * 1. 먼저 cover를 생성하고
   * 2. 생성된 coverId로 content를 생성합니다.
   * @param {object} coverData - cover 생성에 필요한 데이터
   * @param {object} contentData - content 생성에 필요한 데이터
   * @returns {Promise<{cover: object, content: object}>} 생성된 cover와 content 정보
   */
  createDocumentRoom: async (coverData, contentData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // 1. Cover 생성
      const coverResponse = await api.post('/covers', coverData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const coverId = coverResponse.data.id;

      // 2. Content 생성
      const contentResponse = await api.post(`/contents/${coverId}`, contentData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        cover: coverResponse.data,
        content: contentResponse.data
      };
    } catch (error) {
      console.error('문서방 생성 실패:', error);
      throw error;
    }
  },

  /**
   * 문서방에서 나가기
   * @param {string | number} roomId - 나갈 방의 ID
   * @returns {Promise<object>} API 응답 데이터
   */
  exitRoom: async (roomId) => {
    try {
      const response = await api.post('/api/rooms/exit', null, {
        params: { roomId }
      })
      return response
    } catch (error) {
      console.error('방 나가기 실패:', error)
      throw error
    }
  },

  /**
   * 내가 작성한 캔버스 목록을 가져옵니다.
   * TODO: 백엔드 API 구현 후 수정 필요
   */
  getMyCovers: async () => {
    try {
      // 임시로 모든 캔버스를 가져온 후 클라이언트에서 필터링
      const response = await api.get('/api/covers/all');
      
      if (response.data) {
        // 현재 로그인한 사용자의 이메일로 필터링
        const currentUser = authService.getCurrentUser();
        if (currentUser?.email) {
          response.data = response.data.filter(cover => 
            cover.userEmail === currentUser.email
          );
        } else {
          response.data = [];
        }
      }
      
      return response;
    } catch (error) {
      console.error('내 캔버스 목록 조회 실패:', error);
      throw error;
    }
  },
}