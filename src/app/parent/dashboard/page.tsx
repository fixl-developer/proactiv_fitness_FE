'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Calendar, DollarSign, RefreshCw, Eye, Plus, BarChart3, MessageSquare,
    ArrowUp, User, BookOpen, CreditCard, Download, TrendingUp, CheckCircle, AlertTriangle, Bell
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ParentEngagementService from '@/services/modules/parent-engagement.service'
import ParentROIService from '@/services/modules/parent-roi.service'
import BookingService from '@/services/modules/booking.service'

const ParentDashboard = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | '7d' | '30d'>('today')
    const [engagementData, setEngagementData] = useState<any>(null)
    const [roiData, setRoiData] = useState<any>(null)
    const [bookingStats, setBookingStats] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    const parentName = user?.name || 'Parent User'
    const parentId = user?.id || 'parent-1'

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadDashboardData()
    }, [isAuthenticated, router, parentId])

    const loadDashboardData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Load parent engagement data
            const engagementService = new ParentEngagementService()
            const engagementResponse = await engagementService.getEngagementProfile(parentId)
            setEngagementData(engagementResponse?.data)

            // Load parent ROI data
            const roiService = new ParentROIService()
            const roi = await roiService.getParentROI(parentId)
            setRoiData(roi)

            // Load booking statistics
            const bookingService = new BookingService()
            const bookingsResponse = await bookingService.getBookings({})
            const bookingsList = bookingsResponse?.data?.bookings || []
            setBookingStats({
                totalBookings: bookingsList.length,
                upcomingBookings: bookingsList.filter((b: any) => b.status === 'confirmed').length,
                completedBookings: bookingsList.filter((b: any) => b.status === 'completed').length
            })
        } catch (err) {
            console.error('Error loading dashboard data:', err)
            setError('Failed to load dashboard data. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadDashboardData()
        setRefreshing(false)
    }

    // Parent-specific Real-time Data
    const parentStats = {
        totalChildren: 2,
        activeEnrollments: 4,
        totalSpent: 18500,
        monthlySpent: 4200,
        upcomingClasses: 8,
        completedClasses: 45,
        averageChildRating: 4.6,
        accountBalance: 2500
    }

    const myChildren = [
        {
            id: 1,
            name: 'Emma Smith',
            age: 8,
            program: 'Beginner Gymnastics',
            level: 'Beginner',
            coach: 'Sarah Chen',
            joinDate: '2024-01-15',
            classes: 12,
            rating: 4.8,
            progress: 75,
            nextClass: '2024-01-25 10:00 AM',
            status: 'active'
        },
        {
            id: 2,
            name: 'Lucas Smith',
            age: 10,
            program: 'Intermediate Gymnastics',
            level: 'Intermediate',
            coach: 'Mike Wong',
            joinDate: '2023-11-20',
            classes: 28,
            rating: 4.7,
            progress: 85,
            nextClass: '2024-01-26 2:00 PM',
            status: 'active'
        }
    ]

    const upcomingClasses = [
        {
            id: 1,
            child: 'Emma Smith',
            program: 'Beginner Gymnastics',
            coach: 'Sarah Chen',
            date: '2024-01-25',
            time: '10:00 AM',
            location: 'Cyberport',
            status: 'confirmed',
            duration: '1 hour'
        },
        {
            id: 2,
            child: 'Lucas Smith',
            program: 'Intermediate Gymnastics',
            coach: 'Mike Wong',
            date: '2024-01-26',
            time: '2:00 PM',
            location: 'Cyberport',
            status: 'confirmed',
            duration: '1 hour'
        },
        {
            id: 3,
            child: 'Emma Smith',
            program: 'Trial Assessment',
            coach: 'Lisa Zhang',
            date: '2024-01-27',
            time: '3:30 PM',
            location: 'Wan Chai',
            status: 'pending',
            duration: '30 mins'
        }
    ]

    const recentPayments = [
        {
            id: 1,
            child: 'Emma Smith',
            program: 'Beginner Gymnastics',
            amount: 1200,
            date: '2024-01-20',
            status: 'completed',
            method: 'Credit Card'
        },
        {
            id: 2,
            child: 'Lucas Smith',
            program: 'Intermediate Gymnastics',
            amount: 1500,
            date: '2024-01-18',
            status: 'completed',
            method: 'Bank Transfer'
        },
        {
            id: 3,
            child: 'Emma Smith',
            program: 'Private Coaching',
            amount: 800,
            date: '2024-01-15',
            status: 'completed',
            method: 'Credit Card'
        }
    ]

    const alerts = [
        {
            type: 'success',
            title: 'Class Completed',
            message: 'Emma completed Beginner Gymnastics class successfully',
            time: '2h ago',
            priority: 'low'
        },
        {
            type: 'info',
            title: 'New Achievement',
            message: 'Lucas earned "Consistency Champion" badge',
            time: '4h ago',
            priority: 'low'
        },
        {
            type: 'info',
            title: 'Coach Feedback',
            message: 'Sarah Chen left feedback on Emma\'s progress',
            time: '1d ago',
            priority: 'low'
        }
    ]

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
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Parent Info */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Children's Progress</h1>
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
                        onClick={() => setRefreshing(true)}
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

            {/* Key Metrics - 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* My Children */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">My Children</CardTitle>
                            <Users className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{parentStats.totalChildren}</div>
                            <div className="flex items-center mt-1">
                                <span className="text-sm text-blue-600 font-medium">All active</span>
                            </div>
                            <Progress value={100} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Active Enrollments */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Programs</CardTitle>
                            <BookOpen className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{parentStats.activeEnrollments}</div>
                            <div className="flex items-center mt-1">
                                <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                                <span className="text-sm text-green-600 font-medium">Ongoing</span>
                            </div>
                            <Progress value={80} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Total Spent */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
                            <CreditCard className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">HK${parentStats.totalSpent.toLocaleString()}</div>
                            <div className="flex items-center mt-1">
                                <span className="text-sm text-purple-600 font-medium">This year</span>
                            </div>
                            <Progress value={65} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Account Balance */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Account Balance</CardTitle>
                            <DollarSign className="h-5 w-5 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">HK${parentStats.accountBalance.toLocaleString()}</div>
                            <div className="flex items-center mt-1">
                                <span className="text-sm text-yellow-600 font-medium">Available</span>
                            </div>
                            <Progress value={72} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* My Children Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {myChildren.map((child, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                            {child.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{child.name}</CardTitle>
                                            <p className="text-sm text-gray-500">{child.age} years old</p>
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(child.status)}>
                                        {child.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Program</p>
                                            <p className="font-semibold text-gray-900">{child.program}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Coach</p>
                                            <p className="font-semibold text-gray-900">{child.coach}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Classes</p>
                                            <p className="font-semibold text-gray-900">{child.classes}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Rating</p>
                                            <p className="font-semibold text-yellow-600">⭐ {child.rating}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Progress</span>
                                            <span className="font-medium">{child.progress}%</span>
                                        </div>
                                        <Progress value={child.progress} className="h-2" />
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Next Class:</strong> {child.nextClass}
                                        </p>
                                    </div>
                                    <Button id={`parent-dashboard-child-${child.id}-details-btn`} className="w-full" variant="outline">
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Upcoming Classes */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <CardTitle>Upcoming Classes</CardTitle>
                            <Badge>{upcomingClasses.length} classes</Badge>
                        </div>
                        <Button id="parent-dashboard-book-new-class-btn" variant="outline" size="sm">Book New Class</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {upcomingClasses.map((session, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        {session.date.split('-')[2]}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{session.program}</h4>
                                        <p className="text-sm text-gray-600">{session.child} • {session.coach}</p>
                                        <p className="text-xs text-gray-500">{session.date} at {session.time} • {session.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge className={getStatusColor(session.status)} variant="outline">
                                        {session.status}
                                    </Badge>
                                    <Button id={`parent-dashboard-class-${session.id}-view-btn`} variant="ghost" size="sm">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
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
                        <Button id="parent-dashboard-view-all-payments-btn" variant="outline" size="sm">View All</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentPayments.map((payment, index) => (
                            <motion.div
                                key={index}
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
                                        <h4 className="font-semibold text-gray-900">{payment.program}</h4>
                                        <p className="text-sm text-gray-600">{payment.child} • {payment.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-600">HK${payment.amount}</p>
                                    <Badge className={getStatusColor(payment.status)} variant="outline">
                                        {payment.status}
                                    </Badge>
                                </div>
                            </motion.div>
                        ))}
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
                        {alerts.map((alert, index) => (
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
                                        <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                                    </div>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button id="parent-dashboard-quick-book-btn" className="h-20 flex-col gap-2" variant="outline">
                            <Plus className="w-6 h-6" />
                            <span>Book Class</span>
                        </Button>
                        <Button id="parent-dashboard-quick-payment-btn" className="h-20 flex-col gap-2" variant="outline">
                            <CreditCard className="w-6 h-6" />
                            <span>Make Payment</span>
                        </Button>
                        <Button id="parent-dashboard-quick-contact-btn" className="h-20 flex-col gap-2" variant="outline">
                            <MessageSquare className="w-6 h-6" />
                            <span>Contact Coach</span>
                        </Button>
                        <Button id="parent-dashboard-quick-download-btn" className="h-20 flex-col gap-2" variant="outline">
                            <Download className="w-6 h-6" />
                            <span>Download Report</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ParentDashboard
