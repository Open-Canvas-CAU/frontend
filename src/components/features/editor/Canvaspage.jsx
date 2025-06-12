// src/components/features/editor/Canvaspage.jsx - 편집 전용으로 수정된 버전
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CarouselEditor from './CarouselEditor.jsx'
import api from '@/services/api'
import websocketService from '@/services/websocketService'
import ReportIconUrl from '@/assets/icons/report.svg'
import { authService } from '@/services/authService'

// 캔버스 상태 정의
const CANVAS_STATUS = {
    WORKING: 'WORKING',
    COMPLETED: 'COMPLETED',
    PUBLISHED: 'PUBLISHED'
}

// 완성 조건 설정
const COMPLETION_CRITERIA = {
    MIN_WORDS: 100,
    MIN_CHARACTERS: 500,
    MAX_IDLE_HOURS: 24
}

export default function CanvasPage({ isEditing = false }) {
    const { roomId } = useParams(); // ✅ props 대신 useParams 사용
    const navigate = useNavigate()

    // 기존 상태들
    const [roomData, setRoomData] = useState(null);
    const [writings, setWritings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // WebSocket 관련 상태
    const [websocketConnected, setWebsocketConnected] = useState(false)
    const [websocketError, setWebsocketError] = useState(null)
    const [connectionAttempts, setConnectionAttempts] = useState(0)
    const [showConnectionStatus, setShowConnectionStatus] = useState(false)

    // 캔버스 상태 관리
    const [canvasStatus, setCanvasStatus] = useState(CANVAS_STATUS.WORKING)
    const [canComplete, setCanComplete] = useState(false)
    const [completionStats, setCompletionStats] = useState({
        wordCount: 0,
        characterCount: 0,
        lastEditTime: null
    })

    // 신고 및 완성 모달 상태
    const [showReportModal, setShowReportModal] = useState(false)
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [reportReason, setReportReason] = useState('')
    const [isReporting, setIsReporting] = useState(false)
    const [isCompleting, setIsCompleting] = useState(false)

    // 텍스트 통계 계산 함수
    const calculateTextStats = (htmlContent) => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlContent
        const textContent = tempDiv.textContent || tempDiv.innerText || ''
        
        const characterCount = textContent.length
        const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length
        
        return { characterCount, wordCount }
    }

    // 완성 가능 여부 체크
    const checkCompletionEligibility = (stats) => {
        const meetsWordCount = stats.wordCount >= COMPLETION_CRITERIA.MIN_WORDS
        const meetsCharCount = stats.characterCount >= COMPLETION_CRITERIA.MIN_CHARACTERS
        
        return meetsWordCount || meetsCharCount
    }

    // 콘텐츠 변경 시 통계 업데이트
    useEffect(() => {
        if (writings.length > 0) {
            const allContent = writings.map(w => w.body || '').join(' ')
            const stats = calculateTextStats(allContent)
            
            setCompletionStats(prev => ({
                ...stats,
                lastEditTime: new Date()
            }))
            
            setCanComplete(checkCompletionEligibility(stats))
        }
    }, [writings])

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        if (!dateString) return 'Invalid Date'
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'Invalid Date'
            return date.toLocaleString()
        } catch (e) {
            console.error('Date formatting error:', e)
            return 'Invalid Date'
        }
    }

    // ✅ 안전한 API 요청을 위한 헬퍼 함수
    const safeApiCall = async (apiCall, errorMessage = '요청 실패') => {
        try {
            // 인증 상태 먼저 확인
            if (!authService.isAuthenticated()) {
                throw new Error('로그인이 필요합니다')
            }

            return await apiCall()
        } catch (error) {
            console.error(`❌ ${errorMessage}:`, error)
            
            // 401 에러나 인증 관련 에러인 경우
            if (error.response?.status === 401 || error.message.includes('Unauthorized')) {
                console.log('🔑 인증 에러 감지, 로그인 페이지로 이동')
                authService.logout()
                navigate('/login', { state: { from: { pathname: `/editor/${roomId}` } } })
                return null
            }
            
            throw error
        }
    }

    // ✅ 문서방 참여 및 데이터 로딩 (편집 모드에서만)
    useEffect(() => {
        async function joinRoomAndConnect() {
            if (!roomId) {
                setError("잘못된 접근입니다. Room ID가 없습니다.");
                setIsLoading(false);
                return;
            }

            // ✅ 편집 모드가 아니면 로딩하지 않음
            if (!isEditing) {
                console.log('👀 보기 전용 모드 - 데이터 로딩 생략')
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true);
                setError(null);
                
                console.log('🚪 문서방 참여 시작:', roomId);

                // 문서방 참여
                const roomResponse = await safeApiCall(
                    () => api.get(`/api/rooms/${roomId}`),
                    '문서방 정보 조회 실패'
                );
                
                if (!roomResponse) return; // 인증 에러로 리다이렉트된 경우
                
                console.log('🏠 문서방 정보:', roomResponse.data);
                setRoomData(roomResponse.data);

                // 문서방 글 조회
                const writingsResponse = await safeApiCall(
                    () => api.get(`/api/writings/room/${roomId}`),
                    '문서방 글 조회 실패'
                );
                
                if (!writingsResponse) return; // 인증 에러로 리다이렉트된 경우
                
                console.log('📝 문서방 글:', writingsResponse.data);
                
                const initialWritings = Array.isArray(writingsResponse.data) 
                    ? writingsResponse.data 
                    : [];
                    
                setWritings(initialWritings.length > 0 
                    ? initialWritings 
                    : [{ body: '<p>이야기를 시작하세요...</p>' }]
                );

                // WebSocket 연결 (편집 모드에서만)
                if (isEditing && authService.isAuthenticated()) {
                    console.log('⚡ WebSocket 연결 시작...');
                    attemptWebSocketConnection();
                }

            } catch (err) {
                console.error('❌ 문서방 참여 실패:', err);
                
                if (err.message.includes('로그인이 필요')) {
                    setError('로그인이 필요합니다. 다시 로그인해주세요.');
                } else if (err.response?.status === 404) {
                    setError('문서방을 찾을 수 없습니다. 이미 삭제되었거나 잘못된 주소일 수 있습니다.');
                } else if (err.response?.status === 403) {
                    setError('이 문서방에 접근할 권한이 없습니다.');
                } else {
                    setError(`문서방 참여에 실패했습니다: ${err.response?.data?.message || err.message}`);
                }
            } finally {
                setIsLoading(false);
            }
        }
        
        joinRoomAndConnect();

        // Cleanup: WebSocket 연결 해제
        return () => {
            if (websocketConnected) {
                try {
                    websocketService.disconnect();
                    console.log('🧹 WebSocket cleanup 완료');
                } catch (e) {
                    console.warn('⚠️ WebSocket cleanup 에러:', e);
                }
            }
        };
    }, [roomId, isEditing]);

    // WebSocket 연결 시도
    const attemptWebSocketConnection = async () => {
        const attempts = connectionAttempts + 1;
        setConnectionAttempts(attempts);
        
        console.log(`🔌 WebSocket 연결 시도 ${attempts}...`);
        
        try {
            websocketService.connect(roomId, {
                onConnect: (frame) => {
                    console.log('✅ WebSocket 연결 성공:', frame);
                    setWebsocketConnected(true);
                    setWebsocketError(null);
                    setConnectionAttempts(0);
                    setShowConnectionStatus(false);
                },
                onMessage: (message) => {
                    console.log('📨 WebSocket 메시지 수신:', message);
                    handleWebSocketMessage(message);
                },
                onError: (error) => {
                    console.error('❌ WebSocket 에러:', error);
                    setWebsocketConnected(false);
                    setWebsocketError(error.message || 'WebSocket 연결 오류');
                    
                    // 3회 이상 실패하면 포기
                    if (attempts >= 3) {
                        console.log('🛑 최대 WebSocket 연결 시도 횟수 초과');
                        setShowConnectionStatus(true);
                    }
                },
                onClose: () => {
                    console.log('🔌 WebSocket 연결 종료');
                    setWebsocketConnected(false);
                }
            });
        } catch (error) {
            console.error('❌ WebSocket 연결 설정 실패:', error);
            setWebsocketError(error.message);
            setWebsocketConnected(false);
        }
    };

    // WebSocket 메시지 처리
    const handleWebSocketMessage = (message) => {
        if (message.type === 'EDIT' && message.num === "1") {
            setWritings(prev => {
                const newWritings = [...prev];
                if (newWritings.length > 0) {
                    newWritings[0] = { ...newWritings[0], body: message.message };
                } else {
                     newWritings.push({ body: message.message });
                }
                return newWritings;
            });
        }
    };

    // 로컬 편집 처리 (WebSocket으로 전송)
    const handleLocalEdit = (index, html) => {
        const newWritings = [...writings];
        newWritings[index] = { ...newWritings[index], body: html };
        setWritings(newWritings);

        if (isEditing && websocketService.isConnectedToRoom()) {
            websocketService.sendThrottledMessage(index, html);
        }
    };

    // WebSocket 수동 재연결
    const handleWebSocketReconnect = () => {
        console.log('🔄 수동 WebSocket 재연결...');
        setConnectionAttempts(0);
        setWebsocketError(null);
        setShowConnectionStatus(false);
        attemptWebSocketConnection();
    };

    // 임시 저장
    const handleSave = async () => {
        try {
            console.log('💾 임시저장 시작:', writings);
            
            const writingDto = {
                title: roomData?.title || '제목 없음',
                body: writings[0]?.body || '<p>내용이 없습니다.</p>',
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            };

            await safeApiCall(
                () => api.post('/api/writings', writingDto),
                '임시저장 실패'
            );

            alert('임시저장되었습니다!');
            
        } catch (error) {
            console.error('❌ 임시저장 실패:', error);
            alert(`임시저장에 실패했습니다: ${error.response?.data?.message || error.message}`);
        }
    };

    // 완성하기 모달 열기
    const handleCompleteClick = () => {
        if (!canComplete) {
            alert(`완성하려면 최소 ${COMPLETION_CRITERIA.MIN_WORDS}단어 또는 ${COMPLETION_CRITERIA.MIN_CHARACTERS}글자 이상 작성해야 합니다.`);
            return;
        }
        setShowCompletionModal(true);
    };

    // 작품 완성 처리
    const handleComplete = async () => {
        if (!canComplete) {
            alert('완성 조건을 충족하지 않습니다.');
            return;
        }

        setIsCompleting(true);
        try {
            const writingDto = {
                title: roomData?.title || '제목 없음',
                body: writings[0]?.body || '<p>내용이 없습니다.</p>',
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            };

            await safeApiCall(
                () => api.post('/api/writings', writingDto),
                '작품 완성 실패'
            );

            alert('작품이 저장되었습니다.');
            setShowCompletionModal(false);
            
        } catch (error) {
            console.error('❌ 작품 완성 실패:', error);
            alert(`작품 완성에 실패했습니다: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsCompleting(false);
        }
    };

    // 문서방 나가기
    const handleExit = async () => {
        try {
            if (websocketConnected) {
                websocketService.disconnect();
            }
            
            await safeApiCall(
                () => api.post(`/api/rooms/exit`, null, { params: { roomId } }),
                '문서방 나가기 실패'
            );
            
            console.log('🚪 문서방 나가기 완료');
        } catch (error) {
            console.error('❌ 문서방 나가기 실패:', error);
            // 에러가 발생해도 페이지에서는 나가기
        } finally {
            navigate(-1);
        }
    };

    // 신고 모달 열기
    const handleReportClick = () => {
        setShowReportModal(true);
    };

    // 신고 제출
    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportReason.trim()) {
            alert('신고 사유를 입력해주세요.');
            return;
        }

        setIsReporting(true);
        try {
            await safeApiCall(
                () => api.post('/api/reports', {
                    title: roomData?.title || '제목 없음',
                    depth: 0,
                    siblingIndex: 0,
                    body: reportReason,
                    time: new Date().toISOString()
                }),
                '신고 제출 실패'
            );

            alert('신고가 접수되었습니다.');
            setShowReportModal(false);
            setReportReason('');
        } catch (error) {
            console.error('❌ 신고 제출 실패:', error);
            alert('신고 제출에 실패했습니다.');
        } finally {
            setIsReporting(false);
        }
    };

    // ✅ 편집 모드가 아닌 경우 리다이렉트
    if (!isEditing) {
        console.log('❌ 편집 모드가 아닌 상태로 CanvasPage 접근 시도')
        navigate(-1)
        return null
    }

    if (isLoading) return <div className="p-8 text-center">편집 모드 로딩 중...</div>;
    if (error) return (
        <div className="p-8 text-center">
            <div className="text-red-500 mb-4">오류: {error}</div>
            <button 
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                뒤로 가기
            </button>
        </div>
    );

    return (
        <div className="min-h-screen">
            <div className="container mx-auto bg-white rounded-xl shadow overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <button
                        onClick={handleExit}
                        className="flex items-center space-x-1 text-zinc-700 hover:text-zinc-900"
                    >
                        <span className="inline-block w-4 h-4 border-b-2 border-l-2 border-zinc-700 rotate-45" />
                        <span>나가기</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="text-xl font-semibold">{roomData?.title || '제목 없음'}</div>
                        <div className="text-sm text-gray-500">
                            편집 모드 • Room ID: {roomId}
                        </div>
                    </div>
                    <span className="text-base font-medium text-zinc-500">
                        {formatDate(roomData?.time)}
                    </span>
                </div>

                <div className="p-6 space-y-8">
                    {/* 작품 통계 및 상태 표시 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium">단어 수:</span> {completionStats.wordCount}
                                {completionStats.wordCount >= COMPLETION_CRITERIA.MIN_WORDS && 
                                    <span className="text-green-600 ml-1">✓</span>
                                }
                            </div>
                            <div>
                                <span className="font-medium">글자 수:</span> {completionStats.characterCount}
                                {completionStats.characterCount >= COMPLETION_CRITERIA.MIN_CHARACTERS && 
                                    <span className="text-green-600 ml-1">✓</span>
                                }
                            </div>
                            <div>
                                <span className="font-medium">완성 가능:</span> 
                                <span className={canComplete ? 'text-green-600' : 'text-red-600'}>
                                    {canComplete ? '예' : '아니오'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* WebSocket 연결 상태 표시 */}
                    <div className={`p-3 rounded-lg flex items-center justify-between ${
                        websocketConnected 
                            ? 'bg-green-50 border border-green-200' 
                            : showConnectionStatus 
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                        <span className={`text-sm ${
                            websocketConnected 
                                ? 'text-green-700' 
                                : showConnectionStatus 
                                    ? 'text-red-700'
                                    : 'text-yellow-700'
                        }`}>
                            {websocketConnected 
                                ? '✅ 실시간 동기화 연결됨' 
                                : showConnectionStatus
                                    ? `❌ 실시간 동기화 연결 실패: ${websocketError || '알 수 없는 오류'}`
                                    : '🔄 실시간 동기화 연결 중...'
                            }
                        </span>
                        
                        {showConnectionStatus && (
                            <button 
                                onClick={handleWebSocketReconnect}
                                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                다시 연결
                            </button>
                        )}
                    </div>

                    {/* 본문 에디터 */}
                    <CarouselEditor
                        variants={writings.map(w => w.body || '<p>내용이 없습니다.</p>')}
                        readOnly={false} // ✅ 편집 모드에서는 항상 편집 가능
                        onChange={handleLocalEdit}
                    />

                    {/* 액션 버튼들 */}
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={handleSave}
                            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 transition rounded-full text-white font-semibold"
                        >
                            임시저장
                        </button>
                        <button
                            onClick={handleCompleteClick}
                            disabled={!canComplete}
                            className={`px-6 py-3 transition rounded-full font-semibold ${
                                canComplete 
                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                    : 'bg-gray-300 cursor-not-allowed text-gray-500'
                            }`}
                        >
                            완성하기
                        </button>
                    </div>
                </div>
            </div>

            {/* 완성 확인 모달 */}
            {showCompletionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-black">작품 완성</h3>
                            <button
                                onClick={() => setShowCompletionModal(false)}
                                className="text-black hover:bg-gray-200 rounded-full p-1"
                            >✕</button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-700">
                                작품을 완성하시겠습니까? 완성 후에는 수정할 수 없습니다.
                            </p>
                            <div className="text-sm text-gray-500">
                                <p>현재 통계:</p>
                                <p>• 단어 수: {completionStats.wordCount}</p>
                                <p>• 글자 수: {completionStats.characterCount}</p>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowCompletionModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={isCompleting}
                                    className={`
                                        px-4 py-2 rounded-lg font-medium
                                        ${isCompleting
                                            ? 'bg-green-300 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                        }
                                    `}
                                >
                                    {isCompleting ? '완성 중...' : '완성하기'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 신고 모달 */}
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