import { RoomType } from '../enums/roomType';

/**
 * @typedef {Object} CoverDto
 * @property {number} id - coverId
 * @property {string} title - 글 제목
 * @property {string} coverImageUrl - 이미지 url
 * @property {number} contentId - 전체 글 관련 dto
 * @property {string} time - 타임스탬프
 * @property {number} view - 조회수
 * @property {number} likeNum - 좋아요갯수
 * @property {RoomType} roomType - 방 상태
 * @property {string} [roomId] - 현재 편집중인 문서방의 id
 * @property {number} limit - 최대 이어쓸 수 있는 작가수 한계
 */ 