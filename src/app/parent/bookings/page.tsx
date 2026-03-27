'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, MapPin, User, Search, Filter, Plus, RefreshCw,
    Eye, Edit, Trash2, CheckCircle, AlertTriangle, XCircle, Loader,
    BookOpen, TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import apiClient from '@/services/api/client'

interface BookingStats {
    total: number
    upcoming: number
    completed: number
    cancelled: number
}

interface Booking {
    id: string
    child: string
    program: string
    coach: string
    date: string
    time: string
    duration: string
    location: string
    status: string
    price: string
    type: string
}

const ParentBookingsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [stats, setStats] = useState<BookingStats>({ total: 0, upcoming: 0, completed: 0, cancelled: 0 })
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [error, setError] = useState<string | null>(null)
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    const loadBookings = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await apiClient.get(`/parent/bookings?status=${selectedFilter}`)
            if (response.success) {
                setBookings(response.data.bookings || [])
                setStats(response.data.stats || { total: 0, upcoming: 0, completed: 0, cancelled: 0 })
            }
        } catch (err) {
            console.error('Error loading bookings:', err)
            setError('Failed to load bookings')
        } finally {
            setIsLoading(false)
        }
    }, [selectedFilter])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadBookings()
    }, [isAuthenticated, router, loadBookings])

    const handleCancelBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return

        try {
            await apiClient.put(`/parent/bookings/${bookingId}/cancel`, {})
            await loadBookings()
        } catch (err) {
            console.error('Error cancelling booking:', err)
            alert('Failed to cancel booking. Please try again.')
        }
    }

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

    const filteredBookings = bookings.filter(booking => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const matchesSearch =
                booking.program.toLowerCase().includes(query) ||
                booking.child.toLowerCase().includes(query) ||
                booking.coach.toLowerCase().includes(query) ||
                booking.location.toLowerCase().includes(query)
            if (!matchesSearch) return false
        }
        return true
    })

    const metricCards = [
        {
            title: 'Total Bookings',
            value: stats.total,
            icon: BookOpen,
            bgGradient: 'from-blue-50 to-blue-100',
            gradient: 'from-blue-500 to-blue-600',
            badge: 'All Time',
            badgeColor: 'text-blue-600 bg-blue-100'
        },
        {
            title: 'Upcoming',
            value: stats.upcoming,
            icon: TrendingUp,
            bgGradient: 'from-green-50 to-emerald-100',
            gradient: 'from-green-500 to-emerald-600',
            badge: 'Scheduled',
            badgeColor: 'text-green-600 bg-green-100'
        },
        {
            title: 'Completed',
            value: stats.completed,
            icon: CheckCircle,
            bgGradient: 'from-purple-50 to-purple-100',
            gradient: 'from-purple-500 to-purple-600',
            badge: 'Done',
            badgeColor: 'text-purple-600 bg-purple-100'
        },
        {
            title: 'Cancelled',
            value: stats.cancelled,
            icon: XCircle,
            bgGradient: 'from-orange-50 to-orange-100',
            gradient: 'from-orange-500 to-orange-600',
            badge: 'Dropped',
            badgeColor: 'text-orange-600 bg-orange-100'
        }
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
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
                    <Button
                        id="parent-bookings-refresh-btn"
                        variant="outline"
                        size="sm"
                        onClick={() => loadBookings()}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        id="parent-bookings-book-new-btn"
                        size="sm"
                        onClick={() => router.push('/parent/browse-classes')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Book New Class
                    </Button>
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metricCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${card.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${card.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <card.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className={`text-xs font-medium ${card.badgeColor} px-2 py-1 rounded-full`}>{card.badge}</span>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                                    <button id={`parent-bookings-filter-${filter.key}-btn`}
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

            {/* Error State */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => loadBookings()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Bookings List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Bookings ({filteredBookings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-lg font-medium">No bookings found</p>
                            <p className="text-sm mt-1">Try adjusting your filters or book a new class.</p>
                            <Button
                                className="mt-4"
                                size="sm"
                                onClick={() => router.push('/parent/browse-classes')}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Book a Class
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBookings.map((booking, index) => (
                                <motion.div
                                    key={booking.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all border border-gray-200"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                            {booking.child.split(' ').map((n: string) => n[0]).join('')}
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
                                        <Button
                                            id={`parent-bookings-view-${booking.id}-btn`}
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/parent/bookings/${booking.id}`)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        {booking.status === 'confirmed' && (
                                            <Button
                                                id={`parent-bookings-edit-${booking.id}-btn`}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => alert('Feature coming soon')}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {(booking.status === 'confirmed' || booking.status === 'pending') && (
                                            <Button
                                                id={`parent-bookings-cancel-${booking.id}-btn`}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCancelBooking(booking.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                            id="parent-bookings-quick-book-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => router.push('/parent/browse-classes')}
                        >
                            <Plus className="w-6 h-6" />
                            <span>Book Class</span>
                        </Button>
                        <Button
                            id="parent-bookings-quick-schedule-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => router.push('/parent/bookings')}
                        >
                            <Calendar className="w-6 h-6" />
                            <span>View Schedule</span>
                        </Button>
                        <Button
                            id="parent-bookings-quick-assessment-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => alert('Assessment booking coming soon')}
                        >
                            <User className="w-6 h-6" />
                            <span>Assessment</span>
                        </Button>
                        <Button
                            id="parent-bookings-quick-reschedule-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => alert('Reschedule feature coming soon')}
                        >
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
