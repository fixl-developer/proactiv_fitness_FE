'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AssessmentCard from './AssessmentCard'

interface Assessment {
    id: string
    title: string
    description: string
    image: string
    time: string
    duration: string
    location: string
    ageGroup: string
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    price: string
    isFree?: boolean
    availableSlots: number
    totalSlots: number
    category: string
}

interface HorizontalSectionProps {
    title: string
    subtitle?: string
    assessments: Assessment[]
    onBookAssessment: (assessmentId: string) => void
    showViewAll?: boolean
    onViewAll?: () => void
}

export default function HorizontalSection({
    title,
    subtitle,
    assessments,
    onBookAssessment,
    showViewAll = true,
    onViewAll
}: HorizontalSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(assessments.length > 3)
    const [cardWidth, setCardWidth] = useState(320)

    const gap = 24 // Gap between cards

    // Calculate card width to fill container perfectly
    const calculateCardWidth = () => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth
            const totalGaps = 2 * gap // 2 gaps between 3 cards
            const availableWidth = containerWidth - totalGaps
            const newCardWidth = Math.floor(availableWidth / 3)
            setCardWidth(newCardWidth)
        }
    }

    // Recalculate on mount and resize
    useEffect(() => {
        const timer = setTimeout(calculateCardWidth, 100) // Small delay to ensure container is rendered
        window.addEventListener('resize', calculateCardWidth)
        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', calculateCardWidth)
        }
    }, [])

    const scrollAmount = cardWidth + gap // Total scroll amount per click

    const checkScrollButtons = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const newScrollLeft = direction === 'left'
                ? scrollRef.current.scrollLeft - scrollAmount
                : scrollRef.current.scrollLeft + scrollAmount

            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            })

            // Check scroll buttons after animation
            setTimeout(checkScrollButtons, 300)
        }
    }

    return (
        <div className="mb-12">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
                    {subtitle && (
                        <p className="text-gray-600">{subtitle}</p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`p-2 rounded-full border transition-all duration-200 ${canScrollLeft
                                ? 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50'
                                : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`p-2 rounded-full border transition-all duration-200 ${canScrollRight
                                ? 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50'
                                : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* View All Button */}
                    {showViewAll && (
                        <button
                            onClick={onViewAll}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                        >
                            View all
                        </button>
                    )}
                </div>
            </div>

            {/* Horizontal Scrollable Cards Container */}
            <div className="relative w-full" ref={containerRef}>
                {/* Full width container that shows exactly 3 cards */}
                <div className="overflow-hidden w-full">
                    <div
                        ref={scrollRef}
                        onScroll={checkScrollButtons}
                        className="flex overflow-x-auto scrollbar-hide pb-4"
                        style={{
                            gap: `${gap}px`,
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitScrollbar: { display: 'none' }
                        }}
                    >
                        {assessments.map((assessment, index) => (
                            <motion.div
                                key={assessment.id}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex-shrink-0"
                                style={{
                                    width: `${cardWidth}px`,
                                    minWidth: `${cardWidth}px`
                                }}
                            >
                                <AssessmentCard
                                    {...assessment}
                                    onBook={onBookAssessment}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Gradient Overlays for scroll indication */}
                {canScrollLeft && (
                    <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10" />
                )}
                {canScrollRight && (
                    <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10" />
                )}
            </div>
        </div>
    )
}
