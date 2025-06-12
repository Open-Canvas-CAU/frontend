import React from 'react'

export default function SortDropdown({ options, selected, onSelect }) {
    return (
        <div className="flex items-center gap-3 mb-10">
            <span className="text-xl font-medium text-white">{selected}</span>
            <select
                value={selected}
                onChange={e => onSelect(e.target.value)}
                className="bg-black px-2 py-1 rounded text-base"
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    )
}
