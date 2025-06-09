import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CarouselEditor from './CarouselEditor.jsx'
import api from '@/services/api'
import websocketService from '@/services/websocketService'
import ReportIconUrl from '@/assets/icons/report.svg'

export default function CanvasPage({ isEditing = false, onEdit, showEditButton = true }) {
    const { docId } = useParams()  // 라우트 파라미터와 일치하도록 변경
    const roomId = docId  // 내부적으로는 roomId로 사용
    const navigate = useNavigate()

    // 상태 관리
    const [roomData, setRoomData] = useState(null)
    const [writings, setWritings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [connectedUsers, setConnectedUsers] = useState([])

    // 신고 모달 상태
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportReason, setReportReason] = useState('')
    const [isReporting, setIsReporting] = useState(false)

    // 문서방 참여 및 WebSocket 연결
    useEffect(() => {
        async function joinRoom() {
            try {
                // 문서방 참여
                const roomResponse = await api.get(`/api/rooms/${roomId}`)
                setRoomData(roomResponse.data)

                // 문서방 글 조회
                const writingsResponse = await api.get(`/api/writings/room/${roomId}`)
                const data = writingsResponse.data
                setWritings(Array.isArray(data) ? data : [])

                // WebSocket 연결
                websocketService.connect(roomId, {
                    onConnect: () => {
                        console.log('WebSocket connected for room:', roomId)
                    },
                    onMessage: (message) => {
                        handleWebSocketMessage(message)
                    },
                    onError: (error) => {
                        console.error('WebSocket error:', error)
                    },
                    onClose: () => {
                        console.log('WebSocket disconnected')
                    }
                })

            } catch (error) {
                console.error('문서방 참여 실패:', error)
                setError('문서방 참여에 실패했습니다.')
            } finally {
                setIsLoading(false)
            }
        }

        if (roomId) {
            joinRoom()
        }

        // Cleanup: WebSocket 연결 해제
        return () => {
            if (roomId) {
                websocketService.disconnect()
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
            copy[idx] = { ...copy[idx], body: html }
            return copy
        })

        // WebSocket으로 편집 내용 전송 (throttled)
        if (isEditing) {
            websocketService.sendThrottledMessage(idx, html)
        }
    }

    // 글 저장
    const handleSave = async () => {
        try {
            // 현재 작성 중인 글 저장
            const writingDto = {
                title: roomData?.title,
                body: writings[0]?.body || '',
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            }

            await api.post('/api/writings', writingDto)
            navigate(`/completed/${roomData?.contentId}`)
        } catch (error) {
            console.error('글 저장 실패:', error)
            alert('글 저장에 실패했습니다.')
        }
    }

    // 문서방 나가기
    const handleExit = async () => {
        try {
            await api.post(`/api/room/exit?arg0=${roomId}`)
            websocketService.disconnect()
            navigate(-1)
        } catch (error) {
            console.error('문서방 나가기 실패:', error)
            alert('문서방 나가기에 실패했습니다.')
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
                title: roomData?.title,
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
                    <div className="text-xl font-semibold">{roomData?.title}</div>
                    <span className="text-base font-medium text-zinc-500">
                        {new Date(roomData?.time).toLocaleString()}
                    </span>
                </div>

                <div className="p-6 space-y-8">
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
                        variants={writings.map(w => w.body)}
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

                    {/* 저장 버튼 */}
                    {isEditing && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 transition rounded-full text-white font-semibold"
                            >
                                저장하기
                            </button>
                        </div>
                    )}
                </div>
            </div>

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