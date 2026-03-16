'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Zap, RefreshCw, Edit2, Trash2, AlertTriangle,
    CheckCircle, TrendingUp, Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { superAdminService } from '@/services/superAdminService'

export default function RateLimitingPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [rateLimits, setRateLimits] = useState<any[]>([])
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchRateLimits()
    }, [])

    const fetchRateLimits = async () => {
        try {
            setIsLoading(true)
            const data = await superAdminService.getRateLimits()
            setRateLimits(data)
        } catch (error) {
            console.error('Error fetching rate limits:', error)
            // Fallback mock data
            const mockLimits = [
                {
                    id: '1',
                    endpoint: '/api/users',
                    method: 'GET',
                    limit: 1000,
                    window: '1h',
                    current: 850,
                    status: 'healthy'
                },
                {
                    id: '2',
                    endpoint: '/api/users',
                    method: 'POST',
                    limit: 100,
                    window: '1h',
                    current: 45,
                    status: 'healthy'
                },
                {
                    id: '3',
                    endpoint: '/api/login',
                    method: 'POST',
                    limit: 50,
                    window: '15m',
                    current: 48,
                    status: 'warning'
                },
                {
                    id: '4',
                    endpoint: '/api/payments',
                    method: 'POST',
                    limit: 500,
                    window: '1h',
                    current: 120,
                    status: 'healthy'
                }
            ]
            setRateLimits(mockLimits)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 2000)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy': return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
            case 'critical': return <Badge className="bg-red-100 text-red-800">Critical</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const usageData = [
        { time: '00:00', usage: 200 },
        { time: '04:00', usage: 150 },
        { time: '08:00', usage: 450 },
        { time: '12:00', usage: 800 },
        { time: '16:00', usage: 650 },
        { time: '20:00', usage: 400 }
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Rate Limiting...</p>
                </div>
            </div>
        )
    }

    const healthyLimits = rateLimits.filter(l => l.status === 'healthy').length
    const warningLimits = rateLimits.filter(l => l.status === 'warning').length
    const criticalLimits = rateLimits.filter(l => l.status === 'critical').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Zap className="w-8 h-8 mr-3 text-blue-600" />
                        API Rate Limiting
                    </h1>
                    <p className="text-gray-600 mt-1">Manage API quota and rate limits</p>
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

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                            <Lock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{rateLimits.length}</div>
                            <p className="text-xs text-muted-foreground">Active rate limit rules</p>
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
                            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{healthyLimits}</div>
                            <p className="text-xs text-muted-foreground">Within limits</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Warning</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{warningLimits}</div>
                            <p className="text-xs text-muted-foreground">Approaching limit</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Critical</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{criticalLimits}</div>
                            <p className="text-xs text-muted-foreground">Exceeded limit</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Usage Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                            API Usage Trend (24h)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={usageData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="usage" stroke="#3B82F6" strokeWidth={2} name="API Requests" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Rate Limits Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Rate Limit Rules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Endpoint</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Limit</TableHead>
                                        <TableHead>Window</TableHead>
                                        <TableHead>Current Usage</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rateLimits.map((limit) => (
                                        <TableRow key={limit.id}>
                                            <TableCell className="font-medium">{limit.endpoint}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{limit.method}</Badge>
                                            </TableCell>
                                            <TableCell>{limit.limit}</TableCell>
                                            <TableCell>{limit.window}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-sm">{limit.current}/{limit.limit}</div>
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${(limit.current / limit.limit) > 0.9 ? 'bg-red-600' :
                                                                (limit.current / limit.limit) > 0.7 ? 'bg-yellow-600' :
                                                                    'bg-green-600'
                                                                }`}
                                                            style={{ width: `${(limit.current / limit.limit) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(limit.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
