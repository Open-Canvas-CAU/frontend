import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SearchBar                    from '@/components/features/landing/SearchBar'
import CanvasCard                   from '@/components/features/landing/CanvasCard'
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

    // URL의 query 파라미터가 변경될 때만 검색 실행
    useEffect(() => {
        if (query) {
            fetchSearchResults(query)
        }
    }, [searchParams])

    const fetchSearchResults = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setCovers([])
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const response = await coverService.searchCovers(searchQuery)
            setCovers(response.data)
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

    if (loading) {
        return (
            <div className="container mx-auto px-8 py-8">
                <SearchBar
                    value={searchInput}
                    onChange={setSearchInput}
                    onSearch={handleSearch}
                    onKeyPress={handleKeyPress}
                    className="mb-8"
                />
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-gray-600">검색 중...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-8 py-8">
                <SearchBar
                    value={searchInput}
                    onChange={setSearchInput}
                    onSearch={handleSearch}
                    onKeyPress={handleKeyPress}
                    className="mb-8"
                />
                <div className="flex items-center justify-center h-64">
                    <div className="text-xl text-red-600">에러가 발생했습니다: {error}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-8 py-8">
            <SearchBar
                value={searchInput}
                onChange={setSearchInput}
                onSearch={handleSearch}
                onKeyPress={handleKeyPress}
                className="mb-8"
            />

            {!hasSearched ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">
                        검색어를 입력하고 엔터키를 누르거나 검색 버튼을 클릭하세요.
                    </p>
                </div>
            ) : covers.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">
                        검색 결과가 없습니다.
                    </p>
                </div>
            ) : (
                <>
                    <h1 className="text-2xl font-bold mb-8">
                        "{query}" 검색 결과
                    </h1>
                    <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {covers.map(doc => (
                            <CanvasCard
                                key={doc.contentId}
                                title={doc.title}
                                timeAgo={new Date(doc.time).toLocaleDateString()}
                                description={`조회수: ${doc.view} | 좋아요: ${doc.likeNum}`}
                                imgSrc={doc.coverImageUrl}
                                onClick={() => navigate(`/completed/${doc.docId}`)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
