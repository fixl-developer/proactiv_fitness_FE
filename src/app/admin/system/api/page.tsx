'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Zap, Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp, Server, Database, HardDrive, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const hourlyData = [
    320, 280, 190, 140, 95, 80, 110, 250, 480, 620, 780, 850,
    920, 870, 810, 750, 690, 580, 450, 520, 610, 580, 420, 350,
]

const endpoints = [
    { path: 'GET /auth/login', method: 'GET', methodColor: 'bg-green-100 text-green-700', requests: '2.1K', avgTime: '145ms', errorRate: '0.5%', status: 'Healthy' },
    { path: 'POST /bookings', method: 'POST', methodColor: 'bg-blue-100 text-blue-700', requests: '890', avgTime: '230ms', errorRate: '1.2%', status: 'Healthy' },
    { path: 'GET /programs', method: 'GET', methodColor: 'bg-green-100 text-green-700', requests: '1.5K', avgTime: '95ms', errorRate: '0.1%', status: 'Healthy' },
    { path: 'GET /users/profile', method: 'GET', methodColor: 'bg-green-100 text-green-700', requests: '3.2K', avgTime: '120ms', errorRate: '0.3%', status: 'Healthy' },
    { path: 'PUT /bookings/:id', method: 'PUT', methodColor: 'bg-amber-100 text-amber-700', requests: '456', avgTime: '180ms', errorRate: '0.8%', status: 'Healthy' },
    { path: 'DELETE /bookings/:id', method: 'DELETE', methodColor: 'bg-red-100 text-red-700', requests: '78', avgTime: '150ms', errorRate: '0.0%', status: 'Healthy' },
]

const healthServices = [
    { name: 'API Server', status: 'Operational', color: 'bg-green-500', icon: Server },
    { name: 'Database', status: 'Operational', color: 'bg-green-500', icon: Database },
    { name: 'Cache (Redis)', status: 'Degraded', color: 'bg-yellow-500', icon: HardDrive },
    { name: 'Email Service', status: 'Operational', color: 'bg-green-500', icon: Mail },
]

export default function APIMonitoringPage() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

    const maxValue = Math.max(...hourlyData)

    const stats = [
        { label: 'Total Requests (24h)', value: '12,458', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', sub: '+8.2% vs yesterday' },
        { label: 'Avg Response Time', value: '142ms', icon: Clock, color: 'text-green-600', bg: 'bg-green-50', sub: '-12ms improvement' },
        { label: 'Error Rate', value: '0.42%', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Below threshold' },
        { label: 'Uptime', value: '99.97%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: '30 day average' },
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-3xl font-bold text-gray-900">API Monitoring</h1>
                <p className="text-gray-600 mt-1">Real-time performance metrics, endpoint health, and service status</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                                        <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Request Volume Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Request Volume (Last 24 Hours)
                            </CardTitle>
                            <Badge variant="outline">Hourly</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-1.5 h-48">
                            {hourlyData.map((value, i) => (
                                <motion.div
                                    key={i}
                                    className="flex-1 group relative"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(value / maxValue) * 100}%` }}
                                    transition={{ delay: 0.5 + i * 0.03, duration: 0.4 }}
                                >
                                    <div
                                        className={`w-full h-full rounded-t-sm transition-colors ${
                                            value > 800 ? 'bg-blue-500 hover:bg-blue-600' :
                                            value > 400 ? 'bg-blue-400 hover:bg-blue-500' :
                                            'bg-blue-300 hover:bg-blue-400'
                                        }`}
                                    ></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {value} req
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>23:00</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Endpoints Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-600" />
                                    Top Endpoints
                                </CardTitle>
                                <Badge variant="outline">{endpoints.length} endpoints</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Endpoint</th>
                                            <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Requests</th>
                                            <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Avg Time</th>
                                            <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Error Rate</th>
                                            <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {endpoints.map((ep, i) => (
                                            <motion.tr
                                                key={i}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.7 + i * 0.05 }}
                                                className="border-b border-gray-50 hover:bg-gray-50/50"
                                            >
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={`text-xs ${ep.methodColor}`}>{ep.method}</Badge>
                                                        <code className="text-sm text-gray-700 font-mono">{ep.path.split(' ')[1]}</code>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-sm font-medium text-gray-900">{ep.requests}</td>
                                                <td className="py-3 px-3 text-sm text-gray-600">{ep.avgTime}</td>
                                                <td className="py-3 px-3 text-sm text-gray-600">{ep.errorRate}</td>
                                                <td className="py-3 px-3">
                                                    <Badge className="bg-green-100 text-green-700">{ep.status}</Badge>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Health Status */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Service Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {healthServices.map((service, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 + i * 0.1 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <service.icon className="w-5 h-5 text-gray-600" />
                                            <span className="font-medium text-sm text-gray-900">{service.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${service.color} animate-pulse`}></div>
                                            <span className={`text-xs font-medium ${service.status === 'Operational' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {service.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
