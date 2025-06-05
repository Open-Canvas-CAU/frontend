// src/components/auth/ProtectedRoute.jsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authService } from '@/services/authService'

export default function ProtectedRoute({ children }) {
    const location = useLocation()
    const isAuthenticated = authService.isAuthenticated()

    if (!isAuthenticated) {
        // 로그인 페이지로 리다이렉트하면서 현재 위치를 state로 전달
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <>{children}</>
}
