'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SupportService from '@/services/modules/support.service'
import NotificationService from '@/services/modules/notification.service'
import AnalyticsService from '@/services/modules/analytics.service'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AlertCircle, CheckCircle, Clock, TrendingUp, Bell, Users, Zap } from 'lucide-react'

export default function StaffDashboard() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [ticketStats, setTicketStats] = useState<any>(null)
    const [notificationStats, setNotificationStats] = useState<any>(null)
    const [recentTickets, setRecentTickets] = useState<any[]>([])
    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadDashboardData = async () => {
            setLoading(true)
            setError(null)

            const [ticketsRes, notifRes, recentRes] = await Promise.allSettled([
                SupportService.getTicketStats(),
                NotificationService.getNotificationStats(),
                SupportService.getTickets({ limit: 5 })
            ])

            setTicketStats(
                ticketsRes.status === 'fulfilled' ? ticketsRes.value : { openTickets: 0, resolvedTickets: 0, pendingTickets: 0, satisfactionScore: 0 }
            )
            setNotificationStats(
                notifRes.status === 'fulfilled' ? notifRes.value : {}
            )
            setRecentTickets(
                recentRes.status === 'fulfilled' ? recentRes.value?.tickets || [] : []
            )
            setChartData([
                { name: 'Mon', tickets: 45 },
                { name: 'Tue', tickets: 52 },
                { name: 'Wed', tickets: 48 },
                { name: 'Thu', tickets: 61 },
                { name: 'Fri', tickets: 55 }
            ])
            setLoading(false)
        }

        loadDashboardData()
    }, [isAuthenticated, router])

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

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Open Tickets</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{ticketStats?.openTickets || 0}</p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-blue-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Resolved</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{ticketStats?.resolvedTickets || 0}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Pending</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{ticketStats?.pendingTickets || 0}</p>
                            </div>
                            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Satisfaction</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{ticketStats?.satisfactionScore?.toFixed(1) || 0}%</p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Ticket Trend Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Trends</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="tickets" stroke="#3b82f6" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Open', value: ticketStats?.openTickets || 0 },
                                        { name: 'Resolved', value: ticketStats?.resolvedTickets || 0 },
                                        { name: 'Pending', value: ticketStats?.pendingTickets || 0 }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#10b981" />
                                    <Cell fill="#f59e0b" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tickets</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ticket #</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTickets.map((ticket) => (
                                    <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-blue-600 font-medium">{ticket.ticketNumber}</td>
                                        <td className="py-3 px-4 text-gray-900">{ticket.subject}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                                ticket.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                                                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{ticket.assignedToName || 'Unassigned'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
