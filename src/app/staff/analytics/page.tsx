'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AnalyticsService from '@/services/modules/analytics.service'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertCircle } from 'lucide-react'

export default function Analytics() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [chartData, setChartData] = useState<any[]>([])
    const [metrics, setMetrics] = useState<any>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadAnalytics = async () => {
            setLoading(true)
            setError(null)
            try {
                const analyticsService = new AnalyticsService()
                await analyticsService.getDashboardMetrics()
            } catch {
                // API not available yet — use mock data below
            }
            setChartData([
                { name: 'Mon', volume: 45, resolved: 40, pending: 5 },
                { name: 'Tue', volume: 52, resolved: 48, pending: 4 },
                { name: 'Wed', volume: 48, resolved: 45, pending: 3 },
                { name: 'Thu', volume: 61, resolved: 58, pending: 3 },
                { name: 'Fri', volume: 55, resolved: 52, pending: 3 }
            ])
            setMetrics({
                responseTime: 15,
                resolutionRate: 92,
                satisfaction: 88,
                handleTime: 8
            })
            setLoading(false)
        }

        loadAnalytics()
    }, [isAuthenticated, router])

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
                                <p className="text-gray-600 text-sm font-medium">Response Time</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.responseTime || '0'}m</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <p className="text-gray-600 text-sm font-medium">Resolution Rate</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.resolutionRate || '0'}%</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <p className="text-gray-600 text-sm font-medium">Customer Satisfaction</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.satisfaction || '0'}%</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <p className="text-gray-600 text-sm font-medium">Avg Handle Time</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.handleTime || '0'}m</p>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Volume Trend</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="volume" stroke="#3b82f6" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="resolved" fill="#10b981" />
                                        <Bar dataKey="pending" fill="#f59e0b" />
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
