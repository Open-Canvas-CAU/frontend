// src/components/editor/NewCanvasPage.jsx
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
    const [file, setFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    // 문서방 생성 및 입장
    const handleCreate = async () => {
        if (!title.trim()) {
            alert('제목을 입력해주세요.')
            return
        }

        setIsLoading(true)
        try {
            // WritingDto 생성
            const writingDto = {
                title,
                body,
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            }

            // 문서방 생성 및 입장
            const response = await api.post('/api/rooms/create', writingDto)
            const { roomId } = response.data

            // 생성된 문서방으로 이동
            navigate(`/editor/${roomId}`)
        } catch (error) {
            console.error('문서방 생성 실패:', error)
            alert('문서방 생성에 실패했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto bg-white rounded-tl-3xl shadow overflow-hidden">
                {/* 헤더: 뒤로가기 + 페이지 제목 */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-1 text-zinc-700 hover:text-zinc-900"
                    >
                        <span className="inline-block w-4 h-4 border-b-2 border-l-2 border-zinc-700 rotate-45" />
                        <span>뒤로 가기</span>
                    </button>
                    <h2 className="text-2xl font-semibold text-black">새 캔버스 만들기</h2>
                    <div /> {/* 오른쪽 빈 칸 맞춤용 */}
                </div>

                <div className="p-6 space-y-8">
                    {/* 1) 제목 입력 */}
                    <ThemeInput
                        value={title}
                        onChange={setTitle}
                        className="p-4"
                    />

                    {/* 2) 본문 에디터 */}
                    <EditorSection
                        content={body}
                        onChange={setBody}
                        readOnly={false}
                        className="min-h-[300px] border border-grey-200 rounded-lg p-4"
                    />

                    {/* 3) 저장 버튼 */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleCreate}
                            disabled={isLoading}
                            className={`
                                px-6 py-3 rounded-full font-semibold transition
                                ${isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }
                            `}
                        >
                            {isLoading ? '생성 중...' : '생성하기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
