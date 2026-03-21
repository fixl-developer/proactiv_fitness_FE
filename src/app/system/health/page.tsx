'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SystemOptimizationService, { SystemHealth } from '@/services/modules/system-optimization.service'
import { motion } from 'framer-motion'
import { Heart, AlertCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HealthPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [health, setHealth] = useState<SystemHealth | null>(null)
    const [alerts, setAlerts] = useState<any[]>([])
    const [logs, setLogs] = useState<any[]>([])
    const [recommendations, setRecommendations] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadHealthData()
    }, [isAuthenticated, router])

    const loadHealthData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [healthData, alertsData, logsData, recommendationsData] = await Promise.all([
                SystemOptimizationService.getSystemHealth(),
                SystemOptimizationService.getSystemAlerts(),
                SystemOptimizationService.getSystemLogs(10),
                SystemOptimizationService.getSystemRecommendations()
            ])
            setHealth(healthData)
            setAlerts(alertsData)
            setLogs(logsData)
            setRecommendations(recommendationsData)
        } catch (err) {
            console.error('Error loading health data:', err)
            setError('Failed to load system health')
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
                    <p className="text-gray-600">Loading system health...</p>
                </div>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
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
                return <AlertCircle className="w-5 h-5 text-red-600" />
            default:
                return <Heart className="w-5 h-5 text-gray-600" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">System Health Dashboard</h1>
                        <p className="text-gray-600">Monitor overall system status</p>
                    </div>
                    <Button data-testid="btn-load-health-data-system-health" onClick={loadHealthData} variant="outline">
                        <Clock className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {health && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Card className="border-2">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {getStatusIcon(health.status)}
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
                                            <p className="text-gray-600">Overall system health</p>
                                        </div>
                                    </div>
                                    <div className={`px-6 py-3 rounded-lg text-lg font-bold ${getStatusColor(health.status)}`}>
                                        {health.status.toUpperCase()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Uptime</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{health?.uptime || 0}h</div>
                            <p className="text-xs text-gray-600 mt-2">System uptime</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">CPU Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{health?.cpuUsage || 0}%</div>
                            <p className="text-xs text-gray-600 mt-2">Current usage</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Memory Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{health?.memoryUsage || 0}%</div>
                            <p className="text-xs text-gray-600 mt-2">Current usage</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Disk Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{health?.diskUsage || 0}%</div>
                            <p className="text-xs text-gray-600 mt-2">Current usage</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Connections</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{health?.activeConnections || 0}</div>
                            <p className="text-xs text-gray-600 mt-2">Current connections</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                System Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {alerts.length > 0 ? (
                                    alerts.map((alert, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                                        >
                                            <p className="font-medium text-yellow-900">{alert.title}</p>
                                            <p className="text-sm text-yellow-800 mt-1">{alert.message}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p className="text-gray-600 text-center py-4">No active alerts</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recommendations.length > 0 ? (
                                    recommendations.map((rec, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                        >
                                            <p className="font-medium text-blue-900">{rec.title}</p>
                                            <p className="text-sm text-blue-800 mt-1">{rec.description}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p className="text-gray-600 text-center py-4">No recommendations</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent System Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {logs.map((log, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-700">{log.message}</span>
                                        <span className="text-xs text-gray-500">{log.timestamp}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
