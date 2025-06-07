import React, { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'

export default function Header() {
    const navigate = useNavigate()
    const isAuthenticated = authService.isAuthenticated()
    const currentUser = authService.getCurrentUser()
    const [isSearchExpanded, setIsSearchExpanded] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const searchRef = useRef(null)

    const handleLogout = () => {
        authService.logout()
        navigate('/')
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchValue.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
            setIsSearchExpanded(false)
            setSearchValue('')
        }
    }

    // 검색창 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchExpanded(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header className="h-24 flex items-center justify-between 
                            bg-white/10 overflow-auto 
                            p-4 md:p-6 lg:p-8
                            border-b border-white">
            <div className="flex items-center">
                <Link to="/" className="pl-5 text-xl font-extrabold text-white hover:text-red-400">
                    Live Canvas
                </Link>
                <nav className="ml-16 flex space-x-4">
                    <NavLink
                        to="/gallery"
                        className={({ isActive }) =>
                            isActive ? 'font-bold text-yellow-300' : 'text-solarized-base00 hover:text-red-400'
                        }
                    >
                        갤러리
                    </NavLink>
                    <NavLink
                        to="/workingon"
                        className={({ isActive }) =>
                            isActive ? 'text-yellow-300' : 'text-solarized-base00 hover:text-red-400'
                        }
                    >
                        작업 중
                    </NavLink>
                </nav>
            </div>

            {/* 검색 및 로그인 영역 */}
            <div className="flex items-center space-x-4">
                {/* 검색 영역 */}
                <div ref={searchRef} className="relative">
                    {isSearchExpanded ? (
                        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-md overflow-hidden">
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="검색어를 입력하세요"
                                className="px-4 py-2 w-44 focus:outline-none text-gray-900"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-yellow-300 text-white hover:bg-yellow-300/80 transition-colors"
                            >
                                검색
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsSearchExpanded(true)}
                            className="p-2 text-solarized-base00 hover:text-red-400 transition-colors"
                        >
                            <svg 
                                className="w-6 h-6" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* 로그인/로그아웃 버튼 */}
                {isAuthenticated ? (
                    <>
                        <span className="text-sm text-solarized-base3">
                            {currentUser?.nickname || currentUser?.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-solarized-base3 hover:text-solarized-base2 hover:bg-solarized-base2 rounded-md transition-colors"
                        >
                            로그아웃
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-sm font-medium text-solarized-base3 bg-yellow-300 hover:bg-yellow-300/80 rounded-md transition-colors"
                    >
                        로그인
                    </button>
                )}
            </div>
        </header>
    )
}
