// src/pages/LandingPage.jsx - MouseFollower 추가된 버전
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import CanvasCard from '@/components/features/landing/CanvasCard'
import MouseFollower from '@/components/common/MouseFollower'
import { coverService } from '@/services/coverService'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { 
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    ROUTES,
    UI_CONSTANTS,
    RoomType
} from '@/types'

// 커스텀 스타일 추가
const customStyles = `
    .swiper-button-next,
    .swiper-button-prev {
        color: #ef4444 !important;
        background: rgba(0, 0, 0, 0.5);
        width: 40px !important;
        height: 40px !important;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    .swiper-button-next:hover,
    .swiper-button-prev:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171 !important;
    }
    .swiper-button-next:after,
    .swiper-button-prev:after {
        font-size: 20px !important;
    }
`;

export default function LandingPage() {
    const [filter, setFilter] = useState('전체')
    const [covers, setCovers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [debugInfo, setDebugInfo] = useState(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [previousPath, setPreviousPath] = useState('')
    const navigate = useNavigate()
    const location = useLocation()

    const FILTERS = ['전체', '인기순', '최신순']

    // 페이지 전환 감지 및 애니메이션 트리거
    useEffect(() => {
        if (previousPath && previousPath !== location.pathname) {
            setIsTransitioning(true)
            setTimeout(() => {
                setIsTransitioning(false)
            }, 600)
        }
        setPreviousPath(location.pathname)
    }, [location.pathname, previousPath])

    useEffect(() => {
        const fetchCovers = async () => {
            try {
                setLoading(true)
                setError(null)
                
                console.log('🔍 Fetching covers...', { 
                    filter, 
                    pathname: location.pathname,
                    isWorkingOn: location.pathname === '/workingon'
                })

                let response

                // API 호출
                try {
                    switch (filter) {
                        case '인기순':
                            response = await coverService.getCoversByLikes()
                            break
                        case '최신순':
                            response = await coverService.getAllCovers()
                            break
                        default:
                            response = await coverService.getCoversByViews()
                    }
                } catch (apiError) {
                    // 401 에러가 발생해도 빈 배열로 처리하고 계속 진행
                    if (apiError.response?.status === 401) {
                        console.warn('인증되지 않은 상태로 데이터를 가져올 수 없습니다:', apiError)
                        setCovers([])
                        setLoading(false)
                        return
                    }
                    throw apiError // 다른 에러는 상위로 전파
                }
                
                console.log('📡 API Response:', response.data)
                
                if (response.data && Array.isArray(response.data)) {
                    let filteredCovers = response.data
                    
                    // 디버깅 정보 저장
                    const debug = {
                        totalCount: response.data.length,
                        sampleData: response.data.slice(0, 2),
                        filteringFor: location.pathname === '/workingon' ? 'working' : 'completed'
                    }

                    if (location.pathname === '/workingon') {
                        // 작업 중인 캔버스 (roomType이 EDITING인 것)
                        const before = filteredCovers.length
                        filteredCovers = response.data.filter(cover => {
                            const isWorking = cover.roomType === RoomType.EDITING
                            console.log(`🎨 Cover "${cover.title}": roomType=${cover.roomType}, isWorking=${isWorking}`)
                            return isWorking
                        })
                        
                        debug.beforeFilter = before
                        debug.afterFilter = filteredCovers.length
                        debug.workingCovers = filteredCovers.map(c => ({
                            id: c.id,
                            title: c.title,
                            roomType: c.roomType,
                            roomId: c.roomId
                        }))
                        
                        console.log(`📊 Working canvas filter: ${before} → ${filteredCovers.length}`)
                    } else {
                        // 완성된 캔버스 (roomType이 COMPLETE인 것)
                        const before = filteredCovers.length
                        filteredCovers = response.data.filter(cover => {
                            const isCompleted = cover.roomType === RoomType.COMPLETE
                            console.log(`🎭 Cover "${cover.title}": roomType=${cover.roomType}, isCompleted=${isCompleted}`)
                            return isCompleted
                        })
                        
                        debug.beforeFilter = before
                        debug.afterFilter = filteredCovers.length
                        debug.completedCovers = filteredCovers.map(c => ({
                            id: c.id,
                            title: c.title,
                            roomType: c.roomType
                        }))
                        
                        console.log(`📊 Completed canvas filter: ${before} → ${filteredCovers.length}`)
                    }
                    
                    setDebugInfo(debug)
                    setCovers(filteredCovers)
                } else {
                    console.warn('⚠️ Invalid API response format:', response)
                    setCovers([])
                    setDebugInfo({ error: 'Invalid response format', response })
                }
                
            } catch (err) {
                console.error('❌ API Error:', err)
                setError(err.message)
                setCovers([])
                setDebugInfo({ error: err.message, stack: err.stack })
            } finally {
                setLoading(false)
            }
        }

        fetchCovers()
    }, [filter, location.pathname])

    // 🔧 카드 클릭 핸들러 - 모든 카드는 먼저 보기 모드로
    const handleCardClick = (cover) => {
        if (cover.roomType === RoomType.COMPLETE) {
            navigate(`/completed/${cover.id}`);
        } else {
            navigate(`/canvas/${cover.id}`);
        }
    }

    const getPageInfo = () => {
        if (location.pathname === '/workingon') {
            return {
                title: '작업 중인 캔버스',
                description: '현재 작업 중인 캔버스들입니다. 클릭하여 내용을 확인하고 편집을 계속하세요.',
                emptyIcon: '✏️',
                emptyMessage: '작업 중인 캔버스가 없습니다.',
                bgGradient: 'from-red-400/20 via-red-400/20 to-white-400/20',
                containerStyle: 'workspace'
            }
        }
        return {
            title: '완성된 작품 갤러리', 
            description: '완성된 작품들을 감상해보세요.',
            emptyIcon: '🎨',
            emptyMessage: '완성된 작품이 없습니다.',
            bgGradient: 'from-red-400/20 via-purple-400/20 to-white-400/20',
            containerStyle: 'gallery'
        }
    }

    const pageInfo = getPageInfo()
    const showFilters = location.pathname !== '/workingon'
    const isWorkspace = location.pathname === '/workingon'

    // 전환 효과 클래스
    const getTransitionClasses = () => {
        if (isTransitioning) {
            return isWorkspace 
                ? 'transform rotate-y-180 scale-95 opacity-50' 
                : 'transform -rotate-y-180 scale-95 opacity-50'
        }
        return 'transform rotate-y-0 scale-100 opacity-100'
    }

    const getBackgroundClasses = () => {
        const baseClasses = `min-h-screen transition-all duration-700 ease-in-out `
        
        if (isWorkspace) {
            return `${baseClasses} ${isTransitioning ? 'blur-sm' : ''}`
        }
        return `${baseClasses} ${isTransitioning ? 'blur-sm' : ''}`
    }

    const getStatusStyle = (status) => {
        if (status === filter) {
            return 'bg-red-500 text-white shadow-lg'
        }
        return 'bg-black border-2 border-white/20 text-white hover:bg-red-500'
    }

    // 필터별로 커버 데이터 분류
    const categorizedCovers = {
        '인기순': covers.filter(cover => cover.likeNum > 0).sort((a, b) => b.likeNum - a.likeNum),
        '최신순': covers.sort((a, b) => new Date(b.time) - new Date(a.time)),
        '전체': covers
    };

    // 로딩 상태
    if (loading) {
        return (
            <div className={getBackgroundClasses()}>
                <MouseFollower />
                <div className="container mx-auto px-8 py-8">
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                        <div className="w-12 h-12 border-4 border-yellow-300/20 border-t-yellow-300/80 rounded-full animate-spin"></div>
                        <div className="text-xl text-white">
                            {isWorkspace ? '작업 중인 캔버스를 불러오는 중...' : '갤러리를 불러오는 중...'}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 에러 상태
    if (error) {
        return (
            <div className="min-h-screen bg-black">
                <div className="container mx-auto px-8 py-8">
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                        <div className="text-6xl">❌</div>
                        <div className="text-xl text-red-600">데이터를 불러오는 중 오류가 발생했습니다</div>
                        <div className="text-sm text-white-600">{error}</div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <style>{customStyles}</style>
            <div className={getBackgroundClasses()}>
                {/* 마우스 커서 효과 */}
                <MouseFollower />
                
                {/* 작업실 효과를 위한 배경 요소들 */}
                {isWorkspace && (
                    <>
                        <div className="fixed inset-0 pointer-events-none">
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-32 bg-black/10 rounded-full blur-xl"></div>
                        </div>
                        <div className="fixed inset-0 pointer-events-none opacity-5">
                            <div className="w-full h-full" style={{
                                backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }}></div>
                        </div>
                    </>
                )}

                {/* 메인 컨텐츠 */}
                <div className={`
                    relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8 
                    transition-all duration-700 ease-in-out transform-gpu
                    ${getTransitionClasses()}
                    ${isWorkspace ? 'perspective-1000' : ''}
                `}>
                    <div className="max-w-7xl mx-auto">
                        {/* 페이지 헤더 */}
                        <div className={`
                            mb-6 transition-all duration-500 delay-100
                            ${isTransitioning ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}
                        `}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-2">
                                            {pageInfo.title}
                                        </h1>
                                        <p className="text-red-100/80">
                                            {pageInfo.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 필터 버튼들 (갤러리에서만 표시) */}
                        {showFilters && (
                            <div className={`
                                flex space-x-3 mb-8 transition-all duration-500 delay-200
                                ${isTransitioning ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'}
                            `}>
                                {FILTERS.map((f, index) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`
                                            px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                                            transform hover:scale-105
                                            ${getStatusStyle(f)}
                                        `}
                                        style={{ transitionDelay: `${index * 50}ms` }}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 빈 상태 */}
                        {covers.length === 0 && (
                            <div className={`
                                flex flex-col items-center justify-center min-h-[40vh] text-white
                                transition-all duration-700 delay-300
                                ${isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
                            `}>
                                <div className={`
                                    text-6xl mb-6 transition-transform duration-1000
                                    ${isWorkspace ? 'animate-bounce' : 'animate-pulse'}
                                `}>
                                    {pageInfo.emptyIcon}
                                </div>
                                <div className="text-xl mb-6">{pageInfo.emptyMessage}</div>
                                {isWorkspace && (
                                    <button
                                        onClick={() => navigate('/editor/new')}
                                        className="px-8 py-4 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                    >
                                        새 캔버스 만들기
                                    </button>
                                )}
                            </div>
                        )}

                        {/* 캔버스 목록 */}
                        {covers.length > 0 && (
                            <div className={`
                                transition-all duration-700 delay-300
                                ${isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
                            `}>
                                {/* 그리드 레이아웃 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                                    {covers.map((cover, index) => (
                                        <div
                                            key={cover.id}
                                            className="transition-all duration-300 ease-in-out"
                                            style={{ animationDelay: `${index * 80}ms` }}
                                        >
                                            <CanvasCard
                                                title={cover.title}
                                                timeAgo={new Date(cover.time).toLocaleDateString()}
                                                description={
                                                    isWorkspace
                                                        ? `${cover.roomType === 'EDITING' ? '편집 중' : '편집 가능'} • ${new Date(cover.time).toLocaleTimeString()}`
                                                        : `조회수: ${cover.view || 0} | 좋아요: ${cover.likeNum || 0}`
                                                }
                                                imgSrc={cover.coverImageUrl}
                                                onClick={() => handleCardClick(cover)}
                                                cardType={isWorkspace ? 'workspace' : 'gallery'}
                                                roomType={cover.roomType}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 페이지 전환 오버레이 */}
                {isTransitioning && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 pointer-events-none transition-opacity duration-300"></div>
                )}
            </div>
        </>
    )
}