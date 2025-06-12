/**
 * @typedef {Object} WritingDto
 * @property {number} depth - 현재 몇번째로 이어쓰고 있나
 * @property {number} siblingIndex - 현재 이어쓰기 번째에서 몇번째 글인가 (최대2)
 * @property {number} [parentSiblingIndex] - 부모는 몇번째 글인가(최대2)
 * @property {string} [body] - 글내용
 * @property {string} [time] - 타임스탬프
 * @property {string} [username] - 이메일
 * @property {string} title - 전체 글의 제목
 * @property {number} [userId]
 * @property {number} [contentId] - 전체 글의 id
 * @property {string} [color] - 유저의 색상
 */ 