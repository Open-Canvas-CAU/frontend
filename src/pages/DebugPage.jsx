// src/pages/DebugPage.jsx - 문제 진단용 컴포넌트
import React, { useState, useEffect } from 'react'
import { authService } from '@/services/authService'
import { coverService } from '@/services/coverService'
import websocketService from '@/services/websocketService'
import api from '@/services/api'

export default function DebugPage() {
    const [results, setResults] = useState({})
    const [loading, setLoading] = useState(false)
    const [websocketStatus, setWebsocketStatus] = useState('disconnected')

    // 1. 인증 상태 확인
    const testAuth = async () => {
        setLoading(true)
        try {
            const token = authService.getAccessToken()
            const user = authService.getCurrentUser()
            const isAuth = authService.isAuthenticated()
            
            setResults(prev => ({
                ...prev,
                auth: {
                    hasToken: !!token,
                    tokenLength: token?.length || 0,
                    hasUser: !!user,
                    isAuthenticated: isAuth,
                    user: user
                }
            }))
        } catch (error) {
            setResults(prev => ({
                ...prev,
                auth: { error: error.message }
            }))
        }
        setLoading(false)
    }

    // 2. API 엔드포인트 테스트
    const testAPI = async () => {
        setLoading(true)
        try {
            // 기본 API 테스트
            const healthCheck = await api.get('/')
            
            // 커버 API 테스트
            const allCovers = await coverService.getAllCovers()
            
            // 사용자 정보 API 테스트
            let userInfo = null
            try {
                userInfo = await api.get('/api/users/')
            } catch (userError) {
                console.warn('User API failed:', userError.message)
            }
            
            setResults(prev => ({
                ...prev,
                api: {
                    healthCheck: healthCheck.data,
                    coversCount: allCovers.data?.length || 0,
                    covers: allCovers.data?.slice(0, 3) || [], // 처음 3개만
                    userInfo: userInfo?.data,
                    success: true
                }
            }))
        } catch (error) {
            setResults(prev => ({
                ...prev,
                api: { 
                    error: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText
                }
            }))
        }
        setLoading(false)
    }

    // 3. WebSocket 연결 테스트
    const testWebSocket = async () => {
        setLoading(true)
        setWebsocketStatus('connecting')
        
        const testRoomId = 'test-room-' + Date.now()
        
        try {
            websocketService.connect(testRoomId, {
                onConnect: (frame) => {
                    console.log('✅ WebSocket test connection successful')
                    setWebsocketStatus('connected')
                    setResults(prev => ({
                        ...prev,
                        websocket: {
                            success: true,
                            roomId: testRoomId,
                            frame: frame,
                            status: websocketService.getStatus()
                        }
                    }))
                    
                    // 5초 후 연결 해제
                    setTimeout(() => {
                        websocketService.disconnect()
                        setWebsocketStatus('disconnected')
                    }, 5000)
                },
                onError: (error) => {
                    console.error('❌ WebSocket test connection failed')
                    setWebsocketStatus('error')
                    setResults(prev => ({
                        ...prev,
                        websocket: {
                            success: false,
                            error: error.message || error,
                            status: websocketService.getStatus()
                        }
                    }))
                },
                onClose: () => {
                    setWebsocketStatus('disconnected')
                },
                onMessage: (message) => {
                    console.log('📨 WebSocket test message:', message)
                }
            })
        } catch (error) {
            setWebsocketStatus('error')
            setResults(prev => ({
                ...prev,
                websocket: {
                    success: false,
                    error: error.message,
                    setupError: true
                }
            }))
        }
        setLoading(false)
    }

    // 4. 전체 테스트 실행
    const runAllTests = async () => {
        await testAuth()
        await testAPI()
        await testWebSocket()
    }

    // 컴포넌트 마운트 시 자동 실행
    useEffect(() => {
        testAuth()
    }, [])

    const renderResults = (key, data) => {
        if (!data) return <div className="text-gray-500">테스트하지 않음</div>
        
        return (
            <div className="bg-gray-50 p-3 rounded text-xs">
                <pre className="whitespace-pre-wrap overflow-auto max-h-48">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        )
    }

    const getStatusColor = (success) => {
        if (success === true) return 'text-green-600'
        if (success === false) return 'text-red-600'
        return 'text-yellow-600'
    }

    return (
        <div className="container mx-auto px-8 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">🔧 디버깅 대시보드</h1>
                
                {/* 전체 테스트 버튼 */}
                <div className="mb-8 flex space-x-4">
                    <button
                        onClick={runAllTests}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                        {loading ? '테스트 중...' : '전체 테스트 실행'}
                    </button>
                    
                    <button
                        onClick={() => setResults({})}
                        className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                    >
                        결과 초기화
                    </button>
                </div>

                {/* 개별 테스트 섹션들 */}
                <div className="grid gap-6">
                    {/* 1. 인증 테스트 */}
                    <div className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">1. 인증 상태</h2>
                            <div className="flex items-center space-x-2">
                                <span className={`font-medium ${getStatusColor(results.auth?.hasToken)}`}>
                                    {results.auth?.hasToken ? '✅ 토큰 있음' : '❌ 토큰 없음'}
                                </span>
                                <button
                                    onClick={testAuth}
                                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                                >
                                    테스트
                                </button>
                            </div>
                        </div>
                        {renderResults('auth', results.auth)}
                    </div>

                    {/* 2. API 테스트 */}
                    <div className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">2. API 연결</h2>
                            <div className="flex items-center space-x-2">
                                <span className={`font-medium ${getStatusColor(results.api?.success)}`}>
                                    {results.api?.success ? '✅ API 정상' : results.api?.error ? '❌ API 오류' : '⏳ 미테스트'}
                                </span>
                                <button
                                    onClick={testAPI}
                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                                >
                                    테스트
                                </button>
                            </div>
                        </div>
                        {renderResults('api', results.api)}
                    </div>

                    {/* 3. WebSocket 테스트 */}
                    <div className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">3. WebSocket 연결</h2>
                            <div className="flex items-center space-x-2">
                                <span className={`font-medium ${
                                    websocketStatus === 'connected' ? 'text-green-600' :
                                    websocketStatus === 'error' ? 'text-red-600' :
                                    websocketStatus === 'connecting' ? 'text-yellow-600' :
                                    'text-gray-600'
                                }`}>
                                    {websocketStatus === 'connected' && '✅ 연결됨'}
                                    {websocketStatus === 'connecting' && '🔄 연결 중'}
                                    {websocketStatus === 'error' && '❌ 연결 실패'}
                                    {websocketStatus === 'disconnected' && '⭕ 연결 안됨'}
                                </span>
                                <button
                                    onClick={testWebSocket}
                                    disabled={websocketStatus === 'connecting'}
                                    className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm disabled:opacity-50"
                                >
                                    테스트
                                </button>
                            </div>
                        </div>
                        {renderResults('websocket', results.websocket)}
                    </div>

                    {/* 환경 정보 */}
                    <div className="border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">환경 정보</h2>
                        <div className="bg-gray-50 p-3 rounded text-xs">
                            <pre>
{`현재 URL: ${window.location.href}
Node ENV: ${process.env.NODE_ENV}
API Base: ${import.meta.env.VITE_USE_MOCK_API === 'true' ? 'Mock API' : 'http://localhost:8080'}
WebSocket URL: ws://localhost:8080/ws-stomp
브라우저: ${navigator.userAgent}`}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* 추천 해결책 */}
                <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">🛠️ 문제 해결 체크리스트</h3>
                    <ul className="space-y-2 text-sm">
                        <li>✅ 백엔드 서버가 http://localhost:8080에서 실행 중인지 확인</li>
                        <li>✅ WebSocket 엔드포인트 /ws-stomp가 활성화되어 있는지 확인</li>
                        <li>✅ 토큰이 유효하고 만료되지 않았는지 확인</li>
                        <li>✅ CORS 설정이 프론트엔드 도메인을 허용하는지 확인</li>
                        <li>✅ 방화벽이나 보안 소프트웨어가 연결을 차단하지 않는지 확인</li>
                        <li>✅ 브라우저 개발자 도구의 Network 탭에서 실패한 요청 확인</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}