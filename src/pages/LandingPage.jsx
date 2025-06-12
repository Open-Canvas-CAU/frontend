import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import CanvasCard from '@/components/features/landing/CanvasCard'
import { coverService } from '@/services/coverService'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

export default function LandingPage() {
    const [filter, setFilter] = useState('전체')
    const [covers, setCovers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [debugInfo, setDebugInfo] = useState(null) // 디버깅 정보 추가
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
                
                console.log('📡 API Response:', response.data)
                
                if (response.data && Array.isArray(response.data)) {
                    let filteredCovers = response.data
                    
                    // 디버깅 정보 저장
                    const debug = {
                        totalCount: response.data.length,
                        sampleData: response.data.slice(0, 2), // 처음 2개만 샘플로
                        filteringFor: location.pathname === '/workingon' ? 'working' : 'completed'
                    }

                    if (location.pathname === '/workingon') {
                        // 작업 중인 캔버스 (contentId가 null이거나 undefined)
                        const before = filteredCovers.length
                        filteredCovers = response.data.filter(cover => {
                            const isWorking = cover.contentId === null || cover.contentId === undefined
                            console.log(`🎨 Cover "${cover.title}": contentId=${cover.contentId}, isWorking=${isWorking}`)
                            return isWorking
                        })
                        
                        debug.beforeFilter = before
                        debug.afterFilter = filteredCovers.length
                        debug.workingCovers = filteredCovers.map(c => ({
                            id: c.id,
                            title: c.title,
                            contentId: c.contentId,
                            roomType: c.roomType,
                            roomId: c.roomId
                        }))
                        
                        console.log(`📊 Working canvas filter: ${before} → ${filteredCovers.length}`)
                    } else {
                        // 완성된 캔버스 (contentId가 있음)
                        const before = filteredCovers.length
                        filteredCovers = response.data.filter(cover => {
                            const isCompleted = cover.contentId !== null && cover.contentId !== undefined
                            console.log(`🎭 Cover "${cover.title}": contentId=${cover.contentId}, isCompleted=${isCompleted}`)
                            return isCompleted
                        })
                        
                        debug.beforeFilter = before
                        debug.afterFilter = filteredCovers.length
                        debug.completedCovers = filteredCovers.map(c => ({
                            id: c.id,
                            title: c.title,
                            contentId: c.contentId,
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

    // src/pages/LandingPage.jsx에서 기존의 handleCardClick 함수를 찾아서 
// 아래 코드로 완전히 교체하세요

    const handleCardClick = (doc) => {
        console.log('🖱️ Card clicked:', doc)
        
        if (location.pathname === '/workingon') {
            // 작업 중인 캔버스 - 편집 모드로 이동
            if (doc.roomId) {
                console.log(`🎨 Navigating to editor: /editor/${doc.roomId}/edit`)
                navigate(`/editor/${doc.roomId}/edit`)
            } else {
                console.error('❌ No roomId found for working canvas:', doc)
                alert('편집할 수 없는 캔버스입니다. Room ID가 없습니다.')
            }
        } else {
            // 완성된 캔버스 - 완성작 보기로 이동  
            if (doc.contentId) {
                console.log(`🎭 Navigating to completed work: /completed/${doc.id}`)
                navigate(`/completed/${doc.id}`) // coverId로 이동
            } else {
                console.error('❌ No contentId found for completed canvas:', doc)
                alert('완성되지 않은 작품입니다.')
            }
        }
    }

    const getPageInfo = () => {
        if (location.pathname === '/workingon') {
            return {
                title: '작업 중인 캔버스',
                description: '현재 작업 중인 캔버스들입니다. 클릭하여 편집을 계속하세요.',
                emptyIcon: '✏️',
                emptyMessage: '작업 중인 캔버스가 없습니다.',
                bgGradient: 'from-orange-400/20 via-red-400/20 to-pink-400/20',
                containerStyle: 'workspace'
            }
        }
        return {
            title: '완성된 작품 갤러리', 
            description: '완성된 작품들을 감상해보세요.',
            emptyIcon: '🎨',
            emptyMessage: '완성된 작품이 없습니다.',
            bgGradient: 'from-blue-400/20 via-purple-400/20 to-pink-400/20',
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

    // 로딩 상태
    if (loading) {
        return (
            <div className={getBackgroundClasses()}>
                <div className="container mx-auto px-8 py-8">
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                        <div className="w-12 h-12 border-4 border-yellow-300/20 border-t-yellow-300/80 rounded-full animate-spin"></div>
                        <div className="text-xl text-solarized-base00">
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
            <div className={getBackgroundClasses()}>
                <div className="container mx-auto px-8 py-8">
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                        <div className="text-6xl">❌</div>
                        <div className="text-xl text-red-600">데이터를 불러오는 중 오류가 발생했습니다</div>
                        <div className="text-sm text-gray-600">{error}</div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            다시 시도
                        </button>
                        
                        {/* 디버깅 정보 (개발 환경에서만) */}
                        {process.env.NODE_ENV === 'development' && debugInfo && (
                            <details className="mt-4 p-4 bg-gray-100 rounded-lg max-w-2xl">
                                <summary className="cursor-pointer font-bold">디버깅 정보</summary>
                                <pre className="mt-2 text-xs overflow-auto">
                                    {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={getBackgroundClasses()}>
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
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-2xl
                                    transition-all duration-500
                                    ${isWorkspace 
                                        ? 'bg-orange-100 text-orange-600 rotate-12' 
                                        : 'bg-blue-100 text-blue-600 rotate-0'
                                    }
                                `}>
                                    {isWorkspace ? '⚡' : '🎨'}
                                </div>
                                
                                <div>
                                    <h1 className="text-3xl font-bold text-solarized-base00 mb-2">
                                        {pageInfo.title}
                                    </h1>
                                    <p className="text-solarized-base01">
                                        {pageInfo.description}
                                    </p>
                                </div>
                            </div>
                            
                            {/* 디버깅 정보 (개발 환경에서만) */}
                            {process.env.NODE_ENV === 'development' && debugInfo && (
                                <details className="text-xs bg-gray-100 p-2 rounded">
                                    <summary className="cursor-pointer">Debug ({covers.length})</summary>
                                    <pre className="mt-1 text-xs overflow-auto max-h-32">
                                        {JSON.stringify(debugInfo, null, 2)}
                                    </pre>
                                </details>
                            )}
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
                                        ${filter === f
                                            ? 'bg-yellow-300/20 text-yellow-300 shadow-lg' 
                                            : 'bg-solarized-base2 text-solarized-base01 hover:bg-red hover:shadow-md'
                                        }
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
                            flex flex-col items-center justify-center min-h-[40vh] text-solarized-base00
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
                                    className="px-8 py-4 bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                >
                                    새 캔버스 만들기
                                </button>
                            )}
                        </div>
                    )}

                    {/* 캔버스 목록 */}
                    {covers.length > 0 && (
                        <div className={`
                            transition-all duration-700 delay-400
                            ${isTransitioning ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}
                        `}>
                            <div className={`
                                relative h-[400px] 
                                ${isWorkspace ? 'transform perspective-1000 rotateX-2' : ''}
                            `}>
                                <Swiper
                                    modules={[Navigation]}
                                    spaceBetween={24}
                                    slidesPerView={Math.min(4, covers.length)}
                                    navigation
                                    loop={covers.length > 4}
                                    className="h-full"
                                >
                                    {covers.map((doc, index) => (
                                        <SwiperSlide key={`${doc.id}-${doc.contentId || 'working'}-${index}`}>
                                            <div 
                                                className={`
                                                    h-full flex items-center justify-center
                                                    transition-all duration-500 transform hover:scale-105
                                                    ${isWorkspace ? 'hover:rotateY-5 hover:shadow-2xl' : 'hover:shadow-xl'}
                                                `}
                                                style={{ 
                                                    transitionDelay: `${index * 100}ms`,
                                                    transformStyle: 'preserve-3d'
                                                }}
                                            >
                                                <CanvasCard
                                                    title={doc.title}
                                                    timeAgo={new Date(doc.time).toLocaleDateString()}
                                                    description={
                                                        isWorkspace
                                                            ? `${doc.roomType === 'EDITING' ? '편집 중' : '편집 가능'} • ${new Date(doc.time).toLocaleTimeString()}`
                                                            : `조회수: ${doc.view || 0} | 좋아요: ${doc.likeNum || 0}`
                                                    }
                                                    imgSrc={doc.coverImageUrl}
                                                    onClick={() => handleCardClick(doc)}
                                                    cardType={isWorkspace ? 'workspace' : 'gallery'}
                                                />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>

                            {/* 추가 액션 버튼 */}
                            {isWorkspace && (
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => navigate('/editor/new')}
                                        className="px-8 py-4 bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                                    >
                                        새 캔버스 추가하기
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 페이지 전환 오버레이 */}
            {isTransitioning && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 pointer-events-none transition-opacity duration-300"></div>
            )}
        </div>
    )
}