import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SearchBar from '@/components/features/landing/SearchBar'
import CanvasCard from '@/components/features/landing/CanvasCard'
import { coverService } from '@/services/coverService'

export default function LandingPage() {
    const navigate = useNavigate()
    const { pathname, search } = useLocation()
    const searchParams = new URLSearchParams(search)
    const initialQuery = searchParams.get('q') || ''
    
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState('전체')
    const [covers, setCovers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const FILTERS = ['전체', '인기', '새로운 것들']

    useEffect(() => {
        const fetchCovers = async () => {
            try {
                setLoading(true)
                setError(null)
                let response
                
                // 필터에 따른 API 호출만 수행
                switch (filter) {
                    case '인기':
                        response = await coverService.getCoversByLikes()
                        break
                    case '새로운 것들':
                        response = await coverService.getAllCovers()
                        break
                    default:
                        response = await coverService.getCoversByViews()
                }
                
                console.log('API Response:', response)
                setCovers(response.data || [])
            } catch (err) {
                console.error('API 에러:', err)
                setError(err.response?.data?.message || err.message || '데이터를 불러오는데 실패했습니다.')
                setCovers([])
            } finally {
                setLoading(false)
            }
        }

        fetchCovers()
    }, [filter]) // query 의존성 제거

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleCardClick = (doc) => {
        if (doc.contentId) {
            navigate(`/completed/${doc.contentId}`)
        } else {
            console.error('컨텐츠 ID가 없습니다:', doc)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-8 py-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="w-12 h-12 border-4 border-solarized-cyan/20 border-t-solarized-cyan/80 rounded-full animate-spin"></div>
                    <div className="text-xl text-solarized-base00">로딩 중...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-8 py-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="text-2xl text-solarized-red">⚠️</div>
                    <div className="text-xl text-solarized-red">{error}</div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-solarized-cyan text-solarized-base3 rounded-lg hover:bg-solarized-cyan/80 transition-colors"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-8 py-8">
            {/* 검색 + 토글 필터 */}
            <div className="flex-row items-start md:items-center justify-between mb-8 space-y-4 md:space-y-0">
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    onSearch={handleSearch}
                    onKeyPress={handleKeyPress}
                    className="flex-1 max-w-md md:mr-6"
                />
                <div className="flex space-x-3">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold
                                ${filter === f
                                    ? 'bg-solarized-cyan/20 text-solarized-cyan'
                                    : 'bg-solarized-base2 text-solarized-base01 hover:bg-solarized-base1'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* 검색 결과가 없을 때 */}
            {!loading && covers.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-solarized-base00">
                    <div className="text-2xl mb-2">🔍</div>
                    <div className="text-xl">
                        {query ? '검색 결과가 없습니다.' : '표시할 캔버스가 없습니다.'}
                    </div>
                </div>
            )}

            {/* 반응형 그리드 */}
            {!loading && covers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {covers.map(doc => (
                        <CanvasCard
                            key={doc.contentId}
                            title={doc.title}
                            timeAgo={new Date(doc.time).toLocaleDateString()}
                            description={`조회수: ${doc.view} | 좋아요: ${doc.likeNum || 0}`}
                            imgSrc={doc.coverImageUrl}
                            onClick={() => handleCardClick(doc)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
