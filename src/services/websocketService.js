// src/services/websocketService.js - STOMP 클라이언트 방식으로 수정
import { authService } from './authService'

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

  connect(roomId, callbacks = {}) {
    this.roomId = roomId
    this.callbacks = callbacks
    const accessToken = authService.getAccessToken()

    console.log('🔌 WebSocket 연결 시도...', { roomId, hasToken: !!accessToken })

    if (!accessToken) {
      console.error('❌ 액세스 토큰이 없습니다')
      if (callbacks.onError) {
        callbacks.onError(new Error('인증 토큰이 없습니다'))
      }
      return
    }

    // 기존 연결 해제
    if (this.stompClient) {
      this.disconnect()
    }

    try {
      // SockJS와 STOMP 라이브러리 동적 로드 (CDN에서)
      this.loadStompLibraries().then(() => {
        this.initializeStompConnection(accessToken, callbacks)
      }).catch(error => {
        console.error('❌ STOMP 라이브러리 로드 실패:', error)
        if (callbacks.onError) {
          callbacks.onError(error)
        }
      })

    } catch (error) {
      console.error('❌ WebSocket 연결 초기화 실패:', error)
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
      // SockJS 소켓 생성
      const socket = new SockJS("http://localhost:8080/ws-stomp")
      
      // STOMP 클라이언트 생성
      this.stompClient = Stomp.over(socket)
      
      // STOMP 디버그 비활성화 (프로덕션에서는)
      // this.stompClient.debug = null

      console.log('🚀 STOMP 연결 시작...')

      // 연결 시도 (문서 명세에 따라 token 헤더 사용, Bearer 없이)
      this.stompClient.connect(
        { token: accessToken }, // ⬅️ 문서 명세대로 Bearer 없이 토큰만
        (frame) => {
          console.log('✅ STOMP 연결 성공:', frame)
          this.isConnected = true
          this.reconnectAttempts = 0

          // 구독 설정
          this.subscribe(this.roomId, callbacks.onMessage)
          
          // 큐에 쌓인 메시지 전송
          this.flushMessageQueue()

          if (callbacks.onConnect) {
            callbacks.onConnect(frame)
          }
        },
        (error) => {
          console.error('❌ STOMP 연결 실패:', error)
          this.isConnected = false

          if (callbacks.onError) {
            callbacks.onError(error)
          }

          // 토큰 만료 등의 인증 에러인 경우 토큰 갱신 시도
          if (error.headers && (
            error.headers.message?.includes('Unauthorized') ||
            error.headers.message?.includes('Authentication') ||
            error.headers.message?.includes('401')
          )) {
            console.log('🔄 토큰 갱신 후 재연결 시도...')
            this.attemptTokenRefreshAndReconnect()
          } else {
            // 기타 에러의 경우 일반적인 재연결
            this.attemptReconnect()
          }
        }
      )

    } catch (error) {
      console.error('❌ STOMP 초기화 실패:', error)
      if (callbacks.onError) {
        callbacks.onError(error)
      }
    }
  }

  subscribe(roomId, onMessage) {
    if (!this.stompClient || !this.isConnected) {
      console.warn('⚠️ 구독 불가: STOMP 클라이언트가 연결되지 않음')
      return
    }

    try {
      const destination = `/sub/chat/room/${roomId}`
      console.log('📡 구독 시작:', destination)

      // 기존 구독 해제
      if (this.subscription) {
        this.subscription.unsubscribe()
      }

      // 새 구독 생성 (문서 명세에 따라)
      this.subscription = this.stompClient.subscribe(destination, (message) => {
        console.log('📨 메시지 수신:', message.body)
        
        if (onMessage) {
          try {
            const parsedMessage = JSON.parse(message.body)
            onMessage(parsedMessage)
          } catch (e) {
            console.error('❌ 메시지 파싱 실패:', e)
            console.error('원본 메시지:', message.body)
          }
        }
      })

      console.log('✅ 구독 성공:', roomId)

    } catch (error) {
      console.error('❌ 구독 실패:', error)
      throw error
    }
  }

  sendMessage(messageData) {
    if (!this.isConnected || !this.stompClient) {
      console.log('📤 WebSocket 미연결, 메시지 큐에 추가')
      this.messageQueue.push(messageData)
      return
    }

    try {
      // 문서 명세에 따른 메시지 형식
      const message = {
        type: messageData.type || "EDIT",
        roomId: this.roomId,
        message: messageData.content || messageData.message,
        num: messageData.blockNum || messageData.num || "0",
        ...messageData
      }

      console.log('📤 메시지 전송:', message)

      // 문서 명세에 따라 /pub/chat/message로 전송
      this.stompClient.send("/pub/chat/message", {}, JSON.stringify(message))
      
      console.log('✅ 메시지 전송 완료')

    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error)
      this.messageQueue.push(messageData)
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
      console.log(`📦 메시지 큐 비우기: ${this.messageQueue.length}개`)
      
      const messages = [...this.messageQueue]
      this.messageQueue = []
      
      messages.forEach(message => {
        this.sendMessage(message)
      })
    }
  }

  async attemptTokenRefreshAndReconnect() {
    try {
      console.log('🔄 토큰 갱신 후 재연결 시도...')
      await authService.refreshToken()
      
      // 토큰 갱신 성공 시 재연결
      if (this.roomId && this.callbacks) {
        setTimeout(() => {
          this.connect(this.roomId, this.callbacks)
        }, 1000)
      }
      
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error)
      if (this.callbacks.onError) {
        this.callbacks.onError(new Error('인증 토큰 갱신 실패'))
      }
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ 최대 재연결 시도 횟수 초과')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * this.reconnectAttempts, 5000)

    console.log(`🔄 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts} (${delay}ms 후)`)

    setTimeout(() => {
      if (this.roomId && this.callbacks) {
        this.connect(this.roomId, this.callbacks)
      }
    }, delay)
  }

  disconnect() {
    console.log('🔌 WebSocket 연결 해제...')

    if (this.subscription) {
      try {
        this.subscription.unsubscribe()
        console.log('✅ 구독 해제 완료')
      } catch (error) {
        console.warn('⚠️ 구독 해제 에러:', error)
      }
      this.subscription = null
    }

    if (this.stompClient) {
      try {
        // 문서 명세에 따른 연결 해제
        this.stompClient.disconnect(() => {
          console.log('✅ STOMP 연결 해제 완료')
        })
      } catch (error) {
        console.warn('⚠️ STOMP 연결 해제 에러:', error)
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
      console.log('🔄 강제 재연결...')
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