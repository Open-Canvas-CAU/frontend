// src/components/editor/NewCanvasPage.jsx
import React, { useState }    from 'react'
import { useNavigate }         from 'react-router-dom'
import PhotoUpload             from './PhotoUpload'
import EditorSection           from './EditorSection'
import ThemeInput              from './ThemeInput'

export default function NewCanvasPage() {
    const navigate   = useNavigate()
    const [title, setTitle] = useState('')
    const [body,  setBody]  = useState('')
    const [file,  setFile]  = useState(null)

    // const handleSave = () => {
    //     // TODO: API 호출해서 새 캔버스 생성
    //     console.log({ title, body, file })
    // }

    const [isEditing, setIsEditing] = useState(false)

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
                    </button>
                    <h2 className="text-2xl font-semibold text-black">새 캔버스 만들기</h2>
                    <div /> {/* 오른쪽 빈 칸 맞춤용 */}
                </div>

                <div className="p-6 space-y-8">
                    {/* 1) 제목 입력 */}
                    <ThemeInput
                        value={title}
                        onChange={setTitle}
                        // placeholder="캔버스 제목을 입력하세요"
                        className="min-h-[300px] p-4"
                    />

                    {/* 2) 사진 업로드 */}
                    {/*<div className="flex flex-col md:flex-row items-start gap-6">*/}
                        {/*<PhotoUpload*/}
                        {/*    onFileSelect={setFile}*/}
                        {/*    className="flex-none w-40 h-32 md:w-56 md:h-40 border-2 border-dashed border-gray-300 rounded-xl"*/}
                        {/*/>*/}
                        {/*<p className="text-gray-500">*/}
                        {/*    업로드할 이미지를 선택하세요.<br/>*/}
                        {/*    (최대 5MB, JPG/PNG)*/}
                        {/*</p>*/}
                    {/*</div>*/}

                    {/* 3) 본문 에디터 */}
                    <EditorSection
                        content={body}
                        onChange={setBody}
                        readOnly={false}
                        className="min-h-[300px] border border-gray-200 rounded-lg p-4"
                    />

                    {/* 4) 저장 버튼 */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 transition rounded-full text-zinc-900 font-semibold"
                        >
                            생성하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
