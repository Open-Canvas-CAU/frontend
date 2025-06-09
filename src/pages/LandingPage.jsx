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
    const [currentSlide, setCurrentSlide] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()

    const FILTERS = ['전체', '인기순', '최신순']

    useEffect(() => {
        const fetchCovers = async () => {
            try {
                setLoading(true)
                let response
                
                if (location.pathname === '/workingon') {
                    response = await coverService.getWorkingOnCovers()
                } else {
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
                }
                
                console.log('API Response:', response)
                setCovers(response.data || [])
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
        console.log('Card clicked:', doc, 'Current path:', location.pathname)
        
        if (location.pathname === '/workingon') {
            navigate(`/editor/${doc.contentId}`)
        } else if (doc.contentId) {
            navigate(`/completed/${doc.contentId}`)
        } else {
            console.error('컨텐츠 ID가 없습니다:', doc)
        }
    }

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
                <div className="flex space-x-3 mb-8">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold
                                ${filter === f
                                    ? 'bg-yellow-300/20 text-yellow-300'
                                    : 'bg-solarized-base2 text-solarized-base01 hover:bg-red'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {!loading && covers.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] text-solarized-base00">
                        <div className="text-2xl mb-2">🔍</div>
                        <div className="text-xl">
                            표시할 캔버스가 없습니다.
                        </div>
                    </div>
                )}

                {!loading && covers.length > 0 && (
                    <div className="relative h-[400px]">
                        <Swiper
                            modules={[Navigation]}
                            spaceBetween={24}
                            slidesPerView={4}
                            navigation
                            loop={true}
                            className="h-full"
                        >
                            {covers.map((doc) => (
                                <SwiperSlide key={doc.contentId}>
                                    <div className="h-full flex items-center justify-center">
                                        <CanvasCard
                                            title={doc.title}
                                            timeAgo={new Date(doc.time).toLocaleDateString()}
                                            description={`조회수: ${doc.view} | 좋아요: ${doc.likeNum || 0}`}
                                            imgSrc={doc.coverImageUrl}
                                            onClick={() => handleCardClick(doc)}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}
            </div>
        </div>
    )
}
