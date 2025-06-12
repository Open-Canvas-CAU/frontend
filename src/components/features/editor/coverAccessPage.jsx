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
        checking: { icon: '🔍', text: '캔버스 정보 확인 중...', color: 'text-red-500' },
        redirecting: { icon: '🚀', text: '페이지로 이동 중...', color: 'text-purple-500' },
        creating: { icon: '⚡', text: '새 편집 세션 생성 중...', color: 'text-green-500' },
        error: { icon: '⚠️', text: '오류 발생', color: 'text-red-500' }
    };

    useEffect(() => {
        const handleCoverAccess = async () => {
            if (!coverId) {
                setError('잘못된 접근입니다. Cover ID가 없습니다.');
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
                console.log('Cover data received:', cover);

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
                             // 편집자인지, 구독자인지 여부는 서버에서 처리하므로, 여기서는 그냥 editor로 보냅니다.
                            await new Promise(resolve => setTimeout(resolve, 500));
                            navigate(`/editor/${cover.roomId}`, { replace: true });
                        } else {
                            setError('편집 중인 방 정보를 찾을 수 없습니다.');
                            setProcessingStep('error');
                        }
                        break;

                    case 'AVAILABLE':
                        if (!authService.isAuthenticated()) {
                            alert("작업에 참여하려면 로그인이 필요합니다.");
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

            } catch (err) {
                console.error('Cover 접근 처리 중 오류:', err);
                setError(`캔버스에 접근할 수 없습니다: ${err.response?.data?.message || err.message}`);
                setProcessingStep('error');
            } finally {
                // 에러가 아닌 경우 로딩 상태가 계속 유지되도록 하여 리다이렉트 시간을 확보합니다.
                if (processingStep === 'error') {
                   setLoading(false);
                }
            }
        };

        handleCoverAccess();
    }, [coverId, navigate]);

    const createNewRoomForCover = async (cover) => {
        try {
            console.log('Creating new room for available cover:', cover.id);
            
            const writingDto = {
                title: cover.title,
                // 최초 이어쓰기 시 부모의 depth, siblingIndex가 필요합니다.
                // 여기서는 루트 글에 이어쓴다고 가정합니다. API 명세 확인 필요.
                parentDepth: 0,
                parentSiblingIndex: 0,
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
    
    // UI 부분은 기존과 유사하게 유지됩니다 (로딩/에러 화면 표시)
    return (
        <div className="min-h-screen flex items-center justify-center bg-black-100">
            {loading && <div>{steps[processingStep].icon} {steps[processingStep].text}</div>}
            {error && <div className="text-red-500">{steps.error.icon} {error}</div>}
        </div>
    );
}