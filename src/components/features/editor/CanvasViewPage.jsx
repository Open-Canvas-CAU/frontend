// src/components/features/editor/CanvasViewPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EditorSection from './EditorSection'
import api from '@/services/api'
import { authService } from '@/services/authService'

export default function CanvasViewPage() {
    const { coverId } = useParams()
    const navigate = useNavigate()
    
    const [coverData, setCoverData] = useState(null)
    const [writings, setWritings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isJoiningRoom, setIsJoiningRoom] = useState(false)

    // 커버 및 글 정보 조회
    useEffect(() => {
        const fetchCanvasData = async () => {
            if (!coverId) {
                setError('잘못된 접근입니다. Cover ID가 없습니다.')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                console.log('📖 캔버스 정보 조회:', coverId)

                // 1. 커버 상태 확인
                const coverResponse = await api.get('/api/covers/check', {
                    params: { coverId }
                })
                const cover = coverResponse.data
                setCoverData(cover)
                console.log('📋 커버 정보:', cover)

                // 2. 기존 글이 있다면 조회 (roomId가 있는 경우에만)
                if (cover.roomId) {
                    try {
                        const writingsResponse = await api.get(`/api/writings/room/${cover.roomId}`)
                        const existingWritings = Array.isArray(writingsResponse.data) 
                            ? writingsResponse.data 
                            : []
                        
                        setWritings(existingWritings.length > 0 
                            ? existingWritings 
                            : [{ body: '<p>아직 작성된 내용이 없습니다.</p>' }]
                        )
                        console.log('📝 기존 글 내용:', existingWritings)
                    } catch (writingError) {
                        console.warn('⚠️ 글 내용 조회 실패 (무시):', writingError)
                        setWritings([{ body: '<p>글 내용을 불러올 수 없습니다.</p>' }])
                    }
                } else {
                    // roomId가 없으면 기본 메시지
                    setWritings([{ body: '<p>아직 작성이 시작되지 않은 캔버스입니다.</p>' }])
                }

            } catch (err) {
                console.error('❌ 캔버스 정보 조회 실패:', err)
                if (err.response?.status === 404) {
                    setError('캔버스를 찾을 수 없습니다.')
                } else {
                    setError(`캔버스 정보를 불러오는데 실패했습니다: ${err.message}`)
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchCanvasData()
    }, [coverId])

    // 편집하기 버튼 클릭 - 문서방 생성/참여
    const handleStartEditing = async () => {
        if (!authService.isAuthenticated()) {
            alert('편집하려면 로그인이 필요합니다.')
            navigate('/login', { state: { from: { pathname: `/canvas/${coverId}` } } })
            return
        }

        setIsJoiningRoom(true)
        try {
            let roomId = coverData.roomId

            // 기존 roomId가 없으면 새로 생성
            if (!roomId) {
                console.log('🏠 새 문서방 생성...')
                const writingDto = {
                    title: coverData.title,
                    body: '<p>새로운 이야기를 시작해보세요...</p>',
                    depth: 0,
                    siblingIndex: 0,
                    time: new Date().toISOString()
                }

                const roomResponse = await api.post('/api/rooms/create', writingDto)
                roomId = roomResponse.data.roomId
                console.log('✅ 새 문서방 생성됨:', roomId)
            } else {
                console.log('🚪 기존 문서방 참여:', roomId)
                
                // 기존 문서방에 참여
                await api.get(`/api/rooms/${roomId}`)
                console.log('✅ 기존 문서방 참여 완료')
            }

            if (!roomId) {
                throw new Error('Room ID를 얻을 수 없습니다.')
            }

            // 편집 모드로 이동
            navigate(`/editor/${roomId}/edit`)

        } catch (error) {
            console.error('❌ 편집 모드 진입 실패:', error)
            alert(`편집 모드로 진입할 수 없습니다: ${error.response?.data?.message || error.message}`)
        } finally {
            setIsJoiningRoom(false)
        }
    }

    // 완성작 보기 (contentId가 있는 경우)
    const handleViewCompleted = () => {
        navigate(`/completed/${coverId}`)
    }

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <div className="text-xl text-gray-700">캔버스를 불러오고 있습니다...</div>
                </div>
            </div>
        )
    }

    // 에러 상태
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl">⚠️</div>
                    <div className="text-xl text-red-600">{error}</div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        뒤로 가기
                    </button>
                </div>
            </div>
        )
    }

    if (!coverData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-4xl">📭</div>
                    <div className="text-xl text-gray-600">캔버스 데이터가 없습니다.</div>
                </div>
            </div>
        )
    }

    const isCompleted = coverData.roomType === 'COMPLETE'
    const isEditing = coverData.roomType === 'EDITING'
    const isAvailable = coverData.roomType === 'AVAILABLE'

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-8">
                {/* 헤더 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 mb-8">
                    <div className="flex items-center justify-between px-8 py-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                <span className="text-lg">←</span>
                            </div>
                            <span className="font-medium">뒤로 가기</span>
                        </button>
                        
                        <div className="text-center">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {coverData.title}
                            </h1>
                            <div className="flex items-center justify-center space-x-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                    <span>👁️</span>
                                    <span>{coverData.view || 0}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                    <span>❤️</span>
                                    <span>{coverData.likeNum || 0}</span>
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    isCompleted ? 'bg-green-100 text-green-600' :
                                    isEditing ? 'bg-blue-100 text-blue-600' :
                                    'bg-yellow-100 text-yellow-600'
                                }`}>
                                    {isCompleted ? '완성됨' : isEditing ? '편집 중' : '편집 가능'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                            {new Date(coverData.time).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* 본문 미리보기 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden mb-8">
                    <div className="p-8">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                                <span>📖</span>
                                <span>내용 미리보기</span>
                            </h3>
                        </div>
                        
                        <EditorSection
                            content={writings[0]?.body || '<p>내용이 없습니다.</p>'}
                            readOnly={true}
                            className="min-h-[300px] prose prose-lg max-w-none"
                        />
                    </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
                    <div className="p-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="text-lg font-semibold text-gray-800">
                                    다음 단계를 선택하세요
                                </div>
                                <div className="text-sm text-gray-600">
                                    {isCompleted ? '완성된 작품을 감상하거나 새로운 편집을 시작할 수 있습니다.' :
                                     isEditing ? '현재 다른 작가가 편집 중입니다. 참여하거나 기다려주세요.' :
                                     '이 캔버스의 편집을 시작하거나 내용을 더 자세히 볼 수 있습니다.'}
                                </div>
                            </div>
                            
                            <div className="flex space-x-4">
                                {/* 완성작 보기 버튼 (완성된 경우에만) */}
                                {isCompleted && (
                                    <button
                                        onClick={handleViewCompleted}
                                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        🎨 완성작 보기
                                    </button>
                                )}
                                
                                {/* 편집하기 버튼 (완성되지 않은 경우) */}
                                {!isCompleted && (
                                    <button
                                        onClick={handleStartEditing}
                                        disabled={isJoiningRoom}
                                        className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform shadow-lg ${
                                            isJoiningRoom
                                                ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                                                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white hover:scale-105'
                                        }`}
                                    >
                                        {isJoiningRoom ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>편집 모드 진입 중...</span>
                                            </div>
                                        ) : (
                                            <>✏️ 편집하기</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* 추가 정보 */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span>최대 참여 작가 수:</span>
                                    <span className="font-medium">{coverData.limit || '제한 없음'}명</span>
                                </div>
                                {coverData.roomId && (
                                    <div className="flex items-center justify-between">
                                        <span>문서방 ID:</span>
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                            {coverData.roomId}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}