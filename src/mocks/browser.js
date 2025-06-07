import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

const worker = setupWorker(...handlers)

worker.events.on('unhandledException', (error) => {
  console.error('Mock API Error:', error)
})

export { worker } 