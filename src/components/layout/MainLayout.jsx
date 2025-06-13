// src/components/layout/MainLayout.jsx
import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '@/components/layout/Header'
import DrawerMenu from '@/components/layout/DrawerMenu'

export default function MainLayout() {
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
    const location = useLocation()
    const isAdminPage = location.pathname === '/admin'

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* 헤더: 전체 너비로 최상단에 배치 */}
            <Header />

            {/* 메인 컨텐츠 영역 */}
            <div className="flex-1 overflow-hidden">
                {/* 메인 콘텐츠 */}
                <main className={`
                    h-full overflow-auto
                    transition-all duration-300 ease-in-out
                    ${!isAdminPage && isDrawerOpen ? 'ml-72 w-[calc(100%-18rem)]' : 
                      !isAdminPage ? 'ml-20 w-[calc(100%-5rem)]' : 'w-full'}
                `}>
                    <div className="min-h-full px-8 py-6 md:px-12 md:py-8 lg:px-16 lg:py-10">
                        <div className="max-w-[1600px] mx-auto">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>

            {/* 드로어 메뉴 - 관리자 페이지가 아닐 때만 표시 */}
            {!isAdminPage && <DrawerMenu onOpenChange={setIsDrawerOpen} />}
        </div>
    )
}
