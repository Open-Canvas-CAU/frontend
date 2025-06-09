// src/components/layout/Sidebar.jsx
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import CanvasIconUrl from '@/assets/icons/canvas.svg'
import StarIconUrl   from '@/assets/icons/star.svg'
import UserIconUrl   from '@/assets/icons/user.svg'
import PlusIconUrl   from '@/assets/icons/plus.svg'

export default function Sidebar() {
    const navigate = useNavigate()

    const linkClass = ({ isActive }) =>
        isActive
            ? 'text-yellow-300'
            : 'text-solarized-base0 hover:text-red-400'

    return (
        <aside className="w-24 h-screen bg-solarized-base2 flex flex-col items-center p-6">
            <nav className="flex-1 flex flex-col items-center space-y-10 pt-24">
                {/* 내 캔버스 (초안/작업중) */}
                <NavLink to="/palette" className={linkClass}>
                    <img src={CanvasIconUrl} alt="Palette" className="w-6 h-6"/>
                </NavLink>

                {/* 즐겨찾기 */}
                <NavLink to="/favorites" className={linkClass}>
                    <img src={StarIconUrl} alt="Favorites" className="w-6 h-6"/>
                </NavLink>

                {/* 내 정보 대시보드 */}
                <NavLink to="/mypage" className={linkClass}>
                    <img src={UserIconUrl} alt="My Page" className="w-6 h-6"/>
                </NavLink>
            </nav>
            <button
                onClick={() => navigate('/editor/new')}
                className="mt-auto bg-yellow-300 hover:bg-yellow-300/80 rounded-full transition-colors"
            >
                <img src={PlusIconUrl} alt="New Canvas" className="w-6 h-6"/>
            </button>
        </aside>
    )
}
