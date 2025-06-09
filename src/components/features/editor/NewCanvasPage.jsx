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
     * 입력된 제목과 본문으로 문서방 생성을 요청하고,
     * 성공 시 해당 문서방의 에디터 페이지로 이동합니다.
     */
    const handleCreate = async () => {
        if (!title.trim()) {
            alert('제목을 입력해주세요.')
            return
        }

        setIsLoading(true)
        try {
            // API 요청을 위한 WritingDto 객체를 생성합니다.
            const writingDto = {
                title,
                body,
                depth: 0,
                siblingIndex: 0,
                time: new Date().toISOString()
            }

            // 문서방 생성 및 입장 API를 호출합니다.
            const response = await api.post('/api/rooms/create', writingDto)
            const { roomId } = response.data

            // 성공적으로 생성되면, 해당 문서방 ID를 사용하여 에디터 페이지로 이동합니다.
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
                    {/* 제목 입력 */}
                    <ThemeInput
                        value={title}
                        onChange={setTitle}
                        className="p-4"
                    />

                    {/* 본문 에디터 */}
                    <EditorSection
                        content={body}
                        onChange={setBody}
                        readOnly={false}
                        className="min-h-[300px] border border-grey-200 rounded-lg p-4"
                    />

                    {/* 생성 버튼 */}
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
