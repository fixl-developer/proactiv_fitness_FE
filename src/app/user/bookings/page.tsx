'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Users, Trash2, AlertCircle, Loader, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface Booking {
    id: string
    classId: string
    className: string
    location: {
        name: string
        city: string
    }
    room: {
        name: string
    }
    date: string
    startTime: string
    endTime: string
    price: number
    currency: string
    status: 'confirmed' | 'cancelled' | 'completed'
    bookedAt: string
    instructor?: string
}

type FilterStatus = 'all' | 'confirmed' | 'cancelled' | 'completed'

export default function BookingsPage() {
    const { user, isAuthenticated } = useAuth()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
    const [cancellingId, setCancellingId] = useState<string | null>(null)

    useEffect(() => {
        if (!isAuthenticated) return
        loadBookings()
    }, [isAuthenticated])

    useEffect(() => {
        applyFilters()
    }, [bookings, filterStatus])

    const loadBookings = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/v1/bookings/my-bookings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) throw new Error('Failed to load bookings')

            const data = await response.json()
            setBookings(data.data || [])
        } catch (error) {
            console.error('Error loading bookings:', error)
            setBookings(getMockBookings())
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let filtered = bookings

        if (filterStatus !== 'all') {
            filtered = filtered.filter(b => b.status === filterStatus)
        }

        setFilteredBookings(filtered)
    }

    const handleCancelBooking = async (bookingId: string) => {
        try {
            setCancellingId(bookingId)

            const response = await fetch(`/api/v1/bookings/${bookingId}/cancel`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reason: 'user_request' })
            })

            if (!response.ok) throw new Error('Failed to cancel booking')

            toast.success('Booking cancelled successfully')
            await loadBookings()
        } catch (error) {
            console.error('Error cancelling booking:', error)
            toast.error('Failed to cancel booking')
        } finally {
            setCancellingId(null)
        }
    }

    const getMockBookings = (): Booking[] => {
        return [
            {
                id: 'book1',
                classId: '1',
                className: 'Zumba Class',
                location: { name: 'Dubai Marina Center', city: 'Dubai' },
                room: { name: 'Room B' },
                date: '2025-02-15',
                startTime: '18:00',
                endTime: '19:00',
                price: 100,
                currency: 'AED',
                status: 'confirmed',
                bookedAt: '2025-02-01',
                instructor: 'Sarah'
            },
            {
                id: 'book2',
                classId: '2',
                className: 'Yoga Class',
                location: { name: 'Dubai Marina Center', city: 'Dubai' },
                room: { name: 'Room A' },
                date: '2025-02-10',
                startTime: '16:00',
                endTime: '17:00',
                price: 80,
                currency: 'AED',
                status: 'completed',
                bookedAt: '2025-02-01',
                instructor: 'John'
            }
        ]
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-blue-100 text-blue-800'
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-slate-100 text-slate-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-4 h-4" />
            case 'completed':
                return <CheckCircle className="w-4 h-4" />
            case 'cancelled':
                return <XCircle className="w-4 h-4" />
            default:
                return null
        }
    }

    const isUpcoming = (date: string) => {
        return new Date(date) > new Date()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-slate-900 mb-2">My Bookings</h1>
                <p className="text-slate-600">View and manage your class bookings</p>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-4 flex gap-2 flex-wrap"
            >
                {(['all', 'confirmed', 'completed', 'cancelled'] as FilterStatus[]).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${filterStatus === status
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        {status === 'all' ? 'All Bookings' : status}
                    </button>
                ))}
            </motion.div>

            {/* Bookings List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
            ) : filteredBookings.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-lg shadow-md p-12 text-center"
                >
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">No bookings found</p>
                    <Link
                        href="/user/browse-classes"
                        className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                        Browse Classes
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    {filteredBookings.map((booking, index) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 gap-4">
                                {/* Left Side - Class Info */}
                                <div className="flex-1 space-y-3">
                                    {/* Class Name */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {booking.className.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{booking.className}</h3>
                                            {booking.instructor && (
                                                <p className="text-sm text-slate-500">Instructor: {booking.instructor}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-15">
                                        {/* Location */}
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-slate-500">Location</p>
                                                <p className="text-sm font-medium text-slate-900">{booking.location.name}</p>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-slate-500">Date</p>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {new Date(booking.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Time */}
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-slate-500">Time</p>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {booking.startTime} - {booking.endTime}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <p className="text-xs text-slate-500">Price</p>
                                            <p className="text-sm font-bold text-emerald-600">
                                                {booking.price} {booking.currency}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Status & Actions */}
                                <div className="flex flex-col items-end gap-3">
                                    {/* Status Badge */}
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                        {getStatusIcon(booking.status)}
                                        <span className="capitalize">{booking.status}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {booking.status === 'confirmed' && isUpcoming(booking.date) && (
                                            <button
                                                onClick={() => handleCancelBooking(booking.id)}
                                                disabled={cancellingId === booking.id}
                                                className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="text-sm font-medium">Cancel</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Browse More Classes */}
            {!loading && filteredBookings.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center pt-4"
                >
                    <Link
                        href="/user/browse-classes"
                        className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 font-medium transition-all"
                    >
                        Browse More Classes
                    </Link>
                </motion.div>
            )}
        </div>
    )
}
