import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 401 에러 처리 (토큰 만료)
    if (error.response?.status === 401) {
      // 토큰 갱신 로직
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        return api.post('/auth/refresh', { refreshToken })
          .then(({ accessToken }) => {
            localStorage.setItem('accessToken', accessToken);
            // 원래 요청 재시도
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return api(error.config);
          })
          .catch((refreshError) => {
            // 리프레시 토큰도 만료된 경우
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // 로그인 페이지로 리다이렉트하지 않고 에러만 반환
            return Promise.reject(refreshError);
          });
      }
    }
    return Promise.reject(error);
  }
);

export { api }; 