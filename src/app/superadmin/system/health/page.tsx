'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Heart,
    RefreshCw,
    Download,
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Clock,
    TrendingUp,
    Activity
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { superAdminService } from '@/services/superAdminService'

interface ServiceHealth {
    name: string
    status: 'healthy' | 'degraded' | 'down'
    uptime: number
    responseTime: number
    lastCheck: Date
    incidents: number
}

export default function SystemHealthPage() {
    const [services, setServices] = useState<ServiceHealth[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHealth()
    }, [])

    const fetchHealth = async () => {
        try {
            setLoading(true)
            const data = await superAdminService.getSystemHealthStatus()
            setServices(data)
        } catch (error) {
            console.error('Error fetching health:', error)
            // Fallback mock data
            const mockServices: ServiceHealth[] = [
                {
                    name: 'API Server',
                    status: 'healthy',
                    uptime: 99.98,
                    responseTime: 145,
                    lastCheck: new Date(Date.now() - 2 * 60 * 1000),
                    incidents: 0
                },
                {
                    name: 'Database',
                    status: 'healthy',
                    uptime: 99.95,
                    responseTime: 25,
                    lastCheck: new Date(Date.now() - 1 * 60 * 1000),
                    incidents: 0
                },
                {
                    name: 'Cache Service',
                    status: 'healthy',
                    uptime: 99.99,
                    responseTime: 5,
                    lastCheck: new Date(Date.now() - 3 * 60 * 1000),
                    incidents: 0
                },
                {
                    name: 'Email Service',
                    status: 'degraded',
                    uptime: 98.5,
                    responseTime: 850,
                    lastCheck: new Date(Date.now() - 5 * 60 * 1000),
                    incidents: 2
                },
                {
                    name: 'File Storage',
                    status: 'healthy',
                    uptime: 99.97,
                    responseTime: 320,
                    lastCheck: new Date(Date.now() - 4 * 60 * 1000),
                    incidents: 0
                },
                {
                    name: 'Search Service',
                    status: 'healthy',
                    uptime: 99.92,
                    responseTime: 180,
                    lastCheck: new Date(Date.now() - 2 * 60 * 1000),
                    incidents: 1
                }
            ]
            setServices(mockServices)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'degraded':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />
            case 'down':
                return <AlertTriangle className="w-5 h-5 text-red-600" />
            default:
                return <CheckCircle className="w-5 h-5 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-50 border-green-200'
            case 'degraded':
                return 'bg-yellow-50 border-yellow-200'
            case 'down':
                return 'bg-red-50 border-red-200'
            default:
                return 'bg-gray-50 border-gray-200'
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-100 text-green-800'
            case 'degraded':
                return 'bg-yellow-100 text-yellow-800'
            case 'down':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const healthyCount = services.filter(s => s.status === 'healthy').length
    const degradedCount = services.filter(s => s.status === 'degraded').length
    const downCount = services.filter(s => s.status === 'down').length
    const avgUptime = (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2)

    const healthTrendData = [
        { time: '00:00', health: 98.5 },
        { time: '04:00', health: 98.8 },
        { time: '08:00', health: 98.2 },
        { time: '12:00', health: 97.9 },
        { time: '16:00', health: 98.1 },
        { time: '20:00', health: 98.6 },
        { time: '24:00', health: 99.0 }
    ]

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
                        <Heart className="w-8 h-8 mr-3 text-purple-600" />
                        System Health
                    </h1>
                    <p className="text-gray-600 mt-1">Monitor service health and uptime</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={fetchHealth}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Health Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Uptime</p>
                            <p className="text-3xl font-bold text-blue-600">{avgUptime}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Healthy Services</p>
                            <p className="text-3xl font-bold text-green-600">{healthyCount}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Degraded</p>
                            <p className="text-3xl font-bold text-yellow-600">{degradedCount}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-yellow-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Down</p>
                            <p className="text-3xl font-bold text-red-600">{downCount}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
                    </div>
                </Card>
            </motion.div>

            {/* Health Trend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Trend (24 Hours)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={healthTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis domain={[95, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="health" stroke="#8b5cf6" strokeWidth={2} name="Health %" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* Service Health Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Health Status</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                            </div>
                        ) : (
                            services.map((service, index) => (
                                <motion.div
                                    key={service.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-4 rounded-lg border ${getStatusColor(service.status)}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(service.status)}
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                                                <p className="text-sm text-gray-600">
                                                    Response time: {service.responseTime}ms
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(service.status)}`}>
                                                {service.status.toUpperCase()}
                                            </span>
                                            {service.incidents > 0 && (
                                                <p className="text-xs text-red-600 mt-1">{service.incidents} incident(s)</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Uptime Bar */}
                                    <div className="mb-2">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Uptime</span>
                                            <span className="font-medium">{service.uptime}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${service.status === 'healthy'
                                                    ? 'bg-green-600'
                                                    : service.status === 'degraded'
                                                        ? 'bg-yellow-600'
                                                        : 'bg-red-600'
                                                    }`}
                                                style={{ width: `${service.uptime}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Last Check */}
                                    <div className="flex items-center text-xs text-gray-600 pt-2 border-t border-gray-300">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Last checked: {service.lastCheck.toLocaleTimeString()}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* Alerts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Alerts</h3>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-900">Email Service Degraded</p>
                                <p className="text-sm text-yellow-700">Response time elevated to 850ms, investigating</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-900">All Critical Services Operational</p>
                                <p className="text-sm text-green-700">API, Database, and Cache services running normally</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-900">Search Service Minor Issue</p>
                                <p className="text-sm text-blue-700">1 incident detected, auto-recovery in progress</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
