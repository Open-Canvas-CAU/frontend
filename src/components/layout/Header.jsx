import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';

/**
 * 애플리케이션의 헤더 컴포넌트입니다.
 * 로그인 상태를 실시간으로 감지하여 UI를 동적으로 변경합니다.
 */
export default function Header() {
    const navigate = useNavigate();
    // React state를 사용하여 로그인 상태를 관리해야 동적으로 UI가 변경됩니다.
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [currentUser, setCurrentUser] = useState(null);

    // 검색창 관련 상태
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const searchRef = useRef(null);

    // 로그인 상태가 변경될 때마다 실행될 Effect
    useEffect(() => {
        const updateAuthState = async () => {
            const authStatus = authService.isAuthenticated();
            setIsAuthenticated(authStatus);

            if (authStatus) {
                // 로그인 상태이면, 사용자 정보를 가져옵니다.
                // 로컬 스토리지에 정보가 없으면 API를 통해 가져옵니다.
                let user = authService.getCurrentUser();
                if (!user) {
                    user = await authService.fetchAndSaveUser();
                }
                setCurrentUser(user);
            } else {
                // 로그아웃 상태이면 사용자 정보를 null로 설정합니다.
                setCurrentUser(null);
            }
        };

        // 'auth-change'라는 커스텀 이벤트를 감지하여 로그인 상태를 업데이트합니다.
        window.addEventListener('auth-change', updateAuthState);

        // 컴포넌트가 처음 렌더링될 때도 상태를 확인합니다.
        updateAuthState();

        // 컴포넌트가 사라질 때 이벤트 리스너를 정리합니다.
        return () => {
            window.removeEventListener('auth-change', updateAuthState);
        };
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/'); // 로그아웃 후 홈으로 이동
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchValue.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
            setIsSearchExpanded(false);
            setSearchValue('');
        }
    };

    // 검색창 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-24 flex items-center justify-between bg-white/10 p-4 md:p-6 lg:p-8 border-b border-white">
            {/* 왼쪽 섹션: 로고 및 네비게이션 (항상 표시) */}
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
                            isActive ? 'font-bold text-yellow-300' : 'text-solarized-base00 hover:text-red-400'
                        }
                    >
                        작업 중
                    </NavLink>
                </nav>
            </div>

            {/* 오른쪽 섹션: 검색 및 인증 (항상 표시) */}
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
                             <button type="submit" className="px-4 py-2 bg-yellow-300 text-white hover:bg-yellow-300/80 transition-colors">
                                 검색
                             </button>
                         </form>
                    ) : (
                        <button onClick={() => setIsSearchExpanded(true)} className="p-2 text-solarized-base00 hover:text-red-400 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                    )}
                </div>

                {/* 인증 정보 영역: 로그인 상태에 따라 내용만 교체 */}
                {isAuthenticated ? (
                    <>
                        <span className="text-sm text-white">
                            {currentUser?.nickname || '사용자'}님 환영합니다!
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                        >
                            로그아웃
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-sm font-medium text-gray-800 bg-yellow-300 hover:bg-yellow-400 rounded-md transition-colors"
                    >
                        로그인
                    </button>
                )}
            </div>
        </header>
    );
}
