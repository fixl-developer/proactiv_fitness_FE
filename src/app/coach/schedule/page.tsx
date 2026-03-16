'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, Users, MapPin, CheckCircle, AlertTriangle,
    Filter, Plus, Edit, MoreHorizontal, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const CoachSchedulePage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedWeek, setSelectedWeek] = useState('current')

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 800)
    }, [])

    const weeklySchedule = [
        {
            day: 'Monday',
            date: '2024-01-15',
            classes: [
                {
                    time: '10:00 AM - 11:00 AM',
                    class: 'GYMTOTS (3-4 years)',
                    students: 6,
                    capacity: 8,
                    location: 'Studio A',
                    status: 'confirmed'
                },
                {
                    time: '2:00 PM - 3:30 PM',
                    class: 'Intermediate (8-10 years)',
                    students: 5,
                    capacity: 8,
                    location: 'Studio B',
                    status: 'confirmed'
                }
            ]
        },
        {
            day: 'Tuesday',
            date: '2024-01-16',
            classes: [
                {
                    time: '11:00 AM - 12:00 PM',
                    class: 'Beginner 1 (5-7 years)',
                    students: 8,
                    capacity: 8,
                    location: 'Studio A',
                    status: 'full'
                },
                {
                    time: '4:00 PM - 5:00 PM',
                    class: 'Advanced (11+ years)',
                    students: 4,
                    capacity: 6,
                    location: 'Studio A',
                    status: 'confirmed'
                }
            ]
        },
        {
            day: 'Wednesday',
            date: '2024-01-17',
            classes: [
                {
                    time: '10:00 AM - 11:00 AM',
                    class: 'GYMTOTS (3-4 years)',
                    students: 7,
                    capacity: 8,
                    location: 'Studio A',
                    status: 'confirmed'
                },
                {
                    time: '3:00 PM - 4:00 PM',
                    class: 'Private Coaching',
                    students: 1,
                    capacity: 2,
                    location: 'Studio C',
                    status: 'confirmed'
                }
            ]
        },
        {
            day: 'Thursday',
            date: '2024-01-18',
            classes: [
                {
                    time: '11:00 AM - 12:00 PM',
                    class: 'Beginner 1 (5-7 years)',
                    students: 6,
                    capacity: 8,
                    location: 'Studio A',
                    status: 'low_attendance'
                },
                {
                    time: '5:00 PM - 6:30 PM',
                    class: 'Advanced Skills',
                    students: 4,
                    capacity: 6,
                    location: 'Studio A',
                    status: 'confirmed'
                }
            ]
        },
        {
            day: 'Friday',
            date: '2024-01-19',
            classes: [
                {
                    time: '10:00 AM - 11:00 AM',
                    class: 'Trial Class',
                    students: 3,
                    capacity: 5,
                    location: 'Studio B',
                    status: 'trial'
                },
                {
                    time: '2:00 PM - 3:30 PM',
                    class: 'Intermediate (8-10 years)',
                    students: 7,
                    capacity: 8,
                    location: 'Studio B',
                    status: 'confirmed'
                }
            ]
        },
        {
            day: 'Saturday',
            date: '2024-01-20',
            classes: [
                {
                    time: '9:00 AM - 10:00 AM',
                    class: 'GYMTOTS (3-4 years)',
                    students: 8,
                    capacity: 8,
                    location: 'Studio A',
                    status: 'full'
                },
                {
                    time: '11:00 AM - 12:30 PM',
                    class: 'Competition Prep',
                    students: 5,
                    capacity: 6,
                    location: 'Studio A',
                    status: 'confirmed'
                }
            ]
        },
        {
            day: 'Sunday',
            date: '2024-01-21',
            classes: []
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            confirmed: 'text-green-600 bg-green-50 border-green-200',
            full: 'text-blue-600 bg-blue-50 border-blue-200',
            low_attendance: 'text-orange-600 bg-orange-50 border-orange-200',
            trial: 'text-purple-600 bg-purple-50 border-purple-200'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="coach" userName="Sarah Chen">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout userRole="coach" userName="Sarah Chen">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Weekly Schedule</h1>
                        <p className="text-gray-600">Manage your classes and availability</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                            {['current', 'next', 'previous'].map((week) => (
                                <button
                                    key={week}
                                    onClick={() => setSelectedWeek(week)}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedWeek === week
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {week === 'current' ? 'This Week' : week === 'next' ? 'Next Week' : 'Last Week'}
                                </button>
                            ))}
                        </div>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Weekly Calendar Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                    {weeklySchedule.map((day, index) => (
                        <motion.div
                            key={day.day}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`h-full ${day.day === 'Sunday' ? 'bg-gray-50' : ''}`}>
                                <CardHeader className="pb-3">
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-900">{day.day}</h3>
                                        <p className="text-sm text-gray-500">{day.date}</p>
                                        {day.classes.length > 0 && (
                                            <Badge variant="outline" className="mt-2">
                                                {day.classes.length} classes
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {day.classes.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No classes</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {day.classes.map((classItem, classIndex) => (
                                                <div
                                                    key={classIndex}
                                                    className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                            <MoreHorizontal className="w-3 h-3" />
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <p className="text-xs font-medium text-gray-900">{classItem.time}</p>
                                                        <h4 className="text-sm font-semibold text-gray-900">{classItem.class}</h4>

                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <Users className="w-3 h-3" />
                                                            <span>{classItem.students}/{classItem.capacity}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{classItem.location}</span>
                                                        </div>

                                                        <Badge className={getStatusColor(classItem.status)} variant="outline">
                                                            {classItem.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Weekly Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">12</p>
                                <p className="text-sm text-gray-600">Total Classes</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">68</p>
                                <p className="text-sm text-gray-600">Total Students</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-600">18</p>
                                <p className="text-sm text-gray-600">Teaching Hours</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-orange-600">85%</p>
                                <p className="text-sm text-gray-600">Avg Attendance</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default CoachSchedulePage