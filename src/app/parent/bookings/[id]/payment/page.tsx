'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import PaymentForm from '@/components/booking/PaymentForm'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { enhancedBookingService, Booking } from '@/services/enhancedBookingService'
import { paymentService } from '@/services/paymentService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, CheckCircle } from 'lucide-react'

const PaymentPage = () => {
    const router = useRouter()
    const params = useParams()
    const bookingId = params.id as string

    const [booking, setBooking] = useState<Booking | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [paymentSuccess, setPaymentSuccess] = useState(false)

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

    const handlePaymentSubmit = async (paymentData: any) => {
        try {
            setError('')
            const paymentService = new PaymentService()

            // Process payment
            const result = await paymentService.processPayment({
                bookingId,
                amount: booking?.payment.amount || 0,
                currency: booking?.payment.currency || 'USD',
                paymentMethodId: paymentData.paymentMethodId,
                cardNumber: paymentData.cardNumber,
                expiryMonth: paymentData.expiryMonth,
                expiryYear: paymentData.expiryYear,
                cvv: paymentData.cvv,
                cardholderName: paymentData.cardholderName,
                saveCard: paymentData.saveCard
            })

            setPaymentSuccess(true)

            // Redirect to booking confirmation after 2 seconds
            setTimeout(() => {
                router.push(`/parent/bookings/${bookingId}`)
            }, 2000)
        } catch (err: any) {
            setError(err.message || 'Payment failed. Please try again.')
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="parent" userName={userName} userEmail={userEmail}>
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading payment details...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (!booking) {
        return (
            <DashboardLayout userRole="parent" userName={userName} userEmail={userEmail}>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900">Booking Not Found</h3>
                                <p className="text-sm text-red-700 mt-1">The booking you're trying to pay for is no longer available.</p>
                                <Button onClick={() => router.push('/parent/bookings')} className="mt-4">
                                    Back to My Bookings
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </DashboardLayout>
        )
    }

    if (paymentSuccess) {
        return (
            <DashboardLayout userRole="parent" userName={userName} userEmail={userEmail}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto"
                >
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
                            >
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-green-900 mb-2">Payment Successful!</h3>
                            <p className="text-green-700 mb-6">Your booking has been confirmed. Redirecting to booking details...</p>
                            <div className="animate-pulse">
                                <Loader className="w-5 h-5 text-green-600 mx-auto" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout userRole="parent" userName={userName} userEmail={userEmail}>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
                    <p className="text-gray-600 mt-2">Secure payment for your booking</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payment Form */}
                    <div className="lg:col-span-2">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </motion.div>
                        )}

                        <PaymentForm
                            amount={booking.payment.amount}
                            currency={booking.payment.currency}
                            onSubmit={handlePaymentSubmit}
                        />
                    </div>

                    {/* Booking Summary */}
                    <div>
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{booking.programName}</h3>
                                    <p className="text-sm text-gray-600">Booking ID: {booking.bookingId}</p>
                                </div>

                                <div className="border-t border-gray-200 pt-4 space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Participants:</p>
                                        {booking.participants.map((p, idx) => (
                                            <p key={idx} className="text-sm font-medium text-gray-900">
                                                {p.childName}
                                            </p>
                                        ))}
                                    </div>

                                    {booking.sessionDate && (
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                {new Date(booking.sessionDate).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}

                                    {booking.sessionTime && (
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                {booking.sessionTime.startTime} - {booking.sessionTime.endTime}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium text-gray-900">
                                            ${(booking.payment.amount * 0.95).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Processing Fee:</span>
                                        <span className="font-medium text-gray-900">
                                            ${(booking.payment.amount * 0.05).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                                        <span>Total:</span>
                                        <span className="text-blue-600">${booking.payment.amount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-xs text-blue-700">
                                        <span className="font-semibold">Status:</span> {booking.payment.status}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default PaymentPage
