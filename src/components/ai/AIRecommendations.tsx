'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FiStar,
    FiMapPin,
    FiClock,
    FiUsers,
    FiDollarSign,
    FiCheckCircle,
    FiInfo,
    FiArrowRight,
    FiTrendingUp
} from 'react-icons/fi'
import { formatDateShort } from '@/utils/dateUtils'

interface Recommendation {
    id: string
    programName: string
    score: number
    reasoning: string[]
    matchedCriteria: string[]
    location: string
    pricing: {
        monthly: number
        trial: number
    }
    availability: {
        nextAvailable: string
        weeklySlots: number
    }
    ageRange: string
    experienceLevel: string
    maxParticipants: number
    duration: number
    benefits: string[]
    successRate: number
}

interface AIRecommendationsProps {
    childAge?: number
    experienceLevel?: string
    goals?: string[]
    location?: string
    budget?: number
    onRecommendationSelect?: (recommendation: Recommendation) => void
    className?: string
}

const AIRecommendations = ({
    childAge,
    experienceLevel = 'beginner',
    goals = [],
    location,
    budget,
    onRecommendationSelect,
    className = ''
}: AIRecommendationsProps) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null)

    useEffect(() => {
        if (childAge) {
            generateRecommendations()
        }
    }, [childAge, experienceLevel, goals, location, budget])

    const generateRecommendations = async () => {
        setIsLoading(true)

        try {
            // Mock API call - Replace with actual API
            const mockRecommendations = await mockGetRecommendations({
                childAge,
                experienceLevel,
                goals,
                location,
                budget
            })

            setRecommendations(mockRecommendations)
        } catch (error) {
            console.error('Error generating recommendations:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectRecommendation = (recommendation: Recommendation) => {
        setSelectedRecommendation(recommendation.id)
        onRecommendationSelect?.(recommendation)
    }

    const getScoreColor = (score: number) => {
        if (score >= 0.9) return 'text-green-600 bg-green-100'
        if (score >= 0.8) return 'text-blue-600 bg-blue-100'
        if (score >= 0.7) return 'text-yellow-600 bg-yellow-100'
        return 'text-gray-600 bg-gray-100'
    }

    const getScoreLabel = (score: number) => {
        if (score >= 0.9) return 'Perfect Match'
        if (score >= 0.8) return 'Great Match'
        if (score >= 0.7) return 'Good Match'
        return 'Suitable'
    }

    if (isLoading) {
        return (
            <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-xl p-4">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!recommendations.length) {
        return (
            <div className={`bg-white rounded-2xl shadow-lg p-6 text-center ${className}`}>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiInfo className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
                <p className="text-gray-600">
                    Provide your child's age and preferences to get personalized program recommendations.
                </p>
            </div>
        )
    }

    return (
        <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    AI Program Recommendations
                </h2>
                <p className="text-gray-600">
                    Based on your child's profile, here are our top recommendations:
                </p>
            </div>

            <div className="space-y-4">
                {recommendations.map((recommendation, index) => (
                    <motion.div
                        key={recommendation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 ${selectedRecommendation === recommendation.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                            }`}
                        onClick={() => handleSelectRecommendation(recommendation)}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {recommendation.programName}
                                    </h3>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(recommendation.score)}`}>
                                        <div className="flex items-center space-x-1">
                                            <FiStar className="w-4 h-4" />
                                            <span>{getScoreLabel(recommendation.score)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <FiMapPin className="w-4 h-4" />
                                        <span>{recommendation.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <FiUsers className="w-4 h-4" />
                                        <span>{recommendation.ageRange}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <FiClock className="w-4 h-4" />
                                        <span>{recommendation.duration} min</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary-600">
                                    HK${recommendation.pricing.monthly}
                                </div>
                                <div className="text-sm text-gray-500">per month</div>
                                {recommendation.pricing.trial === 0 && (
                                    <div className="text-sm text-green-600 font-medium">
                                        Free Trial Available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Reasoning */}
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <FiTrendingUp className="w-4 h-4 mr-2" />
                                Why This Program is Perfect for Your Child:
                            </h4>
                            <ul className="space-y-1">
                                {recommendation.reasoning.map((reason, idx) => (
                                    <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                                        <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Program Benefits */}
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Key Benefits:</h4>
                            <div className="flex flex-wrap gap-2">
                                {recommendation.benefits.map((benefit, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                    >
                                        {benefit}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Availability & Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-sm text-gray-600">Next Available</div>
                                <div className="font-semibold text-gray-900">
                                    {formatDateShort(recommendation.availability.nextAvailable)}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-sm text-gray-600">Success Rate</div>
                                <div className="font-semibold text-green-600">
                                    {Math.round(recommendation.successRate * 100)}%
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${selectedRecommendation === recommendation.id
                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                                }`}
                        >
                            <span>
                                {selectedRecommendation === recommendation.id
                                    ? 'Selected - Book Now'
                                    : 'Select This Program'
                                }
                            </span>
                            <FiArrowRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                    <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-900 mb-1">
                            AI-Powered Matching
                        </h4>
                        <p className="text-sm text-blue-800">
                            Our AI analyzes your child's age, experience, goals, and preferences to recommend
                            the most suitable programs. Each recommendation includes a match score and detailed
                            reasoning to help you make the best choice.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Mock API function - Replace with actual API call
const mockGetRecommendations = async (criteria: any): Promise<Recommendation[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const { childAge, experienceLevel, location } = criteria

    const baseRecommendations: Recommendation[] = [
        {
            id: 'rec_1',
            programName: 'Beginner Gymnastics',
            score: 0.95,
            reasoning: [
                `Perfect age match for ${childAge}-year-old children`,
                'Beginner level matches your child\'s experience',
                'Focus on fun and fundamental skills development',
                'Small class sizes ensure individual attention'
            ],
            matchedCriteria: ['age', 'experience', 'safety', 'fun'],
            location: location || 'Cyberport',
            pricing: {
                monthly: 800,
                trial: 0
            },
            availability: {
                nextAvailable: '2024-01-15',
                weeklySlots: 3
            },
            ageRange: '3-6 years',
            experienceLevel: 'beginner',
            maxParticipants: 8,
            duration: 60,
            benefits: ['Coordination', 'Confidence', 'Social Skills', 'Basic Gymnastics'],
            successRate: 0.92
        },
        {
            id: 'rec_2',
            programName: 'Intermediate Skills Development',
            score: 0.82,
            reasoning: [
                'Great progression path from beginner level',
                'Develops more advanced gymnastics skills',
                'Builds strength and flexibility systematically',
                'Prepares for potential competitive track'
            ],
            matchedCriteria: ['progression', 'skill-building', 'strength'],
            location: location || 'Wan Chai',
            pricing: {
                monthly: 950,
                trial: 0
            },
            availability: {
                nextAvailable: '2024-01-20',
                weeklySlots: 2
            },
            ageRange: '7-10 years',
            experienceLevel: 'intermediate',
            maxParticipants: 6,
            duration: 75,
            benefits: ['Advanced Skills', 'Strength Building', 'Discipline', 'Goal Setting'],
            successRate: 0.88
        },
        {
            id: 'rec_3',
            programName: 'Fun & Fitness Program',
            score: 0.78,
            reasoning: [
                'Emphasizes enjoyment and physical fitness',
                'Less pressure, more focus on having fun',
                'Great for building love of movement',
                'Flexible progression based on child\'s interest'
            ],
            matchedCriteria: ['fun', 'fitness', 'flexibility'],
            location: location || 'Cyberport',
            pricing: {
                monthly: 750,
                trial: 0
            },
            availability: {
                nextAvailable: '2024-01-12',
                weeklySlots: 4
            },
            ageRange: '4-8 years',
            experienceLevel: 'beginner',
            maxParticipants: 10,
            duration: 60,
            benefits: ['Fitness', 'Fun', 'Flexibility', 'Friendship'],
            successRate: 0.85
        }
    ]

    // Filter and adjust recommendations based on criteria
    return baseRecommendations
        .filter(rec => {
            if (childAge) {
                const [minAge, maxAge] = rec.ageRange.split('-').map(age => parseInt(age.replace(/\D/g, '')))
                return childAge >= minAge && childAge <= maxAge
            }
            return true
        })
        .sort((a, b) => b.score - a.score)
}

export default AIRecommendations
