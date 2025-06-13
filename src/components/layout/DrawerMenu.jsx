import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/services/authService'

export default function DrawerMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
    const [currentUser, setCurrentUser] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        updateAuthState()
        const interval = setInterval(updateAuthState, 5000)
        return () => clearInterval(interval)
    }, [])

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

    const menuItems = [
        {
            path: '/canvas/new',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            label: '새 캔버스',
            requireAuth: true
        },
        {
            path: '/my-canvas',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            label: '내 캔버스',
            requireAuth: true
        },
        {
            path: '/favorites',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ),
            label: '즐겨찾기',
            requireAuth: true
        },
        {
            path: '/profile',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            label: '내 정보',
            requireAuth: true
        }
    ]

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
        <>
            {/* 드로어 메뉴 */}
            <div className={`
                fixed top-24 left-0 h-[calc(100vh-6rem)] 
                transform transition-all duration-300 ease-in-out z-20
                ${isOpen ? 'w-72' : 'w-20'}
                border-r border-white/20
            `}>
                {/* 메뉴 배경 */}
                <div className={`
                    h-full bg-black/95 transition-all duration-300 flex flex-col
                    ${isOpen ? 'w-72' : 'w-20'}
                `}>
                    {/* 사용자 프로필 섹션 - 사이드바가 열려있을 때만 표시 */}
                    {isOpen && (
                        <div className="p-4 border-b border-white/20">
                            {isAuthenticated && currentUser ? (
                                <div className="flex items-center space-x-4">
                                    {currentUser.profileImage ? (
                                        <img 
                                            src={currentUser.profileImage} 
                                            alt="프로필" 
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-xl font-bold">
                                            {currentUser.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold text-white">{currentUser.nickname}</div>
                                        <div className="text-sm text-white/60">{currentUser.email}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-white/60">
                                    로그인이 필요합니다
                                </div>
                            )}
                        </div>
                    )}

                    {/* 메뉴 아이템 */}
                    <nav className="p-4 flex-1">
                        {activeItems.map((item, index) => (
                            <button
                                key={item.path}
                                onClick={() => {
                                    if (!isOpen) {
                                        setIsOpen(true)
                                        return
                                    }
                                    setIsOpen(false)
                                    if (item.onClick) {
                                        item.onClick()
                                    } else if (!item.disabled) {
                                        navigate(item.path)
                                    }
                                }}
                                className={`
                                    w-full flex items-center space-x-3 p-3 rounded-lg mb-2
                                    transition-all duration-200
                                    ${isOpen ? 'justify-start' : 'justify-center'}
                                    ${item.disabled 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : location.pathname === item.path 
                                            ? 'bg-red-500/20 text-red-400' 
                                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }
                                `}
                                style={{ transitionDelay: `${index * 50}ms` }}
                                disabled={item.disabled}
                            >
                                <span className="w-6 h-6 flex-shrink-0">{item.icon}</span>
                                {isOpen && <span className="whitespace-nowrap">{item.label}</span>}
                            </button>
                        ))}
                    </nav>

                    {/* 로그인/로그아웃 버튼 - 사이드바가 열려있을 때만 표시 */}
                    {isOpen && (
                        <div className="p-4 border-t border-white/20">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        authService.logout()
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>로그아웃</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        navigate('/login')
                                    }}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    <span>로그인</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* 새 캔버스 버튼 - 사이드바가 닫혔을 때 하단에 표시 */}
                    {!isOpen && (
                        <div className="mt-auto p-4">
                            <button
                                onClick={() => navigate('/canvas/new')}
                                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg p-3 transition-colors duration-200 flex items-center justify-center"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* 토글 버튼 */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        absolute -right-3 top-1/2 -translate-y-1/2
                        w-6 h-12 bg-black/80 text-white rounded-r-lg shadow-lg 
                        hover:bg-black/90 transition-all duration-300 
                        flex items-center justify-center z-30
                    `}
                >
                    <span className="transform transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                        {'>>'}
                    </span>
                </button>
            </div>

            {/* 오버레이 */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-10"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
} 