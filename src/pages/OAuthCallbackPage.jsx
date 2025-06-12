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
                console.log('🔐 OAuth 콜백 처리 시작...');
                setStatus('processing');
                
                const currentUrl = window.location.href;
                console.log('📍 현재 URL:', currentUrl);
                
                // 🔧 가이드에 따른 정확한 파라미터명 사용
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
                console.log('🔑 토큰 추출 결과:', debugData);

                if (accessToken && refreshToken) {
                    console.log('✅ 토큰 발견, 저장 중...');
                    setStatus('saving');
                    
                    // 🔧 가이드에 따른 토큰 저장 (정확한 코드)
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", refreshToken);
                    
                    console.log('💾 토큰 저장 완료');
                    
                    // authService에도 알림
                    authService.saveTokens({ accessToken, refreshToken });
                    
                    // 사용자 정보 가져오기 시도
                    setStatus('fetching_user');
                    try {
                        await authService.fetchAndSaveUser();
                        console.log('👤 사용자 정보 저장 완료');
                    } catch (userError) {
                        console.warn('⚠️ 사용자 정보 가져오기 실패 (로그인은 성공):', userError);
                    }

                    // 전역 인증 상태 변경 이벤트 발생
                    window.dispatchEvent(new Event('auth-change'));
                    
                    setStatus('redirecting');
                    
                    // 로그인 전 경로로 리다이렉트
                    const redirectPath = localStorage.getItem('login_redirect_path') || '/';
                    localStorage.removeItem('login_redirect_path');
                    
                    console.log('🏠 리다이렉트 경로:', redirectPath);
                    
                    // 성공 애니메이션 후 리다이렉트
                    setTimeout(() => {
                        navigate(redirectPath, { replace: true });
                    }, 2000);

                } else {
                    console.error('❌ 토큰을 찾을 수 없습니다');
                    console.error('사용 가능한 파라미터:', Array.from(searchParams.entries()));
                    
                    setStatus('error');
                    
                    // 3초 후 로그인 페이지로 리다이렉트
                    setTimeout(() => {
                        alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
                        navigate('/login', { replace: true });
                    }, 3000);
                }
                
            } catch (error) {
                console.error('❌ OAuth 콜백 처리 중 오류:', error);
                setStatus('error');
                setDebugInfo(prev => ({ ...prev, error: error.message }));
                
                setTimeout(() => {
                    alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
                    navigate('/login', { replace: true });
                }, 3000);
            }
        };

        processLogin();
    }, [navigate, searchParams]);

    const getStatusDisplay = () => {
        switch (status) {
            case 'processing':
                return {
                    icon: '🔍',
                    title: '로그인 정보 확인 중...',
                    subtitle: '토큰을 추출하고 있습니다'
                };
            case 'saving':
                return {
                    icon: '💾',
                    title: '로그인 정보 저장 중...',
                    subtitle: '토큰을 안전하게 저장하고 있습니다'
                };
            case 'fetching_user':
                return {
                    icon: '👤',
                    title: '사용자 정보 가져오는 중...',
                    subtitle: '프로필 정보를 불러오고 있습니다'
                };
            case 'redirecting':
                return {
                    icon: '🎉',
                    title: '로그인 성공!',
                    subtitle: '페이지로 이동하고 있습니다'
                };
            case 'error':
                return {
                    icon: '❌',
                    title: '로그인 실패',
                    subtitle: '오류가 발생했습니다'
                };
            default:
                return {
                    icon: '🔄',
                    title: '처리 중...',
                    subtitle: '잠시만 기다려주세요'
                };
        }
    };

    const statusDisplay = getStatusDisplay();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="text-center space-y-8 max-w-md mx-4">
                {/* 상태 아이콘 */}
                <div className={`
                    relative text-8xl transition-all duration-1000
                    ${status === 'redirecting' ? 'animate-bounce' : status === 'error' ? 'animate-pulse' : 'animate-spin'}
                `}>
                    {statusDisplay.icon}
                    
                    {status === 'processing' && (
                        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    )}
                </div>

                {/* 상태 텍스트 */}
                <div className="space-y-3">
                    <h2 className={`
                        text-2xl font-bold transition-colors duration-500
                        ${status === 'redirecting' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-gray-800'}
                    `}>
                        {statusDisplay.title}
                    </h2>
                    <p className="text-gray-600">{statusDisplay.subtitle}</p>
                    
                    {status === 'redirecting' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-green-700 font-medium">✨ 환영합니다!</p>
                            <p className="text-green-600 text-sm">Live Canvas에서 멋진 이야기를 만들어보세요</p>
                        </div>
                    )}
                </div>
                
                {/* 디버깅 정보 */}
                {debugInfo && (
                    <details className="mt-8 p-4 bg-white rounded-xl shadow-lg text-left max-w-lg">
                        <summary className="cursor-pointer font-bold mb-2">🔧 개발자 정보</summary>
                        <div className="text-xs space-y-2">
                            <div><strong>URL:</strong> {debugInfo.url}</div>
                            <div><strong>모든 파라미터:</strong></div>
                            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                                {debugInfo.allParams.map(([key, value]) => 
                                    `${key}: ${key.includes('token') ? value.substring(0, 30) + '...' : value}`
                                ).join('\n') || '파라미터 없음'}
                            </pre>
                            <div><strong>토큰 상태:</strong></div>
                            <ul className="ml-4 space-y-1">
                                <li className={debugInfo.hasAccessToken ? 'text-green-600' : 'text-red-600'}>
                                    {debugInfo.hasAccessToken ? '✅' : '❌'} Access Token
                                </li>
                                <li className={debugInfo.hasRefreshToken ? 'text-green-600' : 'text-red-600'}>
                                    {debugInfo.hasRefreshToken ? '✅' : '❌'} Refresh Token
                                </li>
                            </ul>
                            {debugInfo.error && (
                                <div className="text-red-600">
                                    <strong>오류:</strong> {debugInfo.error}
                                </div>
                            )}
                        </div>
                    </details>
                )}

                {status === 'error' && (
                    <div className="mt-6 space-y-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                        >
                            다시 로그인 시도
                        </button>
                        <p className="text-sm text-gray-500">3초 후 자동으로 로그인 페이지로 이동합니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}