// src/services/recommendService.js - 개선된 추천시스템 연동
import axios from 'axios';
import { authService } from './authService';

// 추천시스템 API 서버 URL (독립된 FastAPI 서버)
const RECOMMEND_API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000'  // 로컬 개발 환경
  : 'http://recommend-server-url'; // 프로덕션 환경

/**
 * 추천시스템 전용 axios 인스턴스
 */
const recommendApi = axios.create({
  baseURL: RECOMMEND_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * 추천시스템 API 서비스
 * 메인서버 <-> 추천서버 통신용 (클라이언트와 직접 통신 X)
 */
export const recommendService = {
  /**
   * 사용자 계정 생성 이벤트 전송 (필수)
   * @param {number} userId - 사용자 ID
   * @returns {Promise<void>}
   */
  createUser: async (userId) => {
    try {
      await recommendApi.post(`/user/${userId}`);
      console.log(`✅ 추천시스템에 사용자 생성: ${userId}`);
    } catch (error) {
      console.warn(`⚠️ 추천시스템 사용자 생성 실패: ${error.message}`);
      // 추천시스템 오류는 메인 기능에 영향을 주지 않도록 경고만 로그
    }
  },

  /**
   * 사용자 계정 삭제 이벤트 전송 (옵션)
   * @param {number} userId - 사용자 ID
   * @returns {Promise<void>}
   */
  deleteUser: async (userId) => {
    try {
      await recommendApi.delete(`/user/${userId}`);
      console.log(`✅ 추천시스템에서 사용자 삭제: ${userId}`);
    } catch (error) {
      console.warn(`⚠️ 추천시스템 사용자 삭제 실패: ${error.message}`);
    }
  },

  /**
   * 새로운 태그 생성 이벤트 전송 (필수)
   * @param {number} tagId - 태그 고유 ID
   * @returns {Promise<void>}
   */
  createTag: async (tagId) => {
    try {
      await recommendApi.post(`/tag/${tagId}`);
      console.log(`✅ 추천시스템에 태그 생성: ${tagId}`);
    } catch (error) {
      console.warn(`⚠️ 추천시스템 태그 생성 실패: ${error.message}`);
    }
  },

  /**
   * 글(아이템) 생성 이벤트 전송 (필수)
   * @param {object} itemData - 글 데이터
   * @param {number} itemData.id - 글 ID
   * @param {string} itemData.title - 제목
   * @param {string} itemData.text - 내용 (HTML 태그 제거된 순수 텍스트)
   * @param {Array<number>} itemData.tags - 태그 ID 배열
   * @returns {Promise<void>}
   */
  createItem: async (itemData) => {
    try {
      // HTML 태그 제거하여 순수 텍스트만 추출
      const extractTextFromHtml = (html) => {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
      };

      const payload = {
        id: itemData.id,
        title: itemData.title,
        text: extractTextFromHtml(itemData.text),
        tags: itemData.tags || []
      };

      await recommendApi.post('/item', payload);
      console.log(`✅ 추천시스템에 아이템 생성: ${itemData.id}`, payload);
    } catch (error) {
      console.warn(`⚠️ 추천시스템 아이템 생성 실패: ${error.message}`);
    }
  },

  /**
   * 글 삭제 이벤트 전송 (필수)
   * @param {number} itemId - 글 ID
   * @returns {Promise<void>}
   */
  deleteItem: async (itemId) => {
    try {
      await recommendApi.delete(`/item/${itemId}`);
      console.log(`✅ 추천시스템에서 아이템 삭제: ${itemId}`);
    } catch (error) {
      console.warn(`⚠️ 추천시스템 아이템 삭제 실패: ${error.message}`);
    }
  },

  /**
   * 글 조회 이벤트 전송 (필수)
   * @param {number} userId - 사용자 ID
   * @param {number} itemId - 글 ID
   * @returns {Promise<void>}
   */
  recordView: async (userId, itemId) => {
    try {
      await recommendApi.post(`/user/${userId}/view/${itemId}`);
      console.log(`✅ 추천시스템에 조회 기록: 사용자 ${userId} -> 아이템 ${itemId}`);
    } catch (error) {
      console.warn(`⚠️ 추천시스템 조회 기록 실패: ${error.message}`);
    }
  },

  /**
   * 글 좋아요 이벤트 전송 (필수)
   * @param {number} userId - 사용자 ID
   * @param {number} itemId - 글 ID
   * @returns {Promise<void>}
   */
  recordLike: async (userId, itemId) => {
    try {
      await recommendApi.post(`/user/${userId}/like/${itemId}`);
      console.log(`✅ 추천시스템에 좋아요 기록: 사용자 ${userId} -> 아이템 ${itemId}`);
    } catch (error) {
      console.warn(`⚠️ 추천시스템 좋아요 기록 실패: ${error.message}`);
    }
  },

  /**
   * 글 좋아요 취소 이벤트 전송 (필수)
   * @param {number} userId - 사용자 ID
   * @param {number} itemId - 글 ID
   * @returns {Promise<void>}
   */
  removeLike: async (userId, itemId) => {
    try {
      await recommendApi.delete(`/user/${userId}/like/${itemId}`);
      console.log(`✅ 추천시스템에서 좋아요 취소: 사용자 ${userId} -> 아이템 ${itemId}`);
    } catch (error) {
      console.warn(`⚠️ 추천시스템 좋아요 취소 실패: ${error.message}`);
    }
  },

  /**
   * 아이템 기반 추천 받기
   * @param {number} itemId - 기준 아이템 ID
   * @param {number} topN - 추천 개수 (기본값: 5)
   * @returns {Promise<Array<number>>} 추천된 아이템 ID 배열
   */
  getRecommendedItems: async (itemId, topN = 5) => {
    try {
      const response = await recommendApi.get(`/recommend_item/${itemId}`, {
        params: { top_n: topN }
      });
      
      const recommendedItems = response.data.items || [];
      console.log(`✅ 아이템 ${itemId} 기반 추천 받음:`, recommendedItems);
      
      return recommendedItems;
    } catch (error) {
      console.warn(`⚠️ 아이템 기반 추천 실패: ${error.message}`);
      return [];
    }
  },

  /**
   * 사용자 기반 추천 받기
   * @param {number} userId - 사용자 ID
   * @param {number} topN - 추천 개수 (기본값: 5)
   * @returns {Promise<Array<number>>} 추천된 아이템 ID 배열
   */
  getUserRecommendations: async (userId, topN = 5) => {
    try {
      const response = await recommendApi.get(`/recommend_user/${userId}`, {
        params: { top_n: topN }
      });
      
      const recommendedItems = response.data.items || [];
      console.log(`✅ 사용자 ${userId} 기반 추천 받음:`, recommendedItems);
      
      return recommendedItems;
    } catch (error) {
      console.warn(`⚠️ 사용자 기반 추천 실패: ${error.message}`);
      return [];
    }
  },

  /**
   * 캔버스 생성 시 종합적인 추천시스템 연동
   * @param {object} canvasData - 캔버스 데이터
   * @param {number} canvasData.coverId - 커버 ID
   * @param {string} canvasData.title - 제목
   * @param {string} canvasData.content - 내용
   * @param {Array<string>} canvasData.genres - 장르 배열
   * @param {number} userId - 생성한 사용자 ID
   */
  onCanvasCreated: async (canvasData, userId) => {
    try {
      console.log('🔗 캔버스 생성 - 추천시스템 연동 시작', canvasData);

      // 1. 사용자가 존재하지 않으면 생성
      if (userId) {
        await recommendService.createUser(userId);
      }

      // 2. 장르를 태그로 변환하여 생성
      const tagIds = [];
      if (canvasData.genres && canvasData.genres.length > 0) {
        for (const genre of canvasData.genres) {
          // 장르명을 해시하여 고유 ID 생성 (간단한 방법)
          const tagId = genre.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          
          await recommendService.createTag(Math.abs(tagId));
          tagIds.push(Math.abs(tagId));
        }
      }

      // 3. 아이템(캔버스) 생성
      await recommendService.createItem({
        id: canvasData.coverId,
        title: canvasData.title,
        text: canvasData.content,
        tags: tagIds
      });

      console.log('✅ 캔버스 생성 - 추천시스템 연동 완료');

    } catch (error) {
      console.error('❌ 캔버스 생성 - 추천시스템 연동 실패:', error);
      // 추천시스템 오류가 메인 기능을 방해하지 않도록 에러를 던지지 않음
    }
  },

  /**
   * 추천시스템 서버 상태 확인
   * @returns {Promise<boolean>} 서버 연결 상태
   */
  checkServerStatus: async () => {
    try {
      // 간단한 태그 조회로 서버 상태 확인
      await recommendApi.get('/tag/1');
      return true;
    } catch (error) {
      console.warn('추천시스템 서버 연결 실패:', error.message);
      return false;
    }
  },

  /**
   * 추천시스템 연동 헬퍼 - 현재 사용자 기반으로 자동 처리
   */
  helpers: {
    /**
     * 현재 로그인한 사용자의 추천 받기
     * @param {number} topN - 추천 개수
     * @returns {Promise<Array<number>>} 추천 아이템 ID 배열
     */
    getCurrentUserRecommendations: async (topN = 5) => {
      const user = authService.getCurrentUser();
      if (!user || !user.id) {
        console.warn('추천을 받기 위해서는 로그인이 필요합니다.');
        return [];
      }
      
      return await recommendService.getUserRecommendations(user.id, topN);
    },

    /**
     * 현재 사용자의 조회/좋아요 기록
     * @param {number} itemId - 아이템 ID
     * @param {'view'|'like'|'unlike'} action - 액션 타입
     */
    recordUserAction: async (itemId, action) => {
      const user = authService.getCurrentUser();
      if (!user || !user.id) return;

      switch (action) {
        case 'view':
          await recommendService.recordView(user.id, itemId);
          break;
        case 'like':
          await recommendService.recordLike(user.id, itemId);
          break;
        case 'unlike':
          await recommendService.removeLike(user.id, itemId);
          break;
      }
    }
  }
};