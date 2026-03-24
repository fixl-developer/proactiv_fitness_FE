'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'

import { useLocalStorage } from '@/hooks/useClientOnly'
import { enhancedBookingService, Booking, BookingStatus, PaymentStatus } from '@/services/enhancedBookingService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, Calendar, Clock, MapPin, User, DollarSign, CheckCircle, XCircle } from 'lucide-react'

const BookingDetailsPage = () => {
    const router = useRouter()
    const params = useParams()
    const bookingId = params.id as string

    const [booking, setBooking] = useState<Booking | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [isCancelling, setIsCancelling] = useState(false)

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

    // Load booking details
    useEffect(() => {
        const loadBooking = async () => {
            try {
                setIsLoading(true)
                const bookingService = new EnhancedBookingService()
                const bookingData = await bookingService.getBookingById(bookingId)
                setBooking(bookingData)
            } catch (err: any) {
                setError(err.message || 'Failed to load booking details')
            } finally {
                setIsLoading(false)
            }
        }

        loadBooking()
    }, [bookingId])

    const handleCancel = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a cancellation reason')
            return
        }

        setIsCancelling(true)
        try {
            const bookingService = new EnhancedBookingService()
            const updatedBooking = await bookingService.cancelBooking(bookingId, {
                reason: cancelReason,
                requestedAt: new Date().toISOString()
            })
            setBooking(updatedBooking)
            setShowCancelModal(false)
            setCancelReason('')
        } catch (err: any) {
            alert(err.message || 'Failed to cancel booking')
        } finally {
            setIsCancelling(false)
        }
    }

    const handleReschedule = () => {
        router.push(`/parent/browse-classes?reschedule=${bookingId}`)
    }

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.CONFIRMED:
                return 'bg-green-100 text-green-700 border-green-200'
            case BookingStatus.PENDING:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case BookingStatus.WAITLISTED:
                return 'bg-blue-100 text-blue-700 border-blue-200'
            case BookingStatus.CANCELLED:
                return 'bg-red-100 text-red-700 border-red-200'
            case BookingStatus.COMPLETED:
                return 'bg-gray-100 text-gray-700 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getPaymentStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID:
                return 'text-green-600'
            case PaymentStatus.PENDING:
                return 'text-yellow-600'
            case PaymentStatus.FAILED:
                return 'text-red-600'
            case PaymentStatus.REFUNDED:
                return 'text-blue-600'
            default:
                return 'text-gray-600'
        }
    }

    if (isLoading) {
        return (
            
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading booking details...</p>
                </div>
            
        )
    }

    if (!booking) {
        return (
            
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900">Booking Not Found</h3>
                                <p className="text-sm text-red-700 mt-1">The booking you're looking for is no longer available.</p>
                                <Button id="parent-bookings-detail-back-btn" onClick={() => router.push('/parent/bookings')} className="mt-4">
                                    Back to My Bookings
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            
        )
    }

    const isPastSession = booking.sessionDate && new Date(booking.sessionDate) < new Date()
    const canCancel = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING
    const canReschedule = booking.status === BookingStatus.CONFIRMED && !isPastSession

    return (
        
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                        <p className="text-gray-600 mt-2">ID: {booking.bookingId}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                    </div>
                </div>

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Program Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{booking.programName}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Date</p>
                                            <p className="font-semibold text-gray-900">
                                                {booking.sessionDate ? new Date(booking.sessionDate).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                }) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Time</p>
                                            <p className="font-semibold text-gray-900">
                                                {booking.sessionTime ? `${booking.sessionTime.startTime} - ${booking.sessionTime.endTime}` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Location</p>
                                            <p className="font-semibold text-gray-900">{booking.locationName || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Coach</p>
                                            <p className="font-semibold text-gray-900">{booking.coachName || 'TBD'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Participants */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Participants</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {booking.participants.map((participant, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{participant.childName}</p>
                                                {participant.skillLevel && (
                                                    <p className="text-sm text-gray-600">{participant.skillLevel}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Special Requests */}
                        {booking.specialRequests && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Special Requests</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700">{booking.specialRequests}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Cancellation Info */}
                        {booking.cancellation && (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader>
                                    <CardTitle className="text-red-900">Cancellation Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <p className="text-sm text-red-700">Reason: {booking.cancellation.reason}</p>
                                    </div>
                                    {booking.cancellation.refundAmount > 0 && (
                                        <div>
                                            <p className="text-sm text-red-700">
                                                Refund Amount: ${booking.cancellation.refundAmount.toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Waitlist Info */}
                        {booking.isWaitlisted && booking.waitlistEntry && (
                            <Card className="border-blue-200 bg-blue-50">
                                <CardHeader>
                                    <CardTitle className="text-blue-900">Waitlist Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <p className="text-sm text-blue-700">
                                            Position: #{booking.waitlistEntry.position}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-700">
                                            Joined: {new Date(booking.waitlistEntry.joinedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-semibold text-gray-900">
                                        ${booking.payment.amount.toFixed(2)} {booking.payment.currency}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-semibold ${getPaymentStatusColor(booking.payment.status)}`}>
                                        {booking.payment.status}
                                    </span>
                                </div>

                                {booking.payment.status === PaymentStatus.PENDING && (
                                    <Button id="parent-bookings-detail-complete-payment-btn"
                                        onClick={() => router.push(`/parent/bookings/${booking._id}/payment`)}
                                        className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold"
                                    >
                                        Complete Payment
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {canReschedule && (
                                    <Button id="parent-bookings-detail-reschedule-btn"
                                        onClick={handleReschedule}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Reschedule
                                    </Button>
                                )}

                                {canCancel && (
                                    <Button id="parent-bookings-detail-cancel-btn"
                                        onClick={() => setShowCancelModal(true)}
                                        variant="outline"
                                        className="w-full text-red-600 hover:text-red-700 border-red-200"
                                    >
                                        Cancel Booking
                                    </Button>
                                )}

                                {!canCancel && !canReschedule && (
                                    <p className="text-sm text-gray-600 text-center py-2">
                                        No actions available for this booking
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Cancel Modal */}
                {showCancelModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-lg max-w-md w-full p-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Cancel Booking</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to cancel this booking? Please provide a reason.
                            </p>

                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Reason for cancellation..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
                            />

                            <div className="flex gap-3">
                                <Button id="parent-bookings-detail-keep-booking-btn"
                                    onClick={() => setShowCancelModal(false)}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={isCancelling}
                                >
                                    Keep Booking
                                </Button>
                                <Button id="parent-bookings-detail-confirm-cancel-btn"
                                    onClick={handleCancel}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        
    )
}

export default BookingDetailsPage
