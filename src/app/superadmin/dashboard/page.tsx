'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ObservabilityService from '@/services/modules/observability.service'
import SystemAnalyticsService from '@/services/modules/system-analytics.service'
import { motion } from 'framer-motion'
import {
    Activity, Server, Users, Database, AlertTriangle,
    TrendingUp, Cpu, HardDrive, Zap, Clock, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function SuperAdminDashboard() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [systemHealth, setSystemHealth] = useState<any>(null)
    const [analytics, setAnalytics] = useState<any>(null)
    const [alerts, setAlerts] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        loadDashboardData()
    }, [isAuthenticated, router])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [healthRes, analyticsRes, alertsRes] = await Promise.all([
                ObservabilityService.getSystemHealth(),
                SystemAnalyticsService.getSystemAnalytics(),
                ObservabilityService.getAlerts({ status: 'active' })
            ])

            setSystemHealth(healthRes)
            setAnalytics(analyticsRes)
            setAlerts(alertsRes)
        } catch (err) {
            console.error('Error loading dashboard:', err)
            setError('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">SuperAdmin Dashboard</h1>
                    <p className="text-gray-600">System monitoring and administration</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* System Health Status */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-600" />
                                System Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Badge className={`${systemHealth?.status === 'healthy' ? 'bg-green-100 text-green-800' :
                                            systemHealth?.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {systemHealth?.status?.toUpperCase() || 'UNKNOWN'}
                                    </Badge>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Uptime: {Math.floor((systemHealth?.uptime || 0) / 3600)}h {Math.floor(((systemHealth?.uptime || 0) % 3600) / 60)}m
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <Cpu className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{systemHealth?.cpu || 0}%</p>
                                        <p className="text-xs text-gray-600">CPU</p>
                                    </div>
                                    <div className="text-center">
                                        <Server className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{systemHealth?.memory || 0}%</p>
                                        <p className="text-xs text-gray-600">Memory</p>
                                    </div>
                                    <div className="text-center">
                                        <HardDrive className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold">{systemHealth?.disk || 0}%</p>
                                        <p className="text-xs text-gray-600">Disk</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Users</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalUsers?.toLocaleString() || '0'}</p>
                                    </div>
                                    <Users className="w-12 h-12 text-blue-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Active Users</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.activeUsers?.toLocaleString() || '0'}</p>
                                    </div>
                                    <Zap className="w-12 h-12 text-green-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Requests</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalRequests?.toLocaleString() || '0'}</p>
                                    </div>
                                    <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Avg Response Time</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.avgResponseTime || '0'}ms</p>
                                    </div>
                                    <Clock className="w-12 h-12 text-orange-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Active Alerts */}
                {alerts.length > 0 && (
                    <div className="mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                    Active Alerts ({alerts.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {alerts.slice(0, 5).map((alert: any) => (
                                        <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle className={`w-5 h-5 ${alert.type === 'critical' ? 'text-red-600' :
                                                        alert.type === 'warning' ? 'text-yellow-600' :
                                                            'text-blue-600'
                                                    }`} />
                                                <div>
                                                    <p className="font-medium text-gray-900">{alert.title}</p>
                                                    <p className="text-sm text-gray-600">{alert.service}</p>
                                                </div>
                                            </div>
                                            <Badge className={`${alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                                                    alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {alert.type}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Services Status */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Services Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(systemHealth?.services || []).map((service: any, idx: number) => (
                                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-gray-900">{service.name}</p>
                                            <Badge className={`${service.status === 'up' ? 'bg-green-100 text-green-800' :
                                                    service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {service.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">Response: {service.responseTime}ms</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
