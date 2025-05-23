// src/components/layout/MainLayout.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function MainLayout() {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* 사이드바는 고정 폭, 화면 높이 꽉 채우기 */}
            <Sidebar />

            {/* 우측: 헤더+콘텐츠 */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header 하단 그림자·배경 지정 */}
                <Header />

                {/* 메인 콘텐츠: 스크롤 가능, 안쪽 여백은 반응형 p-4 → md:p-6 → lg:p-8 */}
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    {/* 반응형 최대 너비 컨테이너 추가 */}
                    <div className="container mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
