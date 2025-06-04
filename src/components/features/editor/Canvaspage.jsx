// src/components/editor/CanvasPage.jsx
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CarouselEditor from './CarouselEditor.jsx'

export default function CanvasPage() {
    const { docId } = useParams()
    const navigate  = useNavigate()

    // static data
    const updatedAt = '25.04.21 오후 4:30 마지막 수정'
    const introText = '여기는 주제 설명 영역입니다. 간략하게 요약된 텍스트가 들어갑니다.'
    const imgSrc    = 'https://placehold.co/356x230'

    // editing toggle
    const [isEditing, setIsEditing] = useState(false)
    // keep exactly two variants in state
    const initialHtml = `
    <p>여기에 본문 내용이 출력됩니다. 이건 더미 HTML이에요.</p>
    <p>나중에 실제 API 결과를 넣으면 됩니다.</p>
  `
    const [variants, setVariants] = useState([initialHtml, initialHtml])

    const goBack = () => navigate(-1)

    const handleSave = () => {
        // TODO: API 호출해서 variants 배열 저장
        console.log('saving variants for', docId, variants)
        setIsEditing(false)
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto bg-white rounded-xl shadow overflow-hidden">
                {/* header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <button
                        onClick={goBack}
                        className="flex items-center space-x-1 text-zinc-700 hover:text-zinc-900"
                    >
                        <span className="inline-block w-4 h-4 border-b-2 border-l-2 border-zinc-700 rotate-45" />
                    </button>
                    <span className="text-base font-medium text-zinc-500">{updatedAt}</span>
                </div>

                {/* thumbnail + intro + edit/save */}
                <div className="p-6 space-y-8">
                    <div className="inline-flex w-full justify-start items-start gap-11">
                        {/* left: thumbnail */}
                        <img
                            src={imgSrc}
                            alt="thumbnail"
                            className="flex-1 rounded-2xl object-cover"
                        />

                        {/* right: intro + button */}
                        <div className="w-[1209px] flex flex-col justify-start items-start gap-5">
                            <p className="text-black text-3xl font-medium leading-10">
                                {introText}
                            </p>
                            {isEditing ? (
                                <button
                                    onClick={handleSave}
                                    className="w-52 h-14 p-3 bg-green-500 hover:bg-green-600 rounded-full flex justify-center items-center gap-2 text-white text-xl font-semibold transition"
                                >
                                    저장하기
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-52 h-14 p-3 bg-blue-300 hover:bg-blue-400 rounded-full flex justify-center items-center gap-2 text-zinc-800 text-xl font-semibold transition"
                                >
                                    수정하기
                                </button>
                            )}
                        </div>
                    </div>

                    {/* carousel of two variants */}
                    <CarouselEditor
                        variants={variants}
                        readOnly={!isEditing}
                        onChange={(idx, html) => {
                            setVariants(prev => {
                                const copy = [...prev]
                                copy[idx] = html
                                return copy
                            })
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
