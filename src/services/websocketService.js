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
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 3
    this.callbacks = {}
  }

  /**
   * WebSocket 서버에 연결
   * @param {string} roomId - 접속할 문서방의 ID
   * @param {object} callbacks - 연결 상태에 따른 콜백 함수들 (onConnect, onMessage 등)
   */
  connect(roomId, callbacks = {}) {
    this.roomId = roomId
    this.callbacks = callbacks
    const accessToken = authService.getAccessToken()

    // 이미 연결되어 있다면 해제하고 다시 연결
    if (this.client && this.client.connected) {
      this.disconnect()
    }

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws-stomp',
      connectHeaders: {
        token: accessToken // 'Bearer' 접두사 없이 토큰만 전송
      },
      debug: (str) => {
        console.log('STOMP Debug:', str)
      },
      // 재연결 설정
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log('STOMP Connected:', frame)
        this.isConnected = true
        this.reconnectAttempts = 0
        
        this.subscribe(roomId, callbacks.onMessage)
        
        // 연결이 지연된 경우를 대비해 큐에 쌓인 메시지를 전송
        this.flushMessageQueue()
        
        if (callbacks.onConnect) {
          callbacks.onConnect(frame)
        }
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message'])
        console.error('Error details:', frame.body)
        this.isConnected = false
        
        if (callbacks.onError) {
          callbacks.onError(frame)
        }
        
        // 최대 재연결 시도 횟수 초과시 포기
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached. Giving up.')
          return
        }
        
        this.reconnectAttempts++
      },
      onWebSocketClose: (event) => {
        console.log('WebSocket Closed:', event)
        this.isConnected = false
        
        if (callbacks.onClose) {
          callbacks.onClose()
        }
      },
      onWebSocketError: (event) => {
        console.error('WebSocket Error:', event)
        this.isConnected = false
        
        if (callbacks.onError) {
          callbacks.onError(event)
        }
      }
    })

    try {
      this.client.activate()
    } catch (error) {
      console.error('Failed to activate WebSocket client:', error)
      if (callbacks.onError) {
        callbacks.onError(error)
      }
    }
  }

  /**
   * 특정 문서방의 메시지를 구독
   * @param {string} roomId - 구독할 문서방의 ID
   * @param {function} onMessage - 메시지 수신 시 호출될 콜백 함수
   */
  subscribe(roomId, onMessage) {
    if (!this.client || !this.client.connected) {
      console.warn('Cannot subscribe: STOMP client is not connected')
      return
    }

    if (this.subscription) {
      this.subscription.unsubscribe()
    }

    try {
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
              console.error('Raw message:', message.body)
            }
          }
        }
      )
      console.log('Successfully subscribed to room:', roomId)
    } catch (error) {
      console.error('Failed to subscribe:', error)
    }
  }

  /**
   * 서버로 메시지를 전송
   * @param {object} message - 전송할 메시지 객체
   */
  sendMessage(message) {
    if (!this.isConnected) {
      console.log('WebSocket not connected, queuing message:', message)
      this.messageQueue.push(message)
      return
    }

    if (!this.client || !this.client.connected) {
      console.warn('Cannot send message: STOMP client is not connected')
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

    try {
      this.client.publish({
        destination: '/pub/chat/message',
        body: JSON.stringify(messageData)
      })
      console.log('Message sent:', messageData)
    } catch (error) {
      console.error('Failed to send message:', error)
      // 전송 실패시 큐에 다시 추가
      this.messageQueue.push(message)
    }
  }
  
  // 큐에 쌓인 메시지를 모두 전송
  flushMessageQueue() {
    console.log('Flushing message queue, count:', this.messageQueue.length)
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
    console.log('Disconnecting WebSocket...')
    
    if (this.subscription) {
      try {
        this.subscription.unsubscribe()
      } catch (error) {
        console.warn('Error unsubscribing:', error)
      }
      this.subscription = null
    }

    if (this.client) {
      try {
        if (this.client.connected) {
          this.client.deactivate()
        }
      } catch (error) {
        console.warn('Error deactivating client:', error)
      }
      this.client = null
    }

    this.isConnected = false
    this.roomId = null
    this.reconnectAttempts = 0
    this.messageQueue = []
    this.callbacks = {}
    
    console.log('WebSocket disconnected successfully')
  }

  // 연결 상태 확인
  isConnectedToRoom() {
    return this.isConnected && this.client && this.client.connected
  }

  // 강제 재연결
  forceReconnect() {
    if (this.roomId && this.callbacks) {
      console.log('Force reconnecting...')
      this.disconnect()
      setTimeout(() => {
        this.connect(this.roomId, this.callbacks)
      }, 1000)
    }
  }
}

export default new WebSocketService()