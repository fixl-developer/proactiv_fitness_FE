'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Activity, Calendar, ChevronLeft, ChevronRight, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import { apiClient } from '@/services/api/client'

interface DashboardMetrics {
    totalRevenue: number
    revenueGrowth: number
    totalStudents: number
    studentGrowth: number
    activeClasses: number
    classesGrowth: number
    attendanceRate: number
    attendanceGrowth: number
}

interface RevenueData {
    date: string
    amount: number
}

interface ActivityLog {
    id: string
    type: string
    description: string
    timestamp: string
    user: string
}

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
    const [revenueData, setRevenueData] = useState<RevenueData[]>([])
    const [activities, setActivities] = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [showDateFilter, setShowDateFilter] = useState(false)

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (selectedMonth !== null) params.append('month', (selectedMonth + 1).toString())
            if (selectedYear) params.append('year', selectedYear.toString())
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)

            const qs = params.toString() ? `?${params.toString()}` : ''

            const [metricsRes, revenueRes, activitiesRes] = await Promise.allSettled([
                apiClient.get(`/admin/dashboard/metrics${qs}`),
                apiClient.get(`/admin/dashboard/revenue-trend${qs}`),
                apiClient.get(`/admin/dashboard/activities${qs}`),
            ])

            if (metricsRes.status === 'fulfilled') {
                const body: any = metricsRes.value
                setMetrics(body?.data || body)
            }
            if (revenueRes.status === 'fulfilled') {
                const body: any = revenueRes.value
                setRevenueData(body?.data || [])
            }
            if (activitiesRes.status === 'fulfilled') {
                const body: any = activitiesRes.value
                setActivities(body?.data || [])
            }

            toast.success('Dashboard data loaded')
        } catch (error) {
            console.error('Error loading dashboard data:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboardData()
    }, [selectedMonth, selectedYear, startDate, endDate])

    const handlePreviousMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11)
            setSelectedYear(selectedYear - 1)
        } else {
            setSelectedMonth(selectedMonth - 1)
        }
    }

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0)
            setSelectedYear(selectedYear + 1)
        } else {
            setSelectedMonth(selectedMonth + 1)
        }
    }

    const handleApplyDateFilter = () => {
        if (startDate && endDate) {
            if (new Date(startDate) > new Date(endDate)) {
                toast.error('Start date must be before end date')
                return
            }
            setShowDateFilter(false)
            loadDashboardData()
        } else {
            toast.error('Please select both start and end dates')
        }
    }

    const handleClearDateFilter = () => {
        setStartDate('')
        setEndDate('')
        setShowDateFilter(false)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
    }

    const GrowthIndicator = ({ value }: { value: number }) => {
        const isPositive = value >= 0
        return (
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span className="text-sm font-medium">{Math.abs(value)}%</span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
                    <p className="text-slate-600">Welcome to your admin dashboard</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-700">Month:</span>
                            <div className="flex items-center gap-2">
                                <button onClick={handlePreviousMonth} className="p-2 text-slate-600 hover:bg-slate-100 rounded transition">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="min-w-[200px] text-center">
                                    <p className="text-sm font-semibold text-slate-900">{months[selectedMonth]} {selectedYear}</p>
                                </div>
                                <button onClick={handleNextMonth} className="p-2 text-slate-600 hover:bg-slate-100 rounded transition">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowDateFilter(!showDateFilter)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                <Calendar className="w-4 h-4" />
                                Date Range
                            </button>
                            {(startDate || endDate) && (
                                <button onClick={handleClearDateFilter} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition">
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {showDateFilter && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Start Date</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">End Date</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <button onClick={handleApplyDateFilter} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                Apply
                            </button>
                        </motion.div>
                    )}
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-slate-600">Loading dashboard data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-slate-600">Total Revenue</h3>
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <p className="text-3xl font-bold text-slate-900">{metrics ? formatCurrency(metrics.totalRevenue) : '$0'}</p>
                                {metrics && <GrowthIndicator value={metrics.revenueGrowth} />}
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-slate-600">Total Students</h3>
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-3xl font-bold text-slate-900">{metrics?.totalStudents || 0}</p>
                                {metrics && <GrowthIndicator value={metrics.studentGrowth} />}
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-slate-600">Active Classes</h3>
                                    <Activity className="w-5 h-5 text-purple-600" />
                                </div>
                                <p className="text-3xl font-bold text-slate-900">{metrics?.activeClasses || 0}</p>
                                {metrics && <GrowthIndicator value={metrics.classesGrowth} />}
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-slate-600">Attendance Rate</h3>
                                    <TrendingUp className="w-5 h-5 text-orange-600" />
                                </div>
                                <p className="text-3xl font-bold text-slate-900">{metrics?.attendanceRate || 0}%</p>
                                {metrics && <GrowthIndicator value={metrics.attendanceGrowth} />}
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-6">Revenue Trend</h2>
                                {revenueData.length > 0 ? (
                                    <div className="space-y-4">
                                        {revenueData.slice(0, 7).map((item, index) => {
                                            const maxAmount = Math.max(...revenueData.map((d) => d.amount))
                                            const percentage = (item.amount / maxAmount) * 100
                                            return (
                                                <div key={index} className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-slate-900 min-w-[80px]">{item.date}</p>
                                                    <div className="flex-1 mx-4 bg-slate-200 rounded-full h-2">
                                                        <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-900 min-w-[100px] text-right">{formatCurrency(item.amount)}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-8">
                                        <AlertCircle className="w-5 h-5 text-slate-400 mr-2" />
                                        <p className="text-slate-500">No revenue data available</p>
                                    </div>
                                )}
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-6">Alerts</h2>
                                <div className="space-y-3">
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm font-medium text-red-900">Low Attendance</p>
                                        <p className="text-xs text-red-700 mt-1">Attendance rate below target</p>
                                    </div>
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm font-medium text-yellow-900">Pending Payments</p>
                                        <p className="text-xs text-yellow-700 mt-1">5 payments awaiting confirmation</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm font-medium text-blue-900">New Enrollments</p>
                                        <p className="text-xs text-blue-700 mt-1">12 new students this month</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-6">Recent Activities</h2>
                            {activities.length > 0 ? (
                                <div className="space-y-4">
                                    {activities.slice(0, 8).map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-slate-200 last:border-b-0">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                                                <p className="text-xs text-slate-500 mt-1">{activity.user} • {activity.timestamp}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-8">
                                    <AlertCircle className="w-5 h-5 text-slate-400 mr-2" />
                                    <p className="text-slate-500">No activities available</p>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    )
}