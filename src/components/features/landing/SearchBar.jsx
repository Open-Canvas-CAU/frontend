import React, { useState, useEffect, useRef } from 'react'

export default function SearchBar({ value, onChange, onSearch, className = '' }) {
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef(null)

    // 엔터 키 처리
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            onSearch()
        }
    }

    // 검색어가 변경될 때마다 자동 검색 (디바운스 적용)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (value.trim()) {
                onSearch()
            }
        }, 500) // 500ms 디바운스

        return () => clearTimeout(timer)
    }, [value, onSearch])

    return (
        <div className={`relative ${className}`}>
            <div className={`w-full bg-white p-4 rounded-lg shadow-sm transition-all duration-200
                ${isFocused ? 'ring-2 ring-teal-500' : 'hover:shadow-md'}`}>
                <div className="flex items-center">
                    {/* 검색 아이콘 */}
                    <svg 
                        className="w-5 h-5 text-gray-400 mr-3" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                        />
                    </svg>

                    {/* 검색 입력 필드 */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="검색어를 입력해주세요"
                        className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-400 
                            focus:outline-none text-base"
                    />

                    {/* 검색어가 있을 때만 지우기 버튼 표시 */}
                    {value && (
                        <button
                            onClick={() => {
                                onChange('')
                                inputRef.current?.focus()
                            }}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M6 18L18 6M6 6l12 12" 
                                />
                            </svg>
                        </button>
                    )}

                    {/* 검색 버튼 */}
                    <button
                        onClick={onSearch}
                        className="ml-4 px-4 py-2 bg-teal-500 text-white rounded-lg 
                            hover:bg-teal-600 transition-colors font-medium"
                    >
                        검색
                    </button>
                </div>
            </div>

            {/* 검색어 힌트 */}
            {isFocused && !value && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg p-2 text-sm text-gray-500">
                    검색어를 입력하고 엔터를 누르거나 검색 버튼을 클릭하세요
                </div>
            )}
        </div>
    )
}
