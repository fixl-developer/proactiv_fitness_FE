'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, MapPin, User, Search, Filter, Plus, RefreshCw,
    Eye, Edit, Trash2, CheckCircle, AlertTriangle, XCircle, Loader
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import BookingService from '@/services/modules/booking.service'

const ParentBookingsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [bookings, setBookings] = useState<any[]>([])
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
    const [error, setError] = useState<string | null>(null)
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    const parentId = user?.id || 'parent-1'

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadBookings()
    }, [isAuthenticated, router, parentId])

    const loadBookings = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const bookingService = new BookingService()
            const data = await bookingService.getBookings(parentId)
            setBookings(data || [])
        } catch (err) {
            console.error('Error loading bookings:', err)
            setError('Failed to load bookings')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return

        try {
            const bookingService = new BookingService()
            await bookingService.cancelBooking(bookingId)
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
        } catch (err) {
            console.error('Error cancelling booking:', err)
            alert('Failed to cancel booking')
        }
    }

    const bookingsData = [
        {
            id: 'BK001',
            child: 'Emma Chen',
            program: 'Beginner Gymnastics',
            coach: 'Sarah Johnson',
            date: '2024-01-25',
            time: '10:00 AM',
            duration: '1 hour',
            location: 'Cyberport Center',
            status: 'confirmed',
            price: 'HK$350',
            type: 'regular'
        },
        {
            id: 'BK002',
            child: 'Lucas Chen',
            program: 'Skills Assessment',
            coach: 'Mike Wong',
            date: '2024-01-22',
            time: '2:00 PM',
            duration: '30 mins',
            location: 'Wan Chai Center',
            status: 'completed',
            price: 'FREE',
            type: 'assessment'
        },
        {
            id: 'BK003',
            child: 'Emma Chen',
            program: 'Holiday Camp',
            coach: 'Lisa Zhang',
            date: '2024-02-01',
            time: '9:00 AM',
            duration: '3 hours',
            location: 'Cyberport Center',
            status: 'pending',
            price: 'HK$1200',
            type: 'camp'
        },
        {
            id: 'BK004',
            child: 'Lucas Chen',
            program: 'Private Coaching',
            coach: 'Tom Wilson',
            date: '2024-01-20',
            time: '4:00 PM',
            duration: '1 hour',
            location: 'Cyberport Center',
            status: 'cancelled',
            price: 'HK$800',
            type: 'private'
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            confirmed: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-4 h-4 text-green-600" />
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-blue-600" />
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-red-600" />
            default:
                return <Clock className="w-4 h-4 text-gray-600" />
        }
    }

    const filteredBookings = bookingsData.filter(booking => {
        if (selectedFilter === 'all') return true
        if (selectedFilter === 'upcoming') return booking.status === 'confirmed' || booking.status === 'pending'
        return booking.status === selectedFilter
    })

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
                    <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                    <p className="text-gray-600 mt-2">Manage your children's class bookings</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Book New Class
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Filter Bookings</CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search bookings..."
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'upcoming', label: 'Upcoming' },
                                    { key: 'completed', label: 'Completed' },
                                    { key: 'cancelled', label: 'Cancelled' }
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setSelectedFilter(filter.key as any)}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedFilter === filter.key
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Bookings List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Bookings ({filteredBookings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredBookings.map((booking, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all border border-gray-200"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        {booking.child.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{booking.program}</h4>
                                            <Badge className={getStatusColor(booking.status)}>
                                                {booking.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{booking.child} • Coach: {booking.coach}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {booking.date}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {booking.time} ({booking.duration})
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {booking.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-blue-600">{booking.price}</p>
                                    <p className="text-sm text-gray-600">{booking.type}</p>
                                    <p className="text-xs text-gray-500">ID: {booking.id}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    {getStatusIcon(booking.status)}
                                    <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    {booking.status === 'confirmed' && (
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    )}
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
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Plus className="w-6 h-6" />
                            <span>Book Class</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Calendar className="w-6 h-6" />
                            <span>View Schedule</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <User className="w-6 h-6" />
                            <span>Assessment</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <RefreshCw className="w-6 h-6" />
                            <span>Reschedule</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ParentBookingsPage
