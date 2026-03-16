'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import GrowthAnalyticsService from '@/services/modules/growth-analytics.service'
import { motion } from 'framer-motion'
import { BarChart3, AlertCircle, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RetentionPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [retention, setRetention] = useState<any>(null)
    const [churn, setChurn] = useState<any>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadRetentionData()
    }, [isAuthenticated, router])

    const loadRetentionData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [retentionData, churnData] = await Promise.all([
                GrowthAnalyticsService.getRetentionAnalysis('30d'),
                GrowthAnalyticsService.getChurnAnalysis('30d')
            ])
            setRetention(retentionData)
            setChurn(churnData)
        } catch (err) {
            console.error('Error loading retention data:', err)
            setError('Failed to load retention analysis')
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
                    <p className="text-gray-600">Loading retention analysis...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Retention Analysis</h1>
                        <p className="text-gray-600">Monitor user retention and churn rates</p>
                    </div>
                    <Button onClick={() => router.push('/marketing/growth')} variant="outline">
                        Back to Overview
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
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Retention Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{retention?.retentionRate || 0}%</div>
                            <p className="text-xs text-green-600 mt-2">+3% from last month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Churn Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{churn?.churnRate || 0}%</div>
                            <p className="text-xs text-green-600 mt-2">-2% from last month</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Retention Cohorts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {retention?.cohorts && retention.cohorts.map((cohort: any, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-gray-900">{cohort.name}</p>
                                            <span className="text-sm font-bold text-blue-600">{cohort.retention}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cohort.retention}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="bg-blue-600 h-full rounded-full"
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-red-600" />
                                Churn Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Total Churned Users</p>
                                    <p className="text-2xl font-bold text-red-600">{churn?.totalChurned || 0}</p>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Primary Churn Reason</p>
                                    <p className="text-lg font-bold text-orange-600">{churn?.primaryReason || 'N/A'}</p>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Avg Days to Churn</p>
                                    <p className="text-2xl font-bold text-yellow-600">{churn?.avgDaysToChurn || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Retention Improvement Strategies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">Engagement Programs</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Personalized email campaigns</li>
                                    <li>• In-app notifications</li>
                                    <li>• Loyalty rewards program</li>
                                </ul>
                            </div>
                            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">Product Improvements</h4>
                                <ul className="text-sm text-green-800 space-y-1">
                                    <li>• Feature enhancements</li>
                                    <li>• Performance optimization</li>
                                    <li>• User experience improvements</li>
                                </ul>
                            </div>
                            <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                                <h4 className="font-semibold text-purple-900 mb-2">Customer Support</h4>
                                <ul className="text-sm text-purple-800 space-y-1">
                                    <li>• Proactive support outreach</li>
                                    <li>• Faster response times</li>
                                    <li>• Dedicated account managers</li>
                                </ul>
                            </div>
                            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                                <h4 className="font-semibold text-orange-900 mb-2">Win-back Campaigns</h4>
                                <ul className="text-sm text-orange-800 space-y-1">
                                    <li>• Re-engagement offers</li>
                                    <li>• Special discounts</li>
                                    <li>• New feature highlights</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
