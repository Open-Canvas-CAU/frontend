import React from 'react'

export default function CanvasCard({
                                       title,
                                       timeAgo,
                                       description,
                                       imgSrc,
                                       onClick,
                                   }) {
    return (
        <div
            onClick={onClick}
            className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden"
        >
            {/* 썸네일: 고정 높이(224px)로 데스크탑에 적합 */}
            <div className="w-full h-56">
                <img
                    src={imgSrc}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{timeAgo}</span>
                    {/* 예: 즐겨찾기 아이콘 버튼 추가 가능 */}
                </div>
                <p className="mt-2 text-base text-gray-700">{description}</p>
            </div>
        </div>
    )
}
