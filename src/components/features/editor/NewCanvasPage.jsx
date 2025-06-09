import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhotoUpload from './PhotoUpload'
import EditorSection from './EditorSection'
import ThemeInput from './ThemeInput'
import api from '@/services/api'

/**
 * 새 캔버스를 생성하는 페이지 컴포넌트입니다.
 * 제목, 본문 내용을 입력하고 문서방을 생성합니다.
 */
export default function NewCanvasPage() {
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [file, setFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    /**
     * '생성하기' 버튼 클릭 시 호출됩니다.
     * 1. 문서방 생성 -> 2. 커버 생성 순서로 진행합니다.
     */
    const handleCreate = async () => {
        if (!title.trim()) {
            alert('제목을 입력해주세요.')
            return
        }

        setIsLoading(true)
        try {
            // 1. 먼저 문서방을 생성합니다 (이때 WritingDto와 함께)
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

            // 2. 커버를 생성합니다 (작업 중 상태로, contentId는 null)
            try {
                const coverDto = {
                    title,
                    coverImageUrl: "https://via.placeholder.com/400x300?text=" + encodeURIComponent(title),
                    time: new Date().toISOString()
                    // contentId는 의도적으로 null로 둠 (작업 중 상태)
                }
                
                console.log('Creating cover with data:', coverDto)
                const coverResponse = await api.post('/api/covers', coverDto)
                console.log('Cover creation response:', coverResponse.data)
            } catch (coverError) {
                console.warn('Cover creation failed, but continuing with room:', coverError)
                // 커버 생성 실패해도 문서방은 이미 생성되었으므로 계속 진행
            }

            // 3. 성공적으로 생성되면 에디터 페이지로 이동
            console.log('Navigating to editor with roomId:', roomData.roomId)
            navigate(`/editor/${roomData.roomId}`)
            
        } catch (error) {
            console.error('문서방 생성 실패:', error)
            console.error('Error response:', error.response?.data)
            alert(`문서방 생성에 실패했습니다: ${error.response?.data?.message || error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto bg-white rounded-tl-3xl shadow overflow-hidden">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-1 text-zinc-700 hover:text-zinc-900"
                    >
                        <span className="inline-block w-4 h-4 border-b-2 border-l-2 border-zinc-700 rotate-45" />
                        <span>뒤로 가기</span>
                    </button>
                    <h2 className="text-2xl font-semibold text-black">새 캔버스 만들기</h2>
                    <div />
                </div>

                <div className="p-6 space-y-8">
                    {/* 안내 메시지 */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    <strong>새 캔버스 만들기</strong><br />
                                    제목과 내용을 입력하고 생성하기를 누르면 작업 중인 캔버스가 생성됩니다.
                                    작업을 완료하면 '완성하기' 버튼으로 갤러리에 게시할 수 있습니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 제목 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            캔버스 제목 *
                        </label>
                        <ThemeInput
                            value={title}
                            onChange={setTitle}
                            className="p-4"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            다른 사용자들이 볼 수 있는 캔버스의 제목입니다.
                        </p>
                    </div>

                    {/* 본문 에디터 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            초기 내용 (선택사항)
                        </label>
                        <EditorSection
                            content={body}
                            onChange={setBody}
                            readOnly={false}
                            className="min-h-[300px] border border-gray-200 rounded-lg p-4"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            캔버스의 시작 내용을 입력하세요. 나중에 편집할 수 있습니다.
                        </p>
                    </div>

                    {/* 이미지 업로드 (향후 구현) */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <div className="text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">커버 이미지 업로드 (준비 중)</p>
                                <p className="text-xs text-gray-400 mt-1">현재는 자동으로 생성된 이미지를 사용합니다</p>
                            </div>
                        </div>
                    </div>

                    {/* 생성 버튼 */}
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 border border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={isLoading || !title.trim()}
                            className={`
                                px-6 py-3 rounded-full font-semibold transition
                                ${isLoading || !title.trim()
                                    ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }
                            `}
                        >
                            {isLoading ? '생성 중...' : '캔버스 생성하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}