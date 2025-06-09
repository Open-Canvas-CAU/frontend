import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { canvasService } from '@/services/canvasService';
import VersionTree from './VersionTree'; // VersionTree 컴포넌트 임포트
import EditorSection from './EditorSection'; // EditorSection 컴포넌트 임포트
import StarIconUrl from '@/assets/icons/star.svg';
import StarFillUrl from '@/assets/icons/star-fill.svg';
import ClockIconUrl from '@/assets/icons/clock-rewind.svg';
import CommentIconUrl from '@/assets/icons/comment.svg';

/**
 * 완성된 캔버스(결과물)를 보여주는 페이지 컴포넌트입니다.
 * 텍스트 선택 시 신고 기능이 포함되어 있습니다.
 */
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
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    
    // 신고 기능 상태
    const [reportPopover, setReportPopover] = useState({ show: false, x: 0, y: 0 });
    const [selectedReportText, setSelectedReportText] = useState('');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isReporting, setIsReporting] = useState(false);


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
            } catch (e) {
                console.error('캔버스 데이터를 불러오는데 실패했습니다:', e);
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCanvasData();
    }, [contentId]);

    // 텍스트 선택(드래그) 감지 핸들러
    const handleTextSelection = () => {
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
                y: rect.bottom + window.scrollY + 8, // 텍스트 바로 아래에 표시
            });
        } else {
             setReportPopover({ show: false, x: 0, y: 0 });
        }
    };

    // 신고 제출 핸들러
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
                // 신고 사유와 선택된 텍스트를 함께 전송
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

    // 좋아요 토글 핸들러
    const handleLikeToggle = async () => {
        if (!canvasData) return;
        try {
            // 현재 좋아요 상태의 반대 상태를 요청
            const newLikeType = canvasData.likeType === 'LIKE' ? null : 'LIKE';
            const updatedCanvas = await canvasService.toggleLike(contentId, newLikeType || 'LIKE'); // null이면 취소지만, API는 LIKE/DISLIKE를 받음
            setCanvasData(updatedCanvas);
        } catch (e) {
            console.error('좋아요 토글 실패:', e);
            alert('좋아요 상태 변경에 실패했습니다.');
        }
    };

    // 댓글 작성 핸들러
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

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
        }
    };
    
    // 버전 트리에서 노드 클릭 시 핸들러
    const handleVersionNodeClick = (writingNode) => {
        // writingNode는 VersionTree에서 전달받은 노드의 데이터(WritingDto)입니다.
        setCurrentWriting(writingNode);
    };

    // 로딩 및 에러 처리
    if (isLoading) return <div className="p-8 text-center">로딩 중...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!canvasData) return <div className="p-8 text-center">데이터가 없습니다.</div>;

    return (
        <div onMouseUp={handleTextSelection}>
            {/* 신고 버튼 토글 (팝오버) */}
            {reportPopover.show && (
                <button
                    onClick={() => setIsReportModalOpen(true)}
                    style={{ top: `${reportPopover.y}px`, left: `${reportPopover.x}px` }}
                    className="absolute z-10 bg-red-500 text-white px-3 py-1 rounded-md shadow-lg text-sm flex items-center gap-1"
                >
                    <img src={ReportIconUrl} alt="report" className="w-4 h-4 invert" />
                    신고하기
                </button>
            )}

            {/* 신고 모달 */}
            {isReportModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-black mb-4">글 신고하기</h3>
                        <form onSubmit={handleReportSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">신고할 내용</label>
                                <p className="mt-1 p-2 bg-gray-100 rounded border border-gray-300 text-gray-700">
                                    "{selectedReportText}"
                                </p>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="reportReason" className="block text-sm font-medium text-gray-700">신고 사유</label>
                                <textarea
                                    id="reportReason"
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder="신고 사유를 구체적으로 작성해주세요."
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg">
                                    취소
                                </button>
                                <button type="submit" disabled={isReporting} className="px-4 py-2 text-white bg-red-600 rounded-lg disabled:bg-red-300">
                                    {isReporting ? '전송 중...' : '신고 제출'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <div className="min-h-screen py-8 flex bg-zinc-100">
                {/* 메인 컨텐츠 */}
                <div className="flex-1 transition-all duration-300 ease-in-out">
                    <div className="container mx-auto px-4">
                        <div ref={editorRef} className="bg-white rounded-lg shadow overflow-hidden">
                           {/* ... (기존 헤더 및 본문 EditorSection 렌더링) ... */}
                           <div className="p-6">
                                <EditorSection
                                    content={currentWriting ? currentWriting.body : '내용을 보려면 버전을 선택하세요.'}
                                    readOnly={true}
                                    className="min-h-[400px]"
                                />
                           </div>
                        </div>
                    </div>
                </div>
                {/* ... (기존 사이드 패널 렌더링) ... */}
            </div>
        </div>
    );
}