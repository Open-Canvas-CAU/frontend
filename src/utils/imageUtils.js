export const generateDefaultCoverImage = (title) => {
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect x="20" y="20" width="360" height="260" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
          📝 ${title.length > 20 ? title.substring(0, 20) + '...' : title}
        </text>
        <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
          작업 중인 캔버스
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };
  
  export const getDefaultCompletedImage = () => {
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f9ff"/>
        <rect x="20" y="20" width="360" height="260" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="2"/>
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="16" fill="#0284c7">
          🎨 완성된 작품
        </text>
        <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="12" fill="#0369a1">
          Live Canvas
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };
  
  // 2. NewCanvasPage.jsx 수정
  import { generateDefaultCoverImage } from '@/utils/imageUtils';
  
  const handleCreate = async () => {
      // ... 기존 코드 ...
      
      try {
          const coverDto = {
              title,
              coverImageUrl: generateDefaultCoverImage(title), // ✅ 기본 이미지 사용
              time: new Date().toISOString()
          }
          
          // ... 나머지 코드 동일 ...
      } catch (error) {
          // ... 에러 처리 ...
      }
  }
  
  // 3. CanvasCard.jsx 수정 - 이미지 로딩 실패 시 fallback
  import React, { useState } from 'react';
  import { generateDefaultCoverImage, getDefaultCompletedImage } from '@/utils/imageUtils';
  
  export default function CanvasCard({
      title,
      timeAgo,
      description,
      imgSrc,
      onClick,
  }) {
      const [imageError, setImageError] = useState(false);
      const [imageSrc, setImageSrc] = useState(imgSrc);
  
      const handleImageError = () => {
          setImageError(true);
          // description에 "작업 중"이 포함되어 있으면 작업중 이미지, 아니면 완성작 이미지
          const isWorking = description?.includes('작업 중');
          const fallbackImage = isWorking 
              ? generateDefaultCoverImage(title)
              : getDefaultCompletedImage();
          setImageSrc(fallbackImage);
      };
  
      return (
          <div className="w-full group">
              <div 
                  className="w-full cursor-pointer"
                  onClick={onClick}
              >
                  <img 
                      src={imageSrc}
                      alt={title}
                      className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={handleImageError}
                  />
              </div>
  
              <div className="mt-3 ml-auto mr-0 bg-white p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                   style={{ width: 'calc(100% - 2rem)' }}>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{timeAgo}</span>
                      <span className="text-gray-500">작가</span>
                  </div>
              </div>
          </div>
      );
  }