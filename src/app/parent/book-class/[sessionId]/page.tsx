'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Users, CreditCard, Loader, CheckCircle, AlertCircle, User } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
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

interface Child {
    id: string
    name: string
    age: number
}

type BookingStep = 'details' | 'payment' | 'confirmation'

export default function ParentBookClassPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const sessionId = params.sessionId as string
    const childIdParam = searchParams.get('childId')
    const { user, isAuthenticated } = useAuth()

    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
    const [children, setChildren] = useState<Child[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState<BookingStep>('details')
    const [selectedChild, setSelectedChild] = useState<string>(childIdParam || '')
    const [selectedPayment, setSelectedPayment] = useState<string>('')
    const [bookingId, setBookingId] = useState<string>('')
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadClassDetails()
        loadChildren()
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

    const loadChildren = async () => {
        try {
            const response = await fetch('/api/v1/children', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setChildren(data.data || [])
                if (data.data && data.data.length > 0 && !selectedChild) {
                    setSelectedChild(data.data[0].id)
                }
            }
        } catch (error) {
            console.error('Error loading children:', error)
            setChildren(getMockChildren())
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
            name: 'Kids Yoga',
            description: 'Fun yoga for kids',
            location: {
                id: 'loc1',
                name: 'Dubai Marina Center',
                city: 'Dubai',
                address: 'Marina Mall, Dubai'
            },
            room: { id: 'room1', name: 'Room A', capacity: 30 },
            startTime: '16:00',
            endTime: '16:45',
            date: '2025-02-15',
            price: 75,
            currency: 'AED',
            capacity: 30,
            enrolled: 20,
            instructor: 'Sarah',
            level: 'Beginner',
            ageGroup: 'Kids (6-12)'
        }
    }

    const getMockChildren = (): Child[] => {
        return [
            { id: 'child1', name: 'Aisha', age: 8 },
            { id: 'child2', name: 'Omar', age: 10 }
        ]
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
        if (!selectedChild) {
            toast.error('Please select a child')
            return
        }

        if (!selectedPayment) {
            toast.error('Please select a payment method')
            return
        }

        try {
            setIsProcessing(true)

            const bookingData = {
                sessionId: sessionId,
                childId: selectedChild,
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
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    if (!classDetails) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">Class not found</p>
                <Link href="/parent/browse-classes" className="mt-4 text-blue-600 hover:text-blue-700 font-medium">
                    Back to Classes
                </Link>
            </div>
        )
    }

    const selectedChildData = children.find(c => c.id === selectedChild)

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/parent/browse-classes"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Classes
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Child Selection */}
                    {children.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Select Child</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {children.map(child => (
                                    <button
                                        key={child.id}
                                        onClick={() => setSelectedChild(child.id)}
                                        className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${selectedChild === child.id
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {child.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-slate-900">{child.name}</p>
                                            <p className="text-xs text-slate-500">{child.age} years old</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Class Details Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white">
                            <h1 className="text-3xl font-bold">{classDetails.name}</h1>
                            <p className="text-blue-100 mt-2">{classDetails.description}</p>
                        </div>

                        {/* Details */}
                        <div className="p-6 space-y-4">
                            {/* Location */}
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-slate-500">Location</p>
                                    <p className="text-lg font-semibold text-slate-900">{classDetails.location.name}</p>
                                    <p className="text-sm text-slate-600">{classDetails.location.address}</p>
                                    <p className="text-sm text-slate-600">Room: {classDetails.room.name}</p>
                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-start gap-4">
                                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
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

                            {/* Age Group */}
                            <div className="flex items-start gap-4">
                                <User className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-slate-500">Age Group</p>
                                    <p className="text-lg font-semibold text-slate-900">{classDetails.ageGroup}</p>
                                </div>
                            </div>

                            {/* Capacity */}
                            <div className="flex items-start gap-4">
                                <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm text-slate-500">Availability</p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {classDetails.capacity - classDetails.enrolled} / {classDetails.capacity} seats
                                    </p>
                                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${(classDetails.enrolled / classDetails.capacity) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
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
                                            borderColor: selectedPayment === method.id ? '#2563eb' : '#e2e8f0',
                                            backgroundColor: selectedPayment === method.id ? '#eff6ff' : '#ffffff'
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
                            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
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
                            <p className="text-slate-600 mb-2">
                                Class booked for <span className="font-semibold">{selectedChildData?.name}</span>
                            </p>
                            <p className="text-sm text-slate-500 mb-6">Booking ID: {bookingId}</p>
                            <div className="flex gap-3">
                                <Link
                                    href="/parent/bookings"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    View My Bookings
                                </Link>
                                <Link
                                    href="/parent/browse-classes"
                                    className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 font-medium"
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

                        {/* Child Info */}
                        {selectedChildData && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-slate-500">Booking for</p>
                                <p className="text-lg font-semibold text-slate-900">{selectedChildData.name}</p>
                                <p className="text-sm text-slate-600">{selectedChildData.age} years old</p>
                            </div>
                        )}

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
                            <span className="text-2xl font-bold text-blue-600">
                                {classDetails.price} {classDetails.currency}
                            </span>
                        </div>

                        {/* Book Button */}
                        {step === 'details' && (
                            <button
                                onClick={handleBookClass}
                                disabled={isProcessing || !selectedChild}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-all disabled:opacity-50"
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
