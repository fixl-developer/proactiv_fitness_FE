'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, TrendingUp, Award, BookOpen, CreditCard, ArrowRight, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function UserDashboardPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [stats, setStats] = useState({
        upcomingClasses: 3,
        completedClasses: 24,
        totalBookings: 27,
        achievements: 5
    })
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadDashboard()
    }, [isAuthenticated, router])

    const loadDashboard = async () => {
        try {
            setIsLoading(true)
            // Mock data for dashboard
            setUpcomingClasses([
                { id: '1', className: 'Gymnastics Basics', coach: 'Coach Sarah', date: '2026-03-25', time: '10:00 AM', location: 'Wan Chai', status: 'confirmed' },
                { id: '2', className: 'Advanced Tumbling', coach: 'Coach Mike', date: '2026-03-26', time: '2:00 PM', location: 'Cyberport', status: 'confirmed' },
                { id: '3', className: 'Flexibility Training', coach: 'Coach Lisa', date: '2026-03-28', time: '11:00 AM', location: 'Wan Chai', status: 'pending' }
            ])
        } catch (err) {
            console.error('Error loading dashboard:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadDashboard()
        setRefreshing(false)
    }

    const displayName = user?.name || (user as any)?.firstName || 'User'

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
                    </div>
                </div>
            </div>
        )
    }

    const quickActions = [
        { label: 'Book a Class', href: '/user/my-classes', icon: BookOpen },
        { label: 'View Bookings', href: '/user/bookings', icon: Calendar },
        { label: 'My Progress', href: '/user/progress', icon: TrendingUp },
        { label: 'Payments', href: '/user/payments', icon: CreditCard }
    ]

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {displayName}!</h1>
                    <p className="text-gray-600 mt-2">Here&apos;s your fitness overview</p>
                </div>
                <Button id="user-dashboard-refresh-btn" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Upcoming Classes</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.upcomingClasses}</p>
                                </div>
                                <Calendar className="w-10 h-10 text-blue-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Completed</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedClasses}</p>
                                </div>
                                <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Bookings</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
                                </div>
                                <BookOpen className="w-10 h-10 text-purple-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Achievements</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.achievements}</p>
                                </div>
                                <Award className="w-10 h-10 text-amber-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon
                            return (
                                <Button
                                    id={`user-dashboard-action-${action.label.toLowerCase().replace(/\s+/g, '-')}-btn`}
                                    key={action.label}
                                    variant="outline"
                                    className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-emerald-50 hover:border-emerald-300"
                                    onClick={() => router.push(action.href)}
                                >
                                    <Icon className="w-6 h-6 text-emerald-600" />
                                    <span className="text-sm font-medium">{action.label}</span>
                                </Button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Classes */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Upcoming Classes</CardTitle>
                        <Button id="user-dashboard-view-all-classes-btn" variant="ghost" size="sm" onClick={() => router.push('/user/my-classes')}>
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {upcomingClasses.map((cls, index) => (
                            <motion.div
                                key={cls.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        {cls.date.split('-')[2]}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{cls.className}</h4>
                                        <p className="text-sm text-gray-500">{cls.coach} • {cls.time} • {cls.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={cls.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                        {cls.status}
                                    </Badge>
                                    <Button id={`user-dashboard-view-class-${cls.id}-btn`} variant="outline" size="sm" onClick={() => router.push(`/user/my-classes`)}>
                                        View
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Progress Overview</CardTitle>
                        <Button id="user-dashboard-view-progress-btn" variant="ghost" size="sm" onClick={() => router.push('/user/progress')}>
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Monthly Attendance</span>
                                <span className="text-sm text-emerald-600 font-bold">85%</span>
                            </div>
                            <Progress value={85} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Skill Level</span>
                                <span className="text-sm text-emerald-600 font-bold">Intermediate</span>
                            </div>
                            <Progress value={60} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Goals Completed</span>
                                <span className="text-sm text-emerald-600 font-bold">3/5</span>
                            </div>
                            <Progress value={60} className="h-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
