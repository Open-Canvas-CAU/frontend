import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CanvasPage from '@/components/features/editor/Canvaspage'
import { authService } from '@/services/authService'

export default function EditorPage({ isEditing = false }) {
    const location = useLocation()
    const navigate = useNavigate()
    const isAuthenticated = authService.isAuthenticated()

    // 수정 모드로 전환
    const handleEdit = () => {
        if (!isAuthenticated) {
            // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
            navigate('/login', { state: { from: location } })
            return
        }
        // 로그인한 경우 수정 모드로 전환
        navigate(`/editor/${location.pathname.split('/').pop()}/edit`)
    }

    return (
        <CanvasPage 
            isEditing={isEditing} 
            onEdit={handleEdit}
            showEditButton={!isEditing} // 보기 모드일 때만 수정 버튼 표시
        />
    )
}
