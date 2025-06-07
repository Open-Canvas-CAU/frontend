import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import UserIconUrl from '@/assets/icons/user.svg'
import StarIconUrl from '@/assets/icons/star.svg'
import CanvasIconUrl from '@/assets/icons/canvas.svg'
import PlusIconUrl from '@/assets/icons/plus.svg'

export default function FloatingMenu() {
    const navigate = useNavigate()

    const menuItems = [
        { icon: PlusIconUrl, to: '/editor/new', alt: 'New Canvas', label: '새 캔버스', onClick: () => navigate('/editor/new') },
        { icon: CanvasIconUrl, to: '/palette', alt: 'Palette', label: '내 캔버스' },
        { icon: StarIconUrl, to: '/favorites', alt: 'Favorites', label: '즐겨찾기' },
        { icon: UserIconUrl, to: '/mypage', alt: 'My Page', label: '내 정보' },
    ]

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <div className="bg-solarized-base2 backdrop-blur-sm rounded-full shadow-lg p-2 flex items-center gap-2">
                {menuItems.map((item) => (
                    item.onClick ? (
                        <button
                            key={item.to}
                            onClick={item.onClick}
                            className="group relative p-2 rounded-full hover:bg-yellow-300/80 transition-colors"
                        >
                            <img src={item.icon} alt={item.alt} className="w-6 h-6" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-solarized-base03 text-solarized-base3 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {item.label}
                            </span>
                        </button>
                    ) : (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `
                                group relative p-2 rounded-full transition-colors
                                ${isActive ? 'bg-yellow-300/80' : 'hover:bg-red'}
                            `}
                        >
                            <img src={item.icon} alt={item.alt} className="w-6 h-6" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-solarized-base03 text-solarized-base3 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {item.label}
                            </span>
                        </NavLink>
                    )
                ))}
            </div>
        </div>
    )
} 