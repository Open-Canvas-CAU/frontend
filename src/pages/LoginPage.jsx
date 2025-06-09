import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 로그인 페이지 컴포넌트입니다.
 * 현재 접속 환경에 따라 동적으로 리다이렉션 URI를 생성하여 구글 로그인을 처리합니다.
 */
export default function LoginPage() {
    const location = useLocation();

    // 1. 로그인 후 돌아올 콜백 URI를 현재 페이지의 origin을 기반으로 동적으로 생성합니다.
    //    개발 환경: http://localhost:5174/oauth2/callback
    //    운영 환경: https://your-domain.com/oauth2/callback
    const redirectUri = `${window.location.origin}/oauth2/callback`;

    // 2. 로그인 버튼을 누르기 직전의 페이지 경로를 저장합니다.
    //    로그인 성공 후 이 경로로 돌아오도록 처리할 수 있습니다.
    const from = location.state?.from?.pathname || '/';
    localStorage.setItem('login_redirect_path', from);


    // 3. 백엔드로 전달할 최종 인증 URL을 생성합니다.
    const googleLoginUrl = `http://localhost:8080/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}&mode=login`;

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
                    <a
                        href={googleLoginUrl}
                        className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <img className="w-6 h-6 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                        Google 계정으로 로그인
                    </a>
                </div>
            </div>
        </div>
    );
}
