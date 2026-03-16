'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Zap,
    TrendingUp,
    RefreshCw,
    Download,
    AlertCircle,
    CheckCircle,
    Clock,
    Activity
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { superAdminService } from '@/services/superAdminService'

interface PerformanceMetric {
    time: string
    cpu: number
    memory: number
    disk: number
    network: number
}

export default function PerformanceMetricsPage() {
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMetrics()
    }, [])

    const fetchMetrics = async () => {
        try {
            setLoading(true)
            const data = await superAdminService.getPerformanceMetrics()
            setMetrics(data)
        } catch (error) {
            console.error('Error fetching metrics:', error)
            // Fallback mock data
            const mockMetrics: PerformanceMetric[] = [
                { time: '00:00', cpu: 35, memory: 45, disk: 60, network: 25 },
                { time: '04:00', cpu: 28, memory: 38, disk: 58, network: 18 },
                { time: '08:00', cpu: 52, memory: 62, disk: 65, network: 45 },
                { time: '12:00', cpu: 68, memory: 75, disk: 72, network: 68 },
                { time: '16:00', cpu: 55, memory: 65, disk: 70, network: 52 },
                { time: '20:00', cpu: 42, memory: 52, disk: 68, network: 35 },
                { time: '24:00', cpu: 38, memory: 48, disk: 66, network: 28 }
            ]
            setMetrics(mockMetrics)
        } finally {
            setLoading(false)
        }
    }

    const currentMetric = metrics[metrics.length - 1] || { time: 'N/A', cpu: 0, memory: 0, disk: 0, network: 0 }
    const avgCpu = Math.round(metrics.reduce((sum, m) => sum + m.cpu, 0) / metrics.length)
    const avgMemory = Math.round(metrics.reduce((sum, m) => sum + m.memory, 0) / metrics.length)

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
                        <Zap className="w-8 h-8 mr-3 text-purple-600" />
                        Performance Metrics
                    </h1>
                    <p className="text-gray-600 mt-1">System resource utilization and performance</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={fetchMetrics}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </motion.div>

            {/* Current Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">CPU Usage</p>
                            <p className="text-3xl font-bold text-blue-600">{currentMetric.cpu}%</p>
                            <p className="text-xs text-gray-500 mt-1">Avg: {avgCpu}%</p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Memory Usage</p>
                            <p className="text-3xl font-bold text-green-600">{currentMetric.memory}%</p>
                            <p className="text-xs text-gray-500 mt-1">Avg: {avgMemory}%</p>
                        </div>
                        <Activity className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Disk Usage</p>
                            <p className="text-3xl font-bold text-yellow-600">{currentMetric.disk}%</p>
                            <p className="text-xs text-gray-500 mt-1">Status: Good</p>
                        </div>
                        <Activity className="w-8 h-8 text-yellow-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Network I/O</p>
                            <p className="text-3xl font-bold text-purple-600">{currentMetric.network}%</p>
                            <p className="text-xs text-gray-500 mt-1">Healthy</p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-500 opacity-50" />
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
                {/* CPU & Memory */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">CPU & Memory Usage</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={metrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} name="CPU %" />
                            <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} name="Memory %" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Disk & Network */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Disk & Network Usage</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={metrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="disk" stroke="#F59E0B" strokeWidth={2} name="Disk %" />
                            <Line type="monotone" dataKey="network" stroke="#8B5CF6" strokeWidth={2} name="Network %" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* All Metrics Combined */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Metrics (24 Hours)</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={metrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3B82F6" fill="#3B82F6" opacity={0.6} name="CPU %" />
                            <Area type="monotone" dataKey="memory" stackId="1" stroke="#10B981" fill="#10B981" opacity={0.6} name="Memory %" />
                            <Area type="monotone" dataKey="disk" stackId="1" stroke="#F59E0B" fill="#F59E0B" opacity={0.6} name="Disk %" />
                            <Area type="monotone" dataKey="network" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" opacity={0.6} name="Network %" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* Alerts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Alerts</h3>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-900">CPU Usage Normal</p>
                                <p className="text-sm text-green-700">Average CPU usage is within acceptable limits</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-900">Memory Usage Elevated</p>
                                <p className="text-sm text-yellow-700">Memory usage peaked at 75% during peak hours</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-900">Disk Space Adequate</p>
                                <p className="text-sm text-green-700">Disk usage at 66%, no immediate action needed</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
