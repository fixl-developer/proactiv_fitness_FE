'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiMapPin,
    FiClock,
    FiCheck,
    FiStar,
    FiZap,
    FiTrendingUp,
    FiAlertCircle
} from 'react-icons/fi'
import AIRecommendations from './AIRecommendations'
import { formatDateShort } from '@/utils/dateUtils'

interface SmartBookingFormProps {
    type: 'trial' | 'assessment' | 'camp' | 'party'
    title?: string
    subtitle?: string
    onSubmit?: (data: any) => void
    className?: string
    aiEnabled?: boolean
}

interface AIInsight {
    type: 'suggestion' | 'warning' | 'optimization'
    message: string
    confidence: number
}

interface TimeSlotSuggestion {
    date: string
    time: string
    score: number
    reasoning: string[]
    availability: 'high' | 'medium' | 'low'
}

const SmartBookingForm = ({
    type,
    title,
    subtitle,
    onSubmit,
    className = '',
    aiEnabled = true
}: SmartBookingFormProps) => {
    const [formData, setFormData] = useState({
        parentName: '',
        childName: '',
        childAge: '',
        email: '',
        phone: '',
        program: '',
        location: '',
        preferredDate: '',
        preferredTime: '',
        experience: '',
        specialNeeds: '',
        goals: [] as string[],
        hearAboutUs: '',
        newsletter: false
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
    const [timeSlotSuggestions, setTimeSlotSuggestions] = useState<TimeSlotSuggestion[]>([])
    const [showRecommendations, setShowRecommendations] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // AI-powered form analysis
    useEffect(() => {
        if (aiEnabled && formData.childAge && formData.experience) {
            analyzeFormData()
        }
    }, [formData.childAge, formData.experience, formData.location, aiEnabled])

    // Generate time slot suggestions when location and date are selected
    useEffect(() => {
        if (aiEnabled && formData.location && formData.preferredDate) {
            generateTimeSlotSuggestions()
        }
    }, [formData.location, formData.preferredDate, aiEnabled])

    const analyzeFormData = async () => {
        setIsAnalyzing(true)

        try {
            // Mock AI analysis - Replace with actual API call
            const insights = await mockAnalyzeFormData(formData)
            setAiInsights(insights)

            // Show recommendations if child age is provided
            if (formData.childAge) {
                setShowRecommendations(true)
            }
        } catch (error) {
            console.error('Error analyzing form data:', error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const generateTimeSlotSuggestions = async () => {
        try {
            const suggestions = await mockGenerateTimeSlots({
                location: formData.location,
                date: formData.preferredDate,
                childAge: formData.childAge,
                program: formData.program
            })
            setTimeSlotSuggestions(suggestions)
        } catch (error) {
            console.error('Error generating time slot suggestions:', error)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleGoalChange = (goal: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            goals: checked
                ? [...prev.goals, goal]
                : prev.goals.filter(g => g !== goal)
        }))
    }

    const selectTimeSlot = (suggestion: TimeSlotSuggestion) => {
        setFormData(prev => ({
            ...prev,
            preferredDate: suggestion.date,
            preferredTime: suggestion.time
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            if (onSubmit) {
                await onSubmit({
                    ...formData,
                    aiInsights,
                    selectedTimeSlot: timeSlotSuggestions.find(
                        s => s.date === formData.preferredDate && s.time === formData.preferredTime
                    )
                })
            }
            setIsSubmitted(true)
        } catch (error) {
            console.error('Error submitting form:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const availableGoals = [
        'Build Confidence',
        'Improve Flexibility',
        'Develop Strength',
        'Learn New Skills',
        'Make Friends',
        'Competitive Training',
        'Physical Fitness',
        'Discipline & Focus'
    ]

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'suggestion': return <FiZap className="w-4 h-4" />
            case 'warning': return <FiAlertCircle className="w-4 h-4" />
            case 'optimization': return <FiTrendingUp className="w-4 h-4" />
            default: return <FiStar className="w-4 h-4" />
        }
    }

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'suggestion': return 'bg-blue-50 border-blue-200 text-blue-800'
            case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
            case 'optimization': return 'bg-green-50 border-green-200 text-green-800'
            default: return 'bg-gray-50 border-gray-200 text-gray-800'
        }
    }

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className={`bg-white rounded-2xl shadow-xl p-8 text-center ${className}`}
            >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheck className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                    Booking Submitted Successfully!
                </h2>
                <p className="text-gray-600 mb-6">
                    Our AI has analyzed your preferences and found the perfect match.
                    We'll contact you within 24 hours to confirm your appointment.
                </p>
                {aiInsights.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-2">AI Insights for Your Booking:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            {aiInsights.slice(0, 2).map((insight, idx) => (
                                <li key={idx}>• {insight.message}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </motion.div>
        )
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Main Form */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <h2 className="text-2xl font-heading font-bold text-gray-900">
                            {title || 'Smart Booking Assistant'}
                        </h2>
                        {aiEnabled && (
                            <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                                <FiZap className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-700">AI Powered</span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600">
                        {subtitle || 'Our AI will help you find the perfect program and time slot for your child.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Parent/Guardian Name *
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="parentName"
                                    value={formData.parentName}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Child's Name *
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="childName"
                                    value={formData.childName}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                    placeholder="Child's full name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Child Age and Experience */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Child's Age *
                            </label>
                            <select
                                name="childAge"
                                value={formData.childAge}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                            >
                                <option value="">Select age</option>
                                {Array.from({ length: 15 }, (_, i) => i + 3).map(age => (
                                    <option key={age} value={age}>{age} years old</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Experience Level
                            </label>
                            <select
                                name="experience"
                                value={formData.experience}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                            >
                                <option value="">Select experience</option>
                                <option value="none">No previous experience</option>
                                <option value="beginner">Some basic experience</option>
                                <option value="intermediate">Intermediate level</option>
                                <option value="advanced">Advanced level</option>
                            </select>
                        </div>
                    </div>

                    {/* Goals Selection */}
                    {aiEnabled && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                What are your goals for your child? (Select all that apply)
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {availableGoals.map(goal => (
                                    <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.goals.includes(goal)}
                                            onChange={(e) => handleGoalChange(goal, e.target.checked)}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700">{goal}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                    placeholder="+852 1234 5678"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location and Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred Location *
                            </label>
                            <div className="relative">
                                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                >
                                    <option value="">Select location</option>
                                    <option value="cyberport">Cyberport Location</option>
                                    <option value="wan-chai">Wan Chai Location</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred Date *
                            </label>
                            <div className="relative">
                                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="date"
                                    name="preferredDate"
                                    value={formData.preferredDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* AI Time Slot Suggestions */}
                    {aiEnabled && timeSlotSuggestions.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                AI Recommended Time Slots
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {timeSlotSuggestions.map((suggestion, idx) => (
                                    <motion.button
                                        key={idx}
                                        type="button"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => selectTimeSlot(suggestion)}
                                        className={`p-4 border-2 rounded-lg text-left transition-all ${formData.preferredTime === suggestion.time && formData.preferredDate === suggestion.date
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-gray-900">
                                                {suggestion.time}
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${suggestion.score >= 0.9 ? 'bg-green-100 text-green-800' :
                                                suggestion.score >= 0.8 ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {Math.round(suggestion.score * 100)}% match
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">
                                            {formatDateShort(suggestion.date)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {suggestion.reasoning[0]}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Manual Time Selection */}
                    {(!aiEnabled || timeSlotSuggestions.length === 0) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preferred Time *
                            </label>
                            <div className="relative">
                                <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    name="preferredTime"
                                    value={formData.preferredTime}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                >
                                    <option value="">Select time</option>
                                    <option value="9:00 AM">9:00 AM</option>
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="11:00 AM">11:00 AM</option>
                                    <option value="2:00 PM">2:00 PM</option>
                                    <option value="3:00 PM">3:00 PM</option>
                                    <option value="4:00 PM">4:00 PM</option>
                                    <option value="5:00 PM">5:00 PM</option>
                                    <option value="6:00 PM">6:00 PM</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner w-5 h-5"></div>
                                <span>Processing with AI...</span>
                            </>
                        ) : (
                            <>
                                <span>Book with AI Assistance</span>
                                <FiZap className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* AI Insights Panel */}
            {aiEnabled && aiInsights.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FiZap className="w-5 h-5 mr-2 text-purple-600" />
                        AI Insights & Suggestions
                    </h3>
                    <div className="space-y-3">
                        {aiInsights.map((insight, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                            >
                                <div className="flex items-start space-x-3">
                                    {getInsightIcon(insight.type)}
                                    <div className="flex-1">
                                        <p className="text-sm">{insight.message}</p>
                                        <div className="mt-2 text-xs opacity-75">
                                            Confidence: {Math.round(insight.confidence * 100)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* AI Recommendations */}
            {aiEnabled && showRecommendations && formData.childAge && (
                <AIRecommendations
                    childAge={parseInt(formData.childAge)}
                    experienceLevel={formData.experience}
                    goals={formData.goals}
                    location={formData.location}
                    onRecommendationSelect={(rec) => {
                        setFormData(prev => ({
                            ...prev,
                            program: rec.programName.toLowerCase().replace(/\s+/g, '_')
                        }))
                    }}
                />
            )}
        </div>
    )
}

// Mock functions - Replace with actual API calls
const mockAnalyzeFormData = async (formData: any): Promise<AIInsight[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const insights: AIInsight[] = []

    if (formData.childAge) {
        const age = parseInt(formData.childAge)
        if (age >= 3 && age <= 6) {
            insights.push({
                type: 'suggestion',
                message: 'Perfect age for our Beginner program! This age group learns through play and develops fundamental movement skills.',
                confidence: 0.95
            })
        }
    }

    if (formData.experience === 'none') {
        insights.push({
            type: 'optimization',
            message: 'Since this is your child\'s first gymnastics experience, we recommend starting with a trial class to ensure comfort.',
            confidence: 0.88
        })
    }

    if (formData.goals.includes('Build Confidence') && formData.goals.includes('Make Friends')) {
        insights.push({
            type: 'suggestion',
            message: 'Group classes would be ideal for building confidence and social skills. Our small class sizes ensure personal attention.',
            confidence: 0.92
        })
    }

    return insights
}

const mockGenerateTimeSlots = async (criteria: any): Promise<TimeSlotSuggestion[]> => {
    await new Promise(resolve => setTimeout(resolve, 800))

    return [
        {
            date: criteria.date,
            time: '10:00 AM',
            score: 0.95,
            reasoning: ['Optimal time for young children', 'High coach availability', 'Small class size'],
            availability: 'high'
        },
        {
            date: criteria.date,
            time: '3:00 PM',
            score: 0.88,
            reasoning: ['Good for after-school activities', 'Popular time slot', 'Experienced coach available'],
            availability: 'medium'
        },
        {
            date: criteria.date,
            time: '11:00 AM',
            score: 0.82,
            reasoning: ['Weekend favorite', 'Family-friendly timing', 'Multiple programs available'],
            availability: 'medium'
        }
    ]
}

export default SmartBookingForm
