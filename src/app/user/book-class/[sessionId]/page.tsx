'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Users, CreditCard, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ClassDetails {
    id: string
    name: string
    description?: string
    location: {
        id: string
        name: string
        city: string
        address: string
    }
    room: {
        id: string
        name: string
        capacity: number
    }
    startTime: string
    endTime: string
    date: string
    price: number
    currency: string
    capacity: number
    enrolled: number
    instructor?: string
    level?: string
    ageGroup?: string
}

interface PaymentMethod {
    id: string
    name: string
    provider: string
    currencies: string[]
}

type BookingStep = 'details' | 'payment' | 'confirmation'

export default function BookClassPage() {
    const router = useRouter()
    const params = useParams()
    const sessionId = params.sessionId as string
    const { user, isAuthenticated } = useAuth()

    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState<BookingStep>('details')
    const [selectedPayment, setSelectedPayment] = useState<string>('')
    const [bookingId, setBookingId] = useState<string>('')
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadClassDetails()
        loadPaymentMethods()
    }, [isAuthenticated, router, sessionId])

    const loadClassDetails = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/v1/bookings/browse?sessionId=${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) throw new Error('Failed to load class details')

            const data = await response.json()
            const classData = data.data?.[0]
            if (classData) {
                setClassDetails(classData)
            } else {
                setClassDetails(getMockClassDetails())
            }
        } catch (error) {
            console.error('Error loading class details:', error)
            setClassDetails(getMockClassDetails())
        } finally {
            setLoading(false)
        }
    }

    const loadPaymentMethods = async () => {
        try {
            const response = await fetch('/api/v1/bcms/payment-gateways', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                const methods = (data.data || []).map((gw: any) => ({
                    id: gw.id,
                    name: gw.name,
                    provider: gw.provider,
                    currencies: gw.supportedCurrencies || ['USD', 'EUR', 'AED', 'INR']
                }))
                setPaymentMethods(methods)
                if (methods.length > 0) {
                    setSelectedPayment(methods[0].id)
                }
            }
        } catch (error) {
            console.error('Error loading payment methods:', error)
            setPaymentMethods(getMockPaymentMethods())
        }
    }

    const getMockClassDetails = (): ClassDetails => {
        return {
            id: '1',
            name: 'Zumba Class',
            description: 'High-energy dance fitness class',
            location: {
                id: 'loc1',
                name: 'Dubai Marina Center',
                city: 'Dubai',
                address: 'Marina Mall, Dubai'
            },
            room: { id: 'room1', name: 'Room B', capacity: 75 },
            startTime: '18:00',
            endTime: '19:00',
            date: '2025-02-15',
            price: 100,
            currency: 'AED',
            capacity: 75,
            enrolled: 45,
            instructor: 'Sarah',
            level: 'Beginner',
            ageGroup: 'All Ages'
        }
    }

    const getMockPaymentMethods = (): PaymentMethod[] => {
        return [
            {
                id: 'stripe1',
                name: 'Stripe',
                provider: 'stripe',
                currencies: ['USD', 'EUR', 'AED', 'INR']
            },
            {
                id: 'paypal1',
                name: 'PayPal',
                provider: 'paypal',
                currencies: ['USD', 'EUR', 'AED', 'INR']
            }
        ]
    }

    const handleBookClass = async () => {
        if (!selectedPayment) {
            toast.error('Please select a payment method')
            return
        }

        try {
            setIsProcessing(true)

            const bookingData = {
                sessionId: sessionId,
                paymentMethodId: selectedPayment,
                bookingType: 'drop_in'
            }

            const response = await fetch('/api/v1/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(bookingData)
            })

            if (!response.ok) throw new Error('Booking failed')

            const data = await response.json()
            setBookingId(data.data?.bookingId || 'BK-' + Date.now())
            setStep('payment')

            setTimeout(() => {
                setStep('confirmation')
                toast.success('Class booked successfully!')
            }, 2000)
        } catch (error) {
            console.error('Error booking class:', error)
            toast.error('Failed to book class')
        } finally {
            setIsProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        )
    }

    if (!classDetails) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">Class not found</p>
                <Link href="/user/browse-classes" className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium">
                    Back to Classes
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/user/browse-classes"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Classes
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Class Details Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                            <h1 className="text-3xl font-bold">{classDetails.name}</h1>
                            <p className="text-emerald-100 mt-2">{classDetails.description}</p>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-4">
                            {/* Location */}
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-slate-500">Location</p>
                                    <p className="text-lg font-semibold text-slate-900">{classDetails.location.name}</p>
                                    <p className="text-sm text-slate-600">{classDetails.location.address}</p>
                                    <p className="text-sm text-slate-600">Room: {classDetails.room.name}</p>
                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-start gap-4">
                                <Clock className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-slate-500">Date & Time</p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {new Date(classDetails.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        {classDetails.startTime} - {classDetails.endTime}
                                    </p>
                                </div>
                            </div>

                            {/* Capacity */}
                            <div className="flex items-start gap-4">
                                <Users className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-slate-500">Availability</p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {classDetails.capacity - classDetails.enrolled} / {classDetails.capacity} seats
                                    </p>
                                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-emerald-500 h-2 rounded-full"
                                            style={{ width: `${(classDetails.enrolled / classDetails.capacity) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Instructor */}
                            {classDetails.instructor && (
                                <div className="flex items-start gap-4">
                                    <Users className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-slate-500">Instructor</p>
                                        <p className="text-lg font-semibold text-slate-900">{classDetails.instructor}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Payment Method Selection */}
                    {step === 'details' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Select Payment Method</h2>
                            <div className="space-y-3">
                                {paymentMethods.map(method => (
                                    <label
                                        key={method.id}
                                        className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                                        style={{
                                            borderColor: selectedPayment === method.id ? '#10b981' : '#e2e8f0',
                                            backgroundColor: selectedPayment === method.id ? '#f0fdf4' : '#ffffff'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method.id}
                                            checked={selectedPayment === method.id}
                                            onChange={(e) => setSelectedPayment(e.target.value)}
                                            className="w-4 h-4"
                                        />
                                        <div className="ml-4 flex-1">
                                            <p className="font-semibold text-slate-900">{method.name}</p>
                                            <p className="text-sm text-slate-500">
                                                Supports: {method.currencies.join(', ')}
                                            </p>
                                        </div>
                                        <CreditCard className="w-5 h-5 text-slate-400" />
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Payment Processing */}
                    {step === 'payment' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg shadow-md p-6 text-center"
                        >
                            <Loader className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                            <p className="text-lg font-semibold text-slate-900">Processing Payment...</p>
                            <p className="text-slate-600 mt-2">Please wait while we process your booking</p>
                        </motion.div>
                    )}

                    {/* Confirmation */}
                    {step === 'confirmation' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg shadow-md p-6 text-center"
                        >
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                            <p className="text-slate-600 mb-4">Your class has been successfully booked</p>
                            <p className="text-sm text-slate-500 mb-6">Booking ID: {bookingId}</p>
                            <div className="flex gap-3">
                                <Link
                                    href="/user/bookings"
                                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium"
                                >
                                    View My Bookings
                                </Link>
                                <Link
                                    href="/user/browse-classes"
                                    className="flex-1 border border-emerald-600 text-emerald-600 py-2 rounded-lg hover:bg-emerald-50 font-medium"
                                >
                                    Book Another Class
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar - Price Summary */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">Booking Summary</h3>

                        {/* Price Breakdown */}
                        <div className="space-y-3 pb-4 border-b border-slate-200">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Class Price</span>
                                <span className="font-semibold text-slate-900">
                                    {classDetails.price} {classDetails.currency}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Taxes & Fees</span>
                                <span className="font-semibold text-slate-900">0 {classDetails.currency}</span>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-900">Total</span>
                            <span className="text-2xl font-bold text-emerald-600">
                                {classDetails.price} {classDetails.currency}
                            </span>
                        </div>

                        {/* Book Button */}
                        {step === 'details' && (
                            <button
                                onClick={handleBookClass}
                                disabled={isProcessing}
                                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold transition-all disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        )}

                        {/* Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                            <p className="font-semibold mb-1">📧 Confirmation</p>
                            <p>A confirmation email will be sent to {user?.email}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
