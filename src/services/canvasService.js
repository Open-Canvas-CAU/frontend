import api from './api'

export const canvasService = {
  // GET /api/contents/:coverId
  async getCanvas(docId) {
    const response = await api.get(`/api/contents/${docId}`)
    // openai.json의 ContentDto 구조로 변환
    const content = response.data
    return {
      id: content.id,
      view: content.view,
      commentDtos: content.commentDtos,
      writingDtos: content.writingDtos,
      likeDtos: content.likeDtos,
      coverDto: content.coverDto,
      likeNum: content.likeNum,
      likeType: content.likeType,
      title: content.title
    }
  },

  // POST /api/contents/like-toggle?contentId=&likeType=
  async toggleLike(docId) {
    const response = await api.post(`/api/contents/like-toggle`, null, {
      params: {
        contentId: docId,
        likeType: 'LIKE'
      }
    })
    return response.data
  },

  // POST /api/contents/like-toggle?contentId=&likeType=
  async toggleVote(docId) {
    const response = await api.post(`/api/contents/like-toggle`, null, {
      params: {
        contentId: docId,
        likeType: 'DISLIKE'
      }
    })
    return response.data
  },

  // POST /api/contents/like-toggle?contentId=&likeType=
  async recommend(docId) {
    const response = await api.post(`/api/contents/like-toggle`, null, {
      params: {
        contentId: docId,
        likeType: 'LIKE'
      }
    })
    return response.data
  },

  // GET /api/comments/by-content?contentId=
  async getComments(docId) {
    const response = await api.get(`/api/comments/by-content`, {
      params: { contentId: docId }
    })
    return response.data
  },

  // POST /api/comments/write
  async addComment(docId, content) {
    const response = await api.post(`/api/comments/write`, {
      contentId: docId,
      body: content
    })
    return response.data
  },

  // DELETE /api/comments/delete?contentId=&commentId=
  async deleteComment(docId, commentId) {
    const response = await api.delete(`/api/comments/delete`, {
      params: {
        contentId: docId,
        commentId: commentId
      }
    })
    return response.data
  }
} 