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
    const navigate = useNavigate()
    const location = useLocation()

    const FILTERS = ['전체', '인기순', '최신순']

    useEffect(() => {
        const fetchCovers = async () => {
            try {
                setLoading(true)
                let response

                // 기존 API 사용하여 전체 목록 가져오기
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
                
                console.log('Raw API Response:', response)
                
                if (response.data) {
                    let filteredCovers = response.data

                    // 페이지별 필터링
                    if (location.pathname === '/workingon') {
                        // 작업 중: contentId가 null인 것들
                        filteredCovers = response.data.filter(cover => 
                            cover.contentId === null || cover.contentId === undefined
                        )
                    } else {
                        // 갤러리: contentId가 있는 것들 (완성작)
                        filteredCovers = response.data.filter(cover => 
                            cover.contentId !== null && cover.contentId !== undefined
                        )
                    }
                    
                    console.log('Filtered covers:', filteredCovers)
                    console.log('Filter condition - pathname:', location.pathname)
                    setCovers(filteredCovers)
                } else {
                    setCovers([])
                }
                
            } catch (err) {
                console.error('API 에러:', err)
                setCovers([])
            } finally {
                setLoading(false)
            }
        }

        fetchCovers()
    }, [filter, location.pathname])

    const handleCardClick = (doc) => {
        console.log('Card clicked:', doc)
        console.log('Current path:', location.pathname)
        
        if (location.pathname === '/workingon') {
            // 작업 중인 캔버스 - 에디터로 이동
            // cover.id를 roomId로 사용 (백엔드에서 동일한 값으로 관리되는 것으로 가정)
            if (doc.id) {
                console.log('Navigating to editor with roomId:', doc.id)
                navigate(`/editor/${doc.id}`)
            } else {
                console.error('Cover ID가 없습니다:', doc)
                alert('캔버스 정보가 올바르지 않습니다.')
            }
        } else {
            // 갤러리 - 완성된 작품으로 이동
            if (doc.contentId) {
                console.log('Navigating to completed with contentId:', doc.contentId)
                navigate(`/completed/${doc.contentId}`)
            } else {
                console.error('ContentId가 없습니다:', doc)
                alert('완성되지 않은 작품입니다.')
            }
        }
    }

    // 페이지 제목 및 설명
    const getPageInfo = () => {
        if (location.pathname === '/workingon') {
            return {
                title: '작업 중인 캔버스',
                description: '현재 작업 중인 캔버스들입니다. 클릭하여 편집을 계속하세요.',
                emptyIcon: '✏️',
                emptyMessage: '작업 중인 캔버스가 없습니다.'
            }
        }
        return {
            title: '완성된 작품 갤러리', 
            description: '완성된 작품들을 감상해보세요.',
            emptyIcon: '🎨',
            emptyMessage: '완성된 작품이 없습니다.'
        }
    }

    const pageInfo = getPageInfo()
    const showFilters = location.pathname !== '/workingon'

    if (loading) {
        return (
            <div className="container mx-auto px-8 py-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="w-12 h-12 border-4 border-yellow-300/20 border-t-yellow-300/80 rounded-full animate-spin"></div>
                    <div className="text-xl text-solarized-base00">로딩 중...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
                {/* 페이지 헤더 */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-solarized-base00 mb-2">
                        {pageInfo.title}
                    </h1>
                    <p className="text-solarized-base01">
                        {pageInfo.description}
                    </p>
                </div>

                {/* 필터 버튼들 (갤러리에서만 표시) */}
                {showFilters && (
                    <div className="flex space-x-3 mb-8">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors
                                    ${filter === f
                                        ? 'bg-yellow-300/20 text-yellow-300'
                                        : 'bg-solarized-base2 text-solarized-base01 hover:bg-red'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                )}

                {/* 빈 상태 */}
                {!loading && covers.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] text-solarized-base00">
                        <div className="text-4xl mb-4">{pageInfo.emptyIcon}</div>
                        <div className="text-xl mb-6">{pageInfo.emptyMessage}</div>
                        {location.pathname === '/workingon' && (
                            <button
                                onClick={() => navigate('/editor/new')}
                                className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-gray-800 rounded-full font-semibold transition-colors"
                            >
                                새 캔버스 만들기
                            </button>
                        )}
                    </div>
                )}

                {/* 캔버스 목록 */}
                {!loading && covers.length > 0 && (
                    <>
                        <div className="relative h-[400px]">
                            <Swiper
                                modules={[Navigation]}
                                spaceBetween={24}
                                slidesPerView={Math.min(4, covers.length)}
                                navigation
                                loop={covers.length > 4}
                                className="h-full"
                            >
                                {covers.map((doc) => (
                                    <SwiperSlide key={`${doc.id}-${doc.contentId || 'working'}`}>
                                        <div className="h-full flex items-center justify-center">
                                            <CanvasCard
                                                title={doc.title}
                                                timeAgo={new Date(doc.time).toLocaleDateString()}
                                                description={
                                                    location.pathname === '/workingon'
                                                        ? `작업 중 • ${new Date(doc.time).toLocaleTimeString()}`
                                                        : `조회수: ${doc.view || 0} | 좋아요: ${doc.likeNum || 0}`
                                                }
                                                imgSrc={doc.coverImageUrl}
                                                onClick={() => handleCardClick(doc)}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* 추가 액션 버튼 */}
                        {location.pathname === '/workingon' && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => navigate('/editor/new')}
                                    className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-gray-800 rounded-full font-semibold transition-colors"
                                >
                                    새 캔버스 추가하기
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}