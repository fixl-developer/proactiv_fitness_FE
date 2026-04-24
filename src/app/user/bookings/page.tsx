'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, DollarSign, RefreshCw, Plus, Eye, X, CheckCircle, AlertCircle, Edit, Brain, Sparkles, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import BookingService from '@/services/modules/booking.service'
import { apiClient } from '@/services/api/client'
import { validateName, validateSelect, validateTextArea, filterNameInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { toast } from 'sonner'
import { formatAIResponse } from '@/utils/formatAIResponse'

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([])
    const [filteredBookings, setFilteredBookings] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
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
        date: '',
        timeSlot: '',
        location: '',
        notes: '',
    })
    const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({})
    // AI Schedule Optimizer state
    const [aiPredictLoading, setAiPredictLoading] = useState(false)
    const [aiPredictResult, setAiPredictResult] = useState<any>(null)
    const [aiPredictError, setAiPredictError] = useState<string | null>(null)
    const [aiCoachLoading, setAiCoachLoading] = useState(false)
    const [aiCoachResult, setAiCoachResult] = useState<any>(null)
    const [aiCoachError, setAiCoachError] = useState<string | null>(null)

    const { user, isAuthenticated } = useAuth()
    const router = useRouter()
    const bookingService = new BookingService()

    // Transform raw booking from DB to display format
    const transformBooking = (b: any) => {
        // If booking already has className field, return as-is
        if (b.className) return b

        // Parse specialRequests to extract stored data
        const specialData: Record<string, string> = {}
        ;(b.specialRequests || []).forEach((r: string) => {
            const [key, ...valParts] = r.split(':')
            if (key) specialData[key] = valParts.join(':')
        })

        return {
            ...b,
            id: b._id || b.bookingId || b.id,
            bookingId: b.bookingId || b._id,
            className: specialData.className || specialData.program || (b.bookingType === 'assessment' ? 'Assessment Booking' : 'Class Booking'),
            classDate: b.sessionDate ? new Date(b.sessionDate).toISOString().split('T')[0] : '',
            classTime: b.sessionTime?.startTime || specialData.timeSlot || '',
            locationName: specialData.location || '',
            status: b.status || 'confirmed',
            paymentStatus: b.payment?.status || 'pending',
            amount: b.payment?.amount || 0,
            notes: specialData.notes || '',
            coachName: '',
            childName: specialData.childName || '',
        }
    }

    const loadBookings = useCallback(async () => {
        setError(null)
        try {
            let bookingsList: any[] = []
            try {
                // Try my-bookings endpoint first (returns only user's bookings)
                const myBookingsResponse = await apiClient.get<any>('/bookings/my-bookings')
                bookingsList = (myBookingsResponse?.data || []).map(transformBooking)
            } catch (myBookingsErr) {
                console.warn('my-bookings failed, trying alternatives:', myBookingsErr)
                try {
                    const response = await bookingService.getBookings({})
                    bookingsList = (response?.data?.bookings || []).map(transformBooking)
                } catch (serviceErr) {
                    console.warn('BookingService failed, falling back to apiClient:', serviceErr)
                    try {
                        const fallback = await apiClient.get<any>('/bookings')
                        bookingsList = (fallback?.data?.bookings || fallback?.bookings || []).map(transformBooking)
                    } catch (fallbackErr) {
                        console.error('Fallback apiClient also failed:', fallbackErr)
                        throw fallbackErr
                    }
                }
            }
            setBookings(Array.isArray(bookingsList) ? bookingsList : [])
        } catch (err: any) {
            console.error('Error loading bookings:', err)
            setError(err?.message || 'Failed to load bookings. Please try again.')
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
        setIsLoading(false)
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
            try {
                await bookingService.cancelBooking(cancelModal.id, cancelReason)
            } catch (serviceErr) {
                console.warn('BookingService.cancelBooking failed, falling back to apiClient:', serviceErr)
                await apiClient.put(`/bookings/${cancelModal.id}/cancel`, { reason: cancelReason })
            }
            setBookings(prev => prev.map(b =>
                b.id === cancelModal.id ? { ...b, status: 'cancelled' } : b
            ))
            setCancelModal(null)
            setCancelReason('')
            toast.success('Booking cancelled successfully')
        } catch (err) {
            console.error('Error cancelling booking:', err)
            toast.error('Failed to cancel booking. Please try again.')
        } finally {
            setCancellingId(null)
        }
    }

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault()
        const errors: Record<string, string> = {}
        const progErr = validateSelect(bookingForm.program, 'Program'); if (progErr) errors.program = progErr
        const tsErr = validateSelect(bookingForm.timeSlot, 'Time slot'); if (tsErr) errors.timeSlot = tsErr
        const locErr = validateSelect(bookingForm.location, 'Location'); if (locErr) errors.location = locErr
        if (!bookingForm.date) errors.date = 'Date is required'
        if (bookingForm.notes) { const ne = validateTextArea(bookingForm.notes, 'Notes', 0, 500); if (ne) errors.notes = ne }
        if (Object.keys(errors).length > 0) { setBookingErrors(errors); return }
        setBookingErrors({})

        setBookingSubmitting(true)
        try {
            const payload = {
                program: bookingForm.program,
                classType: bookingForm.classType,
                date: bookingForm.date,
                timeSlot: bookingForm.timeSlot,
                location: bookingForm.location,
                notes: bookingForm.notes,
            }
            try {
                await bookingService.createBooking(payload)
            } catch (serviceErr) {
                console.warn('BookingService.createBooking failed, falling back to apiClient:', serviceErr)
                await apiClient.post('/bookings', payload)
            }
            setBookingSuccess(true)
            await loadBookings()
            setTimeout(() => {
                setShowBookingModal(false)
                setBookingSuccess(false)
                setBookingForm({ program: '', classType: '', date: '', timeSlot: '', location: '', notes: '' })
            }, 2000)
        } catch (err) {
            console.error('Error creating booking:', err)
            // Still add locally as pending so user sees feedback
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
                setBookingForm({ program: '', classType: '', date: '', timeSlot: '', location: '', notes: '' })
            }, 2000)
        } finally {
            setBookingSubmitting(false)
        }
    }

    const handleViewDetails = (booking: any) => {
        const details = [
            `Booking ID: ${booking.bookingId || booking.id || 'N/A'}`,
            `Class: ${booking.className || 'N/A'}`,
            `Date: ${booking.classDate || booking.date || 'TBD'}`,
            `Time: ${booking.classTime || booking.time || 'TBD'}`,
            `Location: ${booking.locationName || booking.location || 'TBD'}`,
            `Status: ${booking.status || 'N/A'}`,
            `Payment: ${booking.paymentStatus || 'N/A'}`,
            `Amount: HK$${booking.amount || 0}`,
            booking.notes ? `Notes: ${booking.notes}` : null,
            booking.coachName ? `Coach: ${booking.coachName}` : null,
        ].filter(Boolean).join('\n')
        alert(details)
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

    // AI Schedule Optimizer handlers
    const handlePredictBestTime = async () => {
        setAiPredictLoading(true)
        setAiPredictError(null)
        setAiPredictResult(null)
        try {
            const userId = user?.id || user?._id || ''
            const response = await apiClient.post('/smart-scheduler/predict-attendance', { studentId: userId })
            setAiPredictResult(response?.data || response)
        } catch (err: any) {
            console.error('AI Predict Best Time error:', err)
            setAiPredictError(err?.message || 'Failed to get AI predictions. The service may be temporarily unavailable.')
        } finally {
            setAiPredictLoading(false)
        }
    }

    const handleCoachMatch = async () => {
        setAiCoachLoading(true)
        setAiCoachError(null)
        setAiCoachResult(null)
        try {
            const userId = user?.id || user?._id || ''
            const response = await apiClient.post('/smart-scheduler/match-coach', { studentId: userId, requirements: { level: 'any' } })
            setAiCoachResult(response?.data || response)
        } catch (err: any) {
            console.error('AI Coach Match error:', err)
            setAiCoachError(err?.message || 'Failed to get coach recommendations. The service may be temporarily unavailable.')
        } finally {
            setAiCoachLoading(false)
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

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        )
    }

    // Error state with retry
    if (error && bookings.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                        <p className="text-gray-600 mt-2">Manage your class bookings</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Bookings</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">{error}</p>
                        <Button onClick={() => { setIsLoading(true); loadBookings() }}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const statCards = [
        { title: 'Total Bookings', value: stats.total, icon: Calendar, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', badge: 'all time', badgeColor: 'text-blue-600 bg-blue-100' },
        { title: 'Confirmed', value: stats.confirmed, icon: CheckCircle, gradient: 'from-green-500 to-green-600', bgGradient: 'from-green-50 to-green-100', badge: 'active', badgeColor: 'text-green-600 bg-green-100' },
        { title: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-600', bgGradient: 'from-amber-50 to-orange-100', badge: 'awaiting', badgeColor: 'text-orange-600 bg-orange-100' },
        { title: 'Total Spent', value: `HK$${stats.totalAmount.toLocaleString()}`, icon: DollarSign, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', badge: 'spent', badgeColor: 'text-purple-600 bg-purple-100' }
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
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className={`text-xs font-medium ${metric.badgeColor} px-2 py-1 rounded-full`}>
                                        {metric.badge}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
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
                                            onClick={() => handleViewDetails(booking)}>
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                        {booking.status === 'confirmed' && (
                                            <>
                                                <Button id={`user-bookings-modify-${booking.id}-btn`} size="sm" variant="outline"
                                                    onClick={() => alert('Feature coming soon')}>
                                                    <Edit className="w-4 h-4 mr-2" />
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

            {/* AI Schedule Optimizer */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="border-0 bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-lg transition-all">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">AI Schedule Optimizer</CardTitle>
                                <p className="text-sm text-gray-600 mt-1">Get smart booking recommendations powered by AI</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Predict Best Time */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4 text-indigo-600" />
                                    <h4 className="font-semibold text-gray-900 text-sm">Best Time to Book</h4>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">AI analyzes attendance patterns to find optimal booking times with lower crowd density.</p>
                                <Button
                                    id="user-bookings-ai-predict-btn"
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                    onClick={handlePredictBestTime}
                                    disabled={aiPredictLoading}
                                >
                                    {aiPredictLoading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Get Best Time to Book
                                        </>
                                    )}
                                </Button>
                                {aiPredictResult && (
                                    <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                        <p className="text-xs font-medium text-indigo-800 mb-1">AI Recommendation:</p>
                                        {aiPredictResult.predictions ? (
                                            <ul className="text-xs text-indigo-700 space-y-1">
                                                {(Array.isArray(aiPredictResult.predictions) ? aiPredictResult.predictions : [aiPredictResult.predictions]).map((pred: any, i: number) => (
                                                    <li key={i} className="flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                                        {typeof pred === 'string' ? pred : pred.time || pred.slot || formatAIResponse(pred)}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-indigo-700">
                                                {aiPredictResult.recommendation || aiPredictResult.message || formatAIResponse(aiPredictResult)}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {aiPredictError && (
                                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                        <p className="text-xs text-red-600">{aiPredictError}</p>
                                    </div>
                                )}
                            </div>

                            {/* Coach Match */}
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-4 h-4 text-purple-600" />
                                    <h4 className="font-semibold text-gray-900 text-sm">Coach Match</h4>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">AI matches you with the best coaches based on your learning style and goals.</p>
                                <Button
                                    id="user-bookings-ai-coach-btn"
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                                    onClick={handleCoachMatch}
                                    disabled={aiCoachLoading}
                                >
                                    {aiCoachLoading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Matching...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4 mr-2" />
                                            Coach Match
                                        </>
                                    )}
                                </Button>
                                {aiCoachResult && (
                                    <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                        <p className="text-xs font-medium text-purple-800 mb-1">Recommended Coaches:</p>
                                        {aiCoachResult.coaches || aiCoachResult.matches ? (
                                            <ul className="text-xs text-purple-700 space-y-1">
                                                {(Array.isArray(aiCoachResult.coaches || aiCoachResult.matches) ? (aiCoachResult.coaches || aiCoachResult.matches) : [aiCoachResult.coaches || aiCoachResult.matches]).map((coach: any, i: number) => (
                                                    <li key={i} className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                                        {typeof coach === 'string' ? coach : coach.name || coach.coachName || formatAIResponse(coach)}
                                                        {coach.matchScore && <span className="text-purple-500 ml-1">({coach.matchScore}% match)</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-purple-700">
                                                {aiCoachResult.recommendation || aiCoachResult.message || formatAIResponse(aiCoachResult)}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {aiCoachError && (
                                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                        <p className="text-xs text-red-600">{aiCoachError}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* New Booking Drawer (right-side slide-in) */}
            <SlideInDrawer
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                title="New Booking"
                description="Book a class for yourself"
                size="lg"
            >
                {bookingSuccess ? (
                    <div className="py-10 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Submitted!</h3>
                        <p className="text-gray-600">Your booking has been submitted and is pending confirmation.</p>
                    </div>
                ) : (
                    <form onSubmit={handleCreateBooking} className="space-y-4">
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
                                            onChange={e => {
                                                setBookingForm(prev => ({ ...prev, notes: e.target.value }))
                                                if (e.target.value) { const err = validateTextArea(e.target.value, 'Notes', 0, 500); setBookingErrors(prev => { const n = {...prev}; if (err) n.notes = err; else delete n.notes; return n }) }
                                            }}
                                            placeholder="Any special requirements or notes..."
                                            rows={2}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none ${bookingErrors.notes ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        <FormFieldHint hint={FORMAT_HINTS.message} error={bookingErrors.notes} />
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
                )}
            </SlideInDrawer>

            {/* Cancel Booking Drawer (right-side slide-in) */}
            <SlideInDrawer
                isOpen={!!cancelModal}
                onClose={() => { setCancelModal(null); setCancelReason('') }}
                title="Cancel Booking"
                description={cancelModal ? `Cancel "${cancelModal.name}"?` : undefined}
                size="md"
                footer={
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => { setCancelModal(null); setCancelReason('') }}>
                            Keep Booking
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
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
                }
            >
                <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to cancel{cancelModal ? <> <strong>{cancelModal.name}</strong></> : null}? This action may not be reversible.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for cancellation (optional)</label>
                <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Schedule conflict..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none resize-none"
                />
            </SlideInDrawer>
        </div>
    )
}
