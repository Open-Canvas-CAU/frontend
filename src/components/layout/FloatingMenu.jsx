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
            icon: '✨', 
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
            icon: '🎨', 
            label: '내 캔버스', 
            path: '/palette',
            requireAuth: true
        },
        { 
            icon: '⭐', 
            label: '즐겨찾기', 
            path: '/favorites',
            requireAuth: true
        },
        { 
            icon: '👤', 
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
                                onClick={() => handleItemClick(item)}
                                className={`
                                    relative w-12 h-12 rounded-2xl transition-all duration-300 transform hover:scale-110
                                    bg-red-500 hover:bg-red-600 text-white font-bold text-lg
                                    flex items-center justify-center shadow-lg hover:shadow-xl 
                                `}
                            >
                                <span className="relative">
                                    {item.icon}
                                    {item.hasNotification && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                                    )}
                                </span>
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
                            {isExpanded ? '✕' : '⚡'}
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