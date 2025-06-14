import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coverService } from '@/services/coverService';
import { authService } from '@/services/authService';
import CanvasCard from '@/components/features/landing/CanvasCard';
import MouseFollower from '@/components/common/MouseFollower';

export default function FavoritesPage() {
    const [covers, setCovers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavoriteCovers = async () => {
            try {
                setLoading(true);
                // 모든 캔버스를 가져와서 현재 사용자가 좋아요한 것만 필터링
                const response = await coverService.getAllCovers();
                const currentUser = authService.getCurrentUser();
                
                if (response.data && currentUser?.id) {
                    // 현재 사용자가 좋아요한 캔버스만 필터링
                    const favoriteCovers = response.data.filter(cover => 
                        cover.likeDtos?.some(like => like.userId === currentUser.id)
                    );
                    setCovers(favoriteCovers);
                } else {
                    setCovers([]);
                }
            } catch (err) {
                console.error("즐겨찾기 목록 조회 실패:", err);
                setError("즐겨찾기 목록을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchFavoriteCovers();
    }, []);

    const handleCardClick = (cover) => {
        navigate(`/canvas/${cover.id}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-red-300/20 border-t-red-300/80 rounded-full animate-spin"></div>
                <div className="text-xl text-white">즐겨찾기 목록을 불러오는 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="text-2xl text-red-500">⚠️</div>
                <div className="text-xl text-white">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <MouseFollower />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">즐겨찾기</h1>
                    <p className="text-white/60">내가 좋아요한 모든 캔버스 목록입니다.</p>
                </div>

                {covers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                        <div className="text-4xl">⭐️</div>
                        <p className="text-xl text-white/60">아직 좋아요한 캔버스가 없습니다.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
                        >
                            캔버스 둘러보기
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {covers.map((cover) => (
                            <CanvasCard
                                key={cover.id}
                                id={cover.id}
                                title={cover.title}
                                description={cover.description}
                                imgSrc={cover.thumbnailUrl}
                                createdAt={cover.createdAt}
                                updatedAt={cover.updatedAt}
                                cardType="workspace"
                                roomType={cover.roomType}
                                onClick={() => handleCardClick(cover)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
