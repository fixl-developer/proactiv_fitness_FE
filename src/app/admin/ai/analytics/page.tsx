'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Brain, MessageSquare, TrendingUp, Users, Clock, Target,
    BarChart3, Activity, Zap, AlertCircle, CheckCircle,
    RefreshCw, Download, Filter, Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const AIAnalyticsPage = () => {
    const [selectedTimeRange, setSelectedTimeRange] = useState('7d')

    // AI Analytics data
    const aiMetrics = {
        totalInteractions: 2847,
        successfulResolutions: 2156,
        handoverRate: 24.3,
        avgResponseTime: 1.2,
        userSatisfaction: 4.2,
        topIntents: [
            { intent: 'Class Booking', count: 856, percentage: 30.1 },
            { intent: 'Schedule Inquiry', count: 623, percentage: 21.9 },
            { intent: 'Payment Help', count: 445, percentage: 15.6 },
            { intent: 'General Info', count: 398, percentage: 14.0 },
            { intent: 'Cancellation', count: 267, percentage: 9.4 }
        ],
        conversationFlow: [
            { step: 'Greeting', completion: 98.5 },
            { step: 'Intent Recognition', completion: 89.2 },
            { step: 'Information Gathering', completion: 76.8 },
            { step: 'Solution Provided', completion: 68.4 },
            { step: 'User Satisfaction', completion: 61.2 }
        ],
        performanceByHour: [
            { hour: '00:00', interactions: 12, success: 91.7 },
            { hour: '06:00', interactions: 45, success: 88.9 },
            { hour: '09:00', interactions: 156, success: 92.3 },
            { hour: '12:00', interactions: 234, success: 89.7 },
            { hour: '15:00', interactions: 298, success: 91.6 },
            { hour: '18:00', interactions: 387, success: 88.4 },
            { hour: '21:00', interactions: 189, success: 90.5 }
        ]
    }

    const getSuccessRateColor = (rate: number) => {
        if (rate >= 90) return 'text-green-600'
        if (rate >= 80) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getIntentColor = (index: number) => {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500']
        return colors[index] || 'bg-gray-500'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Analytics</h1>
                    <p className="text-gray-600 mt-2">Monitor AI chatbot performance and user interactions</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 flex-1 sm:flex-none">
                        {['24h', '7d', '30d'].map((range) => (
                            <button
                                id={`admin-ai-analytics-timerange-${range}-btn`}
                                key={range}
                                onClick={() => setSelectedTimeRange(range)}
                                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${selectedTimeRange === range
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <Button id="admin-ai-analytics-refresh-btn" variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button id="admin-ai-analytics-export-btn" variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Interactions</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{aiMetrics.totalInteractions.toLocaleString()}</p>
                            </div>
                            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-green-600 font-medium">+12.5%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                    {((aiMetrics.successfulResolutions / aiMetrics.totalInteractions) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-green-600 font-medium">+3.2%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Handover Rate</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{aiMetrics.handoverRate}%</p>
                            </div>
                            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 text-red-500 mr-1 rotate-180" />
                            <span className="text-red-600 font-medium">-1.8%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{aiMetrics.avgResponseTime}s</p>
                            </div>
                            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1 rotate-180" />
                            <span className="text-green-600 font-medium">-0.3s</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900">{aiMetrics.userSatisfaction}/5</p>
                            </div>
                            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-green-600 font-medium">+0.2</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Intents */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-600" />
                            Top User Intents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {aiMetrics.topIntents.map((intent, index) => (
                                <div key={intent.intent} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">{intent.intent}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">{intent.count}</span>
                                            <span className="text-xs text-gray-500">({intent.percentage}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getIntentColor(index)}`}
                                            style={{ width: `${intent.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Conversation Flow */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Conversation Flow
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {aiMetrics.conversationFlow.map((step, index) => (
                                <div key={step.step} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">{step.step}</span>
                                        <span className={`text-sm font-medium ${getSuccessRateColor(step.completion)}`}>
                                            {step.completion}%
                                        </span>
                                    </div>
                                    <Progress value={step.completion} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance by Hour */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        Performance by Hour
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                        {aiMetrics.performanceByHour.map((hour, index) => (
                            <motion.div
                                key={hour.hour}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gray-50 rounded-lg p-4 text-center"
                            >
                                <div className="text-sm font-medium text-gray-600 mb-2">{hour.hour}</div>
                                <div className="text-lg font-bold text-gray-900 mb-1">{hour.interactions}</div>
                                <div className="text-xs text-gray-500 mb-2">interactions</div>
                                <div className={`text-sm font-medium ${getSuccessRateColor(hour.success)}`}>
                                    {hour.success}% success
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Issues */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        Recent Issues & Improvements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            {
                                type: 'issue',
                                title: 'High handover rate for payment queries',
                                description: 'Users frequently need human assistance for complex payment issues',
                                priority: 'high',
                                time: '2 hours ago'
                            },
                            {
                                type: 'improvement',
                                title: 'Added new training data for class scheduling',
                                description: 'Improved intent recognition for scheduling-related queries',
                                priority: 'medium',
                                time: '1 day ago'
                            },
                            {
                                type: 'issue',
                                title: 'Slow response times during peak hours',
                                description: 'Response times increase significantly between 6-8 PM',
                                priority: 'medium',
                                time: '2 days ago'
                            }
                        ].map((item, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`w-2 h-2 rounded-full mt-2 ${item.type === 'issue' ? 'bg-red-500' : 'bg-green-500'
                                    }`} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                                        <Badge className={
                                            item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                        }>
                                            {item.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                                    <p className="text-xs text-gray-500">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AIAnalyticsPage
