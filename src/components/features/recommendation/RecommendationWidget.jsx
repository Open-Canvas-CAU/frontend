// src/components/features/recommendation/RecommendationWidget.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendService } from '@/services/recommendService';
import { coverService } from '@/services/coverService';
import CanvasCard from '@/components/features/landing/CanvasCard';

export default function RecommendationWidget({ 
  currentItemId, 
  type = 'item', // 'item' | 'user'
  title = '추천 작품',
  className = '',
  maxItems = 4
}) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [covers, setCovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentItemId) {
      fetchRecommendations();
    }
  }, [currentItemId, type]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      let recommendedIds = [];

      if (type === 'item' && currentItemId) {
        // 아이템 기반 추천
        recommendedIds = await recommendService.getRecommendedItems(currentItemId, maxItems);
      } else if (type === 'user') {
        // 사용자 기반 추천
        recommendedIds = await recommendService.helpers.getCurrentUserRecommendations(maxItems);
      }

      if (recommendedIds.length === 0) {
        console.log('추천 결과가 없습니다. 인기 작품을 보여줍니다.');
        // 추천이 없으면 인기 작품으로 대체
        const fallbackResponse = await coverService.getCoversByLikes();
        const fallbackCovers = fallbackResponse.data?.slice(0, maxItems) || [];
        setCovers(fallbackCovers);
        setRecommendations(fallbackCovers.map(c => c.id));
        return;
      }

      console.log(`✅ 추천 아이템 ID: ${recommendedIds.join(', ')}`);

      // 추천된 ID들로 실제 커버 정보 가져오기
      const allCoversResponse = await coverService.getAllCovers();
      const allCovers = allCoversResponse.data || [];

      const recommendedCovers = recommendedIds
        .map(id => allCovers.find(cover => cover.id === id || cover.contentId === id))
        .filter(Boolean) // null/undefined 제거
        .slice(0, maxItems);

      setCovers(recommendedCovers);
      setRecommendations(recommendedIds);

      // 추천시스템에 조회 기록 (현재 아이템)
      if (type === 'item' && currentItemId) {
        recommendService.helpers.recordUserAction(currentItemId, 'view');
      }

    } catch (err) {
      console.error('추천 가져오기 실패:', err);
      setError('추천을 불러오는데 실패했습니다.');
      
      // 오류 시 기본 인기 작품 표시
      try {
        const fallbackResponse = await coverService.getCoversByLikes();
        const fallbackCovers = fallbackResponse.data?.slice(0, maxItems) || [];
        setCovers(fallbackCovers);
      } catch (fallbackError) {
        console.error('기본 작품도 불러오기 실패:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (cover) => {
    // 추천시스템에 클릭 기록
    if (recommendations.includes(cover.id)) {
      recommendService.helpers.recordUserAction(cover.id, 'view');
    }

    // 페이지 이동
    if (cover.contentId) {
      navigate(`/completed/${cover.id}`);
    } else {
      navigate(`/canvas/${cover.id}`);
    }
  };

  const handleLike = async (cover, event) => {
    event.stopPropagation(); // 카드 클릭 방지
    
    try {
      // 좋아요 토글 API 호출 (기존 로직)
      // ...

      // 추천시스템에 좋아요 기록
      recommendService.helpers.recordUserAction(cover.id, 'like');
      
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(maxItems)].map((_, index) => (
            <div key={index} className="bg-red-200 rounded-lg animate-pulse">
              <div className="aspect-[4/3] bg-red-300 rounded-t-lg"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-red-300 rounded"></div>
                <div className="h-3 bg-red-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || covers.length === 0) {
    return (
      <div className={`${className}`}>
        <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📚</div>
          <p>추천할 작품이 없습니다.</p>
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={() => navigate('/gallery')}
          >
            더 많은 작품 보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {error ? (
            <div className="text-sm text-red-600">추천 정보를 불러오는 중 오류가 발생했습니다</div>
        ) : loading ? (
            <div className="text-sm text-white-600">추천 정보를 불러오는 중...</div>
        ) : covers.length === 0 ? (
            <div className="text-sm text-white-600">추천할 작품이 없습니다</div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {covers.map(cover => (
                    <CoverCard
                        key={cover.id}
                        cover={cover}
                        onClick={() => handleCardClick(cover)}
                    />
                ))}
            </div>
        )}
    </div>
  );
}

// 사용 예시 컴포넌트
export function ItemBasedRecommendations({ itemId, className }) {
  return (
    <RecommendationWidget
      currentItemId={itemId}
      type="item"
      title="이 작품과 비슷한 작품"
      className={className}
      maxItems={4}
    />
  );
}

export function UserBasedRecommendations({ className }) {
  return (
    <RecommendationWidget
      type="user"
      title="당신이 좋아할 만한 작품"
      className={className}
      maxItems={6}
    />
  );
}