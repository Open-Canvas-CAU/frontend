import React from 'react'

export default function SearchBar({ value, onChange, onSearch }) {
    return (
        <div className="w-full max-w-[1609px] bg-zinc-100 p-4 rounded-lg mb-10 flex items-center">
            <input
                type="text"
                placeholder="검색어를 입력해주세요"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="flex-1 bg-transparent border-none placeholder-gray-500 text-lg text-zinc-900 focus:outline-none"
            />
            <button
                onClick={onSearch}
                className="ml-4 px-4 py-3 bg-sky-300 rounded-xl text-lg font-semibold text-gray-800"
            >
                검색하기
            </button>
        </div>
    )
}
