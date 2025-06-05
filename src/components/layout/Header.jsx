import React from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'

export default function Header() {
    const navigate = useNavigate()
    const isAuthenticated = authService.isAuthenticated()
    const currentUser = authService.getCurrentUser()

    const handleLogout = () => {
        authService.logout()
        navigate('/')
    }

    return (
        <header className="h-24 flex items-center justify-between bg-zinc-300/50 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="flex items-center">
                <Link to="/" className="text-xl font-bold hover:text-gray-300">
                    Live Canvas
                </Link>
                <nav className="ml-16 flex space-x-4">
                    <NavLink
                        to="/gallery"
                        className={({ isActive }) =>
                            isActive ? 'text-blue-400' : 'hover:text-gray-300'
                        }
                    >
                        갤러리
                    </NavLink>
                    <NavLink
                        to="/workingon"
                        className={({ isActive }) =>
                            isActive ? 'text-blue-400' : 'hover:text-gray-300'
                        }
                    >
                        작업 중
                    </NavLink>
                </nav>
            </div>

            {/* 로그인/로그아웃 버튼 */}
            <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                    <>
                        <span className="text-sm text-gray-600">
                            {currentUser?.nickname || currentUser?.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            로그아웃
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
                    >
                        로그인
                    </button>
                )}
            </div>
        </header>
    )
}
