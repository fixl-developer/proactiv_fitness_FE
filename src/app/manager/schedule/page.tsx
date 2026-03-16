'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, Users, MapPin, Plus, Filter, Search, RefreshCw,
    ChevronLeft, ChevronRight, Eye, Edit, Trash2, CheckCircle, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const ManagerSchedulePage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>('week')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            const userRole = localStorage.getItem('userRole')
            if (!isAuthenticated || userRole !== 'MANAGER') {
                window.location.href = '/login'
                return
            }
        }
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    const scheduleData = [
        {
            id: 1,
            title: 'Beginner Gymnastics',
            coach: 'Sarah Johnson',
            time: '10:00 AM - 11:00 AM',
            date: '2024-01-25',
            students: 8,
            capacity: 12,
            status: 'confirmed',
            location: 'Main Gym'
        },
        {
            id: 2,
            title: 'Advanced Gymnastics',
            coach: 'Mike Chen',
            time: '2:00 PM - 3:30 PM',
            date: '2024-01-25',
            students: 6,
            capacity: 8,
            status: 'confirmed',
            location: 'Training Area'
        },
        {
            id: 3,
            title: 'Private Coaching',
            coach: 'Lisa Zhang',
            time: '4:00 PM - 5:00 PM',
            date: '2024-01-25',
            students: 1,
            capacity: 1,
            status: 'pending',
            location: 'Private Room'
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
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
                    <h1 className="text-3xl font-bold text-gray-900">Location Schedule</h1>
                    <p className="text-gray-600 mt-2">Manage classes and coaching sessions</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Class
                    </Button>
                </div>
            </div>

            {/* Calendar Navigation */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <h2 className="text-xl font-semibold">January 2024</h2>
                            <Button variant="outline" size="sm">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            {['day', 'week', 'month'].map((view) => (
                                <Button
                                    key={view}
                                    variant={selectedView === view ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedView(view as any)}
                                >
                                    {view.charAt(0).toUpperCase() + view.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Schedule List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Today's Classes</CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search classes..."
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {scheduleData.map((session, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{session.title}</h4>
                                            <Badge className={getStatusColor(session.status)}>
                                                {session.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">Coach: {session.coach} • {session.location}</p>
                                        <p className="text-xs text-gray-500">{session.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-purple-600">{session.students}/{session.capacity}</p>
                                    <p className="text-sm text-gray-600">Students</p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ManagerSchedulePage
