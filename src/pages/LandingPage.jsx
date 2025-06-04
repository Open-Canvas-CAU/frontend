// src/pages/LandingPage.jsx
import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SearchBar  from '@/components/features/landing/SearchBar'
import CanvasCard from '@/components/features/landing/CanvasCard'

export default function LandingPage() {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [query, setQuery]   = useState('')
    const [filter, setFilter] = useState('전체')

    const FILTERS = ['전체', '인기', '새로운 것들']

    const dummy = useMemo(
        () =>
            Array.from({ length: 8 }).map((_, i) => ({
                id:       `doc${i}`,
                title:    `제목 ${i + 1}`,
                timeAgo:  '3 Minute ago',
                desc:     'Lorem ipsum dolor sit amet consectetur.',
                imgSrc:   `https://placehold.co/348x231?text=${i + 1}`,
                category: FILTERS[i % FILTERS.length],
                status:   i % 2 === 0 ? 'completed' : 'draft',
            })),
        []
    )

    const visibleDocs = useMemo(() => {
        return dummy
            // status filter by route
            .filter(doc => {
                if (pathname === '/gallery') return doc.status === 'completed'
                if (pathname === '/workingon') return doc.status === 'draft'
                return true
            })
            // category filter
            .filter(doc => (filter === '전체' || doc.category === filter))
            // search filter
            .filter(doc => doc.title.includes(query))
    }, [dummy, filter, query, pathname])

    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`)
        }
    }

    const handleCardClick = doc => {
        if (doc.status === 'completed') {
            navigate(`/completed/${doc.id}`)
        } else {
            navigate(`/editor/${doc.id}`)
        }
    }

    return (
        <div className="container mx-auto px-8 py-8">
            {/* 검색 + 토글 필터 */}
            <div className="flex-row items-start md:items-center justify-between mb-8 space-y-4 md:space-y-0">
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    onSearch={handleSearch}
                    className="flex-1 max-w-md md:mr-6"
                />
                <div className="flex space-x-3">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold
                ${filter === f
                                ? 'bg-teal-200 text-teal-800'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`

                            }
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* 반응형 그리드 */}
            <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {visibleDocs.map(doc => (
                    <CanvasCard
                        key={doc.id}
                        title={doc.title}
                        timeAgo={doc.timeAgo}
                        description={doc.desc}
                        imgSrc={doc.imgSrc}
                        onClick={() => handleCardClick(doc)}
                    />
                ))}
            </div>
        </div>
    )
}
