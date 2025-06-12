// src/components/common/MouseFollower.jsx
import React, { useEffect, useState } from 'react'

export default function MouseFollower() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isHoveringCard, setIsHoveringCard] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    // 카드 호버 감지를 위한 이벤트 위임
    const handleMouseOver = (e) => {
      if (e.target.closest('.canvas-card')) {
        setIsHoveringCard(true)
      }
    }

    const handleMouseOut = (e) => {
      if (e.target.closest('.canvas-card') && !e.relatedTarget?.closest('.canvas-card')) {
        setIsHoveringCard(false)
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed pointer-events-none z-50 transition-all duration-500 ${
        isHoveringCard ? 'opacity-30 scale-150' : 'opacity-15 scale-100'
      }`}
      style={{
        left: mousePos.x - 150,
        top: mousePos.y - 150,
        width: '300px',
        height: '300px',
      }}
    >
      <div
        className="w-full h-full rounded-full transition-all duration-500"
        style={{
          background: isHoveringCard 
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.2) 50%, transparent 100%)'
            : 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.1) 50%, transparent 100%)',
          filter: isHoveringCard ? 'blur(80px)' : 'blur(64px)'
        }}
      />
    </div>
  )
}