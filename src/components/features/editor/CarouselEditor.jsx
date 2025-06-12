// src/components/editor/CarouselEditor.jsx
import React, { useState, useEffect } from 'react'
import EditorSection from './EditorSection'

export default function CarouselEditor({
                                           variants,
                                           readOnly,
                                           onChange,
                                       }) {
    // Ensure we always have an array of exactly 2 slides
    const slides = Array.isArray(variants)
        ? variants.slice(0, 2)
        : [variants, variants]

    const [current, setCurrent] = useState(0)

    // wrap around
    const prev = () => setCurrent((current + slides.length - 1) % slides.length)
    const next = () => setCurrent((current + 1) % slides.length)

    // if variants prop changes length/order, clamp current
    useEffect(() => {
        if (current >= slides.length) setCurrent(0)
    }, [slides.length, current])

    return (
        <div className="relative w-full">
            {/* Slide container */}
            <div className="overflow-hidden rounded-lg border border-white-200">
                <EditorSection
                    content={slides[current]}
                    onChange={(html) => onChange(current, html)}
                    readOnly={readOnly}
                    className="min-h-[300px] p-4 prose"
                />
            </div>

            {/* Prev button */}
            <button
                onClick={prev}
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black p-2 rounded-full shadow hover:bg-black-100"
                aria-label="Previous slide"
            >
                ‹
            </button>

            {/* Next button */}
            <button
                onClick={next}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black p-2 rounded-full shadow hover:bg-black-100"
                aria-label="Next slide"
            >
                ›
            </button>
        </div>
    )
}
