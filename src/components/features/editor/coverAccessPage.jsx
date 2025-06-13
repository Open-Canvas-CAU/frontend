import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coverService } from '@/services/coverService';
import { authService } from '@/services/authService';
import api from '@/services/api';
import { 
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    ROUTES,
    UI_CONSTANTS,
    RoomType
} from '@/types';

export default function CoverAccessPage() {
    const { coverId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [coverData, setCoverData] = useState(null);
    const [processingStep, setProcessingStep] = useState('checking');

    const steps = {
        checking: { icon: '🔍', text: '캔버스 정보 확인 중...', color: 'text-red-500' },
        redirecting: { icon: '🔄', text: '페이지로 이동 중...', color: 'text-purple-500' },
        creating: { icon: '✨', text: '새 편집 세션 생성 중...', color: 'text-red-500' },
        error: { icon: '⚠️', text: ERROR_MESSAGES.SERVER_ERROR, color: 'text-red-500' }
    };

    useEffect(() => {
        const checkCoverAccess = async () => {
            if (!coverId) {
                setError(ERROR_MESSAGES.INVALID_INPUT);
                setProcessingStep('error');
                setLoading(false);
                return;
            }

            try {
                setProcessingStep('checking');
                const response = await api.get('/api/covers/check', { params: { coverId } });
                const cover = response.data;

                if (!cover) {
                    setError(ERROR_MESSAGES.NOT_FOUND);
                    setProcessingStep('error');
                    setLoading(false);
                    return;
                }

                setCoverData(cover);

                // 방 상태에 따른 리다이렉션
                if (cover.roomType === RoomType.COMPLETE) {
                    setProcessingStep('redirecting');
                    setTimeout(() => {
                        navigate(ROUTES.CANVAS.COMPLETED(coverId));
                    }, UI_CONSTANTS.LOADING_DELAY);
                } else {
                    setProcessingStep('redirecting');
                    setTimeout(() => {
                        navigate(ROUTES.CANVAS.VIEW(coverId));
                    }, UI_CONSTANTS.LOADING_DELAY);
                }

            } catch (err) {
                console.error('캔버스 접근 확인 실패:', err);
                setError(err.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR);
                setProcessingStep('error');
            } finally {
                setLoading(false);
            }
        };

        checkCoverAccess();
    }, [coverId, navigate]);

    if (loading) {
        const currentStep = steps[processingStep];
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center space-y-4">
                    <div className="text-6xl animate-bounce">{currentStep.icon}</div>
                    <div className={`text-xl ${currentStep.color}`}>{currentStep.text}</div>
                    {coverId && <div className="text-sm text-white/50">Cover ID: {coverId}</div>}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl">⚠️</div>
                    <div className="text-xl text-red-500">{error}</div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
                    >
                        뒤로 가기
                    </button>
                </div>
            </div>
        );
    }

    return null;
}