import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/base/index.css'
import 'flowbite'

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  if (import.meta.env.VITE_USE_MOCK_API !== 'true') {
    console.log('Mock API is disabled')
    return
  }

  try {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass', // 처리되지 않은 요청은 실제 서버로 전달
    })
    console.log('Mock API is enabled')
  } catch (error) {
    console.error('Failed to initialize Mock API:', error)
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
