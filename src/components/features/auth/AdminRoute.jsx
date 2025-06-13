import React from 'react';
import { Navigate } from 'react-router-dom';

const ADMIN_EMAIL = 'jieeeeeelj@gmail.com';

export default function AdminRoute({ children }) {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user || user.email !== ADMIN_EMAIL) {
        console.log('관리자 접근 거부:', user);
        return <Navigate to="/" replace />;
    }

    console.log('관리자 접근 허용:', user);
    return children;
} 