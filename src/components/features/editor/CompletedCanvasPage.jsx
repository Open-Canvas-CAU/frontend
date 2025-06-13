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

    // 드래그 관련 상태
    const [commentButtonPosition, setCommentButtonPosition] = useState({ show: false, x: 0, y: 0 });

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
            setCommentButtonPosition({ show: false, x: 0, y: 0 });
            return;
        }

        const selectedText = selection.toString().trim();
        if (selectedText.length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectedReportText(selectedText);
            setCommentButtonPosition({
                show: true,
                x: rect.left + window.scrollX,
                y: rect.bottom + window.scrollY + 8
            });
        } else {
            setCommentButtonPosition({ show: false, x: 0, y: 0 });
        }
    }, []);

    // 댓글 달기 버튼 클릭 핸들러
    const handleCommentButtonClick = () => {
        setShowComments(true);
        setCommentButtonPosition({ show: false, x: 0, y: 0 });
    };

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

    // 댓글 추가 핸들러
    const handleAddComment = async () => {
        if (!authService.isAuthenticated()) {
            navigate(ROUTES.LOGIN, { state: { from: ROUTES.CANVAS.COMPLETED(coverId) } });
            return;
        }

        if (!newComment.trim()) return;

        try {
            setIsCommenting(true);
            await contentApi.addComment(coverId, {
                content: newComment,
                selectedText: selectedReportText // 선택한 텍스트도 함께 전송
            });
            setNewComment(''); // 입력창 초기화
            setSelectedReportText(''); // 선택한 텍스트 초기화
            // 댓글 목록 새로고침
            const updatedComments = await contentApi.getComments(coverId);
            setComments(updatedComments);
        } catch (err) {
            console.error('댓글 작성 실패:', err);
            alert(ERROR_MESSAGES.COMMENT_FAILED);
        } finally {
            setIsCommenting(false);
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
            {/* 댓글 달기 버튼 */}
            {commentButtonPosition.show && (
                <button
                    onClick={handleCommentButtonClick}
                    className="fixed z-50 bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-sm flex items-center gap-1 hover:bg-red-700 transition-colors"
                    style={{
                        top: `${commentButtonPosition.y}px`,
                        left: `${commentButtonPosition.x}px`,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <span>💬</span>
                    <span>댓글 달기</span>
                </button>
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
                            <div className="fixed right-0 top-0 w-80 h-full bg-black backdrop-blur-sm border-l border-white/50 shadow-2xl z-40">
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
                            <div className="fixed right-0 top-0 h-full w-80 bg-black backdrop-blur-sm border-l border-white-900/50 shadow-xl overflow-y-auto">
                                <div className="p-4 border-b border-red-900/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">댓글</h3>
                                        <button 
                                            onClick={() => setShowComments(false)}
                                            className="text-white/60 hover:text-white"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    {selectedReportText && (
                                        <div className="mb-4 p-3 bg-red-900/30 rounded-lg border border-white-800/30">
                                            <p className="text-sm text-white/80 italic">"{selectedReportText}"</p>
                                        </div>
                                    )}
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="댓글을 입력하세요..."
                                            className="flex-1 px-3 py-2 bg-black border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                                        />
                                        <button
                                            onClick={handleAddComment}
                                            disabled={isCommenting || !newComment.trim()}
                                            className={`px-4 py-2 rounded-lg ${
                                                isCommenting || !newComment.trim()
                                                    ? 'bg-black/50 text-white/40 cursor-not-allowed border border-white/20'
                                                    : 'bg-red-600 text-white hover:bg-red-700'
                                            }`}
                                        >
                                            {isCommenting ? '전송 중...' : '전송'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="bg-red-900/30 rounded-lg p-4 border border-red-800/30">
                                            {comment.selectedText && (
                                                <div className="mb-2 p-2 bg-red-950/50 rounded border border-red-800/20">
                                                    <p className="text-sm text-white/60 italic">"{comment.selectedText}"</p>
                                                </div>
                                            )}
                                            <p className="text-white/80">{comment.content}</p>
                                            <div className="mt-2 flex items-center justify-between text-sm text-white/40">
                                                <span>{comment.author}</span>
                                                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
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

                        {!authService.isAuthenticated() && (
                            <div className="p-4 bg-black/50 rounded-lg text-center border border-white/10">
                                <p className="text-white/60 mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
                                <button
                                    onClick={() => navigate(ROUTES.LOGIN)}
                                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2 mx-auto"
                                >
                                    <img src="/google.svg" alt="Google" className="w-5 h-5" />
                                    <span>Google로 로그인</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}