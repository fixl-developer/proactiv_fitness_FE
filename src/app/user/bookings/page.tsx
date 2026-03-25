'use client'

import { useState, useEffect, useCallback } from 'react'
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
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const [cancelModal, setCancelModal] = useState<{ id: string; name: string } | null>(null)
    const [cancelReason, setCancelReason] = useState('')
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [bookingSubmitting, setBookingSubmitting] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)
    const [bookingForm, setBookingForm] = useState({
        program: '',
        classType: '',
        childName: '',
        childAge: '',
        date: '',
        timeSlot: '',
        location: '',
        notes: '',
    })
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    const bookingService = new BookingService()

    const loadBookings = useCallback(async () => {
        try {
            const response = await bookingService.getBookings({})
            const bookingsList = response?.data?.bookings || []
            setBookings(Array.isArray(bookingsList) ? bookingsList : [])
        } catch (err) {
            console.error('Error loading bookings:', err)
            setBookings([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadBookings()
    }, [isAuthenticated, router, loadBookings])

    useEffect(() => {
        filterBookings()
    }, [bookings, activeFilter])

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

    const handleCancelBooking = async () => {
        if (!cancelModal) return
        try {
            setCancellingId(cancelModal.id)
            await bookingService.cancelBooking(cancelModal.id, cancelReason)
            // Update local state
            setBookings(prev => prev.map(b =>
                b.id === cancelModal.id ? { ...b, status: 'cancelled' } : b
            ))
            setCancelModal(null)
            setCancelReason('')
        } catch (err) {
            console.error('Error cancelling booking:', err)
            alert('Failed to cancel booking. Please try again.')
        } finally {
            setCancellingId(null)
        }
    }

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bookingForm.program || !bookingForm.date || !bookingForm.timeSlot || !bookingForm.location) return

        setBookingSubmitting(true)
        try {
            await bookingService.createBooking({
                program: bookingForm.program,
                classType: bookingForm.classType,
                childName: bookingForm.childName,
                childAge: bookingForm.childAge,
                date: bookingForm.date,
                timeSlot: bookingForm.timeSlot,
                location: bookingForm.location,
                notes: bookingForm.notes,
            })
            setBookingSuccess(true)
            await loadBookings()
            setTimeout(() => {
                setShowBookingModal(false)
                setBookingSuccess(false)
                setBookingForm({ program: '', classType: '', childName: '', childAge: '', date: '', timeSlot: '', location: '', notes: '' })
            }, 2000)
        } catch (err) {
            console.error('Error creating booking:', err)
            // Still add locally as pending
            const newBooking = {
                id: `local-${Date.now()}`,
                className: `${bookingForm.program} - ${bookingForm.classType || 'Class'}`,
                classDate: bookingForm.date,
                classTime: bookingForm.timeSlot,
                locationName: bookingForm.location,
                status: 'pending',
                paymentStatus: 'pending',
                amount: 0,
                notes: bookingForm.notes,
            }
            setBookings(prev => [newBooking, ...prev])
            setBookingSuccess(true)
            setTimeout(() => {
                setShowBookingModal(false)
                setBookingSuccess(false)
                setBookingForm({ program: '', classType: '', childName: '', childAge: '', date: '', timeSlot: '', location: '', notes: '' })
            }, 2000)
        } finally {
            setBookingSubmitting(false)
        }
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="w-4 h-4" />
            case 'pending': return <Clock className="w-4 h-4" />
            case 'cancelled': return <X className="w-4 h-4" />
            case 'completed': return <CheckCircle className="w-4 h-4" />
            default: return <AlertCircle className="w-4 h-4" />
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
                </div>
            </div>
        )
    }

    const statCards = [
        { title: 'Total Bookings', value: stats.total, icon: Calendar, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: 'all time' },
        { title: 'Confirmed', value: stats.confirmed, icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100', change: 'active' },
        { title: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-yellow-600', bgGradient: 'from-amber-50 to-yellow-100', change: 'awaiting' },
        { title: 'Total Amount', value: `HK$${stats.totalAmount.toLocaleString()}`, icon: DollarSign, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', change: 'spent' }
    ]

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
                    <Button id="user-bookings-new-btn" size="sm" onClick={() => setShowBookingModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* Colorful Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 bg-white/60 px-2 py-1 rounded-full">
                                        {metric.change}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 overflow-x-auto">
                        {filters.map((filter) => (
                            <button id={`user-bookings-filter-${filter.key}-btn`}
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key as any)}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeFilter === filter.key
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
                            <Button id="user-bookings-book-class-btn" onClick={() => setShowBookingModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Book a Class
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    filteredBookings.map((booking, index) => (
                        <motion.div
                            key={booking.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-all">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                {(booking.classDate || booking.date || '')?.split('-')[2] || '?'}
                                            </div>
                                            <div>
                                                <CardTitle>{booking.className || 'Class Booking'}</CardTitle>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Booking ID: #{(booking.bookingId || booking.id || '')?.slice(-8)}
                                                </p>
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
                                                <p className="text-sm font-medium text-gray-900">{booking.classDate || booking.date || 'TBD'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Time</p>
                                                <p className="text-sm font-medium text-gray-900">{booking.classTime || booking.time || 'TBD'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Location</p>
                                                <p className="text-sm font-medium text-gray-900">{booking.locationName || booking.location || 'TBD'}</p>
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
                                        <Button id={`user-bookings-view-${booking.id}-btn`} size="sm" variant="outline" className="flex-1"
                                            onClick={() => router.push(`/user/bookings?view=${booking.id}`)}>
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                        {booking.status === 'confirmed' && (
                                            <>
                                                <Button id={`user-bookings-modify-${booking.id}-btn`} size="sm" variant="outline"
                                                    onClick={() => router.push(`/user/bookings?modify=${booking.id}`)}>
                                                    Modify
                                                </Button>
                                                <Button id={`user-bookings-cancel-confirmed-${booking.id}-btn`} size="sm" variant="outline"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setCancelModal({ id: booking.id, name: booking.className || 'this booking' })}
                                                    disabled={cancellingId === booking.id}>
                                                    <X className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {booking.status === 'pending' && (
                                            <Button id={`user-bookings-cancel-pending-${booking.id}-btn`} size="sm" variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => setCancelModal({ id: booking.id, name: booking.className || 'this booking' })}
                                                disabled={cancellingId === booking.id}>
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

            {/* New Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        {bookingSuccess ? (
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Submitted!</h3>
                                <p className="text-gray-600">Your booking has been submitted and is pending confirmation.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between p-6 border-b">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">New Booking</h2>
                                        <p className="text-sm text-gray-500 mt-1">Book a class for your child</p>
                                    </div>
                                    <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateBooking} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                                        <select
                                            required
                                            value={bookingForm.program}
                                            onChange={e => setBookingForm(prev => ({ ...prev, program: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="">Select a program</option>
                                            <option value="Gymnastics">Gymnastics</option>
                                            <option value="Multi-Sports">Multi-Sports</option>
                                            <option value="Dance">Dance</option>
                                            <option value="Swimming">Swimming</option>
                                            <option value="Martial Arts">Martial Arts</option>
                                            <option value="Holiday Camp">Holiday Camp</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Type</label>
                                        <select
                                            value={bookingForm.classType}
                                            onChange={e => setBookingForm(prev => ({ ...prev, classType: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="">Select class type</option>
                                            <option value="Trial">Trial Class</option>
                                            <option value="Regular">Regular Class</option>
                                            <option value="Assessment">Assessment</option>
                                            <option value="Private">Private Session</option>
                                            <option value="Group">Group Class</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Child Name</label>
                                            <input
                                                type="text"
                                                value={bookingForm.childName}
                                                onChange={e => setBookingForm(prev => ({ ...prev, childName: e.target.value }))}
                                                placeholder="Child's name"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Child Age</label>
                                            <select
                                                value={bookingForm.childAge}
                                                onChange={e => setBookingForm(prev => ({ ...prev, childAge: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            >
                                                <option value="">Select age</option>
                                                {Array.from({ length: 14 }, (_, i) => i + 2).map(age => (
                                                    <option key={age} value={String(age)}>{age} years</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={bookingForm.date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={e => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot *</label>
                                        <select
                                            required
                                            value={bookingForm.timeSlot}
                                            onChange={e => setBookingForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="">Select time</option>
                                            <option value="09:00 AM">09:00 AM</option>
                                            <option value="10:00 AM">10:00 AM</option>
                                            <option value="11:00 AM">11:00 AM</option>
                                            <option value="12:00 PM">12:00 PM</option>
                                            <option value="01:00 PM">01:00 PM</option>
                                            <option value="02:00 PM">02:00 PM</option>
                                            <option value="03:00 PM">03:00 PM</option>
                                            <option value="04:00 PM">04:00 PM</option>
                                            <option value="05:00 PM">05:00 PM</option>
                                            <option value="06:00 PM">06:00 PM</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                        <select
                                            required
                                            value={bookingForm.location}
                                            onChange={e => setBookingForm(prev => ({ ...prev, location: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="">Select location</option>
                                            <option value="Main Center">Main Center</option>
                                            <option value="North Branch">North Branch</option>
                                            <option value="South Branch">South Branch</option>
                                            <option value="East Wing">East Wing</option>
                                            <option value="West Campus">West Campus</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea
                                            value={bookingForm.notes}
                                            onChange={e => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Any special requirements or notes..."
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <button
                                            type="button"
                                            onClick={() => setShowBookingModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={bookingSubmitting || !bookingForm.program || !bookingForm.date || !bookingForm.timeSlot || !bookingForm.location}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {bookingSubmitting ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    Booking...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4" />
                                                    Book Now
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Cancel Booking Modal */}
            {cancelModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
                            <button onClick={() => { setCancelModal(null); setCancelReason('') }}>
                                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to cancel <strong>{cancelModal.name}</strong>? This action may not be reversible.
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Reason for cancellation (optional)..."
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none resize-none mb-4"
                        />
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => { setCancelModal(null); setCancelReason('') }}>
                                Keep Booking
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                onClick={handleCancelBooking}
                                disabled={cancellingId !== null}
                            >
                                {cancellingId ? (
                                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Cancelling...</>
                                ) : (
                                    'Confirm Cancel'
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
