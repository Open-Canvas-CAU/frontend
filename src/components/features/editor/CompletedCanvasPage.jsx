// src/components/editor/CompletedCanvasPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CanvasCard      from '../landing/CanvasCard'
import CarouselEditor  from './CarouselEditor'
import VoteSection     from './VoteSection'
import { getVoteInfo, vote } from '@/api/vote'

// 아이콘 자산 가져오기
import StarIconUrl    from '@/assets/icons/star.svg'
import StarFillUrl    from '@/assets/icons/star-fill.svg'
import ClockIconUrl   from '@/assets/icons/clock-rewind.svg'
import CommentIconUrl from '@/assets/icons/comment.svg'

export default function CompletedCanvasPage({ canvasId = 'dummy-canvas-id' }) {
    const navigate = useNavigate()

    // drawers & favorites
    const [showVersions, setShowVersions] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [lastOpened,   setLastOpened]   = useState(null)
    const [isFav,        setIsFav]        = useState(false)
    const drawerOpen = showVersions || showComments

    // two static variants (you can replace these with real data)
    const variant1 = `
    <p>Variant 1: Lorem ipsum dolor sit amet consectetur. Cursus mi scelerisque non mauris cras.</p>
    <p>Enim etiam dignissim cursus quam at vestibulum. Vestibulum integer ultrices etiam id a sit sagittis.</p>
  `
    const variant2 = `
    <p>Variant 2: Lorem ipsum dolor sit amet consectetur. Cursus mi scelerisque non mauris cras.</p>
    <p>Enim etiam dignissim cursus quam at vestibulum. Vestibulum integer ultrices etiam id a sit sagittis.</p>
  `
    const [bodyVariants] = useState([variant1.trim(), variant2.trim()])

    // 투표 관련 상태
    const [voteDeadline, setVoteDeadline] = useState(null)
    const [hasVoted, setHasVoted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isDeadlinePassed, setIsDeadlinePassed] = useState(false)
    const [winnerVersion, setWinnerVersion] = useState(null)

    // 투표 정보 fetch
    useEffect(() => {
        async function fetchVoteInfo() {
            try {
                const data = await getVoteInfo(canvasId)
                setVoteDeadline(data.voteDeadline)
                setHasVoted(data.hasVoted)
                setWinnerVersion(data.winnerVersion)
                setIsDeadlinePassed(new Date() > new Date(data.voteDeadline))
            } catch (e) {
                // 에러 처리 (예: alert 또는 무시)
            }
        }
        fetchVoteInfo()
    }, [canvasId])

    // 투표 핸들러
    const handleVote = async (versionId) => {
        setLoading(true)
        try {
            await vote(canvasId, versionId)
            setHasVoted(true)
        } catch (e) {
            alert('투표에 실패했습니다. 다시 시도해주세요.')
        }
        setLoading(false)
    }

    // dummy recommendations
    const recommendations = Array.from({ length: 6 }).map((_, i) => ({
        id:          `rec${i}`,
        title:       '제목',
        timeAgo:     '3 Minute ago',
        description: 'Lorem ipsum dolor sit amet consectetur.',
        imgSrc:      `https://placehold.co/467x290?text=${i + 1}`,
    }))

    // toggle handlers – also track layering
    const toggleVersions = () => {
        const now = !showVersions
        if (now) setLastOpened('versions')
        setShowVersions(now)
    }
    const toggleComments = () => {
        const now = !showComments
        if (now) setLastOpened('comments')
        setShowComments(now)
    }

    return (
        <div className="min-h-screen py-8 flex bg-zinc-100">
            {/* ───────── MAIN CONTENT ───────── */}
            <div className="flex-1 transition-all duration-300 ease-in-out">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center space-x-1 text-zinc-700 hover:text-zinc-900"
                            >
                                <span className="inline-block w-4 h-4 border-b-2 border-l-2 border-zinc-700 rotate-45" />
                                <span>뒤로 가기</span>
                            </button>
                            <div className="text-black text-3xl font-semibold">캔버스 제목</div>
                            <span className="text-zinc-400 text-lg font-medium">3 Minute ago</span>
                        </div>

                        <div className="p-6 space-y-12">
                            {/* 설명 + 아이콘 */}
                            <div className="flex items-center justify-between">
                                <p className="text-black text-2xl font-medium leading-10">
                                    한줄 작품 설명 한줄 작품 설명 한줄 작품 설명 한줄 작품 설명
                                </p>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setIsFav(f => !f)}
                                        className="p-1 hover:opacity-80"
                                    >
                                        <img
                                            src={isFav ? StarFillUrl : StarIconUrl}
                                            alt="star"
                                            className="w-6 h-6"
                                        />
                                    </button>
                                    <button
                                        onClick={toggleVersions}
                                        className="p-1 hover:opacity-80"
                                    >
                                        <img src={ClockIconUrl} alt="clock" className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={toggleComments}
                                        className="p-1 hover:opacity-80"
                                    >
                                        <img src={CommentIconUrl} alt="comment" className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* 본문 → now a carousel of two variants */}
                            <CarouselEditor
                                variants={bodyVariants}
                                readOnly={true}
                                onChange={() => { /* readOnly for completed */ }}
                            />

                            {/* 투표 섹션 추가 */}
                            <VoteSection
                                voteDeadline={voteDeadline}
                                onVote={handleVote}
                                hasVoted={hasVoted}
                                loading={loading}
                                isDeadlinePassed={isDeadlinePassed}
                                winnerVersion={winnerVersion}
                            />

                            {/* 추천 작품 */}
                            <div>
                                <h3 className="text-black text-4xl font-semibold mb-6">
                                    이런 작품은 어때요
                                </h3>
                                <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {recommendations.map(rec => (
                                        <CanvasCard
                                            key={rec.id}
                                            title={rec.title}
                                            timeAgo={rec.timeAgo}
                                            description={rec.description}
                                            imgSrc={rec.imgSrc}
                                            onClick={() => navigate(`/editor/${rec.id}`)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ───────── DRAWER WRAPPER ───────── */}
            <div
                className={`
          relative transition-all duration-300 ease-in-out
          ${drawerOpen ? 'w-[30%]' : 'w-0'}
          overflow-hidden
        `}
            >
                {/* Versions Drawer */}
                {showVersions && (
                    <div
                        className={`
              absolute inset-0 bg-white p-8
              ${lastOpened === 'versions' ? 'z-50' : 'z-40'}
            `}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-base font-semibold text-gray-500">버전 내역</h5>
                            <button
                                onClick={toggleVersions}
                                className="text-gray-400 hover:bg-gray-200 rounded-full p-1"
                            >✕</button>
                        </div>
                        <ol className="relative border-l border-gray-200">
                            {['1.0','0.9','0.8'].map(v => (
                                <li key={v} className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                    <img src={ClockIconUrl} alt="" className="w-3 h-3" />
                  </span>
                                    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-xs sm:flex">
                                        <time className="mb-1 text-xs text-gray-400 sm:order-last sm:mb-0">
                                            {v === '1.0' ? 'just now' : v==='0.9' ? '2 hours ago' : '1 day ago'}
                                        </time>
                                        <div className="text-sm text-gray-500">
                                            Released <span className="font-semibold text-blue-600">v{v}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Comments Drawer (no changes) */}
                {showComments && (
                    <div
                        className={`
              absolute inset-0 bg-white p-8
              ${lastOpened === 'comments' ? 'z-50' : 'z-40'}
            `}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-base font-semibold text-gray-500">댓글</h5>
                            <button
                                onClick={toggleComments}
                                className="text-gray-400 hover:bg-gray-200 rounded-full p-1"
                            >✕
                            </button>
                        </div>
                        <div className="space-y-6">
                            {[{name: '홍길동', time: '10분 전', text: '멋진 작품입니다!'}].map((c, i) => (
                                <div key={i} className="flex space-x-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-full"/>
                                    <div>
                                        <div className="font-semibold">
                                            {c.name}{' '}
                                            <span className="text-zinc-400 text-sm">{c.time}</span>
                                        </div>
                                        <div className="mt-1">{c.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6">
                            <input
                                type="text"
                                placeholder="댓글을 입력하세요…"
                                className="w-full px-3 py-2 rounded-full text-zinc-900"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
