// src/services/websocketService.js - STOMP 클라이언트 방식으로 수정
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { authService } from './authService'
import { WS_BASE_URL } from '@/config'

class WebSocketService {
  constructor() {
    this.stompClient = null
    this.subscription = null
    this.roomId = null
    this.isConnected = false
    this.messageQueue = []
    this.callbacks = {}
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 3
  }

  async connect(roomId, callbacks = {}) {
    try {
      this.roomId = roomId
      this.callbacks = callbacks
      const accessToken = authService.getAccessToken()
      
      console.log('WebSocket 연결 시도...', { roomId, hasToken: !!accessToken })
      
      if (!accessToken) {
        throw new Error('액세스 토큰이 없습니다')
      }

      this.initializeStompConnection(accessToken, callbacks)
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      if (callbacks.onError) {
        callbacks.onError(error)
      }
    }
  }

  async loadStompLibraries() {
    // SockJS가 이미 로드되어 있는지 확인
    if (typeof SockJS === 'undefined') {
      await this.loadScript('https://cdn.jsdelivr.net/npm/sockjs-client/dist/sockjs.min.js')
    }
    
    // STOMP가 이미 로드되어 있는지 확인  
    if (typeof Stomp === 'undefined') {
      await this.loadScript('https://cdn.jsdelivr.net/npm/stompjs/lib/stomp.min.js')
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  initializeStompConnection(accessToken, callbacks) {
    try {
      const wsUrl = WS_BASE_URL.replace('ws://', 'http://').replace('wss://', 'https://')
      const socket = new SockJS(`${wsUrl}/ws-stomp?access_token=${accessToken}`)
      
      console.log('WebSocket 연결 URL:', `${wsUrl}/ws-stomp`)
      
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('STOMP 디버그:', str)
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('STOMP 연결 성공')
          this.isConnected = true
          this.reconnectAttempts = 0
          if (callbacks.onConnect) {
            callbacks.onConnect()
          }
        },
        onStompError: (frame) => {
          console.error('STOMP 에러:', frame)
          if (callbacks.onError) {
            callbacks.onError(frame)
          }
        },
        onWebSocketError: (event) => {
          console.error('WebSocket 에러:', event)
          if (callbacks.onError) {
            callbacks.onError(event)
          }
        }
      })

      this.stompClient.activate()
    } catch (error) {
      console.error('STOMP 초기화 실패:', error)
      if (callbacks.onError) {
        callbacks.onError(error)
      }
    }
  }

  subscribe(roomId, onMessage) {
    if (!this.isConnected || !this.stompClient) {
      console.error('STOMP 클라이언트가 연결되지 않았습니다')
      return
    }

    try {
      const destination = `/sub/chat/room/${roomId}`
      console.log('📡 구독 시작:', destination)
      
      // subscribe 대신 subscribeToDestination 사용
      this.subscription = this.stompClient.subscribe(destination, (message) => {
        try {
          const parsedMessage = JSON.parse(message.body)
          console.log('📨 메시지 수신:', parsedMessage)
          if (onMessage) {
            onMessage(parsedMessage)
          }
        } catch (error) {
          console.error('메시지 파싱 실패:', error)
        }
      })
    } catch (error) {
      console.error('구독 실패:', error)
    }
  }

  sendMessage(message) {
    if (!this.isConnected || !this.stompClient) {
      console.log('메시지 큐에 추가:', message)
      this.messageQueue.push(message)
      return
    }

    try {
      const destination = `/pub/chat/message`
      console.log('메시지 전송:', message)
      
      // send 대신 publish 사용
      this.stompClient.publish({
        destination,
        body: JSON.stringify(message),
        headers: {
          'content-type': 'application/json'
        }
      })
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      // 전송 실패한 메시지는 큐에 추가
      this.messageQueue.push(message)
    }
  }

  // 스로틀된 메시지 전송 (2초 지연)
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
      }, 2000) // 문서에서 언급한 2초 Throttle
    }
  })()

  flushMessageQueue() {
    if (this.messageQueue.length > 0) {
      console.log(` 메시지 큐 비우기: ${this.messageQueue.length}개`)
      
      const messages = [...this.messageQueue]
      this.messageQueue = []
      
      messages.forEach(message => {
        this.sendMessage(message)
      })
    }
  }

  async attemptTokenRefreshAndReconnect() {
    try {
      console.log(' 토큰 갱신 후 재연결 시도...')
      await authService.refreshToken()
      
      // 토큰 갱신 성공 시 재연결
      if (this.roomId && this.callbacks) {
        setTimeout(() => {
          this.connect(this.roomId, this.callbacks)
        }, 1000)
      }
      
    } catch (error) {
      console.error(' 토큰 갱신 실패:', error)
      if (this.callbacks.onError) {
        this.callbacks.onError(new Error('인증 토큰 갱신 실패'))
      }
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(' 최대 재연결 시도 횟수 초과')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * this.reconnectAttempts, 5000)

    console.log(` 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts} (${delay}ms 후)`)

    setTimeout(() => {
      if (this.roomId && this.callbacks) {
        this.connect(this.roomId, this.callbacks)
      }
    }, delay)
  }

  disconnect() {
    console.log(' WebSocket 연결 해제...')

    if (this.subscription) {
      try {
        this.subscription.unsubscribe()
        console.log(' 구독 해제 완료')
      } catch (error) {
        console.warn(' 구독 해제 에러:', error)
      }
      this.subscription = null
    }

    if (this.stompClient) {
      try {
        // 문서 명세에 따른 연결 해제
        this.stompClient.disconnect(() => {
          console.log(' STOMP 연결 해제 완료')
        })
      } catch (error) {
        console.warn(' STOMP 연결 해제 에러:', error)
      }
      this.stompClient = null
    }

    this.isConnected = false
    this.roomId = null
    this.reconnectAttempts = 0
    this.messageQueue = []
    this.callbacks = {}
  }

  // 상태 확인 메서드들
  isConnectedToRoom() {
    return this.isConnected && this.stompClient
  }

  forceReconnect() {
    if (this.roomId && this.callbacks) {
      console.log(' 강제 재연결...')
      this.disconnect()
      setTimeout(() => {
        this.connect(this.roomId, this.callbacks)
      }, 1000)
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      hasStompClient: !!this.stompClient,
      roomId: this.roomId,
      hasSubscription: !!this.subscription,
      queueSize: this.messageQueue.length,
      reconnectAttempts: this.reconnectAttempts
    }
  }
}

export default new WebSocketService()