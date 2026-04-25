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
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import { validateRequired, validateTextArea } from '@/utils/validation'

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
    const [editOpen, setEditOpen] = useState(false)
    const [editBooking, setEditBooking] = useState<Booking | null>(null)
    const [editNotes, setEditNotes] = useState('')
    const [editErrors, setEditErrors] = useState<Record<string, string>>({})
    const [rescheduleOpen, setRescheduleOpen] = useState(false)
    const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null)
    const [rescheduleDate, setRescheduleDate] = useState('')
    const [rescheduleTime, setRescheduleTime] = useState('')
    const [rescheduleReason, setRescheduleReason] = useState('')
    const [rescheduleErrors, setRescheduleErrors] = useState<Record<string, string>>({})
    const [formSubmitting, setFormSubmitting] = useState(false)
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    // Transform raw booking from DB to parent bookings display format
    const transformBooking = (b: any) => {
        // If booking already has 'child' field, it's already in the right format
        if (b.child && b.program) return b

        const specialData: Record<string, string> = {}
        ;(b.specialRequests || []).forEach((r: string) => {
            const [key, ...valParts] = r.split(':')
            if (key) specialData[key] = valParts.join(':')
        })
        return {
            id: b._id || b.bookingId || b.id,
            child: specialData.childName || 'N/A',
            program: specialData.program || specialData.className || (b.bookingType === 'assessment' ? 'Assessment' : 'Class'),
            coach: 'TBD',
            date: b.sessionDate ? new Date(b.sessionDate).toLocaleDateString() : 'N/A',
            time: b.sessionTime?.startTime || 'N/A',
            duration: b.bookingType === 'assessment' ? '30 min' : '60 min',
            location: specialData.location || 'N/A',
            status: b.status || 'confirmed',
            price: b.payment?.amount ? `HKD ${b.payment.amount}` : 'Free',
            type: b.bookingType || 'class',
        }
    }

    const loadBookings = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            let bookingsList: any[] = []
            let bookingStats = { total: 0, upcoming: 0, completed: 0, cancelled: 0 }

            try {
                // Try parent-specific endpoint first
                const response = await apiClient.get(`/parent/bookings?status=${selectedFilter}`)
                if (response.success) {
                    bookingsList = response.data.bookings || []
                    bookingStats = response.data.stats || bookingStats
                }
            } catch (parentErr: any) {
                // If 401, redirect to login
                if (parentErr.response?.status === 401) {
                    router.push('/login')
                    return
                }
                // Fallback: try my-bookings endpoint
                try {
                    const myBookingsResponse = await apiClient.get<any>('/bookings/my-bookings')
                    const myBookings = (myBookingsResponse?.data || []).map(transformBooking)
                    bookingsList = myBookings
                    bookingStats = {
                        total: bookingsList.length,
                        upcoming: bookingsList.filter((b: any) => b.status === 'confirmed' || b.status === 'pending').length,
                        completed: bookingsList.filter((b: any) => b.status === 'completed').length,
                        cancelled: bookingsList.filter((b: any) => b.status === 'cancelled').length,
                    }
                } catch (fallbackErr) {
                    console.error('All booking endpoints failed:', fallbackErr)
                    throw fallbackErr
                }
            }

            setBookings(bookingsList)
            setStats(bookingStats)
        } catch (err) {
            console.error('Error loading bookings:', err)
            setError('Failed to load bookings')
        } finally {
            setIsLoading(false)
        }
    }, [selectedFilter, router])

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
            toast.success('Booking cancelled successfully')
            await loadBookings()
        } catch (err) {
            console.error('Error cancelling booking:', err)
            toast.error('Failed to cancel booking. Please try again.')
        }
    }

    const openEditDrawer = (b: Booking) => {
        setEditBooking(b)
        setEditNotes('')
        setEditErrors({})
        setEditOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editBooking) return
        const errs: Record<string, string> = {}
        const notesErr = validateTextArea(editNotes, 'Notes', 1, 500)
        if (notesErr) errs.notes = notesErr
        if (Object.keys(errs).length) { setEditErrors(errs); return }
        setFormSubmitting(true)
        try {
            await apiClient.put(`/parent/bookings/${editBooking.id}`, { notes: editNotes })
            toast.success('Booking updated')
            setEditOpen(false)
            setEditBooking(null)
            await loadBookings()
        } catch (err) {
            console.error('Edit booking error:', err)
            toast.error('Failed to update booking')
        } finally {
            setFormSubmitting(false)
        }
    }

    const openRescheduleDrawer = (b: Booking) => {
        setRescheduleBooking(b)
        setRescheduleDate('')
        setRescheduleTime('')
        setRescheduleReason('')
        setRescheduleErrors({})
        setRescheduleOpen(true)
    }

    const handleRescheduleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!rescheduleBooking) return
        const errs: Record<string, string> = {}
        const dateErr = validateRequired(rescheduleDate, 'New date')
        if (dateErr) errs.newDate = dateErr
        else if (new Date(rescheduleDate) < new Date(new Date().toDateString())) errs.newDate = 'New date cannot be in the past'
        const timeErr = validateRequired(rescheduleTime, 'New time')
        if (timeErr) errs.newTime = timeErr
        if (Object.keys(errs).length) { setRescheduleErrors(errs); return }
        setFormSubmitting(true)
        try {
            await apiClient.put(`/parent/bookings/${rescheduleBooking.id}/reschedule`, {
                newDate: rescheduleDate,
                newTime: rescheduleTime,
                reason: rescheduleReason,
            })
            toast.success('Booking rescheduled')
            setRescheduleOpen(false)
            setRescheduleBooking(null)
            await loadBookings()
        } catch (err) {
            console.error('Reschedule error:', err)
            toast.error('Failed to reschedule booking')
        } finally {
            setFormSubmitting(false)
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Bookings</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-2">Manage your children's class bookings</p>
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
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <CardTitle className="text-base md:text-lg">Filter Bookings</CardTitle>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Search className="w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search bookings..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto w-full sm:w-auto">
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
                                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg hover:shadow-md transition-all border border-gray-200 gap-3"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0">
                                            {booking.child.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="font-semibold text-sm md:text-base text-gray-900">{booking.program}</h4>
                                                <Badge className={getStatusColor(booking.status)}>
                                                    {booking.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="text-xs md:text-sm text-gray-600 truncate">{booking.child} - Coach: {booking.coach}</p>
                                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-gray-500 mt-1">
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
                                    <div className="flex items-center justify-between w-full md:w-auto gap-3">
                                    <div className="text-left md:text-right">
                                        <p className="text-base md:text-lg font-bold text-blue-600">{booking.price}</p>
                                        <p className="text-xs md:text-sm text-gray-600">{booking.type}</p>
                                        <p className="text-xs text-gray-500">ID: {booking.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
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
                                            <>
                                                <Button
                                                    id={`parent-bookings-edit-${booking.id}-btn`}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDrawer(booking)}
                                                    title="Edit notes"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    id={`parent-bookings-reschedule-${booking.id}-btn`}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openRescheduleDrawer(booking)}
                                                    title="Reschedule"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </Button>
                                            </>
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
                            onClick={() => router.push('/parent/browse-classes?type=assessment')}
                        >
                            <User className="w-6 h-6" />
                            <span>Assessment</span>
                        </Button>
                        <Button
                            id="parent-bookings-quick-reschedule-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => {
                                const upcomingBooking = filteredBookings.find(b => b.status === 'confirmed')
                                if (upcomingBooking) openRescheduleDrawer(upcomingBooking)
                                else toast.info('No confirmed bookings to reschedule')
                            }}
                        >
                            <RefreshCw className="w-6 h-6" />
                            <span>Reschedule</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Booking Drawer */}
            <SlideInDrawer
                isOpen={editOpen}
                onClose={() => { setEditOpen(false); setEditBooking(null); setEditErrors({}) }}
                title="Edit Booking"
                description={editBooking ? `${editBooking.program} - ${editBooking.child}` : ''}
                size="md"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Special Requests</label>
                        <textarea
                            name="notes"
                            rows={5}
                            value={editNotes}
                            onChange={(e) => {
                                setEditNotes(e.target.value)
                                if (editErrors.notes) setEditErrors(prev => { const n = { ...prev }; delete n.notes; return n })
                            }}
                            maxLength={500}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.notes ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Anything the coach or facility should know"
                        />
                        <FormFieldHint hint="1-500 characters" error={editErrors.notes} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => { setEditOpen(false); setEditBooking(null); setEditErrors({}) }}>Cancel</Button>
                        <Button type="submit" disabled={formSubmitting}>
                            {formSubmitting ? (<><Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...</>) : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </SlideInDrawer>

            {/* Reschedule Booking Drawer */}
            <SlideInDrawer
                isOpen={rescheduleOpen}
                onClose={() => { setRescheduleOpen(false); setRescheduleBooking(null); setRescheduleErrors({}) }}
                title="Reschedule Booking"
                description={rescheduleBooking ? `${rescheduleBooking.program} - ${rescheduleBooking.child}` : ''}
                size="md"
            >
                <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                        <input
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => {
                                setRescheduleDate(e.target.value)
                                if (rescheduleErrors.newDate) setRescheduleErrors(prev => { const n = { ...prev }; delete n.newDate; return n })
                            }}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${rescheduleErrors.newDate ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint="Select a date on or after today" error={rescheduleErrors.newDate} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                        <input
                            type="time"
                            value={rescheduleTime}
                            onChange={(e) => {
                                setRescheduleTime(e.target.value)
                                if (rescheduleErrors.newTime) setRescheduleErrors(prev => { const n = { ...prev }; delete n.newTime; return n })
                            }}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${rescheduleErrors.newTime ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint="e.g. 09:30" error={rescheduleErrors.newTime} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                        <textarea
                            rows={3}
                            value={rescheduleReason}
                            onChange={(e) => setRescheduleReason(e.target.value)}
                            maxLength={300}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Why are you rescheduling?"
                        />
                        <FormFieldHint hint="Up to 300 characters" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => { setRescheduleOpen(false); setRescheduleBooking(null); setRescheduleErrors({}) }}>Cancel</Button>
                        <Button type="submit" disabled={formSubmitting}>
                            {formSubmitting ? (<><Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...</>) : 'Reschedule'}
                        </Button>
                    </div>
                </form>
            </SlideInDrawer>
        </div>
    )
}

export default ParentBookingsPage
