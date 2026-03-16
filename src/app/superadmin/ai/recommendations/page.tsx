'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle,
    Zap, Database, Users, Shield, RefreshCw, ArrowRight,
    Clock, Target, Gauge, Cpu, HardDrive, Wifi
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AIRecommendationsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [recommendations, setRecommendations] = useState<any[]>([])
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // Mock AI recommendations
                const mockRecommendations = [
                    {
                        id: '1',
                        title: 'Optimize Database Queries',
                        description: 'AI detected 15 slow queries that can be optimized',
                        impact: 'high',
                        priority: 'critical',
                        estimatedSavings: '35% faster queries',
                        confidence: 0.95,
                        category: 'performance',
                        actions: ['Review slow queries', 'Add indexes', 'Optimize joins']
                    },
                    {
                        id: '2',
                        title: 'Scale API Servers',
                        description: 'Predicted traffic spike in next 7 days',
                        impact: 'high',
                        priority: 'high',
                        estimatedSavings: 'Prevent 99.9% downtime',
                        confidence: 0.88,
                        category: 'scaling',
                        actions: ['Add 2 more servers', 'Configure load balancer', 'Test failover']
                    },
                    {
                        id: '3',
                        title: 'Implement Caching Strategy',
                        description: 'Cache hit rate is only 12%, can be improved to 65%',
                        impact: 'medium',
                        priority: 'high',
                        estimatedSavings: '40% reduction in database load',
                        confidence: 0.92,
                        category: 'optimization',
                        actions: ['Implement Redis', 'Configure TTL', 'Monitor hit rate']
                    },
                    {
                        id: '4',
                        title: 'Security Hardening',
                        description: 'Detected potential security vulnerabilities',
                        impact: 'critical',
                        priority: 'critical',
                        estimatedSavings: 'Prevent security breaches',
                        confidence: 0.98,
                        category: 'security',
                        actions: ['Update dependencies', 'Enable WAF', 'Implement 2FA']
                    },
                    {
                        id: '5',
                        title: 'Cost Optimization',
                        description: 'Identified unused resources costing $2,400/month',
                        impact: 'medium',
                        priority: 'medium',
                        estimatedSavings: '$2,400/month savings',
                        confidence: 0.85,
                        category: 'cost',
                        actions: ['Remove unused instances', 'Optimize storage', 'Review licenses']
                    },
                    {
                        id: '6',
                        title: 'Improve User Experience',
                        description: 'Page load time can be reduced by 2.5 seconds',
                        impact: 'medium',
                        priority: 'medium',
                        estimatedSavings: '25% faster page loads',
                        confidence: 0.90,
                        category: 'ux',
                        actions: ['Optimize images', 'Minify CSS/JS', 'Enable compression']
                    }
                ]
                setRecommendations(mockRecommendations)
            } catch (error) {
                console.error('Error fetching recommendations:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRecommendations()
    }, [])

    const handleRefresh = async () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 2000)
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'critical': return <Badge className="bg-red-100 text-red-800">Critical</Badge>
            case 'high': return <Badge className="bg-orange-100 text-orange-800">High</Badge>
            case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
            case 'low': return <Badge className="bg-green-100 text-green-800">Low</Badge>
            default: return <Badge variant="outline">{priority}</Badge>
        }
    }

    const getImpactIcon = (impact: string) => {
        switch (impact) {
            case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />
            case 'high': return <TrendingUp className="w-5 h-5 text-orange-600" />
            case 'medium': return <Gauge className="w-5 h-5 text-yellow-600" />
            default: return <CheckCircle className="w-5 h-5 text-green-600" />
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'performance': return <Cpu className="w-4 h-4" />
            case 'scaling': return <Database className="w-4 h-4" />
            case 'optimization': return <Zap className="w-4 h-4" />
            case 'security': return <Shield className="w-4 h-4" />
            case 'cost': return <TrendingUp className="w-4 h-4" />
            case 'ux': return <Users className="w-4 h-4" />
            default: return <Lightbulb className="w-4 h-4" />
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading AI Recommendations...</p>
                </div>
            </div>
        )
    }

    const criticalCount = recommendations.filter(r => r.priority === 'critical').length
    const highCount = recommendations.filter(r => r.priority === 'high').length
    const avgConfidence = (recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length * 100).toFixed(1)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Brain className="w-8 h-8 mr-3 text-blue-600" />
                        AI-Powered Recommendations
                    </h1>
                    <p className="text-gray-600 mt-1">Machine learning insights for system optimization</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        variant="outline"
                        className="flex items-center"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-blue-600">AI-generated insights</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-red-600">Require immediate action</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{highCount}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-orange-600">Should be addressed soon</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{avgConfidence}%</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">AI accuracy score</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
                {recommendations.map((rec, index) => (
                    <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            {getImpactIcon(rec.impact)}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getPriorityBadge(rec.priority)}
                                            <Badge variant="outline" className="flex items-center space-x-1">
                                                {getCategoryIcon(rec.category)}
                                                <span>{rec.category}</span>
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Confidence */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">AI Confidence</span>
                                            <span className="text-sm text-gray-600">{(rec.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                        <Progress value={rec.confidence * 100} className="h-2" />
                                    </div>

                                    {/* Estimated Savings */}
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-900">
                                            <span className="font-semibold">Estimated Impact:</span> {rec.estimatedSavings}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700">Recommended Actions:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.actions.map((action: string, idx: number) => (
                                                <Badge key={idx} variant="outline" className="bg-gray-50">
                                                    {action}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-3 pt-2">
                                        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center">
                                            <ArrowRight className="w-4 h-4 mr-2" />
                                            Implement
                                        </Button>
                                        <Button variant="outline">Learn More</Button>
                                        <Button variant="ghost">Dismiss</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
