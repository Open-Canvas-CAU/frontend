import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EditorSection from './EditorSection'
import api from '@/services/api'
import { authService } from '@/services/authService'
import VersionTree from './VersionTree' // 이제 뷰어에 버전 트리 추가

export default function CanvasViewPage() {
    const { coverId } = useParams()
    const navigate = useNavigate()

    const [coverData, setCoverData] = useState(null)
    const [writings, setWritings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isJoiningRoom, setIsJoiningRoom] = useState(false)
    const [showVersions, setShowVersions] = useState(false)
    const [savedWritings, setSavedWritings] = useState([])

    useEffect(() => {
        const fetchCanvasData = async () => {
            if (!coverId) {
                setError('잘못된 접근입니다. Cover ID가 없습니다.')
                setIsLoading(false); return
            }
            try {
                setIsLoading(true)
                const coverRes = await api.get('/api/covers/check', { params: { coverId } })
                const cover = coverRes.data
                setCoverData(cover)
                let items = []
                if (cover.roomId) {
                    const roomRes = await api.get(`/api/rooms/${cover.roomId}`)
                    items = roomRes.data.writingDtos || []
                    setSavedWritings(roomRes.data.writingDtos || [])
                }
                if (cover.contentId) {
                    const contentRes = await api.get(`/api/contents/${cover.id}`)
                    items = [{ body: contentRes.data.body }]
                }
                if (items.length === 0) items = [{ body: '<p>아직 시작되지 않았습니다.</p>' }]
                setWritings(items)
            } catch (err) {
                setError(err.response?.data?.message || err.message)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCanvasData()
    }, [coverId])

    const handleStartEditing = async () => {
        if (!authService.isAuthenticated()) return navigate('/login', { state: { from: `/canvas/${coverId}` } })
        setIsJoiningRoom(true)
        try {
            let roomId = coverData.roomId
            if (!roomId) {
                const initial = { title: coverData.title, body: '<p>새 이야기...</p>', depth: 0, siblingIndex: 0, time: new Date().toISOString() }
                const roomRes = await api.post('/api/rooms/create', initial)
                roomId = roomRes.data.roomId
            } else {
                await api.get(`/api/rooms/${roomId}`)
            }
            navigate(`/editor/${roomId}/edit`)
        } catch (err) {
            alert('편집 진입 실패: '+(err.response?.data?.message||err.message))
        } finally { setIsJoiningRoom(false) }
    }

    const handleViewCompleted = () => navigate(`/completed/${coverId}`)

    if (isLoading) return <div>로딩 중...</div>
    if (error) return <div className="text-red-500">오류: {error}</div>

    return (
        <div className="min-h-screen bg-black rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <button onClick={()=>navigate(-1)} className="text-zinc-700">← 나가기</button>
                <div className="text-center">
                    <div className="text-xl font-semibold">{coverData.title}</div>
                    <div className="text-sm text-white-500">RoomType: {coverData.roomType}</div>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={()=>setShowVersions(!showVersions)} className="px-4 py-2 bg-black-100 rounded">📊 버전 기록</button>
                </div>
            </div>
            <div className="p-6">
                <EditorSection content={writings[0].body} readOnly className="min-h-[300px] prose" />
                {!coverData.contentId && <button onClick={handleStartEditing} disabled={isJoiningRoom} className="mt-4 px-6 py-3 bg-red-500 text-white rounded">✏️ 편집하기</button>}
                {coverData.contentId && <button onClick={handleViewCompleted} className="mt-4 px-6 py-3 bg-green-500 text-white rounded">🎨 완성작 보기</button>}
            </div>
            {showVersions && (
                <div className="fixed right-0 top-0 w-80 h-full bg-black shadow-2xl z-40">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">버전 기록</h3>
                            <button onClick={()=>setShowVersions(false)} className="w-6 h-6">✕</button>
                        </div>
                        {savedWritings.length>0 ? <VersionTree writings={savedWritings} onNodeClick={() => {}} currentVersion={null}/> : <p className="text-white-500">버전 기록이 없습니다.</p>}
                    </div>
                </div>
            )}
        </div>
    )
}
