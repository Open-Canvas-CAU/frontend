import React, { useRef, useEffect } from 'react'

export default function CanvasCard({
    title,
    timeAgo,
    description,
    imgSrc,
    onClick,
    cardType = 'gallery' // 'gallery' 또는 'workspace'
}) {
    const cardRef = useRef(null)
    const imageRef = useRef(null)

    // 마우스 추적 3D 효과 (작업실 카드만)
    useEffect(() => {
        if (cardType !== 'workspace' || !cardRef.current) return

        const card = cardRef.current
        
        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            
            const centerX = rect.width / 2
            const centerY = rect.height / 2
            
            const rotateX = (y - centerY) / 10
            const rotateY = (centerX - x) / 10
            
            card.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                translateZ(10px)
            `
        }
        
        const handleMouseLeave = () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
        }
        
        card.addEventListener('mousemove', handleMouseMove)
        card.addEventListener('mouseleave', handleMouseLeave)
        
        return () => {
            card.removeEventListener('mousemove', handleMouseMove)
            card.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [cardType])

    // 카드 타입별 스타일 클래스
    const getCardClasses = () => {
        const baseClasses = `
            w-full group cursor-pointer transform-gpu will-change-transform
            transition-all duration-500 ease-out
        `
        
        if (cardType === 'workspace') {
            return `${baseClasses} workspace-card perspective-1000`
        } else {
            return `${baseClasses} gallery-card hover-lift`
        }
    }

    const getImageClasses = () => {
        const baseClasses = `
            w-full h-auto object-contain transition-all duration-500
            rounded-lg overflow-hidden
        `
        
        if (cardType === 'workspace') {
            return `${baseClasses} workspace-shadow group-hover:shadow-workspace-hover transform-style-preserve-3d`
        } else {
            return `${baseClasses} group-hover:scale-105 shadow-lg group-hover:shadow-gallery-hover`
        }
    }

    const getInfoCardClasses = () => {
        const baseClasses = `
            mt-3 ml-auto mr-0 bg-black p-4 rounded-lg shadow-md backdrop-blur-sm
            transition-all duration-500 transform
        `
        
        if (cardType === 'workspace') {
            return `${baseClasses} 
                opacity-0 group-hover:opacity-100 
                translate-y-4 group-hover:translate-y-0
                bg-black/95 border border-orange-200/50
                group-hover:shadow-xl group-hover:scale-105
            `
        } else {
            return `${baseClasses} 
                opacity-0 group-hover:opacity-100 
                translate-y-2 group-hover:translate-y-0
                bg-black/95 border border-red-200/50
                group-hover:shadow-lg
            `
        }
    }

    return (
        <div 
            ref={cardRef}
            className={getCardClasses()}
            onClick={onClick}
            style={{ width: 'calc(100% - 2rem)' }}
        >
            {/* 이미지 카드 */}
            <div className="relative overflow-hidden">
                <img 
                    ref={imageRef}
                    src={imgSrc} 
                    alt={title}
                    className={getImageClasses()}
                    loading="lazy"
                />
                
                {/* 오버레이 효과 */}
                <div className={`
                    absolute inset-0 rounded-lg
                    transition-all duration-500
                    ${cardType === 'workspace' 
                        ? 'bg-gradient-to-t from-red-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100' 
                        : 'bg-gradient-to-t from-red-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100'
                    }
                `}></div>
                
                {/* 카드 타입 배지 */}
                <div className={`
                    absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium
                    backdrop-blur-sm transition-all duration-300
                    ${cardType === 'workspace' 
                        ? 'bg-orange-500/80 text-white opacity-0 group-hover:opacity-100' 
                        : 'bg-red-500/80 text-white opacity-0 group-hover:opacity-100'
                    }
                `}>
                    {cardType === 'workspace' ? '작업 중' : '완성작'}
                </div>
            </div>

            {/* 호버 시 나타나는 정보 카드 */}
            <div className={getInfoCardClasses()}>
                <div className="space-y-2">
                    <h3 className={`
                        text-lg font-semibold text-white-900 
                        transition-colors duration-300
                        ${cardType === 'workspace' ? 'group-hover:text-orange-600' : 'group-hover:text-red-600'}
                    `}>
                        {title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-white-600 flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{timeAgo}</span>
                        </span>
                        
                        <span className={`
                            font-medium transition-colors duration-300
                            ${cardType === 'workspace' ? 'text-orange-500' : 'text-red-500'}
                        `}>
                            {cardType === 'workspace' ? '편집하기' : '보기'}
                        </span>
                    </div>
                    
                    <p className="text-sm text-white-500">{description}</p>
                    
                    {/* 진행률 바 (작업실용) */}
                    {cardType === 'workspace' && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-white-500 mb-1">
                                <span>진행률</span>
                                <span>75%</span>
                            </div>
                            <div className="w-full bg-black-200 rounded-full h-1.5">
                                <div 
                                    className="bg-gradient-to-r from-red-400 to-white-400 h-1.5 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: '75%' }}
                                ></div>
                            </div>
                        </div>
                    )}
                    
                    {/* 액션 버튼 */}
                    <div className="mt-3 pt-2 border-t border-white-200">
                        <button className={`
                            w-full py-2 px-4 rounded-md text-sm font-medium
                            transition-all duration-300 transform hover:scale-105
                            ${cardType === 'workspace' 
                                ? 'bg-gradient-to-r from-red-400 to-white-400 hover:from-red-500 hover:to-red-500 text-white shadow-md hover:shadow-lg' 
                                : 'bg-gradient-to-r from-red-400 to-white-400 hover:from-red-500 hover:to-purple-500 text-white shadow-md hover:shadow-lg'
                            }
                        `}>
                            {cardType === 'workspace' ? '계속 편집하기' : '작품 보기'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}