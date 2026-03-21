'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SystemOptimizationService, { PerformanceMetric } from '@/services/modules/system-optimization.service'
import { motion } from 'framer-motion'
import { Activity, AlertCircle, TrendingUp, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PerformancePage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
    const [overview, setOverview] = useState<any>(null)
    const [period, setPeriod] = useState('30d')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadPerformanceData()
    }, [isAuthenticated, router, period])

    const loadPerformanceData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [metricsData, overviewData] = await Promise.all([
                SystemOptimizationService.getPerformanceMetrics(period),
                SystemOptimizationService.getPerformanceOverview()
            ])
            setMetrics(metricsData)
            setOverview(overviewData)
        } catch (err) {
            console.error('Error loading performance data:', err)
            setError('Failed to load performance metrics')
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            await SystemOptimizationService.exportSystemReport('pdf')
            alert('Report exported successfully')
        } catch (err) {
            console.error('Error exporting report:', err)
            alert('Failed to export report')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading performance metrics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Performance Monitoring</h1>
                        <p className="text-gray-600">Monitor system performance metrics</p>
                    </div>
                    <Button data-testid="btn-export-system-performance" onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="mb-6 flex gap-2">
                    {['7d', '30d', '90d', '1y'].map((p) => (
                        <Button
                            key={p}
                            onClick={() => setPeriod(p)}
                            variant={period === p ? 'default' : 'outline'}
                            className={period === p ? 'bg-blue-600 text-white' : ''}
                        >
                            {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : '1 Year'}
                        </Button>
                    ))}
                </div>

                {overview && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">CPU Usage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{overview.cpuUsage}%</div>
                                <p className="text-xs text-gray-600 mt-2">Current usage</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Memory Usage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{overview.memoryUsage}%</div>
                                <p className="text-xs text-gray-600 mt-2">Current usage</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Disk Usage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{overview.diskUsage}%</div>
                                <p className="text-xs text-gray-600 mt-2">Current usage</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Uptime</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{overview.uptime}h</div>
                                <p className="text-xs text-gray-600 mt-2">System uptime</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Performance Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {metrics.map((metric, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 border border-gray-200 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                                            <p className="text-sm text-gray-600">{metric.value} {metric.unit}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${metric.status === 'good' ? 'bg-green-100 text-green-800' :
                                                metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {metric.status}
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(metric.value, 100)}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className={`h-full rounded-full ${metric.status === 'good' ? 'bg-green-600' :
                                                    metric.status === 'warning' ? 'bg-yellow-600' :
                                                        'bg-red-600'
                                                }`}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
