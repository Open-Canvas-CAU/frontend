import { Client } from '@stomp/stompjs'
import { authService } from './authService'

class WebSocketService {
  constructor() {
    this.client = null
    this.subscription = null
    this.roomId = null
    this.messageQueue = []
    this.isConnected = false
  }

  // WebSocket 연결
  connect(roomId, callbacks = {}) {
    this.roomId = roomId
    const accessToken = authService.getAccessToken()

    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws-stomp',
      connectHeaders: {
        token: accessToken // Bearer 없이 토큰만 전송
      },
      debug: (str) => {
        console.log('STOMP Debug:', str)
      },
      onConnect: (frame) => {
        console.log('STOMP Connected:', frame)
        this.isConnected = true
        
        this.subscribe(roomId, callbacks.onMessage)
        
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

  sendMessage(message) {
    if (!this.isConnected) {
      // 연결되지 않았으면 큐에 저장
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

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.sendMessage(message)
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
      }, 2000) // 2초 throttle
    }
  })()

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