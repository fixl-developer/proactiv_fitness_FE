'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    FiZap,
    FiMessageCircle,
    FiTrendingUp,
    FiStar,
    FiTarget,
    FiUsers,
    FiCalendar,
    FiSettings
} from 'react-icons/fi'
import AIChatbot from '@/components/ai/AIChatbot'
import AIRecommendations from '@/components/ai/AIRecommendations'
import SmartBookingForm from '@/components/ai/SmartScheduling'

const AIDemoPage = () => {
    const [activeDemo, setActiveDemo] = useState<'chatbot' | 'recommendations' | 'scheduling'>('chatbot')

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        AI Features Demo
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Experience our advanced AI-powered features for gymnastics training
                    </p>
                </motion.div>

                {/* Demo Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
                        <button id="ai-demo-btn"
                            onClick={() => setActiveDemo('chatbot')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeDemo === 'chatbot'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FiMessageCircle className="inline mr-2" />
                            AI Chatbot
                        </button>
                        <button id="ai-demo-btn-2"
                            onClick={() => setActiveDemo('recommendations')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeDemo === 'recommendations'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FiStar className="inline mr-2" />
                            Recommendations
                        </button>
                        <button id="ai-demo-btn-3"
                            onClick={() => setActiveDemo('scheduling')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeDemo === 'scheduling'
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
                    {activeDemo === 'recommendations' && <AIRecommendations />}
                    {activeDemo === 'scheduling' && <SmartBookingForm />}
                </div>
            </div>
        </div>
    )
}

export default AIDemoPage
