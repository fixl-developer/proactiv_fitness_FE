'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerAnalyticsService from '@/services/modules/partner-analytics.service'
import { AlertCircle } from 'lucide-react'

export default function Performance() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [goals, setGoals] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadPerformance = async () => {
            try {
                setLoading(true)
                setError(null)
                const partnerId = user?.id || 'partner-1'
                const [metricsRes, goalsRes] = await Promise.all([
                    PartnerAnalyticsService.getPerformanceMetrics(partnerId),
                    PartnerAnalyticsService.getGoalProgress(partnerId, { limit: 10 })
                ])
                setMetrics(metricsRes)
                setGoals(goalsRes.goals || [])
            } catch (err) {
                console.error('Error loading performance:', err)
                setError('Failed to load performance data')
            } finally {
                setLoading(false)
            }
        }

        loadPerformance()
    }, [isAuthenticated, router, user])

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Performance Tracking</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading performance data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <p className="text-gray-600 text-sm font-medium">Satisfaction</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.customerSatisfaction?.toFixed(1) || '0'}%</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.completionRate?.toFixed(1) || '0'}%</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <p className="text-gray-600 text-sm font-medium">Dropout Rate</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.dropoutRate?.toFixed(1) || '0'}%</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <p className="text-gray-600 text-sm font-medium">Quality Score</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.qualityScore?.toFixed(1) || '0'}/100</p>
                            </div>
                        </div>

                        {/* Goals */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Goals Progress</h2>
                            <div className="space-y-4">
                                {goals.map((goal) => (
                                    <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-gray-900">{goal.goalName}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${goal.status === 'on-track' ? 'bg-green-100 text-green-800' :
                                                    goal.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {goal.status}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${goal.progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{goal.progress}% complete</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
