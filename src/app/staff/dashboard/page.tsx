'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import { supportStaffService } from '@/services/supportStaffService'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AlertCircle, CheckCircle, Clock, TrendingUp, AlertTriangle, Zap, Target, Ticket } from 'lucide-react'

export default function StaffDashboard() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [recentTickets, setRecentTickets] = useState<any[]>([])
    const [chartData, setChartData] = useState<any[]>([])

    const loadDashboardData = useCallback(async () => {
        setLoading(true)
        setError(null)

        const [dashRes, ticketsRes, analyticsRes] = await Promise.allSettled([
            supportStaffService.getDashboardData(),
            supportStaffService.getTickets({}),
            supportStaffService.getAnalytics('7d')
        ])

        // Dashboard stats
        setDashboardData(
            dashRes.status === 'fulfilled' ? dashRes.value : {
                totalTickets: 0,
                openTickets: 0,
                resolvedTickets: 0,
                pendingReview: 0,
                escalatedTickets: 0,
                customerSatisfaction: 0,
                responseTime: 0,
                resolutionRate: 0
            }
        )

        // Recent tickets
        const tickets = ticketsRes.status === 'fulfilled'
            ? (ticketsRes.value?.tickets || [])
            : []
        setRecentTickets(tickets.slice(0, 5))

        // Chart data from analytics, with fallback to calculate from tickets
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.ticketTrends?.length) {
            setChartData(analyticsRes.value.ticketTrends.map((t: any) => ({
                name: t.date,
                tickets: t.tickets,
                resolved: t.resolved
            })))
        } else {
            // Fallback: derive trend from tickets by grouping by date
            const dayMap: Record<string, { tickets: number; resolved: number }> = {}
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            tickets.forEach((t: any) => {
                const d = new Date(t.created || t.createdAt)
                const label = days[d.getDay()]
                if (!dayMap[label]) dayMap[label] = { tickets: 0, resolved: 0 }
                dayMap[label].tickets++
                if (t.status === 'resolved' || t.status === 'closed') dayMap[label].resolved++
            })
            const fallback = Object.entries(dayMap).map(([name, v]) => ({ name, ...v }))
            setChartData(fallback.length > 0 ? fallback : [
                { name: 'Mon', tickets: 0, resolved: 0 },
                { name: 'Tue', tickets: 0, resolved: 0 },
                { name: 'Wed', tickets: 0, resolved: 0 },
                { name: 'Thu', tickets: 0, resolved: 0 },
                { name: 'Fri', tickets: 0, resolved: 0 }
            ])
        }

        setLoading(false)
    }, [])

    useRealtimeRefresh(['ticket'], loadDashboardData)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        loadDashboardData()
    }, [isAuthenticated, router, loadDashboardData])

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

    const stats = dashboardData || {}

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Support Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {user?.name || 'Support Staff'}</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Row 1 - KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Open Tickets */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Open Tickets</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.openTickets || 0}</p>
                    </div>

                    {/* Resolved */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-emerald-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-lg shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Resolved</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.resolvedTickets || 0}</p>
                    </div>

                    {/* Pending */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingReview || 0}</p>
                    </div>

                    {/* Satisfaction */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Satisfaction</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.customerSatisfaction?.toFixed?.(1) || stats.customerSatisfaction || 0}%</p>
                    </div>
                </div>

                {/* Row 2 - Additional KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Escalated */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-red-50 to-red-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-lg shadow-md">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Escalated</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.escalatedTickets || 0}</p>
                    </div>

                    {/* Avg Response Time */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-2.5 rounded-lg shadow-md">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Avg Response Time</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.responseTime || 0}m</p>
                    </div>

                    {/* Resolution Rate */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-lg shadow-md">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Resolution Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.resolutionRate?.toFixed?.(1) || stats.resolutionRate || 0}%</p>
                    </div>

                    {/* Total Tickets */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 rounded-lg shadow-md">
                                <Ticket className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Tickets</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalTickets || 0}</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Ticket Trend Chart */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Trends</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={2} name="New Tickets" />
                                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Open', value: stats.openTickets || 0 },
                                        { name: 'Resolved', value: stats.resolvedTickets || 0 },
                                        { name: 'Pending', value: stats.pendingReview || 0 },
                                        { name: 'Escalated', value: stats.escalatedTickets || 0 }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#10b981" />
                                    <Cell fill="#f97316" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tickets</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ticket #</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">No recent tickets found</td>
                                    </tr>
                                ) : (
                                    recentTickets.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => router.push('/staff/tickets')}
                                        >
                                            <td className="py-3 px-4 text-blue-600 font-medium">{ticket.ticketNumber || ticket.id}</td>
                                            <td className="py-3 px-4 text-gray-900">{ticket.subject}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                                    ticket.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                                                    ticket.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{ticket.customer || ticket.assignedTo || 'Unknown'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
