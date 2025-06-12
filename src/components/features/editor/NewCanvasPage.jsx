// src/components/features/editor/NewCanvasPage.jsx - 개선된 버전

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeInput from './ThemeInput'
import EditorSection from './EditorSection'
import api from '@/services/api'

export default function NewCanvasPage() {
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [limit, setLimit] = useState(5)
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)

    // 📋 올바른 순서: Cover -> Content -> Writing (Room) 구현
    const handleCreate = async () => {
        if (!title.trim()) {
            alert('제목을 입력해주세요.')
            return
        }
    
        setIsLoading(true)
        try {
            console.log('🚀 캔버스 생성 시작...')
            
            // 1. 커버 생성
            const coverDto = {
                title,
                coverImageUrl: "https://via.placeholder.com/400x300?text=" + encodeURIComponent(title),
                time: new Date().toISOString(),
                limit: limit,
            }
            
            console.log('📝 커버 생성 요청:', coverDto)
            const coverResponse = await api.post('/api/covers', coverDto)
            const createdCover = coverResponse.data
            console.log('✅ 커버 생성 완료:', createdCover)
            
            if (!createdCover.id) {
                throw new Error('Cover ID가 반환되지 않았습니다')
            }
    
            // 2. 문서방 생성
            const writingDto = {
                title,
                body: body || '<p>새로운 캔버스가 시작되었습니다.</p>',
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            }
    
            console.log('🏠 문서방 생성 요청:', writingDto)
            const roomResponse = await api.post('/api/rooms/create', writingDto)
            const roomData = roomResponse.data
            console.log('✅ 문서방 생성 완료:', roomData)
            
            // ⭐ roomId 검증 강화
            if (!roomData || !roomData.roomId) {
                console.error('❌ roomId가 반환되지 않았습니다:', roomData)
                throw new Error('서버에서 Room ID를 반환하지 않았습니다')
            }
    
            const finalRoomId = roomData.roomId
            console.log('🎯 최종 roomId:', finalRoomId)
            
            if (typeof finalRoomId !== 'string' || finalRoomId.trim() === '') {
                throw new Error(`유효하지 않은 roomId: ${finalRoomId}`)
            }
    
            // 3. 성공 애니메이션 후 에디터로 이동
            setStep(3)
            const targetUrl = `/editor/${finalRoomId}/edit`
            console.log('🚀 리다이렉트 대상:', targetUrl)
            
            setTimeout(() => {
                navigate(targetUrl)
            }, 2000)
            
        } catch (error) {
            console.error('❌ 캔버스 생성 실패:', error)
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            })
            alert(`캔버스 생성에 실패했습니다: ${error.response?.data?.message || error.message}`)
        } finally {
            setIsLoading(false)
        }
    }
    
    // 완성된 작품으로 즉시 변환하는 함수 (테스트용)
    const handleCreateCompleted = async () => {
        if (!title.trim()) {
            alert('제목을 입력해주세요.')
            return
        }

        setIsLoading(true)
        try {
            console.log('🎨 완성작 생성 플로우 시작...')
            
            // 1. Cover 생성
            const coverDto = {
                title,
                coverImageUrl: `https://via.placeholder.com/400x300?text=${encodeURIComponent(title)}`,
                time: new Date().toISOString(),
                limit: limit,
            }
            
            const coverResponse = await api.post('/api/covers', coverDto)
            const createdCover = coverResponse.data
            
            // 2. Writing 생성 (Room)
            const writingDto = {
                title,
                body: body || '<h1>완성된 작품</h1><p>이 작품은 완성되었습니다.</p>',
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            }
            
            const roomResponse = await api.post('/api/rooms/create', writingDto)
            
            // 3. Content 생성 (완성작으로 만들기)
            const contentResponse = await api.get(`/api/contents/${createdCover.id}`)
            
            alert(`완성작이 생성되었습니다!\nCover ID: ${createdCover.id}\nContent ID: ${contentResponse.data.id}`)
            navigate(`/completed/${createdCover.id}`)
            
        } catch (error) {
            console.error('❌ 완성작 생성 실패:', error)
            alert(`완성작 생성에 실패했습니다: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    if (step === 3) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 flex items-center justify-center">
                <div className="text-center text-white space-y-6">
                    <div className="text-8xl animate-bounce">🎉</div>
                    <h2 className="text-4xl font-bold">캔버스가 생성되었습니다!</h2>
                    <p className="text-xl opacity-90">편집 페이지로 이동하고 있습니다...</p>
                    <div className="text-sm opacity-75">
                        Cover → Content → Writing 순서로 생성 완료!
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
            <div className="relative z-10 min-h-screen py-8">
                <div className="container mx-auto max-w-4xl">
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
                                <span className="font-medium">돌아가기</span>
                            </button>
                            
                            <div className="text-center">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    새 캔버스 만들기
                                </h1>
                                <p className="text-gray-600 mt-1">함께 만들어갈 이야기를 시작해보세요</p>
                            </div>
                            
                            <div className="w-24"></div>
                        </div>
                    </div>

                    {/* 메인 컨텐츠 */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                        <div className="p-8 space-y-8">
                            {/* API 순서 안내 */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                        📋
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-2">생성 순서</h3>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>1️⃣ <strong>Cover</strong> 생성 - 캔버스 표지 정보</p>
                                            <p>2️⃣ <strong>Content</strong> 조회/생성 - 실제 작품 데이터</p>
                                            <p>3️⃣ <strong>Writing (Room)</strong> 생성 - 편집용 문서방</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 제목 입력 */}
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                                    <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">1</span>
                                    <span>캔버스 제목</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <ThemeInput
                                    value={title}
                                    onChange={setTitle}
                                    placeholder="예: 판타지 모험기, 미래 도시 이야기..."
                                />
                            </div>

                            {/* 작가 수 제한 */}
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                                    <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">2</span>
                                    <span>최대 작가 수</span>
                                </label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={limit}
                                        onChange={(e) => setLimit(parseInt(e.target.value))}
                                        className="flex-1"
                                    />
                                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                        {limit}
                                    </div>
                                </div>
                            </div>

                            {/* 초기 내용 */}
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                                    <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">3</span>
                                    <span>시작 이야기</span>
                                    <span className="text-gray-400 text-sm font-normal">(선택사항)</span>
                                </label>
                                <EditorSection
                                    content={body}
                                    onChange={setBody}
                                    readOnly={false}
                                    className="min-h-[200px] border-2 border-gray-200 rounded-2xl"
                                />
                            </div>

                            {/* 생성 버튼들 */}
                            <div className="flex justify-between items-center pt-6">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-8 py-4 border-2 border-gray-300 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300"
                                >
                                    취소
                                </button>
                                
                                <div className="flex space-x-4">
                                    {/* 테스트용: 완성작으로 생성 */}
                                    <button
                                        onClick={handleCreateCompleted}
                                        disabled={isLoading || !title.trim()}
                                        className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-2xl font-bold transition-all duration-300"
                                    >
                                        완성작으로 생성
                                    </button>
                                    
                                    {/* 일반 캔버스 생성 */}
                                    <button
                                        onClick={handleCreate}
                                        disabled={isLoading || !title.trim()}
                                        className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                                            isLoading || !title.trim()
                                                ? 'bg-gray-400 cursor-not-allowed text-gray-200 scale-95' 
                                                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>생성 중...</span>
                                            </div>
                                        ) : (
                                            '🎨 캔버스 생성하기'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}