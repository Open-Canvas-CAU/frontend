// src/components/features/editor/CanvasPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CarouselEditor from './CarouselEditor'
import api from '@/services/api'
import websocketService from '@/services/websocketService'
import { authService } from '@/services/authService'
import { roomApi } from '@/services/api/roomApi'
import { 
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    ROUTES,
    UI_CONSTANTS,
    WS_CONSTANTS
} from '@/types'

export default function CanvasPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [roomData, setRoomData] = useState(null)
  const [writings, setWritings] = useState([])
  const [savedWritings, setSavedWritings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [wsError, setWsError] = useState(null)

  const safeApiCall = async (fn, errMsg) => {
    try {
      if (!authService.isAuthenticated()) throw new Error(ERROR_MESSAGES.AUTH_REQUIRED)
      return await fn()
    } catch (err) {
      if (err.response?.status === 401 || err.message.includes(ERROR_MESSAGES.AUTH_REQUIRED)) {
        authService.logout()
        navigate(ROUTES.LOGIN, { state: { from: ROUTES.EDITOR.EDIT(roomId) } })
        return null
      }
      console.error(`${errMsg}:`, err)
      throw err
    }
  }

  useEffect(() => {
    if (!roomId) {
      navigate(-1)
      return
    }
    const load = async () => {
      setIsLoading(true)
      try {
        // 방 정보 조회
        const roomRes = await safeApiCall(
          () => api.get(`/api/rooms/${roomId}`),
          '문서방 조회 실패'
        )
        if (!roomRes) return
        const dto = roomRes.data
        setRoomData(dto)

        // 저장된 글 버전(배열) 안전하게 추출
        const versions = Array.isArray(dto.writingDtos) ? dto.writingDtos : []
        setSavedWritings(versions)
        setWritings(
          versions.length > 0
            ? [{ body: versions[0].body }]
            : [{ body: '<p>새 이야기를 시작하세요...</p>' }]
        )

        // WebSocket 연결
        websocketService.connect(roomId, {
          onConnect: () => { setWsConnected(true); setWsError(null) },
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
          onError: err => { setWsConnected(false); setWsError(err.message) }
        })
      } catch (err) {
        setError(err.response?.data?.message || err.message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
    return () => websocketService.disconnect()
  }, [roomId, navigate])

  const handleLocalEdit = (index, html) => {
    setWritings(prev =>
      prev.map((w, i) => (i === index ? { ...w, body: html } : w))
    )
    if (wsConnected) websocketService.sendThrottledMessage(index, html)
  }

  const handleSaveAndExit = async () => {
    try {
      await safeApiCall(
        () => roomApi.exit(roomId),
        ERROR_MESSAGES.ROOM_EXIT_FAILED
      );
      alert(SUCCESS_MESSAGES.ROOM_EXITED);
      navigate(ROUTES.HOME);
    } catch (err) {
      alert(ERROR_MESSAGES.SERVER_ERROR);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-red-300/20 border-t-red-300/80 rounded-full animate-spin"></div>
          <div className="text-xl text-white">로딩 중...</div>
        </div>
      </div>
    );
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
    );
  }

  return (
    <div className="min-h-screen bg-black rounded-2xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <button
          onClick={() => navigate(-1)}
          className="text-zinc-700"
        >
          ← 나가기
        </button>
        <div className="text-center">
          <div className="text-xl font-semibold">{roomData.title}</div>
          <div className="text-sm text-white-500">Room: {roomId}</div>
        </div>
        <div className="text-sm">
          {wsConnected
            ? ' 실시간 연결됨'
            : wsError
            ? ` ${wsError}`
            : ' 연결중...'}
        </div>
      </div>
      <div className="p-6 space-y-6">
        <CarouselEditor
          variants={writings.map(w => w.body)}
          readOnly={false}
          onChange={handleLocalEdit}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSaveAndExit}
            className="px-6 py-3 bg-black-500 text-white rounded-full"
          >
            저장 후 퇴장
          </button>
        </div>
      </div>
    </div>
  )
}
