// src/components/layout/Header.jsx - 수정된 헤더 (로그인 버튼 포함)
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [currentUser, setCurrentUser] = useState(null);

    // 검색창 관련 상태
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const searchRef = useRef(null);

    // 네비게이션 전환 상태
    const [activeNav, setActiveNav] = useState('');

    useEffect(() => {
        const updateAuthState = async () => {
            const authStatus = authService.isAuthenticated();
            setIsAuthenticated(authStatus);

            if (authStatus) {
                let user = authService.getCurrentUser();
                if (!user) {
                    user = await authService.fetchAndSaveUser();
                }
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        };

        window.addEventListener('auth-change', updateAuthState);
        updateAuthState();

        return () => {
            window.removeEventListener('auth-change', updateAuthState);
        };
    }, []);

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

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    // 🔧 수정된 로그인 처리 - OAuth2 URL로 직접 이동
    const handleLogin = () => {
        // 현재 경로 저장
        localStorage.setItem('login_redirect_path', location.pathname);
        
        // 동적 포트 감지
        const currentPort = window.location.port || (window.location.protocol === 'https:' ? '443' : '3000');
        const redirectUri = `http://localhost:${currentPort}/oauth2/callback`;
        
        // OAuth2 로그인 URL 생성
        const googleLoginUrl = `http://ec2-54-180-117-21.ap-northeast-2.compute.amazonaws.com/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}&mode=login`;
        
        console.log('🔑 Header에서 로그인 시도:', googleLoginUrl);
        
        // 페이지 전체를 리다이렉트
        window.location.href = googleLoginUrl;
    };

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
                    Live Canvas
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
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                            )}
                        </span>
                    </button>
                </nav>
            </div>

            {/* 오른쪽 섹션: 검색 및 인증 */}
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
                                className="px-4 py-3 bg-red-300 text-black hover:bg-red-400 transition-colors duration-200 font-medium"
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

                {/* 인증 정보 영역 */}
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <>
                            <div className="flex items-center space-x-3 bg-black/10 backdrop-blur-sm rounded-xl px-4 py-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-white-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {currentUser?.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm text-white font-medium">
                                    {currentUser?.nickname?.split('@')[0] || '사용자'}님
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500/80 hover:bg-red-500 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            {/* 🔧 수정된 로그인 버튼 - OAuth2 직접 연결 */}
                            <button
                                onClick={handleLogin}
                                className="px-4 py-3 bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 font-medium"                            >
                                <img 
                                    className="w-5 h-5" 
                                    src="https://www.svgrepo.com/show/475656/google-color.svg" 
                                    alt="Google" 
                                />
                                <span>로그인</span>
                            </button>
                            
                            {/* 개발 모드에서만 보이는 디버그 정보 */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="text-xs text-white/60">
                                    포트: {window.location.port || '3000'}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}