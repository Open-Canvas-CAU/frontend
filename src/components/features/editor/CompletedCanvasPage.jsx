// src/components/editor/CompletedCanvasPage.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CanvasCard      from '../landing/CanvasCard'
import CarouselEditor  from './CarouselEditor'
import VoteSection     from './VoteSection'
import { getCanvasDetail, toggleLike, submitVote } from '@/api/canvas'
import api from '@/services/api' // api 서비스 추가

// 아이콘 자산 가져오기
import StarIconUrl    from '@/assets/icons/star.svg'
import StarFillUrl    from '@/assets/icons/star-fill.svg'
import ClockIconUrl   from '@/assets/icons/clock-rewind.svg'
import CommentIconUrl from '@/assets/icons/comment.svg'
import ReportIconUrl  from '@/assets/icons/report.svg' // 신고 아이콘 추가

export default function CompletedCanvasPage() {
    const navigate = useNavigate()
    const { contentId } = useParams() // URL 파라미터에서 contentId 가져오기

    // 캔버스 데이터 상태 (ContentDto 기반)
    const [canvasData, setCanvasData] = useState({
        // ContentDto 필드
        id: null,
        view: 0,
        commentDtos: [],
        writingDtos: [],
        likeDtos: [],
        coverDto: null,
        likeNum: 0,
        likeType: null,
        title: '',
        // UI 표시용 추가 필드
        content: '', // 캔버스 내용
        recommendations: [] // 추천 작품 목록
    })

    // 댓글 상태 (ResCommentDto 기반)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')

    // drawers & favorites - 초기값을 모두 false로 설정
    const [showVersions, setShowVersions] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [lastOpened, setLastOpened] = useState(null)
    const drawerOpen = showVersions || showComments

    // contentId가 변경될 때마다 drawer 상태 초기화
    useEffect(() => {
        setShowVersions(false)
        setShowComments(false)
        setLastOpened(null)
    }, [contentId])

    // 캔버스 데이터 fetch
    useEffect(() => {
        async function fetchCanvasData() {
            try {
                const data = await getCanvasDetail(contentId)
                // ContentDto를 기반으로 데이터 설정
                setCanvasData({
                    ...data,
                    // 첫 번째 writing의 body를 content로 사용
                    content: data.writingDtos?.[0]?.body || '',
                    // 추천 작품 목록은 별도 API로 가져와야 함
                    recommendations: []
                })

                // 추천 작품 목록 가져오기
                const recommendations = await fetch(`/api/contents/${contentId}/recommendations`).then(res => res.json())
                setCanvasData(prev => ({
                    ...prev,
                    recommendations
                }))
            } catch (e) {
                console.error('캔버스 데이터를 불러오는데 실패했습니다:', e)
            }
        }
        if (contentId) {
            fetchCanvasData()
        }
    }, [contentId])

    // 댓글 데이터 fetch
    useEffect(() => {
        async function fetchComments() {
            try {
                const response = await api.get(`/api/comments/by-content?contentId=${contentId}`)
                setComments(response.data) // ResCommentDto 배열
            } catch (e) {
                console.error('댓글을 불러오는데 실패했습니다:', e)
            }
        }
        if (showComments && contentId) {
            fetchComments()
        }
    }, [contentId, showComments])

    // 좋아요 토글 핸들러
    const handleLikeToggle = async () => {
        try {
            const result = await toggleLike(contentId)
            setCanvasData(prev => ({
                ...prev,
                likeNum: result.likeNum,
                likeType: result.likeType
            }))
        } catch (e) {
            console.error('좋아요 토글 실패:', e)
            alert('좋아요 상태 변경에 실패했습니다.')
        }
    }

    // 투표 핸들러
    const handleVote = async () => {
        try {
            const result = await submitVote(contentId)
            setCanvasData(prev => ({
                ...prev,
                stats: {
                    ...prev.stats,
                    hasVoted: result.hasVoted,
                    votes: result.votes
                }
            }))
        } catch (e) {
            console.error('투표 실패:', e)
            alert('투표에 실패했습니다.')
        }
    }

    // 댓글 작성 핸들러
    const handleCommentSubmit = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        try {
            const response = await api.post('/api/comments/write', {
                contentId: parseInt(contentId),
                body: newComment,
                time: new Date().toISOString()
            })
            setComments(prev => [...prev, response.data]) // ResCommentDto
            setNewComment('')
        } catch (e) {
            console.error('댓글 작성 실패:', e)
            alert('댓글 작성에 실패했습니다.')
        }
    }

    // 댓글 삭제 핸들러
    const handleCommentDelete = async (commentId) => {
        try {
            await api.delete(`/api/comments/delete?contentId=${contentId}&commentId=${commentId}`)
            setComments(prev => prev.filter(c => c.id !== commentId))
        } catch (e) {
            console.error('댓글 삭제 실패:', e)
            alert('댓글 삭제에 실패했습니다.')
        }
    }

    // toggle handlers
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

    // 신고 모달 상태
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportReason, setReportReason] = useState('')
    const [isReporting, setIsReporting] = useState(false)

    // 신고 모달 열기
    const handleReportClick = () => {
        setShowReportModal(true)
    }

    // 신고 제출
    const handleReportSubmit = async (e) => {
        e.preventDefault()
        if (!reportReason.trim()) {
            alert('신고 사유를 입력해주세요.')
            return
        }

        setIsReporting(true)
        try {
            // TODO: ReportDto 연동
            // await api.post('/api/reports', {
            //     title: canvasData.title,
            //     depth: 0,
            //     siblingIndex: 0,
            //     body: reportReason,
            //     time: new Date().toISOString()
            // })
            alert('신고가 접수되었습니다.')
            setShowReportModal(false)
            setReportReason('')
        } catch (error) {
            console.error('신고 제출 실패:', error)
            alert('신고 제출에 실패했습니다.')
        } finally {
            setIsReporting(false)
        }
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
                                className="flex items-center space-x-1 text-black hover:text-zinc-900"
                            >
                                <span className="inline-block w-4 h-4 border-b-2 border-l-2 border-black rotate-45" />
                                <span>뒤로 가기</span>
                            </button>
                            <div className="text-black text-3xl font-semibold">{canvasData.title}</div>
                            <span className="text-black text-lg font-medium">{canvasData.writingDtos?.[0]?.time}</span>
                        </div>

                        <div className="p-6 space-y-12">
                            {/* 설명 + 아이콘 */}
                            <div className="flex items-center justify-between">
                                <p className="text-black text-2xl font-medium leading-10">
                                    {canvasData.content}
                                </p>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={handleLikeToggle}
                                        className="p-1 hover:opacity-80"
                                    >
                                        <img
                                            src={canvasData.likeType === 'LIKE' ? StarFillUrl : StarIconUrl}
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

                            {/* 본문 → 캔버스 내용 */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                                <div className="prose max-w-none">
                                    {canvasData.content}
                                </div>
                            </div>

                            {/* 신고 버튼 섹션 */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleReportClick}
                                    className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <img src={ReportIconUrl} alt="report" className="w-5 h-5" />
                                    <span className="text-sm font-medium">작품 신고하기</span>
                                </button>
                            </div>

                            {/* 투표 섹션 */}
                            <VoteSection
                                votes={canvasData.stats?.votes || 0}
                                hasVoted={canvasData.stats?.hasVoted || false}
                                onVote={handleVote}
                            />

                            {/* 추천 작품 */}
                            <div>
                                <h3 className="text-black text-4xl font-semibold mb-6">
                                    이런 작품은 어때요
                                </h3>
                                <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {canvasData.recommendations?.map(rec => (
                                        <CanvasCard
                                            key={rec.id}
                                            title={rec.title}
                                            timeAgo={rec.time}
                                            description={rec.body}
                                            imgSrc={rec.coverDto?.coverImageUrl}
                                            onClick={() => navigate(`/completed/${rec.id}`)}
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
                            <h5 className="text-base font-semibold text-black">버전 내역</h5>
                            <button
                                onClick={toggleVersions}
                                className="text-black hover:bg-gray-200 rounded-full p-1"
                            >✕</button>
                        </div>
                        <ol className="relative border-l border-gray-200">
                            {canvasData.writingDtos?.map((writing, index) => (
                                <li key={index} className="mb-10 ml-6">
                                    <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                                        <img src={ClockIconUrl} alt="" className="w-3 h-3" />
                                    </span>
                                    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-xs sm:flex">
                                        <time className="mb-1 text-xs text-black sm:order-last sm:mb-0">
                                            {writing.time}
                                        </time>
                                        <div className="text-sm text-black">
                                            Released <span className="font-semibold text-blue-600">v{writing.depth + 1}.{writing.siblingIndex + 1}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Comments Drawer */}
                {showComments && (
                    <div className={`
                        absolute inset-0 bg-white p-8
                        ${lastOpened === 'comments' ? 'z-50' : 'z-40'}
                    `}>
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-base font-semibold text-black">댓글</h5>
                            <button
                                onClick={toggleComments}
                                className="text-black hover:bg-gray-200 rounded-full p-1"
                            >✕</button>
                        </div>
                        <div className="space-y-6">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex space-x-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-full"/>
                                    <div className="flex-1">
                                        <div className="font-semibold text-black">
                                            {comment.userDto.nickname}{' '}
                                            <span className="text-black text-sm">{comment.time}</span>
                                        </div>
                                        <div className="mt-1 text-black">{comment.body}</div>
                                        {comment.userDto.email === localStorage.getItem('userEmail') && (
                                            <button
                                                onClick={() => handleCommentDelete(comment.id)}
                                                className="text-red-500 text-sm mt-1"
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleCommentSubmit} className="mt-6">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="댓글을 입력하세요…"
                                className="w-full px-3 py-2 rounded-full text-black placeholder-gray-400"
                            />
                        </form>
                    </div>
                )}
            </div>

            {/* ───────── REPORT MODAL ───────── */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-black">작품 신고</h3>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="text-black hover:bg-gray-200 rounded-full p-1"
                            >✕</button>
                        </div>
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    신고 사유
                                </label>
                                <textarea
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder="신고 사유를 입력해주세요..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="4"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReportModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isReporting}
                                    className={`
                                        px-4 py-2 rounded-lg font-medium
                                        ${isReporting
                                            ? 'bg-red-300 cursor-not-allowed'
                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                        }
                                    `}
                                >
                                    {isReporting ? '신고 중...' : '신고하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
