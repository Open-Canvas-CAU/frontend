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
            const accessToken = searchParams.get('access_token');
            const refreshToken = searchParams.get('refresh_token');

            if (accessToken && refreshToken) {
                authService.saveTokens({ accessToken, refreshToken });
                
                await authService.fetchAndSaveUser();

                window.dispatchEvent(new Event('auth-change'));
                
                const redirectPath = localStorage.getItem('login_redirect_path') || '/';
                localStorage.removeItem('login_redirect_path'); // 사용 후에는 제거합니다.
                navigate(redirectPath, { replace: true });

            } else {
                console.error('OAuth 콜백에서 토큰을 찾을 수 없습니다.');
                navigate('/login');
            }
        };

        processLogin();
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl">로그인 처리 중...</div>
        </div>
    );
}
