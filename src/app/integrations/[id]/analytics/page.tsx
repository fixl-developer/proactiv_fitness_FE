'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import IntegrationManagementService, { IntegrationAnalytics } from '@/services/modules/integration-management.service'
import { motion } from 'framer-motion'
import { BarChart3, AlertCircle, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function IntegrationAnalyticsPage() {
    const router = useRouter()
    const params = useParams()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [analytics, setAnalytics] = useState<IntegrationAnalytics | null>(null)
    const [period, setPeriod] = useState('30d')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadAnalytics()
    }, [isAuthenticated, router, params, period])

    const loadAnalytics = async () => {
        try {
            setLoading(true)
            setError(null)
            const integrationId = params.id as string
            const response = await IntegrationManagementService.getIntegrationAnalytics(integrationId, period)
            setAnalytics(response)
        } catch (err) {
            console.error('Error loading analytics:', err)
            setError('Failed to load analytics')
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
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Integration Analytics</h1>
                        <p className="text-gray-600">Performance and usage metrics</p>
                    </div>
                    <Button onClick={() => router.push(`/integrations/${params.id}`)} variant="outline">
                        Back to Integration
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

                {analytics && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{analytics.totalRequests.toLocaleString()}</div>
                                <p className="text-xs text-gray-600 mt-2">API calls made</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{analytics.successRate}%</div>
                                <p className="text-xs text-gray-600 mt-2">Successful requests</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{analytics.avgResponseTime}ms</div>
                                <p className="text-xs text-gray-600 mt-2">Average latency</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Errors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">{analytics.errors}</div>
                                <p className="text-xs text-gray-600 mt-2">Failed requests</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Request Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Successful</span>
                                        <span className="text-sm font-bold text-green-600">{analytics?.successRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-full rounded-full"
                                            style={{ width: `${analytics?.successRate}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Failed</span>
                                        <span className="text-sm font-bold text-red-600">{100 - (analytics?.successRate || 0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-red-600 h-full rounded-full"
                                            style={{ width: `${100 - (analytics?.successRate || 0)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                Performance Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Requests per Hour</p>
                                    <p className="text-2xl font-bold text-blue-600">{Math.round((analytics?.totalRequests || 0) / 24)}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Successful Requests</p>
                                    <p className="text-2xl font-bold text-green-600">{Math.round(((analytics?.totalRequests || 0) * (analytics?.successRate || 0)) / 100)}</p>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Error Rate</p>
                                    <p className="text-2xl font-bold text-orange-600">{100 - (analytics?.successRate || 0)}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
