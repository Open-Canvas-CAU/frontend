// src/services/authService.js - 개발자 모드 + 함수명 수정 최종 버전
import api from './api';

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

    refreshToken: async () => {
        if (DEV_MODE_ENABLED) return DEV_MODE_DUMMY_TOKEN; // 개발자 모드에서는 재발급 불필요

        const refreshToken = authService.getRefreshToken();
        if (!refreshToken) {
            authService.logout();
            throw new Error('리프레시 토큰이 없습니다.');
        }

        try {
            const response = await fetch('http://ec2-54-180-117-21.ap-northeast-2.compute.amazonaws.com/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
            if (!response.ok) throw new Error('토큰 재발급에 실패했습니다.');
            
            const data = await response.json();
            if (data.accessToken) {
                authService.saveTokens({ accessToken: data.accessToken });
                return data.accessToken;
            } else {
                throw new Error('새로운 엑세스 토큰을 받지 못했습니다.');
            }
        } catch (error) {
            authService.logout();
            throw error;
        }
    },
    
    validateTokens: async () => {
        if (DEV_MODE_ENABLED) return; // 개발자 모드에서는 유효성 검사 생략

        const accessToken = authService.getAccessToken();
        if (!accessToken) return;

        if (authService.isTokenExpired(accessToken)) {
            console.log('⏳ 엑세스 토큰이 만료되어 재발급합니다...');
            try {
                await authService.refreshToken();
            } catch (error) {
                console.error('토큰 재발급에 실패하여 요청을 중단합니다.');
                throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
            }
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
        if (DEV_MODE_ENABLED) {
            alert("개발자 모드에서는 로그아웃할 수 없습니다. authService.js의 DEV_MODE_ENABLED를 false로 변경해주세요.");
            return;
        }
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        window.dispatchEvent(new Event('auth-change'));
        window.location.href = '/';
    }
};
