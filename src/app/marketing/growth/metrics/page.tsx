'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import GrowthAnalyticsService, { GrowthMetric } from '@/services/modules/growth-analytics.service'
import { motion } from 'framer-motion'
import { LineChart, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function MetricsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<GrowthMetric[]>([])
    const [period, setPeriod] = useState('30d')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadMetrics()
    }, [isAuthenticated, router, period])

    const loadMetrics = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await GrowthAnalyticsService.getGrowthMetrics(period)
            setMetrics(response)
        } catch (err) {
            console.error('Error loading metrics:', err)
            setError('Failed to load growth metrics')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading metrics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Growth Metrics</h1>
                        <p className="text-gray-600">Detailed view of all growth metrics</p>
                    </div>
                    <Button data-testid="btn-router-marketing-growth-metrics" onClick={() => router.push('/marketing/growth')} variant="outline">
                        Back to Overview
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {metrics.map((metric, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">{metric.name}</p>
                                            <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                                        </div>
                                        <div className={`p-2 rounded-lg ${metric.trend === 'up' ? 'bg-green-100' : metric.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'}`}>
                                            {metric.trend === 'up' ? (
                                                <ArrowUp className="w-5 h-5 text-green-600" />
                                            ) : metric.trend === 'down' ? (
                                                <ArrowDown className="w-5 h-5 text-red-600" />
                                            ) : (
                                                <LineChart className="w-5 h-5 text-gray-600" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-semibold ${metric.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                                        </span>
                                        <span className="text-xs text-gray-600">from previous period</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
