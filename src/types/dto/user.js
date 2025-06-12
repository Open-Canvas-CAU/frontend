import { UserRole } from '../enums/userRole';

/**
 * @typedef {Object} UserDto
 * @property {number} id - 인조키
 * @property {string} nickname - 현재는 이메일을 중복으로 담음
 * @property {string} email - 이메일
 * @property {string} color - 글씨 색상
 * @property {UserRole} role - 역할
 * @property {Array<import('./like').LikeDto>} likeDtos
 * @property {Array<import('./writing').WritingDto>} writingDtos
 */ 