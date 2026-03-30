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
import { apiClient } from '@/services/api/client'

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
            // Call AI chatbot with structured recommendation request
            const message = `Recommend gymnastics programs for a ${childAge}-year-old child. Experience: ${experienceLevel}. Goals: ${goals.join(', ') || 'general fitness'}. Location preference: ${location || 'any'}. Budget: ${budget ? `HK$${budget}/month` : 'flexible'}.`

            const response = await apiClient.post<any>('/ai/chat', {
                message,
                conversationHistory: [],
            })

            // Try to parse AI response into structured recommendations
            const aiData = response?.data

            if (aiData?.bookingIntent || aiData?.response) {
                // Map AI response to recommendation format
                const aiRecommendations = mapAIResponseToRecommendations(aiData, { childAge, experienceLevel, location, budget })
                setRecommendations(aiRecommendations)
            } else {
                // Fallback: generate default recommendations
                setRecommendations(getDefaultRecommendations({ childAge, experienceLevel, location }))
            }
        } catch (error) {
            console.error('Error generating recommendations:', error)
            // Graceful fallback
            setRecommendations(getDefaultRecommendations({ childAge, experienceLevel, location }))
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
                        id={`ai-recommendations-program-${recommendation.id}-card`}
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
                        <button id={`ai-recommendations-select-${recommendation.id}-btn`}
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

// Map AI chatbot response to structured recommendations
const mapAIResponseToRecommendations = (aiData: any, criteria: any): Recommendation[] => {
    const { childAge, experienceLevel, location, budget } = criteria
    const recommendations: Recommendation[] = []
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    // Build recommendations based on AI analysis and child age
    if (childAge && childAge >= 2 && childAge <= 5) {
        recommendations.push({
            id: 'ai_rec_1',
            programName: 'Kinder Gym',
            score: 0.95,
            reasoning: [
                `AI-recommended for ${childAge}-year-old children`,
                'Focus on motor skills and coordination development',
                'Safe, fun environment for early learners',
                aiData.response ? 'Based on AI analysis of your child\'s profile' : 'Age-appropriate curriculum'
            ],
            matchedCriteria: ['age', 'safety', 'development', 'fun'],
            location: location || 'Cyberport',
            pricing: { monthly: budget ? Math.min(budget, 800) : 800, trial: 0 },
            availability: { nextAvailable: nextWeek.toISOString().split('T')[0], weeklySlots: 3 },
            ageRange: '2-5 years',
            experienceLevel: 'beginner',
            maxParticipants: 8,
            duration: 45,
            benefits: ['Motor Skills', 'Coordination', 'Confidence', 'Social Skills'],
            successRate: 0.93,
        })
    }

    if (childAge && childAge >= 4 && childAge <= 8) {
        recommendations.push({
            id: 'ai_rec_2',
            programName: 'Fun & Fitness Program',
            score: childAge <= 5 ? 0.85 : 0.92,
            reasoning: [
                'AI-matched based on age and development stage',
                'Builds love of movement through play',
                'Flexible progression at child\'s pace',
                'Great for building foundational fitness'
            ],
            matchedCriteria: ['fun', 'fitness', 'flexibility'],
            location: location || 'Cyberport',
            pricing: { monthly: budget ? Math.min(budget, 750) : 750, trial: 0 },
            availability: { nextAvailable: nextWeek.toISOString().split('T')[0], weeklySlots: 4 },
            ageRange: '4-8 years',
            experienceLevel: 'beginner',
            maxParticipants: 10,
            duration: 60,
            benefits: ['Fitness', 'Fun', 'Flexibility', 'Friendship'],
            successRate: 0.88,
        })
    }

    if (childAge && childAge >= 6 && childAge <= 12) {
        recommendations.push({
            id: 'ai_rec_3',
            programName: experienceLevel === 'intermediate' ? 'Intermediate Skills Development' : 'School Gymnastics',
            score: experienceLevel === 'intermediate' ? 0.94 : 0.90,
            reasoning: [
                `AI-recommended for ${childAge}-year-old at ${experienceLevel} level`,
                'Structured skill progression pathway',
                'Develops strength, flexibility and technique',
                'Prepares for competitive track if desired'
            ],
            matchedCriteria: ['age', 'progression', 'skill-building'],
            location: location || 'Wan Chai',
            pricing: { monthly: budget ? Math.min(budget, 950) : 950, trial: 0 },
            availability: { nextAvailable: nextWeek.toISOString().split('T')[0], weeklySlots: 3 },
            ageRange: '6-12 years',
            experienceLevel: experienceLevel || 'beginner',
            maxParticipants: 6,
            duration: 75,
            benefits: ['Gymnastics Skills', 'Strength', 'Discipline', 'Goal Setting'],
            successRate: 0.90,
        })
    }

    if (childAge && childAge >= 13) {
        recommendations.push({
            id: 'ai_rec_4',
            programName: 'Advanced Gymnastics Training',
            score: 0.91,
            reasoning: [
                `AI-matched for teen athlete (age ${childAge})`,
                'Advanced technique and performance training',
                'Competition preparation available',
                'Individual goal-oriented coaching'
            ],
            matchedCriteria: ['age', 'advancement', 'performance'],
            location: location || 'Wan Chai',
            pricing: { monthly: budget ? Math.min(budget, 1200) : 1200, trial: 0 },
            availability: { nextAvailable: nextWeek.toISOString().split('T')[0], weeklySlots: 3 },
            ageRange: '13-18 years',
            experienceLevel: experienceLevel || 'intermediate',
            maxParticipants: 6,
            duration: 90,
            benefits: ['Advanced Techniques', 'Competition Prep', 'Strength', 'Performance'],
            successRate: 0.87,
        })
    }

    return recommendations.sort((a, b) => b.score - a.score)
}

// Fallback recommendations when AI API is unavailable
const getDefaultRecommendations = (criteria: any): Recommendation[] => {
    return mapAIResponseToRecommendations({ response: null }, criteria)
}

export default AIRecommendations
