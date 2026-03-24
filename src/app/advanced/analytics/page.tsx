'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AdvancedAnalyticsService from '@/services/modules/advanced-analytics.service'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Target, Zap, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdvancedAnalyticsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [overview, setOverview] = useState<any>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadOverview()
    }, [isAuthenticated, router])

    const loadOverview = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await AdvancedAnalyticsService.getAnalyticsOverview()
            setOverview(response)
        } catch (err) {
            console.error('Error loading analytics:', err)
            setError('Failed to load analytics overview')
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
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced Analytics</h1>
                    <p className="text-gray-600">Deep insights and data analysis</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Queries</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.totalQueries?.toLocaleString() || '0'}</p>
                                    </div>
                                    <BarChart3 className="w-12 h-12 text-blue-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Insights</p>
                                        <p className="text-3xl font-bold text-green-600 mt-2">{overview?.insights || 0}</p>
                                    </div>
                                    <Zap className="w-12 h-12 text-green-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Accuracy</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-2">{overview?.accuracy || 0}%</p>
                                    </div>
                                    <Target className="w-12 h-12 text-purple-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Trends</p>
                                        <p className="text-3xl font-bold text-orange-600 mt-2">{overview?.trends || 0}</p>
                                    </div>
                                    <TrendingUp className="w-12 h-12 text-orange-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card id="analytics-custom-nav-card" className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/advanced/analytics/custom')}>
                        <CardContent className="pt-6">
                            <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Custom Analytics</h3>
                            <p className="text-sm text-gray-600">Build custom analytics queries</p>
                        </CardContent>
                    </Card>

                    <Card id="analytics-trends-nav-card" className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/advanced/analytics/trends')}>
                        <CardContent className="pt-6">
                            <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
                            <p className="text-sm text-gray-600">Analyze trends over time</p>
                        </CardContent>
                    </Card>

                    <Card id="analytics-predictions-nav-card" className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/advanced/analytics/predictions')}>
                        <CardContent className="pt-6">
                            <Target className="w-12 h-12 text-purple-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Predictions</h3>
                            <p className="text-sm text-gray-600">Predictive analytics and forecasting</p>
                        </CardContent>
                    </Card>

                    <Card id="analytics-comparisons-nav-card" className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/advanced/analytics/comparisons')}>
                        <CardContent className="pt-6">
                            <Zap className="w-12 h-12 text-orange-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Comparisons</h3>
                            <p className="text-sm text-gray-600">Compare metrics and segments</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
