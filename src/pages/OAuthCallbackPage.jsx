// src/pages/OAuthCallbackPage.jsx - 가이드에 따른 수정
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/authService';

export default function OAuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing');
    const [debugInfo, setDebugInfo] = useState(null);

    useEffect(() => {
        const processLogin = async () => {
            try {
                console.log(' OAuth 콜백 처리 시작...');
                setStatus('processing');
                
                const currentUrl = window.location.href;
                console.log('📍 현재 URL:', currentUrl);
                
                //  가이드에 따른 정확한 파라미터명 사용
                const accessToken = searchParams.get('access_token');
                const refreshToken = searchParams.get('refresh_token');

                const debugData = {
                    url: currentUrl,
                    allParams: Array.from(searchParams.entries()),
                    accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
                    refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
                    hasAccessToken: !!accessToken,
                    hasRefreshToken: !!refreshToken
                };
                
                setDebugInfo(debugData);
                console.log('토큰 추출 결과:', debugData);

                if (accessToken && refreshToken) {
                    console.log(' 토큰 발견, 저장 중...');
                    setStatus('saving');
                    
                    //  가이드에 따른 토큰 저장 (정확한 코드)
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", refreshToken);
                    
                    console.log('💾 토큰 저장 완료');
                    
                    // authService에도 알림
                    authService.saveTokens({ accessToken, refreshToken });
                    
                    // 사용자 정보 가져오기 시도
                    setStatus('fetching_user');
                    try {
                        await authService.fetchAndSaveUser();
                        console.log(' 사용자 정보 저장 완료');
                    } catch (userError) {
                        console.warn(' 사용자 정보 가져오기 실패 (로그인은 성공):', userError);
                    }

                    // 전역 인증 상태 변경 이벤트 발생
                    window.dispatchEvent(new Event('auth-change'));
                    
                    setStatus('redirecting');
                    
                    // 로그인 전 경로로 리다이렉트
                    const redirectPath = localStorage.getItem('login_redirect_path') || '/';
                    localStorage.removeItem('login_redirect_path');
                    
                    console.log(' 리다이렉트 경로:', redirectPath);
                    
                    // 성공 애니메이션 후 리다이렉트
                    setTimeout(() => {
                        navigate(redirectPath, { replace: true });
                    }, 2000);
                } else {
                    console.error(' 토큰을 찾을 수 없습니다');
                    console.error('사용 가능한 파라미터:', Array.from(searchParams.entries()));
                    
                    setStatus('error');
                    setDebugInfo(prev => ({ 
                        ...prev, 
                        error: '토큰을 찾을 수 없습니다',
                        params: Array.from(searchParams.entries())
                    }));
                    
                    // 에러 메시지만 표시하고 홈으로 이동
                    setTimeout(() => {
                        alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
                        navigate('/', { replace: true });
                    }, 3000);
                }
            } catch (error) {
                console.error(' OAuth 콜백 처리 중 오류:', error);
                setStatus('error');
                setDebugInfo(prev => ({ ...prev, error: error.message }));
                
                // 에러 메시지만 표시하고 홈으로 이동
                setTimeout(() => {
                    alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
                    navigate('/', { replace: true });
                }, 3000);
            }
        };

        processLogin();
    }, [navigate, searchParams]);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'redirecting':
                return {
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>,
                    title: '로그인 성공!',
                    subtitle: '페이지로 이동하고 있습니다'
                };
            case 'error':
                return {
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>,
                    title: '로그인 실패',
                    subtitle: '오류가 발생했습니다'
                };
            default:
                return {
                    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>,
                    title: '처리 중...',
                    subtitle: '잠시만 기다려주세요'
                };
        }
    };

    const statusInfo = getStatusInfo(status);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-md p-8 space-y-8 bg-black border border-white/10 rounded-2xl shadow-2xl">
                {/* 상태 아이콘 */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    {statusInfo.icon}
                    <h2 className="text-2xl font-bold text-white">{statusInfo.title}</h2>
                    <p className="text-white/60">{statusInfo.subtitle}</p>
                </div>
            </div>
        </div>
    );
}