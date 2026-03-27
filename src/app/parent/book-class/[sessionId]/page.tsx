'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { Loader, AlertCircle, CheckCircle, MapPin, Clock, User, DollarSign, ArrowLeft, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/services/api/client'

interface Child {
    _id: string
    name: string
    age?: number
    program?: string
}

interface SessionInfo {
    _id: string
    program: string
    coach: string
    location: string
    time: string
    date: string
    price: number
    description?: string
    availableSlots?: number
}

const BookClassPage = () => {
    const router = useRouter()
    const params = useParams()
    const sessionId = params?.sessionId as string

    const [sessionDetails, setSessionDetails] = useState<SessionInfo | null>(null)
    const [children, setChildren] = useState<Child[]>([])
    const [selectedChild, setSelectedChild] = useState<string>('')
    const [selectedChildName, setSelectedChildName] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState('credit-card')
    const [isLoading, setIsLoading] = useState(true)
    const [isBooking, setIsBooking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const [classesResponse, childrenResponse] = await Promise.all([
                    apiClient.get('/parent/browse-classes'),
                    apiClient.get('/parent/children'),
                ])

                // Find the matching session from the browse-classes list
                const classes = classesResponse.data || classesResponse
                const matchedSession = Array.isArray(classes)
                    ? classes.find((s: any) => s._id === sessionId || s.id === sessionId)
                    : null

                if (matchedSession) {
                    setSessionDetails(matchedSession)
                } else {
                    // If session not found in list, still allow booking with minimal info
                    setSessionDetails({
                        _id: sessionId,
                        program: 'Class Session',
                        coach: 'N/A',
                        location: 'N/A',
                        time: 'N/A',
                        date: 'N/A',
                        price: 0,
                    })
                }

                const childrenList = childrenResponse.data || childrenResponse || []
                setChildren(childrenList)

                if (childrenList.length > 0) {
                    const first = childrenList[0]
                    setSelectedChild(first._id || first.id)
                    setSelectedChildName(first.name)
                }
            } catch (err: any) {
                console.error('Error loading data:', err)
                setError(err?.response?.data?.message || err.message || 'Failed to load session details')
            } finally {
                setIsLoading(false)
            }
        }

        if (sessionId) {
            loadData()
        }
    }, [sessionId])

    const handleChildSelect = (child: Child) => {
        const childId = child._id || (child as any).id
        setSelectedChild(childId)
        setSelectedChildName(child.name)
    }

    const handleBookClass = async () => {
        if (!selectedChild) {
            setError('Please select a child')
            return
        }

        try {
            setIsBooking(true)
            setError(null)

            await apiClient.post('/parent/book-class', {
                sessionId,
                childId: selectedChild,
                childName: selectedChildName,
                paymentMethod,
                amount: sessionDetails?.price || 0,
            })

            setSuccess(true)

            setTimeout(() => {
                router.push('/parent/bookings')
            }, 2000)
        } catch (err: any) {
            console.error('Error booking class:', err)
            setError(err?.response?.data?.message || err.message || 'Failed to book class')
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
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
            {/* Back Button */}
            <Button
                id="parent-book-class-back-btn"
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </Button>

            <h1 className="text-2xl font-bold text-gray-900">Book a Class</h1>

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
                {/* Session Details & Child Selection */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Session Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {sessionDetails?.program || 'Class'}
                                </h3>
                                {sessionDetails?.description && (
                                    <p className="text-gray-600 mt-1">{sessionDetails.description}</p>
                                )}
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
                                        <p className="font-semibold">
                                            {sessionDetails?.price
                                                ? `$${typeof sessionDetails.price === 'number' ? sessionDetails.price.toFixed(2) : sessionDetails.price}`
                                                : 'Free'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {sessionDetails?.availableSlots !== undefined && (
                                <p className="text-sm text-gray-500">
                                    {sessionDetails.availableSlots} slots available
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Child Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Child</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {children.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    No children found. Please add a child to your profile first.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {children.map((child) => {
                                        const childId = child._id || (child as any).id
                                        return (
                                            <label
                                                key={childId}
                                                id={`book-class-select-child-${childId}-label`}
                                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                                    selectedChild === childId
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                <input
                                                    id={`book-class-select-child-${childId}-radio`}
                                                    type="radio"
                                                    name="child"
                                                    value={childId}
                                                    checked={selectedChild === childId}
                                                    onChange={() => handleChildSelect(child)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <div className="ml-3">
                                                    <p className="font-semibold text-gray-900">{child.name}</p>
                                                    {child.age && (
                                                        <p className="text-sm text-gray-600">Age: {child.age}</p>
                                                    )}
                                                    {child.program && (
                                                        <p className="text-sm text-gray-600">{child.program}</p>
                                                    )}
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Booking Summary Sidebar */}
                <div>
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Class</span>
                                    <span className="font-medium text-gray-900">{sessionDetails?.program || 'N/A'}</span>
                                </div>
                                {selectedChildName && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Child</span>
                                        <span className="font-medium text-gray-900">{selectedChildName}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Class Price</span>
                                    <span className="font-semibold">
                                        {sessionDetails?.price
                                            ? `$${typeof sessionDetails.price === 'number' ? sessionDetails.price.toFixed(2) : sessionDetails.price}`
                                            : 'Free'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-semibold">$0.00</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold text-lg">
                                        {sessionDetails?.price
                                            ? `$${typeof sessionDetails.price === 'number' ? sessionDetails.price.toFixed(2) : sessionDetails.price}`
                                            : 'Free'}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <CreditCard className="w-4 h-4 inline mr-1" />
                                    Payment Method
                                </label>
                                <select
                                    id="select-parent-book-class-payment-method"
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
                                id="parent-book-class-confirm-btn"
                                onClick={handleBookClass}
                                disabled={isBooking || !selectedChild}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold"
                            >
                                {isBooking ? (
                                    <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Booking...
                                    </>
                                ) : (
                                    'Confirm Booking'
                                )}
                            </Button>

                            {!selectedChild && children.length > 0 && (
                                <p className="text-sm text-amber-600 text-center">Please select a child to continue</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default BookClassPage
