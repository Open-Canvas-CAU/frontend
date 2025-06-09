// src/components/editor/SectionPlaceholder.jsx
import React from 'react'
export default function SectionPlaceholder({ className }) {
    return (
        <div
            className={`absolute bg-red opacity-50 rounded-2xl ${className}`}
        />
    )
}
