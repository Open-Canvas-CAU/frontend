import api from './api'
import { mockCompletedContent } from '@/mocks/completedCanvasData'

// 개발 환경에서 Mock 데이터 사용 여부
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.DEV

/**
 * 캔버스(컨텐츠)와 관련된 API 요청을 처리하는 서비스 객체입니다.
 */
export const canvasService = {
  /**
   * 특정 컨텐츠의 상세 정보를 조회합니다.
   * @param {string | number} contentId - 조회할 컨텐츠의 ID
   * @returns {Promise<object>} ContentDto 객체를 포함하는 Promise
   */
  getCanvasDetail: async (contentId) => {
    try {
      if (USE_MOCK_DATA) {
        console.log('🎭 Using mock data for getCanvasDetail:', contentId)
        const content = mockCompletedContent[contentId]
        if (content) {
          // 실제 API 응답과 동일한 형태로 반환
          return content
        } else {
          throw new Error(`완성된 작품을 찾을 수 없습니다. (ID: ${contentId})`)
        }
      }
      
      const response = await api.get(`/api/contents/${contentId}`)
      return response.data
    } catch (error) {
      console.error('캔버스 상세 정보 조회 실패:', error)
      throw error
    }
  },

  /**
   * 컨텐츠에 대한 '좋아요' 또는 '싫어요' 상태를 토글합니다.
   * @param {string | number} contentId - 대상 컨텐츠의 ID
   * @param {'LIKE' | 'DISLIKE'} likeType - 설정할 상태
   * @returns {Promise<object>} 업데이트된 ContentDto 객체
   */
  toggleLike: async (contentId, likeType) => {
    try {
      if (USE_MOCK_DATA) {
        console.log('🎭 Using mock data for toggleLike:', contentId, likeType)
        const content = mockCompletedContent[contentId]
        if (content) {
          // Mock 데이터에서 좋아요 상태 토글 시뮬레이션
          const currentLikeType = content.likeType
          if (currentLikeType === likeType) {
            // 같은 타입을 다시 누르면 취소
            content.likeType = null
            content.likeNum = Math.max(0, content.likeNum - 1)
          } else {
            // 다른 타입을 누르거나 처음 누르는 경우
            if (currentLikeType === null) {
              content.likeNum += 1
            }
            content.likeType = likeType
          }
          return content
        } else {
          throw new Error(`컨텐츠를 찾을 수 없습니다. (ID: ${contentId})`)
        }
      }
      
      const response = await api.post(`/api/contents/like-toggle`, null, {
        params: { contentId, likeType },
      })
      return response.data
    } catch (error) {
      console.error('좋아요 토글 실패:', error)
      throw error
    }
  },

  /**
   * 특정 컨텐츠에 달린 댓글 목록을 조회합니다.
   * @param {string | number} contentId - 댓글을 조회할 컨텐츠의 ID
   * @returns {Promise<Array<object>>} ResCommentDto 배열
   */
  getComments: async (contentId) => {
    try {
      if (USE_MOCK_DATA) {
        console.log('🎭 Using mock data for getComments:', contentId)
        const content = mockCompletedContent[contentId]
        if (content && content.commentDtos) {
          return content.commentDtos
        } else {
          return [] // 댓글이 없으면 빈 배열 반환
        }
      }
      
      const response = await api.get('/api/comments/by-content', {
        params: { contentId },
      })
      return response.data
    } catch (error) {
      console.error('댓글 목록 조회 실패:', error)
      throw error
    }
  },

  /**
   * 새로운 댓글을 작성합니다.
   * @param {object} commentData - 댓글 데이터 (contentId, body 포함)
   * @returns {Promise<object>} 생성된 ResCommentDto 객체
   */
  addComment: async (commentData) => {
    try {
      if (USE_MOCK_DATA) {
        console.log('🎭 Using mock data for addComment:', commentData)
        const content = mockCompletedContent[commentData.contentId]
        if (content) {
          // 새 댓글 객체 생성
          const newComment = {
            id: Date.now(), // 임시 ID
            contentId: parseInt(commentData.contentId),
            userId: 999, // 임시 사용자 ID
            body: commentData.body,
            time: new Date().toISOString(),
            likeNum: 0,
            disLikeNum: 0,
            likeType: null,
            commentLikeDtos: []
          }
          
          // Mock 데이터에 댓글 추가
          if (!content.commentDtos) {
            content.commentDtos = []
          }
          content.commentDtos.push(newComment)
          
          return newComment
        } else {
          throw new Error(`컨텐츠를 찾을 수 없습니다. (ID: ${commentData.contentId})`)
        }
      }
      
      // API 명세에 따라 time 필드를 추가합니다.
      const payload = {
        ...commentData,
        time: new Date().toISOString(),
      }
      const response = await api.post('/api/comments/write', payload)
      return response.data
    } catch (error) {
      console.error('댓글 작성 실패:', error)
      throw error
    }
  },
  
  /**
   * 댓글을 삭제합니다.
   * @param {string | number} commentId - 삭제할 댓글의 ID
   * @param {string | number} contentId - 댓글이 속한 컨텐츠의 ID
   * @returns {Promise<object>} API 응답 데이터
   */
  deleteComment: async (commentId, contentId) => {
      try {
        if (USE_MOCK_DATA) {
          console.log('🎭 Using mock data for deleteComment:', commentId, contentId)
          const content = mockCompletedContent[contentId]
          if (content && content.commentDtos) {
            // 댓글 삭제
            const commentIndex = content.commentDtos.findIndex(comment => comment.id === parseInt(commentId))
            if (commentIndex !== -1) {
              content.commentDtos.splice(commentIndex, 1)
              return { success: true }
            } else {
              throw new Error(`댓글을 찾을 수 없습니다. (ID: ${commentId})`)
            }
          } else {
            throw new Error(`컨텐츠를 찾을 수 없습니다. (ID: ${contentId})`)
          }
        }
        
        const response = await api.delete('/api/comments/delete', {
            params: { commentId, contentId }
        })
        return response.data
      } catch (error) {
          console.error('댓글 삭제 실패:', error)
          throw error
      }
  },

/**
 * 특정 글 내용을 신고합니다.
 * @param {object} reportData - 신고 데이터를 담은 ReportDto 객체
 * @returns {Promise<object>} API 응답 데이터
 */
  reportContent: async (reportData) => {
    try {
      if (USE_MOCK_DATA) {
        console.log('🎭 Using mock data for reportContent:', reportData)
        // Mock에서는 단순히 성공 응답 반환
        await new Promise(resolve => setTimeout(resolve, 500)) // 로딩 시뮬레이션
        return { success: true, message: '신고가 접수되었습니다.' }
      }
      
      // API 명세에 따라 ReportDto 형식으로 payload를 구성합니다.
      const payload = {
        title: reportData.title,
        depth: reportData.depth,
        siblingIndex: reportData.siblingIndex,
        body: reportData.body, // 신고 사유 + 신고된 텍스트
        time: new Date().toISOString(),
      }
      const response = await api.post('/api/reports', payload)
      return response.data
    } catch (error) {
      console.error('글 신고 실패:', error)
      throw error
    }
  },

  /**
   * 공식(Official)으로 채택된 글의 내용을 가져옵니다.
   * @param {object} contentDto - 현재 컨텐츠 DTO
   * @returns {Promise<Array<object>>} 공식 버전의 WritingDto 배열
   */
  getOfficialWritings: async (contentDto) => {
    try {
      if (USE_MOCK_DATA) {
        console.log('🎭 Using mock data for getOfficialWritings:', contentDto)
        const content = mockCompletedContent[contentDto.id]
        if (content && content.writingDtos) {
          return content.writingDtos
        } else {
          return []
        }
      }
      
      // GET 요청이지만 body에 데이터를 보내야 하므로 params로 전달합니다.
      const response = await api.get('/api/writings/get/offical', {
        params: { arg0: contentDto }
      })
      return response.data
    } catch (error) {
      console.error('공식 글 조회 실패:', error)
      throw error
    }
  },

  /**
   * 특정 버전을 공식(Official) 버전으로 설정합니다.
   * @param {object} writingDto - 공식으로 지정할 버전의 WritingDto (depth, siblingIndex, title 필요)
   * @returns {Promise<Array<object>>} 새로 설정된 공식 버전의 WritingDto 배열
   */
  setOfficialWriting: async (writingDto) => {
    try {
      if (USE_MOCK_DATA) {
        console.log('🎭 Using mock data for setOfficialWriting:', writingDto)
        // Mock에서는 단순히 현재 글 목록 반환
        const content = mockCompletedContent[writingDto.contentId]
        if (content && content.writingDtos) {
          return content.writingDtos
        } else {
          return []
        }
      }
      
      const response = await api.post('/api/writings/set/official', writingDto)
      return response.data
    } catch (error) {
      console.error('공식 글 지정 실패:', error)
      throw error
    }
  }
}