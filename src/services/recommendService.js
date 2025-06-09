import axios from 'axios';
import { authService } from './authService';

// 추천/일러스트 API 서버의 기본 URL입니다.
// .env 파일 등을 통해 관리하는 것이 좋습니다.
const RECOMMEND_API_BASE_URL = 'http://localhost:8000'; // FastAPI 기본 포트

/**
 * 추천 API 서버와 통신하기 위한 별도의 axios 인스턴스입니다.
 */
const recommendApi = axios.create({
  baseURL: RECOMMEND_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 메인 API와 동일하게 요청 시 JWT 토큰을 헤더에 추가합니다.
 * 추천 서버에서도 인증이 필요할 경우를 대비합니다.
 */
recommendApi.interceptors.request.use(
  async (config) => {
    const token = await authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 추천 관련 API 요청을 처리하는 서비스 객체입니다.
 */
export const recommendService = {
  /**
   * 특정 아이템과 유사한 아이템 목록을 추천받습니다.
   * @param {number | string} itemId - 추천의 기준이 되는 아이템(컨텐츠)의 ID
   * @param {number} top_n - 받아올 추천 목록의 개수
   * @returns {Promise<Array<number>>} 추천된 아이템 ID의 배열
   */
  getRecommendedItems: async (itemId, top_n = 5) => {
    try {
      const response = await recommendApi.get(`/recommend_item/${itemId}`, {
        params: { top_n },
      });
      // API 응답 형식에 맞춰 실제 아이템 목록을 반환합니다.
      return response.data.items || [];
    } catch (error) {
      console.error('아이템 기반 추천 실패:', error);
      // 추천 실패 시 빈 배열을 반환하여 페이지 렌더링이 중단되지 않도록 합니다.
      return [];
    }
  },
  
  // TODO: 여기에 유저 기반 추천 등 다른 API 함수들을 추가할 수 있습니다.
};
