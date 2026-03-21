'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import GrowthAnalyticsService from '@/services/modules/growth-analytics.service'
import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function GrowthOverviewPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [overview, setOverview] = useState<any>(null)
    const [metrics, setMetrics] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadGrowthData()
    }, [isAuthenticated, router])

    const loadGrowthData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [overviewData, metricsData] = await Promise.all([
                GrowthAnalyticsService.getGrowthOverview(),
                GrowthAnalyticsService.getGrowthMetrics('30d')
            ])
            setOverview(overviewData)
            setMetrics(metricsData)
        } catch (err) {
            console.error('Error loading growth data:', err)
            setError('Failed to load growth overview')
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            await GrowthAnalyticsService.exportGrowthReport('pdf')
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
                    <p className="text-gray-600">Loading growth overview...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Growth Overview</h1>
                        <p className="text-gray-600">Monitor your business growth metrics</p>
                    </div>
                    <Button data-testid="btn-export-marketing-growth" onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white">
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

                {overview && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{overview.totalUsers || 0}</div>
                                <p className="text-xs text-green-600 mt-2">+12% from last month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{overview.activeUsers || 0}</div>
                                <p className="text-xs text-green-600 mt-2">+8% from last month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{overview.conversionRate || 0}%</div>
                                <p className="text-xs text-green-600 mt-2">+2% from last month</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">${overview.revenue || 0}</div>
                                <p className="text-xs text-green-600 mt-2">+15% from last month</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Growth Metrics
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
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{metric.name}</p>
                                            <p className="text-sm text-gray-600">{metric.value}</p>
                                        </div>
                                        <div className={`text-sm font-semibold ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Button data-testid="btn-router-marketing-growth" onClick={() => router.push('/marketing/growth/funnel')} className="w-full justify-start bg-blue-50 text-blue-600 hover:bg-blue-100">
                                    View Funnel Analysis
                                </Button>
                                <Button data-testid="btn-router-marketing-growth" onClick={() => router.push('/marketing/growth/acquisition')} className="w-full justify-start bg-green-50 text-green-600 hover:bg-green-100">
                                    View Acquisition Channels
                                </Button>
                                <Button data-testid="btn-router-marketing-growth" onClick={() => router.push('/marketing/growth/retention')} className="w-full justify-start bg-purple-50 text-purple-600 hover:bg-purple-100">
                                    View Retention Analysis
                                </Button>
                                <Button data-testid="btn-router-marketing-growth" onClick={() => router.push('/marketing/growth/metrics')} className="w-full justify-start bg-orange-50 text-orange-600 hover:bg-orange-100">
                                    View Detailed Metrics
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
