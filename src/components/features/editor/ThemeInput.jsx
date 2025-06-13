// src/components/editor/ThemeInput.jsx
import React, { useRef, useLayoutEffect } from 'react'

export default function ThemeInput({ value, onChange }) {
  const ta = useRef(null)

  useLayoutEffect(() => {
    if (!ta.current) return
    ta.current.style.height = 'auto'
    ta.current.style.height = ta.current.scrollHeight + 'px'
  }, [value])

  return (
    <textarea
      ref={ta}
      rows={1}                            // 최소 1줄
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="캔버스 주제를 입력하세요"
      className={
        `w-full min-w-0 resize-none overflow-hidden
         p-2 text-3xl font-semibold text-black
         border-b border-white-300 focus:outline-none
         whitespace-pre-wrap break-words`
      }
    />
  )
}
