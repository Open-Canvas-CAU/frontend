import api from './api';
import { RoomType } from '@/types';

/**
 * 방 관련 API 서비스
 */
export const roomService = {
  /**
   * 새로운 방 생성
   * @param {Object} roomData - 방 생성 데이터
   * @param {string} roomData.title - 방 제목
   * @param {string} roomData.body - 초기 내용
   * @param {number} roomData.limit - 최대 인원 수
   * @param {string[]} roomData.genres - 장르 목록
   * @param {string} roomData.coverImageUrl - 커버 이미지 URL
   * @param {RoomType} roomData.roomType - 방 타입
   * @returns {Promise<Object>} 생성된 방 정보
   */
  async createRoom(roomData) {
    const response = await api.post('/api/rooms', roomData);
    return response.data;
  },

  /**
   * 방 정보 조회
   * @param {string} roomId - 방 ID
   * @returns {Promise<Object>} 방 정보
   */
  async getRoom(roomId) {
    const response = await api.get(`/api/rooms/${roomId}`);
    return response.data;
  },

  /**
   * 방 목록 조회
   * @param {Object} params - 조회 파라미터
   * @param {number} [params.page=1] - 페이지 번호
   * @param {number} [params.size=10] - 페이지 크기
   * @param {string} [params.genre] - 장르 필터
   * @param {RoomType} [params.roomType] - 방 타입 필터
   * @returns {Promise<Object>} 방 목록 및 페이지 정보
   */
  async getRooms(params = {}) {
    const response = await api.get('/api/rooms', { params });
    return response.data;
  },

  /**
   * 방 정보 수정
   * @param {string} roomId - 방 ID
   * @param {Object} roomData - 수정할 방 데이터
   * @returns {Promise<Object>} 수정된 방 정보
   */
  async updateRoom(roomId, roomData) {
    const response = await api.put(`/api/rooms/${roomId}`, roomData);
    return response.data;
  },

  /**
   * 방 삭제
   * @param {string} roomId - 방 ID
   * @returns {Promise<void>}
   */
  async deleteRoom(roomId) {
    await api.delete(`/api/rooms/${roomId}`);
  },

  /**
   * 방 참여
   * @param {string} roomId - 방 ID
   * @returns {Promise<Object>} 참여 정보
   */
  async joinRoom(roomId) {
    const response = await api.post(`/api/rooms/${roomId}/join`);
    return response.data;
  },

  /**
   * 방 퇴장
   * @param {string} roomId - 방 ID
   * @returns {Promise<void>}
   */
  async exitRoom(roomId) {
    await api.post(`/api/rooms/${roomId}/exit`);
  },

  /**
   * 방 상태 변경
   * @param {string} roomId - 방 ID
   * @param {RoomType} roomType - 변경할 방 타입
   * @returns {Promise<Object>} 변경된 방 정보
   */
  async changeRoomType(roomId, roomType) {
    const response = await api.put(`/api/rooms/${roomId}/type`, { roomType });
    return response.data;
  },

  /**
   * 방 검색
   * @param {Object} params - 검색 파라미터
   * @param {string} params.keyword - 검색어
   * @param {number} [params.page=1] - 페이지 번호
   * @param {number} [params.size=10] - 페이지 크기
   * @returns {Promise<Object>} 검색 결과 및 페이지 정보
   */
  async searchRooms(params) {
    const response = await api.get('/api/rooms/search', { params });
    return response.data;
  }
}; 