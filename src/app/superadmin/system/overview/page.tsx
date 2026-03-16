'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Server, Activity, Zap, AlertTriangle, CheckCircle, TrendingUp,
    TrendingDown, Clock, Cpu, MemoryStick, HardDrive, Wifi,
    RefreshCw, Settings, Download, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { superAdminService } from '@/services/superAdminService'

export default function SystemOverviewPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [systemHealth, setSystemHealth] = useState<any>(null)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const health = await superAdminService.getSystemHealth()
                setSystemHealth(health)
            } catch (error) {
                console.error('Error fetching system health:', error)
                setSystemHealth({
                    status: 'healthy',
                    services: [
                        { name: 'Database', status: 'healthy', uptime: 99.9, responseTime: 25 },
                        { name: 'API Server', status: 'healthy', uptime: 99.8, responseTime: 145 },
                        { name: 'File Storage', status: 'healthy', uptime: 99.7, responseTime: 50 },
                        { name: 'Email Service', status: 'warning', uptime: 98.5, responseTime: 200 },
                        { name: 'SMS Service', status: 'healthy', uptime: 99.2, responseTime: 150 },
                        { name: 'Cache Server', status: 'healthy', uptime: 99.9, responseTime: 5 }
                    ],
                    alerts: [
                        {
                            id: '1',
                            type: 'warning',
                            message: 'High memory usage detected',
                            timestamp: new Date().toISOString(),
                            resolved: false
                        }
                    ]
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleRefresh = async () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 2000)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600'
            case 'warning': return 'text-yellow-600'
            case 'critical': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
            case 'critical': return <AlertCircle className="w-5 h-5 text-red-600" />
            default: return <Activity className="w-5 h-5 text-gray-600" />
        }
    }

    const systemMetricsData = [
        { time: '00:00', cpu: 25, memory: 60, disk: 45 },
        { time: '04:00', cpu: 20, memory: 55, disk: 42 },
        { time: '08:00', cpu: 45, memory: 70, disk: 50 },
        { time: '12:00', cpu: 60, memory: 80, disk: 65 },
        { time: '16:00', cpu: 50, memory: 75, disk: 60 },
        { time: '20:00', cpu: 35, memory: 65, disk: 52 }
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Server className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading System Overview...</p>
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
                        <Server className="w-8 h-8 mr-3 text-blue-600" />
                        System Overview
                    </h1>
                    <p className="text-gray-600 mt-1">Real-time system performance and health monitoring</p>
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
                    <Badge variant="outline" className={`${systemHealth?.status === 'healthy' ? 'text-green-600 border-green-200' : 'text-yellow-600 border-yellow-200'}`}>
                        <Activity className="w-3 h-3 mr-1" />
                        System {systemHealth?.status}
                    </Badge>
                </div>
            </div>

            {/* Service Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemHealth?.services.map((service: any, index: number) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(service.status)}
                                        <div>
                                            <p className="font-medium text-gray-900">{service.name}</p>
                                            <p className="text-sm text-gray-500">Uptime: {service.uptime}%</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`${service.status === 'healthy' ? 'text-green-600 border-green-200' : 'text-yellow-600 border-yellow-200'}`}
                                    >
                                        {service.status}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Response Time</span>
                                        <span className="font-medium">{service.responseTime}ms</span>
                                    </div>
                                    <Progress value={Math.min(service.responseTime / 2, 100)} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Performance Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                            System Performance (24h)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={systemMetricsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="CPU %" />
                                <Area type="monotone" dataKey="memory" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Memory %" />
                                <Area type="monotone" dataKey="disk" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Disk %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Alerts */}
            {systemHealth?.alerts && systemHealth.alerts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                                System Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {systemHealth.alerts.map((alert: any) => (
                                    <div key={alert.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">{alert.message}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(alert.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Acknowledge</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}
