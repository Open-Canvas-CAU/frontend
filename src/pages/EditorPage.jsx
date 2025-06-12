import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CanvasPage from '@/components/features/editor/Canvaspage'
import { authService } from '@/services/authService'

export default function EditorPage({ isEditing = false }) {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()
    const isAuthenticated = authService.isAuthenticated()

    // URL 파라미터에서 roomId 추출
    const roomId = params.roomId
    
    console.log('📍 EditorPage params:', params)
    console.log('📍 roomId:', roomId)
    console.log('📍 isEditing:', isEditing)

    // 수정 모드로 전환
    const handleEdit = () => {
        if (!isAuthenticated) {
            // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
            navigate('/login', { state: { from: location } })
            return
        }
        // 로그인한 경우 수정 모드로 전환
        navigate(`/editor/${roomId}/edit`)
    }

    // roomId가 없으면 오류 표시
    if (!roomId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">
                        잘못된 접근입니다
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Room ID가 제공되지 않았습니다.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        뒤로 가기
                    </button>
                </div>
            </div>
        )
    }

    return (
        <CanvasPage 
            isEditing={isEditing} 
            onEdit={handleEdit}
            showEditButton={!isEditing} // 보기 모드일 때만 수정 버튼 표시
        />
    )
}