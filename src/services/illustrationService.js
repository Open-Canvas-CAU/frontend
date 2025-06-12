// src/services/illustrationService.js
import api from './api'

/**
 * 일러스트 생성 및 커버 이미지 관련 서비스
 */
export const illustrationService = {
  /**
   * AI로 커버 일러스트 생성 및 저장
   * @param {object} imageData - 이미지 생성 요청 데이터
   * @param {string} imageData.postId - 포스트 ID
   * @param {string} imageData.title - 제목
   * @param {Array<string>} imageData.genres - 장르 배열
   * @param {string} imageData.content - 내용
   * @returns {Promise<string>} 생성된 이미지 URL
   */
  generateAndSaveCoverImage: async (imageData) => {
    try {
      console.log('🎨 일러스트 생성 요청:', imageData)
      
      const response = await api.post('/api/image/generate-and-save', {
        postId: imageData.postId?.toString(),
        title: imageData.title,
        genres: imageData.genres || [],
        content: imageData.content
      })
      
      console.log('✅ 일러스트 생성 완료:', response.data)
      
      // 생성된 이미지 URL 반환 (static folder에 저장된 경로)
      const imageUrl = response.data || `${api.defaults.baseURL}/static/${imageData.postId}_cover.png`
      return imageUrl
      
    } catch (error) {
      console.error('❌ 일러스트 생성 실패:', error)
      throw new Error(`일러스트 생성에 실패했습니다: ${error.response?.data?.message || error.message}`)
    }
  },

  /**
   * 기존 커버의 일러스트 재생성
   * @param {object} coverData - 커버 데이터
   * @param {string} summary - 추가 요약 정보
   * @returns {Promise<string>} 새로 생성된 이미지 URL
   */
  regenerateCoverImage: async (coverData, summary = '') => {
    try {
      const imageData = {
        postId: coverData.id,
        title: coverData.title,
        genres: coverData.genres || [],
        content: summary || coverData.title
      }
      
      return await illustrationService.generateAndSaveCoverImage(imageData)
      
    } catch (error) {
      console.error('❌ 커버 일러스트 재생성 실패:', error)
      throw error
    }
  },

  /**
   * 완성된 작품의 커버 이미지 생성
   * @param {object} contentData - 완성된 작품 데이터
   * @param {Array} writingData - 글 조각들
   * @returns {Promise<string>} 생성된 이미지 URL
   */
  generateCompletedWorkImage: async (contentData, writingData = []) => {
    try {
      // 글 내용에서 HTML 태그 제거하여 순수 텍스트 추출
      const extractTextFromHtml = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        return doc.body.textContent || ''
      }
      
      // 모든 글 조각의 내용을 합쳐서 요약본 생성
      const allText = writingData
        .map(writing => extractTextFromHtml(writing.body || ''))
        .join(' ')
        .substring(0, 500) // 500자로 제한
      
      const imageData = {
        postId: contentData.coverDto?.id || contentData.id,
        title: contentData.title,
        genres: contentData.genres || [],
        content: allText || contentData.title
      }
      
      return await illustrationService.generateAndSaveCoverImage(imageData)
      
    } catch (error) {
      console.error('❌ 완성작 커버 이미지 생성 실패:', error)
      throw error
    }
  },

  /**
   * 기본 이미지 URL 생성 (일러스트 생성 실패 시 폴백)
   * @param {string|number} postId - 포스트 ID
   * @param {string} title - 제목
   * @returns {string} 기본 이미지 URL
   */
  getDefaultImageUrl: (postId, title = '캔버스') => {
    // 일러스트 생성 실패 시 사용할 기본 이미지
    return `https://via.placeholder.com/400x300/1a1a1a/ffffff?text=${encodeURIComponent(title)}`
  },

  /**
   * 이미지 생성 상태 확인
   * @param {string|number} postId - 포스트 ID
   * @returns {Promise<boolean>} 이미지 존재 여부
   */
  checkImageExists: async (postId) => {
    try {
      const imageUrl = `${api.defaults.baseURL}/static/${postId}_cover.png`
      const response = await fetch(imageUrl, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      console.warn('이미지 존재 확인 실패:', error)
      return false
    }
  },

  /**
   * 모든 커버에 대해 일러스트 생성
   * @returns {Promise<string>} 생성 결과 메시지
   */
  generateAllCoverImages: async () => {
    try {
      console.log('🎨 모든 커버 일러스트 생성 시작')
      
      const response = await api.post('/api/image/generate-all')
      
      console.log('✅ 모든 커버 일러스트 생성 완료:', response.data)
      return response.data
      
    } catch (error) {
      console.error('❌ 일러스트 일괄 생성 실패:', error)
      throw new Error(`일러스트 일괄 생성에 실패했습니다: ${error.response?.data?.message || error.message}`)
    }
  }
}