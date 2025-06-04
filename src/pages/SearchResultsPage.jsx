// src/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SearchBar                    from '@/components/features/landing/SearchBar'
import CanvasCard                   from '@/components/features/landing/CanvasCard'

export default function SearchResultsPage() {
    const navigate = useNavigate()
    const { search } = useLocation()
    const params     = new URLSearchParams(search)
    const query      = params.get('q') || ''

    // replace these with your real API calls
    const [results, setResults]           = useState([])
    const [recommendations, setRecs]      = useState([])

    useEffect(() => {
        // TODO: fetch(`/api/search?q=${query}`).then(...)
        const dummy = Array.from({ length: 4 }).map((_, i) => ({
            id:       `res${i}`,
            title:    `제목 ${i + 1}`,
            timeAgo:  '3 Minute ago',
            desc:     'Lorem ipsum dolor sit amet consectetur.',
            imgSrc:   `https://placehold.co/349x231?text=${i + 1}`,
        }))
        setResults(dummy)

        const recs = Array.from({ length: 6 }).map((_, i) => ({
            id:       `rec${i}`,
            title:    `추천 ${i + 1}`,
            timeAgo:  '5 Minute ago',
            desc:     '추천 설명입니다.',
            imgSrc:   `https://placehold.co/348x231?text=R${i + 1}`,
        }))
        setRecs(recs)
    }, [query])

    const goTo = (id) => navigate(`/completed/${id}`)

    return (
        <div className="min-h-screen px-8 py-6 space-y-12">
            {/* 1) Search Bar */}
            <SearchBar
                value={query}
                onChange={() => {}}
                onSearch={() => navigate(`/search?q=${query}`)}
                className="mx-auto max-w-xl"
            />

            {/* 2) Search Results */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-white text-3xl font-semibold">검색 결과</h2>
                    <span className="text-zinc-300 text-lg font-medium">
            총 {results.length}개의 결과
          </span>
                    <button
                        onClick={() => navigate(`/search?q=${query}&all=true`)}
                        className="text-blue-300 text-xl font-medium underline leading-tight"
                    >
                        Show all
                    </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {results.map(doc => (
                        <CanvasCard
                            key={doc.id}
                            title={doc.title}
                            timeAgo={doc.timeAgo}
                            description={doc.desc}
                            imgSrc={doc.imgSrc}
                            onClick={() => goTo(doc.id)}
                        />
                    ))}
                </div>
            </section>

            {/* 3) Recommendations */}
            <section className="space-y-4">
                <h3 className="text-white text-3xl font-semibold">
                    회원님을 위한 추천 캔버스
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {recommendations.map(doc => (
                        <CanvasCard
                            key={doc.id}
                            title={doc.title}
                            timeAgo={doc.timeAgo}
                            description={doc.desc}
                            imgSrc={doc.imgSrc}
                            onClick={() => goTo(doc.id)}
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}
