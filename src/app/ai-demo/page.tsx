'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FiMessageCircle,
    FiStar,
    FiCalendar,
} from 'react-icons/fi'
import AIChatbot from '@/components/ai/AIChatbot'
import AIRecommendations from '@/components/ai/AIRecommendations'
import SmartScheduling from '@/components/ai/SmartScheduling'
import { Toaster } from 'sonner'

const AIDemoPage = () => {
    const [activeDemo, setActiveDemo] = useState<'chatbot' | 'recommendations' | 'scheduling'>('chatbot')
    const [demoAge, setDemoAge] = useState<number>(6)

    return (
        <div className="min-h-screen bg-gray-50 pt-16 sm:pt-24 pb-16">
            <Toaster position="top-right" richColors />
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 sm:mb-12"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        AI Features Demo
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                        Experience our advanced AI-powered features for gymnastics training
                    </p>
                </motion.div>

                {/* Demo Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg shadow-md p-1 inline-flex flex-wrap justify-center gap-1">
                        <button id="ai-demo-btn"
                            onClick={() => setActiveDemo('chatbot')}
                            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${activeDemo === 'chatbot'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FiMessageCircle className="inline mr-2" />
                            AI Chatbot
                        </button>
                        <button id="ai-demo-btn-2"
                            onClick={() => setActiveDemo('recommendations')}
                            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${activeDemo === 'recommendations'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FiStar className="inline mr-2" />
                            Recommendations
                        </button>
                        <button id="ai-demo-btn-3"
                            onClick={() => setActiveDemo('scheduling')}
                            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${activeDemo === 'scheduling'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FiCalendar className="inline mr-2" />
                            Smart Scheduling
                        </button>
                    </div>
                </div>

                {/* Demo Content */}
                <div className="max-w-4xl mx-auto">
                    {activeDemo === 'chatbot' && <AIChatbot />}
                    {activeDemo === 'recommendations' && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Child Age:</label>
                                <select
                                    id="ai-demo-age-select"
                                    value={demoAge}
                                    onChange={(e) => setDemoAge(parseInt(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    {Array.from({ length: 15 }, (_, i) => i + 3).map(age => (
                                        <option key={age} value={age}>{age} years old</option>
                                    ))}
                                </select>
                            </div>
                            <AIRecommendations childAge={demoAge} />
                        </div>
                    )}
                    {activeDemo === 'scheduling' && <SmartScheduling />}
                </div>
            </div>
        </div>
    )
}

export default AIDemoPage
