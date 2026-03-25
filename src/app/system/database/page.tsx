'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SystemOptimizationService, { DatabaseMetric } from '@/services/modules/system-optimization.service'
import { motion } from 'framer-motion'
import { HardDrive, AlertCircle, Zap, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DatabasePage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<DatabaseMetric[]>([])
    const [analytics, setAnalytics] = useState<any>(null)
    const [optimizing, setOptimizing] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadDatabaseData()
    }, [isAuthenticated, router])

    const loadDatabaseData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [metricsData, analyticsData] = await Promise.all([
                SystemOptimizationService.getDatabaseMetrics(),
                SystemOptimizationService.getDatabaseAnalytics('30d')
            ])
            setMetrics(metricsData)
            setAnalytics(analyticsData)
        } catch (err) {
            console.error('Error loading database data:', err)
            setError('Failed to load database metrics')
        } finally {
            setLoading(false)
        }
    }

    const handleOptimize = async () => {
        try {
            setOptimizing(true)
            await SystemOptimizationService.optimizeDatabase()
            await loadDatabaseData()
            alert('Database optimized successfully')
        } catch (err) {
            console.error('Error optimizing database:', err)
            alert('Failed to optimize database')
        } finally {
            setOptimizing(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading database metrics...</p>
                </div>
            </div>
        )
    }

    const healthyMetrics = metrics.filter(m => m.status === 'healthy').length
    const warningMetrics = metrics.filter(m => m.status === 'warning').length
    const criticalMetrics = metrics.filter(m => m.status === 'critical').length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Database Optimization</h1>
                        <p className="text-gray-600">Monitor and optimize database performance</p>
                    </div>
                    <Button id="btn-optimize-system-database" onClick={handleOptimize} disabled={optimizing} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Zap className="w-4 h-4 mr-2" />
                        {optimizing ? 'Optimizing...' : 'Optimize Database'}
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Healthy Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{healthyMetrics}</div>
                            <p className="text-xs text-gray-600 mt-2">Out of {metrics.length}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Warnings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">{warningMetrics}</div>
                            <p className="text-xs text-gray-600 mt-2">Needs attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Critical</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{criticalMetrics}</div>
                            <p className="text-xs text-gray-600 mt-2">Immediate action</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Last Optimized</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics?.lastOptimized || 'N/A'}</div>
                            <p className="text-xs text-gray-600 mt-2">Ago</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-blue-600" />
                            Database Metrics
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
                                            <p className="text-sm text-gray-600">Current: {metric.value} / Threshold: {metric.threshold}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${metric.status === 'healthy' ? 'bg-green-100 text-green-800' :
                                                metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {metric.status}
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className={`h-full rounded-full ${metric.status === 'healthy' ? 'bg-green-600' :
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
