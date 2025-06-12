// src/pages/EditorPage.jsx - 수정된 버전
import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CanvasPage from '@/components/features/editor/Canvaspage'
import { authService } from '@/services/authService'

export default function EditorPage({ isEditing = false }) {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()
    const isAuthenticated = authService.isAuthenticated()

    // ⭐ roomId 추출 및 검증
    const roomId = params.roomId
    
    console.log('🔍 EditorPage Debug:')
    console.log('  - Full URL:', window.location.href)
    console.log('  - Pathname:', window.location.pathname)
    console.log('  - Params:', params)
    console.log('  - Extracted roomId:', roomId)
    console.log('  - RoomId type:', typeof roomId)
    console.log('  - IsEditing mode:', isEditing)

    // 수정 모드로 전환 (보기 모드에서 편집 버튼 클릭 시)
    const handleEdit = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location } })
            return
        }
        navigate(`/editor/${roomId}/edit`)
    }

    // ⭐ roomId 없으면 즉시 에러 표시
    if (!roomId || roomId === 'undefined' || roomId === 'null') {
        console.error('❌ roomId가 유효하지 않습니다:', roomId)
        
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl">⚠️</div>
                    <h2 className="text-xl font-semibold text-red-600">
                        잘못된 접근입니다
                    </h2>
                    <div className="text-gray-600 space-y-2">
                        <p>Room ID가 제공되지 않았습니다.</p>
                        <div className="text-xs bg-gray-100 p-2 rounded">
                            <div>Current URL: {window.location.href}</div>
                            <div>Params: {JSON.stringify(params)}</div>
                            <div>RoomId: "{roomId}"</div>
                            <div>IsEditing: {isEditing}</div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            뒤로 가기
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            홈으로
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ✅ 편집 모드가 아닌 경우 (보기 모드 - 현재는 사용되지 않음)
    if (!isEditing) {
        console.log('👀 보기 모드 접근 - 편집하기 버튼 표시')
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-50">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl">📖</div>
                    <h2 className="text-xl font-semibold text-blue-600">
                        문서방 보기 모드
                    </h2>
                    <div className="text-gray-600 space-y-2">
                        <p>Room ID: {roomId}</p>
                        <p>편집을 시작하려면 편집하기 버튼을 클릭하세요.</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            뒤로 가기
                        </button>
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            편집하기
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ✅ 편집 모드 - CanvasPage로 전달 (roomId는 useParams로 받음)
    return (
        <CanvasPage 
            isEditing={isEditing} 
            onEdit={handleEdit}
        />
    )
}