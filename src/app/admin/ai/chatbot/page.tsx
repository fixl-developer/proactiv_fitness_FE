'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    MessageSquare, Bot, Settings, TrendingUp, Users, Clock,
    CheckCircle, AlertTriangle, Play, Pause, Edit, Eye,
    BarChart3, MessageCircle, Zap, Brain, RefreshCw, Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const ChatbotManagementPage = () => {
    const [selectedBot, setSelectedBot] = useState<string>('main')

    // Chatbot configurations
    const chatbots = [
        {
            id: 'main',
            name: 'ProGym Assistant',
            status: 'active',
            type: 'customer_support',
            description: 'Main customer support chatbot for website visitors',
            language: 'English/Cantonese',
            lastUpdated: '2024-01-20',
            version: '2.1.4',
            confidence: 87.5,
            handoverRate: 12.3,
            responseTime: 1.2,
            dailyInteractions: 156,
            monthlyInteractions: 4680,
            satisfactionScore: 4.2,
            knowledgeBase: 'General FAQ + Class Info',
            integrations: ['Website', 'WhatsApp', 'Facebook Messenger']
        },
        {
            id: 'booking',
            name: 'Booking Assistant',
            status: 'active',
            type: 'booking_support',
            description: 'Specialized bot for class bookings and scheduling',
            language: 'English/Cantonese',
            lastUpdated: '2024-01-18',
            version: '1.8.2',
            confidence: 92.1,
            handoverRate: 8.7,
            responseTime: 0.9,
            dailyInteractions: 89,
            monthlyInteractions: 2670,
            satisfactionScore: 4.5,
            knowledgeBase: 'Booking Rules + Schedule Data',
            integrations: ['Booking System', 'Calendar API']
        },
        {
            id: 'assessment',
            name: 'Assessment Guide',
            status: 'testing',
            type: 'assessment_support',
            description: 'Guides parents through assessment booking process',
            language: 'English',
            lastUpdated: '2024-01-22',
            version: '0.9.1',
            confidence: 78.3,
            handoverRate: 25.4,
            responseTime: 1.8,
            dailyInteractions: 23,
            monthlyInteractions: 690,
            satisfactionScore: 3.9,
            knowledgeBase: 'Assessment FAQ + Location Info',
            integrations: ['Assessment Form', 'Location API']
        }
    ]

    // Conversation analytics
    const conversationData = {
        totalConversations: 7340,
        resolvedByBot: 6420,
        handedToHuman: 920,
        avgConversationLength: 4.2,
        topIntents: [
            { intent: 'Class Inquiry', count: 1890, percentage: 25.7 },
            { intent: 'Booking Help', count: 1468, percentage: 20.0 },
            { intent: 'Location Info', count: 1101, percentage: 15.0 },
            { intent: 'Pricing Questions', count: 881, percentage: 12.0 },
            { intent: 'Assessment Booking', count: 734, percentage: 10.0 },
            { intent: 'Other', count: 1266, percentage: 17.3 }
        ],
        commonQuestions: [
            { question: 'What are your class timings?', frequency: 234 },
            { question: 'How much do classes cost?', frequency: 189 },
            { question: 'Where are your locations?', frequency: 167 },
            { question: 'How to book a trial class?', frequency: 145 },
            { question: 'What age groups do you accept?', frequency: 123 }
        ]
    }

    // Recent conversations
    const recentConversations = [
        {
            id: 1,
            timestamp: '2024-01-25 14:30',
            user: 'Parent (Anonymous)',
            bot: 'ProGym Assistant',
            status: 'resolved',
            intent: 'Class Inquiry',
            messages: 6,
            satisfaction: 5,
            handover: false,
            summary: 'Asked about GYMTOTS classes for 4-year-old, provided schedule and pricing'
        },
        {
            id: 2,
            timestamp: '2024-01-25 13:45',
            user: 'Mrs. Chen',
            bot: 'Booking Assistant',
            status: 'handed_over',
            intent: 'Booking Help',
            messages: 8,
            satisfaction: null,
            handover: true,
            summary: 'Complex scheduling conflict, needed human intervention'
        },
        {
            id: 3,
            timestamp: '2024-01-25 12:20',
            user: 'Parent (Anonymous)',
            bot: 'Assessment Guide',
            status: 'resolved',
            intent: 'Assessment Booking',
            messages: 4,
            satisfaction: 4,
            handover: false,
            summary: 'Successfully guided through assessment booking process'
        },
        {
            id: 4,
            timestamp: '2024-01-25 11:15',
            user: 'Mr. Wong',
            bot: 'ProGym Assistant',
            status: 'abandoned',
            intent: 'Pricing Questions',
            messages: 3,
            satisfaction: null,
            handover: false,
            summary: 'Asked about pricing but left before completion'
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'text-green-600 bg-green-50 border-green-200',
            testing: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            inactive: 'text-red-600 bg-red-50 border-red-200',
            maintenance: 'text-gray-600 bg-gray-50 border-gray-200'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getConversationStatusColor = (status: string) => {
        const colors = {
            resolved: 'text-green-600 bg-green-50',
            handed_over: 'text-orange-600 bg-orange-50',
            abandoned: 'text-red-600 bg-red-50',
            in_progress: 'text-blue-600 bg-blue-50'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const selectedBotData = chatbots.find(bot => bot.id === selectedBot) || chatbots[0]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Chatbot Management</h1>
                    <p className="text-gray-600 mt-2">Manage AI chatbots and conversation analytics</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Bot
                    </Button>
                    <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Data
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Conversations</CardTitle>
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{conversationData.totalConversations.toLocaleString()}</div>
                        <div className="text-sm text-blue-600 font-medium">This month</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Bot Resolution Rate</CardTitle>
                        <Bot className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {((conversationData.resolvedByBot / conversationData.totalConversations) * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                            {conversationData.resolvedByBot} resolved
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Human Handover</CardTitle>
                        <Users className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {((conversationData.handedToHuman / conversationData.totalConversations) * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-orange-600 font-medium">
                            {conversationData.handedToHuman} escalated
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg Conversation</CardTitle>
                        <Clock className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{conversationData.avgConversationLength}</div>
                        <div className="text-sm text-purple-600 font-medium">messages per chat</div>
                    </CardContent>
                </Card>
            </div>

            {/* Chatbot Selection & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bot Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Chatbots</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {chatbots.map((bot, index) => (
                                <motion.div
                                    key={bot.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedBot === bot.id
                                        ? 'bg-blue-50 border-2 border-blue-200'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    onClick={() => setSelectedBot(bot.id)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">{bot.name}</h4>
                                        <Badge className={getStatusColor(bot.status)}>
                                            {bot.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{bot.description}</p>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>v{bot.version}</span>
                                        <span>{bot.dailyInteractions} today</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Selected Bot Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{selectedBotData.name}</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configure
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Performance Metrics */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Confidence Score</span>
                                            <span className="font-medium">{selectedBotData.confidence}%</span>
                                        </div>
                                        <Progress value={selectedBotData.confidence} className="h-2" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Handover Rate</span>
                                            <div className="font-medium">{selectedBotData.handoverRate}%</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Response Time</span>
                                            <div className="font-medium">{selectedBotData.responseTime}s</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Daily Chats</span>
                                            <div className="font-medium">{selectedBotData.dailyInteractions}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Satisfaction</span>
                                            <div className="font-medium">{selectedBotData.satisfactionScore}/5.0</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Configuration Details */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Configuration</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="font-medium">{selectedBotData.type.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Language:</span>
                                        <span className="font-medium">{selectedBotData.language}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Version:</span>
                                        <span className="font-medium">v{selectedBotData.version}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Updated:</span>
                                        <span className="font-medium">{selectedBotData.lastUpdated}</span>
                                    </div>
                                    <div className="mt-3">
                                        <span className="text-gray-600">Knowledge Base:</span>
                                        <div className="font-medium mt-1">{selectedBotData.knowledgeBase}</div>
                                    </div>
                                    <div className="mt-3">
                                        <span className="text-gray-600">Integrations:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {selectedBotData.integrations.map((integration, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                    {integration}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics & Recent Conversations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Intents */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            Top Conversation Intents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {conversationData.topIntents.map((intent, index) => (
                                <motion.div
                                    key={intent.intent}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">{intent.intent}</span>
                                        <span className="text-sm text-gray-600">{intent.count}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={intent.percentage} className="flex-1 h-2" />
                                        <span className="text-sm text-gray-600 w-12">{intent.percentage}%</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Conversations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                            Recent Conversations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {recentConversations.map((conversation, index) => (
                                <motion.div
                                    key={conversation.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{conversation.user}</span>
                                            <Badge className={getConversationStatusColor(conversation.status)}>
                                                {conversation.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">{conversation.summary}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>{conversation.bot} • {conversation.messages} messages</span>
                                        {conversation.satisfaction && (
                                            <span className="flex items-center gap-1">
                                                <span>⭐ {conversation.satisfaction}/5</span>
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Common Questions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        Most Common Questions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {conversationData.commonQuestions.map((question, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-medium text-gray-900 flex-1">{question.question}</p>
                                    <Badge variant="secondary" className="ml-2">
                                        {question.frequency}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="text-xs h-6">
                                        <Eye className="w-3 h-3 mr-1" />
                                        View Responses
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-xs h-6">
                                        <Edit className="w-3 h-3 mr-1" />
                                        Improve
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>)
}

export default ChatbotManagementPage
