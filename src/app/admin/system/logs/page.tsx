'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Search, Download, RefreshCw, AlertCircle, AlertTriangle, Info, Bug, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

interface LogEntry {
    id: number
    level: LogLevel
    timestamp: string
    service: string
    message: string
}

const logEntries: LogEntry[] = [
    { id: 1, level: 'ERROR', timestamp: '10:30:15', service: 'auth-service', message: 'Failed login attempt from 103.25.67.89' },
    { id: 2, level: 'WARN', timestamp: '10:28:42', service: 'booking-service', message: 'Slow query detected (450ms)' },
    { id: 3, level: 'INFO', timestamp: '10:25:00', service: 'scheduler', message: 'Cron job completed: daily-attendance-report' },
    { id: 4, level: 'INFO', timestamp: '10:20:15', service: 'payment-service', message: 'Stripe webhook processed: pi_1234' },
    { id: 5, level: 'ERROR', timestamp: '10:15:30', service: 'notification-service', message: 'SMS delivery failed: +852****1234' },
    { id: 6, level: 'DEBUG', timestamp: '10:10:00', service: 'cache-service', message: 'Cache miss for key: programs_list' },
    { id: 7, level: 'INFO', timestamp: '10:05:22', service: 'auth-service', message: 'User session renewed: admin@proactiv.com' },
    { id: 8, level: 'WARN', timestamp: '10:02:18', service: 'payment-service', message: 'Payment retry scheduled for invoice INV-2024-089' },
    { id: 9, level: 'INFO', timestamp: '09:58:45', service: 'booking-service', message: 'Booking confirmed: BK-20260319-042' },
    { id: 10, level: 'ERROR', timestamp: '09:55:10', service: 'email-service', message: 'SMTP connection timeout after 30s' },
    { id: 11, level: 'DEBUG', timestamp: '09:50:00', service: 'api-gateway', message: 'Rate limit check passed for IP 203.12.45.67' },
    { id: 12, level: 'INFO', timestamp: '09:45:30', service: 'scheduler', message: 'Background job started: sync-attendance' },
]

const levelConfig: Record<LogLevel, { color: string; bgColor: string; icon: typeof AlertCircle }> = {
    ERROR: { color: 'text-red-600', bgColor: 'bg-red-100 text-red-700', icon: AlertCircle },
    WARN: { color: 'text-yellow-600', bgColor: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
    INFO: { color: 'text-blue-600', bgColor: 'bg-blue-100 text-blue-700', icon: Info },
    DEBUG: { color: 'text-gray-500', bgColor: 'bg-gray-100 text-gray-600', icon: Bug },
}

export default function SystemLogsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeLevel, setActiveLevel] = useState<string>('All')
    const [autoRefresh, setAutoRefresh] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

    const filtered = logEntries.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.service.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesLevel = activeLevel === 'All' || log.level === activeLevel
        return matchesSearch && matchesLevel
    })

    const errorCount = logEntries.filter(l => l.level === 'ERROR').length
    const warnCount = logEntries.filter(l => l.level === 'WARN').length
    const infoCount = logEntries.filter(l => l.level === 'INFO').length

    const stats = [
        { label: 'Total Logs (24h)', value: '4,521', icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Errors', value: '23', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Warnings', value: '89', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'Info', value: '4,409', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
    ]

    const levels = [
        { key: 'All', label: 'All', count: logEntries.length, color: '' },
        { key: 'ERROR', label: 'Error', count: errorCount, color: 'text-red-600' },
        { key: 'WARN', label: 'Warning', count: warnCount, color: 'text-yellow-600' },
        { key: 'INFO', label: 'Info', count: infoCount, color: 'text-blue-600' },
        { key: 'DEBUG', label: 'Debug', count: logEntries.filter(l => l.level === 'DEBUG').length, color: 'text-gray-500' },
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
                    <p className="text-gray-600 mt-1">Real-time log monitoring, filtering, and analysis</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-2">
                        <span className="text-sm text-gray-500">Auto-refresh</span>
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoRefresh ? 'translate-x-5' : ''}`}></span>
                        </button>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
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
                                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
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

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search logs by message or service..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono text-sm"
                                />
                            </div>
                            <div className="flex gap-1.5">
                                {levels.map(l => (
                                    <Button
                                        key={l.key}
                                        variant={activeLevel === l.key ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setActiveLevel(l.key)}
                                        className="gap-1"
                                    >
                                        <span className={activeLevel !== l.key ? l.color : ''}>{l.label}</span>
                                        <span className="text-xs opacity-60">({l.count})</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Log Entries */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Monitor className="w-5 h-5 text-gray-600" />
                                Log Stream
                            </CardTitle>
                            {autoRefresh && (
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-green-500 animate-spin" />
                                    <span className="text-xs text-green-600">Live</span>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm space-y-0.5 max-h-[600px] overflow-y-auto">
                            {filtered.map((log, i) => {
                                const config = levelConfig[log.level]
                                return (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + i * 0.03 }}
                                        className="flex items-start gap-3 py-2 px-3 rounded hover:bg-gray-900/50 transition-colors group"
                                    >
                                        <span className="text-gray-500 text-xs shrink-0 pt-0.5">{log.timestamp}</span>
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                            log.level === 'ERROR' ? 'bg-red-900/50 text-red-400' :
                                            log.level === 'WARN' ? 'bg-yellow-900/50 text-yellow-400' :
                                            log.level === 'INFO' ? 'bg-blue-900/50 text-blue-400' :
                                            'bg-gray-800 text-gray-400'
                                        }`}>{log.level.padEnd(5)}</span>
                                        <span className="text-cyan-400 shrink-0">{log.service}</span>
                                        <span className="text-gray-300">{log.message}</span>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
