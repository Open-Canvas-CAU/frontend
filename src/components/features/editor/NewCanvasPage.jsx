import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhotoUpload from './PhotoUpload'
import EditorSection from './EditorSection'
import ThemeInput from './ThemeInput'
import api from '@/services/api'

export default function NewCanvasPage() {
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [limit, setLimit] = useState(5)
    const [file, setFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1)

    const handleCreate = async () => {
        if (!title.trim()) {
            alert('제목을 입력해주세요.')
            return
        }

        if (limit < 1 || limit > 10) {
            alert('작가 수 제한은 1명~10명 사이로 설정해주세요.')
            return
        }

        setIsLoading(true)
        try {
            // 1. 커버 생성
            const coverDto = {
                title,
                coverImageUrl: "https://via.placeholder.com/400x300?text=" + encodeURIComponent(title),
                time: new Date().toISOString(),
                limit: limit,
            }
            
            console.log('Creating cover with data:', coverDto)
            const coverResponse = await api.post('/api/covers', coverDto)
            console.log('Cover creation response:', coverResponse.data)
            
            const createdCover = coverResponse.data
            if (!createdCover.id) {
                throw new Error('Cover ID not received from server')
            }

            // 2. 문서방 생성
            const writingDto = {
                title,
                body: body || '<p>새로운 캔버스가 시작되었습니다.</p>',
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            }

            console.log('Creating room with writing data:', writingDto)
            const roomResponse = await api.post('/api/rooms/create', writingDto)
            console.log('Room creation response:', roomResponse.data)
            
            const roomData = roomResponse.data
            if (!roomData.roomId) {
                throw new Error('Room ID not received from server')
            }

            // 3. 성공 애니메이션 후 에디터로 이동
            setStep(3)
            setTimeout(() => {
                navigate(`/editor/${roomData.roomId}/edit`)
            }, 2000)
            
        } catch (error) {
            console.error('캔버스 생성 실패:', error)
            alert(`캔버스 생성에 실패했습니다: ${error.response?.data?.message || error.message}`)
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
                    <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse animation-delay-200"></div>
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse animation-delay-400"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
            {/* 배경 장식 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse animation-delay-700"></div>
            </div>

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
                        {/* 진행 표시기 */}
                        <div className="px-8 py-6 bg-gradient-to-r from-purple-500 to-blue-500">
                            <div className="flex items-center justify-between text-white">
                                <span className="text-sm font-medium">캔버스 설정</span>
                                <div className="flex space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
                                    <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
                                    <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-white' : 'bg-white/30'}`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* 안내 카드 */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                        ✨
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-2">협업 캔버스 만들기</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            여러 작가가 함께 참여하여 하나의 이야기를 완성해나가는 특별한 공간입니다. 
                                            제목과 내용을 설정하고, 참여할 수 있는 작가 수를 정해주세요.
                                        </p>
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
                                <div className="relative">
                                    <ThemeInput
                                        value={title}
                                        onChange={setTitle}
                                        className="bg-white border-2 border-gray-200 focus:border-purple-400 rounded-2xl p-6 text-xl"
                                    />
                                    <div className="absolute right-4 bottom-4 text-sm text-gray-400">
                                        {title.length}/50
                                    </div>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    📝 다른 작가들이 볼 수 있는 캔버스의 제목입니다. 매력적이고 명확하게 작성해주세요.
                                </p>
                            </div>

                            {/* 작가 수 제한 */}
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                                    <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">2</span>
                                    <span>최대 작가 수</span>
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center space-x-4">
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={limit}
                                                onChange={(e) => setLimit(parseInt(e.target.value))}
                                                className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                            />
                                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                                                {limit}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">최대 {limit}명의 작가</p>
                                            <p className="text-sm text-gray-600">
                                                {limit <= 3 ? '소규모 협업' : limit <= 6 ? '중간 규모 협업' : '대규모 협업'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    👥 이 캔버스에 참여할 수 있는 최대 작가 수입니다. 제한에 도달하면 자동으로 완성됩니다.
                                </p>
                            </div>

                            {/* 초기 내용 */}
                            <div className="space-y-3">
                                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800">
                                    <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm">3</span>
                                    <span>시작 이야기</span>
                                    <span className="text-gray-400 text-sm font-normal">(선택사항)</span>
                                </label>
                                <div className="border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-purple-400 transition-colors">
                                    <EditorSection
                                        content={body}
                                        onChange={setBody}
                                        readOnly={false}
                                        className="min-h-[200px] bg-white"
                                    />
                                </div>
                                <p className="text-gray-500 text-sm">
                                    ✍️ 이야기의 첫 문장이나 설정을 입력하세요. 다른 작가들이 이어서 작성할 수 있습니다.
                                </p>
                            </div>

                            {/* 설정 요약 */}
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
                                    <span className="text-xl">📋</span>
                                    <span>캔버스 설정 요약</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="text-sm text-gray-600 mb-1">제목</div>
                                        <div className="font-medium text-gray-800">
                                            {title || '(제목을 입력하세요)'}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="text-sm text-gray-600 mb-1">최대 작가 수</div>
                                        <div className="font-medium text-gray-800">{limit}명</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="text-sm text-gray-600 mb-1">상태</div>
                                        <div className="font-medium text-green-600">편집 가능</div>
                                    </div>
                                </div>
                            </div>

                            {/* 생성 버튼 */}
                            <div className="flex justify-between items-center pt-6">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-8 py-4 border-2 border-gray-300 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={isLoading || !title.trim() || limit < 1 || limit > 10}
                                    className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                                        isLoading || !title.trim() || limit < 1 || limit > 10
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
                                        <div className="flex items-center space-x-2">
                                            <span>🎨</span>
                                            <span>캔버스 생성하기</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}