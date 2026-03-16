'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, CheckCircle, X, Save, Edit
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const CoachAvailabilityPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedWeek, setSelectedWeek] = useState('current')
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 800)
    }, [])

    const timeSlots = [
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
        '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
    ]

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday', 'Sunday'
    ]

    // Define the type for availability data
    type DayAvailability = {
        available: string[]
        scheduled: string[]
        unavailable: string[]
    }

    type WeeklyAvailability = {
        [key: string]: DayAvailability
    }

    const [availability, setAvailability] = useState<WeeklyAvailability>({
        Monday: {
            available: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
            scheduled: ['10:00 AM', '2:00 PM', '4:00 PM'],
            unavailable: ['9:00 AM', '12:00 PM', '1:00 PM']
        },
        Tuesday: {
            available: ['11:00 AM', '12:00 PM', '4:00 PM', '5:00 PM'],
            scheduled: ['11:00 AM', '4:00 PM'],
            unavailable: ['9:00 AM', '10:00 AM', '1:00 PM', '2:00 PM', '3:00 PM']
        },
        Wednesday: {
            available: ['10:00 AM', '11:00 AM', '3:00 PM', '4:00 PM'],
            scheduled: ['10:00 AM', '3:00 PM'],
            unavailable: ['9:00 AM', '12:00 PM', '1:00 PM', '2:00 PM']
        },
        Thursday: {
            available: ['11:00 AM', '12:00 PM', '5:00 PM', '6:00 PM'],
            scheduled: ['11:00 AM', '5:00 PM'],
            unavailable: ['9:00 AM', '10:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']
        },
        Friday: {
            available: ['10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
            scheduled: ['10:00 AM', '2:00 PM'],
            unavailable: ['9:00 AM', '11:00 AM', '12:00 PM', '1:00 PM']
        },
        Saturday: {
            available: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'],
            scheduled: ['9:00 AM', '11:00 AM'],
            unavailable: ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
        },
        Sunday: {
            available: [],
            scheduled: [],
            unavailable: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM']
        }
    })

    const upcomingSchedule = [
        {
            date: '2024-01-22',
            day: 'Monday',
            time: '10:00 AM - 11:00 AM',
            class: 'GYMTOTS (3-4 years)',
            students: 6,
            location: 'Studio A'
        },
        {
            date: '2024-01-22',
            day: 'Monday',
            time: '2:00 PM - 3:30 PM',
            class: 'Intermediate (8-10 years)',
            students: 5,
            location: 'Studio B'
        },
        {
            date: '2024-01-23',
            day: 'Tuesday',
            time: '11:00 AM - 12:00 PM',
            class: 'Beginner 1 (5-7 years)',
            students: 8,
            location: 'Studio A'
        },
        {
            date: '2024-01-24',
            day: 'Wednesday',
            time: '10:00 AM - 11:00 AM',
            class: 'GYMTOTS (3-4 years)',
            students: 7,
            location: 'Studio A'
        }
    ]

    const getSlotStatus = (day: string, time: string): string => {
        const dayAvailability = availability[day]
        if (!dayAvailability) return 'unset'
        if (dayAvailability.scheduled.includes(time)) return 'scheduled'
        if (dayAvailability.available.includes(time)) return 'available'
        if (dayAvailability.unavailable.includes(time)) return 'unavailable'
        return 'unset'
    }

    const getSlotColor = (status: string) => {
        const colors = {
            scheduled: 'bg-blue-100 text-blue-700 border-blue-300',
            available: 'bg-green-100 text-green-700 border-green-300',
            unavailable: 'bg-red-100 text-red-700 border-red-300',
            unset: 'bg-gray-100 text-gray-500 border-gray-300'
        }
        return colors[status as keyof typeof colors] || colors.unset
    }

    const getSlotIcon = (status: string) => {
        switch (status) {
            case 'scheduled': return <Calendar className="w-3 h-3" />
            case 'available': return <CheckCircle className="w-3 h-3" />
            case 'unavailable': return <X className="w-3 h-3" />
            default: return <Clock className="w-3 h-3" />
        }
    }

    const toggleSlotAvailability = (day: string, time: string) => {
        if (!editMode) return

        setAvailability(prev => {
            const dayAvailability = prev[day]
            if (!dayAvailability) return prev

            const newAvailability = { ...prev }

            // Remove from all arrays first
            newAvailability[day] = {
                available: dayAvailability.available.filter(t => t !== time),
                scheduled: dayAvailability.scheduled.filter(t => t !== time),
                unavailable: dayAvailability.unavailable.filter(t => t !== time)
            }

            // Add to appropriate array based on current status
            const currentStatus = getSlotStatus(day, time)
            if (currentStatus === 'unset' || currentStatus === 'unavailable') {
                newAvailability[day].available.push(time)
            } else if (currentStatus === 'available') {
                newAvailability[day].unavailable.push(time)
            }

            return newAvailability
        })
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="coach" userName="Sarah Chen">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
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
                        <h1 className="text-2xl font-bold text-gray-900">My Availability</h1>
                        <p className="text-gray-600">Manage your weekly schedule and availability</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                            {['current', 'next'].map((week) => (
                                <button
                                    key={week}
                                    onClick={() => setSelectedWeek(week)}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedWeek === week
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {week === 'current' ? 'This Week' : 'Next Week'}
                                </button>
                            ))}
                        </div>
                        <Button
                            variant={editMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setEditMode(!editMode)}
                        >
                            {editMode ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                            {editMode ? 'Save Changes' : 'Edit Schedule'}
                        </Button>
                    </div>
                </div>

                {/* Legend */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                                <span className="text-sm text-gray-600">Scheduled Classes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                                <span className="text-sm text-gray-600">Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                                <span className="text-sm text-gray-600">Unavailable</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                                <span className="text-sm text-gray-600">Not Set</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Availability Grid */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Weekly Availability Grid</CardTitle>
                            {editMode && (
                                <Badge className="bg-orange-100 text-orange-700">
                                    Edit Mode - Click slots to toggle
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <div className="grid grid-cols-8 gap-2 min-w-[800px]">
                                {/* Header Row */}
                                <div className="font-medium text-gray-900 p-2">Time</div>
                                {daysOfWeek.map(day => (
                                    <div key={day} className="font-medium text-gray-900 p-2 text-center">
                                        {day.slice(0, 3)}
                                    </div>
                                ))}

                                {/* Time Slots */}
                                {timeSlots.map(time => (
                                    <React.Fragment key={time}>
                                        <div className="text-sm text-gray-600 p-2 font-medium">
                                            {time}
                                        </div>
                                        {daysOfWeek.map(day => {
                                            const status = getSlotStatus(day, time)
                                            return (
                                                <motion.button
                                                    key={`${day}-${time}`}
                                                    whileHover={{ scale: editMode ? 1.05 : 1 }}
                                                    whileTap={{ scale: editMode ? 0.95 : 1 }}
                                                    onClick={() => toggleSlotAvailability(day, time)}
                                                    className={`p-2 rounded-lg border-2 transition-all duration-200 ${getSlotColor(status)} ${editMode ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                                                        }`}
                                                    disabled={!editMode && status === 'scheduled'}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        {getSlotIcon(status)}
                                                    </div>
                                                </motion.button>
                                            )
                                        })}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Schedule & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Scheduled Classes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingSchedule.map((schedule, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{schedule.class}</h4>
                                                <p className="text-sm text-gray-600">{schedule.day}, {schedule.date}</p>
                                                <p className="text-sm text-gray-600">{schedule.time} • {schedule.location}</p>
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-700">
                                                {schedule.students} students
                                            </Badge>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Availability Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Availability Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">
                                            {Object.values(availability).reduce((sum, day) => sum + day.available.length, 0)}
                                        </p>
                                        <p className="text-sm text-gray-600">Available Slots</p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {Object.values(availability).reduce((sum, day) => sum + day.scheduled.length, 0)}
                                        </p>
                                        <p className="text-sm text-gray-600">Scheduled Classes</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {daysOfWeek.map(day => {
                                        const dayData = availability[day as keyof typeof availability]
                                        const utilization = dayData.available.length > 0
                                            ? (dayData.scheduled.length / dayData.available.length) * 100
                                            : 0

                                        return (
                                            <div key={day} className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">{day}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-600">
                                                        {dayData.scheduled.length}/{dayData.available.length}
                                                    </span>
                                                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                                                        <div
                                                            className="h-2 bg-blue-500 rounded-full transition-all"
                                                            style={{ width: `${utilization}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default CoachAvailabilityPage