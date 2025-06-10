import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SearchBar from '@/components/features/landing/SearchBar'
import CanvasCard from '@/components/features/landing/CanvasCard'
import { coverService } from '@/services/coverService'

export default function SearchResultsPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    const [searchInput, setSearchInput] = useState(query)
    const [covers, setCovers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)
    const [searchStats, setSearchStats] = useState({ total: 0, time: 0 })
    const [filters, setFilters] = useState({
        type: 'all', // 'all', 'completed', 'working'
        sortBy: 'relevance' // 'relevance', 'latest', 'popular'
    })

    // URL의 query 파라미터가 변경될 때만 검색 실행
    useEffect(() => {
        if (query) {
            fetchSearchResults(query)
        }
    }, [searchParams, filters])

    const fetchSearchResults = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setCovers([])
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const startTime = Date.now()
            
            const response = await coverService.searchCovers(searchQuery)
            let results = response.data || []
            
            // 필터 적용
            if (filters.type !== 'all') {
                results = results.filter(cover => {
                    if (filters.type === 'completed') {
                        return cover.roomType === 'COMPLETE'
                    } else if (filters.type === 'working') {
                        return cover.roomType === 'EDITING' || cover.roomType === 'AVAILABLE'
                    }
                    return true
                })
            }
            
            // 정렬 적용
            if (filters.sortBy === 'latest') {
                results.sort((a, b) => new Date(b.time) - new Date(a.time))
            } else if (filters.sortBy === 'popular') {
                results.sort((a, b) => (b.likeNum || 0) - (a.likeNum || 0))
            }
            
            const endTime = Date.now()
            
            setCovers(results)
            setSearchStats({
                total: results.length,
                time: (endTime - startTime) / 1000
            })
            setHasSearched(true)
            
        } catch (err) {
            console.error('검색 결과를 불러오는데 실패했습니다:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        if (searchInput.trim()) {
            setSearchParams({ q: searchInput.trim() })
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleCardClick = (cover) => {
        navigate(`/cover/${cover.id}`)
    }

    const getStatusInfo = (cover) => {
        switch (cover.roomType) {
            case 'EDITING':
                return { icon: '⚡', text: '편집 중', color: 'text-blue-500', bgColor: 'bg-blue-50' }
            case 'AVAILABLE':
                return { icon: '🎨', text: '편집 가능', color: 'text-green-500', bgColor: 'bg-green-50' }
            case 'COMPLETE':
                return { icon: '✨', text: '완성', color: 'text-purple-500', bgColor: 'bg-purple-50' }
            default:
                return { icon: '❓', text: '알 수 없음', color: 'text-gray-500', bgColor: 'bg-gray-50' }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="container mx-auto px-8 py-8">
                    {/* 검색바 */}
                    <div className="mb-8">
                        <SearchBar
                            value={searchInput}
                            onChange={setSearchInput}
                            onSearch={handleSearch}
                            onKeyPress={handleKeyPress}
                            className="max-w-2xl mx-auto"
                        />
                    </div>
                    
                    {/* 로딩 상태 */}
                    <div className="flex flex-col items-center justify-center h-64 space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin animation-delay-150"></div>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="text-xl text-gray-700 font-medium">"{query}" 검색 중...</div>
                            <div className="text-sm text-gray-500">최고의 결과를 찾고 있습니다</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
                <div className="container mx-auto px-8 py-8">
                    <SearchBar
                        value={searchInput}
                        onChange={setSearchInput}
                        onSearch={handleSearch}
                        onKeyPress={handleKeyPress}
                        className="mb-8 max-w-2xl mx-auto"
                    />
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center space-y-4">
                            <div className="text-6xl">⚠️</div>
                            <div className="text-xl text-red-600">검색 중 오류가 발생했습니다</div>
                            <div className="text-gray-600">{error}</div>
                            <button
                                onClick={() => fetchSearchResults(query)}
                                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                            >
                                다시 시도
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            {/* 배경 장식 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse animation-delay-700"></div>
            </div>

            <div className="relative z-10 container mx-auto px-8 py-8">
                {/* 검색바 */}
                <div className="mb-8">
                    <SearchBar
                        value={searchInput}
                        onChange={setSearchInput}
                        onSearch={handleSearch}
                        onKeyPress={handleKeyPress}
                        className="max-w-2xl mx-auto"
                    />
                </div>

                {!hasSearched ? (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-8 opacity-60">🔍</div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">무엇을 찾고 계신가요?</h2>
                        <p className="text-gray-600 text-lg max-w-md mx-auto">
                            검색어를 입력하고 엔터키를 누르거나 검색 버튼을 클릭하세요.
                        </p>
                    </div>
                ) : covers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-8 opacity-60">📭</div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">검색 결과가 없습니다</h2>
                        <p className="text-gray-600 text-lg mb-8">
                            "{query}"에 대한 검색 결과를 찾을 수 없습니다.
                        </p>
                        <div className="space-y-4 max-w-md mx-auto">
                            <p className="text-sm text-gray-500">검색 팁:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• 다른 키워드로 시도해보세요</li>
                                <li>• 좀 더 일반적인 용어를 사용해보세요</li>
                                <li>• 맞춤법을 확인해보세요</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 검색 결과 헤더 */}
                        <div className="mb-8">
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                            "{query}" 검색 결과
                                        </h1>
                                        <p className="text-gray-600">
                                            총 <span className="font-semibold text-blue-600">{searchStats.total}</span>개 결과 
                                            ({searchStats.time.toFixed(2)}초)
                                        </p>
                                    </div>
                                    
                                    {/* 필터 및 정렬 */}
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm font-medium text-gray-600">유형:</label>
                                            <select
                                                value={filters.type}
                                                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                                className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="all">전체</option>
                                                <option value="completed">완성작</option>
                                                <option value="working">작업 중</option>
                                            </select>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm font-medium text-gray-600">정렬:</label>
                                            <select
                                                value={filters.sortBy}
                                                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                                className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="relevance">관련도순</option>
                                                <option value="latest">최신순</option>
                                                <option value="popular">인기순</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 검색 결과 그리드 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {covers.map((cover, index) => {
                                const statusInfo = getStatusInfo(cover)
                                return (
                                    <div 
                                        key={cover.id} 
                                        className="transform transition-all duration-500 hover:scale-105"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <CanvasCard
                                            title={cover.title}
                                            timeAgo={new Date(cover.time).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                            description={
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
                                                            <span className="mr-1">{statusInfo.icon}</span>
                                                            {statusInfo.text}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span className="flex items-center space-x-1">
                                                            <span>👁️</span>
                                                            <span>{cover.view || 0}</span>
                                                        </span>
                                                        <span className="flex items-center space-x-1">
                                                            <span>❤️</span>
                                                            <span>{cover.likeNum || 0}</span>
                                                        </span>
                                                        {cover.limit && (
                                                            <span className="text-xs text-gray-400">
                                                                최대 {cover.limit}명
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            }
                                            imgSrc={cover.coverImageUrl}
                                            onClick={() => handleCardClick(cover)}
                                            cardType={cover.roomType === 'COMPLETE' ? 'gallery' : 'workspace'}
                                            status={statusInfo}
                                            stats={{
                                                views: cover.view,
                                                likes: cover.likeNum,
                                                progress: cover.roomType === 'COMPLETE' ? 100 : Math.floor(Math.random() * 80) + 20
                                            }}
                                        />
                                    </div>
                                )
                            })}
                        </div>

                        {/* 추가 액션 */}
                        <div className="mt-16 text-center">
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-8 max-w-2xl mx-auto">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">원하는 결과를 찾지 못하셨나요?</h3>
                                <p className="text-gray-600 mb-6">
                                    직접 새로운 캔버스를 만들어 여러분만의 이야기를 시작해보세요!
                                </p>
                                <button
                                    onClick={() => navigate('/editor/new')}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    ✨ 새 캔버스 만들기
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}