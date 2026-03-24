'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, DollarSign, RefreshCw, Plus, Eye, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import BookingService from '@/services/modules/booking.service'

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([])
    const [filteredBookings, setFilteredBookings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [activeFilter, setActiveFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed'>('all')
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadBookings()
    }, [isAuthenticated, router])

    useEffect(() => {
        filterBookings()
    }, [bookings, activeFilter])

    const loadBookings = async () => {
        try {
            const service = new BookingService()
            const response = await service.getBookings({})
            setBookings(response?.data?.bookings || [])
        } catch (err) {
            console.error('Error loading bookings:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadBookings()
        setRefreshing(false)
    }

    const filterBookings = () => {
        if (activeFilter === 'all') {
            setFilteredBookings(bookings)
        } else {
            setFilteredBookings(bookings.filter(b => b.status === activeFilter))
        }
    }

    const getStatusColor = (status: string) => {
        const colors = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-4 h-4" />
            case 'pending':
                return <Clock className="w-4 h-4" />
            case 'cancelled':
                return <X className="w-4 h-4" />
            case 'completed':
                return <CheckCircle className="w-4 h-4" />
            default:
                return <AlertCircle className="w-4 h-4" />
        }
    }

    const filters = [
        { key: 'all', label: 'All', count: bookings.length },
        { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
        { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
        { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
        { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
    ]

    const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        totalAmount: bookings.reduce((sum, b) => sum + (b.amount || 0), 0)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
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
                    <p className="text-gray-600 mt-2">Manage your class bookings</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button id="user-bookings-refresh-btn" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button id="user-bookings-new-btn" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Bookings</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Confirmed</p>
                                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-2xl font-bold text-purple-600">HK${stats.totalAmount}</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        {filters.map((filter) => (
                            <button id={`user-bookings-filter-${filter.key}-btn`}
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key as any)}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeFilter === filter.key
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {filter.label}
                                <Badge className="ml-2" variant="outline">{filter.count}</Badge>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Bookings List */}
            <div className="grid gap-4">
                {filteredBookings.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                            <p className="text-gray-500 mb-4">
                                {activeFilter === 'all'
                                    ? 'Book your first class to get started!'
                                    : `No ${activeFilter} bookings`}
                            </p>
                            <Button id="user-bookings-book-class-btn">
                                <Plus className="w-4 h-4 mr-2" />
                                Book a Class
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    filteredBookings.map((booking, index) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-all">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                {booking.date?.split('-')[2] || '?'}
                                            </div>
                                            <div>
                                                <CardTitle>{booking.className || 'Class Booking'}</CardTitle>
                                                <p className="text-sm text-gray-500 mt-1">Booking ID: #{booking.id?.slice(-8)}</p>
                                            </div>
                                        </div>
                                        <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Date</p>
                                                <p className="text-sm font-medium text-gray-900">{booking.date || 'TBD'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Time</p>
                                                <p className="text-sm font-medium text-gray-900">{booking.time || 'TBD'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Location</p>
                                                <p className="text-sm font-medium text-gray-900">{booking.location || 'TBD'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Amount</p>
                                                <p className="text-sm font-medium text-green-600">HK${booking.amount || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button id={`user-bookings-view-${booking.id}-btn`} size="sm" variant="outline" className="flex-1">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                        {booking.status === 'confirmed' && (
                                            <>
                                                <Button id={`user-bookings-modify-${booking.id}-btn`} size="sm" variant="outline">
                                                    Modify
                                                </Button>
                                                <Button id={`user-bookings-cancel-confirmed-${booking.id}-btn`} size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                                    <X className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {booking.status === 'pending' && (
                                            <Button id={`user-bookings-cancel-pending-${booking.id}-btn`} size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
