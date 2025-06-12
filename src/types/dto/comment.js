import { LikeType } from '../enums/likeType';

/**
 * @typedef {Object} ResCommentDto
 * @property {number} id - 댓글 id
 * @property {number} contentId - 전체 글(content) Id
 * @property {number} userId - 유저 id
 * @property {Array<CommentLikeDto>} commentLikeDtos - 댓글 좋아요 관련 dto
 * @property {string} body - 댓글내용
 * @property {string} time - 타임스탬프
 * @property {number} likeNum - 좋아요수
 * @property {number} disLikeNum - 싫어요수
 * @property {LikeType} [likeType] - 내가 좋아요/싫어요를 눌렀는지
 */

/**
 * @typedef {Object} CommentLikeDto
 * @property {number} commentId - 댓글id
 * @property {number} userId - 유저id
 * @property {LikeType} likeType - 내가 댓글에 좋아요/싫어요를 눌렀는지
 */

/**
 * @typedef {Object} ReqCommentDto
 * @property {number} contentId - 전체 글(content) id
 * @property {string} body - 댓글 내용
 * @property {string} time - 타임스탬프
 */ 