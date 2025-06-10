import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coverService } from '@/services/coverService';
import { authService } from '@/services/authService';
import api from '@/services/api';

export default function CoverAccessPage() {
    const { coverId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [coverData, setCoverData] = useState(null);
    const [processingStep, setProcessingStep] = useState('checking');

    const steps = {
        checking: { icon: '🔍', text: '캔버스 정보 확인 중...', color: 'text-blue-500' },
        redirecting: { icon: '🚀', text: '페이지로 이동 중...', color: 'text-purple-500' },
        creating: { icon: '⚡', text: '새 세션 생성 중...', color: 'text-green-500' },
        error: { icon: '⚠️', text: '오류 발생', color: 'text-red-500' }
    };

    useEffect(() => {
        const handleCoverAccess = async () => {
            if (!coverId) {
                setError('Cover ID가 제공되지 않았습니다.');
                setProcessingStep('error');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setProcessingStep('checking');
                
                console.log('Checking cover status for ID:', coverId);
                const response = await coverService.checkCoverStatus(coverId);
                const cover = response.data;
                
                if (!cover) {
                    setError('해당 캔버스를 찾을 수 없습니다.');
                    setProcessingStep('error');
                    return;
                }

                setCoverData(cover);
                console.log('Cover data:', cover);

                // 잠시 대기 (사용자 경험 개선)
                await new Promise(resolve => setTimeout(resolve, 1000));

                switch (cover.roomType) {
                    case 'COMPLETE':
                        setProcessingStep('redirecting');
                        if (cover.contentId) {
                            console.log('Redirecting to completed canvas:', cover.contentId);
                            await new Promise(resolve => setTimeout(resolve, 500));
                            navigate(`/completed/${cover.contentId}`, { replace: true });
                        } else {
                            setError('완성된 작품이지만 콘텐츠 정보를 찾을 수 없습니다.');
                            setProcessingStep('error');
                        }
                        break;

                    case 'EDITING':
                        setProcessingStep('redirecting');
                        if (cover.roomId) {
                            console.log('Redirecting to collaborative editor:', cover.roomId);
                            await new Promise(resolve => setTimeout(resolve, 500));
                            navigate(`/editor/${cover.roomId}`, { replace: true });
                        } else {
                            setError('편집 중인 방 정보를 찾을 수 없습니다.');
                            setProcessingStep('error');
                        }
                        break;

                    case 'AVAILABLE':
                        if (!authService.isAuthenticated()) {
                            navigate('/login', { 
                                state: { from: { pathname: `/cover/${coverId}` } },
                                replace: true 
                            });
                        } else {
                            setProcessingStep('creating');
                            await createNewRoomForCover(cover);
                        }
                        break;

                    default:
                        setError(`알 수 없는 캔버스 상태입니다: ${cover.roomType}`);
                        setProcessingStep('error');
                }

            } catch (error) {
                console.error('Cover 접근 처리 중 오류:', error);
                setError(`캔버스에 접근할 수 없습니다: ${error.message}`);
                setProcessingStep('error');
            } finally {
                setLoading(false);
            }
        };

        handleCoverAccess();
    }, [coverId, navigate]);

    const createNewRoomForCover = async (cover) => {
        try {
            console.log('Creating new room for available cover:', cover.id);
            
            const writingDto = {
                title: cover.title,
                body: '<p>새로운 협업이 시작되었습니다. 함께 멋진 이야기를 만들어보세요!</p>',
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            };

            const roomResponse = await api.post('/api/rooms/create', writingDto);
            const roomData = roomResponse.data;

            if (roomData.roomId) {
                console.log('New room created, redirecting to editor:', roomData.roomId);
                setProcessingStep('redirecting');
                await new Promise(resolve => setTimeout(resolve, 500));
                navigate(`/editor/${roomData.roomId}/edit`, { replace: true });
            } else {
                throw new Error('새 방 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('새 문서방 생성 실패:', error);
            setError(`새 편집 세션을 시작할 수 없습니다: ${error.message}`);
            setProcessingStep('error');
        }
    };

    const currentStep = steps[processingStep];

    if (loading || processingStep !== 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                {/* 배경 장식 */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-pulse animation-delay-700"></div>
                </div>

                <div className="relative z-10 text-center space-y-8 max-w-md">
                    {/* 메인 로딩 애니메이션 */}
                    <div className="relative">
                        <div className="w-32 h-32 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-4 border-4 border-white/40 border-t-transparent rounded-full animate-spin animation-reverse animation-delay-150"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl">{currentStep.icon}</span>
                            </div>
                        </div>
                    </div>

                    {/* 상태 텍스트 */}
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-white">
                            {currentStep.text}
                        </h2>
                        
                        {coverData && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold text-white">
                                        "{coverData.title}"
                                    </h3>
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="text-lg">
                                            {coverData.roomType === 'EDITING' ? '⚡' : 
                                             coverData.roomType === 'AVAILABLE' ? '🎨' : '✨'}
                                        </span>
                                        <span className="text-white/90">
                                            {coverService.getCoverStatusInfo(coverData.roomType).text}
                                        </span>
                                    </div>
                                    {coverData.limit && (
                                        <p className="text-white/70 text-sm">
                                            최대 {coverData.limit}명의 작가가 참여할 수 있습니다
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 진행 단계 표시 */}
                        <div className="flex justify-center space-x-2">
                            <div className={`w-3 h-3 rounded-full transition-colors ${
                                ['checking', 'creating', 'redirecting'].includes(processingStep) ? 'bg-white' : 'bg-white/30'
                            }`}></div>
                            <div className={`w-3 h-3 rounded-full transition-colors ${
                                ['creating', 'redirecting'].includes(processingStep) ? 'bg-white' : 'bg-white/30'
                            }`}></div>
                            <div className={`w-3 h-3 rounded-full transition-colors ${
                                processingStep === 'redirecting' ? 'bg-white' : 'bg-white/30'
                            }`}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 에러 상태
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-400 to-purple-500 flex items-center justify-center">
            <div className="text-center space-y-8 max-w-md mx-4">
                <div className="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <span className="text-6xl">⚠️</span>
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-white">접근할 수 없습니다</h2>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <p className="text-white/90 leading-relaxed">{error}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
                    >
                        ← 뒤로 가기
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-white text-gray-800 rounded-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                        🏠 홈으로 가기
                    </button>
                </div>
            </div>
        </div>
    );
}