import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coverService } from '@/services/coverService';
import { authService } from '@/services/authService';
import CanvasCard from '@/components/features/landing/CanvasCard';
import MouseFollower from '@/components/common/MouseFollower';

const TABS = {
    CREATED: 'created',
    ENGAGED: 'engaged'
};

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [covers, setCovers] = useState([]);
    const [activeTab, setActiveTab] = useState(TABS.CREATED);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                setUser(currentUser);

                // 모든 캔버스를 가져와서 필터링
                const response = await coverService.getAllCovers();
                if (response.data) {
                    let filteredCovers;
                    if (activeTab === TABS.CREATED) {
                        // 작성한 캔버스
                        filteredCovers = response.data.filter(cover => 
                            cover.userEmail === currentUser.email
                        );
                    } else {
                        // 참여한 캔버스 (좋아요 + 댓글 작성)
                        filteredCovers = response.data.filter(cover => 
                            cover.likeDtos?.some(like => like.userId === currentUser.id) ||
                            cover.commentDtos?.some(comment => comment.userId === currentUser.id)
                        );
                    }
                    setCovers(filteredCovers);
                }
            } catch (err) {
                console.error("프로필 데이터 조회 실패:", err);
                setError("프로필 데이터를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [activeTab, navigate]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleCardClick = (cover) => {
        navigate(`/canvas/${cover.id}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-red-300/20 border-t-red-300/80 rounded-full animate-spin"></div>
                <div className="text-xl text-white">프로필을 불러오는 중...</div>
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
                {/* 프로필 상단 섹션 */}
                <div className="bg-gray-900/50 rounded-2xl p-8 mb-8 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center space-x-6">
                        {/* 프로필 이미지 */}
                        <div 
                            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
                            style={{ backgroundColor: user?.color || '#FF5733' }}
                        >
                            {user?.nickname?.[0]?.toUpperCase() || '?'}
                        </div>
                        
                        {/* 사용자 정보 */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {user?.nickname || '사용자'}
                            </h1>
                            <p className="text-white/60 mb-4">
                                {user?.email || '이메일 없음'}
                            </p>
                            <div className="flex space-x-4 text-sm text-white/60">
                                <div>
                                    <span className="font-bold text-white">{covers.length}</span>개의 캔버스
                                </div>
                                <div>
                                    <span className="font-bold text-white">
                                        {covers.filter(c => c.likeDtos?.some(l => l.userId === user?.id)).length}
                                    </span>개의 좋아요
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 탭 메뉴 */}
                <div className="flex space-x-4 mb-8 border-b border-white/10">
                    <button
                        onClick={() => handleTabChange(TABS.CREATED)}
                        className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${
                            activeTab === TABS.CREATED
                                ? 'text-white border-b-2 border-red-500'
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        작성한 캔버스
                    </button>
                    <button
                        onClick={() => handleTabChange(TABS.ENGAGED)}
                        className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${
                            activeTab === TABS.ENGAGED
                                ? 'text-white border-b-2 border-red-500'
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        참여한 캔버스
                    </button>
                </div>

                {/* 캔버스 목록 */}
                {covers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                        <div className="text-4xl">
                            {activeTab === TABS.CREATED ? '🎨' : '🤝'}
                        </div>
                        <p className="text-xl text-white/60">
                            {activeTab === TABS.CREATED
                                ? '아직 작성한 캔버스가 없습니다.'
                                : '아직 참여한 캔버스가 없습니다.'}
                        </p>
                        <button
                            onClick={() => navigate(activeTab === TABS.CREATED ? '/canvas/new' : '/')}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
                        >
                            {activeTab === TABS.CREATED ? '새 캔버스 만들기' : '캔버스 둘러보기'}
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