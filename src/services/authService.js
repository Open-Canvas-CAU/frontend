import api from './api'

// 토큰 만료 시간 (밀리초)
const ACCESS_TOKEN_EXPIRY = 30 * 60 * 1000 // 30분
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7일

export const authService = {
  // 로그인
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password })
    const { accessToken, refreshToken, user } = response.data
    
    // 토큰 만료 시간 설정
    const now = Date.now()
    const tokens = {
      accessToken,
      refreshToken,
      accessTokenExpiry: now + ACCESS_TOKEN_EXPIRY,
      refreshTokenExpiry: now + REFRESH_TOKEN_EXPIRY
    }
    
    authService.saveTokens(tokens, user)
    return response
  },

  // 토큰 재발급
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken })
      const { accessToken } = response.data
      
      // 새로운 accessToken 저장
      const now = Date.now()
      const tokens = {
        ...authService.getTokens(),
        accessToken,
        accessTokenExpiry: now + ACCESS_TOKEN_EXPIRY
      }
      
      authService.saveTokens(tokens, authService.getCurrentUser())
      return response
    } catch (error) {
      // refreshToken도 만료된 경우 로그아웃
      authService.logout()
      throw error
    }
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('tokens')
    localStorage.removeItem('user')
  },

  // 토큰 저장
  saveTokens: (tokens, user) => {
    localStorage.setItem('tokens', JSON.stringify(tokens))
    localStorage.setItem('user', JSON.stringify(user))
  },

  // 토큰 가져오기
  getTokens: () => {
    const tokensStr = localStorage.getItem('tokens')
    return tokensStr ? JSON.parse(tokensStr) : null
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // 토큰이 유효한지 확인
  isAuthenticated: () => {
    const tokens = authService.getTokens()
    if (!tokens) return false

    const now = Date.now()
    
    // accessToken이 만료되었는지 확인
    if (now >= tokens.accessTokenExpiry) {
      // refreshToken도 만료되었는지 확인
      if (now >= tokens.refreshTokenExpiry) {
        authService.logout()
        return false
      }
      
      // accessToken만 만료된 경우 자동으로 갱신 시도
      authService.refreshToken(tokens.refreshToken)
        .catch(() => {
          authService.logout()
          return false
        })
    }
    
    return true
  },

  // API 요청을 위한 토큰 가져오기
  getAccessToken: async () => {
    const tokens = authService.getTokens()
    if (!tokens) return null

    const now = Date.now()
    
    // accessToken이 만료되었는지 확인
    if (now >= tokens.accessTokenExpiry) {
      // refreshToken도 만료되었는지 확인
      if (now >= tokens.refreshTokenExpiry) {
        authService.logout()
        return null
      }
      
      try {
        // accessToken 갱신
        await authService.refreshToken(tokens.refreshToken)
        return authService.getTokens().accessToken
      } catch (error) {
        authService.logout()
        return null
      }
    }
    
    return tokens.accessToken
  }
} 