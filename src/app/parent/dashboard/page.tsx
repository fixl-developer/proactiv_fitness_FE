'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import { formatAIResponse } from '@/utils/formatAIResponse'
import {
    Users, Calendar, DollarSign, RefreshCw, Eye, Plus, MessageSquare,
    ArrowUp, User, BookOpen, CreditCard, Download, AlertTriangle, Bell,
    Brain, Sparkles, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api/client'

const ParentDashboard = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | '7d' | '30d'>('today')
    const [dashboardData, setDashboardData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [aiReport, setAiReport] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiQuestion, setAiQuestion] = useState('')
    const [aiAnswer, setAiAnswer] = useState<string | null>(null)
    const [aiAnswerLoading, setAiAnswerLoading] = useState(false)
    const [selectedChildIdForAi, setSelectedChildIdForAi] = useState<string | null>(null)
    const [aiError, setAiError] = useState<string | null>(null)
    const [downloadingReport, setDownloadingReport] = useState(false)
    // Filter Upcoming Classes section by a specific child (BUG_006)
    const [filterChildId, setFilterChildId] = useState<string | null>(null)
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    const parentName = user?.name || 'Parent User'

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadDashboardData()
        // Re-fetch when date-range filter or per-child filter changes so the
        // view actually updates (BUG_007: ranges; BUG_006: child filter).
    }, [isAuthenticated, router, selectedTimeRange, filterChildId])

    const loadDashboardData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const params = new URLSearchParams({ timeRange: selectedTimeRange })
            if (filterChildId) params.set('childId', filterChildId)
            const response = await apiClient.get<any>(`/parent/dashboard?${params.toString()}`)
            const data = response?.data || response
            setDashboardData(data)
        } catch (err) {
            console.error('Error loading dashboard data:', err)
            setError('Failed to load dashboard data. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    useRealtimeRefresh(['booking', 'attendance', 'payment'], loadDashboardData)

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadDashboardData()
        setRefreshing(false)
    }

    const handleGenerateAiReport = async (childId: string) => {
        try {
            setAiLoading(true)
            setAiError(null)
            setSelectedChildIdForAi(childId)
            const response = await apiClient.post<any>(`/parent-ai-assistant/generate-report/${childId}`, { period: 'weekly' })
            const data = response?.data || response
            // Backend returns aiPowered:false with a placeholder summary when
            // the underlying provider failed. Surface it as an error banner
            // instead of pretending the report succeeded (BUG_005).
            if (data && data.aiPowered === false) {
                setAiError(data.summary || 'AI insights are not available right now. Please try again later.')
                setAiReport(null)
            } else {
                setAiReport(data)
            }
        } catch (err) {
            console.error('Error generating AI report:', err)
            setAiError('AI insights are not available right now. Please try again later.')
            setAiReport(null)
        } finally {
            setAiLoading(false)
        }
    }

    const handleDownloadReport = () => {
        // Build a downloadable JSON snapshot of the parent dashboard so
        // "Download Report" actually delivers a file (BUG_004). JSON keeps
        // the implementation dependency-free.
        try {
            setDownloadingReport(true)
            const snapshot = {
                generatedAt: new Date().toISOString(),
                parent: parentName,
                timeRange: selectedTimeRange,
                stats: dashboardData?.stats || {},
                children: dashboardData?.children || [],
                upcomingClasses: dashboardData?.upcomingClasses || [],
                recentPayments: dashboardData?.recentPayments || [],
                alerts: dashboardData?.alerts || [],
            }
            const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `parent-dashboard-report-${new Date().toISOString().slice(0, 10)}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Download report failed', err)
        } finally {
            setDownloadingReport(false)
        }
    }

    const handleAskAi = async () => {
        if (!aiQuestion.trim() || !selectedChildIdForAi) return
        try {
            setAiAnswerLoading(true)
            setAiError(null)
            const response = await apiClient.post<any>('/parent-ai-assistant/ask', {
                studentId: selectedChildIdForAi,
                question: aiQuestion.trim()
            })
            const data = response?.data || response
            setAiAnswer(data?.answer || data?.response || formatAIResponse(data))
        } catch (err) {
            console.error('Error asking AI:', err)
            setAiAnswer(null)
            setAiError('AI insights are not available right now. Please try again later.')
        } finally {
            setAiAnswerLoading(false)
        }
    }

    // Extract data from API response with fallbacks
    const stats = dashboardData?.stats || {}
    const myChildren = dashboardData?.children || []
    const upcomingClasses = dashboardData?.upcomingClasses || []
    const recentPayments = dashboardData?.recentPayments || []
    const alerts: any[] = Array.isArray(dashboardData?.alerts) ? dashboardData.alerts : []

    // Date-filter aware metrics (BUG_007). Backend returns range-scoped fields
    // (rangeSpent, rangeBookings) for any timeRange; show those for non-empty
    // ranges and fall back to lifetime totals only when nothing matches.
    const isRanged = selectedTimeRange === 'today' || selectedTimeRange === '7d' || selectedTimeRange === '30d'
    const displayedTotalSpent = isRanged
        ? (stats.rangeSpent ?? stats.totalSpent ?? 0)
        : (stats.totalSpent ?? 0)
    const totalSpentLabel = selectedTimeRange === 'today'
        ? 'Today'
        : selectedTimeRange === '7d'
            ? 'Last 7 days'
            : selectedTimeRange === '30d'
                ? 'Last 30 days'
                : 'This year'

    const filteredChildName = filterChildId
        ? (myChildren.find((c: any) => c.id === filterChildId)?.name || 'Selected child')
        : null

    const formatAlertTime = (iso: string) => {
        if (!iso) return ''
        try {
            const d = new Date(iso)
            const diffMs = Date.now() - d.getTime()
            const diffHr = Math.floor(diffMs / (1000 * 60 * 60))
            if (diffHr < 1) return 'just now'
            if (diffHr < 24) return `${diffHr}h ago`
            const diffDays = Math.floor(diffHr / 24)
            return `${diffDays}d ago`
        } catch { return '' }
    }

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'text-green-600 bg-green-50',
            completed: 'text-green-600 bg-green-50',
            confirmed: 'text-green-600 bg-green-50',
            pending: 'text-yellow-600 bg-yellow-50',
            cancelled: 'text-red-600 bg-red-50'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const getAlertColor = (type: string) => {
        const colors = {
            success: 'border-l-4 border-green-500 bg-green-50',
            info: 'border-l-4 border-blue-500 bg-blue-50',
            warning: 'border-l-4 border-yellow-500 bg-yellow-50',
            critical: 'border-l-4 border-red-500 bg-red-50'
        }
        return colors[type as keyof typeof colors] || 'border-l-4 border-gray-500 bg-gray-50'
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-700 font-medium">{error}</p>
                    <p className="text-sm text-red-500 mt-1">Please check your connection and try again.</p>
                    <Button onClick={handleRefresh} variant="outline" className="mt-4">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Parent Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Children's Progress</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <p className="text-gray-600">{parentName}</p>
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg ml-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-blue-700">Live</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button id="parent-dashboard-refresh-btn"
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {['today', '7d', '30d'].map((range) => (
                            <button id={`parent-dashboard-range-${range}-btn`}
                                key={range}
                                onClick={() => setSelectedTimeRange(range as any)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedTimeRange === range
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : '30 Days'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Key Metrics - 4 Colorful Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* My Children */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">All active</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">My Children</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalChildren ?? 0}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Active Programs */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-green-50 to-emerald-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-lg shadow-md">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    <ArrowUp className="w-3 h-3 inline mr-0.5" />Ongoing
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Active Programs</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activePrograms ?? 0}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Total Spent */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                    <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{totalSpentLabel}</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900">HK${Number(displayedTotalSpent || 0).toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Account Balance */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="hover:shadow-lg transition-all border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                    <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Available</span>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">Account Balance</p>
                            <p className="text-2xl font-bold text-gray-900">HK${(stats.accountBalance ?? 0).toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* My Children Cards */}
            {myChildren.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No children linked to your account yet</p>
                        <p className="text-sm text-gray-400 mt-1">Contact your facility to add your children.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {myChildren.map((child: any, index: number) => (
                        <motion.div
                            key={child.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                                {(child.name || 'C').split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{child.name}</CardTitle>
                                                <p className="text-sm text-gray-500">{child.age} years old</p>
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(child.status || 'active')}>
                                            {child.status || 'active'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Program</p>
                                                <p className="font-semibold text-gray-900">{child.program || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Coach</p>
                                                <p className="font-semibold text-gray-900">{child.coach || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Classes</p>
                                                <p className="font-semibold text-gray-900">{child.classes ?? 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Rating</p>
                                                <p className="font-semibold text-yellow-600">&#11088; {child.rating ?? 'N/A'}</p>
                                            </div>
                                        </div>
                                        {child.progress !== undefined && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Progress</span>
                                                    <span className="font-medium">{child.progress}%</span>
                                                </div>
                                                <Progress value={child.progress} className="h-2" />
                                            </div>
                                        )}
                                        {child.nextClass && (
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-blue-700">
                                                    <strong>Next Class:</strong> {child.nextClass}
                                                </p>
                                            </div>
                                        )}
                                        <Button
                                            id={`parent-dashboard-child-${child.id}-details-btn`}
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => router.push(`/parent/children?childId=${encodeURIComponent(child.id)}`)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Upcoming Classes */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <CardTitle>Upcoming Classes</CardTitle>
                            <Badge>{upcomingClasses.length} classes</Badge>
                            {filteredChildName && (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                    {filteredChildName}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {myChildren.length > 0 && (
                                <select
                                    id="parent-dashboard-upcoming-child-filter"
                                    value={filterChildId || ''}
                                    onChange={(e) => setFilterChildId(e.target.value || null)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All children</option>
                                    {myChildren.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            )}
                            <Button
                                id="parent-dashboard-view-all-bookings-btn"
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/parent/bookings')}
                            >
                                View All
                            </Button>
                            <Button
                                id="parent-dashboard-book-new-class-btn"
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/parent/browse-classes')}
                            >
                                Book New Class
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {upcomingClasses.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm font-medium">No upcoming classes</p>
                                <p className="text-xs text-gray-400 mt-1">Book a class to get started.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                    onClick={() => router.push('/parent/browse-classes')}
                                >
                                    Browse Classes
                                </Button>
                            </div>
                        ) : (
                            upcomingClasses.map((session: any, index: number) => (
                                <motion.div
                                    key={session.id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                            {(session.date || '').split('-')[2] || '--'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{session.program || session.className || 'Class'}</h4>
                                            <p className="text-sm text-gray-600">{session.child || session.childName} {session.coach ? `\u2022 ${session.coach}` : ''}</p>
                                            <p className="text-xs text-gray-500">{session.date} at {session.time} {session.location ? `\u2022 ${session.location}` : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge className={getStatusColor(session.status || 'confirmed')} variant="outline">
                                            {session.status || 'confirmed'}
                                        </Badge>
                                        <Button
                                            id={`parent-dashboard-class-${session.id}-view-btn`}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push('/parent/bookings')}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-green-600" />
                            <CardTitle>Recent Payments</CardTitle>
                        </div>
                        <Button
                            id="parent-dashboard-view-all-payments-btn"
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/parent/payments')}
                        >
                            View All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentPayments.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm font-medium">No recent payments</p>
                                <p className="text-xs text-gray-400 mt-1">Your payment history will appear here.</p>
                            </div>
                        ) : (
                            recentPayments.map((payment: any, index: number) => (
                                <motion.div
                                    key={payment.id || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50/30 rounded-lg hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{payment.program || payment.description || 'Payment'}</h4>
                                            <p className="text-sm text-gray-600">{payment.child || payment.childName} {payment.date ? `\u2022 ${payment.date}` : ''}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">HK${(payment.amount ?? 0).toLocaleString()}</p>
                                        <Badge className={getStatusColor(payment.status || 'completed')} variant="outline">
                                            {payment.status || 'completed'}
                                        </Badge>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Alerts & Notifications */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-600" />
                            <CardTitle>Alerts & Notifications</CardTitle>
                        </div>
                        <Button id="parent-dashboard-view-all-alerts-btn" variant="outline" size="sm">View All</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {alerts.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm font-medium">No alerts right now</p>
                                <p className="text-xs text-gray-400 mt-1">You'll see attendance, payment, and class notifications here.</p>
                            </div>
                        ) : (
                            alerts.map((alert: any, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-4 rounded-lg ${getAlertColor(alert.type)}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                                            <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{formatAlertTime(alert.time)}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                            id="parent-dashboard-quick-book-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => router.push('/parent/browse-classes')}
                        >
                            <Plus className="w-6 h-6" />
                            <span>Book Class</span>
                        </Button>
                        <Button
                            id="parent-dashboard-quick-payment-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => router.push('/parent/payments')}
                        >
                            <CreditCard className="w-6 h-6" />
                            <span>Make Payment</span>
                        </Button>
                        <Button
                            id="parent-dashboard-quick-contact-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => router.push('/parent/support')}
                        >
                            <MessageSquare className="w-6 h-6" />
                            <span>Contact Coach</span>
                        </Button>
                        <Button
                            id="parent-dashboard-quick-download-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={handleDownloadReport}
                            disabled={downloadingReport || !dashboardData}
                        >
                            {downloadingReport ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Download className="w-6 h-6" />
                            )}
                            <span>Download Report</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* AI Insights */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <CardTitle>AI Insights</CardTitle>
                                <Sparkles className="w-4 h-4 text-purple-500" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Get AI-powered progress reports and ask questions about your child's development.</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Child Selector + Generate Report */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <select
                                id="parent-dashboard-ai-child-select"
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={selectedChildIdForAi || ''}
                                onChange={(e) => {
                                    setSelectedChildIdForAi(e.target.value || null)
                                    setAiReport(null)
                                    setAiAnswer(null)
                                    setAiError(null)
                                }}
                            >
                                <option value="">Select a child</option>
                                {myChildren.map((child: any) => (
                                    <option key={child.id} value={child.id}>
                                        {child.name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                id="parent-dashboard-generate-ai-report-btn"
                                onClick={() => selectedChildIdForAi && handleGenerateAiReport(selectedChildIdForAi)}
                                disabled={!selectedChildIdForAi || aiLoading}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                            >
                                {aiLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate AI Report
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* AI Error */}
                        {aiError && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    <p className="text-sm text-amber-700">{aiError}</p>
                                </div>
                            </div>
                        )}

                        {/* AI Report Display */}
                        {aiReport && !aiError && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {aiReport.summary && (
                                    <div className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <Brain className="w-4 h-4 text-indigo-600" />
                                            Summary
                                        </h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">{aiReport.summary}</p>
                                    </div>
                                )}
                                {aiReport.highlights && aiReport.highlights.length > 0 && (
                                    <div className="p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-green-600" />
                                            Highlights
                                        </h4>
                                        <ul className="space-y-1">
                                            {aiReport.highlights.map((highlight: string, idx: number) => (
                                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">&#8226;</span>
                                                    {highlight}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {aiReport.recommendations && aiReport.recommendations.length > 0 && (
                                    <div className="p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <Brain className="w-4 h-4 text-purple-600" />
                                            Recommendations
                                        </h4>
                                        <ul className="space-y-1">
                                            {aiReport.recommendations.map((rec: string, idx: number) => (
                                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <span className="text-purple-500 mt-0.5">&#8226;</span>
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Ask AI Section */}
                        <div className="border-t border-indigo-100 pt-4">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-indigo-600" />
                                Ask AI About Your Child
                            </h4>
                            <div className="flex gap-2">
                                <input
                                    id="parent-dashboard-ai-question-input"
                                    type="text"
                                    placeholder={selectedChildIdForAi ? "e.g., How is my child progressing in swimming?" : "Select a child first..."}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={aiQuestion}
                                    onChange={(e) => setAiQuestion(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !aiAnswerLoading) {
                                            handleAskAi()
                                        }
                                    }}
                                    disabled={!selectedChildIdForAi || aiAnswerLoading}
                                />
                                <Button
                                    id="parent-dashboard-ask-ai-btn"
                                    onClick={handleAskAi}
                                    disabled={!selectedChildIdForAi || !aiQuestion.trim() || aiAnswerLoading}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                                >
                                    {aiAnswerLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Ask'
                                    )}
                                </Button>
                            </div>
                            {aiAnswer && !aiError && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 p-4 bg-white rounded-lg border border-indigo-100 shadow-sm"
                                >
                                    <div className="flex items-start gap-2">
                                        <Brain className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700 leading-relaxed">{aiAnswer}</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

export default ParentDashboard
