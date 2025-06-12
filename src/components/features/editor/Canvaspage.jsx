// src/components/features/editor/CanvasPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CarouselEditor from './CarouselEditor'
import api from '@/services/api'
import websocketService from '@/services/websocketService'
import { authService } from '@/services/authService'

// 최소 완성 기준(단어, 글자 수)
const COMPLETION_CRITERIA = {
  MIN_WORDS: 100,
  MIN_CHARACTERS: 500,
}

export default function CanvasPage({ isEditing = false }) {
  const { roomId } = useParams()
  const navigate = useNavigate()

  // API + 에디터 상태
  const [roomData, setRoomData] = useState(null)
  const [writings, setWritings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // WebSocket 연결 상태
  const [wsConnected, setWsConnected] = useState(false)
  const [wsError, setWsError] = useState(null)

  // --- 헬퍼: 안전한 API 호출 (401 처리)
  const safeApiCall = async (fn, errMsg) => {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('로그인 필요')
      }
      return await fn()
    } catch (err) {
      if (err.response?.status === 401 || err.message.includes('로그인')) {
        authService.logout()
        navigate('/login', { state: { from: `/editor/${roomId}` } })
        return null
      }
      console.error(`❌ ${errMsg}`, err)
      throw err
    }
  }

  // --- 초기 데이터 로드 & 소켓 연결
  useEffect(() => {
    if (!roomId || !isEditing) {
      navigate(-1)
      return
    }

    const load = async () => {
      setIsLoading(true)
      try {
        const roomRes = await safeApiCall(
          () => api.get(`/api/rooms/${roomId}`),
          '문서방 조회 실패'
        )
        if (!roomRes) return
        setRoomData(roomRes.data)

        const wrRes = await safeApiCall(
          () => api.get(`/api/writings/room/${roomId}`),
          '글 조회 실패'
        )
        if (!wrRes) return
        setWritings(
          Array.isArray(wrRes.data) && wrRes.data.length
            ? wrRes.data
            : [{ body: '<p>새 이야기를 시작하세요...</p>' }]
        )

        // WebSocket 연결
        websocketService.connect(roomId, {
          onConnect: () => {
            setWsConnected(true)
            setWsError(null)
          },
          onMessage: msg => {
            if (msg.type === 'EDIT') {
              const idx = Number(msg.blockNum)
              setWritings(prev =>
                prev.map((w, i) =>
                  i === idx ? { ...w, body: msg.content } : w
                )
              )
            }
          },
          onError: err => {
            setWsConnected(false)
            setWsError(err.message || 'WebSocket 오류')
          }
        })
      } catch (err) {
        setError(err.response?.data?.message || err.message)
      } finally {
        setIsLoading(false)
      }
    }

    load()

    return () => {
      websocketService.disconnect()
    }
  }, [roomId, isEditing])

  // --- 로컬 편집 시
  const handleLocalEdit = (index, html) => {
    setWritings(prev =>
      prev.map((w, i) => (i === index ? { ...w, body: html } : w))
    )
    if (wsConnected) {
      websocketService.sendThrottledMessage(index, html)
    }
  }

  // --- 임시 저장
  const handleSave = async () => {
    try {
      const dto = {
        title: roomData.title || '제목 없음',
        body: writings[0].body,
        depth: 0,
        siblingIndex: 0,
        time: new Date().toISOString(),
        roomId,
      }
      await safeApiCall(() => api.post('/api/writings', dto), '저장 실패')
      alert('저장되었습니다')
    } catch {
      alert('저장에 실패했습니다')
    }
  }

  // --- 렌더링
  if (isLoading) return <div className="p-8 text-center">로딩 중...</div>
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        오류: {error}
        <br />
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          뒤로
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <button onClick={() => navigate(-1)} className="text-zinc-700 hover:text-zinc-900">
          ← 나가기
        </button>
        <div className="text-center">
          <div className="text-xl font-semibold">{roomData.title}</div>
          <div className="text-sm text-gray-500">Room: {roomId}</div>
        </div>
        <div className="text-sm">
          {wsConnected
            ? '✅ 실시간 연결됨'
            : wsError
            ? `❌ ${wsError}`
            : '🔄 연결중...'}
        </div>
      </div>

      {/* Editor */}
      <div className="p-6 space-y-6">
        <CarouselEditor
          variants={writings.map(w => w.body)}
          readOnly={false}
          onChange={handleLocalEdit}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-full"
          >
            임시저장
          </button>
        </div>
      </div>
    </div>
  )
}
