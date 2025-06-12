import { LikeType } from '../enums/likeType';

/**
 * @typedef {Object} ContentDto
 * @property {number} id
 * @property {number} view - 조회수
 * @property {Array<import('./comment').ResCommentDto>} commentDtos - 댓글dto
 * @property {Array<import('./writing').WritingDto>} writingDtos - 조각글들
 * @property {Array<import('./like').LikeDto>} likeDtos - 좋아요 정보
 * @property {import('./cover').CoverDto} coverDto
 * @property {number} likeNum - 좋아요수
 * @property {LikeType} [likeType] - 내가 좋아요/싫어요를 눌렀는지
 * @property {string} title - 제목
 * @property {string} [official]
 * @property {string[]} genres - 장르 리스트
 */ 