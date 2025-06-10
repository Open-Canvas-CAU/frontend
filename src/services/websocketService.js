// src/services/websocketService.js - 수정된 버전
import { Client } from '@stomp/stompjs'
import { authService } from './authService'

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
    this.connectionTimeout = null
  }

  connect(roomId, callbacks = {}) {
    this.roomId = roomId
    this.callbacks = callbacks
    const accessToken = authService.getAccessToken()

    console.log('Attempting WebSocket connection...', { roomId, hasToken: !!accessToken })

    // 토큰이 없으면 연결하지 않음
    if (!accessToken) {
      console.error('No access token available for WebSocket connection')
      if (callbacks.onError) {
        callbacks.onError(new Error('인증 토큰이 없습니다'))
      }
      return
    }

    // 이미 연결되어 있다면 해제하고 다시 연결
    if (this.client && this.client.connected) {
      this.disconnect()
    }

    // 연결 타임아웃 설정
    this.connectionTimeout = setTimeout(() => {
      console.error('WebSocket connection timeout')
      if (this.client && !this.client.connected) {
        this.client.deactivate()
        if (callbacks.onError) {
          callbacks.onError(new Error('연결 시간 초과'))
        }
      }
    }, 10000) // 10초 타임아웃

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws-stomp',
      connectHeaders: {
        token: accessToken // Bearer 접두사 없이 토큰만 전송
      },
      debug: (str) => {
        console.log('STOMP Debug:', str)
      },
      // 재연결 비활성화 (수동으로 관리)
      reconnectDelay: 0,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      
      onConnect: (frame) => {
        console.log('✅ STOMP Connected successfully:', frame)
        this.isConnected = true
        this.reconnectAttempts = 0
        
        // 연결 타임아웃 클리어
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout)
          this.connectionTimeout = null
        }
        
        // 구독 설정
        try {
          this.subscribe(roomId, callbacks.onMessage)
          console.log('✅ Subscription successful')
        } catch (subError) {
          console.error('❌ Subscription failed:', subError)
        }
        
        // 큐에 쌓인 메시지 전송
        this.flushMessageQueue()
        
        if (callbacks.onConnect) {
          callbacks.onConnect(frame)
        }
      },
      
      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame)
        console.error('Error headers:', frame.headers)
        console.error('Error body:', frame.body)
        this.isConnected = false
        
        // 연결 타임아웃 클리어
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout)
          this.connectionTimeout = null
        }
        
        if (callbacks.onError) {
          callbacks.onError(frame)
        }
        
        // 토큰 만료일 가능성이 있는 경우 재시도하지 않음
        if (frame.headers.message && frame.headers.message.includes('Unauthorized')) {
          console.error('❌ Unauthorized - token may be expired')
          return
        }
        
        // 재연결 시도
        this.attemptReconnect()
      },
      
      onWebSocketClose: (event) => {
        console.log('🔌 WebSocket Closed:', event)
        this.isConnected = false
        
        // 연결 타임아웃 클리어
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout)
          this.connectionTimeout = null
        }
        
        if (callbacks.onClose) {
          callbacks.onClose()
        }
        
        // 정상적인 종료가 아닌 경우 재연결 시도
        if (event.code !== 1000) {
          this.attemptReconnect()
        }
      },
      
      onWebSocketError: (event) => {
        console.error('❌ WebSocket Error:', event)
        this.isConnected = false
        
        // 연결 타임아웃 클리어
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout)
          this.connectionTimeout = null
        }
        
        if (callbacks.onError) {
          callbacks.onError(event)
        }
        
        this.attemptReconnect()
      }
    })

    try {
      console.log('🚀 Activating WebSocket client...')
      this.client.activate()
    } catch (error) {
      console.error('❌ Failed to activate WebSocket client:', error)
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout)
        this.connectionTimeout = null
      }
      if (callbacks.onError) {
        callbacks.onError(error)
      }
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Giving up.')
      return
    }
    
    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)
    
    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms...`)
    
    setTimeout(() => {
      if (this.roomId && this.callbacks) {
        this.connect(this.roomId, this.callbacks)
      }
    }, delay)
  }

  subscribe(roomId, onMessage) {
    if (!this.client || !this.client.connected) {
      console.warn('⚠️ Cannot subscribe: STOMP client is not connected')
      return
    }

    if (this.subscription) {
      this.subscription.unsubscribe()
    }

    try {
      const destination = `/sub/chat/room/${roomId}`
      console.log('📡 Subscribing to:', destination)
      
      this.subscription = this.client.subscribe(destination, (message) => {
        console.log('📨 Received message:', message.body)
        if (onMessage) {
          try {
            const parsedMessage = JSON.parse(message.body)
            onMessage(parsedMessage)
          } catch (e) {
            console.error('❌ Failed to parse message:', e)
            console.error('Raw message:', message.body)
          }
        }
      })
      
      console.log('✅ Successfully subscribed to room:', roomId)
    } catch (error) {
      console.error('❌ Failed to subscribe:', error)
      throw error
    }
  }

  sendMessage(message) {
    if (!this.isConnected) {
      console.log('📤 WebSocket not connected, queuing message:', message)
      this.messageQueue.push(message)
      return
    }

    if (!this.client || !this.client.connected) {
      console.warn('⚠️ Cannot send message: STOMP client is not connected')
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
      console.log('✅ Message sent:', messageData)
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      this.messageQueue.push(message)
    }
  }
  
  flushMessageQueue() {
    if (this.messageQueue.length > 0) {
      console.log(`📦 Flushing message queue, count: ${this.messageQueue.length}`)
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()
        this.sendMessage(message)
      }
    }
  }

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
      }, 2000)
    }
  })()

  disconnect() {
    console.log('🔌 Disconnecting WebSocket...')
    
    // 타임아웃 클리어
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
    
    if (this.subscription) {
      try {
        this.subscription.unsubscribe()
        console.log('✅ Unsubscribed successfully')
      } catch (error) {
        console.warn('⚠️ Error unsubscribing:', error)
      }
      this.subscription = null
    }

    if (this.client) {
      try {
        if (this.client.connected) {
          this.client.deactivate()
          console.log('✅ Client deactivated')
        }
      } catch (error) {
        console.warn('⚠️ Error deactivating client:', error)
      }
      this.client = null
    }

    this.isConnected = false
    this.roomId = null
    this.reconnectAttempts = 0
    this.messageQueue = []
    this.callbacks = {}
    
    console.log('✅ WebSocket disconnected successfully')
  }

  isConnectedToRoom() {
    return this.isConnected && this.client && this.client.connected
  }

  forceReconnect() {
    if (this.roomId && this.callbacks) {
      console.log('🔄 Force reconnecting...')
      this.disconnect()
      setTimeout(() => {
        this.connect(this.roomId, this.callbacks)
      }, 1000)
    }
  }

  // 연결 상태 체크 (디버깅용)
  getStatus() {
    return {
      isConnected: this.isConnected,
      clientState: this.client?.connected,
      roomId: this.roomId,
      hasSubscription: !!this.subscription,
      queueSize: this.messageQueue.length,
      reconnectAttempts: this.reconnectAttempts
    }
  }
}

export default new WebSocketService()