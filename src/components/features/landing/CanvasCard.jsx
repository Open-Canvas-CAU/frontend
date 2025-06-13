// src/components/features/landing/CanvasCard.jsx - 간소화된 버전
import React from 'react'
import { RoomType } from '@/types'

export default function CanvasCard({
    title,
    timeAgo,
    description,
    imgSrc,
    onClick,
    cardType = 'gallery',
    roomType = RoomType.AVAILABLE,
    stats
}) {
    const getStatusStyle = (type, roomType) => {
        switch (roomType) {
            case RoomType.EDITING:
                return 'bg-orange-500/20 text-orange-400 border border-orange-400/30';
            case RoomType.AVAILABLE:
                return 'bg-green-500/20 text-green-400 border border-green-400/30';
            case RoomType.COMPLETE:
                return 'bg-red-500/20 text-red-400 border border-red-400/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border border-gray-400/30';
        }
    }

    const getStatusText = (type, roomType) => {
        switch (roomType) {
            case RoomType.EDITING:
                return '편집 중';
            case RoomType.AVAILABLE:
                return '편집 가능';
            case RoomType.COMPLETE:
                return '완성작';
            default:
                return '알 수 없음';
        }
    }

    const getButtonText = (type, roomType) => {
        switch (roomType) {
            case RoomType.EDITING:
                return '편집 중';
            case RoomType.AVAILABLE:
                return '편집하기';
            case RoomType.COMPLETE:
                return '작품 보기';
            default:
                return '자세히 보기';
        }
    }

    const getButtonStyle = (type, roomType) => {
        switch (roomType) {
            case RoomType.EDITING:
                return 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-400/30';
            case RoomType.AVAILABLE:
                return 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-400/30';
            case RoomType.COMPLETE:
                return 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-400/30';
            default:
                return 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-400/30';
        }
    }

    const getCardHoverStyle = (type, roomType) => {
        switch (roomType) {
            case RoomType.EDITING:
                return 'group-hover:ring-2 group-hover:ring-orange-400/50';
            case RoomType.AVAILABLE:
                return 'group-hover:ring-2 group-hover:ring-green-400/50';
            case RoomType.COMPLETE:
                return 'group-hover:ring-2 group-hover:ring-red-400/50';
            default:
                return 'group-hover:ring-2 group-hover:ring-gray-400/50';
        }
    }

    // 기본 이미지 URL 배열
    const defaultImages = [
        'https://source.unsplash.com/random/800x450/?abstract,art',
        'https://source.unsplash.com/random/800x450/?painting,art',
        'https://source.unsplash.com/random/800x450/?drawing,art',
        'https://source.unsplash.com/random/800x450/?sketch,art',
        'https://source.unsplash.com/random/800x450/?digital,art'
    ];

    // 랜덤 기본 이미지 선택
    const getRandomDefaultImage = () => {
        const randomIndex = Math.floor(Math.random() * defaultImages.length);
        return defaultImages[randomIndex];
    };

    // 이미지 URL이 유효한지 확인
    const isValidImageUrl = (url) => {
        return url && url.startsWith('http') && !url.includes('undefined');
    };

    // 실제 사용할 이미지 URL 결정
    const displayImageUrl = isValidImageUrl(imgSrc) ? imgSrc : getRandomDefaultImage();

    return (
        <div 
            className="canvas-card w-full max-w-[400px] mx-auto group"
            onClick={onClick}
        >
            {/* 메인 이미지 카드 */}
            <div className={`
                relative overflow-hidden cursor-pointer rounded-xl border border-white transition-all duration-300 transform
                group-hover:scale-[1.02] 
                ${getCardHoverStyle(cardType, roomType)}
            `}>
                {/* 16:9 비율 컨테이너 */}
                <div className="relative w-full bg-black/50" style={{ paddingTop: '56.25%' }}>
                    <img 
                        src={displayImageUrl} 
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getRandomDefaultImage();
                        }}
                    />
                    
                    {/* 이미지가 없는 경우 표시할 오버레이 */}
                    {!isValidImageUrl(imgSrc) && (
                        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/30 flex items-center justify-center">
                            <span className="text-white/80 text-sm font-medium">기본 이미지</span>
                        </div>
                    )}
                    
                    {/* 간단한 오버레이 */}

                    
                    {/* 카드 타입 배지 */}
                    <div className={`
                        absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm
                        transition-all duration-300 transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                        ${getStatusStyle(cardType, roomType)}
                    `}>
                        {getStatusText(cardType, roomType)}
                    </div>
                </div>
            </div>

            {/* 정보 카드 */}
            <div className={`
                mt-4 p-5 rounded-xl backdrop-blur-sm transition-all duration-300
                transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                bg-black/90 border ${getStatusStyle(cardType, roomType)}
            `}>
                <h3 className="text-xl font-semibold text-white mb-3 line-clamp-1">
                    {title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <span>{timeAgo}</span>
                    {stats && (
                        <div className="flex items-center space-x-4">
                            {stats.views !== undefined && (
                                <span className="flex items-center space-x-1">
                                    <span>👁️</span>
                                    <span>{stats.views}</span>
                                </span>
                            )}
                            {stats.likes !== undefined && (
                                <span className="flex items-center space-x-1">
                                    <span>❤️</span>
                                    <span>{stats.likes}</span>
                                </span>
                            )}
                        </div>
                    )}
                </div>
                
                <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                    {description}
                </p>
                
                {/* 액션 버튼 */}
                <button 
                    className={`
                        w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300
                        ${getButtonStyle(cardType, roomType)}
                    `}
                    disabled={roomType === RoomType.EDITING}
                    onClick={(e) => {
                        if (roomType === RoomType.EDITING) {
                            e.stopPropagation();
                            return;
                        }
                        onClick(e);
                    }}
                >
                    {getButtonText(cardType, roomType)}
                </button>
            </div>
        </div>
    )
}