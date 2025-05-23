import React from 'react'
import { NavLink, Link } from 'react-router-dom'

export default function Header() {
    return (
        <header className="h-24 flex bg-zinc-300/50 overflow-auto p-4 md:p-6 lg:p-8">
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
        </header>
    )
}
