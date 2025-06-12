// src/components/features/editor/ChatRoom.jsx
import React, { useState, useEffect, useRef } from 'react'
import { authService } from '@/services/authService'
import websocketService from '@/services/websocketService'

export default function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const currentUser = authService.getCurrentUser()
  const messagesEndRef = useRef(null)

  // 메시지 목록의 끝으로 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 컴포넌트 마운트 시 웹소켓 연결
  useEffect(() => {
    if (!roomId) {
      setError('채팅방 ID가 없습니다.')
      return
    }

    console.log(` ChatRoom: ${roomId}에 연결 시도...`)

    websocketService.connect(roomId, {
      onConnect: (frame) => {
        console.log(' ChatRoom: WebSocket 연결 성공', frame)
        setIsConnected(true)
        setError(null)
        // 연결 성공 시, 이전 채팅 내역을 불러오는 로직을 추가할 수 있습니다.
        // 예: api.get(`/api/chat/history/${roomId}`).then(res => setMessages(res.data));
      },
      onMessage: (receivedMessage) => {
        console.log(' ChatRoom: 새 메시지 수신', receivedMessage)
        setMessages((prevMessages) => [...prevMessages, receivedMessage])
      },
      onError: (err) => {
        console.error(' ChatRoom: WebSocket 연결 오류', err)
        setError('채팅 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
        setIsConnected(false)
      },
    })

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      console.log('🧹 ChatRoom: WebSocket 연결 해제 중...')
      websocketService.disconnect()
    }
  }, [roomId])

  // 메시지 전송 핸들러
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim() && isConnected) {
      const messageData = {
        type: 'TALK', // 일반 채팅 메시지 타입
        roomId: roomId,
        message: newMessage,
        // sender 정보는 백엔드에서 토큰을 통해 처리
      }
      
      // websocketService를 통해 메시지 전송
      websocketService.sendMessage(messageData)
      setNewMessage('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-black/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 border-b bg-black-50/50">
        <h3 className="text-lg font-semibold text-white-800 text-center">
          {isConnected ? ' 실시간 채팅' : ' 연결 중...'}
        </h3>
        {error && <div className="text-center text-xs text-red-500 mt-1">{error}</div>}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.username === currentUser?.email ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* 상대방 메시지 */}
            {msg.username !== currentUser?.email && (
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: msg.color || '#657b83' }}
              >
                {msg.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            
            {/* 메시지 버블 */}
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                msg.username === currentUser?.email
                  ? 'bg-red-500 text-white'
                  : 'bg-black-200 text-white-800'
              }`}
            >
              <p className="text-sm">{msg.message}</p>
              <div className={`text-xs mt-1.5 opacity-70 ${
                msg.username === currentUser?.email ? 'text-right' : 'text-left'
              }`}>
                <span>{msg.username?.split('@')[0]}</span>
                <span className="mx-1">•</span>
                <span>{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* 내 메시지 (아바타 없음) */}
            {msg.username === currentUser?.email && (
              <div className="w-8 h-8 flex-shrink-0"></div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 폼 */}
      <div className="p-4 border-t bg-black-50/50">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? '메시지를 입력하세요...' : '연결을 기다리는 중...'}
            disabled={!isConnected}
            className="flex-1 px-4 py-2 bg-black border border-white-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 disabled:bg-black-400 transition-colors"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  )
}