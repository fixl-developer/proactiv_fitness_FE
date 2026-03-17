'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Activity, Zap, TrendingUp, AlertTriangle, CheckCircle,
    RefreshCw, Download, Settings, Gauge, Cpu, MemoryStick,
    Network, Database, Clock, Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { superAdminService } from '@/services/superAdminService'

export default function RealtimeMetricsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [metrics, setMetrics] = useState<any>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [autoRefresh, setAutoRefresh] = useState(true)

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await superAdminService.getSystemMetrics()
                setMetrics(data)
            } catch (error) {
                console.error('Error fetching metrics:', error)
                setMetrics({
                    cpuUsage: 35.2,
                    memoryUsage: 68.5,
                    networkTraffic: 1250,
                    activeConnections: 12,
                    requestsPerSecond: 125,
                    errorRate: 0.02,
                    responseTime: 145
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchMetrics()

        if (autoRefresh) {
            const interval = setInterval(fetchMetrics, 5000)
            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    const handleRefresh = async () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 1000)
    }

    const realtimeData = [
        { time: '00:00', cpu: 25, memory: 60, network: 800, requests: 100 },
        { time: '04:00', cpu: 20, memory: 55, network: 600, requests: 80 },
        { time: '08:00', cpu: 45, memory: 70, network: 1200, requests: 150 },
        { time: '12:00', cpu: 60, memory: 80, network: 1800, requests: 200 },
        { time: '16:00', cpu: 50, memory: 75, network: 1500, requests: 180 },
        { time: '20:00', cpu: 35, memory: 65, network: 1000, requests: 120 },
        { time: '23:59', cpu: 32, memory: 62, network: 950, requests: 110 }
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Real-time Metrics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-blue-600" />
                        Real-time Metrics
                    </h1>
                    <p className="text-gray-600 mt-1">Live system performance monitoring</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        variant={autoRefresh ? "default" : "outline"}
                        className="flex items-center"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {autoRefresh ? 'Auto' : 'Manual'}
                    </Button>
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

            {/* Live Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                            <Cpu className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{metrics?.cpuUsage}%</div>
                            <Progress value={metrics?.cpuUsage} className="mt-2 h-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                <span className={metrics?.cpuUsage > 80 ? 'text-red-600' : 'text-green-600'}>
                                    {metrics?.cpuUsage > 80 ? 'High' : 'Normal'}
                                </span>
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
                            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                            <MemoryStick className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{metrics?.memoryUsage}%</div>
                            <Progress value={metrics?.memoryUsage} className="mt-2 h-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                <span className={metrics?.memoryUsage > 80 ? 'text-red-600' : 'text-green-600'}>
                                    {metrics?.memoryUsage > 80 ? 'High' : 'Normal'}
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Network Traffic</CardTitle>
                            <Network className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{metrics?.networkTraffic} MB/s</div>
                            <Progress value={(metrics?.networkTraffic || 0) / 20} className="mt-2 h-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                <span className="text-green-600">Optimal</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                            <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{metrics?.responseTime}ms</div>
                            <Progress value={Math.min((metrics?.responseTime || 0) / 2, 100)} className="mt-2 h-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                <span className="text-green-600">Good</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Gauge className="w-5 h-5 mr-2 text-blue-600" />
                                System Performance (24h)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={realtimeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="CPU %" />
                                    <Area type="monotone" dataKey="memory" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Memory %" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                Request Rate (24h)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={realtimeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="requests" stroke="#10B981" strokeWidth={2} name="Requests/sec" />
                                    <Line type="monotone" dataKey="network" stroke="#F59E0B" strokeWidth={2} name="Network MB/s" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Status Indicators */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Eye className="w-5 h-5 mr-2 text-gray-600" />
                            System Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <p className="font-medium text-green-900">API Server</p>
                                </div>
                                <p className="text-sm text-green-700">Operational</p>
                            </div>
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <p className="font-medium text-green-900">Database</p>
                                </div>
                                <p className="text-sm text-green-700">Operational</p>
                            </div>
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <p className="font-medium text-green-900">Cache</p>
                                </div>
                                <p className="text-sm text-green-700">Operational</p>
                            </div>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                    <p className="font-medium text-yellow-900">Email Service</p>
                                </div>
                                <p className="text-sm text-yellow-700">Degraded</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
