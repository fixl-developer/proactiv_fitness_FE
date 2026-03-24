'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Grid3X3, List, Calendar, Filter, Search } from 'lucide-react'
import HorizontalSection from './HorizontalSection'
import ScheduleView from './ScheduleView'

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

// Mock data organized by categories - replace with actual API data
const mockAssessmentsByCategory = {
    'Assessments': [
        {
            id: '1',
            title: 'PROGYM Cyberport Assessment',
            description: 'Set Your Child Up for Success from Day One',
            image: '/images/hero/gymnastics-1.jpg',
            time: '10:30 am',
            duration: '1:00 pm',
            location: 'Mo, We, Fr',
            ageGroup: '3 - 16 years',
            level: 'BEGINNER' as const,
            price: 'FREE',
            isFree: true,
            availableSlots: 8,
            totalSlots: 10,
            category: 'Assessment'
        },
        {
            id: '2',
            title: 'PROGYM Cyberport Assessment',
            description: 'Set Your Child Up for Success from Day One',
            image: '/images/hero/gymnastics-2.jpg',
            time: '1:00 pm',
            duration: '2:00 pm',
            location: 'Mo, Tu, Th',
            ageGroup: '3 - 5 years',
            level: 'BEGINNER' as const,
            price: 'FREE',
            isFree: true,
            availableSlots: 5,
            totalSlots: 8,
            category: 'Assessment'
        },
        {
            id: '3',
            title: 'PROGYM Wanchai Assessment',
            description: 'Set Your Child Up for Success from Day One',
            image: '/images/hero/gymnastics-3.jpg',
            time: '2:30 pm',
            duration: '3:00 pm',
            location: 'Mo, Tu, We, Th, Fr',
            ageGroup: '6 - 12 years',
            level: 'INTERMEDIATE' as const,
            price: 'FREE',
            isFree: true,
            availableSlots: 3,
            totalSlots: 6,
            category: 'Assessment'
        },
        {
            id: '4',
            title: 'PROGYM Advanced Assessment',
            description: 'Advanced skill evaluation for experienced gymnasts',
            image: '/images/hero/gymnastics-4.png',
            time: '4:00 pm',
            duration: '5:00 pm',
            location: 'We, Fr',
            ageGroup: '8 - 16 years',
            level: 'ADVANCED' as const,
            price: 'FREE',
            isFree: true,
            availableSlots: 2,
            totalSlots: 4,
            category: 'Assessment'
        },
        {
            id: '5',
            title: 'Team Selection Assessment',
            description: 'Assessment for competitive team selection',
            image: '/images/hero/gymnastics-1.jpg',
            time: '5:30 pm',
            duration: '6:30 pm',
            location: 'Sa, Su',
            ageGroup: '10 - 18 years',
            level: 'ADVANCED' as const,
            price: 'FREE',
            isFree: true,
            availableSlots: 1,
            totalSlots: 3,
            category: 'Assessment'
        },
        {
            id: '6',
            title: 'Private Assessment Session',
            description: 'One-on-one assessment with expert coach',
            image: '/images/hero/gymnastics-2.jpg',
            time: '7:00 pm',
            duration: '8:00 pm',
            location: 'By Appointment',
            ageGroup: 'All Ages',
            level: 'BEGINNER' as const,
            price: 'FREE',
            isFree: true,
            availableSlots: 4,
            totalSlots: 5,
            category: 'Assessment'
        }
    ],
    'ProGym Cyberport Classes': [
        {
            id: '7',
            title: 'Progym Cyberport Classes - GYMTOTS',
            description: 'Our foundational gymnastics program',
            image: '/images/hero/gymnastics-4.png',
            time: '6:30 am',
            duration: '7:15 am',
            location: 'Mo',
            ageGroup: '2 - 3 years',
            level: 'BEGINNER' as const,
            price: 'HKD 275.00',
            isFree: false,
            availableSlots: 4,
            totalSlots: 8,
            category: 'Cyberport Classes'
        },
        {
            id: '8',
            title: 'Progym Cyberport Classes - Beginner',
            description: 'Perfect for beginners to learn fundamentals',
            image: '/images/hero/gymnastics-1.jpg',
            time: '1:00 pm',
            duration: '2:00 pm',
            location: 'Multiple Repeats',
            ageGroup: '3 - 5 years',
            level: 'BEGINNER' as const,
            price: 'HKD 350.00',
            isFree: false,
            availableSlots: 6,
            totalSlots: 10,
            category: 'Cyberport Classes'
        },
        {
            id: '9',
            title: 'Monday - Intermediate (6+ years)',
            description: 'Advanced skills for experienced gymnasts',
            image: '/images/hero/gymnastics-2.jpg',
            time: '1:30 pm',
            duration: '2:30 pm',
            location: 'Mo',
            ageGroup: '6 - 12 years',
            level: 'INTERMEDIATE' as const,
            price: 'HKD 350.00',
            isFree: false,
            availableSlots: 2,
            totalSlots: 8,
            category: 'Cyberport Classes'
        },
        {
            id: '10',
            title: 'Tuesday - Advanced Skills',
            description: 'High-level gymnastics training',
            image: '/images/hero/gymnastics-3.jpg',
            time: '3:00 pm',
            duration: '4:00 pm',
            location: 'Tu',
            ageGroup: '8 - 16 years',
            level: 'ADVANCED' as const,
            price: 'HKD 400.00',
            isFree: false,
            availableSlots: 3,
            totalSlots: 6,
            category: 'Cyberport Classes'
        },
        {
            id: '11',
            title: 'Wednesday - Competitive Prep',
            description: 'Preparation for competitive gymnastics',
            image: '/images/hero/gymnastics-4.png',
            time: '4:30 pm',
            duration: '6:00 pm',
            location: 'We',
            ageGroup: '10 - 18 years',
            level: 'ADVANCED' as const,
            price: 'HKD 500.00',
            isFree: false,
            availableSlots: 1,
            totalSlots: 4,
            category: 'Cyberport Classes'
        },
        {
            id: '12',
            title: 'Friday - Family Class',
            description: 'Fun gymnastics for the whole family',
            image: '/images/hero/gymnastics-1.jpg',
            time: '6:00 pm',
            duration: '7:00 pm',
            location: 'Fr',
            ageGroup: 'All Ages',
            level: 'BEGINNER' as const,
            price: 'HKD 300.00',
            isFree: false,
            availableSlots: 8,
            totalSlots: 12,
            category: 'Cyberport Classes'
        }
    ],
    'ProGym Wanchai Classes': [
        {
            id: '13',
            title: 'Thursday - IMS ECA - Beginner',
            description: 'Our beginner gymnastics program',
            image: '/images/hero/gymnastics-3.jpg',
            time: '1:00 pm',
            duration: '2:00 pm',
            location: 'Multiple Repeats',
            ageGroup: '4 - 8 years',
            level: 'BEGINNER' as const,
            price: 'HKD 4,500.00',
            isFree: false,
            availableSlots: 5,
            totalSlots: 12,
            category: 'Wanchai Classes'
        },
        {
            id: '14',
            title: 'Monday - Beginner 1 (3 - 5 years)',
            description: 'Perfect introduction to gymnastics',
            image: '/images/hero/gymnastics-4.png',
            time: '1:00 pm',
            duration: '2:00 pm',
            location: 'Mo',
            ageGroup: '3 - 5 years',
            level: 'BEGINNER' as const,
            price: 'HKD 350.00',
            isFree: false,
            availableSlots: 8,
            totalSlots: 10,
            category: 'Wanchai Classes'
        },
        {
            id: '15',
            title: 'Monday - Intermediate (6 years +)',
            description: 'The intermediate gymnastics program',
            image: '/images/hero/gymnastics-1.jpg',
            time: '1:30 pm',
            duration: '2:30 pm',
            location: 'Mo',
            ageGroup: '6+ years',
            level: 'INTERMEDIATE' as const,
            price: 'HKD 350.00',
            isFree: false,
            availableSlots: 3,
            totalSlots: 8,
            category: 'Wanchai Classes'
        },
        {
            id: '16',
            title: 'Tuesday - Artistic Gymnastics',
            description: 'Focus on artistic gymnastics elements',
            image: '/images/hero/gymnastics-2.jpg',
            time: '2:00 pm',
            duration: '3:30 pm',
            location: 'Tu',
            ageGroup: '7 - 14 years',
            level: 'INTERMEDIATE' as const,
            price: 'HKD 380.00',
            isFree: false,
            availableSlots: 4,
            totalSlots: 8,
            category: 'Wanchai Classes'
        },
        {
            id: '17',
            title: 'Wednesday - Rhythmic Gymnastics',
            description: 'Beautiful rhythmic gymnastics training',
            image: '/images/hero/gymnastics-3.jpg',
            time: '3:00 pm',
            duration: '4:30 pm',
            location: 'We',
            ageGroup: '5 - 16 years',
            level: 'INTERMEDIATE' as const,
            price: 'HKD 420.00',
            isFree: false,
            availableSlots: 6,
            totalSlots: 10,
            category: 'Wanchai Classes'
        },
        {
            id: '18',
            title: 'Saturday - Open Gym',
            description: 'Free practice time with supervision',
            image: '/images/hero/gymnastics-4.png',
            time: '10:00 am',
            duration: '12:00 pm',
            location: 'Sa',
            ageGroup: 'All Levels',
            level: 'BEGINNER' as const,
            price: 'HKD 200.00',
            isFree: false,
            availableSlots: 15,
            totalSlots: 20,
            category: 'Wanchai Classes'
        }
    ],
    'ProGym Cyberport Camps': [
        {
            id: '19',
            title: 'Summer Gymnastics Camp - Cyberport',
            description: 'Intensive summer gymnastics training camp',
            image: '/images/hero/gymnastics-1.jpg',
            time: '9:00 am',
            duration: '3:00 pm',
            location: 'Cyberport',
            ageGroup: '6 - 14 years',
            level: 'INTERMEDIATE' as const,
            price: 'HKD 2,800.00',
            isFree: false,
            availableSlots: 12,
            totalSlots: 20,
            category: 'Cyberport Camps'
        },
        {
            id: '20',
            title: 'Winter Break Camp - Cyberport',
            description: 'Fun winter gymnastics activities and training',
            image: '/images/hero/gymnastics-2.jpg',
            time: '10:00 am',
            duration: '4:00 pm',
            location: 'Cyberport',
            ageGroup: '4 - 12 years',
            level: 'BEGINNER' as const,
            price: 'HKD 2,500.00',
            isFree: false,
            availableSlots: 8,
            totalSlots: 15,
            category: 'Cyberport Camps'
        },
        {
            id: '21',
            title: 'Easter Holiday Camp - Cyberport',
            description: 'Easter themed gymnastics camp with special activities',
            image: '/images/hero/gymnastics-3.jpg',
            time: '9:30 am',
            duration: '2:30 pm',
            location: 'Cyberport',
            ageGroup: '3 - 10 years',
            level: 'BEGINNER' as const,
            price: 'HKD 2,200.00',
            isFree: false,
            availableSlots: 10,
            totalSlots: 18,
            category: 'Cyberport Camps'
        },
        {
            id: '22',
            title: 'Advanced Skills Camp - Cyberport',
            description: 'Intensive training for advanced gymnasts',
            image: '/images/hero/gymnastics-4.png',
            time: '1:00 pm',
            duration: '6:00 pm',
            location: 'Cyberport',
            ageGroup: '8 - 16 years',
            level: 'ADVANCED' as const,
            price: 'HKD 3,500.00',
            isFree: false,
            availableSlots: 6,
            totalSlots: 12,
            category: 'Cyberport Camps'
        },
        {
            id: '23',
            title: 'Toddler Gymnastics Camp - Cyberport',
            description: 'Special camp designed for toddlers and parents',
            image: '/images/hero/gymnastics-1.jpg',
            time: '10:00 am',
            duration: '12:00 pm',
            location: 'Cyberport',
            ageGroup: '18 months - 3 years',
            level: 'BEGINNER' as const,
            price: 'HKD 1,800.00',
            isFree: false,
            availableSlots: 15,
            totalSlots: 20,
            category: 'Cyberport Camps'
        },
        {
            id: '24',
            title: 'Competitive Team Camp - Cyberport',
            description: 'Elite training camp for competitive gymnasts',
            image: '/images/hero/gymnastics-2.jpg',
            time: '8:00 am',
            duration: '5:00 pm',
            location: 'Cyberport',
            ageGroup: '10 - 18 years',
            level: 'ADVANCED' as const,
            price: 'HKD 4,200.00',
            isFree: false,
            availableSlots: 4,
            totalSlots: 8,
            category: 'Cyberport Camps'
        }
    ],
    'ProGym Wanchai Camps': [
        {
            id: '25',
            title: 'Summer Intensive Camp - Wanchai',
            description: 'Comprehensive summer gymnastics program',
            image: '/images/hero/gymnastics-3.jpg',
            time: '9:00 am',
            duration: '4:00 pm',
            location: 'Wanchai',
            ageGroup: '5 - 15 years',
            level: 'INTERMEDIATE' as const,
            price: 'HKD 3,200.00',
            isFree: false,
            availableSlots: 14,
            totalSlots: 25,
            category: 'Wanchai Camps'
        },
        {
            id: '26',
            title: 'Artistic Gymnastics Camp - Wanchai',
            description: 'Focus on artistic gymnastics techniques',
            image: '/images/hero/gymnastics-4.png',
            time: '10:00 am',
            duration: '3:00 pm',
            location: 'Wanchai',
            ageGroup: '6 - 14 years',
            level: 'INTERMEDIATE' as const,
            price: 'HKD 2,900.00',
            isFree: false,
            availableSlots: 9,
            totalSlots: 16,
            category: 'Wanchai Camps'
        },
        {
            id: '27',
            title: 'Rhythmic Gymnastics Camp - Wanchai',
            description: 'Beautiful rhythmic gymnastics training camp',
            image: '/images/hero/gymnastics-1.jpg',
            time: '11:00 am',
            duration: '4:00 pm',
            location: 'Wanchai',
            ageGroup: '4 - 12 years',
            level: 'BEGINNER' as const,
            price: 'HKD 2,600.00',
            isFree: false,
            availableSlots: 11,
            totalSlots: 18,
            category: 'Wanchai Camps'
        },
        {
            id: '28',
            title: 'Beginner Friendly Camp - Wanchai',
            description: 'Perfect introduction camp for new gymnasts',
            image: '/images/hero/gymnastics-2.jpg',
            time: '9:30 am',
            duration: '2:30 pm',
            location: 'Wanchai',
            ageGroup: '3 - 8 years',
            level: 'BEGINNER' as const,
            price: 'HKD 2,100.00',
            isFree: false,
            availableSlots: 16,
            totalSlots: 22,
            category: 'Wanchai Camps'
        },
        {
            id: '29',
            title: 'Advanced Training Camp - Wanchai',
            description: 'High-level training for serious gymnasts',
            image: '/images/hero/gymnastics-3.jpg',
            time: '1:00 pm',
            duration: '7:00 pm',
            location: 'Wanchai',
            ageGroup: '9 - 17 years',
            level: 'ADVANCED' as const,
            price: 'HKD 3,800.00',
            isFree: false,
            availableSlots: 5,
            totalSlots: 10,
            category: 'Wanchai Camps'
        },
        {
            id: '30',
            title: 'Family Fun Camp - Wanchai',
            description: 'Gymnastics camp for families to enjoy together',
            image: '/images/hero/gymnastics-4.png',
            time: '10:30 am',
            duration: '1:30 pm',
            location: 'Wanchai',
            ageGroup: 'All Ages',
            level: 'BEGINNER' as const,
            price: 'HKD 1,900.00',
            isFree: false,
            availableSlots: 20,
            totalSlots: 30,
            category: 'Wanchai Camps'
        }
    ],
    'School Programs': [
        {
            id: '31',
            title: 'Primary School Gymnastics Program',
            description: 'Structured gymnastics program for primary schools',
            image: '/images/hero/gymnastics-1.jpg',
            time: '2:00 pm',
            duration: '3:30 pm',
            location: 'Various Schools',
            ageGroup: '6 - 12 years',
            level: 'BEGINNER' as const,
            price: 'HKD 450.00',
            isFree: false,
            availableSlots: 25,
            totalSlots: 30,
            category: 'School Programs'
        },
        {
            id: '32',
            title: 'Secondary School Advanced Program',
            description: 'Advanced gymnastics training for secondary students',
            image: '/images/hero/gymnastics-2.jpg',
            time: '3:30 pm',
            duration: '5:00 pm',
            location: 'Various Schools',
            ageGroup: '12 - 18 years',
            level: 'INTERMEDIATE' as const,
            price: 'HKD 520.00',
            isFree: false,
            availableSlots: 18,
            totalSlots: 25,
            category: 'School Programs'
        },
        {
            id: '33',
            title: 'International School ECA Program',
            description: 'Extra-curricular gymnastics for international schools',
            image: '/images/hero/gymnastics-3.jpg',
            time: '3:00 pm',
            duration: '4:30 pm',
            location: 'International Schools',
            ageGroup: '5 - 16 years',
            level: 'BEGINNER' as const,
            price: 'HKD 480.00',
            isFree: false,
            availableSlots: 22,
            totalSlots: 28,
            category: 'School Programs'
        },
        {
            id: '34',
            title: 'Kindergarten Movement Program',
            description: 'Fun movement and basic gymnastics for kindergarten',
            image: '/images/hero/gymnastics-4.png',
            time: '10:00 am',
            duration: '11:00 am',
            location: 'Kindergartens',
            ageGroup: '3 - 6 years',
            level: 'BEGINNER' as const,
            price: 'HKD 320.00',
            isFree: false,
            availableSlots: 30,
            totalSlots: 35,
            category: 'School Programs'
        },
        {
            id: '35',
            title: 'Special Needs School Program',
            description: 'Adaptive gymnastics program for special needs students',
            image: '/images/hero/gymnastics-1.jpg',
            time: '1:30 pm',
            duration: '2:30 pm',
            location: 'Special Schools',
            ageGroup: '6 - 18 years',
            level: 'BEGINNER' as const,
            price: 'HKD 380.00',
            isFree: false,
            availableSlots: 12,
            totalSlots: 15,
            category: 'School Programs'
        },
        {
            id: '36',
            title: 'Elite School Competition Team',
            description: 'Competitive gymnastics team for elite schools',
            image: '/images/hero/gymnastics-2.jpg',
            time: '4:00 pm',
            duration: '6:30 pm',
            location: 'Elite Schools',
            ageGroup: '8 - 18 years',
            level: 'ADVANCED' as const,
            price: 'HKD 680.00',
            isFree: false,
            availableSlots: 8,
            totalSlots: 12,
            category: 'School Programs'
        }
    ],
    'School Holiday Camps': [
        {
            id: '37',
            title: 'Christmas Holiday Gymnastics Camp',
            description: 'Festive gymnastics camp during Christmas holidays',
            image: '/images/hero/gymnastics-3.jpg',
            time: '9:00 am',
            duration: '3:00 pm',
            location: 'Multiple Locations',
            ageGroup: '4 - 14 years',
            level: 'BEGINNER' as const,
            price: 'HKD 2,400.00',
            isFree: false,
            availableSlots: 18,
            totalSlots: 25,
            category: 'Holiday Camps'
        },
        {
            id: '38',
            title: 'Chinese New Year Holiday Camp',
            description: 'Special gymnastics camp celebrating Chinese New Year',
            image: '/images/hero/gymnastics-4.png',
            time: '10:00 am',
            duration: '4:00 pm',
            location: 'Multiple Locations',
            ageGroup: '3 - 12 years',
            level: 'BEGINNER' as const,
            price: 'HKD 2,600.00',
            isFree: false,
            availableSlots: 15,
            totalSlots: 20,
            category: 'Holiday Camps'
        },
        {
            id: '39',
            title: 'Mid-Autumn Festival Camp',
            description: 'Traditional festival themed gymnastics activities',
            image: '/images/hero/gymnastics-1.jpg',
            time: '9:30 am',
            duration: '2:30 pm',
            location: 'Multiple Locations',
            ageGroup: '5 - 13 years',
            level: 'INTERMEDIATE' as const,
            price: 'HKD 2,200.00',
            isFree: false,
            availableSlots: 12,
            totalSlots: 18,
            category: 'Holiday Camps'
        },
        {
            id: '40',
            title: 'Dragon Boat Festival Camp',
            description: 'Active gymnastics camp during Dragon Boat holidays',
            image: '/images/hero/gymnastics-2.jpg',
            time: '8:30 am',
            duration: '1:30 pm',
            location: 'Multiple Locations',
            ageGroup: '6 - 15 years',
            level: 'INTERMEDIATE' as const,
            price: 'HKD 2,000.00',
            isFree: false,
            availableSlots: 20,
            totalSlots: 24,
            category: 'Holiday Camps'
        },
        {
            id: '41',
            title: 'October Holiday Intensive Camp',
            description: 'Intensive gymnastics training during October break',
            image: '/images/hero/gymnastics-3.jpg',
            time: '1:00 pm',
            duration: '6:00 pm',
            location: 'Multiple Locations',
            ageGroup: '7 - 16 years',
            level: 'ADVANCED' as const,
            price: 'HKD 3,200.00',
            isFree: false,
            availableSlots: 8,
            totalSlots: 14,
            category: 'Holiday Camps'
        },
        {
            id: '42',
            title: 'Public Holiday Fun Camp',
            description: 'Fun-filled gymnastics activities on public holidays',
            image: '/images/hero/gymnastics-4.png',
            time: '10:30 am',
            duration: '3:30 pm',
            location: 'Multiple Locations',
            ageGroup: '4 - 11 years',
            level: 'BEGINNER' as const,
            price: 'HKD 1,800.00',
            isFree: false,
            availableSlots: 25,
            totalSlots: 32,
            category: 'Holiday Camps'
        }
    ]
}

interface AssessmentListingProps {
    onBookAssessment: (assessmentId: string) => void
}

export default function AssessmentListing({ onBookAssessment }: AssessmentListingProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'week' | 'schedule'>('grid')

    // Filter all assessments based on search
    const filteredCategories = Object.entries(mockAssessmentsByCategory).reduce((acc, [category, assessments]) => {
        const filtered = assessments.filter(assessment =>
            assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assessment.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        if (filtered.length > 0) {
            acc[category] = filtered
        }
        return acc
    }, {} as Record<string, Assessment[]>)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header with View Toggle */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">All classes</h1>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button id="assessment-listing-grid-view-btn"
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${viewMode === 'grid'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                            <span className="text-sm font-medium">Grid</span>
                        </button>
                        <button id="assessment-listing-week-view-btn"
                            onClick={() => setViewMode('week')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${viewMode === 'week'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <List className="w-4 h-4" />
                            <span className="text-sm font-medium">Week</span>
                        </button>
                        <button id="assessment-listing-schedule-view-btn"
                            onClick={() => setViewMode('schedule')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${viewMode === 'schedule'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">Schedule</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar - Only show for Grid and Week views */}
            {viewMode !== 'schedule' && (
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* Content based on view mode */}
            {viewMode === 'schedule' ? (
                <ScheduleView onBookAssessment={onBookAssessment} />
            ) : (
                <>
                    {/* Horizontal Sections by Category */}
                    <div className="space-y-12">
                        {Object.entries(filteredCategories).map(([category, assessments]) => (
                            <HorizontalSection
                                key={category}
                                title={category}
                                assessments={assessments}
                                onBookAssessment={onBookAssessment}
                                onViewAll={() => {
                                    // Handle view all for specific category
                                    console.log(`View all ${category}`)
                                }}
                            />
                        ))}
                    </div>

                    {/* No Results */}
                    {Object.keys(filteredCategories).length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="text-gray-400 mb-4">
                                <Filter className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes found</h3>
                            <p className="text-gray-600">Try adjusting your search criteria</p>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    )
}
