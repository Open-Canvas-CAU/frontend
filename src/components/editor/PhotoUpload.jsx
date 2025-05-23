// src/components/editor/PhotoUpload.jsx
import React, { useState } from 'react'
export default function PhotoUpload({ onFileSelect }) {
    const [preview, setPreview] = useState(null)
    const handleChange = e => {
        const file = e.target.files[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreview(url)
            onFileSelect(file)
        }
    }
    return (
        <div className="absolute left-[236px] top-[344px] w-[1611px] flex gap-6">
            <div className="w-1/3">
                <input type="file" accept="image/*" onChange={handleChange} />
                {preview && <img src={preview} alt="preview" className="rounded-2xl mt-2 w-full h-60 object-cover" />}
            </div>
            <div className="flex-1">
                {/* 다음에 EditorSection 삽입 */}
            </div>
        </div>
    )
}
