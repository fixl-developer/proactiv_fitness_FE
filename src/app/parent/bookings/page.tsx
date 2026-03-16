'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Calendar,
    Filter,
    Search,
    Loader,
    AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import BookingCard from '@/components/booking/BookingCard'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { EnhancedBookingService, Booking, BookingStatus } from '@/services/enhancedBookingService'

const MyBookingsPage = () => {
    const router = useRouter()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Use safe localStorage hooks
    const userName = useLocalStorage('userName', 'Parent User')
    const userEmail = useLocalStorage('userEmail', 'parent@proactivsports.com')

    // Check authentication
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            if (!isAuthenticated) {
                router.push('/login')
                return
            }
        }
    }, [router])

    // Load bookings from API
    useEffect(() => {
        const loadBookings = async () => {
            try {
                setIsLoading(true)
                setError('')
                const bookingService = new EnhancedBookingService()
                const bookingsData = await bookingService.getMyBookings()
                setBookings(bookingsData)
            } catch (err: any) {
                setError(err.message || 'Failed to load bookings')
                setBookings([])
            } finally {
                setIsLoading(false)
            }
        }

        loadBookings()
    }, [])

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.CONFIRMED:
                return 'text-green-600 bg-green-50 border-green-200'
            case BookingStatus.PENDING:
                return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case BookingStatus.CANCELLED:
                return 'text-red-600 bg-red-50 border-red-200'
            case BookingStatus.COMPLETED:
                return 'text-blue-600 bg-blue-50 border-blue-200'
            case BookingStatus.WAITLISTED:
                return 'text-purple-600 bg-purple-50 border-purple-200'
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const filteredBookings = bookings.filter(booking => {
        const matchesFilter = filter === 'all' || booking.status === filter
        const matchesSearch = booking.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.participants.some(p => p.childName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            booking.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const handleCancel = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return
        }

        try {
            const bookingService = new EnhancedBookingService()
            const updatedBooking = await bookingService.cancelBooking(bookingId, {
                reason: 'Cancelled by parent',
                requestedAt: new Date().toISOString()
            })
            setBookings(prev => prev.map(b => b._id === bookingId ? updatedBooking : b))
        } catch (err: any) {
            alert(err.message || 'Failed to cancel booking')
        }
    }

    const handleReschedule = (bookingId: string) => {
        router.push(`/parent/browse-classes?reschedule=${bookingId}`)
    }

    return (
        <DashboardLayout
            userRole="parent"
            userName={userName}
            userEmail={userEmail}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-gray-600 mt-2">Manage your children's class bookings</p>
                    </div>
                    <Button onClick={() => router.push('/parent/browse-classes')} className="bg-gradient-to-r from-blue-600 to-purple-600">
                        Book New Class
                    </Button>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                )}

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search bookings..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {['all', 'upcoming', 'completed', 'cancelled'].map((filterOption) => (
                                    <button
                                        key={filterOption}
                                        onClick={() => setFilter(filterOption as any)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === filterOption
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings List */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking, index) => (
                            <motion.div
                                key={booking._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <BookingCard
                                    booking={booking}
                                    onCancel={handleCancel}
                                    onReschedule={handleReschedule}
                                />
                            </motion.div>
                        ))}

                        {filteredBookings.length === 0 && (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                                    <p className="text-gray-600 mb-4">
                                        {filter === 'all'
                                            ? "You haven't made any bookings yet."
                                            : `No ${filter} bookings found.`}
                                    </p>
                                    <Button onClick={() => router.push('/parent/browse-classes')}>
                                        Book Your First Class
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default MyBookingsPage
