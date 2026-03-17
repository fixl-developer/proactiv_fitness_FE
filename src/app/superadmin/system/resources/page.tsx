'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    HardDrive,
    RefreshCw,
    Download,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Server,
    Zap,
    Database
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { superAdminService } from '@/services/superAdminService'

interface ResourceUsage {
    name: string
    current: number
    max: number
    unit: string
    status: 'healthy' | 'warning' | 'critical'
    trend: number
}

export default function ResourceUsagePage() {
    const [resources, setResources] = useState<ResourceUsage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchResources()
    }, [])

    const fetchResources = async () => {
        try {
            setLoading(true)
            const data = await superAdminService.getResourceUsage()
            setResources(data)
        } catch (error) {
            console.error('Error fetching resources:', error)
            // Fallback mock data
            const mockResources: ResourceUsage[] = [
                {
                    name: 'CPU Cores',
                    current: 8,
                    max: 16,
                    unit: 'cores',
                    status: 'healthy',
                    trend: 2
                },
                {
                    name: 'Memory (RAM)',
                    current: 48,
                    max: 64,
                    unit: 'GB',
                    status: 'warning',
                    trend: 5
                },
                {
                    name: 'Storage',
                    current: 720,
                    max: 1000,
                    unit: 'GB',
                    status: 'healthy',
                    trend: 3
                },
                {
                    name: 'Network Bandwidth',
                    current: 450,
                    max: 1000,
                    unit: 'Mbps',
                    status: 'healthy',
                    trend: -2
                },
                {
                    name: 'Database Connections',
                    current: 85,
                    max: 100,
                    unit: 'connections',
                    status: 'warning',
                    trend: 4
                },
                {
                    name: 'API Requests/sec',
                    current: 1250,
                    max: 2000,
                    unit: 'req/s',
                    status: 'healthy',
                    trend: 1
                }
            ]
            setResources(mockResources)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'text-green-600 bg-green-50'
            case 'warning':
                return 'text-yellow-600 bg-yellow-50'
            case 'critical':
                return 'text-red-600 bg-red-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-100 text-green-800'
            case 'warning':
                return 'bg-yellow-100 text-yellow-800'
            case 'critical':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-600" />
            case 'critical':
                return <AlertTriangle className="w-5 h-5 text-red-600" />
            default:
                return <CheckCircle className="w-5 h-5 text-gray-600" />
        }
    }

    const chartData = resources.map(r => ({
        name: r.name.split(' ')[0],
        usage: Math.round((r.current / r.max) * 100)
    }))

    const trendData = [
        { time: '00:00', usage: 45 },
        { time: '04:00', usage: 42 },
        { time: '08:00', usage: 58 },
        { time: '12:00', usage: 72 },
        { time: '16:00', usage: 68 },
        { time: '20:00', usage: 55 },
        { time: '24:00', usage: 50 }
    ]

    const totalUsagePercent = Math.round(
        resources.reduce((sum, r) => sum + (r.current / r.max) * 100, 0) / resources.length
    )

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
                        <HardDrive className="w-8 h-8 mr-3 text-purple-600" />
                        Resource Usage
                    </h1>
                    <p className="text-gray-600 mt-1">System resource allocation and utilization</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={fetchResources}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Overall Usage */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Overall Resource Usage</p>
                            <p className="text-4xl font-bold text-purple-600 mt-2">{totalUsagePercent}%</p>
                            <p className="text-sm text-gray-600 mt-2">Average across all resources</p>
                        </div>
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#8b5cf6"
                                    strokeWidth="8"
                                    strokeDasharray={`${totalUsagePercent * 2.83} 283`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-purple-600">{totalUsagePercent}%</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Resource Usage Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage by Type</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="usage" fill="#8b5cf6" name="Usage %" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* Trend Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trend (24 Hours)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="usage" stroke="#8b5cf6" strokeWidth={2} name="Usage %" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* Resource Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Details</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                            </div>
                        ) : (
                            resources.map((resource, index) => (
                                <motion.div
                                    key={resource.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-4 rounded-lg border ${getStatusColor(resource.status)}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(resource.status)}
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{resource.name}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {resource.current} / {resource.max} {resource.unit}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(resource.status)}`}>
                                                {resource.status.toUpperCase()}
                                            </span>
                                            <p className={`text-sm font-medium mt-1 ${resource.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {resource.trend > 0 ? '↑' : '↓'} {Math.abs(resource.trend)}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${resource.status === 'healthy'
                                                ? 'bg-green-600'
                                                : resource.status === 'warning'
                                                    ? 'bg-yellow-600'
                                                    : 'bg-red-600'
                                                }`}
                                            style={{ width: `${(resource.current / resource.max) * 100}%` }}
                                        ></div>
                                    </div>

                                    <p className="text-xs text-gray-600 mt-2">
                                        {Math.round((resource.current / resource.max) * 100)}% utilized
                                    </p>
                                </motion.div>
                            ))
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* Recommendations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-900">Increase Memory Allocation</p>
                                <p className="text-sm text-yellow-700">Memory usage is at 75%, consider upgrading to 96GB</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-900">CPU Usage Optimal</p>
                                <p className="text-sm text-green-700">CPU usage is well-balanced, no action needed</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-900">Database Connections Near Limit</p>
                                <p className="text-sm text-yellow-700">Consider implementing connection pooling</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
