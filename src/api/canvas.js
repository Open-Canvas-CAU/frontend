import api from '@/services/api';

// 캔버스 상세 정보 조회
export const getCanvasDetail = async (docId) => {
    try {
        const response = await api.get(`/api/canvas/${docId}`);
        return response.data;
    } catch (error) {
        console.error('캔버스 상세 정보 조회 실패:', error);
        throw error;
    }
};

// 캔버스 좋아요 토글
export const toggleLike = async (docId) => {
    try {
        const response = await api.post(`/api/canvas/${docId}/like`);
        return response.data;
    } catch (error) {
        console.error('좋아요 토글 실패:', error);
        throw error;
    }
};

// 캔버스 투표
export const submitVote = async (docId) => {
    try {
        const response = await api.post(`/api/canvas/${docId}/vote`);
        return response.data;
    } catch (error) {
        console.error('투표 실패:', error);
        throw error;
    }
};

// 댓글 목록 조회
export const getComments = async (docId) => {
    try {
        const response = await api.get(`/api/canvas/${docId}/comments`);
        return response.data;
    } catch (error) {
        console.error('댓글 목록 조회 실패:', error);
        throw error;
    }
};

// 댓글 작성
export const createComment = async (docId, content) => {
    try {
        const response = await api.post(`/api/canvas/${docId}/comment`, { content });
        return response.data;
    } catch (error) {
        console.error('댓글 작성 실패:', error);
        throw error;
    }
};

// 댓글 삭제
export const deleteComment = async (docId, commentId) => {
    try {
        const response = await api.delete(`/api/canvas/${docId}/comment/${commentId}`);
        return response.data;
    } catch (error) {
        console.error('댓글 삭제 실패:', error);
        throw error;
    }
}; 