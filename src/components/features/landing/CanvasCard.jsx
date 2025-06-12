// src/components/features/landing/CanvasCard.jsx - 간소화된 버전
import React from 'react'

export default function CanvasCard({
    title,
    timeAgo,
    description,
    imgSrc,
    onClick,
    cardType = 'gallery'
}) {
    return (
        <div 
            className="canvas-card w-full group cursor-pointer"
            onClick={onClick}
        >
            {/* 메인 이미지 카드 */}
            <div className={`
                relative overflow-hidden rounded-md transition-all duration-300 transform
                group-hover:scale-105 group-hover:shadow-xl
                ${cardType === 'workspace' 
                    ? 'group-hover:shadow-orange-500/20 group-hover:ring-2 group-hover:ring-orange-400/50' 
                    : 'group-hover:shadow-blue-500/20 group-hover:ring-2 group-hover:ring-blue-400/50'
                }
            `}>
                <img 
                    src={imgSrc} 
                    alt={title}
                    className="w-full h-48 object-cover transition-transform duration-300"
                    loading="lazy"
                />
                
                {/* 간단한 오버레이 */}
                <div className={`
                    absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100
                    ${cardType === 'workspace' 
                        ? 'bg-gradient-to-t from-orange-600/30 to-transparent' 
                        : 'bg-gradient-to-t from-blue-600/30 to-transparent'
                    }
                `} />
                
                {/* 카드 타입 배지 */}
                <div className={`
                    absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm
                    transition-all duration-300 transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                    ${cardType === 'workspace' 
                        ? 'bg-orange-500/80 text-white' 
                        : 'bg-blue-500/80 text-white'
                    }
                `}>
                    {cardType === 'workspace' ? '작업 중' : '완성작'}
                </div>
            </div>

            {/* 간소화된 정보 카드 */}
            <div className={`
                mt-4 p-4 rounded-md backdrop-blur-sm transition-all duration-300
                transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                ${cardType === 'workspace' 
                    ? 'bg-black/90 border border-orange-400/30' 
                    : 'bg-black/90 border border-blue-400/30'
                }
            `}>
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                    {title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>{timeAgo}</span>
                    <span className={`font-medium ${
                        cardType === 'workspace' ? 'text-orange-400' : 'text-blue-400'
                    }`}>
                        {cardType === 'workspace' ? '편집하기' : '보기'}
                    </span>
                </div>
                
                <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                    {description}
                </p>
                
                {/* 간단한 액션 버튼 */}
                <button className={`
                    w-full py-2 px-4 rounded-md text-sm font-medium transition-all duration-300
                    ${cardType === 'workspace' 
                        ? 'bg-orange-500/80 hover:bg-orange-500 text-white' 
                        : 'bg-blue-500/80 hover:bg-blue-500 text-white'
                    }
                `}>
                    {cardType === 'workspace' ? '계속 편집' : '작품 보기'}
                </button>
            </div>
        </div>
    )
}