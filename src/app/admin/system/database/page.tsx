'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Database, Clock, HardDrive, ArrowUpCircle, RefreshCw, Download, Zap, CheckCircle, AlertTriangle, Server, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface StorageItem {
    name: string
    size: number
    color: string
}

interface RecentOp {
    op: string
    time: string
    status: string
    statusColor: string
}

interface ConnectionPool {
    active: number
    idle: number
    max: number
}

function formatTime(timestamp: string): string {
    if (!timestamp) return ''
    try {
        const d = new Date(timestamp)
        if (isNaN(d.getTime())) return timestamp
        const now = new Date()
        const diff = now.getTime() - d.getTime()
        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        return d.toLocaleDateString()
    } catch {
        return timestamp
    }
}

export default function DatabaseHealthPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [dbConnected, setDbConnected] = useState(false)
    const [dbStatus, setDbStatus] = useState<string>('Checking...')
    const [responseTime, setResponseTime] = useState<number | null>(null)
    const [uptime, setUptime] = useState<string>('N/A')
    const [storageBreakdown, setStorageBreakdown] = useState<StorageItem[]>([])
    const [totalStorage, setTotalStorage] = useState(20)
    const [recentOps, setRecentOps] = useState<RecentOp[]>([])
    const [pool, setPool] = useState<ConnectionPool>({ active: 0, idle: 0, max: 100 })
    const [avgQueryTime, setAvgQueryTime] = useState(0)
    const [healthDetails, setHealthDetails] = useState<any>(null)

    const loadData = useCallback(async () => {
        let connected = false
        let measuredTime = 0

        // 1. Check /health for DB connection status
        try {
            const startTime = performance.now()
            const data = await apiClient.get<any>('/health')
            measuredTime = Math.round(performance.now() - startTime)
            setResponseTime(measuredTime)
            setHealthDetails(data)

            const db = data?.database || data?.db
            if (db) {
                const st = db.status || 'unknown'
                const ok = st === 'connected' || st === 'ok' || st === 'up'
                connected = true
                setDbConnected(ok)
                setDbStatus(ok ? 'Connected' : st.charAt(0).toUpperCase() + st.slice(1))

                // Extract pool info if available
                if (db.connections || db.pool) {
                    const p = db.connections || db.pool
                    setPool({
                        active: p.active || p.current || 0,
                        idle: p.idle || p.available || 0,
                        max: p.max || p.limit || 100,
                    })
                }
            } else {
                // Health works so DB is likely connected
                connected = true
                setDbConnected(true)
                setDbStatus('Connected (inferred)')
            }

            // Extract uptime
            if (data?.uptime) {
                const days = Math.floor(data.uptime / 86400)
                const hours = Math.floor((data.uptime % 86400) / 3600)
                const mins = Math.floor((data.uptime % 3600) / 60)
                setUptime(`${days}d ${hours}h ${mins}m`)
            } else if (data?.uptimeSeconds) {
                const s = data.uptimeSeconds
                const days = Math.floor(s / 86400)
                const hours = Math.floor((s % 86400) / 3600)
                setUptime(`${days}d ${hours}h`)
            }
        } catch {
            setResponseTime(null)
            setDbConnected(false)
            setDbStatus('Unreachable')
        }

        // 2. Fetch DB metrics from observability
        try {
            const metricsData = await apiClient.get<any>('/observability/metrics', {
                params: { type: 'database' }
            })
            const metrics = Array.isArray(metricsData) ? metricsData : (metricsData?.data || metricsData?.metrics || [])

            // Extract storage info
            const storageMetric = metricsData?.storage || metricsData?.disk
            if (storageMetric) {
                const items: StorageItem[] = []
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-400', 'bg-gray-400']
                if (Array.isArray(storageMetric)) {
                    storageMetric.forEach((s: any, i: number) => {
                        items.push({ name: s.name || s.collection || `Table ${i + 1}`, size: s.size || s.sizeGB || 0, color: colors[i % colors.length] })
                    })
                }
                if (items.length > 0) setStorageBreakdown(items)
                if (metricsData?.totalStorage) setTotalStorage(metricsData.totalStorage)
            }

            // Extract query time
            if (metricsData?.avgQueryTime) setAvgQueryTime(metricsData.avgQueryTime)
            else if (metricsData?.queryTime) setAvgQueryTime(metricsData.queryTime)

            // Extract pool info if not from health
            if (metricsData?.connections || metricsData?.pool) {
                const p = metricsData.connections || metricsData.pool
                if (p.active !== undefined) {
                    setPool({
                        active: p.active || 0,
                        idle: p.idle || 0,
                        max: p.max || 100,
                    })
                }
            }

            // Build recent ops from metrics
            if (metrics.length > 0) {
                const ops: RecentOp[] = metrics.slice(0, 5).map((m: any) => ({
                    op: m.operation || m.query || m.name || m.type || 'DB Operation',
                    time: formatTime(m.timestamp || m.createdAt || m.time || ''),
                    status: m.status === 'error' || m.status === 'failed' ? 'Failed' : 'Success',
                    statusColor: m.status === 'error' || m.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
                }))
                if (ops.length > 0) setRecentOps(ops)
            }
        } catch {
            // metrics not available
        }

        // 3. Fetch recent operations from audit-vault if we don't have any yet
        if (recentOps.length === 0) {
            try {
                const auditData = await apiClient.get<any>('/audit-vault/logs', {
                    params: { limit: 5 }
                })
                const logs = Array.isArray(auditData) ? auditData : (auditData?.data || auditData?.logs || [])
                const ops: RecentOp[] = logs.slice(0, 5).map((l: any) => ({
                    op: l.action || l.type || l.message || 'Operation',
                    time: formatTime(l.timestamp || l.createdAt || l.time || ''),
                    status: l.status === 'error' || l.status === 'failed' ? 'Failed' : 'Success',
                    statusColor: l.status === 'error' || l.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
                }))
                if (ops.length > 0) setRecentOps(ops)
            } catch {
                // no audit data
            }
        }

        setIsLoading(false)
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const usedStorage = storageBreakdown.reduce((acc, item) => acc + item.size, 0)
    const poolTotal = pool.active + pool.idle
    const available = pool.max - poolTotal

    const stats = [
        { label: 'Connections', value: dbConnected ? poolTotal.toString() : '0', icon: Database, gradient: dbConnected ? 'from-blue-500 to-blue-600' : 'from-red-500 to-red-600', bgGradient: dbConnected ? 'from-blue-50 to-blue-100' : 'from-red-50 to-red-100' },
        { label: 'Avg Query Time', value: avgQueryTime > 0 ? `${avgQueryTime}ms` : (responseTime !== null ? `${responseTime}ms` : 'N/A'), icon: Clock, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
        { label: 'Storage', value: storageBreakdown.length > 0 ? `${usedStorage.toFixed(1)}GB / ${totalStorage}GB` : (dbConnected ? 'Active' : 'N/A'), icon: HardDrive, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
        { label: 'Uptime', value: uptime, icon: ArrowUpCircle, gradient: dbConnected ? 'from-orange-500 to-orange-600' : 'from-red-500 to-red-600', bgGradient: dbConnected ? 'from-orange-50 to-orange-100' : 'from-red-50 to-red-100' },
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
                    <Button data-testid="btn-action-admin-system-database" variant="outline" size="sm" onClick={() => { setIsLoading(true); loadData() }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button data-testid="btn-toast-admin-system-database" variant="outline" size="sm" onClick={() => toast.info('Optimize triggered')}>
                        <Zap className="w-4 h-4 mr-2" /> Optimize
                    </Button>
                    <Button data-testid="btn-toast-admin-system-database" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => toast.info('Backup initiated')}>
                        <Download className="w-4 h-4 mr-2" /> Backup Now
                    </Button>
                </motion.div>
            </div>

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

            {/* Connection Status Banner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${dbConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <div>
                                    <p className="font-medium text-gray-900">Database: {dbStatus}</p>
                                    <p className="text-xs text-gray-500">
                                        {responseTime !== null ? `Health check responded in ${responseTime}ms` : 'Unable to reach health endpoint'}
                                    </p>
                                </div>
                            </div>
                            <Badge className={dbConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {dbConnected ? 'Online' : 'Offline'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Storage Usage */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HardDrive className="w-5 h-5 text-amber-600" /> Storage Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {storageBreakdown.length > 0 ? (
                                <>
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Used: {usedStorage.toFixed(1)} GB</span>
                                            <span className="text-gray-600">Total: {totalStorage} GB</span>
                                        </div>
                                        <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden flex">
                                            {storageBreakdown.map((item, i) => (
                                                <motion.div key={i} className={`${item.color} h-full`} initial={{ width: 0 }} animate={{ width: `${(item.size / totalStorage) * 100}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}></motion.div>
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
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <HardDrive className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm">Storage metrics not available from observability endpoint</p>
                                    <p className="text-xs text-gray-400 mt-1">Database is {dbConnected ? 'connected' : 'unreachable'}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Connection Pool */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-600" /> Connection Pool
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Active Connections</span>
                                        <span className="font-medium text-blue-600">{pool.active}</span>
                                    </div>
                                    <Progress value={pool.max > 0 ? (pool.active / pool.max) * 100 : 0} className="h-3" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Idle Connections</span>
                                        <span className="font-medium text-green-600">{pool.idle}</span>
                                    </div>
                                    <Progress value={pool.max > 0 ? (pool.idle / pool.max) * 100 : 0} className="h-3" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Max Connections</span>
                                        <span className="font-medium text-gray-600">{pool.max}</span>
                                    </div>
                                    <Progress value={100} className="h-3" />
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">{pool.active}</p>
                                            <p className="text-xs text-gray-500">Active</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">{pool.idle}</p>
                                            <p className="text-xs text-gray-500">Idle</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-600">{available > 0 ? available : 0}</p>
                                            <p className="text-xs text-gray-500">Available</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Operations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-green-600" /> Recent Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentOps.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Database className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">No recent operations recorded</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentOps.map((op, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {op.status === 'Success' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                                            <div>
                                                <span className="text-sm font-medium text-gray-900">{op.op}</span>
                                                <p className="text-xs text-gray-500">{op.time}</p>
                                            </div>
                                        </div>
                                        <Badge className={op.statusColor}>{op.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
