'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    MessageSquare, Bot, TrendingUp, Users, Clock,
    Settings, BarChart3, Zap, Brain, Target,
    ArrowRight, ExternalLink, RefreshCw, AlertCircle,
    Sparkles, Loader2
} from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { responsiveClasses } from '@/lib/responsiveClasses'

const AIManagementPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [aiData, setAiData] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const loadAiInsights = async () => {
        try {
            setAiLoading(true)
            const [insightsRes, predictionsRes] = await Promise.allSettled([
                apiClient.get<any>('/advanced-analytics/insights'),
                apiClient.get<any>('/advanced-analytics/predictive/ai-system'),
            ])

            const insights = insightsRes.status === 'fulfilled' ? insightsRes.value?.data : null
            const predictions = predictionsRes.status === 'fulfilled' ? predictionsRes.value?.data : null

            setAiData({
                metrics: {
                    chatbotInteractions: insights?.totalInteractions || predictions?.predictions?.revenueProjection ? Math.round((predictions?.predictions?.revenueProjection || 0) / 10) : null,
                    resolutionRate: insights?.successfulResolutions && insights?.totalInteractions
                        ? Math.round((insights.successfulResolutions / insights.totalInteractions) * 1000) / 10
                        : null,
                    avgResponseTime: insights?.avgResponseTime || null,
                    humanHandovers: insights?.handoverRate || null,
                },
                insights: insights?.insights || predictions?.actionItems?.map((item: string) => ({
                    title: item,
                    description: predictions?.reasoning || '',
                    score: predictions?.confidence || null,
                })) || [],
                aiPowered: insights?.aiPowered || predictions?.aiPowered || false,
            })
        } catch (err) {
            console.error('Failed to load AI insights:', err)
        } finally {
            setAiLoading(false)
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            if (!isAuthenticated) {
                window.location.href = '/login'
                return
            }
        }
        loadAiInsights()
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Build metrics from live data with graceful fallback
    const aiMetrics = [
        {
            title: 'Chatbot Interactions',
            value: aiData?.metrics?.chatbotInteractions?.toLocaleString() || '---',
            growth: aiData?.aiPowered ? 'AI Active' : 'Loading...',
            icon: MessageSquare,
            color: 'text-blue-600',
            status: 'excellent'
        },
        {
            title: 'Resolution Rate',
            value: aiData?.metrics?.resolutionRate ? `${aiData.metrics.resolutionRate}%` : '---',
            growth: aiData?.aiPowered ? 'AI Active' : 'Loading...',
            icon: Target,
            color: 'text-green-600',
            status: 'excellent'
        },
        {
            title: 'Avg Response Time',
            value: aiData?.metrics?.avgResponseTime ? `${aiData.metrics.avgResponseTime}s` : '---',
            growth: aiData?.aiPowered ? 'AI Active' : 'Loading...',
            icon: Clock,
            color: 'text-purple-600',
            status: 'excellent'
        },
        {
            title: 'Human Handovers',
            value: aiData?.metrics?.humanHandovers ? `${aiData.metrics.humanHandovers}%` : '---',
            growth: aiData?.aiPowered ? 'AI Active' : 'Loading...',
            icon: Users,
            color: 'text-orange-600',
            status: (aiData?.metrics?.humanHandovers || 0) > 20 ? 'needs-attention' : 'excellent'
        }
    ]

    // AI System Components
    const aiSystems = [
        {
            name: 'Customer Chatbot',
            description: 'Handles customer inquiries and bookings',
            status: 'operational',
            usage: 85,
            href: '/admin/ai/chatbot'
        },
        {
            name: 'SOP Assistant',
            description: 'Guides staff through standard procedures',
            status: 'operational',
            usage: 72,
            href: '/admin/ai/sop'
        }
    ]

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>AI Management Center</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Monitor and manage AI-powered systems
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button id="admin-ai-refresh-btn" variant="outline" size="sm" onClick={loadAiInsights} disabled={aiLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${aiLoading ? 'animate-spin' : ''}`} />
                        {aiLoading ? 'Loading...' : 'Refresh'}
                    </Button>
                    <Button id="admin-ai-settings-btn">
                        <Settings className="w-4 h-4 mr-2" />
                        AI Settings
                    </Button>
                </div>
            </div>

            {/* AI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {aiMetrics.map((metric, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                        <Card className="relative overflow-hidden h-full hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">{metric.title}</CardTitle>
                                <metric.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${metric.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-gray-900">{metric.value}</div>
                                <div className="flex items-center mt-1">
                                    <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${metric.color} mr-1`} />
                                    <span className={`text-xs sm:text-sm font-medium ${metric.color}`}>{metric.growth}</span>
                                </div>
                                <Progress value={75} className="mt-3 h-1 sm:h-2" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* AI Systems */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {aiSystems.map((system, index) => (
                    <motion.div
                        key={system.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 * index }}
                    >
                        <Card id={`admin-ai-system-${system.name.toLowerCase().replace(/\s+/g, '-')}-card`} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = system.href}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Bot className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{system.name}</CardTitle>
                                            <p className="text-sm text-gray-600">{system.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={system.status === 'operational' ? 'default' : 'destructive'}>
                                            {system.status}
                                        </Badge>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Usage</span>
                                            <span className="text-sm font-bold">{system.usage}%</span>
                                        </div>
                                        <Progress value={system.usage} className="h-2" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Button id={`admin-ai-${system.name.toLowerCase().replace(/\s+/g, '-')}-analytics-btn`} variant="outline" size="sm">
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            Analytics
                                        </Button>
                                        <Button id={`admin-ai-${system.name.toLowerCase().replace(/\s+/g, '-')}-configure-btn`} variant="outline" size="sm">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configure
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* AI Powered Insights */}
            <Card className="relative overflow-hidden border-purple-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full -mr-32 -mt-32"></div>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle>AI Insights</CardTitle>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Powered
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {aiLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
                            <span className="text-gray-600">Analyzing AI system performance...</span>
                        </div>
                    ) : aiData?.insights ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(aiData.insights || []).map((insight: any, idx: number) => (
                                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                                        <p className="text-sm font-semibold text-purple-900">{insight.title || 'Insight'}</p>
                                        <p className="text-xs text-purple-700 mt-1">{insight.description || insight.message || 'No details'}</p>
                                        {insight.score != null && (
                                            <div className="mt-2">
                                                <Progress value={insight.score} className="h-1.5" />
                                                <span className="text-xs text-purple-600 mt-1">{insight.score}% confidence</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-300" />
                            <p className="text-sm">AI insights will appear here once data is available.</p>
                            <Button variant="outline" size="sm" className="mt-3" onClick={loadAiInsights}>
                                <RefreshCw className="w-3 h-3 mr-1" /> Retry
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>AI Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: Brain, label: 'Train Models', href: '/admin/ai/training' },
                            { icon: MessageSquare, label: 'Chatbot Config', href: '/admin/ai/chatbot' },
                            { icon: BarChart3, label: 'AI Analytics', href: '/admin/ai-analytics' },
                            { icon: Zap, label: 'Automation Rules', href: '/admin/ai/automation' }
                        ].map((action, index) => (
                            <Button
                                id={`admin-ai-quickaction-${action.label.toLowerCase().replace(/\s+/g, '-')}-btn`}
                                key={index}
                                className="h-20 flex-col gap-2"
                                variant="outline"
                                onClick={() => window.location.href = action.href}
                            >
                                <action.icon className="w-6 h-6" />
                                <span className="text-sm text-center">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AIManagementPage
