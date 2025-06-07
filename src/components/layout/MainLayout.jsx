// src/components/layout/MainLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import FloatingMenu from '@/components/layout/FloatingMenu'

export default function MainLayout() {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* 헤더: 전체 너비로 최상단에 배치 */}
            <Header />

            {/* 메인 컨텐츠 영역 */}
            <div className="flex-1 overflow-hidden">
                {/* 메인 콘텐츠 */}
                <main className="h-full overflow-auto p-4 md:p-6 lg:p-8">
                    <div className="container mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* 플로팅 메뉴 */}
            <FloatingMenu />
        </div>
    )
}
