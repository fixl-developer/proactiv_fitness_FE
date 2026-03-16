'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Database, HardDrive, Zap, Activity, TrendingUp, AlertTriangle,
    RefreshCw, Download, Upload, Trash2, Lock, Unlock, Settings,
    BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { superAdminService, DatabaseMetrics } from '@/services/superAdminService'

export default function DatabaseOverviewPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await superAdminService.getDatabaseMetrics()
                setMetrics(data)
            } catch (error) {
                console.error('Error fetching database metrics:', error)
                // Fallback data
                setMetrics({
                    totalSize: 2.4,
                    usedSpace: 1.8,
                    freeSpace: 0.6,
                    totalTables: 45,
                    totalRecords: 125847,
                    queryPerformance: {
                        avgQueryTime: 25.5,
                        slowQueries: 3,
                        totalQueries: 15847
                    },
                    connections: {
                        active: 12,
                        idle: 8,
                        max: 100
                    },
                    backupStatus: {
                        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        backupSize: 1.2,
                        status: 'success'
                    }
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchMetrics()
    }, [])

    const handleRefresh = async () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 2000)
    }

    const queryPerformanceData = [
        { time: '00:00', avgTime: 20, slowQueries: 1 },
        { time: '04:00', avgTime: 18, slowQueries: 0 },
        { time: '08:00', avgTime: 35, slowQueries: 2 },
        { time: '12:00', avgTime: 45, slowQueries: 3 },
        { time: '16:00', avgTime: 38, slowQueries: 2 },
        { time: '20:00', avgTime: 25, slowQueries: 1 }
    ]

    const tableDistribution = [
        { name: 'Users', value: 15, color: '#8B5CF6' },
        { name: 'Bookings', value: 25, color: '#3B82F6' },
        { name: 'Transactions', value: 20, color: '#10B981' },
        { name: 'Logs', value: 30, color: '#F59E0B' },
        { name: 'Others', value: 10, color: '#6B7280' }
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Database className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Database Metrics...</p>
                </div>
            </div>
        )
    }

    const usedPercentage = metrics ? (metrics.usedSpace / metrics.totalSize) * 100 : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Database className="w-8 h-8 mr-3 text-blue-600" />
                        Database Management
                    </h1>
                    <p className="text-gray-600 mt-1">Monitor and manage database performance</p>
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
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                            <HardDrive className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{metrics?.totalSize} GB</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-blue-600">Used: {metrics?.usedSpace} GB</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                            <BarChart3 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{metrics?.totalTables}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">{metrics?.totalRecords.toLocaleString()} records</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Query Time</CardTitle>
                            <Zap className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{metrics?.queryPerformance.avgQueryTime}ms</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-purple-600">{metrics?.queryPerformance.totalQueries.toLocaleString()} queries</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                            <Activity className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{metrics?.connections.active}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-orange-600">Max: {metrics?.connections.max}</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Storage Usage */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <HardDrive className="w-5 h-5 mr-2 text-blue-600" />
                            Storage Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Database Storage</span>
                                <span className="text-sm text-gray-600">{usedPercentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={usedPercentage} className="h-3" />
                            <p className="text-xs text-gray-500 mt-1">
                                {metrics?.usedSpace} GB used of {metrics?.totalSize} GB total
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="performance" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="tables">Tables</TabsTrigger>
                    <TabsTrigger value="backup">Backup Status</TabsTrigger>
                </TabsList>

                <TabsContent value="performance">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <LineChartIcon className="w-5 h-5 mr-2 text-blue-600" />
                                    Query Performance (24h)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={queryPerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="avgTime" stroke="#8B5CF6" strokeWidth={2} name="Avg Time (ms)" />
                                        <Line yAxisId="right" type="monotone" dataKey="slowQueries" stroke="#EF4444" strokeWidth={2} name="Slow Queries" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="tables">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PieChartIcon className="w-5 h-5 mr-2 text-green-600" />
                                    Table Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={tableDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {tableDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="backup">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Upload className="w-5 h-5 mr-2 text-orange-600" />
                                    Backup Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Last Backup</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(metrics?.backupStatus.lastBackup || '').toLocaleDateString()}
                                        </p>
                                        <Badge className="mt-2 bg-green-100 text-green-800">
                                            {metrics?.backupStatus.status}
                                        </Badge>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Backup Size</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {metrics?.backupStatus.backupSize} GB
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>

            {/* Database Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Settings className="w-5 h-5 mr-2 text-gray-600" />
                            Database Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Download className="w-6 h-6 mb-2 text-blue-600" />
                                <span className="text-sm">Optimize</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Zap className="w-6 h-6 mb-2 text-purple-600" />
                                <span className="text-sm">Repair</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Lock className="w-6 h-6 mb-2 text-red-600" />
                                <span className="text-sm">Lock</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Unlock className="w-6 h-6 mb-2 text-green-600" />
                                <span className="text-sm">Unlock</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
