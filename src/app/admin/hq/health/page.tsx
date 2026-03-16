'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Server, Database, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { HQAdminService } from '@/services/hqAdminService'

export default function SystemHealthPage() {
    const [health, setHealth] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchHealth()
        const interval = setInterval(fetchHealth, 30000) // Refresh every 30 seconds
        return () => clearInterval(interval)
    }, [])

    const fetchHealth = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Will call backend when available
            const data = await HQAdminService.getSystemHealth?.()
            setHealth(data || getMockHealth())
        } catch (err: any) {
            console.error('Error fetching health:', err)
            setError(err.message)
            setHealth(getMockHealth())
        } finally {
            setIsLoading(false)
        }
    }

    const getMockHealth = () => ({
        status: 'healthy',
        uptime: '45 days 12 hours',
        lastCheck: new Date().toLocaleTimeString(),
        services: [
            { name: 'API Server', status: 'online', uptime: '99.9%', responseTime: '45ms' },
            { name: 'Database', status: 'online', uptime: '99.95%', responseTime: '12ms' },
            { name: 'Cache Server', status: 'online', uptime: '99.8%', responseTime: '5ms' },
            { name: 'Email Service', status: 'online', uptime: '99.7%', responseTime: '250ms' },
        ],
        resources: [
            { name: 'CPU Usage', value: 35, unit: '%', status: 'good' },
            { name: 'Memory Usage', value: 62, unit: '%', status: 'good' },
            { name: 'Disk Usage', value: 48, unit: '%', status: 'good' },
            { name: 'Network I/O', value: 28, unit: '%', status: 'good' },
        ],
        cpuHistory: [
            { time: '00:00', usage: 25 },
            { time: '04:00', usage: 32 },
            { time: '08:00', usage: 45 },
            { time: '12:00', usage: 38 },
            { time: '16:00', usage: 42 },
            { time: '20:00', usage: 35 },
        ],
        memoryHistory: [
            { time: '00:00', usage: 55 },
            { time: '04:00', usage: 58 },
            { time: '08:00', usage: 68 },
            { time: '12:00', usage: 62 },
            { time: '16:00', usage: 65 },
            { time: '20:00', usage: 62 },
        ],
        alerts: [
            { id: 1, type: 'warning', message: 'High memory usage detected', time: '2 hours ago' },
            { id: 2, type: 'info', message: 'Database backup completed', time: '4 hours ago' },
        ],
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
            case 'healthy':
            case 'good':
                return 'bg-green-100 text-green-800'
            case 'warning':
                return 'bg-yellow-100 text-yellow-800'
            case 'offline':
            case 'error':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getResourceColor = (value: number) => {
        if (value < 50) return 'bg-green-500'
        if (value < 75) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">System Health & Monitoring</h1>
                <p className="text-gray-600 mt-1">Real-time system performance and status</p>
            </div>

            {/* Overall Status */}
            <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">System Status</p>
                                <p className="text-2xl font-bold text-gray-900">All Systems Operational</p>
                                <p className="text-sm text-gray-600 mt-1">Uptime: {health?.uptime}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Last Check</p>
                            <p className="text-lg font-semibold text-gray-900">{health?.lastCheck}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Services Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-blue-600" />
                        Services Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {health?.services.map((service: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">{service.name}</p>
                                        <p className="text-xs text-gray-600">Response: {service.responseTime}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <Badge className={getStatusColor(service.status)}>
                                            {service.status}
                                        </Badge>
                                        <p className="text-xs text-gray-600 mt-1">{service.uptime}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Resource Usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-600" />
                            Resource Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {health?.resources.map((resource: any, idx: number) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-medium text-gray-700">{resource.name}</p>
                                        <p className="text-sm font-bold text-gray-900">{resource.value}{resource.unit}</p>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${getResourceColor(resource.value)}`}
                                            style={{ width: `${resource.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            Recent Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {health?.alerts.map((alert: any) => (
                                <div
                                    key={alert.id}
                                    className={`p-3 rounded-lg ${alert.type === 'warning'
                                            ? 'bg-yellow-50 border border-yellow-200'
                                            : 'bg-blue-50 border border-blue-200'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className={`w-4 h-4 mt-0.5 ${alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${alert.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}`}>
                                                {alert.message}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">{alert.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* CPU Usage Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>CPU Usage Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={health?.cpuHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="usage" stroke="#f59e0b" name="CPU %" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Memory Usage Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Memory Usage Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={health?.memoryHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="usage" stroke="#3b82f6" name="Memory %" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ {error} - Showing mock data for development
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
