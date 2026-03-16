'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, User, ChevronDown, ChevronUp } from 'lucide-react'

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
    date: string // Add date field for scheduling
    staff: string // Add staff field
    dayOfWeek: string // Add day of week
}

interface ScheduleViewProps {
    assessments: Assessment[]
    onBookAssessment: (assessmentId: string) => void
}

// Mock schedule data with dates
const mockScheduleData: Assessment[] = [
    {
        id: 'sch-1',
        title: 'Full day camp - Week 3',
        description: 'Make your school holidays count! Join us for an action-packed week o...',
        image: '/images/hero/gymnastics-1.jpg',
        time: '6:30 am',
        duration: '12:30 pm',
        location: 'Progym Cyberport',
        ageGroup: '4 - 16 years',
        level: 'BEGINNER' as const,
        price: 'HKD 1100.00',
        isFree: false,
        availableSlots: 40,
        totalSlots: 50,
        category: 'Holiday Camps',
        date: '2025-12-29',
        staff: 'Will Murray',
        dayOfWeek: 'Sunday'
    },
    {
        id: 'sch-2',
        title: 'Full day camp - Week 3',
        description: 'Make your school holidays count! Join us for an action-packed week o...',
        image: '/images/hero/gymnastics-1.jpg',
        time: '6:30 am',
        duration: '12:30 pm',
        location: 'Progym Cyberport',
        ageGroup: '4 - 16 years',
        level: 'BEGINNER' as const,
        price: 'HKD 1100.00',
        isFree: false,
        availableSlots: 40,
        totalSlots: 50,
        category: 'Holiday Camps',
        date: '2025-12-30',
        staff: 'Will Murray',
        dayOfWeek: 'Monday'
    },
    {
        id: 'sch-3',
        title: 'FULL DAY CAMP - Week 2',
        description: 'Make your school holidays count! Join us for an action-packed week o...',
        image: '/images/hero/gymnastics-1.jpg',
        time: '6:30 am',
        duration: '12:30 pm',
        location: 'Progym Cyberport',
        ageGroup: '4 - 16 years',
        level: 'BEGINNER' as const,
        price: 'HKD 1100.00',
        isFree: false,
        availableSlots: 40,
        totalSlots: 50,
        category: 'Holiday Camps',
        date: '2025-12-24',
        staff: 'Will Murray',
        dayOfWeek: 'Tuesday'
    },
    {
        id: 'sch-4',
        title: 'CHINESE NEW YEAR (2026) - FULL DAY CAMP',
        description: 'Special Chinese New Year gymnastics camp with festive activities',
        image: '/images/hero/gymnastics-2.jpg',
        time: '6:30 am',
        duration: '12:30 pm',
        location: 'Progym Cyberport',
        ageGroup: '4 - 16 years',
        level: 'INTERMEDIATE' as const,
        price: 'HKD 1100.00',
        isFree: false,
        availableSlots: 40,
        totalSlots: 50,
        category: 'Holiday Camps',
        date: '2026-02-16',
        staff: 'Will Murray',
        dayOfWeek: 'Monday'
    },
    {
        id: 'sch-5',
        title: 'CHINESE NEW YEAR (2026) - FULL DAY CAMP',
        description: 'Special Chinese New Year gymnastics camp with festive activities',
        image: '/images/hero/gymnastics-2.jpg',
        time: '6:30 am',
        duration: '12:30 pm',
        location: 'Progym Cyberport',
        ageGroup: '4 - 16 years',
        level: 'INTERMEDIATE' as const,
        price: 'HKD 1100.00',
        isFree: false,
        availableSlots: 40,
        totalSlots: 50,
        category: 'Holiday Camps',
        date: '2026-02-17',
        staff: 'Will Murray',
        dayOfWeek: 'Tuesday'
    },
    {
        id: 'sch-6',
        title: 'Full day camp - Week 3',
        description: 'Make your school holidays count! Join us for an action-packed week o...',
        image: '/images/hero/gymnastics-3.jpg',
        time: '6:30 am',
        duration: '12:30 pm',
        location: 'Progym Cyberport',
        ageGroup: '4 - 16 years',
        level: 'BEGINNER' as const,
        price: 'HKD 1100.00',
        isFree: false,
        availableSlots: 40,
        totalSlots: 50,
        category: 'Holiday Camps',
        date: '2025-12-31',
        staff: 'Will Murray',
        dayOfWeek: 'Wednesday'
    },
    {
        id: 'sch-7',
        title: 'Full day camp - Week 3',
        description: 'Make your school holidays count! Join us for an action-packed week o...',
        image: '/images/hero/gymnastics-4.png',
        time: '6:30 am',
        duration: '12:30 pm',
        location: 'Progym Cyberport',
        ageGroup: '4 - 16 years',
        level: 'BEGINNER' as const,
        price: 'HKD 1100.00',
        isFree: false,
        availableSlots: 40,
        totalSlots: 50,
        category: 'Holiday Camps',
        date: '2026-01-02',
        staff: 'Will Murray',
        dayOfWeek: 'Friday'
    }
]

export default function ScheduleView({ onBookAssessment }: ScheduleViewProps) {
    const [filters, setFilters] = useState({
        categories: '',
        locations: '',
        time: '',
        date: '',
        trials: '',
        dayOfWeek: '',
        staff: '',
        age: ''
    })

    const [expandedFilters, setExpandedFilters] = useState({
        categories: false,
        locations: false,
        time: false,
        date: false,
        trials: false,
        dayOfWeek: false,
        staff: false,
        age: false
    })

    // Add state for nested category expansions
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

    // Filter options with nested structure for categories
    const filterOptions = {
        categories: {
            'Assessments': [
                'PROGYM Wanchai Assessment - 30 mins',
                'PROGYM Cyberport Assessment - 30 mins'
            ],
            'ProGym Cyberport Classes': [
                'GYMTOTS - 45 mins',
                'Beginner 1 (3 - 5 years) - 60 mins',
                'Beginner 2 (6+ years) - 60 mins',
                'Intermediate (6+ years) - 60 mins',
                'Advanced (8 + years) - 90 mins',
                'PRE - Competitive - 90 mins',
                'Competitive (Level 2 & 3) - 120 mins',
                'Competitive (level 4 +) - 150 mins',
                'Adults - 90 mins',
                'Adults - 60 mins',
                'Competitive (ALL LEVELS) - 120 mins',
                'IMS ECA - Beginner - 60 mins',
                'Kellett CP Beginner - 60 mins',
                'Kellett CP Competitive - 60 mins',
                'Progym Open House - 120 mins'
            ],
            'ProGym Cyberport Camps': [
                'Half Day Camp - 180 mins',
                'FULL DAY CAMP - 360 mins',
                'COMPETITIVE GYMNASTICS CAMP - 180 mins'
            ],
            'ProGym Wanchai Classes': [
                'PROGYM - OPEN DAY - 45 mins',
                'GYMTOTS - 45 mins',
                'Beginner 1 (3 - 5 years) - 60 mins',
                'Beginner 2 (6+ years) - 60 mins',
                'Intermediate (6+ years) - 60 mins',
                'Advanced (8+ years) - 90 mins',
                'PRE - Competitive - 90 mins',
                'Competitive (Level 2 & 3) - 120 mins',
                'Competitive (Level 4+) - 150 mins',
                'Adults - 90 mins',
                'Adults - 60 mins',
                'Beginner - 60 mins',
                'Beginner 6+ yrs - 60 mins',
                'Intermediate 6+ yrs - 60 mins',
                'Proactiv Gym class - Adults - 90 mins',
                'Proactiv Gym class - Adults - 60 mins',
                'IMS ECA - Beginner - 60 mins',
                'Proactiv Gym class - Competitive - 120 mins',
                'PRIVATE - 60 mins'
            ],
            'ProGym Wanchai Camps': [
                'HALF DAY CAMP - 180 mins',
                'Afternoon Camp - 180 mins',
                'Full Day Camp - 360 mins',
                'COMPETITIVE GYMNASTICS CAMP - 180 mins'
            ],
            'School Programs': [
                'Schools 60 mins - 60 mins',
                'Schools 2 Hours - 120 mins',
                'Schools 2.5 Hours - 150 mins',
                'CIS ECA - 60 mins',
                'WA ECA - 60 mins',
                'WA GYM team - 135 mins',
                'Malvern Gymnastics - 60 mins',
                'Malvern Gym team - 120 mins',
                'Malvern MS - 60 mins'
            ],
            'School Holiday Camps': [
                'Gymnastics Camps - 180 mins',
                'Multi-Activity camps - 360 mins',
                'Combo Camp - Gymnastics and Multi-Activity - 360 mins'
            ],
            'Montessori Pok Fu Lam': [
                'Montessori Toddler class - 60 mins'
            ],
            'Activity': [
                'Kids\' Night Out: Parents\' Day Off - 120 mins'
            ],
            // Empty categories without sub-items (these will be displayed without checkboxes)
            'ProGym Open Day - 15/F': 'empty',
            'ProActiv Gym Programs': 'empty',
            'ProActiv Gym Camps': 'empty',
            'Birthday Party Program': 'empty',
            'Proactiv Trial Week': 'empty',
            'Gymnastics': 'empty',
            'Multi-sports': 'empty',
            'Swimming': 'empty',
            'Basketball': 'empty',
            'Racket Sports': 'empty',
            'Volleyball': 'empty',
            'Nippers': 'empty'
        },
        locations: [
            'Kellett School (Kowloon Bay Campus)',
            'International Montessori School (Stanley Campus)',
            'Shrewsbury International School',
            'Canadian International School',
            'Progym Cyberport',
            'Progym Wanchai',
            'Montessori Pok Fu lam',
            'Wycombe Abbey',
            'Malvern College',
            'Chinese International school'
        ],
        time: [
            'Morning (Start - 12pm)',
            'Afternoon (12pm - 4pm)',
            'Evening (4pm - 6pm)',
            'Night (6pm - end)'
        ],
        date: [
            'Next 7 days',
            'Next 14 days'
        ],
        trials: [
            'Trials available'
        ],
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        staff: ['Will Murray', 'Sarah Johnson', 'Mike Chen', 'Emma Wilson'],
        age: ['2-3 years', '3-5 years', '4-8 years', '6-12 years', '8-16 years', '10-18 years', 'All Ages']
    }

    // Filter assessments based on selected filters
    const filteredAssessments = useMemo(() => {
        return mockScheduleData.filter(assessment => {
            // Day of week filter
            if (filters.dayOfWeek && assessment.dayOfWeek !== filters.dayOfWeek) return false

            // Staff filter
            if (filters.staff && assessment.staff !== filters.staff) return false

            // Main categories filter
            if (filters.categories && assessment.category !== filters.categories) return false

            // Location filter
            if (filters.locations && assessment.location !== filters.locations) return false

            // Time filter (you can implement time range logic here)
            if (filters.time) {
                // Example: check if assessment time falls within selected time range
                const assessmentHour = parseInt(assessment.time.split(':')[0])
                const isAM = assessment.time.includes('am')
                const hour24 = isAM ? (assessmentHour === 12 ? 0 : assessmentHour) : (assessmentHour === 12 ? 12 : assessmentHour + 12)

                if (filters.time === 'Morning (Start - 12pm)' && hour24 >= 12) return false
                if (filters.time === 'Afternoon (12pm - 4pm)' && (hour24 < 12 || hour24 >= 16)) return false
                if (filters.time === 'Evening (4pm - 6pm)' && (hour24 < 16 || hour24 >= 18)) return false
                if (filters.time === 'Night (6pm - end)' && hour24 < 18) return false
            }

            // Date filter (you can implement date range logic here)
            if (filters.date) {
                const assessmentDate = new Date(assessment.date)
                const today = new Date()
                const daysDiff = Math.ceil((assessmentDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

                if (filters.date === 'Next 7 days' && daysDiff > 7) return false
                if (filters.date === 'Next 14 days' && daysDiff > 14) return false
            }

            // Age filter
            if (filters.age && assessment.ageGroup !== filters.age) return false

            // Trials filter
            if (filters.trials && filters.trials === 'Trials available' && !assessment.isFree) return false

            return true
        })
    }, [filters])

    // Group assessments by date
    const groupedAssessments = useMemo(() => {
        const grouped = filteredAssessments.reduce((acc, assessment) => {
            const date = assessment.date
            if (!acc[date]) {
                acc[date] = []
            }
            acc[date].push(assessment)
            return acc
        }, {} as Record<string, Assessment[]>)

        // Sort dates
        const sortedDates = Object.keys(grouped).sort()
        const result: { date: string; assessments: Assessment[] }[] = []

        sortedDates.forEach(date => {
            result.push({
                date,
                assessments: grouped[date].sort((a, b) => a.time.localeCompare(b.time))
            })
        })

        return result
    }, [filteredAssessments])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
        return date.toLocaleDateString('en-US', options)
    }

    const formatDateShort = (dateString: string) => {
        const date = new Date(dateString)
        const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
        const day = date.getDate()
        const year = date.getFullYear()
        return { month, day, year }
    }

    const toggleFilter = (filterName: keyof typeof expandedFilters) => {
        setExpandedFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }))
    }

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }))
    }

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: prev[filterName] === value ? '' : value
        }))
    }

    return (
        <div className="flex gap-6 max-w-full">
            {/* Sidebar Filters */}
            <div className="w-80 flex-shrink-0">
                <div className="sticky top-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>

                    <div className="space-y-4">
                        {Object.entries(filterOptions).map(([filterKey, options]) => {
                            const getDisplayName = (key: string) => {
                                const displayNames: Record<string, string> = {
                                    categories: 'Categories',
                                    locations: 'Locations',
                                    time: 'Time',
                                    date: 'Date',
                                    trials: 'Trials',
                                    dayOfWeek: 'Day of week',
                                    staff: 'Staff',
                                    age: 'Age'
                                }
                                return displayNames[key] || key
                            }

                            return (
                                <div key={filterKey} className="border-b border-gray-100 pb-4">
                                    <button
                                        onClick={() => toggleFilter(filterKey as keyof typeof expandedFilters)}
                                        className="flex items-center justify-between w-full text-left py-2"
                                    >
                                        <span className="font-medium text-gray-700">
                                            {getDisplayName(filterKey)}
                                        </span>
                                        <span className="text-gray-400 text-lg">+</span>
                                    </button>

                                    {expandedFilters[filterKey as keyof typeof expandedFilters] && (
                                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                            {filterKey === 'categories' ? (
                                                // Special handling for nested categories
                                                Object.entries(options as Record<string, string[] | string>).map(([categoryName, subItems]) => (
                                                    <div key={categoryName}>
                                                        {Array.isArray(subItems) ? (
                                                            // Category with sub-items (no checkbox, has dropdown)
                                                            <div>
                                                                <button
                                                                    onClick={() => toggleCategory(categoryName)}
                                                                    className="flex items-center justify-between w-full text-left py-1 pl-2"
                                                                >
                                                                    <span className="text-sm text-gray-700">{categoryName}</span>
                                                                    <span className="text-gray-400 text-sm">
                                                                        {expandedCategories[categoryName] ? '−' : '+'}
                                                                    </span>
                                                                </button>
                                                                {expandedCategories[categoryName] && (
                                                                    <div className="mt-1 ml-4 space-y-1">
                                                                        {subItems.map((subItem) => (
                                                                            <label key={subItem} className="flex items-center">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={filters.categories === subItem}
                                                                                    onChange={() => handleFilterChange('categories', subItem)}
                                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                                                                                />
                                                                                <span className="ml-2 text-xs text-gray-600">{subItem}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : subItems === 'empty' ? (
                                                            // Empty category (no checkbox, but has + button for consistency)
                                                            <button
                                                                onClick={() => toggleCategory(categoryName)}
                                                                className="flex items-center justify-between w-full text-left py-1 pl-2"
                                                            >
                                                                <span className="text-sm text-gray-500">{categoryName}</span>
                                                                <span className="text-gray-400 text-sm">+</span>
                                                            </button>
                                                        ) : (
                                                            // Simple category (has checkbox, no dropdown) - for future use
                                                            <label className="flex items-center pl-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={filters.categories === categoryName}
                                                                    onChange={() => handleFilterChange('categories', categoryName)}
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-600">{categoryName}</span>
                                                            </label>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                // Regular filter options (non-categories)
                                                (options as string[]).map((option) => (
                                                    <label key={option} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={filters[filterKey as keyof typeof filters] === option}
                                                            onChange={() => handleFilterChange(filterKey as keyof typeof filters, option)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-600">{option}</span>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <div className="space-y-8">
                    {groupedAssessments.map(({ date, assessments }) => (
                        <div key={date}>
                            {/* Date Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {formatDate(date)}
                                </h2>
                            </div>

                            {/* Assessments for this date */}
                            <div className="space-y-6">
                                {assessments.map((assessment) => {
                                    const dateInfo = formatDateShort(assessment.date)
                                    return (
                                        <motion.div
                                            key={assessment.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex gap-6">
                                                {/* Date Badge */}
                                                <div className="flex-shrink-0">
                                                    <div className="bg-red-100 text-red-800 rounded-lg p-3 text-center min-w-[80px]">
                                                        <div className="text-xs font-semibold uppercase tracking-wide">
                                                            {dateInfo.month}
                                                        </div>
                                                        <div className="text-2xl font-bold">
                                                            {dateInfo.day}
                                                        </div>
                                                        <div className="text-xs text-red-600">
                                                            {dateInfo.year}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Time */}
                                                <div className="flex-shrink-0 pt-2">
                                                    <div className="text-lg font-semibold text-gray-900">
                                                        {assessment.time}
                                                    </div>
                                                </div>

                                                {/* Image */}
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={assessment.image}
                                                        alt={assessment.title}
                                                        className="w-24 h-24 rounded-lg object-cover"
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                                {assessment.title}
                                                            </h3>

                                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>{assessment.time} - {assessment.duration}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>{formatDate(assessment.date)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin className="w-4 h-4" />
                                                                    <span>{assessment.location}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                                                <div className="flex items-center gap-1">
                                                                    <User className="w-4 h-4" />
                                                                    <span>{assessment.staff}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Users className="w-4 h-4" />
                                                                    <span>{assessment.ageGroup}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="text-sm text-gray-500">Drop-in for</div>
                                                                    <div className="text-lg font-bold text-gray-900">
                                                                        {assessment.price} • Packages from HKD 5,000.00
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Availability and Book Button */}
                                                        <div className="flex flex-col items-end gap-3">
                                                            <div className="text-right">
                                                                <div className="text-sm font-medium text-green-600">
                                                                    {assessment.availableSlots} seats available
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => onBookAssessment(assessment.id)}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                                                            >
                                                                More Info
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {groupedAssessments.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Calendar className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes found</h3>
                        <p className="text-gray-600">Try adjusting your filters to see more results</p>
                    </div>
                )}
            </div>
        </div>
    )
}
