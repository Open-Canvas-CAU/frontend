import React from 'react'

export default function CanvasCard({
                                       title,
                                       timeAgo,
                                       description,
                                       imgSrc,
                                       onClick,
                                   }) {
    return (
        <div className="w-full group">
            {/* 이미지 카드 */}
            <div 
                className="w-full cursor-pointer"
                onClick={onClick}
            >
                <img 
                    src={imgSrc} 
                    alt={title}
                    className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            {/* 호버 시 나타나는 정보 카드 */}
            <div className="mt-3 ml-auto mr-0 bg-white p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ width: 'calc(100% - 2rem)' }}>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{timeAgo}</span>
                    <span className="text-gray-500">작가</span>
                </div>
            </div>
        </div>
    )
}
