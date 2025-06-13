// src/services/authService.js - 개발자 모드 + 함수명 수정 최종 버전
import api from './api';
import { API_BASE_URL } from '@/config'

// 💡 [임시 해결책] 아이디 연동을 잠시 끄려면 이 값을 true로 변경하세요.
const DEV_MODE_ENABLED = false;
const DEV_MODE_DUMMY_TOKEN = 'DEV_MODE_TOKEN_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZNb2RlIiwibmFtZSI6IkRldmVsb3BlciIsImlhdCI6MTUxNjIzOTAyMn0.fA43WJb3tS0j4wL_Dx942-S1bZgTjM0JzCqK_w3tT_A';

const decodeJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null; // 디코딩 실패 시 null 반환
    }
};

export const authService = {
    saveTokens: (tokens) => {
        if (DEV_MODE_ENABLED) return;
        if (tokens.accessToken) localStorage.setItem('accessToken', tokens.accessToken);
        if (tokens.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);
    },

    getAccessToken: () => {
        if (DEV_MODE_ENABLED) return DEV_MODE_DUMMY_TOKEN;
        return localStorage.getItem('accessToken');
    },

    getRefreshToken: () => {
        if (DEV_MODE_ENABLED) return 'DEV_MODE_REFRESH_TOKEN';
        return localStorage.getItem('refreshToken');
    },

    isAuthenticated: () => {
        if (DEV_MODE_ENABLED) return true;
        return !!authService.getAccessToken();
    },

    isTokenExpired: (token) => {
        if (DEV_MODE_ENABLED) return false; // 개발자 모드에서는 만료되지 않음

        if (!token) return true;
        const decoded = decodeJwt(token);
        if (!decoded || !decoded.exp) return true;
        return Date.now() >= decoded.exp * 1000;
    },

    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) {
                console.error('리프레시 토큰이 없습니다')
                throw new Error('리프레시 토큰이 없습니다')
            }

            console.log('⏳ 엑세스 토큰이 만료되어 재발급합니다...', {
                refreshToken: refreshToken.substring(0, 10) + '...',
                currentUrl: window.location.href
            })
            
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshToken}`
                }
            })

            console.log('토큰 재발급 응답:', {
                status: response.status,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            })

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('리프레시 토큰이 만료되었습니다')
                    authService.logout()
                    throw new Error('리프레시 토큰이 만료되었습니다')
                }
                const errorText = await response.text()
                console.error('토큰 재발급 실패:', {
                    status: response.status,
                    error: errorText
                })
                throw new Error(`토큰 재발급 실패: ${response.status} - ${errorText}`)
            }

            const data = await response.json()
            console.log('토큰 재발급 성공:', {
                hasAccessToken: !!data.accessToken,
                hasRefreshToken: !!data.refreshToken
            })
            
            if (!data.accessToken) {
                throw new Error('새로운 액세스 토큰이 없습니다')
            }

            // 새 토큰 저장
            localStorage.setItem('accessToken', data.accessToken)
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken)
            }

            return data.accessToken
        } catch (error) {
            console.error('토큰 재발급 실패:', error)
            // 토큰 관련 에러인 경우 로그아웃
            if (error.message.includes('토큰') || error.message.includes('인증')) {
                authService.logout()
            }
            throw error
        }
    },
    
    async validateTokens() {
        try {
            const accessToken = authService.getAccessToken()
            if (!accessToken) {
                console.log('액세스 토큰이 없습니다')
                throw new Error('액세스 토큰이 없습니다')
            }

            // 토큰 만료 체크 (JWT 디코딩)
            try {
                const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
                const expirationTime = tokenPayload.exp * 1000
                const currentTime = Date.now()
                
                console.log('토큰 유효성 검사:', {
                    expirationTime: new Date(expirationTime).toISOString(),
                    currentTime: new Date(currentTime).toISOString(),
                    timeLeft: Math.floor((expirationTime - currentTime) / 1000) + '초'
                })

                // 만료 1분 전부터 갱신
                if (currentTime >= expirationTime - 60000) {
                    console.log('토큰 만료 임박, 재발급 시도')
                    const newToken = await authService.refreshToken()
                    return newToken
                }

                return accessToken
            } catch (decodeError) {
                console.error('토큰 디코딩 실패:', decodeError)
                throw new Error('유효하지 않은 토큰 형식')
            }
        } catch (error) {
            console.error('토큰 유효성 검증 실패:', error)
            throw error
        }
    },

    fetchAndSaveUser: async () => {
        if (DEV_MODE_ENABLED) {
            const devUser = { id: 999, nickname: '개발자', email: 'dev@opencanvas.com', color: '#ff00ff', role: 'ADMIN' };
            localStorage.setItem('user', JSON.stringify(devUser));
            return devUser;
        }
        try {
            const response = await api.get('/api/users/');
            if(response.data) localStorage.setItem('user', JSON.stringify(response.data));
            return response.data;
        } catch(error) {
            return null;
        }
    },

    getCurrentUser: () => {
        if (DEV_MODE_ENABLED) {
            const userStr = localStorage.getItem('user');
            if(userStr) return JSON.parse(userStr);
            return { nickname: '개발자' };
        }
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    logout: () => {
        console.log('로그아웃 처리 중...')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        // 전역 인증 상태 변경 이벤트 발생
        window.dispatchEvent(new Event('auth-change'))
    },

    getGoogleLoginUrl: (redirectUri) => {
        // 로컬 환경에서는 로컬 서버의 OAuth 엔드포인트 사용
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        const baseUrl = isLocalhost ? 'http://localhost:8080' : API_BASE_URL
        
        // 리다이렉트 URI도 로컬 환경에 맞게 조정
        const adjustedRedirectUri = isLocalhost 
          ? `http://localhost:${window.location.port}/oauth2/callback`
          : redirectUri

        console.log('OAuth 로그인 URL 생성:', {
          baseUrl,
          redirectUri: adjustedRedirectUri,
          isLocalhost
        })

        return `${baseUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(adjustedRedirectUri)}&mode=login`
    }
};
