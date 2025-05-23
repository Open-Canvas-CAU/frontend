// src/components/editor/ThemeInput.jsx
import React from 'react'
export default function ThemeInput({ value, onChange }) {
    return (
        <input
            type="text"
            placeholder="캔버스 주제를 입력하세요"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="p-2 text-3xl font-semibold text-black border-b border-gray-300 focus:outline-none"
        />
    )
}
