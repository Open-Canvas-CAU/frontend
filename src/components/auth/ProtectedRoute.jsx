// src/components/auth/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'

// TODO: 실제 로그인 상태 컨텍스트/스토어로 바꾸세요
const isLoggedIn = false

export default function ProtectedRoute({ children }) {
    return isLoggedIn
        ? <>{children}</>
        : <Navigate to="/login" replace />
}
