// src/pages/LoginPage.jsx - 가이드에 따른 수정
import React from 'react';
import { useLocation } from 'react-router-dom';

export default function LoginPage() {
    const location = useLocation();

    // 🔧 가이드에 따라 정확한 리다이렉트 URI 설정
    // 개발 환경에서는 포트를 동적으로 감지
    const getCurrentPort = () => {
        const port = window.location.port;
        // Vite는 기본적으로 5173, CRA는 3000
        return port || (window.location.protocol === 'https:' ? '443' : '3000');
    };
    
    const currentPort = getCurrentPort();
    const redirectUri = `http://localhost:${currentPort}/oauth2/callback`;
    
    console.log('🔑 로그인 설정:', {
        currentOrigin: window.location.origin,
        currentPort,
        redirectUri
    });
    
    // 로그인 후 돌아갈 경로 저장
    const from = location.state?.from?.pathname || '/';
    
    const handleGoogleLogin = () => {
        // 로그인 후 돌아갈 경로를 로컬 스토리지에 저장
        localStorage.setItem('login_redirect_path', from);
        
        // 🔧 가이드에 따른 정확한 Google OAuth2 URL
        const googleLoginUrl = `http://ec2-54-180-117-21.ap-northeast-2.compute.amazonaws.com/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}&mode=login`;
        
        console.log('🚀 Google 로그인 URL:', googleLoginUrl);
        console.log('📍 로그인 후 리다이렉트 경로:', from);
        
        // 페이지 전체를 리다이렉트
        window.location.href = googleLoginUrl;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-black rounded-3xl shadow-2xl border border-white/50">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-gradient-to-r from-red-500 to-white-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-2xl">🔐</span>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-white-900">
                        Live Canvas 로그인
                    </h2>
                    <p className="mt-2 text-sm text-white-600">
                        함께 만드는 이야기의 세계로 들어오세요
                    </p>
                </div>
                
                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-medium rounded-2xl text-white-700 bg-black border-white-300 hover:bg-black-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        <img 
                            className="w-6 h-6 mr-3" 
                            src="https://www.svgrepo.com/show/475656/google-color.svg" 
                            alt="Google logo" 
                        />
                        <span className="text-lg">Google 계정으로 로그인</span>
                    </button>
                    
                    {/* 개발자 정보 */}
                    <div className="mt-4 p-4 bg-red-50 rounded-2xl text-xs space-y-2">
                        <p><strong>🔧 개발자 정보:</strong></p>
                        <div className="space-y-1 text-white-600">
                            <p>• 현재 포트: {currentPort}</p>
                            <p>• 리다이렉트 URI: {redirectUri}</p>
                            <p>• 백엔드 서버: http://ec2-54-180-117-21.ap-northeast-2.compute.amazonaws.com</p>
                            <p>• 돌아갈 경로: {from}</p>
                        </div>
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                            <p>⚠️ 백엔드에서 이 redirect_uri를 허용해야 합니다!</p>
                        </div>
                    </div>
                </div>
                
                <div className="text-center text-sm text-white-500">
                    새로운 캔버스를 만들고 다른 작가들과 함께<br/>
                    멋진 이야기를 완성해보세요! ✨
                </div>
            </div>
        </div>
    );
}