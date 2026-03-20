'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Activity, Clock, AlertCircle, Wifi, TrendingUp, Zap, Server, Database, HardDrive, Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface HealthService {
    name: string
    status: string
    color: string
    icon: any
    responseTime?: string
}

interface EndpointInfo {
    path: string
    method: string
    methodColor: string
    requests: string
    avgTime: string
    errorRate: string
    status: string
}

interface MetricEntry {
    endpoint?: string
    method?: string
    path?: string
    count?: number
    requests?: number
    avgResponseTime?: number
    avgTime?: number
    errorRate?: number
    errors?: number
}

function getMethodColor(method: string): string {
    const m = method.toUpperCase()
    if (m === 'GET') return 'bg-green-100 text-green-700'
    if (m === 'POST') return 'bg-blue-100 text-blue-700'
    if (m === 'PUT' || m === 'PATCH') return 'bg-amber-100 text-amber-700'
    if (m === 'DELETE') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
}

export default function APIMonitoringPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [healthServices, setHealthServices] = useState<HealthService[]>([])
    const [endpoints, setEndpoints] = useState<EndpointInfo[]>([])
    const [totalRequests, setTotalRequests] = useState(0)
    const [avgResponseTime, setAvgResponseTime] = useState(0)
    const [errorRate, setErrorRate] = useState(0)
    const [uptime, setUptime] = useState<string>('N/A')
    const [responseTime, setResponseTime] = useState<number | null>(null)
    const [lastChecked, setLastChecked] = useState<string>('')
    const [hourlyData, setHourlyData] = useState<number[]>([])

    const loadData = useCallback(async () => {
        const services: HealthService[] = []
        let healthOk = false
        let measuredTime = 0

        // 1. Check /health and measure response time
        try {
            const startTime = performance.now()
            const data = await apiClient.get<any>('/health')
            measuredTime = Math.round(performance.now() - startTime)
            setResponseTime(measuredTime)
            healthOk = true

            // Extract uptime
            if (data?.uptime) {
                const days = Math.floor(data.uptime / 86400)
                const hours = Math.floor((data.uptime % 86400) / 3600)
                setUptime(`${days}d ${hours}h`)
            } else if (data?.uptimeSeconds) {
                const days = Math.floor(data.uptimeSeconds / 86400)
                const hours = Math.floor((data.uptimeSeconds % 86400) / 3600)
                setUptime(`${days}d ${hours}h`)
            }

            // Build service health from /health response
            services.push({
                name: 'API Server',
                status: 'Operational',
                color: 'bg-green-500',
                icon: Server,
                responseTime: `${measuredTime}ms`,
            })

            const db = data?.database || data?.db
            if (db) {
                const st = db.status || 'unknown'
                const ok = st === 'connected' || st === 'ok' || st === 'up'
                services.push({ name: 'Database', status: ok ? 'Operational' : 'Degraded', color: ok ? 'bg-green-500' : 'bg-yellow-500', icon: Database })
            } else {
                services.push({ name: 'Database', status: 'Operational', color: 'bg-green-500', icon: Database })
            }

            const cache = data?.redis || data?.cache
            if (cache) {
                const st = cache.status || 'unknown'
                const ok = st === 'connected' || st === 'ok'
                services.push({ name: 'Cache (Redis)', status: ok ? 'Operational' : 'Degraded', color: ok ? 'bg-green-500' : 'bg-yellow-500', icon: HardDrive })
            } else {
                services.push({ name: 'Cache (Redis)', status: 'Unknown', color: 'bg-gray-400', icon: HardDrive })
            }

            services.push({ name: 'Email Service', status: data?.email?.status === 'ok' ? 'Operational' : 'Unknown', color: data?.email?.status === 'ok' ? 'bg-green-500' : 'bg-gray-400', icon: Mail })
        } catch {
            const elapsed = Math.round(performance.now())
            setResponseTime(null)
            services.push(
                { name: 'API Server', status: 'Down', color: 'bg-red-500', icon: Server, responseTime: 'N/A' },
                { name: 'Database', status: 'Unknown', color: 'bg-gray-400', icon: Database },
                { name: 'Cache (Redis)', status: 'Unknown', color: 'bg-gray-400', icon: HardDrive },
                { name: 'Email Service', status: 'Unknown', color: 'bg-gray-400', icon: Mail },
            )
        }

        setHealthServices(services)

        // 2. Fetch observability metrics
        try {
            const metricsData = await apiClient.get<any>('/observability/metrics')
            const metrics: MetricEntry[] = Array.isArray(metricsData) ? metricsData : (metricsData?.data || metricsData?.metrics || [])

            if (metrics.length > 0) {
                const mapped: EndpointInfo[] = metrics.slice(0, 10).map((m: MetricEntry) => {
                    const method = m.method || (m.endpoint ? m.endpoint.split(' ')[0] : 'GET')
                    const path = m.path || m.endpoint || ''
                    const count = m.count || m.requests || 0
                    const avg = m.avgResponseTime || m.avgTime || 0
                    const errRate = m.errorRate || (m.errors && count ? (m.errors / count) * 100 : 0)
                    return {
                        path: `${method} ${path}`,
                        method: method.toUpperCase(),
                        methodColor: getMethodColor(method),
                        requests: count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString(),
                        avgTime: `${Math.round(avg)}ms`,
                        errorRate: `${errRate.toFixed(1)}%`,
                        status: errRate > 5 ? 'Degraded' : 'Healthy',
                    }
                })
                setEndpoints(mapped)
            }
        } catch {
            // metrics not available
        }

        // 3. Fetch aggregated stats
        try {
            const statsData = await apiClient.get<any>('/observability/metrics/stats')
            setTotalRequests(statsData?.totalRequests || statsData?.total || 0)
            setAvgResponseTime(statsData?.avgResponseTime || statsData?.averageResponseTime || measuredTime)
            setErrorRate(statsData?.errorRate || statsData?.error_rate || 0)
            if (statsData?.hourly) {
                setHourlyData(Array.isArray(statsData.hourly) ? statsData.hourly : [])
            }
        } catch {
            // Use measured data as fallback
            setAvgResponseTime(measuredTime)
        }

        setLastChecked(new Date().toLocaleTimeString())
        setIsLoading(false)
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const maxValue = hourlyData.length > 0 ? Math.max(...hourlyData, 1) : 1

    const stats = [
        { label: 'Total Requests', value: totalRequests >= 1000 ? `${(totalRequests / 1000).toFixed(1)}K` : totalRequests.toString(), icon: Activity, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', sub: lastChecked ? `As of ${lastChecked}` : '' },
        { label: 'Avg Response Time', value: avgResponseTime > 0 ? `${avgResponseTime}ms` : (responseTime !== null ? `${responseTime}ms` : 'N/A'), icon: Clock, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100', sub: avgResponseTime > 0 ? (avgResponseTime < 200 ? 'Fast' : avgResponseTime < 500 ? 'Moderate' : 'Slow') : '' },
        { label: 'Error Rate', value: `${errorRate.toFixed(1)}%`, icon: AlertCircle, gradient: errorRate > 5 ? 'from-red-500 to-red-600' : 'from-purple-500 to-purple-600', bgGradient: errorRate > 5 ? 'from-red-50 to-red-100' : 'from-purple-50 to-purple-100', sub: errorRate > 5 ? 'Above threshold' : 'Healthy' },
        { label: 'Uptime', value: uptime, icon: Wifi, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100', sub: 'Since last restart' },
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
                    <h1 className="text-3xl font-bold text-gray-900">API Monitoring</h1>
                    <p className="text-gray-600 mt-1">Real-time performance metrics, endpoint health, and service status</p>
                </motion.div>
                <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); loadData() }}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
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
                            {stat.sub && <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>}
                        </div>
                    </motion.div>
                ))}
            </div>

            {hourlyData.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" /> Request Volume (Last 24 Hours)
                                </CardTitle>
                                <Badge variant="outline">Hourly</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-1.5 h-48">
                                {hourlyData.map((value, i) => (
                                    <motion.div key={i} className="flex-1 group relative" initial={{ height: 0 }} animate={{ height: `${(value / maxValue) * 100}%` }} transition={{ delay: 0.5 + i * 0.03, duration: 0.4 }}>
                                        <div className={`w-full h-full rounded-t-sm transition-colors ${value > maxValue * 0.8 ? 'bg-blue-500 hover:bg-blue-600' : value > maxValue * 0.4 ? 'bg-blue-400 hover:bg-blue-500' : 'bg-blue-300 hover:bg-blue-400'}`}></div>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{value} req</div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-600" /> Top Endpoints
                                </CardTitle>
                                <Badge variant="outline">{endpoints.length} endpoints</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {endpoints.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Activity className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm">No endpoint metrics available yet</p>
                                </div>
                            ) : (
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
                                                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 + i * 0.05 }} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                    <td className="py-3 px-3">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={`text-xs ${ep.methodColor}`}>{ep.method}</Badge>
                                                            <code className="text-sm text-gray-700 font-mono">{ep.path.replace(/^\w+\s/, '')}</code>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 text-sm font-medium text-gray-900">{ep.requests}</td>
                                                    <td className="py-3 px-3 text-sm text-gray-600">{ep.avgTime}</td>
                                                    <td className="py-3 px-3 text-sm text-gray-600">{ep.errorRate}</td>
                                                    <td className="py-3 px-3"><Badge className={ep.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{ep.status}</Badge></td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" /> Service Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {healthServices.map((service, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <service.icon className="w-5 h-5 text-gray-600" />
                                            <div>
                                                <span className="font-medium text-sm text-gray-900">{service.name}</span>
                                                {service.responseTime && <p className="text-xs text-gray-400">{service.responseTime}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${service.color} ${service.status === 'Operational' ? 'animate-pulse' : ''}`}></div>
                                            <span className={`text-xs font-medium ${service.status === 'Operational' ? 'text-green-600' : service.status === 'Down' ? 'text-red-600' : service.status === 'Degraded' ? 'text-yellow-600' : 'text-gray-500'}`}>
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
