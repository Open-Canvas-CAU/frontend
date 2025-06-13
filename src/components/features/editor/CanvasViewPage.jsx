// src/components/features/editor/CanvasViewPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditorSection from './EditorSection';
import { authService } from '@/services/authService';
import { coverService } from '@/services/coverService'; // coverService 사용
import api from '@/services/api';
import VersionTree from './VersionTree';
import { 
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    ROUTES,
    UI_CONSTANTS,
    RoomType
} from '@/types';

export default function CanvasViewPage() {
    const { coverId } = useParams();
    const navigate = useNavigate();

    const [coverData, setCoverData] = useState(null);
    const [writings, setWritings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isJoiningRoom, setIsJoiningRoom] = useState(false);
    const [showVersions, setShowVersions] = useState(false);
    const [savedWritings, setSavedWritings] = useState([]);

    useEffect(() => {
        const fetchCanvasData = async () => {
            if (!coverId) {
                setError(ERROR_MESSAGES.INVALID_INPUT);
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const coverRes = await api.get('/api/covers/check', { params: { coverId } });
                const cover = coverRes.data;
                
                if (!cover) {
                    setError(ERROR_MESSAGES.NOT_FOUND);
                    setIsLoading(false);
                    return;
                }
                
                setCoverData(cover);

                let items = [];
                if (cover.roomId) {
                    const roomRes = await api.get(`/api/rooms/${cover.roomId}`);
                    items = roomRes.data?.writingDtos || [];
                    setSavedWritings(items);
                }
                else if (cover.contentId) {
                    const contentRes = await api.get(`/api/contents/${cover.id}`);
                    items = contentRes.data?.writingDtos || [];
                    setSavedWritings(items);
                }
                
                if (items.length === 0) {
                    items.push({ body: '<p>아직 작성된 내용이 없습니다.</p>' });
                }
                setWritings(items);

            } catch (err) {
                console.error("CanvasViewPage fetch error:", err);
                setError(err.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCanvasData();
    }, [coverId]);

    const handleStartEditing = async () => {
        if (!authService.isAuthenticated()) {
            navigate(ROUTES.LOGIN, { state: { from: ROUTES.CANVAS.VIEW(coverId) } });
            return;
        }
        setIsJoiningRoom(true);
        try {
            let roomId = coverData.roomId;
            if (!roomId) {
                const initial = { 
                    title: coverData.title, 
                    body: '<p>새 이야기...</p>', 
                    depth: 0, 
                    siblingIndex: 0, 
                    time: new Date().toISOString() 
                };
                const roomRes = await api.post('/api/rooms/create', initial);
                roomId = roomRes.data.roomId;
            } else {
                await api.get(`/api/rooms/${roomId}`);
            }
            navigate(ROUTES.EDITOR.EDIT(roomId));
        } catch (err) {
            alert(ERROR_MESSAGES.ROOM_ACCESS_DENIED);
        } finally {
            setIsJoiningRoom(false);
        }
    };

    const handleViewCompleted = () => navigate(ROUTES.CANVAS.COMPLETED(coverId));

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-red-300/20 border-t-red-300/80 rounded-full animate-spin"></div>
                    <div className="text-xl text-white">로딩 중...</div>
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
    
    if (!coverData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center space-y-4">
                    <div className="text-xl text-white">{ERROR_MESSAGES.NOT_FOUND}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <button onClick={()=>navigate(-1)} className="text-white">← 나가기</button>
                <div className="text-center flex items-center justify-center gap-2">
                    {/* {coverData.roomType === 'EDITING' && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-red-500 font-medium">ON AIR</span>
                        </div>
                    )} */}
                    <div>
                        <div className="text-xl font-semibold">{coverData.title}</div>
                        <div className={`text-sm flex items-center justify-center gap-1.5 ${
                            coverData.roomType === 'EDITING' 
                                ? 'text-red-500' 
                                : 'text-white-500'
                        }`}>
                            {coverData.roomType === 'EDITING' ? (
                                <>
                                    편집 중
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                </>
                            ) : (
                                '편집 가능'
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={()=>setShowVersions(!showVersions)} className="px-4 py-2 bg-black-100 rounded">📊 버전 기록</button>
                </div>
            </div>
            <div className="p-6">
                <EditorSection content={writings[0].body} readOnly className="min-h-[300px] prose" />
                {!coverData.contentId && (
                    <button 
                        onClick={handleStartEditing} 
                        disabled={isJoiningRoom || coverData.roomType === 'EDITING'} 
                        className={`mt-4 px-6 py-3 rounded transition-colors ${
                            coverData.roomType === 'EDITING'
                                ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    >
                        {coverData.roomType === 'EDITING' ? '편집 중 (비활성화)' : '편집하기'}
                    </button>
                )}
                {coverData.contentId && (
                    <button 
                        onClick={handleViewCompleted} 
                        className="mt-4 px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        🎨 완성작 보기
                    </button>
                )}
            </div>
            {showVersions && (
                <div className="fixed right-0 top-0 w-80 h-full bg-black shadow-2xl z-40">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">버전 기록</h3>
                            <button onClick={()=>setShowVersions(false)} className="w-6 h-6">✕</button>
                        </div>
                        {savedWritings.length>0 ? <VersionTree writings={savedWritings} onNodeClick={() => {}} currentVersion={null}/> : <p className="text-white-500">버전 기록이 없습니다.</p>}
                    </div>
                </div>
            )}
        </div>
    )
}
