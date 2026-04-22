'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, Bell, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { scheduleService } from '@/services/modules/schedule.service'

interface ScheduleItem {
    _id: string
    name: string
    date: string
    time: string
    location: string
    instructor: string
    capacity: string
    type: 'class' | 'booking'
}

export default function SchedulePage() {
    const [upcomingClasses, setUpcomingClasses] = useState<ScheduleItem[]>([])
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reminders, setReminders] = useState<string[]>([])

    useEffect(() => {
        fetchScheduleData()
    }, [])

    const fetchScheduleData = async () => {
        try {
            setLoading(true)
            const res = await scheduleService.getSchedule()
            if (res.success) {
                setUpcomingClasses(res.data || [])
            } else {
                setError(res.error || 'Failed to fetch schedule')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch schedule')
        } finally {
            setLoading(false)
        }
    }

    const handleAddReminder = async (classId: string) => {
        try {
            const res = await scheduleService.addReminder(classId)
            if (res.success) {
                setReminders([...reminders, classId])
            } else {
                setError(res.error || 'Failed to add reminder')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to add reminder')
        }
    }

    const handleRemoveReminder = async (classId: string) => {
        try {
            const res = await scheduleService.removeReminder(classId)
            if (res.success) {
                setReminders(reminders.filter(id => id !== classId))
            } else {
                setError(res.error || 'Failed to remove reminder')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to remove reminder')
        }
    }

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading schedule...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
                <p className="text-gray-600 mt-2 text-sm font-medium">View your upcoming classes and bookings</p>
            </div>

            {/* Error Alert */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-semibold text-sm">Error</p>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* Upcoming Classes */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-6 border-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Classes</h2>

                    {upcomingClasses.length > 0 ? (
                        <div className="grid gap-4">
                            {upcomingClasses.map((cls, index) => (
                                <motion.div
                                    key={cls._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="border border-gray-200/50 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                                            <div className="space-y-2 mt-3 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                                    <span className="font-medium">{cls.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-blue-600" />
                                                    <span className="font-medium">{cls.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-red-600" />
                                                    <span className="font-medium">{cls.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-purple-600" />
                                                    <span className="font-medium">{cls.instructor}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => reminders.includes(cls._id) ? handleRemoveReminder(cls._id) : handleAddReminder(cls._id)}
                                            variant={reminders.includes(cls._id) ? 'default' : 'outline'}
                                            className={reminders.includes(cls._id) ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}
                                        >
                                            <Bell className="w-4 h-4 mr-2" />
                                            {reminders.includes(cls._id) ? 'Reminder Set' : 'Add Reminder'}
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No upcoming classes scheduled</p>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Calendar View */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card className="p-6 border-gray-200/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{monthName}</h2>
                        <div className="flex gap-2">
                            <Button
                                onClick={previousMonth}
                                variant="outline"
                                size="sm"
                                className="border-gray-200 hover:bg-gray-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={nextMonth}
                                variant="outline"
                                size="sm"
                                className="border-gray-200 hover:bg-gray-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square"></div>
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const hasClass = upcomingClasses.some(cls => {
                                const classDate = new Date(cls.date)
                                return classDate.getDate() === day && classDate.getMonth() === currentMonth.getMonth()
                            })

                            return (
                                <div
                                    key={day}
                                    className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm transition-colors ${hasClass
                                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                                        : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    {day}
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex gap-4 mt-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-300 rounded"></div>
                            <span className="text-gray-700 font-medium">Has Class</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-100 rounded"></div>
                            <span className="text-gray-700 font-medium">No Class</span>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
