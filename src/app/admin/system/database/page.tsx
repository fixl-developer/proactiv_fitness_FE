'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, HardDrive, Clock, Activity, Zap, RefreshCw, Download, Server, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const storageBreakdown = [
    { name: 'Users', size: 2.1, color: 'bg-blue-500' },
    { name: 'Bookings', size: 1.8, color: 'bg-green-500' },
    { name: 'Programs', size: 0.5, color: 'bg-purple-500' },
    { name: 'Logs', size: 3.2, color: 'bg-amber-500' },
    { name: 'Other', size: 0.9, color: 'bg-gray-400' },
]

const totalStorage = 20
const usedStorage = storageBreakdown.reduce((acc, item) => acc + item.size, 0)

const slowQueries = [
    { query: 'SELECT * FROM bookings JOIN users ON ... WHERE date BETWEEN ...', avgTime: '450ms', executions: '1,234', lastRun: '2 min ago' },
    { query: 'SELECT COUNT(*) FROM attendance GROUP BY program_id, month ...', avgTime: '380ms', executions: '892', lastRun: '5 min ago' },
    { query: 'UPDATE users SET last_login = NOW() WHERE id IN (SELECT ...)', avgTime: '320ms', executions: '2,456', lastRun: '1 min ago' },
    { query: 'SELECT * FROM payments WHERE status = "pending" ORDER BY ...', avgTime: '280ms', executions: '567', lastRun: '8 min ago' },
]

const recentOps = [
    { op: 'Backup completed', time: '6:00 AM today', status: 'Success', statusColor: 'bg-green-100 text-green-700' },
    { op: 'Index rebuilt: bookings_date_idx', time: '5:30 AM today', status: 'Success', statusColor: 'bg-green-100 text-green-700' },
    { op: 'Vacuum analyze: users table', time: 'Yesterday 11 PM', status: 'Success', statusColor: 'bg-green-100 text-green-700' },
    { op: 'Migration: add column programs.virtual_enabled', time: 'Mar 17, 2026', status: 'Success', statusColor: 'bg-green-100 text-green-700' },
    { op: 'Backup completed', time: 'Mar 17, 6:00 AM', status: 'Success', statusColor: 'bg-green-100 text-green-700' },
]

export default function DatabaseHealthPage() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

    const stats = [
        { label: 'Connections Active', value: '18/100', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Avg Query Time', value: '24ms', icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Storage Used', value: `${usedStorage.toFixed(1)}GB / ${totalStorage}GB`, icon: HardDrive, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Uptime', value: '45d 12h', icon: Server, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">Database Health</h1>
                    <p className="text-gray-600 mt-1">Monitor database performance, storage, and operations</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Zap className="w-4 h-4 mr-2" />
                        Optimize
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />
                        Backup Now
                    </Button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Storage Breakdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HardDrive className="w-5 h-5 text-amber-600" />
                                Storage Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Used: {usedStorage.toFixed(1)} GB</span>
                                    <span className="text-gray-600">Total: {totalStorage} GB</span>
                                </div>
                                <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden flex">
                                    {storageBreakdown.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            className={`${item.color} h-full`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.size / totalStorage) * 100}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                                        ></motion.div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3 mt-6">
                                {storageBreakdown.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                            <span className="text-sm text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{item.size} GB</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Connection Pool */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-600" />
                                Connection Pool
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Active Connections</span>
                                        <span className="font-medium text-blue-600">18</span>
                                    </div>
                                    <Progress value={18} className="h-3" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Idle Connections</span>
                                        <span className="font-medium text-green-600">32</span>
                                    </div>
                                    <Progress value={32} className="h-3" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Max Connections</span>
                                        <span className="font-medium text-gray-600">100</span>
                                    </div>
                                    <Progress value={100} className="h-3" />
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">18</p>
                                            <p className="text-xs text-gray-500">Active</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">32</p>
                                            <p className="text-xs text-gray-500">Idle</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-600">50</p>
                                            <p className="text-xs text-gray-500">Available</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Slow Queries */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                Slow Queries
                            </CardTitle>
                            <Badge className="bg-amber-100 text-amber-700">{slowQueries.length} queries</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Query</th>
                                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Avg Time</th>
                                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Executions</th>
                                        <th className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase">Last Run</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slowQueries.map((q, i) => (
                                        <motion.tr
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.7 + i * 0.05 }}
                                            className="border-b border-gray-50 hover:bg-gray-50/50"
                                        >
                                            <td className="py-3 px-3">
                                                <code className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded block max-w-md truncate">{q.query}</code>
                                            </td>
                                            <td className="py-3 px-3">
                                                <Badge className="bg-red-100 text-red-700">{q.avgTime}</Badge>
                                            </td>
                                            <td className="py-3 px-3 text-sm text-gray-600">{q.executions}</td>
                                            <td className="py-3 px-3 text-sm text-gray-500">{q.lastRun}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Recent Operations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-green-600" />
                            Recent Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentOps.map((op, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">{op.op}</span>
                                            <p className="text-xs text-gray-500">{op.time}</p>
                                        </div>
                                    </div>
                                    <Badge className={op.statusColor}>{op.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
