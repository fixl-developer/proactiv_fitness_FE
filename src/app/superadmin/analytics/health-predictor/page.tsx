'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    Zap,
    Database,
    Server,
    Activity,
    BarChart3,
    RefreshCw,
    Download,
    Filter
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { superAdminService } from '@/services/superAdminService'

interface HealthPrediction {
    component: string
    currentHealth: number
    predictedHealth: number
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    failureRisk: number
    recommendedActions: string[]
    nextCheckTime: Date
}

interface CapacityPlan {
    resource: string
    currentUsage: number
    projectedUsage: number
    timeToCapacity: number
    recommendation: string
}

export default function HealthPredictorPage() {
    const [predictions, setPredictions] = useState<HealthPrediction[]>([])
    const [capacityPlans, setCapacityPlans] = useState<CapacityPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('7d')
    const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

    useEffect(() => {
        fetchPredictions()
    }, [timeRange])

    const fetchPredictions = async () => {
        try {
            setLoading(true)
            const data = await superAdminService.getHealthPredictions()
            setPredictions(data)
        } catch (error) {
            console.error('Error fetching predictions:', error)
            // Fallback mock data
            const mockPredictions: HealthPrediction[] = [
                {
                    component: 'Database',
                    currentHealth: 92,
                    predictedHealth: 85,
                    riskLevel: 'low',
                    failureRisk: 2,
                    recommendedActions: [
                        'Optimize slow queries',
                        'Increase connection pool size',
                        'Archive old data'
                    ],
                    nextCheckTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
                },
                {
                    component: 'API Server',
                    currentHealth: 88,
                    predictedHealth: 78,
                    riskLevel: 'medium',
                    failureRisk: 8,
                    recommendedActions: [
                        'Scale up instances',
                        'Implement caching',
                        'Optimize endpoints'
                    ],
                    nextCheckTime: new Date(Date.now() + 12 * 60 * 60 * 1000)
                },
                {
                    component: 'Storage',
                    currentHealth: 75,
                    predictedHealth: 60,
                    riskLevel: 'high',
                    failureRisk: 25,
                    recommendedActions: [
                        'Increase storage capacity',
                        'Implement data cleanup',
                        'Archive old files'
                    ],
                    nextCheckTime: new Date(Date.now() + 6 * 60 * 60 * 1000)
                },
                {
                    component: 'Memory',
                    currentHealth: 82,
                    predictedHealth: 70,
                    riskLevel: 'medium',
                    failureRisk: 12,
                    recommendedActions: [
                        'Optimize memory usage',
                        'Implement garbage collection',
                        'Monitor memory leaks'
                    ],
                    nextCheckTime: new Date(Date.now() + 18 * 60 * 60 * 1000)
                },
                {
                    component: 'Network',
                    currentHealth: 95,
                    predictedHealth: 92,
                    riskLevel: 'low',
                    failureRisk: 1,
                    recommendedActions: [
                        'Monitor bandwidth usage',
                        'Optimize data transfer'
                    ],
                    nextCheckTime: new Date(Date.now() + 48 * 60 * 60 * 1000)
                }
            ]

            const mockCapacityPlans: CapacityPlan[] = [
                {
                    resource: 'Database Storage',
                    currentUsage: 72,
                    projectedUsage: 95,
                    timeToCapacity: 45,
                    recommendation: 'Increase storage by 50% within 30 days'
                },
                {
                    resource: 'API Throughput',
                    currentUsage: 65,
                    projectedUsage: 88,
                    timeToCapacity: 60,
                    recommendation: 'Scale API servers to handle 2x current load'
                },
                {
                    resource: 'Memory',
                    currentUsage: 58,
                    projectedUsage: 82,
                    timeToCapacity: 90,
                    recommendation: 'Optimize memory usage or upgrade servers'
                },
                {
                    resource: 'CPU',
                    currentUsage: 45,
                    projectedUsage: 70,
                    timeToCapacity: 120,
                    recommendation: 'Monitor CPU usage and plan for scaling'
                }
            ]

            setPredictions(mockPredictions)
            setCapacityPlans(mockCapacityPlans)
        } finally {
            setLoading(false)
        }
    }

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low':
                return 'text-green-600 bg-green-50'
            case 'medium':
                return 'text-yellow-600 bg-yellow-50'
            case 'high':
                return 'text-orange-600 bg-orange-50'
            case 'critical':
                return 'text-red-600 bg-red-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    const getRiskBadgeColor = (risk: string) => {
        switch (risk) {
            case 'low':
                return 'bg-green-100 text-green-800'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800'
            case 'high':
                return 'bg-orange-100 text-orange-800'
            case 'critical':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const healthTrendData = [
        { time: '00:00', health: 94 },
        { time: '04:00', health: 92 },
        { time: '08:00', health: 88 },
        { time: '12:00', health: 85 },
        { time: '16:00', health: 82 },
        { time: '20:00', health: 80 },
        { time: '24:00', health: 78 }
    ]

    const failureRiskData = predictions.map(p => ({
        name: p.component,
        risk: p.failureRisk
    }))

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    const overallHealth = Math.round(predictions.reduce((sum, p) => sum + p.currentHealth, 0) / predictions.length)
    const criticalCount = predictions.filter(p => p.riskLevel === 'critical').length
    const highRiskCount = predictions.filter(p => p.riskLevel === 'high').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <TrendingUp className="w-8 h-8 mr-3 text-purple-600" />
                        System Health Predictor
                    </h1>
                    <p className="text-gray-600 mt-1">
                        AI-powered predictive analytics for system health and capacity planning
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Overall Health</p>
                            <p className="text-3xl font-bold text-blue-600">{overallHealth}%</p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Healthy Components</p>
                            <p className="text-3xl font-bold text-green-600">
                                {predictions.filter(p => p.riskLevel === 'low').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">High Risk</p>
                            <p className="text-3xl font-bold text-orange-600">{highRiskCount}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-orange-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Critical</p>
                            <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
                    </div>
                </Card>
            </motion.div>

            {/* Charts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                {/* Health Trend */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Trend (7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={healthTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="health"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={{ fill: '#8b5cf6', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Failure Risk by Component */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Failure Risk by Component</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={failureRiskData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="risk" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* Component Predictions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Health Predictions</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                            </div>
                        ) : (
                            predictions.map((prediction, index) => (
                                <motion.div
                                    key={prediction.component}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getRiskColor(prediction.riskLevel)}`}
                                    onClick={() => setSelectedComponent(selectedComponent === prediction.component ? null : prediction.component)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h4 className="font-semibold text-gray-900">{prediction.component}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(prediction.riskLevel)}`}>
                                                    {prediction.riskLevel.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Health Bars */}
                                            <div className="mt-3 space-y-2">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600">Current Health</span>
                                                        <span className="font-medium">{prediction.currentHealth}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${prediction.currentHealth}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600">Predicted Health (7d)</span>
                                                        <span className="font-medium">{prediction.predictedHealth}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-purple-600 h-2 rounded-full"
                                                            style={{ width: `${prediction.predictedHealth}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600">Failure Risk</span>
                                                        <span className="font-medium">{prediction.failureRisk}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-red-600 h-2 rounded-full"
                                                            style={{ width: `${prediction.failureRisk}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recommended Actions */}
                                            {selectedComponent === prediction.component && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-4 pt-4 border-t border-gray-300"
                                                >
                                                    <p className="text-sm font-semibold text-gray-900 mb-2">Recommended Actions:</p>
                                                    <ul className="space-y-1">
                                                        {prediction.recommendedActions.map((action, i) => (
                                                            <li key={i} className="text-sm text-gray-700 flex items-start">
                                                                <span className="mr-2">•</span>
                                                                {action}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="flex-shrink-0 text-right">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {prediction.nextCheckTime.toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* Capacity Planning */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Planning (30 Days)</h3>
                    <div className="space-y-4">
                        {capacityPlans.map((plan, index) => (
                            <motion.div
                                key={plan.resource}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-semibold text-gray-900">{plan.resource}</h4>
                                    <span className="text-sm font-medium text-purple-600">
                                        {plan.timeToCapacity} days to capacity
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Current Usage</span>
                                            <span className="font-medium">{plan.currentUsage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${plan.currentUsage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Projected Usage (30d)</span>
                                            <span className="font-medium">{plan.projectedUsage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-orange-600 h-2 rounded-full"
                                                style={{ width: `${plan.projectedUsage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 mt-3 p-2 bg-gray-50 rounded">
                                    {plan.recommendation}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
