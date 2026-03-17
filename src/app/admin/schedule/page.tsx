'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Plus,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ScheduleEvent {
    id: string
    title: string
    time: string
    duration: number
    location: string
    coach: string
    students: number
    maxStudents: number
    type: 'class' | 'trial' | 'assessment' | 'private'
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
}

const SchedulePage = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [events, setEvents] = useState<ScheduleEvent[]>([])
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setEvents([
                {
                    id: '1',
                    title: 'Beginner Gymnastics',
                    time: '09:00',
                    duration: 60,
                    location: 'Cyberport',
                    coach: 'Sarah Johnson',
                    students: 8,
                    maxStudents: 10,
                    type: 'class',
                    status: 'scheduled'
                },
                {
                    id: '2',
                    title: 'Skills Assessment',
                    time: '10:30',
                    duration: 30,
                    location: 'Cyberport',
                    coach: 'Mike Chen',
                    students: 1,
                    maxStudents: 1,
                    type: 'assessment',
                    status: 'scheduled'
                },
                {
                    id: '3',
                    title: 'Intermediate Gymnastics',
                    time: '14:00',
                    duration: 90,
                    location: 'Wan Chai',
                    coach: 'Emma Wilson',
                    students: 12,
                    maxStudents: 15,
                    type: 'class',
                    status: 'scheduled'
                },
                {
                    id: '4',
                    title: 'Private Coaching',
                    time: '16:00',
                    duration: 60,
                    location: 'Cyberport',
                    coach: 'David Lee',
                    students: 1,
                    maxStudents: 1,
                    type: 'private',
                    status: 'scheduled'
                }
            ])
            setIsLoading(false)
        }, 1000)
    }, [selectedDate])

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'class':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'trial':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'assessment':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'private':
                return 'bg-purple-100 text-purple-800 border-purple-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'text-blue-600'
            case 'ongoing':
                return 'text-green-600'
            case 'completed':
                return 'text-gray-600'
            case 'cancelled':
                return 'text-red-600'
            default:
                return 'text-gray-600'
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate)
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        }
        setSelectedDate(newDate)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-24 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                        <div className="h-96 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Schedule Manager</h2>
                    <p className="text-gray-600">Manage classes, trials, and assessments</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                </Button>
            </div>

            {/* Date Navigation */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button variant="outline" onClick={() => navigateDate('prev')}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold">{formatDate(selectedDate)}</h3>
                                <p className="text-sm text-gray-600">
                                    {events.length} events scheduled
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => navigateDate('next')}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            {['day', 'week', 'month'].map((mode) => (
                                <Button
                                    key={mode}
                                    variant={viewMode === mode ? 'default' : 'outline'}
                                    onClick={() => setViewMode(mode as any)}
                                    className="capitalize"
                                >
                                    {mode}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Schedule Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Events List */}
                <div className="lg:col-span-3 space-y-4">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {event.time}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {event.duration}min
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="font-semibold text-lg">{event.title}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(event.type)}`}>
                                                        {event.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{event.location}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Users className="w-4 h-4" />
                                                        <span>{event.students}/{event.maxStudents} students</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span className={getStatusColor(event.status)}>
                                                            {event.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Coach: <span className="font-medium">{event.coach}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Today's Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Events</span>
                                <span className="font-semibold">{events.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Students</span>
                                <span className="font-semibold">
                                    {events.reduce((sum, event) => sum + event.students, 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Locations</span>
                                <span className="font-semibold">
                                    {new Set(events.map(e => e.location)).size}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Event Types</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {['class', 'trial', 'assessment', 'private'].map((type) => {
                                const count = events.filter(e => e.type === type).length
                                return (
                                    <div key={type} className="flex justify-between items-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(type)}`}>
                                            {type}
                                        </span>
                                        <span className="font-semibold">{count}</span>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default SchedulePage
