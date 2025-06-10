import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { canvasService } from '@/services/canvasService';
import VersionTree from './VersionTree';
import EditorSection from './EditorSection';
import { authService } from '@/services/authService';

export default function CompletedCanvasPage() {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);

    // 데이터 상태
    const [canvasData, setCanvasData] = useState(null);
    const [comments, setComments] = useState([]);
    const [currentWriting, setCurrentWriting] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI 상태
    const [showVersions, setShowVersions] = useState(false);
    const [showComments, setShowComments] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);
    
    // 신고 기능 상태
    const [reportPopover, setReportPopover] = useState({ show: false, x: 0, y: 0 });
    const [selectedReportText, setSelectedReportText] = useState('');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    // 좋아요 상태
    const [isLiking, setIsLiking] = useState(false);

    // 데이터 로딩
    useEffect(() => {
        const fetchCanvasData = async () => {
            setIsLoading(true);
            try {
                const data = await canvasService.getCanvasDetail(contentId);
                setCanvasData(data);
                
                if (data.writingDtos && data.writingDtos.length > 0) {
                    setCurrentWriting(data.writingDtos[0]);
                }

                // 댓글 로딩
                const commentsData = await canvasService.getComments(contentId);
                setComments(Array.isArray(commentsData) ? commentsData : []);
                
            } catch (e) {
                console.error('캔버스 데이터를 불러오는데 실패했습니다:', e);
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        
        if (contentId) {
            fetchCanvasData();
        }
    }, [contentId]);

    // 텍스트 선택 감지
    const handleTextSelection = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !editorRef.current?.contains(selection.anchorNode)) {
            setReportPopover({ show: false, x: 0, y: 0 });
            return;
        }

        const selectedText = selection.toString().trim();
        if (selectedText.length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            setSelectedReportText(selectedText);
            setReportPopover({
                show: true,
                x: rect.left + window.scrollX,
                y: rect.bottom + window.scrollY + 8,
            });
        } else {
             setReportPopover({ show: false, x: 0, y: 0 });
        }
    }, []);

    // 신고 제출
    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportReason.trim()) {
            alert('신고 사유를 입력해주세요.');
            return;
        }
        
        setIsReporting(true);
        try {
            await canvasService.reportContent({
                title: canvasData.title,
                depth: currentWriting.depth,
                siblingIndex: currentWriting.siblingIndex,
                body: `[신고된 내용]: "${selectedReportText}"\n[신고 사유]: ${reportReason}`,
            });
            alert('신고가 접수되었습니다.');
            setIsReportModalOpen(false);
            setReportReason('');
            setSelectedReportText('');
        } catch (error) {
            alert('신고 접수에 실패했습니다.');
        } finally {
            setIsReporting(false);
            setReportPopover({ show: false, x: 0, y: 0 });
        }
    };

    // 좋아요 토글
    const handleLikeToggle = async () => {
        if (!canvasData || isLiking) return;
        
        setIsLiking(true);
        try {
            const newLikeType = canvasData.likeType === 'LIKE' ? null : 'LIKE';
            const updatedCanvas = await canvasService.toggleLike(contentId, newLikeType || 'LIKE');
            setCanvasData(updatedCanvas);
        } catch (e) {
            console.error('좋아요 토글 실패:', e);
            alert('좋아요 상태 변경에 실패했습니다.');
        } finally {
            setIsLiking(false);
        }
    };

    // 댓글 작성
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isCommenting) return;

        if (!authService.isAuthenticated()) {
            alert('댓글을 작성하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        setIsCommenting(true);
        try {
            const newCommentData = await canvasService.addComment({
                contentId: parseInt(contentId),
                body: newComment,
            });
            setComments(prev => [...prev, newCommentData]);
            setNewComment('');
        } catch (e) {
            console.error('댓글 작성 실패:', e);
            alert('댓글 작성에 실패했습니다.');
        } finally {
            setIsCommenting(false);
        }
    };

    // 댓글 삭제
    const handleCommentDelete = async (commentId) => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;

        try {
            await canvasService.deleteComment(commentId, contentId);
            setComments(prev => prev.filter(comment => comment.id !== commentId));
        } catch (e) {
            console.error('댓글 삭제 실패:', e);
            alert('댓글 삭제에 실패했습니다.');
        }
    };

    // 버전 트리에서 노드 클릭
    const handleVersionNodeClick = (writingNode) => {
        setCurrentWriting(writingNode);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <div className="text-xl text-gray-700">작품을 불러오고 있습니다...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl">⚠️</div>
                    <div className="text-xl text-red-600">{error}</div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        뒤로 가기
                    </button>
                </div>
            </div>
        );
    }

    if (!canvasData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-4xl">📭</div>
                    <div className="text-xl text-gray-600">데이터가 없습니다.</div>
                </div>
            </div>
        );
    }

    return (
        <div onMouseUp={handleTextSelection} className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* 신고 팝오버 */}
            {reportPopover.show && (
                <button
                    onClick={() => setIsReportModalOpen(true)}
                    style={{ top: `${reportPopover.y}px`, left: `${reportPopover.x}px` }}
                    className="fixed z-50 bg-red-500 text-white px-3 py-1 rounded-lg shadow-lg text-sm flex items-center gap-1 hover:bg-red-600 transition-colors"
                >
                    <span>⚠️</span>
                    <span>신고하기</span>
                </button>
            )}

            {/* 신고 모달 */}
            {isReportModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
                        <form onSubmit={handleReportSubmit} className="space-y-6">
                            <div className="text-center">
                                <div className="text-4xl mb-4">⚠️</div>
                                <h3 className="text-xl font-bold text-gray-800">내용 신고</h3>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">신고할 내용</label>
                                <p className="p-3 bg-gray-100 rounded-xl border text-gray-700 text-sm">
                                    "{selectedReportText}"
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">신고 사유</label>
                                <textarea
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder="신고 사유를 구체적으로 작성해주세요."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsReportModalOpen(false)} 
                                    className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    취소
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isReporting} 
                                    className={`flex-1 py-3 rounded-xl font-medium text-white ${
                                        isReporting ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                                    }`}
                                >
                                    {isReporting ? '전송 중...' : '신고 제출'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* 메인 레이아웃 */}
            <div className="flex min-h-screen">
                {/* 메인 컨텐츠 */}
                <div className={`flex-1 transition-all duration-300 ${showVersions ? 'mr-80' : ''}`}>
                    <div className="container mx-auto px-4 py-8">
                        {/* 헤더 */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 mb-8">
                            <div className="flex items-center justify-between px-8 py-6">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                        <span className="text-lg">←</span>
                                    </div>
                                    <span className="font-medium">뒤로 가기</span>
                                </button>
                                
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {canvasData.title}
                                    </h1>
                                    <div className="flex items-center justify-center space-x-4 mt-2 text-sm text-gray-600">
                                        <span className="flex items-center space-x-1">
                                            <span>👁️</span>
                                            <span>{canvasData.view || 0}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            <span>❤️</span>
                                            <span>{canvasData.likeNum || 0}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            <span>💬</span>
                                            <span>{comments.length}</span>
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setShowVersions(!showVersions)}
                                        className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                                            showVersions ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        📊 버전 기록
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 본문 */}
                        <div ref={editorRef} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden mb-8">
                            <div className="p-8">
                                <EditorSection
                                    content={currentWriting ? currentWriting.body : '내용을 보려면 버전을 선택하세요.'}
                                    readOnly={true}
                                    className="min-h-[400px] prose prose-lg max-w-none"
                                />
                            </div>
                        </div>

                        {/* 액션 바 */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 mb-8">
                            <div className="flex items-center justify-between px-8 py-6">
                                <div className="flex items-center space-x-6">
                                    <button
                                        onClick={handleLikeToggle}
                                        disabled={isLiking}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                                            canvasData.likeType === 'LIKE'
                                                ? 'bg-red-100 text-red-600 border border-red-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-200'
                                        }`}
                                    >
                                        <span className="text-lg">{canvasData.likeType === 'LIKE' ? '❤️' : '🤍'}</span>
                                        <span>{canvasData.likeType === 'LIKE' ? '좋아요 취소' : '좋아요'}</span>
                                        {isLiking && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                                    </button>
                                    
                                    <button
                                        onClick={() => setShowComments(!showComments)}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-colors ${
                                            showComments ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                                        }`}
                                    >
                                        <span className="text-lg">💬</span>
                                        <span>댓글 {showComments ? '숨기기' : '보기'}</span>
                                    </button>
                                </div>
                                
                                <div className="text-sm text-gray-500">
                                    완성작 • {new Date(canvasData.coverDto?.time).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* 댓글 섹션 */}
                        {showComments && (
                            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                                        <span className="text-2xl">💬</span>
                                        <span>댓글 {comments.length}개</span>
                                    </h3>
                                    
                                    {/* 댓글 작성 */}
                                    {authService.isAuthenticated() ? (
                                        <form onSubmit={handleCommentSubmit} className="mb-8">
                                            <div className="flex space-x-4">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {authService.getCurrentUser()?.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1">
                                                    <textarea
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="댓글을 작성해보세요..."
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                        rows="3"
                                                    />
                                                    <div className="flex justify-end mt-3">
                                                        <button
                                                            type="submit"
                                                            disabled={!newComment.trim() || isCommenting}
                                                            className={`px-6 py-2 rounded-xl font-medium ${
                                                                !newComment.trim() || isCommenting
                                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                                            }`}
                                                        >
                                                            {isCommenting ? '작성 중...' : '댓글 작성'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="mb-8 p-6 bg-gray-50 rounded-2xl text-center">
                                            <p className="text-gray-600 mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                                            >
                                                로그인하기
                                            </button>
                                        </div>
                                    )}
                                    
                                    {/* 댓글 목록 */}
                                    <div className="space-y-6">
                                        {comments.length === 0 ? (
                                            <div className="text-center py-12 text-gray-500">
                                                <div className="text-4xl mb-4">💭</div>
                                                <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                                            </div>
                                        ) : (
                                            comments.map((comment) => (
                                                <div key={comment.id} className="flex space-x-4 p-4 bg-gray-50 rounded-2xl">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        U
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-gray-800">사용자</span>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm text-gray-500">
                                                                    {new Date(comment.time).toLocaleString()}
                                                                </span>
                                                                {authService.getCurrentUser()?.id === comment.userId && (
                                                                    <button
                                                                        onClick={() => handleCommentDelete(comment.id)}
                                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                                    >
                                                                        삭제
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-700 leading-relaxed">{comment.body}</p>
                                                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                                            <span className="flex items-center space-x-1">
                                                                <span>👍</span>
                                                                <span>{comment.likeNum || 0}</span>
                                                            </span>
                                                            <span className="flex items-center space-x-1">
                                                                <span>👎</span>
                                                                <span>{comment.disLikeNum || 0}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 버전 트리 사이드바 */}
                {showVersions && (
                    <div className="fixed right-0 top-0 w-80 h-full bg-white/95 backdrop-blur-sm border-l border-white/50 shadow-2xl z-40">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800">버전 기록</h3>
                                <button
                                    onClick={() => setShowVersions(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            {canvasData.writingDtos && canvasData.writingDtos.length > 0 ? (
                                <VersionTree
                                    writings={canvasData.writingDtos}
                                    onNodeClick={handleVersionNodeClick}
                                    currentVersion={currentWriting}
                                />
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    <div className="text-2xl mb-2">📊</div>
                                    <p>버전 기록이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}