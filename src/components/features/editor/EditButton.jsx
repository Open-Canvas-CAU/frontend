// src/components/editor/EditButton.jsx
import React from 'react'
export default function EditButton({ onClick, children }) {
    return (
        <button
            onClick={onClick}
            className="w-52 h-14 p-3 bg-blue-300 rounded-full flex items-center gap-2"
        >
            {/* <img src={iconUrl} alt="edit icon" className="w-6 h-6" /> */}
            <span className="text-zinc-800 text-xl font-semibold">
        {children}
      </span>
        </button>
    )
}
