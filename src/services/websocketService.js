import { Client } from '@stomp/stompjs'
import { authService } from './authService'

/**
 * 웹소켓 연결 및 메시지 전송을 관리하는 서비스 클래스
 * StompJS 클라이언트를 사용하여 서버와 통신
 */
class WebSocketService {
  constructor() {
    this.client = null
    this.subscription = null
    this.roomId = null
    this.messageQueue = []
    this.isConnected = false
  }

  /**
   * WebSocket 서버에 연결
   * @param {string} roomId - 접속할 문서방의 ID
   * @param {object} callbacks - 연결 상태에 따른 콜백 함수들 (onConnect, onMessage 등)
   */
  connect(roomId, callbacks = {}) {
    this.roomId = roomId
    const accessToken = authService.getAccessToken()

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws-stomp',
      connectHeaders: {
        token: accessToken // 'Bearer' 접두사 없이 토큰만 전송
      },
      debug: (str) => {
        console.log('STOMP Debug:', str)
      },
      onConnect: (frame) => {
        console.log('STOMP Connected:', frame)
        this.isConnected = true
        
        this.subscribe(roomId, callbacks.onMessage)
        
        // 연결이 지연된 경우를 대비해 큐에 쌓인 메시지를 전송
        this.flushMessageQueue()
        
        if (callbacks.onConnect) {
          callbacks.onConnect(frame)
        }
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message'])
        this.isConnected = false
        if (callbacks.onError) {
          callbacks.onError(frame)
        }
      },
      onWebSocketClose: () => {
        console.log('WebSocket Closed')
        this.isConnected = false
        if (callbacks.onClose) {
          callbacks.onClose()
        }
      }
    })

    this.client.activate()
  }

  /**
   * 특정 문서방의 메시지를 구독
   * @param {string} roomId - 구독할 문서방의 ID
   * @param {function} onMessage - 메시지 수신 시 호출될 콜백 함수
   */
  subscribe(roomId, onMessage) {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }

    this.subscription = this.client.subscribe(
      `/sub/chat/room/${roomId}`,
      (message) => {
        console.log('Received message:', message.body)
        if (onMessage) {
          try {
            const parsedMessage = JSON.parse(message.body)
            onMessage(parsedMessage)
          } catch (e) {
            console.error('Failed to parse message:', e)
          }
        }
      }
    )
  }

  /**
   * 서버로 메시지를 전송
   * @param {object} message - 전송할 메시지 객체
   */
  sendMessage(message) {
    if (!this.isConnected) {
      this.messageQueue.push(message)
      return
    }

    const messageData = {
      type: message.type || 'EDIT',
      roomId: this.roomId,
      message: message.content,
      num: message.blockNum || '0',
      ...message
    }

    this.client.publish({
      destination: '/pub/chat/message',
      body: JSON.stringify(messageData)
    })
  }
  
  // 큐에 쌓인 메시지를 모두 전송
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.sendMessage(message)
    }
  }

  // 짧은 시간 내에 여러 번 발생하는 편집 이벤트를 모아서 한 번에 전송
  sendThrottledMessage = (() => {
    let timeout = null
    let pendingMessages = new Map()

    return (blockNum, content) => {
      pendingMessages.set(blockNum, content)

      if (timeout) {
        clearTimeout(timeout)
      }

      timeout = setTimeout(() => {
        pendingMessages.forEach((content, blockNum) => {
          this.sendMessage({
            type: 'EDIT',
            blockNum: blockNum.toString(),
            content: content
          })
        })
        pendingMessages.clear()
      }, 2000) // 2초
    }
  })()

  // WebSocket 연결을 해제합니다.
  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe()
      this.subscription = null
    }

    if (this.client) {
      this.client.deactivate()
      this.client = null
    }

    this.isConnected = false
    this.roomId = null
  }
}

export default new WebSocketService()
