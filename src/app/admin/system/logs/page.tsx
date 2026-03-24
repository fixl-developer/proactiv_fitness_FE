'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Download, RefreshCw, AlertOctagon, AlertTriangle, Info, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

interface LogEntry {
    id: string
    level: LogLevel
    timestamp: string
    source: string
    message: string
    service?: string
    action?: string
}

const levelConfig: Record<LogLevel, { termBg: string; termText: string }> = {
    ERROR: { termBg: 'bg-red-900/50', termText: 'text-red-400' },
    WARN: { termBg: 'bg-yellow-900/50', termText: 'text-yellow-400' },
    INFO: { termBg: 'bg-blue-900/50', termText: 'text-blue-400' },
    DEBUG: { termBg: 'bg-gray-800', termText: 'text-gray-400' },
}

function normalizeLevel(level: string): LogLevel {
    const l = level?.toUpperCase() || 'INFO'
    if (l === 'ERROR' || l === 'ERR') return 'ERROR'
    if (l === 'WARN' || l === 'WARNING') return 'WARN'
    if (l === 'DEBUG' || l === 'TRACE') return 'DEBUG'
    return 'INFO'
}

function formatTimestamp(ts: string): string {
    if (!ts) return ''
    try {
        const d = new Date(ts)
        if (isNaN(d.getTime())) return ts
        return d.toLocaleTimeString('en-US', { hour12: false })
    } catch {
        return ts
    }
}

function formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0]
}

export default function SystemLogsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [logEntries, setLogEntries] = useState<LogEntry[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeLevel, setActiveLevel] = useState<string>('All')
    const [autoRefresh, setAutoRefresh] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const loadLogs = useCallback(async () => {
        const allLogs: LogEntry[] = []

        // Fetch observability logs
        try {
            const params: Record<string, string> = { limit: '200' }
            if (activeLevel !== 'All') params.level = activeLevel.toLowerCase()
            if (startDate) params.startDate = startDate
            if (endDate) params.endDate = endDate

            const query = new URLSearchParams(params).toString()
            const data = await apiClient.get<any>(`/observability/logs?${query}`)
            const items = Array.isArray(data) ? data : (data?.data || data?.logs || [])
            items.forEach((l: any, i: number) => {
                allLogs.push({
                    id: `obs-${l.id || l._id || i}`,
                    level: normalizeLevel(l.level || l.severity || 'INFO'),
                    timestamp: l.timestamp || l.time || l.createdAt || '',
                    source: l.service || l.source || l.module || 'system',
                    message: l.message || l.description || l.details || '',
                    service: l.service || l.source || 'observability',
                })
            })
        } catch {
            // Observability logs not available
        }

        // Fetch audit logs
        try {
            const params: Record<string, string> = { limit: '200', page: '1' }
            if (searchQuery) params.search = searchQuery
            if (startDate) params.startDate = startDate
            if (endDate) params.endDate = endDate

            const query = new URLSearchParams(params).toString()
            const data = await apiClient.get<any>(`/audit-vault/logs?${query}`)
            const items = Array.isArray(data) ? data : (data?.data || data?.logs || [])
            items.forEach((l: any, i: number) => {
                allLogs.push({
                    id: `audit-${l.id || l._id || i}`,
                    level: normalizeLevel(l.level || l.severity || 'INFO'),
                    timestamp: l.timestamp || l.time || l.createdAt || '',
                    source: l.service || l.source || l.module || 'audit',
                    message: l.message || l.action || l.description || l.details || '',
                    service: l.service || 'audit-vault',
                    action: l.action,
                })
            })
        } catch {
            // Audit logs not available
        }

        // Sort by timestamp descending
        allLogs.sort((a, b) => {
            try {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            } catch {
                return 0
            }
        })

        setLogEntries(allLogs)
        setIsLoading(false)
    }, [activeLevel, startDate, endDate, searchQuery])

    useEffect(() => {
        loadLogs()
    }, [loadLogs])

    // Auto-refresh polling
    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                loadLogs()
            }, 5000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [autoRefresh, loadLogs])

    const filtered = logEntries.filter(log => {
        const matchesSearch = !searchQuery ||
            log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.source.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesLevel = activeLevel === 'All' || log.level === activeLevel
        return matchesSearch && matchesLevel
    })

    const errorCount = logEntries.filter(l => l.level === 'ERROR').length
    const warnCount = logEntries.filter(l => l.level === 'WARN').length
    const infoCount = logEntries.filter(l => l.level === 'INFO').length
    const debugCount = logEntries.filter(l => l.level === 'DEBUG').length

    const stats = [
        { label: 'Total Logs 24h', value: logEntries.length.toString(), icon: FileText, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
        { label: 'Errors', value: errorCount.toString(), icon: AlertOctagon, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
        { label: 'Warnings', value: warnCount.toString(), icon: AlertTriangle, gradient: 'from-yellow-500 to-yellow-600', bgGradient: 'from-yellow-50 to-yellow-100' },
        { label: 'Info', value: infoCount.toString(), icon: Info, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
    ]

    const levels = [
        { key: 'All', label: 'All', count: logEntries.length, color: '' },
        { key: 'ERROR', label: 'Error', count: errorCount, color: 'text-red-600' },
        { key: 'WARN', label: 'Warning', count: warnCount, color: 'text-yellow-600' },
        { key: 'INFO', label: 'Info', count: infoCount, color: 'text-blue-600' },
        { key: 'DEBUG', label: 'Debug', count: debugCount, color: 'text-gray-500' },
    ]

    const exportToCsv = () => {
        if (filtered.length === 0) {
            toast.error('No logs to export')
            return
        }
        const headers = ['Timestamp', 'Level', 'Source', 'Message']
        const rows = filtered.map(log => [
            log.timestamp,
            log.level,
            log.source,
            `"${log.message.replace(/"/g, '""')}"`,
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success(`Exported ${filtered.length} log entries`)
    }

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
                    <p className="text-gray-600 mt-1">Real-time log monitoring, filtering, and analysis</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-2">
                        <span className="text-sm text-gray-500">Auto-refresh</span>
                        <button id="btn-admin-system-logs-4"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoRefresh ? 'translate-x-5' : ''}`}></span>
                        </button>
                    </div>
                    <Button id="btn-action-admin-system-logs" variant="outline" size="sm" onClick={() => { setIsLoading(true); loadLogs() }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button id="btn-export-to-csv-admin-system-logs" variant="outline" size="sm" onClick={exportToCsv}>
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
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
                                <input id="input-text-admin-system-logs" type="text" placeholder="Search logs by message or service..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono text-sm" />
                            </div>
                            <div className="flex gap-2">
                                <input id={`input-date-admin-system-logs-${i}`}
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                    placeholder="Start date"
                                />
                                <input id="input-date-admin-system-logs"
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none"
                                    placeholder="End date"
                                />
                            </div>
                        </div>
                        <div className="flex gap-1.5 mt-3">
                            {levels.map(l => (
                                <Button id="btn-set-active-level-admin-system-logs" key={l.key} variant={activeLevel === l.key ? 'default' : 'outline'} size="sm" onClick={() => setActiveLevel(l.key)} className="gap-1">
                                    <span className={activeLevel !== l.key ? l.color : ''}>{l.label}</span>
                                    <span className="text-xs opacity-60">({l.count})</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Log Stream */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-600" /> Log Stream
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
                            {filtered.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p>No logs match your filters</p>
                                </div>
                            ) : (
                                filtered.map((log, i) => {
                                    const config = levelConfig[log.level] || levelConfig.INFO
                                    return (
                                        <motion.div key={log.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.02, 1) }} className="flex items-start gap-3 py-2 px-3 rounded hover:bg-gray-900/50 transition-colors group">
                                            <span className="text-gray-500 text-xs shrink-0 pt-0.5">{formatTimestamp(log.timestamp)}</span>
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${config.termBg} ${config.termText}`}>{log.level.padEnd(5)}</span>
                                            <span className="text-cyan-400 shrink-0">{log.source}</span>
                                            <span className="text-gray-300">{log.message}</span>
                                        </motion.div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
