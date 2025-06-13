import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { canvasService } from '@/services/canvasService';
import VersionTree from './VersionTree';
import EditorSection from './EditorSection';
import { authService } from '@/services/authService';
import IllustrationGenerator from '../illustration/IllustrationGenerator';
import { illustrationService } from '@/services/illustrationService';
import { recommendService } from '@/services/recommendService';
import { contentApi } from '@/services/api/contentApi';
import { writingApi } from '@/services/api/writingApi';
import { 
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    ROUTES,
    UI_CONSTANTS,
    RoomType
} from '@/types';

// 아이콘 import
import commentIcon from '@/assets/icons/comment.svg';
import clockRewindIcon from '@/assets/icons/clock-rewind.svg';
import starIcon from '@/assets/icons/star.svg';
import starFillIcon from '@/assets/icons/star-fill.svg';

export default function CompletedCanvasPage() {
    const { coverId } = useParams();
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
    const [showComments, setShowComments] = useState(false);
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
                console.log('캔버스 데이터 요청 시작:', coverId);
                const data = await contentApi.get(Number(coverId));
                console.log('캔버스 데이터 응답:', data);
                setCanvasData(data);
                
                // 바로 첫 번째 글을 보여줌
                if (data.writingDtos && data.writingDtos.length > 0) {
                    console.log('첫 번째 글 설정:', data.writingDtos[0]);
                    setCurrentWriting(data.writingDtos[0]);
                } else {
                    console.log('writingDtos가 없거나 비어있음');
                }
                
                // official 글 가져오기
                if (data.id) {
                    try {
                        console.log('official 글 요청 시작:', { id: data.id, title: data.title });
                        const officialWritings = await writingApi.getOfficial({
                            id: data.id,
                            title: data.title
                        });
                        console.log('official 글 응답:', officialWritings);
                        
                        if (officialWritings && officialWritings.length > 0) {
                            // official 글 중 마지막 글(가장 최신 버전)을 보여줌
                            console.log('official 글 설정:', officialWritings[officialWritings.length - 1]);
                            setCurrentWriting(officialWritings[officialWritings.length - 1]);
                        } else {
                            console.log('official 글 없음');
                        }
                    } catch (error) {
                        console.error('official 글 로딩 실패:', error);
                    }
                }

                // 현재 currentWriting 상태 로깅
                console.log('현재 currentWriting 상태:', currentWriting);

                if (data.id) {
                    const commentsData = await canvasService.getComments(data.id);
                    setComments(Array.isArray(commentsData) ? commentsData : []);
                }
                
            } catch (e) {
                console.error('캔버스 데이터를 불러오는데 실패했습니다:', e);
                if (e.response?.status === 404) {
                    setError(ERROR_MESSAGES.NOT_FOUND);
                } else {
                    setError(ERROR_MESSAGES.SERVER_ERROR);
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        if (coverId) {
            console.log('fetchCanvasData 호출됨, coverId:', coverId);
            fetchCanvasData();
        }
    }, [coverId]);

    // currentWriting 상태 변경 감지
    useEffect(() => {
        console.log('currentWriting 상태 변경됨:', currentWriting);
    }, [currentWriting]);

    // 댓글 목록 가져오기
    useEffect(() => {
        const fetchComments = async () => {
            if (!canvasData?.id) return;
            try {
                const response = await contentApi.getComments(canvasData.id);
                setComments(response.data);
            } catch (error) {
                console.error('댓글 로딩 실패:', error);
            }
        };
        fetchComments();
    }, [canvasData?.id]);

    // 댓글 작성
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isCommenting) return;

        setIsCommenting(true);
        try {
            const response = await contentApi.addComment({
                contentId: canvasData.id,
                body: newComment.trim()
            });
            setComments(response.data);
            setNewComment('');
        } catch (error) {
            console.error('댓글 작성 실패:', error);
        } finally {
            setIsCommenting(false);
        }
    };

    // 댓글 삭제
    const handleCommentDelete = async (commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

        try {
            await contentApi.deleteComment(commentId, canvasData.id);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('댓글 삭제 실패:', error);
        }
    };

    // 좋아요 토글
    const handleLikeToggle = async () => {
        if (!canvasData || isLiking) return;
        
        setIsLiking(true);
        try {
            const newLikeType = canvasData.likeType === 'LIKE' ? null : 'LIKE';
            const updatedCanvas = await canvasService.toggleLike(canvasData.id, newLikeType || 'LIKE');
            setCanvasData(updatedCanvas);
            alert(SUCCESS_MESSAGES.LIKE_UPDATED);
        } catch (e) {
            console.error('좋아요 토글 실패:', e);
            alert(ERROR_MESSAGES.SERVER_ERROR);
        } finally {
            setIsLiking(false);
        }
    };

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
            alert(ERROR_MESSAGES.INVALID_INPUT);
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
            alert(SUCCESS_MESSAGES.REPORT_SUBMITTED);
            setIsReportModalOpen(false);
            setReportReason('');
            setSelectedReportText('');
        } catch (error) {
            alert(ERROR_MESSAGES.SERVER_ERROR);
        } finally {
            setIsReporting(false);
            setReportPopover({ show: false, x: 0, y: 0 });
        }
    };

    // 버전 트리에서 노드 클릭
    const handleVersionNodeClick = (writingNode) => {
        setCurrentWriting(writingNode);
    };

    // 공식 글 토글
    const handleOfficialToggle = async () => {
        if (!currentWriting || isOfficialToggling) return;
        
        setIsOfficialToggling(true);
        try {
            const updatedWriting = await writingApi.toggleOfficial(currentWriting.id);
            setCurrentWriting(updatedWriting);
            alert(SUCCESS_MESSAGES.OFFICIAL_UPDATED);
        } catch (e) {
            console.error('공식 글 토글 실패:', e);
            alert(ERROR_MESSAGES.SERVER_ERROR);
        } finally {
            setIsOfficialToggling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-red-300/20 border-t-red-300/80 rounded-full animate-spin"></div>
                    <div className="text-xl text-white">작품을 불러오고 있습니다...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center space-y-4 max-w-md">
                    <div className="text-6xl">⚠️</div>
                    <div className="text-xl text-red-500">{error}</div>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
                    >
                        뒤로 가기
                    </button>
                </div>
            </div>
        );
    }

    if (!canvasData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center space-y-4">
                    <div className="text-xl text-white">{ERROR_MESSAGES.NOT_FOUND}</div>
                </div>
            </div>
        );
    }

    return (
        <div onMouseUp={handleTextSelection} className="min-h-screen">
            {/* 신고 팝오버 */}
            {reportPopover.show && (
                <button
                    onClick={() => setIsReportModalOpen(true)}
                    style={{ top: `${reportPopover.y}px`, left: `${reportPopover.x}px` }}
                    className="fixed z-50 bg-red-500 text-white px-3 py-1 rounded-lg shadow-lg text-sm flex items-center gap-1 hover:bg-red-600 transition-colors"
                >
                    <span></span>
                    <span>신고하기</span>
                </button>
            )}

            {/* 신고 모달 */}
            {isReportModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-black rounded-3xl p-8 w-full max-w-md mx-4">
                        <form onSubmit={handleReportSubmit} className="space-y-6">
                            <div className="text-center">
                                <div className="text-4xl mb-4"></div>
                                <h3 className="text-xl font-bold text-white-800">내용 신고</h3>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white-700 mb-2">신고할 내용</label>
                                <p className="p-3 bg-black-100 rounded-xl border text-white-700 text-sm">
                                    "{selectedReportText}"
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white-700 mb-2">신고 사유</label>
                                <textarea
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder="신고 사유를 구체적으로 작성해주세요."
                                    className="w-full px-4 py-3 border border-white-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsReportModalOpen(false)} 
                                    className="flex-1 py-3 border border-white-300 rounded-xl font-medium text-white-700 hover:bg-black-50"
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
                <div className={`flex-1 transition-all duration-300 ${showVersions || showComments ? 'mr-80' : ''}`}>
                    <div className="container mx-auto px-4 py-8">
                        {/* 헤더 */}
                        <div className="bg-black/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 mb-8">
                            <div className="flex items-center justify-between px-8 py-6">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                                        <span className="text-lg">←</span>
                                    </div>
                                    <span className="font-medium">뒤로 가기</span>
                                </button>
                                
                                <div className="text-center">
                                    <h1 className="text-3xl font-bold text-white">
                                        {canvasData.title}
                                    </h1>
                                    
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowVersions(!showVersions)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                                            showVersions ? 'bg-red-500 text-white' : 'bg-black text-white/80 hover:bg-white/10'
                                        }`}
                                    >
                                        <img src={clockRewindIcon} alt="버전" className="w-5 h-5 invert brightness-0" />
                                        <span className="text-sm">{canvasData.writingDtos?.length || 0}</span>
                                    </button>

                                    <button
                                        onClick={handleLikeToggle}
                                        disabled={isLiking}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                                            canvasData.likeType === 'LIKE'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-black text-white/80 hover:bg-white/10'
                                        }`}
                                    >
                                        <img 
                                            src={canvasData.likeType === 'LIKE' ? starFillIcon : starIcon} 
                                            alt="좋아요" 
                                            className="w-5 h-5 invert brightness-0" 
                                        />
                                        <span className="text-sm">{canvasData.likeNum || 0}</span>
                                        {isLiking && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                                    </button>

                                    <button
                                        onClick={() => setShowComments(!showComments)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                                            showComments ? 'bg-red-500 text-white' : 'bg-black text-white/80 hover:bg-white/10'
                                        }`}
                                    >
                                        <img src={commentIcon} alt="댓글" className="w-5 h-5 invert brightness-0" />
                                        <span className="text-sm">{comments.length}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 에디터 섹션 */}
                        <div ref={editorRef} className="bg-black/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden mb-8">
                            <div className="p-8">
                                <EditorSection
                                    content={currentWriting ? currentWriting.body : '내용을 불러오는 중입니다...'}
                                    readOnly={true}
                                    className="min-h-[400px] prose prose-lg max-w-none"
                                />
                            </div>
                        </div>

                        {/* 버전 트리 사이드바 */}
                        {showVersions && (
                            <div className="fixed right-0 top-0 w-80 h-full bg-black/95 backdrop-blur-sm border-l border-white/50 shadow-2xl z-40">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-white">버전 기록</h3>
                                        <button
                                            onClick={() => setShowVersions(false)}
                                            className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors text-white"
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
                                        <div className="text-center text-white/60 py-8">
                                            <div className="text-2xl mb-2">📊</div>
                                            <p>버전 기록이 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 댓글 사이드바 */}
                        {showComments && (
                            <div className="fixed right-0 top-0 w-80 h-full bg-black/95 backdrop-blur-sm border-l border-white/50 shadow-2xl z-40">
                                <div className="p-6 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-white">댓글</h3>
                                        <button
                                            onClick={() => setShowComments(false)}
                                            className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors text-white"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-4">
                                        {/* 댓글 작성 */}
                                        {authService.isAuthenticated() ? (
                                            <form onSubmit={handleCommentSubmit} className="mb-6">
                                                <div className="flex space-x-4">
                                                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                                                        {authService.getCurrentUser()?.nickname?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <textarea
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                            placeholder="댓글을 작성해보세요..."
                                                            className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-white"
                                                            rows="3"
                                                        />
                                                        <div className="flex justify-end mt-3">
                                                            <button
                                                                type="submit"
                                                                disabled={!newComment.trim() || isCommenting}
                                                                className={`px-4 py-2 rounded-lg font-medium ${
                                                                    !newComment.trim() || isCommenting
                                                                        ? 'bg-black/50 text-white/50 cursor-not-allowed'
                                                                        : 'bg-red-500 text-white hover:bg-red-600'
                                                                }`}
                                                            >
                                                                {isCommenting ? '작성 중...' : '댓글 작성'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="p-4 bg-black rounded-lg text-center">
                                                <p className="text-white/60 mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
                                                <button
                                                    onClick={() => navigate('/login')}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    로그인하기
                                                </button>
                                            </div>
                                        )}
                                        
                                        {/* 댓글 목록 */}
                                        <div className="space-y-4">
                                            {comments.length === 0 ? (
                                                <div className="text-center py-12 text-white/60">
                                                    <div className="text-4xl mb-4">💭</div>
                                                    <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
                                                </div>
                                            ) : (
                                                comments.map((comment) => (
                                                    <div key={comment.id} className="flex space-x-4 p-4 bg-black rounded-lg">
                                                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                                                            U
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-medium text-white">사용자</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-sm text-white/60">
                                                                        {new Date(comment.time).toLocaleString()}
                                                                    </span>
                                                                    {authService.getCurrentUser()?.id === comment.userId && (
                                                                        <button
                                                                            onClick={() => handleCommentDelete(comment.id)}
                                                                            className="text-red-500 hover:text-red-400 text-sm"
                                                                        >
                                                                            삭제
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-white/80 leading-relaxed">{comment.body}</p>
                                                            <div className="flex items-center space-x-4 mt-3 text-sm text-white/60">
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
                            </div>
                        )}

                        {/* 버튼 그룹 */}
                        <div className="flex justify-end space-x-4 mb-8">
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className="px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors flex items-center space-x-2"
                            >
                                <span>💬</span>
                                <span>댓글</span>
                            </button>
                            {authService.isAuthenticated() && authService.getCurrentUser()?.id === canvasData?.userId && (
                                <button
                                    onClick={handleOfficialToggle}
                                    disabled={isOfficialToggling}
                                    className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                                        isOfficialToggling
                                            ? 'bg-black/50 text-white/50 cursor-not-allowed'
                                            : currentWriting?.isOfficial
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-black/50 text-white hover:bg-black/70'
                                    }`}
                                >
                                    <span>🏆</span>
                                    <span>{currentWriting?.isOfficial ? '채택 취소' : '채택하기'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}