// src/pages/LoginPage.jsx - 가이드에 따른 수정
import React from 'react';
import { useLocation } from 'react-router-dom';
import { authService } from '@/services/authService'

export default function LoginPage() {
    const location = useLocation();

    //  가이드에 따라 정확한 리다이렉트 URI 설정
    // 개발 환경에서는 포트를 동적으로 감지
    const getCurrentPort = () => {
        const port = window.location.port;
        // Vite는 기본적으로 5173, CRA는 3000
        return port || (window.location.protocol === 'https:' ? '443' : '3000');
    };
    
    const currentPort = getCurrentPort();
    const redirectUri = `http://localhost:${currentPort}/oauth2/callback`;
    
    console.log('로그인 설정:', {
        currentOrigin: window.location.origin,
        currentPort,
        redirectUri
    });
    
    // 로그인 후 돌아갈 경로 저장
    const from = location.state?.from?.pathname || '/';
    
    const handleGoogleLogin = () => {
        const redirectUri = `${window.location.origin}/oauth2/callback`
        const googleLoginUrl = authService.getGoogleLoginUrl(redirectUri)
        window.location.href = googleLoginUrl
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-md p-8 space-y-8 bg-black border border-white/20 rounded-2xl shadow-2xl">
                <div className="text-center">
                    
                    <h2 className="mt-6 text-3xl font-extrabold text-white">
                        Open Canvas
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                        함께 그림을 그리고 이야기를 만들어보세요
                    </p>
                </div>
                
                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center px-4 py-3 border border-white/10 rounded-xl text-white bg-black hover:bg-white/5 transition-colors duration-200"
                    >
                        <img 
                            className="w-5 h-5 mr-2" 
                            src="https://www.svgrepo.com/show/475656/google-color.svg" 
                            alt="Google" 
                        />
                        <span>Google로 로그인</span>
                    </button>
                </div>
                
                <div className="text-center text-sm text-white-500">
                    새로운 캔버스를 만들고 다른 작가들과 함께<br/>
                    멋진 이야기를 완성해보세요! ✨
                </div>
            </div>
        </div>
    );
}