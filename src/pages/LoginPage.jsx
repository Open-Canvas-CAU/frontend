// src/pages/LoginPage.jsx - 수정된 버전
import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 로그인 페이지 컴포넌트입니다.
 * 현재 접속 환경에 따라 동적으로 리다이렉션 URI를 생성하여 구글 로그인을 처리합니다.
 */
export default function LoginPage() {
    const location = useLocation();

    // 현재 도메인에 맞는 리다이렉트 URI 생성
    const redirectUri = `${window.location.origin}/oauth2/callback`;
    
    // 로그인 후 돌아갈 경로 저장
    const from = location.state?.from?.pathname || '/';
    
    const handleGoogleLogin = () => {
        // 로그인 후 돌아갈 경로를 로컬 스토리지에 저장
        localStorage.setItem('login_redirect_path', from);
        
        // Google OAuth2 로그인 URL 생성 (문서 명세에 따라)
        const googleLoginUrl = new URL('http://localhost:8080/oauth2/authorization/google');
        googleLoginUrl.searchParams.append('redirect_uri', redirectUri);
        googleLoginUrl.searchParams.append('mode', 'login');
        
        console.log('🔑 Google 로그인 시작:', googleLoginUrl.toString());
        console.log('📍 로그인 후 리다이렉트 경로:', from);
        
        // 페이지 전체를 리다이렉트
        window.location.href = googleLoginUrl.toString();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-solarized-base2 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-solarized-base3 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-solarized-base00">
                        로그인
                    </h2>
                    <p className="mt-2 text-center text-sm text-solarized-base01">
                        소셜 계정으로 간편하게 로그인하세요.
                    </p>
                </div>
                
                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <img 
                            className="w-6 h-6 mr-2" 
                            src="https://www.svgrepo.com/show/475656/google-color.svg" 
                            alt="Google logo" 
                        />
                        Google 계정으로 로그인
                    </button>
                    
                    {/* 디버깅 정보 (개발 환경에서만) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs">
                            <p><strong>개발자 정보:</strong></p>
                            <p>리다이렉트 URI: {redirectUri}</p>
                            <p>돌아갈 경로: {from}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}