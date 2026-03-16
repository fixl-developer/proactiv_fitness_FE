'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerAnalyticsService from '@/services/modules/partner-analytics.service'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertCircle } from 'lucide-react'

export default function Analytics() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [trends, setTrends] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadAnalytics = async () => {
            try {
                setLoading(true)
                setError(null)
                const partnerId = user?.id || 'partner-1'
                const [metricsRes, trendsRes] = await Promise.all([
                    PartnerAnalyticsService.getPerformanceMetrics(partnerId),
                    PartnerAnalyticsService.getPerformanceTrends(partnerId)
                ])
                setMetrics(metricsRes)
                setTrends(trendsRes || [])
            } catch (err) {
                console.error('Error loading analytics:', err)
                setError('Failed to load analytics')
            } finally {
                setLoading(false)
            }
        }

        loadAnalytics()
    }, [isAuthenticated, router, user])

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Analytics</h1>

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
                            <p className="text-gray-600">Loading analytics...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">${metrics?.totalRevenue?.toLocaleString() || '0'}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <p className="text-gray-600 text-sm font-medium">Growth Rate</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.growthRate?.toFixed(1) || '0'}%</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.conversionRate?.toFixed(1) || '0'}%</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <p className="text-gray-600 text-sm font-medium">Satisfaction</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.customerSatisfaction?.toFixed(1) || '0'}%</p>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Metrics Comparison</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="students" fill="#10b981" />
                                        <Bar dataKey="bookings" fill="#f59e0b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
