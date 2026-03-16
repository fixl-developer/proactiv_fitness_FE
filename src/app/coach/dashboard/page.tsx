'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Calendar, Clock, Star, CheckCircle, AlertTriangle,
    Bell, RefreshCw, User, MapPin, BookOpen, Timer,
    MessageSquare, Phone, FileText, Award, Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const CoachDashboard = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Coach Info
    const coachInfo = {
        name: 'Sarah Chen',
        location: 'ProGym Cyberport',
        phone: '+852 9876 5432',
        email: 'sarah.chen@progym.hk',
        employeeId: 'PG-C-001',
        joinDate: '2023-03-15',
        specialization: 'Gymnastics & Tumbling',
        certifications: ['Level 2 Gymnastics', 'First Aid', 'Child Safety']
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            if (!isAuthenticated) {
                window.location.href = '/login'
                return
            }
        }
        setTimeout(() => setIsLoading(false), 800)
    }, [])

    // TODAY'S SCHEDULE - Primary Focus
    const todaysSchedule = [
        {
            id: 1,
            time: '10:00 AM',
            endTime: '11:00 AM',
            class: 'GYMTOTS (3-4 years)',
            level: 'Beginner',
            students: 6,
            capacity: 8,
            location: 'Studio A',
            status: 'completed',
            attendance: [
                { name: 'Emma Wong', present: true },
                { name: 'Lucas Chen', present: true },
                { name: 'Sophia Li', present: false },
                { name: 'Ryan Kim', present: true },
                { name: 'Mia Zhang', present: true },
                { name: 'Alex Tan', present: true }
            ],
            notes: 'Focus on basic rolls and balance beam'
        },
        {
            id: 2,
            time: '11:00 AM',
            endTime: '12:00 PM',
            class: 'Beginner 1 (5-7 years)',
            level: 'Beginner',
            students: 8,
            capacity: 8,
            location: 'Studio A',
            status: 'current',
            attendance: [],
            notes: 'Handstand progression, cartwheel practice'
        },
        {
            id: 3,
            time: '2:00 PM',
            endTime: '3:30 PM',
            class: 'Intermediate (8-10 years)',
            level: 'Intermediate',
            students: 5,
            capacity: 8,
            location: 'Studio B',
            status: 'upcoming',
            attendance: [],
            notes: 'Back walkover, round-off back handspring'
        },
        {
            id: 4,
            time: '4:00 PM',
            endTime: '5:00 PM',
            class: 'Advanced (11+ years)',
            level: 'Advanced',
            students: 4,
            capacity: 6,
            location: 'Studio A',
            status: 'upcoming',
            attendance: [],
            notes: 'Layout, full twisting, competition prep'
        }
    ]

    // Quick Stats for Coach
    const coachStats = {
        todayClasses: todaysSchedule.length,
        totalStudents: todaysSchedule.reduce((sum, cls) => sum + cls.students, 0),
        completedClasses: todaysSchedule.filter(cls => cls.status === 'completed').length,
        averageAttendance: 85,
        monthlyRating: 4.9,
        totalReviews: 156
    }

    // SOP & Training Materials
    const sopMaterials = [
        {
            id: 1,
            title: 'GYMTOTS Safety Guidelines',
            category: 'Safety',
            lastUpdated: '2024-01-15',
            priority: 'high',
            url: '/sop/gymtots-safety'
        },
        {
            id: 2,
            title: 'Beginner Skill Progressions',
            category: 'Curriculum',
            lastUpdated: '2024-01-10',
            priority: 'medium',
            url: '/sop/beginner-progressions'
        },
        {
            id: 3,
            title: 'Emergency Procedures',
            category: 'Safety',
            lastUpdated: '2024-01-05',
            priority: 'high',
            url: '/sop/emergency-procedures'
        },
        {
            id: 4,
            title: 'Parent Communication Guide',
            category: 'Communication',
            lastUpdated: '2023-12-20',
            priority: 'low',
            url: '/sop/parent-communication'
        }
    ]

    // Recent Messages/Notifications
    const recentMessages = [
        {
            id: 1,
            type: 'info',
            from: 'Manager',
            message: 'New student Emma Wong joining your 10 AM class',
            time: '30 mins ago',
            priority: 'medium'
        },
        {
            id: 2,
            type: 'reminder',
            from: 'System',
            message: 'Monthly safety training due next week',
            time: '2 hours ago',
            priority: 'low'
        },
        {
            id: 3,
            type: 'feedback',
            from: 'Parent',
            message: 'Mrs. Chen left positive feedback for Lucas',
            time: '1 day ago',
            priority: 'low'
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            completed: 'text-green-600 bg-green-50 border-green-200',
            current: 'text-blue-600 bg-blue-50 border-blue-200',
            upcoming: 'text-orange-600 bg-orange-50 border-orange-200',
            cancelled: 'text-red-600 bg-red-50 border-red-200'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" />
            case 'current': return <Activity className="w-4 h-4 animate-pulse" />
            case 'upcoming': return <Clock className="w-4 h-4" />
            default: return <AlertTriangle className="w-4 h-4" />
        }
    }

    const getPriorityColor = (priority: string) => {
        const colors = {
            high: 'text-red-600 bg-red-50',
            medium: 'text-orange-600 bg-orange-50',
            low: 'text-green-600 bg-green-50'
        }
        return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Simple Header - Coach Focused */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        आज मुझे क्या पढ़ाना है? (What do I teach today?)
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-gray-900">{coachInfo.name}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{coachInfo.location}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-green-700">On Duty</span>
                        </div>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRefreshing(true)}
                    disabled={refreshing}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Quick Stats - Minimal */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Today's Classes", value: coachStats.todayClasses, icon: Calendar, color: 'text-blue-600' },
                    { label: 'Total Students', value: coachStats.totalStudents, icon: Users, color: 'text-green-600' },
                    { label: 'Completed', value: coachStats.completedClasses, icon: CheckCircle, color: 'text-purple-600' },
                    { label: 'Rating', value: `${coachStats.monthlyRating}/5`, icon: Star, color: 'text-yellow-600' }
                ].map((stat, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                        <Card className="text-center">
                            <CardContent className="p-4">
                                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-xs text-gray-600">{stat.label}</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* TODAY'S SCHEDULE - Primary Focus */}
            <Card className="border-2 border-blue-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <CardTitle className="text-lg">Today's Classes Schedule</CardTitle>
                            <Badge className="bg-blue-100 text-blue-700">
                                {todaysSchedule.length} classes
                            </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {todaysSchedule.map((classItem, index) => (
                            <motion.div
                                key={classItem.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${classItem.status === 'current'
                                        ? 'border-blue-300 bg-blue-50'
                                        : 'border-gray-200 bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-gray-900">{classItem.time}</div>
                                            <div className="text-xs text-gray-500">{classItem.endTime}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(classItem.status)}
                                            <Badge className={getStatusColor(classItem.status)}>
                                                {classItem.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                            {classItem.students}/{classItem.capacity} students
                                        </div>
                                        <div className="text-xs text-gray-500">{classItem.location}</div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <h4 className="font-semibold text-gray-900 mb-1">{classItem.class}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{classItem.notes}</p>
                                    <Badge variant="outline" className="text-xs">
                                        {classItem.level}
                                    </Badge>
                                </div>

                                {/* Attendance Section */}
                                {classItem.status === 'completed' && classItem.attendance.length > 0 && (
                                    <div className="border-t pt-3">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">Attendance:</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {classItem.attendance.map((student, idx) => (
                                                <Badge
                                                    key={idx}
                                                    className={student.present
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }
                                                >
                                                    {student.name} {student.present ? '✓' : '✗'}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-3">
                                    {classItem.status === 'current' && (
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                            <Users className="w-4 h-4 mr-2" />
                                            Mark Attendance
                                        </Button>
                                    )}
                                    {classItem.status === 'upcoming' && (
                                        <Button size="sm" variant="outline">
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            View Lesson Plan
                                        </Button>
                                    )}
                                    {classItem.status === 'completed' && (
                                        <Button size="sm" variant="outline">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Add Notes
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Section - SOP & Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SOP & Training Materials */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            <CardTitle>SOP & Training Materials</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {sopMaterials.map((material, index) => (
                                <motion.div
                                    key={material.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => window.open(material.url, '_blank')}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{material.title}</h4>
                                            <p className="text-sm text-gray-600">{material.category}</p>
                                            <p className="text-xs text-gray-500">Updated: {material.lastUpdated}</p>
                                        </div>
                                        <Badge className={getPriorityColor(material.priority)}>
                                            {material.priority}
                                        </Badge>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Messages & Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-orange-600" />
                            <CardTitle>Messages & Updates</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentMessages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-900">{message.from}</span>
                                        </div>
                                        <Badge className={getPriorityColor(message.priority)} variant="outline">
                                            {message.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-1">{message.message}</p>
                                    <p className="text-xs text-gray-500">{message.time}</p>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions - Simplified */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { icon: Users, label: 'My Students', href: '/coach/students' },
                            { icon: Calendar, label: 'Full Schedule', href: '/coach/schedule' },
                            { icon: Clock, label: 'Update Availability', href: '/coach/availability' },
                            { icon: Phone, label: 'Contact Manager', href: 'tel:+85222345678' }
                        ].map((action, index) => (
                            <Button
                                key={index}
                                className="h-16 flex-col gap-2"
                                variant="outline"
                                onClick={() => {
                                    if (action.href.startsWith('tel:')) {
                                        window.location.href = action.href
                                    } else {
                                        window.location.href = action.href
                                    }
                                }}
                            >
                                <action.icon className="w-5 h-5" />
                                <span className="text-xs text-center">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CoachDashboard
