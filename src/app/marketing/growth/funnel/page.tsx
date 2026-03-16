'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import GrowthAnalyticsService, { FunnelStage } from '@/services/modules/growth-analytics.service'
import { motion } from 'framer-motion'
import { Filter, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function FunnelAnalysisPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadFunnelData()
    }, [isAuthenticated, router])

    const loadFunnelData = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await GrowthAnalyticsService.getFunnelAnalysis()
            setFunnelStages(response)
        } catch (err) {
            console.error('Error loading funnel data:', err)
            setError('Failed to load funnel analysis')
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
                    <p className="text-gray-600">Loading funnel analysis...</p>
                </div>
            </div>
        )
    }

    const maxUsers = Math.max(...funnelStages.map(s => s.users), 1)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Funnel Analysis</h1>
                        <p className="text-gray-600">Track user progression through your conversion funnel</p>
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

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-blue-600" />
                            Conversion Funnel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {funnelStages.map((stage, idx) => {
                                const width = (stage.users / maxUsers) * 100
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{stage.users.toLocaleString()}</p>
                                                <p className="text-sm text-gray-600">{stage.conversionRate}% conversion</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${width}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-3"
                                            >
                                                <span className="text-white text-sm font-semibold">{width.toFixed(0)}%</span>
                                            </motion.div>
                                        </div>
                                        {idx < funnelStages.length - 1 && (
                                            <div className="flex justify-center my-3">
                                                <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Funnel Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Total Entries</p>
                                    <p className="text-2xl font-bold text-blue-600">{funnelStages[0]?.users || 0}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Total Conversions</p>
                                    <p className="text-2xl font-bold text-green-600">{funnelStages[funnelStages.length - 1]?.users || 0}</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Overall Conversion Rate</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {funnelStages.length > 0 ? ((funnelStages[funnelStages.length - 1]?.users / funnelStages[0]?.users) * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Optimization Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Focus on stages with the highest drop-off rates</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>A/B test different messaging at each stage</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Simplify the conversion process</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Improve targeting to reduce early drop-offs</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
