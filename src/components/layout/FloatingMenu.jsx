import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@/services/authService'

export default function FloatingMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
    const [currentUser, setCurrentUser] = useState(null)
    const [notifications, setNotifications] = useState(0)

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
            setNotifications(user?.notifications?.length || 0)
        } else {
            setCurrentUser(null)
            setNotifications(0)
        }
    }

    // 스크롤 시 메뉴 자동 숨김
    useEffect(() => {
        let timeoutId
        
        const handleScroll = () => {
            setIsOpen(false)
            clearTimeout(timeoutId)
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            clearTimeout(timeoutId)
        }
    }, [])

    const handleMenuClick = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            document.body.style.overflow = 'hidden'
            document.body.style.backgroundColor = ''
        } else {
            document.body.style.overflow = ''
            document.body.style.backgroundColor = ''
        }
    }

    const handleMenuItemClick = (path) => {
        setIsOpen(false)
        document.body.style.overflow = ''
        document.body.style.backgroundColor = ''
        navigate(path)
    }

    const menuItems = [
        {
            path: '/new-canvas',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            label: '새 캔버스',
            notification: false
        },
        {
            path: '/my-canvas',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            label: '내 캔버스',
            notification: true
        },
        {
            path: '/favorites',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ),
            label: '즐겨찾기',
            notification: false
        },
        {
            path: '/profile',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            label: '내 정보',
            notification: false
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

    // 메뉴 아이템 스타일 수정
    const menuItemStyle = "flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-colors text-white";
    const iconStyle = "text-white";

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <div className="relative">
                {/* 메인 메뉴 버튼 */}
                <button
                    onClick={handleMenuClick}
                    className="w-16 h-16 bg-black/80 text-white rounded-full shadow-lg hover:bg-black/90 transition-all duration-300 flex items-center justify-center overflow-hidden"
                >
                    {isAuthenticated && currentUser ? (
                        <div className="w-full h-full flex items-center justify-center">
                            {currentUser.profileImage ? (
                                <img 
                                    src={currentUser.profileImage} 
                                    alt="프로필" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-red-500 flex items-center justify-center text-xl font-bold">
                                    {currentUser.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                    ) : (
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    )}
                </button>

                {/* 서브메뉴 */}
                {isOpen && (
                    <>
                        {/* 배경 오버레이 */}
                        <div 
                            className="fixed inset-0 bg-black/5 backdrop-blur-[2px] transition-opacity duration-300"
                            onClick={handleMenuClick}
                            style={{ zIndex: -1 }}
                        />
                        
                        <div className="absolute bottom-20 right-0 flex flex-col gap-2">
                            {menuItems.map((item, index) => (
                                <div
                                    key={item.path}
                                    className="flex items-center justify-end gap-2"
                                    style={{ transitionDelay: `${index * 50}ms` }}
                                >
                                    <span 
                                        onClick={() => handleMenuItemClick(item.path)}
                                        className="text-white bg-black/80 px-4 py-2 rounded-lg cursor-pointer hover:bg-black/90 transition-all duration-300 whitespace-nowrap min-w-[120px] text-right"
                                    >
                                        {item.label}
                                    </span>
                                    <button
                                        onClick={() => handleMenuItemClick(item.path)}
                                        className="w-12 h-12 bg-black/80 text-white rounded-full shadow-lg hover:bg-black/90 transition-all duration-300 flex items-center justify-center"
                                    >
                                        {item.icon}
                                    </button>
                                    {item.notification && showNotifications && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}