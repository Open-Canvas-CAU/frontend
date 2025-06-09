import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CarouselEditor from './CarouselEditor.jsx'
import api from '@/services/api'
import websocketService from '@/services/websocketService'
import ReportIconUrl from '@/assets/icons/report.svg'

// 캔버스 상태 정의
const CANVAS_STATUS = {
    WORKING: 'WORKING',      // 작업 중
    COMPLETED: 'COMPLETED',  // 완성됨
    PUBLISHED: 'PUBLISHED'   // 갤러리에 게시됨
}

// 완성 조건 설정
const COMPLETION_CRITERIA = {
    MIN_WORDS: 100,          // 최소 단어 수
    MIN_CHARACTERS: 500,     // 최소 글자 수
    MAX_IDLE_HOURS: 24       // 최대 비활성 시간 (시간)
}

export default function CanvasPage({ isEditing = false, onEdit, showEditButton = true }) {
    const { docId } = useParams()
    const roomId = docId
    const navigate = useNavigate()

    // 기존 상태들
    const [roomData, setRoomData] = useState(null)
    const [writings, setWritings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [connectedUsers, setConnectedUsers] = useState([])
    const [websocketConnected, setWebsocketConnected] = useState(false)

    // 캔버스 상태 관리
    const [canvasStatus, setCanvasStatus] = useState(CANVAS_STATUS.WORKING)
    const [canComplete, setCanComplete] = useState(false)
    const [completionStats, setCompletionStats] = useState({
        wordCount: 0,
        characterCount: 0,
        lastEditTime: null
    })

    // 신고 및 완성 모달 상태
    const [showReportModal, setShowReportModal] = useState(false)
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [reportReason, setReportReason] = useState('')
    const [isReporting, setIsReporting] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)

    // 텍스트 통계 계산 함수
    const calculateTextStats = (htmlContent) => {
        // HTML 태그 제거하고 텍스트만 추출
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlContent
        const textContent = tempDiv.textContent || tempDiv.innerText || ''
        
        const characterCount = textContent.length
        const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length
        
        return { characterCount, wordCount }
    }

    // 완성 가능 여부 체크
    const checkCompletionEligibility = (stats) => {
        const meetsWordCount = stats.wordCount >= COMPLETION_CRITERIA.MIN_WORDS
        const meetsCharCount = stats.characterCount >= COMPLETION_CRITERIA.MIN_CHARACTERS
        
        return meetsWordCount || meetsCharCount
    }

    // 콘텐츠 변경 시 통계 업데이트
    useEffect(() => {
        if (writings.length > 0) {
            const allContent = writings.map(w => w.body || '').join(' ')
            const stats = calculateTextStats(allContent)
            
            setCompletionStats(prev => ({
                ...stats,
                lastEditTime: new Date()
            }))
            
            setCanComplete(checkCompletionEligibility(stats))
        }
    }, [writings])

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        if (!dateString) return 'Invalid Date'
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'Invalid Date'
            return date.toLocaleString()
        } catch (e) {
            console.error('Date formatting error:', e)
            return 'Invalid Date'
        }
    }

    // 문서방 참여 및 WebSocket 연결
    useEffect(() => {
        async function joinRoom() {
            try {
                setIsLoading(true)
                console.log('Joining room:', roomId)

                // 문서방 참여
                const roomResponse = await api.get(`/api/rooms/${roomId}`)
                console.log('Room response:', roomResponse.data)
                setRoomData(roomResponse.data)

                // 문서방 글 조회
                const writingsResponse = await api.get(`/api/writings/room/${roomId}`)
                console.log('Writings response:', writingsResponse.data)
                
                const data = writingsResponse.data
                const writingsArray = Array.isArray(data) ? data : (data ? [data] : [])
                setWritings(writingsArray)

                // WebSocket 연결 시도 (백엔드가 준비되지 않은 경우를 대비해 try-catch로 감쌈)
                try {
                    websocketService.connect(roomId, {
                        onConnect: () => {
                            console.log('WebSocket connected for room:', roomId)
                            setWebsocketConnected(true)
                        },
                        onMessage: (message) => {
                            handleWebSocketMessage(message)
                        },
                        onError: (error) => {
                            console.error('WebSocket error:', error)
                            setWebsocketConnected(false)
                        },
                        onClose: () => {
                            console.log('WebSocket disconnected')
                            setWebsocketConnected(false)
                        }
                    })
                } catch (wsError) {
                    console.warn('WebSocket connection failed, continuing without real-time updates:', wsError)
                    setWebsocketConnected(false)
                }

            } catch (error) {
                console.error('문서방 참여 실패:', error)
                setError(`문서방 참여에 실패했습니다: ${error.response?.data?.message || error.message}`)
            } finally {
                setIsLoading(false)
            }
        }

        if (roomId) {
            joinRoom()
        }

        // Cleanup: WebSocket 연결 해제
        return () => {
            if (roomId && websocketConnected) {
                try {
                    websocketService.disconnect()
                } catch (e) {
                    console.warn('WebSocket disconnect error:', e)
                }
            }
        }
    }, [roomId])

    // WebSocket 메시지 처리
    const handleWebSocketMessage = (message) => {
        console.log('Received WebSocket message:', message)
        
        switch (message.type) {
            case 'EDIT':
                // 다른 사용자의 편집 내용 반영
                handleRemoteEdit(message)
                break
            case 'JOIN':
                // 사용자 입장
                console.log('User joined:', message)
                break
            case 'LEAVE':
                // 사용자 퇴장
                console.log('User left:', message)
                break
            case 'ROOMOUT':
                // 편집자가 나가서 방이 삭제됨
                alert('편집자가 나가서 문서방이 종료되었습니다.')
                navigate('/')
                break
            default:
                console.log('Unknown message type:', message.type)
        }
    }

    // 원격 편집 처리
    const handleRemoteEdit = (message) => {
        const blockNum = parseInt(message.num || '0')
        setWritings(prev => {
            const copy = [...prev]
            if (copy[blockNum]) {
                copy[blockNum] = { ...copy[blockNum], body: message.message }
            }
            return copy
        })
    }

    // 로컬 편집 처리 (WebSocket으로 전송)
    const handleLocalEdit = (idx, html) => {
        // 로컬 상태 업데이트
        setWritings(prev => {
            const copy = [...prev]
            if (copy[idx]) {
                copy[idx] = { ...copy[idx], body: html }
            } else {
                // 새로운 인덱스인 경우 기본 객체 생성
                copy[idx] = { body: html, depth: 0, siblingIndex: idx }
            }
            return copy
        })

        // WebSocket으로 편집 내용 전송 (연결된 경우에만)
        if (isEditing && websocketConnected) {
            websocketService.sendThrottledMessage(idx, html)
        }
    }

    // 임시 저장 (작업 중 상태 유지)
    const handleSave = async () => {
        try {
            console.log('Saving writings as draft:', writings)
            
            const writingDto = {
                title: roomData?.title || '제목 없음',
                body: writings[0]?.body || '<p>내용이 없습니다.</p>',
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            }

            console.log('Saving draft with data:', writingDto)
            
            await api.post('/api/writings', writingDto)
            alert('임시저장되었습니다!')
            
        } catch (error) {
            console.error('임시저장 실패:', error)
            alert(`임시저장에 실패했습니다: ${error.response?.data?.message || error.message}`)
        }
    }

    // 완성하기 모달 열기
    const handleCompleteClick = () => {
        if (!canComplete) {
            alert(`완성하려면 최소 ${COMPLETION_CRITERIA.MIN_WORDS}단어 또는 ${COMPLETION_CRITERIA.MIN_CHARACTERS}글자 이상 작성해야 합니다.`)
            return
        }
        setShowCompletionModal(true)
    }

    // 작품 완성 처리
    const handleComplete = async () => {
        if (!canComplete) {
            alert('완성 조건을 충족하지 않습니다.')
            return
        }

        setIsCompleting(true)
        try {
            // 1. 최종 글 저장
            const writingDto = {
                title: roomData?.title || '제목 없음',
                body: writings[0]?.body || '<p>내용이 없습니다.</p>',
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            }

            console.log('Saving final writing:', writingDto)
            await api.post('/api/writings', writingDto)

            // 2. Content 생성 시도 (API가 있는지 확인 필요)
            try {
                console.log('Attempting to create content...')
                
                // TODO: 백엔드에서 완성 처리 통합 API 구현 시 이 부분 교체
                // const completeResponse = await api.post(`/api/rooms/${roomId}/complete`)
                
                // 임시 방법: Cover를 업데이트하여 contentId 설정
                // 실제로는 백엔드에서 통합 처리 필요
                alert('작품이 임시저장되었습니다. 완성 처리를 위해 백엔드 API 구현이 필요합니다.')
                
            } catch (completeError) {
                console.error('완성 처리 실패:', completeError)
                alert('글은 저장되었지만 완성 처리에 문제가 있었습니다. 관리자에게 문의하세요.')
            }
            
            setShowCompletionModal(false)
            
        } catch (error) {
            console.error('작품 완성 실패:', error)
            alert(`작품 완성에 실패했습니다: ${error.response?.data?.message || error.message}`)
        } finally {
            setIsCompleting(false)
        }
    }

    // 문서방 나가기
    const handleExit = async () => {
        try {
            if (websocketConnected) {
                websocketService.disconnect()
            }
            
            await api.post(`/api/room/exit?arg0=${roomId}`)
            navigate(-1)
        } catch (error) {
            console.error('문서방 나가기 실패:', error)
            // 에러가 발생해도 페이지를 떠남
            navigate(-1)
        }
    }

    // 신고 모달 열기
    const handleReportClick = () => {
        setShowReportModal(true)
    }

    // 신고 제출
    const handleReportSubmit = async (e) => {
        e.preventDefault()
        if (!reportReason.trim()) {
            alert('신고 사유를 입력해주세요.')
            return
        }

        setIsReporting(true)
        try {
            await api.post('/api/reports', {
                title: roomData?.title || '제목 없음',
                depth: 0,
                siblingIndex: 0,
                body: reportReason,
                time: new Date().toISOString()
            })
            alert('신고가 접수되었습니다.')
            setShowReportModal(false)
            setReportReason('')
        } catch (error) {
            console.error('신고 제출 실패:', error)
            alert('신고 제출에 실패했습니다.')
        } finally {
            setIsReporting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">로딩 중...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto bg-white rounded-xl shadow overflow-hidden">
                {/* header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <button
                        onClick={handleExit}
                        className="flex items-center space-x-1 text-zinc-700 hover:text-zinc-900"
                    >
                        <span className="inline-block w-4 h-4 border-b-2 border-l-2 border-zinc-700 rotate-45" />
                        <span>나가기</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="text-xl font-semibold">{roomData?.title || '제목 없음'}</div>
                        <div className="text-sm text-gray-500">
                            상태: {canvasStatus === CANVAS_STATUS.WORKING ? '작업 중' : '완성됨'}
                        </div>
                    </div>
                    <span className="text-base font-medium text-zinc-500">
                        {formatDate(roomData?.time)}
                    </span>
                </div>

                <div className="p-6 space-y-8">
                    {/* 작품 통계 및 상태 표시 */}
                    {isEditing && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">단어 수:</span> {completionStats.wordCount}
                                    {completionStats.wordCount >= COMPLETION_CRITERIA.MIN_WORDS && 
                                        <span className="text-green-600 ml-1">✓</span>
                                    }
                                </div>
                                <div>
                                    <span className="font-medium">글자 수:</span> {completionStats.characterCount}
                                    {completionStats.characterCount >= COMPLETION_CRITERIA.MIN_CHARACTERS && 
                                        <span className="text-green-600 ml-1">✓</span>
                                    }
                                </div>
                                <div>
                                    <span className="font-medium">완성 가능:</span> 
                                    <span className={canComplete ? 'text-green-600' : 'text-red-600'}>
                                        {canComplete ? '예' : '아니오'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* WebSocket 연결 상태 표시 */}
                    {isEditing && (
                        <div className={`p-3 rounded-lg ${websocketConnected ? 'bg-green-50' : 'bg-yellow-50'}`}>
                            <span className={`text-sm ${websocketConnected ? 'text-green-700' : 'text-yellow-700'}`}>
                                {websocketConnected 
                                    ? '실시간 동기화 연결됨' 
                                    : '실시간 동기화 연결 안됨 (로컬에서만 편집됩니다)'
                                }
                            </span>
                        </div>
                    )}

                    {/* 실시간 편집 상태 표시 */}
                    {isEditing && connectedUsers.length > 1 && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="text-sm text-blue-700">
                                {connectedUsers.length}명이 동시에 편집 중입니다
                            </span>
                        </div>
                    )}

                    {/* 본문 에디터 */}
                    <CarouselEditor
                        variants={writings.map(w => w.body || '<p>내용이 없습니다.</p>')}
                        readOnly={!isEditing}
                        onChange={handleLocalEdit}
                    />

                    {/* 신고 버튼 - 편집 모드가 아닐 때만 표시 */}
                    {!isEditing && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleReportClick}
                                className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <img src={ReportIconUrl} alt="report" className="w-5 h-5" />
                                <span className="text-sm font-medium">작품 신고하기</span>
                            </button>
                        </div>
                    )}

                    {/* 액션 버튼들 */}
                    {isEditing && (
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleSave}
                                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 transition rounded-full text-white font-semibold"
                            >
                                임시저장
                            </button>
                            <button
                                onClick={handleCompleteClick}
                                disabled={!canComplete}
                                className={`px-6 py-3 transition rounded-full font-semibold ${
                                    canComplete 
                                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                                }`}
                            >
                                완성하기
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 완성 확인 모달 */}
            {showCompletionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-black">작품 완성</h3>
                            <button
                                onClick={() => setShowCompletionModal(false)}
                                className="text-black hover:bg-gray-200 rounded-full p-1"
                            >✕</button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-700">
                                작품을 완성하시겠습니까? 완성 후에는 수정할 수 없습니다.
                            </p>
                            <div className="text-sm text-gray-500">
                                <p>현재 통계:</p>
                                <p>• 단어 수: {completionStats.wordCount}</p>
                                <p>• 글자 수: {completionStats.characterCount}</p>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowCompletionModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={isCompleting}
                                    className={`
                                        px-4 py-2 rounded-lg font-medium
                                        ${isCompleting
                                            ? 'bg-green-300 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                        }
                                    `}
                                >
                                    {isCompleting ? '완성 중...' : '완성하기'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 신고 모달 */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-black">작품 신고</h3>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="text-black hover:bg-gray-200 rounded-full p-1"
                            >✕</button>
                        </div>
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    신고 사유
                                </label>
                                <textarea
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder="신고 사유를 입력해주세요..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="4"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReportModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isReporting}
                                    className={`
                                        px-4 py-2 rounded-lg font-medium
                                        ${isReporting
                                            ? 'bg-red-300 cursor-not-allowed'
                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                        }
                                    `}
                                >
                                    {isReporting ? '신고 중...' : '신고하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}