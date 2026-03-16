'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Calendar, Clock, MapPin, Users, Plus, Edit2, Trash2,
    ChevronLeft, ChevronRight, AlertCircle, CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { rbacManager } from '@/services/auth/rbac'
import { schedulingService } from '@/services/modules/scheduling.service'

const CoachSchedulePage = () => {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [schedules, setSchedules] = useState<any[]>([])
    const [selectedDay, setSelectedDay] = useState<string | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        if (!rbacManager.hasPermission('coach_schedule')) {
            router.push('/parent/dashboard')
            return
        }

        loadSchedules()
    }, [isAuthenticated, router, currentDate])

    const loadSchedules = async () => {
        try {
            setIsLoading(true)
            const response = await schedulingService.getSchedulesByCoach(user?.id || '', {
                dateFrom: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0],
                dateTo: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0]
            })
            setSchedules(response.data.schedules)
            setIsLoading(false)
        } catch (error) {
            console.error('Error loading schedules:', error)
            setIsLoading(false)
        }
    }

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const getSchedulesForDate = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            .toISOString().split('T')[0]
        return schedules.filter(s => s.date === dateStr)
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Class Schedule</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Manage your coaching schedule and classes
                    </p>
                </div>
                <Button onClick={() => router.push('/coach/schedule/new')} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Class
                </Button>
            </div>

            {/* Calendar View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{monthName}</CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrevMonth}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextMonth}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-2">
                                {/* Empty cells for days before month starts */}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square"></div>
                                ))}

                                {/* Days of month */}
                                {days.map(day => {
                                    const daySchedules = getSchedulesForDate(day)
                                    const isSelected = selectedDay === day.toString()

                                    return (
                                        <motion.button
                                            key={day}
                                            onClick={() => setSelectedDay(isSelected ? null : day.toString())}
                                            whileHover={{ scale: 1.05 }}
                                            className={`aspect-square rounded-lg border-2 transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : daySchedules.length > 0
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className="font-semibold text-gray-900">{day}</span>
                                                {daySchedules.length > 0 && (
                                                    <span className="text-xs text-green-600 font-medium">
                                                        {daySchedules.length} class
                                                    </span>
                                                )}
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Classes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {schedules.slice(0, 5).map((schedule, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900 text-sm">{schedule.className}</h4>
                                        <Badge variant="outline" className="text-xs">
                                            {schedule.level}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {schedule.time}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            {schedule.location}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3 h-3" />
                                            {schedule.enrolledStudents}/{schedule.capacity} Students
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-7 text-xs"
                                            onClick={() => router.push(`/coach/schedule/${schedule.id}/edit`)}
                                        >
                                            <Edit2 className="w-3 h-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-7 text-xs text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3 h-3 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Selected Day Details */}
            {selectedDay && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Classes on {new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(selectedDay)).toLocaleDateString()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {getSchedulesForDate(parseInt(selectedDay)).length > 0 ? (
                                <div className="space-y-4">
                                    {getSchedulesForDate(parseInt(selectedDay)).map((schedule, index) => (
                                        <div
                                            key={index}
                                            className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900">{schedule.className}</h4>
                                                <Badge>{schedule.level}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-600">Time</p>
                                                    <p className="font-medium text-gray-900">{schedule.time}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Location</p>
                                                    <p className="font-medium text-gray-900">{schedule.location}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Duration</p>
                                                    <p className="font-medium text-gray-900">{schedule.duration} min</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Students</p>
                                                    <p className="font-medium text-gray-900">{schedule.enrolledStudents}/{schedule.capacity}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => router.push(`/coach/schedule/${schedule.id}/edit`)}
                                                >
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-600">No classes scheduled for this day</p>
                                    <Button
                                        className="mt-4"
                                        onClick={() => router.push('/coach/schedule/new')}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Class
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}

export default CoachSchedulePage
