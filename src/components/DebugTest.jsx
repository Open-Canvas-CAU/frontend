// src/components/DebugTest.jsx - 편집방 및 실시간 동기화 테스트용
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { coverService } from '@/services/coverService'
import websocketService from '@/services/websocketService'
import api from '@/services/api'

export default function DebugTest() {
    const navigate = useNavigate()
    const [testResults, setTestResults] = useState({})
    const [isRunning, setIsRunning] = useState(false)
    const [currentStep, setCurrentStep] = useState('')

    // 단계별 테스트 실행
    const runCompleteTest = async () => {
        setIsRunning(true)
        setTestResults({})
        
        try {
            // 1. 인증 확인
            setCurrentStep('인증 상태 확인')
            const authStatus = {
                isAuthenticated: authService.isAuthenticated(),
                hasToken: !!authService.getAccessToken(),
                user: authService.getCurrentUser()
            }
            setTestResults(prev => ({ ...prev, auth: authStatus }))
            
            if (!authStatus.isAuthenticated) {
                throw new Error('로그인이 필요합니다.')
            }

            // 2. 새 캔버스 생성 테스트
            setCurrentStep('새 캔버스 생성 테스트')
            const testTitle = `테스트 캔버스 ${Date.now()}`
            
            const coverDto = {
                title: testTitle,
                coverImageUrl: "https://via.placeholder.com/400x300?text=Test",
                time: new Date().toISOString(),
                limit: 2,
            }
            
            const coverResponse = await api.post('/api/covers', coverDto)
            const createdCover = coverResponse.data
            
            setTestResults(prev => ({ 
                ...prev, 
                coverCreation: { 
                    success: true, 
                    coverId: createdCover.id, 
                    title: createdCover.title 
                } 
            }))

            // 3. 문서방 생성 테스트
            setCurrentStep('문서방 생성 테스트')
            const writingDto = {
                title: testTitle,
                body: '<p>테스트 캔버스입니다. 실시간 동기화를 테스트해보세요!</p>',
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            }
            
            const roomResponse = await api.post('/api/rooms/create', writingDto)
            const roomData = roomResponse.data
            
            setTestResults(prev => ({ 
                ...prev, 
                roomCreation: { 
                    success: true, 
                    roomId: roomData.roomId,
                    data: roomData
                } 
            }))

            // 4. WebSocket 연결 테스트
            setCurrentStep('WebSocket 연결 테스트')
            const wsTestResult = await testWebSocketConnection(roomData.roomId)
            setTestResults(prev => ({ ...prev, websocket: wsTestResult }))

            // 5. 완료
            setCurrentStep('테스트 완료!')
            setTestResults(prev => ({ 
                ...prev, 
                overall: { 
                    success: true, 
                    message: '모든 테스트가 성공했습니다!',
                    editorUrl: `/editor/${roomData.roomId}/edit`
                } 
            }))

        } catch (error) {
            console.error('❌ Test failed at step:', currentStep, error)
            setTestResults(prev => ({ 
                ...prev, 
                error: { 
                    step: currentStep, 
                    message: error.message,
                    details: error.response?.data || error.stack
                } 
            }))
        } finally {
            setIsRunning(false)
            setCurrentStep('')
        }
    }

    // WebSocket 연결 테스트
    const testWebSocketConnection = (roomId) => {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve({ success: false, error: '연결 시간 초과' })
            }, 10000) // 10초 타임아웃

            websocketService.connect(roomId, {
                onConnect: (frame) => {
                    clearTimeout(timeout)
                    websocketService.disconnect()
                    resolve({ 
                        success: true, 
                        message: 'WebSocket 연결 성공',
                        frame: frame
                    })
                },
                onError: (error) => {
                    clearTimeout(timeout)
                    resolve({ 
                        success: false, 
                        error: error.message || error,
                        details: error
                    })
                }
            })
        })
    }

    // 기존 캔버스 목록 조회 테스트
    const testExistingCanvases = async () => {
        try {
            setCurrentStep('기존 캔버스 조회 테스트')
            const allCovers = await coverService.getAllCovers()
            const workingCovers = await coverService.getWorkingCovers()
            const completedCovers = await coverService.getCompletedCovers()
            
            setTestResults(prev => ({
                ...prev,
                existingCanvases: {
                    success: true,
                    total: allCovers.data?.length || 0,
                    working: workingCovers.data?.length || 0,
                    completed: completedCovers.data?.length || 0,
                    samples: allCovers.data?.slice(0, 3) || []
                }
            }))
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                existingCanvases: {
                    success: false,
                    error: error.message
                }
            }))
        }
        setCurrentStep('')
    }

    const goToEditor = () => {
        if (testResults.overall?.editorUrl) {
            navigate(testResults.overall.editorUrl)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="bg-black rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    🔧 편집방 & 실시간 동기화 테스트
                </h1>

                {/* 현재 진행 상황 */}
                {isRunning && (
                    <div className="mb-6 p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-medium">진행 중: {currentStep}</span>
                        </div>
                    </div>
                )}

                {/* 테스트 버튼들 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={runCompleteTest}
                        disabled={isRunning}
                        className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                        🚀 전체 플로우 테스트
                    </button>
                    
                    <button
                        onClick={testExistingCanvases}
                        disabled={isRunning}
                        className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                        📋 기존 캔버스 조회
                    </button>
                    
                    {testResults.overall?.success && (
                        <button
                            onClick={goToEditor}
                            className="px-6 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold"
                        >
                            ✏️ 생성된 에디터로 이동
                        </button>
                    )}
                </div>

                {/* 테스트 결과 */}
                <div className="space-y-6">
                    {Object.entries(testResults).map(([key, result]) => (
                        <div key={key} className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-2 flex items-center space-x-2">
                                <span>{getStepIcon(key, result)}</span>
                                <span>{getStepTitle(key)}</span>
                                <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.success ? '✅ 성공' : '❌ 실패'}
                                </span>
                            </h3>
                            <div className="bg-black-50 p-3 rounded text-xs">
                                <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 도움말 */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold mb-2">💡 테스트 가이드</h4>
                    <ul className="text-sm space-y-1">
                        <li>• <strong>전체 플로우 테스트</strong>: 새 캔버스 생성부터 WebSocket 연결까지 전체 과정을 테스트합니다.</li>
                        <li>• <strong>기존 캔버스 조회</strong>: API에서 캔버스 목록을 정상적으로 가져오는지 확인합니다.</li>
                        <li>• 테스트 성공 시 생성된 에디터로 바로 이동하여 실시간 동기화를 확인할 수 있습니다.</li>
                        <li>• 문제 발생 시 결과 상세 내용을 확인하여 디버깅하세요.</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

// 헬퍼 함수들
const getStepIcon = (key, result) => {
    const icons = {
        auth: '🔐',
        coverCreation: '📝',
        roomCreation: '🏠',
        websocket: '⚡',
        existingCanvases: '📋',
        overall: '🎉',
        error: '❌'
    }
    return icons[key] || '🔧'
}

const getStepTitle = (key) => {
    const titles = {
        auth: '인증 상태',
        coverCreation: '커버 생성',
        roomCreation: '문서방 생성',
        websocket: 'WebSocket 연결',
        existingCanvases: '기존 캔버스 조회',
        overall: '전체 결과',
        error: '오류 발생'
    }
    return titles[key] || key
}