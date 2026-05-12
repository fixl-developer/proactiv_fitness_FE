'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'

import { apiClient } from '@/services/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, Calendar, Clock, MapPin, User, DollarSign, CheckCircle, XCircle, ArrowLeft, CreditCard, Users } from 'lucide-react'
import { toast } from 'sonner'

interface BookingDetails {
    id: string
    child: { id: string; name: string }
    program: { id: string; name: string }
    coach: { id: string; name: string }
    date: string
    time: string
    duration: number
    location: string
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
    price: number
    paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
    type: string
    participants: Array<{ id: string; name: string; skillLevel?: string }>
    specialRequests: string
    cancelReason: string
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'confirmed':
            return 'bg-green-100 text-green-700 border-green-200'
        case 'pending':
            return 'bg-yellow-100 text-yellow-700 border-yellow-200'
        case 'cancelled':
            return 'bg-red-100 text-red-700 border-red-200'
        case 'completed':
            return 'bg-blue-100 text-blue-700 border-blue-200'
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200'
    }
}

const getPaymentBadge = (status: string) => {
    switch (status) {
        case 'paid':
            return 'text-green-600'
        case 'pending':
            return 'text-yellow-600'
        case 'failed':
            return 'text-red-600'
        case 'refunded':
            return 'text-blue-600'
        default:
            return 'text-gray-600'
    }
}

const BookingDetailsPage = () => {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [booking, setBooking] = useState<BookingDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                setIsLoading(true)
                setError('')
                const response = await apiClient.get(`/parent/bookings/${id}`)
                setBooking(response.data)
            } catch (err: any) {
                setError(err?.response?.data?.message || err.message || 'Failed to load booking details')
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchBooking()
        }
    }, [id])

    const handleCancel = async () => {
        setIsCancelling(true)
        try {
            await apiClient.put(`/parent/bookings/${id}/cancel`)
            toast.success('Booking cancelled successfully.')
            router.push('/parent/bookings')
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err.message || 'Failed to cancel booking')
        } finally {
            setIsCancelling(false)
            setShowCancelDialog(false)
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

    if (error && !booking) {
        return (
            <div className="max-w-3xl mx-auto py-8 px-4">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900">Error Loading Booking</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                                <Button
                                    id="parent-bookings-detail-back-btn"
                                    onClick={() => router.push('/parent/bookings')}
                                    className="mt-4"
                                >
                                    Back to Bookings
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="max-w-3xl mx-auto py-8 px-4">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900">Booking Not Found</h3>
                                <p className="text-sm text-red-700 mt-1">The booking you are looking for does not exist.</p>
                                <Button
                                    id="parent-bookings-detail-back-btn-notfound"
                                    onClick={() => router.push('/parent/bookings')}
                                    className="mt-4"
                                >
                                    Back to Bookings
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const canCancel = booking.status === 'confirmed' || booking.status === 'pending'

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        id="parent-bookings-detail-back-btn-header"
                        variant="outline"
                        onClick={() => router.push('/parent/bookings')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Bookings
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadge(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
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
                    {/* Program & Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{booking.program?.name || 'Program'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Date</p>
                                        <p className="font-semibold text-gray-900">
                                            {booking.date
                                                ? new Date(booking.date).toLocaleDateString('en-US', {
                                                      weekday: 'long',
                                                      month: 'long',
                                                      day: 'numeric',
                                                      year: 'numeric',
                                                  })
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Time</p>
                                        <p className="font-semibold text-gray-900">{booking.time || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Location</p>
                                        <p className="font-semibold text-gray-900">{booking.location || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Coach</p>
                                        <p className="font-semibold text-gray-900">{booking.coach?.name || 'TBD'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Duration</p>
                                        <p className="font-semibold text-gray-900">{booking.duration ? `${booking.duration} min` : 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Type</p>
                                        <p className="font-semibold text-gray-900">{booking.type || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Child Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Child</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <User className="w-5 h-5 text-blue-600" />
                                <p className="font-medium text-gray-900">{booking.child?.name || 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Participants */}
                    {booking.participants && booking.participants.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Participants
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {booking.participants.map((participant, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{participant.name}</p>
                                                {participant.skillLevel && (
                                                    <p className="text-sm text-gray-600">{participant.skillLevel}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

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

                    {/* Cancel Reason */}
                    {booking.cancelReason && booking.status === 'cancelled' && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="text-red-900">Cancellation Reason</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-red-700">{booking.cancelReason}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Payment Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Payment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Price</span>
                                <span className="font-semibold text-gray-900">
                                    ${typeof booking.price === 'number' ? booking.price.toFixed(2) : booking.price}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <span className="text-gray-600">Payment Status</span>
                                <span className={`font-semibold capitalize ${getPaymentBadge(booking.paymentStatus)}`}>
                                    {booking.paymentStatus}
                                </span>
                            </div>

                            {booking.paymentStatus === 'pending' && (
                                <Button
                                    id="parent-bookings-detail-pay-now-btn"
                                    onClick={() => router.push(`/parent/bookings/${id}/payment`)}
                                    className="w-full mt-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold"
                                >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay Now
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {canCancel && (
                                <Button
                                    id="parent-bookings-detail-cancel-btn"
                                    onClick={() => setShowCancelDialog(true)}
                                    variant="outline"
                                    className="w-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Booking
                                </Button>
                            )}

                            <Button
                                id="parent-bookings-detail-back-to-bookings-btn"
                                onClick={() => router.push('/parent/bookings')}
                                variant="outline"
                                className="w-full"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Bookings
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Cancel Confirmation Dialog */}
            {showCancelDialog && (
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
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <h3 className="text-lg font-bold text-gray-900">Cancel Booking</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel this booking? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <Button
                                id="parent-bookings-detail-keep-booking-btn"
                                onClick={() => setShowCancelDialog(false)}
                                variant="outline"
                                className="flex-1"
                                disabled={isCancelling}
                            >
                                Keep Booking
                            </Button>
                            <Button
                                id="parent-bookings-detail-confirm-cancel-btn"
                                onClick={handleCancel}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                disabled={isCancelling}
                            >
                                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}

export default BookingDetailsPage
