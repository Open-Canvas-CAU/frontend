// src/components/layout/Header.jsx - 수정된 헤더 (로그인 버튼 포함)
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    // 검색창 관련 상태
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const searchRef = useRef(null);

    // 네비게이션 전환 상태
    const [activeNav, setActiveNav] = useState('');

    // 현재 페이지에 따른 활성 네비게이션 설정
    useEffect(() => {
        if (location.pathname === '/gallery' || location.pathname === '/') {
            setActiveNav('gallery');
        } else if (location.pathname === '/workingon') {
            setActiveNav('workingon');
        } else {
            setActiveNav('');
        }
    }, [location.pathname]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchValue.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
            setIsSearchExpanded(false);
            setSearchValue('');
        }
    };

    // 네비게이션 클릭 핸들러
    const handleNavClick = (path, navType) => {
        if (activeNav !== navType) {
            // 페이지 전환 애니메이션 트리거
            document.body.classList.add('page-transitioning');
            setTimeout(() => {
                navigate(path);
                document.body.classList.remove('page-transitioning');
            }, 150);
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

    // 현재 페이지에 따른 헤더 스타일
    const getHeaderStyle = () => {
        const isWorkspace = location.pathname === '/workingon';
        return isWorkspace
            ? 'bg-gradient-to-r from-red-400/10 via-red-400/10 to-white-400/10 border-orange-200/50'
            : 'bg-gradient-to-r from-red-400/10 via-purple-400/10 to-white-400/10 border-red-200/50';
    };

    // 네비게이션 버튼 스타일
    const getNavStyle = (navType, isActive) => {
        const baseStyle = 'relative px-4 py-2 rounded-lg font-medium transition-all duration-300 transform';
        
        if (isActive) {
            return navType === 'workingon'
                ? `${baseStyle} text-orange-600 bg-orange-100/80 shadow-lg scale-105`
                : `${baseStyle} text-red-600 bg-red-100/80 shadow-lg scale-105`;
        }
        
        return `${baseStyle} text-white hover:text-red-400 hover:bg-black/50 hover:scale-105 hover:shadow-md`;
    };

    return (
        <header className={`
            h-24 flex items-center justify-between p-4 md:p-6 lg:p-8 border-b backdrop-blur-sm
            transition-all duration-500 ease-in-out
            ${getHeaderStyle()}
        `}>
            {/* 왼쪽 섹션: 로고 및 네비게이션 */}
            <div className="flex items-center space-x-8">
                <Link 
                    to="/" 
                    className="text-xl font-extrabold text-white hover:text-red-400 transition-colors duration-300 transform hover:scale-105"
                >
                    Open Canvas
                </Link>
                
                <nav className="flex space-x-2 relative">
                    <button
                        onClick={() => handleNavClick('/gallery', 'gallery')}
                        className={getNavStyle('gallery', activeNav === 'gallery')}
                    >
                        <span className="relative z-10 flex items-center space-x-2">
                            <span>갤러리</span>
                            {activeNav === 'gallery' && (
                                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                            )}
                        </span>
                    </button>
                    
                    <button
                        onClick={() => handleNavClick('/workingon', 'workingon')}
                        className={getNavStyle('workingon', activeNav === 'workingon')}
                    >
                        <span className="relative z-10 flex items-center space-x-2">
                            <span>작업 중</span>
                            {activeNav === 'workingon' && (
                                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                            )}
                        </span>
                    </button>
                </nav>
            </div>

            {/* 오른쪽 섹션: 검색 */}
            <div className="flex items-center space-x-6">
                {/* 검색 영역 */}
                <div ref={searchRef} className="relative">
                    {isSearchExpanded ? (
                        <form 
                            onSubmit={handleSearch} 
                            className="flex items-center bg-black/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg transform scale-100 transition-all duration-300"
                        >
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="검색어를 입력하세요"
                                className="px-4 py-3 w-48 focus:outline-none text-white-900 bg-transparent"
                                autoFocus
                            />
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                            >
                                검색
                            </button>
                        </form>
                    ) : (
                        <button 
                            onClick={() => setIsSearchExpanded(true)} 
                            className="p-3 text-white hover:text-red-400 hover:bg-black/20 rounded-xl transition-all duration-300 transform hover:scale-110"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}