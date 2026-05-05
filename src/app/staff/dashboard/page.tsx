'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import { supportStaffService } from '@/services/supportStaffService'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import {
    AlertCircle, CheckCircle, Clock, TrendingUp, AlertTriangle, Zap, Target, Ticket,
    Brain, Sparkles, Loader2, RefreshCw, MessageSquare, Shield, ArrowRight, Send,
    ThumbsUp, ThumbsDown, Tag, Users, BarChart3
} from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { smartSupportService, workflowOrchestratorService } from '@/services/advancedAIServices'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export default function StaffDashboard() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [recentTickets, setRecentTickets] = useState<any[]>([])
    const [chartData, setChartData] = useState<any[]>([])

    // AI States
    const [aiClassification, setAiClassification] = useState<any>(null)
    const [aiClassifyLoading, setAiClassifyLoading] = useState(false)
    const [aiSentiment, setAiSentiment] = useState<any>(null)
    const [aiSentimentLoading, setAiSentimentLoading] = useState(false)
    const [aiResponse, setAiResponse] = useState<any>(null)
    const [aiResponseLoading, setAiResponseLoading] = useState(false)
    const [aiAutoResolve, setAiAutoResolve] = useState<any>(null)
    const [aiAutoResolveLoading, setAiAutoResolveLoading] = useState(false)
    const [aiRouting, setAiRouting] = useState<any>(null)
    const [aiRoutingLoading, setAiRoutingLoading] = useState(false)

    // AI input states
    const [classifySubject, setClassifySubject] = useState('')
    const [classifyMessage, setClassifyMessage] = useState('')
    const [sentimentMessage, setSentimentMessage] = useState('')
    const [responseTicketId, setResponseTicketId] = useState('')
    const [autoResolveSubject, setAutoResolveSubject] = useState('')
    const [autoResolveMessage, setAutoResolveMessage] = useState('')

    // --- AI Action Handlers ---
    const handleClassifyTicket = async () => {
        if (!classifySubject && !classifyMessage) return
        setAiClassifyLoading(true)
        try {
            const res = await smartSupportService.classifyTicket({
                ticketRef: `TK-${Date.now()}`,
                subject: classifySubject,
                message: classifyMessage,
            })
            setAiClassification(res?.data || res)
        } catch { setAiClassification(null) }
        finally { setAiClassifyLoading(false) }
    }

    const handleAnalyzeSentiment = async () => {
        if (!sentimentMessage) return
        setAiSentimentLoading(true)
        try {
            const res = await smartSupportService.analyzeSentiment({
                ticketRef: `TK-${Date.now()}`,
                message: sentimentMessage,
            })
            setAiSentiment(res?.data || res)
        } catch { setAiSentiment(null) }
        finally { setAiSentimentLoading(false) }
    }

    const handleSuggestResponse = async () => {
        if (!responseTicketId) return
        setAiResponseLoading(true)
        try {
            const res = await smartSupportService.suggestResponse(responseTicketId)
            setAiResponse(res?.data || res)
        } catch { setAiResponse(null) }
        finally { setAiResponseLoading(false) }
    }

    const handleAutoResolve = async () => {
        if (!autoResolveSubject && !autoResolveMessage) return
        setAiAutoResolveLoading(true)
        try {
            const res = await smartSupportService.autoResolve({
                ticketRef: `TK-${Date.now()}`,
                subject: autoResolveSubject,
                message: autoResolveMessage,
            })
            setAiAutoResolve(res?.data || res)
        } catch { setAiAutoResolve(null) }
        finally { setAiAutoResolveLoading(false) }
    }

    const handleRouteTicket = async () => {
        if (!aiClassification) return
        setAiRoutingLoading(true)
        try {
            const res = await smartSupportService.routeTicket({
                ticketRef: aiClassification.ticketRef || `TK-${Date.now()}`,
                category: aiClassification.classification?.category || 'GENERAL',
                priority: aiClassification.classification?.priority || 'MEDIUM',
                subject: classifySubject,
                message: classifyMessage,
            })
            setAiRouting(res?.data || res)
        } catch { setAiRouting(null) }
        finally { setAiRoutingLoading(false) }
    }

    // Auto-classify recent tickets on load
    const autoClassifyRecentTickets = async (tickets: any[]) => {
        if (tickets.length === 0) return
        const firstTicket = tickets[0]
        if (firstTicket?.subject) {
            try {
                const res = await smartSupportService.classifyTicket({
                    ticketRef: firstTicket.ticketNumber || firstTicket.id || `TK-${Date.now()}`,
                    subject: firstTicket.subject,
                    message: firstTicket.description || firstTicket.subject,
                })
                setAiClassification(res?.data || res)
                setClassifySubject(firstTicket.subject)
                setClassifyMessage(firstTicket.description || firstTicket.subject)
            } catch { /* silent */ }
        }
        // Auto-analyze sentiment of first ticket
        if (firstTicket?.description || firstTicket?.subject) {
            try {
                const res = await smartSupportService.analyzeSentiment({
                    ticketRef: firstTicket.ticketNumber || firstTicket.id || `TK-${Date.now()}`,
                    message: firstTicket.description || firstTicket.subject,
                })
                setAiSentiment(res?.data || res)
                setSentimentMessage(firstTicket.description || firstTicket.subject)
            } catch { /* silent */ }
        }
    }

    const loadDashboardData = useCallback(async () => {
        setLoading(true)
        setError(null)

        const [dashRes, ticketsRes, analyticsRes] = await Promise.allSettled([
            supportStaffService.getDashboardData(),
            supportStaffService.getTickets({}),
            supportStaffService.getAnalytics('7d')
        ])

        setDashboardData(
            dashRes.status === 'fulfilled' ? dashRes.value : {
                totalTickets: 0, openTickets: 0, resolvedTickets: 0, pendingReview: 0,
                escalatedTickets: 0, customerSatisfaction: 0, responseTime: 0, resolutionRate: 0
            }
        )

        const tickets = ticketsRes.status === 'fulfilled'
            ? (ticketsRes.value?.tickets || [])
            : []
        setRecentTickets(tickets.slice(0, 5))

        // Chart data
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.ticketTrends?.length) {
            setChartData(analyticsRes.value.ticketTrends.map((t: any) => ({
                name: t.date, tickets: t.tickets, resolved: t.resolved
            })))
        } else {
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

        // Auto AI analysis on recent tickets
        autoClassifyRecentTickets(tickets.slice(0, 5))
    }, [])

    useRealtimeRefresh(['ticket'], loadDashboardData)

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        loadDashboardData()
    }, [isAuthenticated, router, loadDashboardData])

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    const stats = dashboardData || {}

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Support Dashboard</h1>
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
                    {[
                        { label: 'Open Tickets', value: stats.openTickets || 0, icon: AlertCircle, from: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-blue-100' },
                        { label: 'Resolved', value: stats.resolvedTickets || 0, icon: CheckCircle, from: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-emerald-100' },
                        { label: 'Pending', value: stats.pendingReview || 0, icon: Clock, from: 'from-orange-500 to-orange-600', bg: 'from-orange-50 to-orange-100' },
                        { label: 'Satisfaction', value: `${stats.customerSatisfaction?.toFixed?.(1) || stats.customerSatisfaction || 0}%`, icon: TrendingUp, from: 'from-purple-500 to-purple-600', bg: 'from-purple-50 to-purple-100' },
                    ].map((kpi, i) => (
                        <div key={i} className={`rounded-xl border-0 bg-gradient-to-br ${kpi.bg} p-5 hover:shadow-lg transition-all duration-200`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`bg-gradient-to-br ${kpi.from} p-2.5 rounded-lg shadow-md`}>
                                    <kpi.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">{kpi.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                        </div>
                    ))}
                </div>

                {/* Row 2 - Additional KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Escalated', value: stats.escalatedTickets || 0, icon: AlertTriangle, from: 'from-red-500 to-red-600', bg: 'from-red-50 to-red-100' },
                        { label: 'Avg Response Time', value: `${stats.responseTime || 0}m`, icon: Zap, from: 'from-cyan-500 to-cyan-600', bg: 'from-cyan-50 to-cyan-100' },
                        { label: 'Resolution Rate', value: `${stats.resolutionRate?.toFixed?.(1) || stats.resolutionRate || 0}%`, icon: Target, from: 'from-emerald-500 to-emerald-600', bg: 'from-emerald-50 to-emerald-100' },
                        { label: 'Total Tickets', value: stats.totalTickets || 0, icon: Ticket, from: 'from-indigo-500 to-indigo-600', bg: 'from-indigo-50 to-indigo-100' },
                    ].map((kpi, i) => (
                        <div key={i} className={`rounded-xl border-0 bg-gradient-to-br ${kpi.bg} p-5 hover:shadow-lg transition-all duration-200`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`bg-gradient-to-br ${kpi.from} p-2.5 rounded-lg shadow-md`}>
                                    <kpi.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">{kpi.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                                    cx="50%" cy="50%" labelLine={false}
                                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                                    outerRadius={80} fill="#8884d8" dataKey="value"
                                >
                                    <Cell fill="#3b82f6" /><Cell fill="#10b981" /><Cell fill="#f97316" /><Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip /><Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
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
                                    <tr><td colSpan={5} className="py-8 text-center text-gray-500">No recent tickets found</td></tr>
                                ) : recentTickets.map((ticket, idx) => {
                                    const rowKey = ticket?.id || ticket?._id || ticket?.ticketNumber || `ticket-${idx}`
                                    const ticketRef = ticket?.ticketNumber || ticket?.id || ticket?._id || '—'
                                    const subject = typeof ticket?.subject === 'string' ? ticket.subject : (ticket?.title || '—')
                                    const priorityRaw = ticket?.priority
                                    const priority = typeof priorityRaw === 'string' ? priorityRaw : (priorityRaw?.name || priorityRaw?.label || '—')
                                    const statusRaw = ticket?.status
                                    const status = typeof statusRaw === 'string' ? statusRaw : (statusRaw?.name || statusRaw?.label || '—')
                                    const customerSrc = ticket?.customer ?? ticket?.assignedTo ?? ticket?.createdBy ?? ticket?.user
                                    const customer = typeof customerSrc === 'string'
                                        ? customerSrc
                                        : (customerSrc?.name || customerSrc?.fullName || customerSrc?.email || 'Unknown')
                                    const priorityLc = String(priority).toLowerCase()
                                    const statusLc = String(status).toLowerCase()
                                    return (
                                        <tr key={rowKey} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => router.push('/staff/tickets')}>
                                            <td className="py-3 px-4 text-blue-600 font-medium">{ticketRef}</td>
                                            <td className="py-3 px-4 text-gray-900">{subject}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    priorityLc === 'critical' ? 'bg-red-100 text-red-800' :
                                                    priorityLc === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    priorityLc === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>{priority}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    statusLc === 'open' ? 'bg-blue-100 text-blue-800' :
                                                    statusLc === 'in-progress' || statusLc === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                                                    statusLc === 'pending' ? 'bg-orange-100 text-orange-800' :
                                                    statusLc === 'resolved' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>{status}</span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{customer}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* AI & AUTOMATION SECTION */}
                {/* ═══════════════════════════════════════════════════════════ */}

                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Brain className="w-6 h-6 text-purple-600" />
                        <h2 className="text-2xl font-bold text-gray-900">AI & Automation Tools</h2>
                        <Badge className="bg-purple-100 text-purple-700">Smart Support</Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* ── 1. AI Ticket Classifier ── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">AI Ticket Classifier</h3>
                                <Badge className="bg-blue-100 text-blue-700 text-xs">Auto-Classify</Badge>
                            </div>
                            <div className="p-6 space-y-3">
                                <input
                                    value={classifySubject}
                                    onChange={e => setClassifySubject(e.target.value)}
                                    placeholder="Ticket subject..."
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <textarea
                                    value={classifyMessage}
                                    onChange={e => setClassifyMessage(e.target.value)}
                                    placeholder="Ticket description/message..."
                                    className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleClassifyTicket}
                                        disabled={aiClassifyLoading || (!classifySubject && !classifyMessage)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {aiClassifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                                        Classify Ticket
                                    </button>
                                    {aiClassification && (
                                        <button
                                            onClick={handleRouteTicket}
                                            disabled={aiRoutingLoading}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            {aiRoutingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                            Auto-Route
                                        </button>
                                    )}
                                </div>

                                {/* Classification Result */}
                                {aiClassification && (
                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-blue-800">Classification Result</span>
                                            {aiClassification.aiPowered === false && <Badge className="bg-yellow-100 text-yellow-700 text-xs">Fallback</Badge>}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center p-2 bg-white rounded border">
                                                <p className="text-xs text-gray-500">Category</p>
                                                <p className="text-sm font-bold text-blue-700">{aiClassification.classification?.category || 'N/A'}</p>
                                            </div>
                                            <div className="text-center p-2 bg-white rounded border">
                                                <p className="text-xs text-gray-500">Priority</p>
                                                <p className={`text-sm font-bold ${
                                                    aiClassification.classification?.priority === 'URGENT' || aiClassification.classification?.priority === 'HIGH' ? 'text-red-700' :
                                                    aiClassification.classification?.priority === 'MEDIUM' ? 'text-yellow-700' : 'text-green-700'
                                                }`}>{aiClassification.classification?.priority || 'N/A'}</p>
                                            </div>
                                            <div className="text-center p-2 bg-white rounded border">
                                                <p className="text-xs text-gray-500">Confidence</p>
                                                <p className="text-sm font-bold text-purple-700">{aiClassification.classification?.confidence || 0}%</p>
                                            </div>
                                        </div>
                                        <Progress value={aiClassification.classification?.confidence || 0} className="h-2" />
                                        {aiClassification.reasoning && (
                                            <p className="text-xs text-gray-700 bg-white p-2 rounded border">{aiClassification.reasoning}</p>
                                        )}
                                        {aiClassification.suggestedTags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {aiClassification.suggestedTags.map((tag: string, i: number) => (
                                                    <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        {aiClassification.escalationNeeded && (
                                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                                <span className="text-xs font-medium text-red-700">Escalation Required</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Routing Result */}
                                {aiRouting && (
                                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 space-y-2">
                                        <span className="text-sm font-semibold text-green-800">Routing Decision</span>
                                        <div className="p-2 bg-white rounded border">
                                            <p className="text-xs text-gray-500">Assigned Agent</p>
                                            <p className="text-sm font-bold text-green-700">{aiRouting.routing?.assignedAgentId || 'Auto-assigned'}</p>
                                        </div>
                                        {aiRouting.routing?.routingReason && (
                                            <p className="text-xs text-gray-700">{aiRouting.routing.routingReason}</p>
                                        )}
                                        {aiRouting.estimatedResponseTime && (
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <Clock className="w-3 h-3" /> Est. Response: {aiRouting.estimatedResponseTime}
                                            </div>
                                        )}
                                        {aiRouting.specialInstructions && (
                                            <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded">{aiRouting.specialInstructions}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── 2. AI Sentiment Analysis ── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-purple-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
                                <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                            </div>
                            <div className="p-6 space-y-3">
                                <textarea
                                    value={sentimentMessage}
                                    onChange={e => setSentimentMessage(e.target.value)}
                                    placeholder="Paste customer message to analyze sentiment..."
                                    className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none"
                                />
                                <button
                                    onClick={handleAnalyzeSentiment}
                                    disabled={aiSentimentLoading || !sentimentMessage}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                >
                                    {aiSentimentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                                    Analyze Sentiment
                                </button>

                                {aiSentiment && (
                                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 space-y-3">
                                        {aiSentiment.aiPowered === false && <Badge className="bg-yellow-100 text-yellow-700 text-xs">Fallback</Badge>}

                                        {/* Sentiment Score */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-purple-800">Sentiment</span>
                                            <div className="flex items-center gap-2">
                                                {(aiSentiment.sentiment?.score || 0) > 0 ? (
                                                    <ThumbsUp className="w-5 h-5 text-green-600" />
                                                ) : (aiSentiment.sentiment?.score || 0) < 0 ? (
                                                    <ThumbsDown className="w-5 h-5 text-red-600" />
                                                ) : (
                                                    <span className="text-lg">😐</span>
                                                )}
                                                <span className={`text-lg font-bold px-3 py-0.5 rounded-full ${
                                                    aiSentiment.sentiment?.label?.includes('positive') ? 'bg-green-100 text-green-700' :
                                                    aiSentiment.sentiment?.label?.includes('negative') ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {aiSentiment.sentiment?.label || 'neutral'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Score Bar */}
                                        <div>
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <span>Very Negative</span><span>Neutral</span><span>Very Positive</span>
                                            </div>
                                            <div className="w-full h-3 bg-gradient-to-r from-red-300 via-gray-200 to-green-300 rounded-full relative">
                                                <div
                                                    className="absolute top-0 w-4 h-3 bg-gray-900 rounded-full border-2 border-white"
                                                    style={{ left: `${Math.max(0, Math.min(100, ((aiSentiment.sentiment?.score || 0) + 1) * 50))}%`, transform: 'translateX(-50%)' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 bg-white rounded border text-center">
                                                <p className="text-xs text-gray-500">Emotional Tone</p>
                                                <p className="text-sm font-medium text-gray-800">{aiSentiment.emotionalTone || 'N/A'}</p>
                                            </div>
                                            <div className="p-2 bg-white rounded border text-center">
                                                <p className="text-xs text-gray-500">Satisfaction Est.</p>
                                                <p className="text-sm font-bold text-purple-700">{aiSentiment.customerSatisfactionEstimate || 0}%</p>
                                            </div>
                                        </div>

                                        {/* Key Phrases */}
                                        {aiSentiment.sentiment?.keyPhrases?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 mb-1">Key Phrases:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {aiSentiment.sentiment.keyPhrases.map((p: string, i: number) => (
                                                        <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Urgency Indicators */}
                                        {aiSentiment.urgencyIndicators?.length > 0 && (
                                            <div className="p-2 bg-red-50 rounded border border-red-200">
                                                <p className="text-xs font-semibold text-red-700 mb-1">Urgency Indicators:</p>
                                                {aiSentiment.urgencyIndicators.map((u: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-1 py-0.5">
                                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                                        <span className="text-xs text-gray-700">{u}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── 3. AI Response Suggestions ── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                <Send className="w-5 h-5 text-green-600" />
                                <h3 className="text-lg font-semibold text-gray-900">AI Response Suggestion</h3>
                                <Badge className="bg-green-100 text-green-700 text-xs">Smart Reply</Badge>
                            </div>
                            <div className="p-6 space-y-3">
                                <input
                                    value={responseTicketId}
                                    onChange={e => setResponseTicketId(e.target.value)}
                                    placeholder="Enter Ticket ID to get AI response suggestion..."
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <button
                                    onClick={handleSuggestResponse}
                                    disabled={aiResponseLoading || !responseTicketId}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {aiResponseLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    Generate Response
                                </button>

                                {aiResponse && (
                                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 space-y-3">
                                        {aiResponse.aiPowered === false && <Badge className="bg-yellow-100 text-yellow-700 text-xs">Fallback</Badge>}

                                        {/* Primary Response */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold text-green-800">Suggested Response</span>
                                                {aiResponse.tone && <Badge className="bg-green-100 text-green-700 text-xs">{aiResponse.tone}</Badge>}
                                            </div>
                                            <div className="p-3 bg-white rounded border text-sm text-gray-800 leading-relaxed">
                                                {aiResponse.suggestedResponse || aiResponse.response || 'No response generated'}
                                            </div>
                                        </div>

                                        {/* Confidence */}
                                        {aiResponse.confidence != null && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Confidence:</span>
                                                <Progress value={aiResponse.confidence} className="h-1.5 flex-1" />
                                                <span className="text-xs font-medium text-gray-700">{aiResponse.confidence}%</span>
                                            </div>
                                        )}

                                        {/* Alternative Responses */}
                                        {aiResponse.alternativeResponses?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 mb-2">Alternative Responses:</p>
                                                {aiResponse.alternativeResponses.map((alt: any, i: number) => (
                                                    <div key={i} className="mb-2 p-2 bg-white rounded border">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className="bg-gray-100 text-gray-600 text-xs">{alt.tone || `Option ${i + 1}`}</Badge>
                                                        </div>
                                                        <p className="text-xs text-gray-700">{alt.response || alt}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Follow-up Actions */}
                                        {aiResponse.followUpActions?.length > 0 && (
                                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                                <p className="text-xs font-semibold text-blue-700 mb-1">Suggested Follow-ups:</p>
                                                {aiResponse.followUpActions.map((action: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-1 py-0.5">
                                                        <ArrowRight className="w-3 h-3 text-blue-500" />
                                                        <span className="text-xs text-gray-700">{action}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── 4. AI Auto-Resolution ── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-amber-600" />
                                <h3 className="text-lg font-semibold text-gray-900">AI Auto-Resolution</h3>
                                <Badge className="bg-amber-100 text-amber-700 text-xs">Automation</Badge>
                            </div>
                            <div className="p-6 space-y-3">
                                <input
                                    value={autoResolveSubject}
                                    onChange={e => setAutoResolveSubject(e.target.value)}
                                    placeholder="Ticket subject..."
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <textarea
                                    value={autoResolveMessage}
                                    onChange={e => setAutoResolveMessage(e.target.value)}
                                    placeholder="Customer question/message..."
                                    className="w-full px-3 py-2 border rounded-lg text-sm h-20 resize-none"
                                />
                                <button
                                    onClick={handleAutoResolve}
                                    disabled={aiAutoResolveLoading || (!autoResolveSubject && !autoResolveMessage)}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
                                >
                                    {aiAutoResolveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    Try Auto-Resolve
                                </button>

                                {aiAutoResolve && (
                                    <div className={`p-4 rounded-lg border space-y-3 ${
                                        aiAutoResolve.autoResolution?.resolved
                                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                                            : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                                    }`}>
                                        {aiAutoResolve.aiPowered === false && <Badge className="bg-yellow-100 text-yellow-700 text-xs">Fallback</Badge>}

                                        {/* Resolution Status */}
                                        <div className="flex items-center gap-2">
                                            {aiAutoResolve.autoResolution?.resolved ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                    <span className="text-sm font-bold text-green-800">Auto-Resolved!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                                    <span className="text-sm font-bold text-yellow-800">Needs Human Review</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Resolution */}
                                        {aiAutoResolve.autoResolution?.resolution && (
                                            <div className="p-3 bg-white rounded border text-sm text-gray-800">
                                                {aiAutoResolve.autoResolution.resolution}
                                            </div>
                                        )}

                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 bg-white rounded border text-center">
                                                <p className="text-xs text-gray-500">Confidence</p>
                                                <p className="text-sm font-bold text-gray-800">{aiAutoResolve.autoResolution?.confidence || 0}%</p>
                                            </div>
                                            <div className="p-2 bg-white rounded border text-center">
                                                <p className="text-xs text-gray-500">Type</p>
                                                <p className="text-sm font-bold text-gray-800">{aiAutoResolve.resolutionType || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {aiAutoResolve.requiresHumanReview && (
                                            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                                <Users className="w-4 h-4 text-yellow-600" />
                                                <span className="text-xs font-medium text-yellow-700">Human review recommended for this ticket</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
