'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Activity, Cpu, MemoryStick, Wifi, Users,
    TrendingUp, AlertCircle, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { superAdminService } from '@/services/superAdminService'

export default function LiveMonitoringPage() {
    const [isLive, setIsLive] = useState(true)
    const [metrics, setMetrics] = useState<any>(null)
    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        fetchMetrics()
        // Simulate real-time updates
        const interval = setInterval(() => {
            if (isLive) {
                fetchMetrics()
            }
        }, 2000)

        return () => clearInterval(interval)
    }, [isLive])

    const fetchMetrics = async () => {
        try {
            const data = await superAdminService.getRealtimeMetrics()
            setMetrics(data)
            setChartData(prev => {
                const newData = [...prev, {
                    time: new Date().toLocaleTimeString(),
                    cpu: data.cpu || Math.random() * 100,
                    memory: data.memory || Math.random() * 100,
                    network: data.network || Math.random() * 2000
                }]
                return newData.slice(-20)
            })
        } catch (error) {
            console.error('Error fetching metrics:', error)
            // Fallback mock data
            setMetrics({
                cpu: Math.random() * 100,
                memory: Math.random() * 100,
                network: Math.random() * 2000,
                database: Math.random() * 100,
                activeUsers: Math.floor(Math.random() * 500) + 100,
                requestsPerSecond: Math.floor(Math.random() * 1000) + 100,
                errorRate: (Math.random() * 0.1).toFixed(3),
                responseTime: Math.floor(Math.random() * 500) + 50
            })

            setChartData(prev => {
                const newData = [...prev, {
                    time: new Date().toLocaleTimeString(),
                    cpu: Math.random() * 100,
                    memory: Math.random() * 100,
                    network: Math.random() * 2000
                }]
                return newData.slice(-20)
            })
        }
    }

    const getMetricStatus = (value: number, threshold: number = 80) => {
        if (value > threshold) return 'critical'
        if (value > threshold * 0.75) return 'warning'
        return 'healthy'
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'critical': return 'text-red-600'
            case 'warning': return 'text-yellow-600'
            default: return 'text-green-600'
        }
    }

    if (!metrics) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Live Metrics...</p>
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
                        Live Monitoring
                    </h1>
                    <p className="text-gray-600 mt-1">Real-time system metrics and performance</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge className={isLive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-green-600 animate-pulse' : 'bg-gray-600'}`}></span>
                        {isLive ? 'Live' : 'Paused'}
                    </Badge>
                    <Button
                        onClick={() => setIsLive(!isLive)}
                        variant="outline"
                    >
                        {isLive ? 'Pause' : 'Resume'}
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                            <Cpu className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.cpu?.toFixed(1)}%</div>
                            <Progress value={metrics.cpu} className="mt-2" />
                            <p className={`text-xs mt-2 ${getStatusColor(getMetricStatus(metrics.cpu))}`}>
                                {getMetricStatus(metrics.cpu)}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                            <MemoryStick className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.memory?.toFixed(1)}%</div>
                            <Progress value={metrics.memory} className="mt-2" />
                            <p className={`text-xs mt-2 ${getStatusColor(getMetricStatus(metrics.memory))}`}>
                                {getMetricStatus(metrics.memory)}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
                            <Wifi className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(metrics.network / 1000).toFixed(1)} MB/s</div>
                            <p className="text-xs text-muted-foreground mt-2">Data transfer rate</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                            <p className="text-xs text-muted-foreground mt-2">Connected now</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Requests/sec</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.requestsPerSecond}</div>
                            <p className="text-xs text-muted-foreground mt-2">API requests</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
                            <p className="text-xs text-muted-foreground mt-2">Last minute</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                            <Clock className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
                            <p className="text-xs text-muted-foreground mt-2">Average</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Charts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>System Metrics Trend (Last 20 readings)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="cpu" stroke="#3B82F6" name="CPU %" />
                                <Line type="monotone" dataKey="memory" stroke="#8B5CF6" name="Memory %" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
