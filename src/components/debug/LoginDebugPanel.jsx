// src/components/debug/LoginDebugPanel.jsx - 로그인 문제 빠른 진단
import React, { useState, useEffect } from 'react'
import { authService } from '@/services/authService'
import api from '@/services/api'

export default function LoginDebugPanel() {
    const [debugInfo, setDebugInfo] = useState({})
    const [testResults, setTestResults] = useState({})
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        updateDebugInfo()
    }, [])

    const updateDebugInfo = () => {
        const currentUrl = window.location.href
        const currentPort = window.location.port || (window.location.protocol === 'https:' ? '443' : '3000')
        
        const info = {
            // 현재 환경
            environment: {
                currentUrl,
                currentPort,
                origin: window.location.origin,
                pathname: window.location.pathname,
                protocol: window.location.protocol,
                hostname: window.location.hostname
            },
            
            // 토큰 상태
            tokens: authService.validateTokens(),
            
            // 사용자 정보
            user: authService.getCurrentUser(),
            
            // 로컬 스토리지 상태
            localStorage: {
                accessToken: !!localStorage.getItem('accessToken'),
                refreshToken: !!localStorage.getItem('refreshToken'),
                user: !!localStorage.getItem('user'),
                redirectPath: localStorage.getItem('login_redirect_path')
            },
            
            // 예상 URL들
            urls: {
                loginUrl: `http://localhost:8080/oauth2/authorization/google?redirect_uri=${encodeURIComponent(`http://localhost:${currentPort}/oauth2/callback`)}&mode=login`,
                callbackUrl: `http://localhost:${currentPort}/oauth2/callback`,
                backendBase: 'http://localhost:8080',
                refreshEndpoint: 'http://localhost:8080/auth/refresh'
            }
        }
        
        setDebugInfo(info)
    }

    const testBackendConnection = async () => {
        setTestResults(prev => ({ ...prev, backend: { testing: true } }))
        
        try {
            const health = await api.healthCheck()
            setTestResults(prev => ({ 
                ...prev, 
                backend: { 
                    success: true, 
                    status: health.status,
                    response: health.response || health.error
                } 
            }))
        } catch (error) {
            setTestResults(prev => ({ 
                ...prev, 
                backend: { 
                    success: false, 
                    error: error.message 
                } 
            }))
        }
    }

    const testTokenRefresh = async () => {
        if (!debugInfo.tokens?.hasRefreshToken) {
            setTestResults(prev => ({ 
                ...prev, 
                refresh: { 
                    success: false, 
                    error: '리프레시 토큰이 없습니다' 
                } 
            }))
            return
        }

        setTestResults(prev => ({ ...prev, refresh: { testing: true } }))
        
        try {
            const newToken = await authService.refreshToken()
            setTestResults(prev => ({ 
                ...prev, 
                refresh: { 
                    success: true, 
                    newTokenLength: newToken?.length || 0 
                } 
            }))
            updateDebugInfo() // 토큰 갱신 후 정보 업데이트
        } catch (error) {
            setTestResults(prev => ({ 
                ...prev, 
                refresh: { 
                    success: false, 
                    error: error.message 
                } 
            }))
        }
    }

    const testUserAPI = async () => {
        if (!debugInfo.tokens?.hasAccessToken) {
            setTestResults(prev => ({ 
                ...prev, 
                userApi: { 
                    success: false, 
                    error: '액세스 토큰이 없습니다' 
                } 
            }))
            return
        }

        setTestResults(prev => ({ ...prev, userApi: { testing: true } }))
        
        try {
            const user = await authService.fetchAndSaveUser()
            setTestResults(prev => ({ 
                ...prev, 
                userApi: { 
                    success: true, 
                    user: user ? { id: user.id, nickname: user.nickname } : null
                } 
            }))
            updateDebugInfo()
        } catch (error) {
            setTestResults(prev => ({ 
                ...prev, 
                userApi: { 
                    success: false, 
                    error: error.message 
                } 
            }))
        }
    }

    const clearAllData = () => {
        authService.logout()
        setTestResults({})
        updateDebugInfo()
        alert('모든 인증 데이터가 삭제되었습니다.')
    }

    const forceLogin = () => {
        const loginUrl = debugInfo.urls?.loginUrl
        if (loginUrl) {
            console.log('🚀 강제 로그인 시도:', loginUrl)
            window.location.href = loginUrl
        }
    }

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-50 text-xs"
                title="로그인 디버그 패널 열기"
            >
                🔧
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold">🔧 로그인 디버깅 패널</h2>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* 빠른 액션 버튼들 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                            onClick={forceLogin}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                            🔑 강제 로그인
                        </button>
                        <button
                            onClick={testBackendConnection}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                            🌐 백엔드 테스트
                        </button>
                        <button
                            onClick={testTokenRefresh}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                        >
                            🔄 토큰 갱신
                        </button>
                        <button
                            onClick={clearAllData}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                            🗑️ 데이터 초기화
                        </button>
                    </div>

                    {/* 테스트 결과 */}
                    {Object.keys(testResults).length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-bold mb-3">📊 테스트 결과</h3>
                            <div className="space-y-2 text-sm">
                                {Object.entries(testResults).map(([key, result]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <span className="font-medium capitalize">{key}:</span>
                                        {result.testing ? (
                                            <span className="text-blue-600">테스트 중...</span>
                                        ) : result.success ? (
                                            <span className="text-green-600">✅ 성공</span>
                                        ) : (
                                            <span className="text-red-600">❌ 실패: {result.error}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 현재 상태 요약 */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-3">📋 현재 상태</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className={`font-medium ${debugInfo.tokens?.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                                    인증 상태: {debugInfo.tokens?.isAuthenticated ? '로그인됨' : '로그인 안됨'}
                                </div>
                                <div>액세스 토큰: {debugInfo.tokens?.hasAccessToken ? '✅' : '❌'}</div>
                                <div>리프레시 토큰: {debugInfo.tokens?.hasRefreshToken ? '✅' : '❌'}</div>
                                <div>사용자 정보: {debugInfo.user ? '✅' : '❌'}</div>
                            </div>
                            <div>
                                <div>현재 포트: {debugInfo.environment?.currentPort}</div>
                                <div>프로토콜: {debugInfo.environment?.protocol}</div>
                                <div>호스트: {debugInfo.environment?.hostname}</div>
                            </div>
                        </div>
                    </div>

                    {/* URL 정보 */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-3">🔗 중요 URL들</h3>
                        <div className="space-y-2 text-xs">
                            <div>
                                <strong>로그인 URL:</strong>
                                <div className="bg-white p-2 rounded border mt-1 break-all">
                                    {debugInfo.urls?.loginUrl}
                                </div>
                            </div>
                            <div>
                                <strong>콜백 URL:</strong>
                                <div className="bg-white p-2 rounded border mt-1 break-all">
                                    {debugInfo.urls?.callbackUrl}
                                </div>
                            </div>
                            <div>
                                <strong>백엔드 서버:</strong>
                                <div className="bg-white p-2 rounded border mt-1">
                                    {debugInfo.urls?.backendBase}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 상세 디버그 정보 */}
                    <details className="bg-gray-50 p-4 rounded-lg">
                        <summary className="font-bold cursor-pointer">🔍 상세 디버그 정보</summary>
                        <pre className="mt-3 text-xs overflow-auto bg-white p-3 rounded border">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </details>

                    {/* 트러블슈팅 가이드 */}
                    <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-3 text-red-800">🆘 트러블슈팅 체크리스트</h3>
                        <ul className="text-sm space-y-1 text-red-700">
                            <li>✅ 백엔드 서버가 http://localhost:8080에서 실행 중인지 확인</li>
                            <li>✅ 백엔드에서 현재 프론트엔드 URL을 CORS 허용 목록에 추가했는지 확인</li>
                            <li>✅ OAuth2 설정에서 리다이렉트 URI가 정확한지 확인</li>
                            <li>✅ 브라우저 개발자 도구 Network 탭에서 실패한 요청 확인</li>
                            <li>✅ 브라우저의 쿠키/로컬스토리지가 차단되지 않았는지 확인</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}