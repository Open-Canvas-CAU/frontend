// src/components/editor/ImageTextSection.jsx
import React from 'react'

export default function ImageTextSection({
                                             imgSrc,
                                             text,
                                             onEdit
                                         }) {
    return (
        <div className="absolute inline-flex justify-start items-center gap-11 left-[236px] top-[344px] w-[1611px]">
            <img
                src={imgSrc}
                className="flex-1 self-stretch rounded-2xl"
                alt="placeholder"
            />
            <div className="w-[1209px] h-56 flex flex-col gap-5">
                <p className="flex-1 text-solarized-base03 text-3xl font-medium leading-10">
                    {text}
                </p>
                <div className="flex gap-8">
                    <button
                        onClick={onEdit}
                        className="w-52 h-14 p-3 bg-solarized-blue/70 rounded-full flex items-center gap-2"
                    >
                        {/* 여기에 아이콘 img 태그 삽입 가능 */}
                        <span className="text-solarized-base03 text-xl font-semibold">
              수정하기
            </span>
                    </button>
                </div>
            </div>
        </div>
    )
}
