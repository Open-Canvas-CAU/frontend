// src/pages/OAuthCallbackPage.jsx - 수정된 버전
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/authService';

/**
 * OAuth2 로그인 성공 후 리다이렉트되는 콜백 페이지입니다.
 * URL에서 토큰을 추출, 저장하고 사용자를 원래 있던 페이지로 돌려보냅니다.
 */
export default function OAuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const processLogin = async () => {
            try {
                console.log('🔐 OAuth 콜백 처리 시작...');
                console.log('📍 현재 URL:', window.location.href);
                
                // URL에서 토큰 추출
                const accessToken = searchParams.get('access_token');
                const refreshToken = searchParams.get('refresh_token');

                console.log('🔑 토큰 추출 결과:', {
                    hasAccessToken: !!accessToken,
                    hasRefreshToken: !!refreshToken,
                    accessTokenLength: accessToken?.length || 0,
                    refreshTokenLength: refreshToken?.length || 0
                });

                if (accessToken && refreshToken) {
                    // 토큰 저장
                    authService.saveTokens({ accessToken, refreshToken });
                    console.log('✅ 토큰 저장 완료');
                    
                    // 사용자 정보 가져오기
                    try {
                        await authService.fetchAndSaveUser();
                        console.log('✅ 사용자 정보 저장 완료');
                    } catch (userError) {
                        console.warn('⚠️ 사용자 정보 가져오기 실패 (로그인은 성공):', userError);
                    }

                    // 전역 인증 상태 변경 이벤트 발생
                    window.dispatchEvent(new Event('auth-change'));
                    
                    // 로그인 전 경로로 리다이렉트
                    const redirectPath = localStorage.getItem('login_redirect_path') || '/';
                    localStorage.removeItem('login_redirect_path');
                    
                    console.log('🏠 리다이렉트:', redirectPath);
                    
                    // URL에서 토큰 파라미터 제거하면서 이동
                    navigate(redirectPath, { replace: true });

                } else {
                    console.error('❌ OAuth 콜백에서 토큰을 찾을 수 없습니다.');
                    console.error('Available params:', Array.from(searchParams.entries()));
                    
                    alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
                    navigate('/login', { replace: true });
                }
                
            } catch (error) {
                console.error('❌ OAuth 콜백 처리 중 오류:', error);
                alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
                navigate('/login', { replace: true });
            }
        };

        processLogin();
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
            <div className="text-center space-y-6">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800">로그인 처리 중...</h2>
                    <p className="text-gray-600">잠시만 기다려주세요.</p>
                </div>
                
                {/* 디버깅 정보 (개발 환경에서만) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-white rounded-lg shadow-lg max-w-md">
                        <h3 className="font-bold mb-2">디버깅 정보:</h3>
                        <div className="text-sm text-left space-y-1">
                            <p>URL: {window.location.href}</p>
                            <p>Params: {Array.from(searchParams.entries()).map(([k, v]) => 
                                `${k}=${k.includes('token') ? v.substring(0, 20) + '...' : v}`
                            ).join(', ')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}