'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Users, CreditCard, Loader, CheckCircle, AlertCircle, User } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'

interface ClassDetails {
    id: string
    program: string
    description?: string
    location: string
    locationAddress?: string
    date: string
    time: string
    endTime?: string
    duration?: string
    price: number
    currency: string
    capacity: number
    enrolled: number
    availableSpots: number
    coach?: string
    level?: string
    ageGroup?: string
}

interface PaymentMethod {
    id: string
    name: string
    provider: string
    currencies?: string[]
}

type BookingStep = 'details' | 'confirmation'

export default function BookClassPage() {
    const router = useRouter()
    const params = useParams()
    const sessionId = params.sessionId as string
    const { user, isAuthenticated } = useAuth()

    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
    const [classError, setClassError] = useState<string | null>(null)
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
        ;(async () => {
            setLoading(true)
            await Promise.all([loadClassDetails(), loadPaymentMethods()])
            setLoading(false)
        })()
    }, [isAuthenticated, router, sessionId])

    const loadClassDetails = async () => {
        try {
            setClassError(null)
            const response = await apiClient.get<any>(`/user/classes/browse?sessionId=${sessionId}`)
            const list = response?.data || []
            const match = Array.isArray(list)
                ? list.find((c: any) => String(c.id) === String(sessionId))
                : null
            if (match) {
                setClassDetails(match as ClassDetails)
            } else {
                setClassError('Class session not found or no longer available')
            }
        } catch (error: any) {
            console.error('Error loading class details:', error)
            setClassError(error?.message || 'Failed to load class details')
        }
    }

    const loadPaymentMethods = async () => {
        try {
            const response = await apiClient.get<any>('/payment-gateways')
            const methods: PaymentMethod[] = (response?.data || []).map((gw: any) => ({
                id: gw._id || gw.id,
                name: gw.name,
                provider: gw.provider,
                currencies: gw.supportedCurrencies || [],
            }))
            setPaymentMethods(methods)
            if (methods.length > 0) {
                setSelectedPayment(methods[0].id)
            }
        } catch (error) {
            console.error('Error loading payment methods:', error)
            setPaymentMethods([])
        }
    }

    const handleBookClass = async () => {
        if (paymentMethods.length > 0 && !selectedPayment) {
            toast.error('Please select a payment method')
            return
        }

        try {
            setIsProcessing(true)
            const response: any = await apiClient.post('/user/classes/book', {
                sessionId,
                paymentMethod: paymentMethods.find(m => m.id === selectedPayment)?.provider || 'card',
            })
            const data = response?.data || {}
            setBookingId(data.bookingId || data.id || '')
            setStep('confirmation')
            toast.success('Class booked successfully!')
        } catch (error: any) {
            console.error('Error booking class:', error)
            const msg = error?.response?.data?.message || error?.message || 'Failed to book class'
            toast.error(msg)
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

    if (classError || !classDetails) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-slate-900 font-semibold text-lg mb-1">Class not available</p>
                <p className="text-slate-600 text-sm mb-4">{classError || 'This class session could not be loaded.'}</p>
                <Link href="/user/browse-classes" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium">
                    Back to Browse Classes
                </Link>
            </div>
        )
    }

    const totalPrice = classDetails.price ?? 0
    const currency = classDetails.currency || 'HKD'

    return (
        <div className="space-y-6">
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
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                            <h1 className="text-3xl font-bold">{classDetails.program}</h1>
                            {classDetails.description && (
                                <p className="text-emerald-100 mt-2">{classDetails.description}</p>
                            )}
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-slate-500">Location</p>
                                    <p className="text-lg font-semibold text-slate-900">{classDetails.location || 'TBA'}</p>
                                    {classDetails.locationAddress && (
                                        <p className="text-sm text-slate-600">{classDetails.locationAddress}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Clock className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-slate-500">Date & Time</p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {classDetails.date
                                            ? new Date(classDetails.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })
                                            : 'TBA'}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        {classDetails.time || 'TBA'}
                                        {classDetails.endTime ? ` - ${classDetails.endTime}` : ''}
                                        {classDetails.duration ? ` (${classDetails.duration})` : ''}
                                    </p>
                                </div>
                            </div>

                            {classDetails.coach && (
                                <div className="flex items-start gap-4">
                                    <User className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-slate-500">Coach</p>
                                        <p className="text-lg font-semibold text-slate-900">{classDetails.coach}</p>
                                    </div>
                                </div>
                            )}

                            {(classDetails.level || classDetails.ageGroup) && (
                                <div className="flex items-start gap-4">
                                    <User className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-slate-500">Level / Age Group</p>
                                        <p className="text-lg font-semibold text-slate-900">
                                            {classDetails.level || ''}
                                            {classDetails.level && classDetails.ageGroup ? ' • ' : ''}
                                            {classDetails.ageGroup || ''}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <Users className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500">Availability</p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {classDetails.availableSpots} / {classDetails.capacity} seats available
                                    </p>
                                    {classDetails.capacity > 0 && (
                                        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-emerald-500 h-2 rounded-full"
                                                style={{ width: `${(classDetails.enrolled / classDetails.capacity) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {step === 'details' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Payment Method</h2>
                            {paymentMethods.length === 0 ? (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
                                    No payment gateways are configured yet. The booking will be created with payment status <span className="font-mono">pending</span>; you can settle it later from your bookings page.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {paymentMethods.map(method => (
                                        <label
                                            key={method.id}
                                            className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                                            style={{
                                                borderColor: selectedPayment === method.id ? '#10b981' : '#e2e8f0',
                                                backgroundColor: selectedPayment === method.id ? '#f0fdf4' : '#ffffff',
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
                                                {method.currencies && method.currencies.length > 0 && (
                                                    <p className="text-sm text-slate-500">
                                                        Supports: {method.currencies.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            <CreditCard className="w-5 h-5 text-slate-400" />
                                        </label>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 'confirmation' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg shadow-md p-6 text-center"
                        >
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                            <p className="text-slate-600 mb-4">Your class has been successfully booked.</p>
                            {bookingId && (
                                <p className="text-sm text-slate-500 mb-6">Booking ID: {bookingId}</p>
                            )}
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

                        <div className="space-y-3 pb-4 border-b border-slate-200">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Class Price</span>
                                <span className="font-semibold text-slate-900">
                                    {totalPrice} {currency}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Taxes & Fees</span>
                                <span className="font-semibold text-slate-900">0 {currency}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-900">Total</span>
                            <span className="text-2xl font-bold text-emerald-600">
                                {totalPrice} {currency}
                            </span>
                        </div>

                        {step === 'details' && (
                            <button
                                id="user-book-confirm-btn"
                                onClick={handleBookClass}
                                disabled={isProcessing || classDetails.availableSpots <= 0}
                                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing && <Loader className="w-4 h-4 animate-spin" />}
                                {isProcessing
                                    ? 'Booking...'
                                    : classDetails.availableSpots <= 0
                                        ? 'Class Full'
                                        : 'Confirm Booking'}
                            </button>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                            <p className="font-semibold mb-1">📧 Confirmation</p>
                            <p>A confirmation will be sent to {user?.email}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
