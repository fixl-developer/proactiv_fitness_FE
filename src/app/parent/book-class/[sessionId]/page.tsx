'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { Loader, AlertCircle, CheckCircle, MapPin, Clock, User, DollarSign, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import BookingService from '@/services/modules/booking.service'
import PaymentService from '@/services/modules/payment.service'

const BookClassPage = () => {
    const router = useRouter()
    const params = useParams()
    const sessionId = params?.sessionId as string
    
    const [sessionDetails, setSessionDetails] = useState<any>(null)
    const [children, setChildren] = useState<any[]>([])
    const [selectedChild, setSelectedChild] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [isBooking, setIsBooking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState('credit-card')
    const { user, isAuthenticated } = useAuth()

    const parentId = user?.id || 'parent-1'

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadSessionDetails()
    }, [isAuthenticated, router, parentId, sessionId])

    const loadSessionDetails = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const bookingService = new BookingService()
            
            // Get session details
            const session = await bookingService.getSessionDetails(sessionId)
            setSessionDetails(session)
            
            // Get children for selection
            const childrenList = await bookingService.getChildren(parentId)
            setChildren(childrenList || [])
            
            if (childrenList && childrenList.length > 0) {
                setSelectedChild(childrenList[0].id)
            }
        } catch (err: any) {
            console.error('Error loading session details:', err)
            setError(err.message || 'Failed to load session details')
        } finally {
            setIsLoading(false)
        }
    }

    const handleBookClass = async () => {
        if (!selectedChild) {
            setError('Please select a child')
            return
        }

        try {
            setIsBooking(true)
            setError(null)
            
            const bookingService = new BookingService()
            const paymentService = new PaymentService()
            
            // Create booking
            const booking = await bookingService.createBooking({
                studentId: selectedChild,
                classId: sessionId,
                locationId: sessionDetails?.locationId,
                notes: ''
            })
            
            // Process payment
            if (sessionDetails?.price > 0) {
                await paymentService.processPayment({
                    bookingId: booking.id,
                    amount: sessionDetails.price,
                    method: paymentMethod,
                    parentId: parentId
                })
            }
            
            setSuccess(true)
            
            // Redirect after 2 seconds
            setTimeout(() => {
                router.push('/parent/bookings')
            }, 2000)
        } catch (err: any) {
            console.error('Error booking class:', err)
            setError(err.message || 'Failed to book class')
        } finally {
            setIsBooking(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading class details...</p>
            </div>
        )
    }

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
            >
                <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-4">Your class has been successfully booked.</p>
                <p className="text-sm text-gray-500">Redirecting to bookings...</p>
            </motion.div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </Button>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Session Details */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{sessionDetails?.program || 'Class'}</h3>
                                <p className="text-gray-600 mt-1">{sessionDetails?.description || ''}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Location</p>
                                        <p className="font-semibold">{sessionDetails?.location || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Time</p>
                                        <p className="font-semibold">{sessionDetails?.time || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Coach</p>
                                        <p className="font-semibold">{sessionDetails?.coach || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Price</p>
                                        <p className="font-semibold">{sessionDetails?.price || 'Free'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Child Selection */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Select Child</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {children.map((child) => (
                                    <label key={child.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="child"
                                            value={child.id}
                                            checked={selectedChild === child.id}
                                            onChange={(e) => setSelectedChild(e.target.value)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <div className="ml-3">
                                            <p className="font-semibold text-gray-900">{child.name}</p>
                                            <p className="text-sm text-gray-600">{child.program || 'Program'}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Booking Summary */}
                <div>
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Class Price</span>
                                    <span className="font-semibold">{sessionDetails?.price || 'Free'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-semibold">$0</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold text-lg">{sessionDetails?.price || 'Free'}</span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="credit-card">Credit Card</option>
                                    <option value="bank-transfer">Bank Transfer</option>
                                    <option value="wallet">Wallet</option>
                                </select>
                            </div>

                            <Button
                                onClick={handleBookClass}
                                disabled={isBooking || !selectedChild}
                                className="w-full"
                            >
                                {isBooking ? 'Booking...' : 'Confirm Booking'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default BookClassPage
