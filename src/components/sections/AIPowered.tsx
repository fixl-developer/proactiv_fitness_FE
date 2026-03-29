'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, MessageSquare, Target, TrendingUp, Zap, Shield, Utensils } from 'lucide-react'
import { useCMSData } from '@/hooks/useCMSData'
import { CMSService, AIFeatureData } from '@/services/cmsService'

const staticAIFeatures = [
    {
        icon: MessageSquare,
        title: 'AI Chatbot Assistant',
        description: 'Chat with our intelligent AI assistant 24/7 for instant help with bookings, program information, and scheduling.',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
    },
    {
        icon: Target,
        title: 'Personalized Coaching',
        description: 'AI analyzes each student\'s performance and generates custom training plans with specific drills and milestones.',
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50',
    },
    {
        icon: Utensils,
        title: 'Smart Nutrition Plans',
        description: 'AI creates age-appropriate meal plans, grocery lists, and kid-friendly recipes tailored to your young athlete.',
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50',
    },
    {
        icon: TrendingUp,
        title: 'Progress Predictions',
        description: 'AI tracks performance trends and predicts growth trajectory so you can see real improvement over time.',
        color: 'from-orange-500 to-red-500',
        bgColor: 'bg-orange-50',
    },
    {
        icon: Shield,
        title: 'Form Analysis & Safety',
        description: 'AI evaluates exercise form to identify correction needs and prevent injuries before they happen.',
        color: 'from-red-500 to-pink-500',
        bgColor: 'bg-red-50',
    },
    {
        icon: Zap,
        title: 'Smart Automation',
        description: 'Automated reminders, intelligent scheduling, and workflow management powered by AI for seamless operations.',
        color: 'from-yellow-500 to-orange-500',
        bgColor: 'bg-yellow-50',
    },
]

export default function AIPowered() {
    const { data: dynamicFeatures } = useCMSData<AIFeatureData[]>(
        () => CMSService.getAIFeatures(),
        [],
        []
    )

    const iconMap: Record<string, any> = {
        MessageSquare, Target, Utensils, TrendingUp, Shield, Zap, Brain, Sparkles,
    }

    const features = dynamicFeatures.length > 0
        ? dynamicFeatures.map(f => ({
            icon: iconMap[f.icon] || Brain,
            title: f.title,
            description: f.description,
            color: f.color,
            bgColor: f.bgColor,
        }))
        : staticAIFeatures

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <Brain className="w-4 h-4" />
                        Powered by AI
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Intelligent Fitness Platform
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Our AI technology personalizes every aspect of your child&apos;s fitness journey — from coaching and nutrition to progress tracking and safety.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
                            >
                                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6 text-gray-700" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        All AI features are included with every membership
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
