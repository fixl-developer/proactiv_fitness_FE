'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { EnhancedBookingService, AvailableSession, CreateBookingRequest } from '@/services/enhancedBookingService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User, Users, AlertCircle, Loader } from 'lucide-react'

interface Child {
    _id: string
    name: string
    age: number
    skillLevel: string
}

const BookClassPage = () => {
    const router = useRouter()
    const params = useParams()
    const sessionId = params.sessionId as string

    const [session, setSession] = useState<AvailableSession | null>(null)
    const [children, setChildren] = useState<Child[]>([])
    const [selectedChildren, setSelectedChildren] = useState<string[]>([])
    const [specialRequests, setSpecialRequests] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

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

    // Load session and children
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true)

                // Try to get session from sessionStorage first
                let sessionData = null
                if (typeof window !== 'undefined') {
                    const stored = sessionStorage.getItem('selectedSession')
                    if (stored) {
                        sessionData = JSON.parse(stored)
                        sessionStorage.removeItem('selectedSession')
                    }
                }

                // If not in sessionStorage, fetch from API
                if (!sessionData) {
                    const bookingService = new EnhancedBookingService()
                    const availability = await bookingService.checkAvailability(sessionId)
                    sessionData = availability
                }

                setSession(sessionData)

                // Load children from localStorage (in real app, fetch from API)
                const childrenData = localStorage.getItem('userChildren')
                if (childrenData) {
                    setChildren(JSON.parse(childrenData))
                } else {
                    // Mock data for demo
                    setChildren([
                        { _id: '1', name: 'Emma Chen', age: 6, skillLevel: 'BEGINNER' },
                        { _id: '2', name: 'Lucas Chen', age: 8, skillLevel: 'INTERMEDIATE' }
                    ])
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load session details')
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [sessionId])

    const handleChildToggle = (childId: string) => {
        setSelectedChildren(prev =>
            prev.includes(childId)
                ? prev.filter(id => id !== childId)
                : [...prev, childId]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (selectedChildren.length === 0) {
            setError('Please select at least one child')
            return
        }

        if (!session) {
            setError('Session information is missing')
            return
        }

        setIsSubmitting(true)

        try {
            const bookingService = new EnhancedBookingService()

            const bookingRequest: CreateBookingRequest = {
                sessionId: session.sessionId,
                childrenIds: selectedChildren,
                bookingType: 'REGULAR_CLASS',
                specialRequests: specialRequests || undefined
            }

            const booking = await bookingService.createBooking(bookingRequest)

            // Redirect to payment page
            router.push(`/parent/bookings/${booking._id}/payment`)
        } catch (err: any) {
            setError(err.message || 'Failed to create booking')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="parent" userName={userName} userEmail={userEmail}>
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading session details...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (!session) {
        return (
            <DashboardLayout userRole="parent" userName={userName} userEmail={userEmail}>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900">Session Not Found</h3>
                                <p className="text-sm text-red-700 mt-1">The session you're trying to book is no longer available.</p>
                                <Button onClick={() => router.push('/parent/browse-classes')} className="mt-4">
                                    Back to Browse Classes
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout userRole="parent" userName={userName} userEmail={userEmail}>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Book a Class</h1>
                    <p className="text-gray-600 mt-2">Complete your booking details</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Error Message */}
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

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Select Children */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Users className="w-5 h-5" />
                                        <span>Select Children</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {children.length === 0 ? (
                                        <p className="text-gray-600 text-sm">No children found. Please add children to your profile first.</p>
                                    ) : (
                                        children.map(child => (
                                            <label
                                                key={child._id}
                                                className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedChildren.includes(child._id)}
                                                    onChange={() => handleChildToggle(child._id)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <p className="font-medium text-gray-900">{child.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Age {child.age} • {child.skillLevel}
                                                    </p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            {/* Special Requests */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Special Requests (Optional)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <textarea
                                        value={specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                        placeholder="Any special requests or notes for the coach? (e.g., first time, needs extra attention, etc.)"
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isSubmitting || selectedChildren.length === 0}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <Loader className="w-4 h-4 animate-spin" />
                                        <span>Creating Booking...</span>
                                    </span>
                                ) : (
                                    'Continue to Payment'
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Session Summary */}
                    <div>
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Session Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{session.programName}</h3>
                                    <p className="text-sm text-gray-600">{session.programType}</p>
                                </div>

                                <div className="space-y-3 border-t border-gray-200 pt-4">
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">
                                            {new Date(session.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">{session.startTime} - {session.endTime}</span>
                                    </div>

                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">{session.locationName}</span>
                                    </div>

                                    {session.coachName && (
                                        <div className="flex items-center space-x-2 text-gray-700">
                                            <User className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm">Coach {session.coachName}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Price per child:</span>
                                        <span className="font-semibold text-gray-900">${session.price}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Children selected:</span>
                                        <span className="font-semibold text-gray-900">{selectedChildren.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                                        <span className="font-semibold text-gray-900">Total:</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            ${(session.price * selectedChildren.length).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-xs text-blue-700">
                                        <span className="font-semibold">Available spots:</span> {session.available} of {session.capacity}
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

export default BookClassPage
