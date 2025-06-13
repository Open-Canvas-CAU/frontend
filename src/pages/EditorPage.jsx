// src/pages/EditorPage.jsx
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CanvasPage from '@/components/features/editor/CanvasPage'
import CanvasViewPage from '@/components/features/editor/CanvasViewPage'
import { authService } from '@/services/authService'
import { roomService } from '@/services/roomService'
import { 
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    ROUTES,
    UI_CONSTANTS
} from '@/types'

export default function EditorPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { roomId } = useParams()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [roomData, setRoomData] = useState(null)

    useEffect(() => {
        const checkRoomAccess = async () => {
            if (!roomId) {
                setError(ERROR_MESSAGES.INVALID_INPUT)
                setIsLoading(false)
                return
            }

            try {
                const room = await roomService.getRoom(roomId)
                setRoomData(room)
                
                // 방 타입에 따라 편집 모드 결정
                if (room.roomType === 'COMPLETE') {
                    setIsEditing(false)
                } else {
                    // 사용자가 인증되어 있고, 방에 참여할 권한이 있는지 확인
                    const isAuthenticated = authService.isAuthenticated()
                    if (!isAuthenticated) {
                        navigate(ROUTES.LOGIN, { 
                            state: { from: ROUTES.EDITOR.EDIT(roomId) }
                        })
                        return
                    }
                    setIsEditing(true)
                }
            } catch (err) {
                setError(err.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR)
            } finally {
                setIsLoading(false)
            }
        }

        checkRoomAccess()
    }, [roomId, navigate])

    const handleEdit = () => {
        if (!authService.isAuthenticated()) {
            navigate(ROUTES.LOGIN, { 
                state: { from: ROUTES.EDITOR.EDIT(roomId) }
            })
            return
        }
        setIsEditing(true)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-red-300/20 border-t-red-300/80 rounded-full animate-spin"></div>
                    <div className="text-xl text-white">로딩 중...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl">⚠️</div>
                    <div className="text-xl text-red-500">{error}</div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
                    >
                        뒤로 가기
                    </button>
                </div>
            </div>
        )
    }

    if (!isEditing) {
        return (
            <div className="min-h-screen bg-black">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-white">{roomData?.title || '문서방'}</h1>
                        <button 
                            onClick={handleEdit} 
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300"
                        >
                            편집하기
                        </button>
                    </div>
                    <CanvasViewPage roomId={roomId} />
                </div>
            </div>
        )
    }

    return <CanvasPage />
}
