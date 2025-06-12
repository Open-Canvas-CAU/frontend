import { api } from './index';

/**
 * @typedef {import('@/types/dto/room').ChatRoomDto} ChatRoomDto
 * @typedef {import('@/types/dto/writing').WritingDto} WritingDto
 */

export const roomApi = {
  /**
   * 문서방을 생성하고 입장합니다
   * @param {Partial<WritingDto>} writingDto 
   * @returns {Promise<ChatRoomDto>}
   */
  createAndEnter: (writingDto) => api.post('/rooms/create', writingDto),

  /**
   * 구독자로 문서방에 참여합니다
   * @param {string} roomId 
   * @returns {Promise<ChatRoomDto>}
   */
  enterAsSubscriber: (roomId) => api.get(`/rooms/${roomId}`),

  /**
   * 문서방을 나갑니다
   * @param {string} roomId 
   * @returns {Promise<string>}
   */
  exit: (roomId) => api.post(`/rooms/exit?roomId=${roomId}`)
}; 