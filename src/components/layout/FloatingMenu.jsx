import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/services/authService'

export default function FloatingMenu() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isExpanded, setIsExpanded] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
    const [currentUser, setCurrentUser] = useState(null)
    const [notifications, setNotifications] = useState(0)

    // 인증 상태 감지
    useEffect(() => {
        const updateAuthState = () => {
            const authStatus = authService.isAuthenticated()
            setIsAuthenticated(authStatus)
            
            if (authStatus) {
                const user = authService.getCurrentUser()
                setCurrentUser(user)
            } else {
                setCurrentUser(null)
            }
        }

        window.addEventListener('auth-change', updateAuthState)
        updateAuthState()

        return () => {
            window.removeEventListener('auth-change', updateAuthState)
        }
    }, [])

    // 스크롤 시 메뉴 자동 숨김
    useEffect(() => {
        let timeoutId
        
        const handleScroll = () => {
            setIsExpanded(false)
            clearTimeout(timeoutId)
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            clearTimeout(timeoutId)
        }
    }, [])

    const menuItems = [
        { 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>, 
            label: '새 캔버스', 
            path: '/editor/new',
            onClick: () => {
                if (!isAuthenticated) {
                    navigate('/login')
                } else {
                    navigate('/editor/new')
                }
            },
            requireAuth: true
        },
        { 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>, 
            label: '내 캔버스', 
            path: '/palette',
            requireAuth: true
        },
        { 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>, 
            label: '즐겨찾기', 
            path: '/favorites',
            requireAuth: true
        },
        { 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>, 
            label: '내 정보', 
            path: '/mypage',
            requireAuth: true,
            hasNotification: notifications > 0
        },
    ]

    const handleItemClick = (item) => {
        if (item.onClick) {
            item.onClick()
        } else if (item.requireAuth && !isAuthenticated) {
            navigate('/login', { state: { from: location } })
        } else {
            navigate(item.path)
        }
        setIsExpanded(false)
    }

    const getActiveItems = () => {
        return isAuthenticated 
            ? menuItems 
            : menuItems.filter(item => !item.requireAuth).concat([
                {
                    icon: '🔑',
                    label: '로그인',
                    path: '/login',
                    onClick: () => navigate('/login')
                }
            ])
    }

    const activeItems = getActiveItems()

    // 메뉴 아이템 스타일 수정
    const menuItemStyle = "flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-colors text-white";
    const iconStyle = "text-white";

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* 메인 메뉴 */}
            <div className={`
                relative transition-all duration-500 ease-out transform
                ${isExpanded ? 'scale-100' : 'scale-95'}
            `}>
                {/* 메뉴 아이템들 */}
                <div className={`
                    absolute bottom-16 right-0 space-y-3 transition-all duration-500
                    ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
                `}>
                    {activeItems.map((item, index) => (
                        <div
                            key={item.label}
                            className={`
                                flex items-center justify-end transition-all duration-300
                                ${isExpanded ? 'translate-x-0' : 'translate-x-4'}
                            `}
                            style={{ 
                                transitionDelay: `${index * 50}ms`,
                                animationDelay: `${index * 50}ms`
                            }}
                        >
                            {/* 라벨 */}
                            <div className={`
                                mr-4 px-3 py-2 bg-black/90 backdrop-blur-sm rounded-xl shadow-lg
                                transition-all duration-300 transform
                                ${isExpanded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                            `}>
                                <span className="text-sm font-medium text-white whitespace-nowrap">
                                    {item.label}
                                </span>
                            </div>
                            
                            {/* 버튼 */}
                            <button
                                key={item.path}
                                onClick={item.onClick || (() => navigate(item.path))}
                                className={menuItemStyle}
                            >
                                <span className={iconStyle}>{item.icon}</span>
                                {item.hasNotification && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                {/* 메인 토글 버튼 */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`
                        relative w-16 h-16 rounded-2xl transition-all duration-500 transform
                        ${isExpanded ? 'rotate-45 scale-110' : 'rotate-0 scale-100 hover:scale-105'}
                        bg-red-500 hover:bg-red-600 text-white
                        flex items-center justify-center group shadow-xl hover:shadow-2xl 
                    `}
                >
                    {/* 배경 애니메이션 */}
                    <div className="absolute inset-0 rounded-2xl bg-red-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* 아이콘 */}
                    <div className={`
                        relative transition-all duration-300 transform
                        ${isExpanded ? 'rotate-180' : 'rotate-0'}
                    `}>
                        <span className="text-2xl font-bold">
                            {isExpanded ? '✕' : ''}
                        </span>
                    </div>

                    {/* 알림 배지 */}
                    {notifications > 0 && !isExpanded && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full  flex items-center justify-center text-xs font-bold animate-pulse">
                            {notifications > 99 ? '99+' : notifications}
                        </span>
                    )}

                    {/* 호버 시 리플 효과 */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                        <div className={`
                            absolute inset-0 bg-white/20 rounded-full transition-all duration-700 transform
                            ${isExpanded ? 'scale-150 opacity-0' : 'scale-0 opacity-100'}
                        `}></div>
                    </div>
                </button>

                {/* 사용자 정보 표시 (인증된 경우) */}
                {isAuthenticated && currentUser && isExpanded && (
                    <div className={`
                        absolute bottom-0 right-20 p-4 bg-black/90 backdrop-blur-sm rounded-2xl shadow-xl 
                        transition-all duration-500 transform
                        ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                    `}>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold">
                                {currentUser.nickname?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">
                                    {currentUser.nickname?.split('@')[0] || '사용자'}
                                </div>
                                <div className="text-xs text-white/60">
                                    {currentUser.role === 'ADMIN' ? '관리자' : '작가'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 배경 오버레이 (확장 시) */}
            {isExpanded && (
                <div 
                    className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsExpanded(false)}
                    style={{ zIndex: -1 }}
                />
            )}

            {/* 도움말 툴팁 (처음 방문자용) */}
            {!isExpanded && (
                <div className="absolute -top-2 -left-32 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-black/90 text-white text-xs py-2 px-3 rounded-lg relative ">
                        빠른 메뉴
                        <div className="absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2">
                            <div className="w-0 h-0 border-l-4 border-l-black/90 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}