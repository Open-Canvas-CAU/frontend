import api from './api';

/**
 * 인증 및 토큰 관리를 담당하는 서비스 객체입니다.
 */
export const authService = {

    /**
     * 로컬 스토리지에 토큰을 저장합니다.
     * @param {object} tokens - { accessToken, refreshToken } 객체
     */
    saveTokens: (tokens) => {
        if (tokens.accessToken) {
            localStorage.setItem('accessToken', tokens.accessToken);
        }
        if (tokens.refreshToken) {
            localStorage.setItem('refreshToken', tokens.refreshToken);
        }
    },

    /**
     * 로컬 스토리지에서 엑세스 토큰을 가져옵니다.
     * @returns {string | null} 엑세스 토큰 또는 null
     */
    getAccessToken: () => {
        return localStorage.getItem('accessToken');
    },

    /**
     * 로컬 스토리지에서 리프레시 토큰을 가져옵니다.
     * @returns {string | null} 리프레시 토큰 또는 null
     */
    getRefreshToken: () => {
        return localStorage.getItem('refreshToken');
    },

    /**
     * 로컬 스토리지에서 모든 토큰을 가져옵니다.
     * @returns {object} { accessToken, refreshToken } 객체
     */
    getTokens: () => {
        return {
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken')
        };
    },
    
    /**
     * 로그아웃 처리. 로컬 스토리지에서 모든 인증 정보를 제거합니다.
     */
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user'); // 사용자 정보도 함께 제거
        // 페이지를 새로고침하여 상태를 초기화합니다.
        window.location.href = '/'; 
    },

    /**
     * 현재 로그인(인증) 상태인지 확인합니다.
     * @returns {boolean} 엑세스 토큰 존재 여부
     */
    isAuthenticated: () => {
        return !!authService.getAccessToken();
    },

    /**
     * 리프레시 토큰을 사용하여 새로운 엑세스 토큰을 발급받습니다.
     * @param {string} refreshToken - 선택적 리프레시 토큰 (없으면 저장된 것 사용)
     * @returns {Promise<string>} 새로 발급된 엑세스 토큰
     */
    refreshToken: async (refreshToken = null) => {
        const tokenToUse = refreshToken || authService.getRefreshToken();
        
        if (!tokenToUse) {
            authService.logout();
            throw new Error('리프레시 토큰이 없습니다.');
        }

        try {
            // API 호출 시 무한루프 방지를 위해 직접 axios 호출
            const response = await fetch('http://localhost:8080/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: tokenToUse })
            });

            if (!response.ok) {
                throw new Error('토큰 갱신 실패');
            }

            const data = await response.json();
            const { accessToken } = data;
            
            if (accessToken) {
                authService.saveTokens({ accessToken });
                return accessToken;
            } else {
                throw new Error('새로운 엑세스 토큰을 받지 못했습니다.');
            }
        } catch (error) {
            console.error('토큰 재발급 실패:', error);
            authService.logout();
            throw error;
        }
    },
    
    /**
     * 서버로부터 현재 사용자 정보를 가져와 로컬 스토리지에 저장합니다.
     */
    fetchAndSaveUser: async () => {
        try {
            const response = await api.get('/api/users/');
            if(response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch(error) {
            console.error('사용자 정보 조회 실패:', error);
            return null;
        }
    },

    /**
     * 로컬 스토리지에서 현재 사용자 정보를 가져옵니다.
     */
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};