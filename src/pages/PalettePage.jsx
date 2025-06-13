import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coverService } from '@/services/coverService';
import CanvasCard from '@/components/features/landing/CanvasCard';
import MouseFollower from '@/components/common/MouseFollower';

export default function PalettePage() {
    const [covers, setCovers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkingCovers = async () => {
            try {
                setLoading(true);
                // contentId가 없는 '작업 중'인 캔버스만 가져옵니다.
                const response = await coverService.getWorkingCovers();
                setCovers(response.data || []);
            } catch (err) {
                console.error("작업 중인 캔버스 조회 실패:", err);
                setError("캔버스 목록을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchWorkingCovers();
    }, []);

    const handleCardClick = (cover) => {
        // 모든 카드는 먼저 CanvasViewPage로 이동하여 상태를 확인합니다.
        navigate(`/canvas/${cover.id}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-red-300/20 border-t-red-300/80 rounded-full animate-spin"></div>
                <div className="text-xl text-white">작업 중인 캔버스를 불러오는 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="text-6xl">❌</div>
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="relative">
            <MouseFollower />
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">내 팔레트</h1>
                <p className="text-red-100/80">현재 작업 중이거나 이어 쓸 수 있는 캔버스 목록입니다.</p>
            </div>

            {covers.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-white bg-black/30 rounded-xl p-8">
                    <div className="text-6xl mb-6">🎨</div>
                    <div className="text-xl mb-6">아직 작업 중인 캔버스가 없습니다.</div>
                    <button
                        onClick={() => navigate('/canvas/new')}
                        className="px-8 py-4 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                        첫 캔버스 만들기
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {covers.map((cover, index) => (
                        <div
                            key={cover.id}
                            className="transition-all duration-300 ease-in-out"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <CanvasCard
                                title={cover.title}
                                timeAgo={`최근 수정: ${new Date(cover.time).toLocaleDateString()}`}
                                description={
                                    `상태: ${cover.roomType === 'EDITING' ? '편집 중' : '편집 가능'}`
                                }
                                imgSrc={cover.coverImageUrl || `https://via.placeholder.com/400x300/1a1a1a/ffffff?text=${encodeURIComponent(cover.title)}`}
                                onClick={() => handleCardClick(cover)}
                                cardType="workspace"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}