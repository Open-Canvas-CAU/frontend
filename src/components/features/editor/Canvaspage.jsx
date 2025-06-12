// src/components/features/editor/CanvasPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CarouselEditor from './CarouselEditor'
import VersionTree from './VersionTree' // 기존 VersionTree 컴포넌트 가져오기
import api from '@/services/api'
import websocketService from '@/services/websocketService'
import { authService } from '@/services/authService'

export default function CanvasPage({ isEditing = false }) {
  const { roomId } = useParams()
  const navigate = useNavigate()

  // API + 에디터 상태
  const [roomData, setRoomData] = useState(null)
  const [writings, setWritings] = useState([])
  const [savedWritings, setSavedWritings] = useState([]) // 저장된 버전들 (CompletedCanvasPage와 동일)
  const [currentWriting, setCurrentWriting] = useState(null) // 현재 선택된 버전
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // UI 상태 (CompletedCanvasPage와 동일)
  const [showVersions, setShowVersions] = useState(false)

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

  // --- 버전 노드 클릭 핸들러 (CompletedCanvasPage와 동일)
  const handleVersionNodeClick = (versionData) => {
    if (versionData && versionData.data) {
      setCurrentWriting(versionData.data)
      // 선택된 버전으로 에디터 내용 업데이트
      setWritings([{ body: versionData.data.body }])
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

        // 기존 CompletedCanvasPage와 동일한 방식으로 writings 가져오기
        const wrRes = await safeApiCall(
          () => api.get(`/api/writings/room/${roomId}`),
          '글 조회 실패'
        )
        if (!wrRes) return
        
        const writingsData = Array.isArray(wrRes.data) ? wrRes.data : []
        setSavedWritings(writingsData) // 버전 트리용
        
        if (writingsData.length > 0) {
          setCurrentWriting(writingsData[0])
          setWritings([{ body: writingsData[0].body }])
        } else {
          setWritings([{ body: '<p>새 이야기를 시작하세요...</p>' }])
        }

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
        siblingIndex: savedWritings.length, // 새 버전 번호
        time: new Date().toISOString(),
        roomId,
      }
      await safeApiCall(() => api.post('/api/writings', dto), '저장 실패')
      alert('저장되었습니다')
      
      // 저장 후 버전 목록 새로고침
      const wrRes = await safeApiCall(
        () => api.get(`/api/writings/room/${roomId}`),
        '글 조회 실패'
      )
      if (wrRes) {
        setSavedWritings(Array.isArray(wrRes.data) ? wrRes.data : [])
      }
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
          <div className="text-xl font-semibold">{roomData?.title}</div>
          <div className="text-sm text-gray-500">Room: {roomId}</div>
        </div>
        <div className="flex items-center space-x-3">
          {/* 버전 보기 버튼 (CompletedCanvasPage와 동일) */}
          <button
            onClick={() => setShowVersions(!showVersions)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              showVersions 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📊 버전 기록
          </button>
          
          <div className="text-sm">
            {wsConnected
              ? '✅ 실시간 연결됨'
              : wsError
              ? `❌ ${wsError}`
              : '🔄 연결중...'}
          </div>
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

      {/* 버전 트리 사이드바 (CompletedCanvasPage에서 그대로 가져옴) */}
      {showVersions && (
        <div className="fixed right-0 top-0 w-80 h-full bg-white/95 backdrop-blur-sm border-l border-white/50 shadow-2xl z-40">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">버전 기록</h3>
              <button
                onClick={() => setShowVersions(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {savedWritings && savedWritings.length > 0 ? (
              <VersionTree
                writings={savedWritings}
                onNodeClick={handleVersionNodeClick}
                currentVersion={currentWriting}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-2xl mb-2">📊</div>
                <p>버전 기록이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}