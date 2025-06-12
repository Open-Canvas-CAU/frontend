// src/pages/EditorPage.jsx
import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CanvasPage from '@/components/features/editor/CanvasPage'
import { authService } from '@/services/authService'

export default function EditorPage({ isEditing = false }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { roomId } = useParams()
    const isAuthenticated = authService.isAuthenticated()

    const handleEdit = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } })
            return
        }
        navigate(`/editor/${roomId}/edit`)
    }

    if (!roomId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl"></div>
                    <h2 className="text-xl font-semibold text-red-600">잘못된 접근입니다</h2>
                    <p className="text-white-600">Room ID가 제공되지 않았습니다.</p>
                </div>
            </div>
        )
    }

    if (!isEditing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl">📖</div>
                    <h2 className="text-xl font-semibold text-red-600">문서방 보기 모드</h2>
                    <p className="text-white-600">Room ID: {roomId}</p>
                    <button onClick={handleEdit} className="px-4 py-2 bg-red-500 text-white rounded">
                        편집하기
                    </button>
                </div>
            </div>
        )
    }

    return (
        <CanvasPage
            isEditing={isEditing}
            onEdit={handleEdit}
            roomId={roomId}
        />
    )
}
