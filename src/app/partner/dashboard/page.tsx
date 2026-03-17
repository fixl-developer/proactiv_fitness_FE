'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import CommissionService from '@/services/modules/commission.service'
import PartnerAnalyticsService from '@/services/modules/partner-analytics.service'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AlertCircle, TrendingUp, Users, DollarSign, Award } from 'lucide-react'

export default function PartnerDashboard() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [profile, setProfile] = useState<any>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [commissionStats, setCommissionStats] = useState<any>(null)
    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadDashboardData = async () => {
            setLoading(true)
            setError(null)

            const partnerId = user?.id || 'partner-1'
            const [profileRes, metricsRes, commissionRes, trendsRes] = await Promise.allSettled([
                PartnerPortalService.getPartnerProfile(partnerId),
                PartnerAnalyticsService.getPerformanceMetrics(partnerId),
                CommissionService.getCommissionStats(partnerId),
                PartnerAnalyticsService.getPerformanceTrends(partnerId)
            ])

            setProfile(profileRes.status === 'fulfilled' ? profileRes.value : null)
            setMetrics(metricsRes.status === 'fulfilled' ? metricsRes.value : null)
            setCommissionStats(commissionRes.status === 'fulfilled' ? commissionRes.value : null)
            setChartData(
                trendsRes.status === 'fulfilled' && trendsRes.value
                    ? trendsRes.value
                    : [
                        { date: 'Mon', revenue: 4000, students: 24 },
                        { date: 'Tue', revenue: 3000, students: 13 },
                        { date: 'Wed', revenue: 2000, students: 9 },
                        { date: 'Thu', revenue: 2780, students: 39 },
                        { date: 'Fri', revenue: 1890, students: 23 }
                    ]
            )
            setLoading(false)
        }

        loadDashboardData()
    }, [isAuthenticated, router, user])

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Partner Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {profile?.name || 'Partner'}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">${metrics?.totalRevenue?.toLocaleString() || '0'}</p>
                            </div>
                            <DollarSign className="w-12 h-12 text-blue-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.totalStudents || '0'}</p>
                            </div>
                            <Users className="w-12 h-12 text-green-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Commission Earned</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">${commissionStats?.totalCommissions?.toLocaleString() || '0'}</p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Rating</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics?.averageRating?.toFixed(1) || '0'}/5</p>
                            </div>
                            <Award className="w-12 h-12 text-yellow-500 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Trend */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Student Growth */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Growth</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="students" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-gray-600 text-sm">Growth Rate</p>
                            <p className="text-2xl font-bold text-green-600 mt-2">{metrics?.growthRate?.toFixed(1) || '0'}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600 text-sm">Conversion Rate</p>
                            <p className="text-2xl font-bold text-blue-600 mt-2">{metrics?.conversionRate?.toFixed(1) || '0'}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600 text-sm">Retention Rate</p>
                            <p className="text-2xl font-bold text-purple-600 mt-2">{metrics?.retentionRate?.toFixed(1) || '0'}%</p>
                        </div>
                    </div>
                </div>
        </div>
    )
}
