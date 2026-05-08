'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService, SupportAnalytics } from '@/services/supportStaffService'
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { AlertCircle, Zap, Target, Star, Clock, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'

type Period = '7d' | '30d' | '90d'

export default function Analytics() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [period, setPeriod] = useState<Period>('30d')
    const [analytics, setAnalytics] = useState<SupportAnalytics | null>(null)

    const loadAnalytics = useCallback(async (selectedPeriod: Period) => {
        setLoading(true)
        setError(null)
        try {
            const data = await supportStaffService.getAnalytics(selectedPeriod)
            if (data && data.ticketTrends && data.ticketTrends.length > 0) {
                setAnalytics(data)
            } else {
                // API returned empty — try to calculate from tickets
                const fallback = await buildFallbackAnalytics()
                setAnalytics(fallback)
            }
        } catch {
            try {
                const fallback = await buildFallbackAnalytics()
                setAnalytics(fallback)
                setError('Analytics API unavailable. Showing data derived from tickets.')
            } catch {
                setError('Failed to load analytics data.')
                setAnalytics(null)
            }
        } finally {
            setLoading(false)
        }
    }, [])

    async function buildFallbackAnalytics(): Promise<SupportAnalytics> {
        const result = await supportStaffService.getTickets({})
        const tickets = result.tickets || []

        // Build ticket trends from tickets grouped by date
        const trendMap: Record<string, { tickets: number; resolved: number }> = {}
        tickets.forEach((t) => {
            const date = t.created?.split('T')[0] || 'unknown'
            if (!trendMap[date]) trendMap[date] = { tickets: 0, resolved: 0 }
            trendMap[date].tickets++
            if (t.status === 'resolved' || t.status === 'closed') trendMap[date].resolved++
        })
        const ticketTrends = Object.entries(trendMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, v]) => ({ date, tickets: v.tickets, resolved: v.resolved }))

        // Resolution times by category
        const catMap: Record<string, { total: number; count: number }> = {}
        tickets.forEach((t) => {
            const cat = t.category || 'General'
            if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 }
            catMap[cat].count++
            if (t.created && t.updated) {
                const diff = (new Date(t.updated).getTime() - new Date(t.created).getTime()) / 60000
                catMap[cat].total += diff
            }
        })
        const resolutionTimes = Object.entries(catMap).map(([category, v]) => ({
            category,
            avgTime: v.count > 0 ? Math.round(v.total / v.count) : 0,
            target: 30,
        }))

        // Top issues
        const issueMap: Record<string, number> = {}
        tickets.forEach((t) => {
            const cat = t.category || 'General'
            issueMap[cat] = (issueMap[cat] || 0) + 1
        })
        const topIssues = Object.entries(issueMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([category, count]) => ({ category, count, trend: 'stable' as const }))

        return {
            ticketTrends,
            resolutionTimes,
            customerSatisfaction: [],
            topIssues,
            staffPerformance: [],
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadAnalytics(period)
    }, [isAuthenticated, router, period, loadAnalytics])

    const handlePeriodChange = (newPeriod: Period) => {
        setPeriod(newPeriod)
    }

    // Compute top-card metrics from analytics data
    const avgResponseTime = analytics?.resolutionTimes && analytics.resolutionTimes.length > 0
        ? Math.round(analytics.resolutionTimes.reduce((sum, r) => sum + r.avgTime, 0) / analytics.resolutionTimes.length)
        : 0

    const resolutionRate = analytics?.ticketTrends && analytics.ticketTrends.length > 0
        ? (() => {
            const totalTickets = analytics.ticketTrends.reduce((s, t) => s + t.tickets, 0)
            const totalResolved = analytics.ticketTrends.reduce((s, t) => s + t.resolved, 0)
            return totalTickets > 0 ? Math.round((totalResolved / totalTickets) * 100) : 0
        })()
        : 0

    const customerSatisfaction = analytics?.customerSatisfaction && analytics.customerSatisfaction.length > 0
        ? (analytics.customerSatisfaction.reduce((s, c) => s + c.rating, 0) / analytics.customerSatisfaction.length).toFixed(1)
        : '0'

    const avgHandleTime = analytics?.staffPerformance && analytics.staffPerformance.length > 0
        ? Math.round(analytics.staffPerformance.reduce((s, sp) => s + sp.avgResolutionTime, 0) / analytics.staffPerformance.length)
        : avgResponseTime

    const ISSUE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

    const trendIcon = (trend: 'up' | 'down' | 'stable') => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-red-500" />
        if (trend === 'down') return <TrendingDown className="w-4 h-4 text-green-500" />
        return <Minus className="w-4 h-4 text-gray-400" />
    }

    if (!isAuthenticated) return null

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header with period selector */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics</h1>
                        <p className="text-sm text-gray-500 mt-1">Performance metrics and ticket insights</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            id="staff-analytics-btn-refresh"
                            onClick={() => loadAnalytics(period)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1 border border-gray-200">
                            {(['7d', '30d', '90d'] as Period[]).map((p) => (
                                <button
                                    key={p}
                                    id={`staff-analytics-period-${p}`}
                                    onClick={() => handlePeriodChange(p)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                        period === p
                                            ? 'bg-cyan-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

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
                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Avg Response Time */}
                            <div className="rounded-xl border-0 bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-2.5 rounded-lg shadow-md">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Avg Response Time</p>
                                <p className="text-2xl font-bold text-gray-900">{avgResponseTime}m</p>
                            </div>

                            {/* Resolution Rate */}
                            <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-emerald-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-lg shadow-md">
                                        <Target className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Resolution Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{resolutionRate}%</p>
                            </div>

                            {/* Customer Satisfaction */}
                            <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                        <Star className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Customer Satisfaction</p>
                                <p className="text-2xl font-bold text-gray-900">{customerSatisfaction}</p>
                            </div>

                            {/* Avg Handle Time */}
                            <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Avg Handle Time</p>
                                <p className="text-2xl font-bold text-gray-900">{avgHandleTime}m</p>
                            </div>
                        </div>

                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Ticket Trends */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Trends</h2>
                                {analytics?.ticketTrends && analytics.ticketTrends.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={analytics.ticketTrends}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Tickets" />
                                            <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Resolved" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-400 text-center py-12">No ticket trend data available.</p>
                                )}
                            </div>

                            {/* Resolution Times by Category */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resolution Times by Category</h2>
                                {analytics?.resolutionTimes && analytics.resolutionTimes.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics.resolutionTimes}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="avgTime" fill="#8b5cf6" name="Avg Time (min)" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="target" fill="#e5e7eb" name="Target (min)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-400 text-center py-12">No resolution time data available.</p>
                                )}
                            </div>
                        </div>

                        {/* Charts Row 2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Customer Satisfaction Trend */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction Trend</h2>
                                {analytics?.customerSatisfaction && analytics.customerSatisfaction.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={analytics.customerSatisfaction}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                            <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="rating" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} name="Rating" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-400 text-center py-12">No satisfaction data available.</p>
                                )}
                            </div>

                            {/* Top Issues */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Issues</h2>
                                {analytics?.topIssues && analytics.topIssues.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analytics.topIssues} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis type="number" tick={{ fontSize: 12 }} />
                                            <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={100} />
                                            <Tooltip />
                                            <Bar dataKey="count" name="Tickets" radius={[0, 4, 4, 0]}>
                                                {analytics.topIssues.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={ISSUE_COLORS[index % ISSUE_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-400 text-center py-12">No issue data available.</p>
                                )}
                                {/* Trend indicators below chart */}
                                {analytics?.topIssues && analytics.topIssues.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {analytics.topIssues.slice(0, 5).map((issue) => (
                                            <div key={issue.category} className="flex items-center gap-1.5 text-xs text-gray-600">
                                                {trendIcon(issue.trend)}
                                                <span>{issue.category}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Staff Performance Table */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h2>
                            {analytics?.staffPerformance && analytics.staffPerformance.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Tickets Resolved</th>
                                                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Avg Resolution Time</th>
                                                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Satisfaction</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.staffPerformance.map((staff) => (
                                                <tr key={staff.staffId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 text-sm font-medium text-gray-900">{staff.name}</td>
                                                    <td className="py-3 text-sm text-gray-700 text-right">{staff.ticketsResolved}</td>
                                                    <td className="py-3 text-sm text-gray-700 text-right">{staff.avgResolutionTime}m</td>
                                                    <td className="py-3 text-right">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            staff.satisfaction >= 4
                                                                ? 'bg-green-100 text-green-800'
                                                                : staff.satisfaction >= 3
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {staff.satisfaction.toFixed(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-8">No staff performance data available.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
