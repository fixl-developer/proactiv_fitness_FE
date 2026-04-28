'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Calendar, DollarSign, UserCheck, Target, Bell, RefreshCw,
    CheckCircle, ArrowUp, Plus, BarChart3, AlertTriangle,
    Wifi, AlertCircle, ExternalLink, Phone, MoreHorizontal, UserPlus,
    Brain, Sparkles, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api/client'
import { smartSchedulerService, revenueIntelligenceService } from '@/services/advancedAIServices'
import { formatAIResponse } from '@/utils/formatAIResponse'

const ManagerDashboard = () => {
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('today')
    const [aiData, setAiData] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [scheduleInsights, setScheduleInsights] = useState<any>(null)
    const [scheduleLoading, setScheduleLoading] = useState(false)
    const [aiToolLoading, setAiToolLoading] = useState<string | null>(null)
    const [aiToolResults, setAiToolResults] = useState<Record<string, any>>({})

    const loadAiInsights = async () => {
        setAiLoading(true)
        try {
            const res = await revenueIntelligenceService.getOptimizationSuggestions()
            setAiData(res)
        } catch { setAiData(null) }
        finally { setAiLoading(false) }
    }

    const loadScheduleInsights = async () => {
        setScheduleLoading(true)
        try {
            const res = await smartSchedulerService.predictAttendance({ locationId: assignedLocation.id } as any)
            setScheduleInsights(res)
        } catch { setScheduleInsights(null) }
        finally { setScheduleLoading(false) }
    }

    const runAITool = async (key: string, fn: () => Promise<any>) => {
        setAiToolLoading(key)
        try {
            const res = await fn()
            setAiToolResults(prev => ({ ...prev, [key]: { data: res?.data || res } }))
        } catch {
            setAiToolResults(prev => ({ ...prev, [key]: { data: { message: 'AI service temporarily unavailable. Please try again.' } } }))
        } finally { setAiToolLoading(null) }
    }

    const [assignedLocation, setAssignedLocation] = useState({
        id: 'cyberport',
        name: 'ProGym Cyberport',
        address: 'Shop 3-4, G/F, The Arcade, 100 Cyberport Road',
        manager: 'Lisa Zhang',
        phone: '+852 2234 5678',
        operatingHours: '9:00 AM - 9:00 PM'
    })

    const [locationStats, setLocationStats] = useState({
        activeStudents: 0,
        todaysClasses: 0,
        attendanceRate: 0,
        pendingAssessments: 0,
        conversionRate: 0,
        underfilledClasses: 0,
        coachAvailability: 0,
        totalCoaches: 0,
        todayRevenue: 0,
        weeklyTarget: 12000,
        monthlyTarget: 48000
    })

    const loadDashboardData = async () => {
        try {
            const response = await apiClient.get('/manager/dashboard')
            if (response.success && response.data) {
                const d = response.data
                if (d.location) setAssignedLocation(prev => ({ ...prev, ...d.location }))
                setLocationStats(prev => ({
                    ...prev,
                    activeStudents: d.activeStudents ?? prev.activeStudents,
                    todaysClasses: d.todaysClasses ?? prev.todaysClasses,
                    attendanceRate: d.attendanceRate ?? prev.attendanceRate,
                    pendingAssessments: d.pendingAssessments ?? prev.pendingAssessments,
                    conversionRate: d.conversionRate ?? prev.conversionRate,
                    underfilledClasses: d.underfilledClasses ?? prev.underfilledClasses,
                    coachAvailability: d.coachAvailability ?? prev.coachAvailability,
                    totalCoaches: d.totalCoaches ?? prev.totalCoaches,
                    todayRevenue: d.todayRevenue ?? prev.todayRevenue,
                }))
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error)
            // Use fallback defaults
            setLocationStats({
                activeStudents: 280,
                todaysClasses: 12,
                attendanceRate: 87.5,
                pendingAssessments: 8,
                conversionRate: 72.5,
                underfilledClasses: 3,
                coachAvailability: 5,
                totalCoaches: 6,
                todayRevenue: 1800,
                weeklyTarget: 12000,
                monthlyTarget: 48000
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated && !localStorage.getItem('token')) {
            router.push('/login')
            return
        }
        loadDashboardData()
        loadAiInsights()
        loadScheduleInsights()
    }, [isAuthenticated, router])

    // Today's Action Panel - Auto-generated tasks
    const todaysActions = [
        {
            id: 1,
            type: 'urgent',
            title: 'Follow up Pending Assessments',
            description: '8 assessments need follow-up calls',
            action: 'Call Parents',
            actionUrl: '/manager/assessments?status=pending',
            priority: 'high',
            time: '2 hours overdue',
            icon: Phone
        },
        {
            id: 2,
            type: 'warning',
            title: 'Low Attendance Classes',
            description: 'Beginner 1 (4:00 PM) has only 3/8 students',
            action: 'Merge or Reschedule',
            actionUrl: '/manager/classes?class=beginner1-1600',
            priority: 'medium',
            time: 'Today 4:00 PM',
            icon: Users
        },
        {
            id: 3,
            type: 'critical',
            title: 'Coach Absence Risk',
            description: 'Monica marked unavailable for tomorrow',
            action: 'Find Substitute',
            actionUrl: '/manager/coaches?action=substitute&coach=monica',
            priority: 'high',
            time: 'Tomorrow',
            icon: UserCheck
        },
        {
            id: 4,
            type: 'info',
            title: 'Payment Pending Parents',
            description: '12 parents have overdue payments',
            action: 'Send Reminders',
            actionUrl: '/manager/payments?status=overdue',
            priority: 'medium',
            time: '3 days overdue',
            icon: DollarSign
        }
    ]

    // Today's Classes Schedule
    const todaysClasses = [
        {
            id: 1,
            time: '10:00 AM',
            class: 'GYMTOTS (3-4 years)',
            coach: 'Monica',
            capacity: '6/8',
            status: 'ready',
            attendance: 6,
            notes: 'All confirmed'
        },
        {
            id: 2,
            time: '11:00 AM',
            class: 'Beginner 1 (3-5 years)',
            coach: 'Juan',
            capacity: '8/8',
            status: 'full',
            attendance: 8,
            notes: 'Waiting list: 2'
        },
        {
            id: 3,
            time: '2:00 PM',
            class: 'Intermediate (6+ years)',
            coach: 'Monica',
            capacity: '5/10',
            status: 'underfilled',
            attendance: 5,
            notes: 'Consider merging'
        },
        {
            id: 4,
            time: '4:00 PM',
            class: 'Beginner 1 (3-5 years)',
            coach: 'Sami',
            capacity: '3/8',
            status: 'critical',
            attendance: 3,
            notes: 'Action needed'
        },
        {
            id: 5,
            time: '5:00 PM',
            class: 'Advanced (8+ years)',
            coach: 'Monica',
            capacity: '7/8',
            status: 'ready',
            attendance: 7,
            notes: 'Good attendance'
        }
    ]

    // Coach Status (Location Only)
    const coachStatus = [
        { name: 'Monica', status: 'available', classes: 4, utilization: 85, rating: 4.9 },
        { name: 'Juan', status: 'available', classes: 3, utilization: 75, rating: 4.7 },
        { name: 'Sami', status: 'available', classes: 2, utilization: 60, rating: 4.6 },
        { name: 'Alex', status: 'leave', classes: 0, utilization: 0, rating: 4.5 },
        { name: 'Lisa', status: 'available', classes: 2, utilization: 65, rating: 4.8 },
        { name: 'David', status: 'available', classes: 1, utilization: 40, rating: 4.4 }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            'ready': 'text-green-600 bg-green-50 border-green-200',
            'full': 'text-blue-600 bg-blue-50 border-blue-200',
            'underfilled': 'text-orange-600 bg-orange-50 border-orange-200',
            'critical': 'text-red-600 bg-red-50 border-red-200'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getActionColor = (type: string) => {
        const colors = {
            critical: 'border-l-4 border-red-500 bg-red-50',
            urgent: 'border-l-4 border-orange-500 bg-orange-50',
            warning: 'border-l-4 border-yellow-500 bg-yellow-50',
            info: 'border-l-4 border-blue-500 bg-blue-50'
        }
        return colors[type as keyof typeof colors] || 'border-l-4 border-gray-500 bg-gray-50'
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header - Location Focused */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>{assignedLocation.name} Control Room</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Daily operations & performance - {assignedLocation.address}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                        <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
                        <span className="text-xs sm:text-sm font-medium text-green-700">Live Data</span>
                    </div>

                    <Button id="manager-dashboard-refresh-btn" variant="outline" size="sm" onClick={async () => {
                        setRefreshing(true)
                        await loadDashboardData()
                        setRefreshing(false)
                    }} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {['today', 'week', 'month'].map((range) => (
                            <button id={`manager-dashboard-range-${range}-btn`}
                                key={range}
                                onClick={() => setSelectedTimeRange(range as any)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${selectedTimeRange === range
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {range === 'today' ? 'Today' : range === 'week' ? 'Week' : 'Month'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Location-Scoped KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    {
                        title: 'Active Students',
                        value: locationStats.activeStudents,
                        growth: '+12 this week',
                        icon: Users,
                        color: 'text-blue-600',
                        status: 'ready'
                    },
                    {
                        title: "Today's Classes",
                        value: locationStats.todaysClasses,
                        growth: '5 remaining',
                        icon: Calendar,
                        color: 'text-green-600',
                        status: 'ready'
                    },
                    {
                        title: 'Attendance Rate',
                        value: `${locationStats.attendanceRate}%`,
                        growth: 'Above target',
                        icon: CheckCircle,
                        color: 'text-purple-600',
                        status: locationStats.attendanceRate > 85 ? 'ready' : 'underfilled'
                    },
                    {
                        title: 'Pending Assessments',
                        value: locationStats.pendingAssessments,
                        growth: 'Need follow-up',
                        icon: AlertTriangle,
                        color: 'text-orange-600',
                        status: locationStats.pendingAssessments > 5 ? 'critical' : 'ready'
                    },
                    {
                        title: 'Conversion Rate',
                        value: `${locationStats.conversionRate}%`,
                        growth: 'This month',
                        icon: Target,
                        color: 'text-pink-600',
                        status: 'ready'
                    },
                    {
                        title: 'Underfilled Classes',
                        value: locationStats.underfilledClasses,
                        growth: 'Action needed',
                        icon: AlertCircle,
                        color: 'text-red-600',
                        status: locationStats.underfilledClasses > 2 ? 'critical' : 'ready'
                    },
                    {
                        title: 'Coach Availability',
                        value: `${locationStats.coachAvailability}/${locationStats.totalCoaches}`,
                        growth: 'Available today',
                        icon: UserCheck,
                        color: 'text-teal-600',
                        status: locationStats.coachAvailability >= 4 ? 'ready' : 'critical'
                    },
                    {
                        title: "Today's Revenue",
                        value: `HK$${locationStats.todayRevenue}`,
                        growth: 'Live tracking',
                        icon: DollarSign,
                        color: 'text-green-600',
                        status: 'ready'
                    }
                ].map((metric, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                        <Card className="relative overflow-hidden h-full hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">{metric.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <metric.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${metric.color}`} />
                                    <div className={`w-2 h-2 rounded-full ${metric.status === 'ready' ? 'bg-green-500' :
                                        metric.status === 'underfilled' ? 'bg-orange-500' : 'bg-red-500'
                                        }`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-gray-900">{metric.value}</div>
                                <div className="flex items-center mt-1">
                                    <ArrowUp className={`w-3 h-3 sm:w-4 sm:h-4 ${metric.color} mr-1`} />
                                    <span className={`text-xs sm:text-sm font-medium ${metric.color}`}>{metric.growth}</span>
                                </div>
                                <Progress value={75} className="mt-3 h-1 sm:h-2" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Today's Action Panel & Today's Classes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Action Panel */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-red-600" />
                            <CardTitle>Today's Action Items</CardTitle>
                            <Badge variant="destructive">
                                {todaysActions.filter(a => a.priority === 'high').length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {todaysActions.map((action, index) => {
                                const ActionIcon = action.icon
                                return (
                                    <motion.div
                                        key={action.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        id={`manager-dashboard-action-${action.id}-item`}
                                        className={`p-4 rounded-lg ${getActionColor(action.type)} hover:shadow-md transition-shadow cursor-pointer`}
                                        onClick={() => window.location.href = action.actionUrl}
                                    >
                                        <div className="flex items-start gap-3">
                                            <ActionIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                                                        {action.title}
                                                    </h4>
                                                    <Badge
                                                        variant={action.priority === 'high' ? 'destructive' : 'secondary'}
                                                        className="text-xs"
                                                    >
                                                        {action.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-700 mb-2">{action.description}</p>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500">{action.time}</span>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Button id={`manager-dashboard-action-${action.id}-btn`} size="sm" variant="outline" className="text-xs h-6">
                                                        {action.action}
                                                    </Button>
                                                    <ExternalLink className="w-3 h-3 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Today's Classes Schedule */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <CardTitle>Today's Classes</CardTitle>
                            </div>
                            <Button id="manager-dashboard-add-class-btn" variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Class
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {todaysClasses.map((classItem, index) => (
                                <motion.div
                                    key={classItem.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-bold text-gray-900">{classItem.time}</div>
                                            <Badge className={getStatusColor(classItem.status)}>
                                                {classItem.status}
                                            </Badge>
                                        </div>
                                        <Button id={`manager-dashboard-class-${classItem.id}-more-btn`} variant="ghost" size="sm">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{classItem.class}</h4>
                                            <p className="text-sm text-gray-600">Coach: {classItem.coach}</p>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Capacity: {classItem.capacity}</span>
                                            <span className="text-gray-600">Attendance: {classItem.attendance}</span>
                                        </div>

                                        <div className="text-xs text-gray-500">{classItem.notes}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Coach Status & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coach Status */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-purple-600" />
                            <CardTitle>Coach Status (Today)</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {coachStatus.map((coach, index) => (
                                <motion.div
                                    key={coach.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {coach.name[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{coach.name}</h4>
                                            <p className="text-sm text-gray-600">{coach.classes} classes today</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Utilization</p>
                                            <p className="text-sm font-bold">{coach.utilization}%</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-600">Rating</p>
                                            <p className="text-sm font-bold text-yellow-600">{coach.rating}</p>
                                        </div>
                                        <Badge className={
                                            coach.status === 'available' ? 'text-green-600 bg-green-50' :
                                                coach.status === 'leave' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
                                        }>
                                            {coach.status}
                                        </Badge>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Users, label: 'Mark Attendance', href: '/manager/attendance' },
                                { icon: Calendar, label: 'Adjust Schedule', href: '/manager/schedule' },
                                { icon: UserPlus, label: 'Add Assessment', href: '/manager/assessments/new' },
                                { icon: Phone, label: 'Call Parents', href: '/manager/customers' },
                                { icon: DollarSign, label: 'Payment Follow-up', href: '/manager/payments' },
                                { icon: BarChart3, label: 'View Reports', href: '/manager/reports' }
                            ].map((action, index) => (
                                <Button id={`manager-dashboard-quick-${action.label.toLowerCase().replace(/\s+/g, '-')}-btn`}
                                    key={index}
                                    className="h-16 flex-col gap-2"
                                    variant="outline"
                                    onClick={() => window.location.href = action.href}
                                >
                                    <action.icon className="w-5 h-5" />
                                    <span className="text-xs text-center">{action.label}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Insights & Tools */}
            <div className="mt-6 space-y-6">
                {/* Revenue Intelligence Insights */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-900">AI Revenue Insights</h3>
                            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">AI Powered</span>
                        </div>
                        <button onClick={loadAiInsights} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="p-6">
                        {aiLoading ? (
                            <div className="flex items-center justify-center py-6 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                <p className="text-sm text-gray-500">Analyzing revenue data with AI...</p>
                            </div>
                        ) : aiData ? (
                            <div className="space-y-3">
                                {(Array.isArray(aiData) ? aiData : aiData?.recommendations || aiData?.suggestions || [aiData]).slice(0, 5).map((item: any, i: number) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.title || item.recommendation || item.name || item.suggestion || formatAIResponse(item, 150)}</p>
                                            {item.description && <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>}
                                            {item.impact && <p className="text-xs text-green-600 mt-0.5">Impact: {item.impact}</p>}
                                            {item.priority && <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${item.priority === 'high' ? 'bg-red-100 text-red-700' : item.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{item.priority}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Click refresh to generate AI revenue insights</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Smart Schedule Predictions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">AI Schedule Optimizer</h3>
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">Smart</span>
                        </div>
                        <button onClick={loadScheduleInsights} disabled={scheduleLoading} className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className={`w-4 h-4 ${scheduleLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="p-6">
                        {scheduleLoading ? (
                            <div className="flex items-center justify-center py-6 gap-2">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                <p className="text-sm text-gray-500">Predicting attendance patterns...</p>
                            </div>
                        ) : scheduleInsights ? (
                            <div className="space-y-3">
                                {scheduleInsights.predictions ? (
                                    (Array.isArray(scheduleInsights.predictions) ? scheduleInsights.predictions : [scheduleInsights.predictions]).slice(0, 4).map((pred: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{pred.className || pred.timeSlot || pred.day || formatAIResponse(pred, 60)}</p>
                                                    {pred.predictedAttendance && <p className="text-xs text-gray-600">Predicted: {pred.predictedAttendance} students</p>}
                                                </div>
                                            </div>
                                            {pred.confidence && (
                                                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                                    {typeof pred.confidence === 'number' && pred.confidence <= 1 ? `${Math.round(pred.confidence * 100)}%` : pred.confidence} confidence
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-700">{formatAIResponse(scheduleInsights, 200)}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Click refresh to get AI schedule predictions</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Tools Hub */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-600" />
                            <h3 className="text-lg font-semibold text-gray-900">AI & Automation Hub</h3>
                            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">Tools</span>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Content Engine */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-600" /> AI Content Engine
                                </h4>
                                <button
                                    onClick={() => runAITool('promo', () => apiClient.post('/ai-content-engine/generate-social-post', { topic: `${assignedLocation.name} promotions` }))}
                                    disabled={aiToolLoading === 'promo'}
                                    className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-medium text-indigo-700 w-full transition-colors"
                                >
                                    {aiToolLoading === 'promo' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    Generate Location Promo
                                </button>
                                <button
                                    onClick={() => runAITool('email', () => apiClient.post('/ai-content-engine/generate-email', { type: 'follow-up', audience: 'parents' }))}
                                    disabled={aiToolLoading === 'email'}
                                    className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-medium text-indigo-700 w-full transition-colors"
                                >
                                    {aiToolLoading === 'email' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                                    Generate Parent Email
                                </button>
                                {aiToolResults.promo && (
                                    <div className="p-3 bg-indigo-50 rounded-lg text-xs">
                                        <p className="font-medium text-indigo-700 mb-1">Generated Promo:</p>
                                        <p className="text-gray-700">{aiToolResults.promo.data?.content || aiToolResults.promo.data?.post || aiToolResults.promo.data?.title || formatAIResponse(aiToolResults.promo.data, 200)}</p>
                                    </div>
                                )}
                                {aiToolResults.email && (
                                    <div className="p-3 bg-indigo-50 rounded-lg text-xs">
                                        <p className="font-medium text-indigo-700 mb-1">Generated Email:</p>
                                        <p className="text-gray-700">{aiToolResults.email.data?.content || aiToolResults.email.data?.subject || formatAIResponse(aiToolResults.email.data, 200)}</p>
                                    </div>
                                )}
                            </div>

                            {/* Workflow Orchestrator */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                    <Target className="w-4 h-4 text-amber-600" /> Workflow Automation
                                </h4>
                                <button
                                    onClick={() => runAITool('workflow', () => apiClient.post('/workflow-orchestrator/schedule-report', { type: 'daily', recipients: ['manager'] }))}
                                    disabled={aiToolLoading === 'workflow'}
                                    className="flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-medium text-amber-700 w-full transition-colors"
                                >
                                    {aiToolLoading === 'workflow' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3" />}
                                    Schedule Daily Report
                                </button>
                                <button
                                    onClick={() => runAITool('wfHealth', () => apiClient.get('/workflow-orchestrator/health/default'))}
                                    disabled={aiToolLoading === 'wfHealth'}
                                    className="flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-medium text-amber-700 w-full transition-colors"
                                >
                                    {aiToolLoading === 'wfHealth' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                    Check Workflow Health
                                </button>
                                {aiToolResults.workflow && (
                                    <div className="p-3 bg-amber-50 rounded-lg text-xs">
                                        <p className="font-medium text-amber-700 mb-1">Report Scheduled:</p>
                                        <p className="text-gray-700">{aiToolResults.workflow.data?.message || aiToolResults.workflow.data?.status || formatAIResponse(aiToolResults.workflow.data, 150)}</p>
                                    </div>
                                )}
                                {aiToolResults.wfHealth && (
                                    <div className="p-3 bg-amber-50 rounded-lg text-xs">
                                        <p className="font-medium text-amber-700 mb-1">Workflow Health:</p>
                                        <p className="text-gray-700">{aiToolResults.wfHealth.data?.status || aiToolResults.wfHealth.data?.message || formatAIResponse(aiToolResults.wfHealth.data, 150)}</p>
                                    </div>
                                )}
                            </div>

                            {/* AI Communication */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-rose-600" /> AI Communication
                                </h4>
                                <button
                                    onClick={() => runAITool('timing', () => apiClient.post('/ai-communication/best-time/general', { audience: 'parents', channel: 'sms' }))}
                                    disabled={aiToolLoading === 'timing'}
                                    className="flex items-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-medium text-rose-700 w-full transition-colors"
                                >
                                    {aiToolLoading === 'timing' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />}
                                    Best Time to Contact
                                </button>
                                <button
                                    onClick={() => runAITool('optimize', () => apiClient.post('/ai-communication/optimize-message', { message: 'Reminder: Your child class is tomorrow at 4 PM', channels: ['sms', 'email'] }))}
                                    disabled={aiToolLoading === 'optimize'}
                                    className="flex items-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-medium text-rose-700 w-full transition-colors"
                                >
                                    {aiToolLoading === 'optimize' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    Optimize Message
                                </button>
                                {aiToolResults.timing && (
                                    <div className="p-3 bg-rose-50 rounded-lg text-xs">
                                        <p className="font-medium text-rose-700 mb-1">Best Contact Time:</p>
                                        <p className="text-gray-700">{aiToolResults.timing.data?.bestTime || aiToolResults.timing.data?.recommendation || formatAIResponse(aiToolResults.timing.data, 150)}</p>
                                    </div>
                                )}
                                {aiToolResults.optimize && (
                                    <div className="p-3 bg-rose-50 rounded-lg text-xs">
                                        <p className="font-medium text-rose-700 mb-1">Optimized Message:</p>
                                        <p className="text-gray-700">{aiToolResults.optimize.data?.optimizedMessage || aiToolResults.optimize.data?.message || formatAIResponse(aiToolResults.optimize.data, 200)}</p>
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

export default ManagerDashboard
