'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { EnhancedBookingService, Booking } from '@/services/enhancedBookingService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, Clock, MapPin, User, Trash2 } from 'lucide-react'

const WaitlistPage = () => {
    const router = useRouter()
    const [waitlistEntries, setWaitlistEntries] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [removingId, setRemovingId] = useState<string | null>(null)

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

    // Load waitlist
    useEffect(() => {
        const loadWaitlist = async () => {
            try {
                setIsLoading(true)
                const bookingService = new EnhancedBookingService()
                const entries = await bookingService.getMyWaitlist()
                setWaitlistEntries(entries)
            } catch (err: any) {
                setError(err.message || 'Failed to load waitlist')
            } finally {
                setIsLoading(false)
            }
        }

        loadWaitlist()
    }, [])

    const handleRemoveFromWaitlist = async (bookingId: string) => {
        if (!confirm('Are you sure you want to remove yourself from this waitlist?')) {
            return
        }

        setRemovingId(bookingId)
        try {
            const bookingService = new EnhancedBookingService()
            await bookingService.removeFromWaitlist(bookingId)
            setWaitlistEntries(prev => prev.filter(entry => entry._id !== bookingId))
        } catch (err: any) {
            alert(err.message || 'Failed to remove from waitlist')
        } finally {
            setRemovingId(null)
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="parent" userName={userName} userEmail={userEmail}>
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading waitlist...</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout userRole="parent" userName={userName} userEmail={userEmail}>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Waitlist</h1>
                    <p className="text-gray-600 mt-2">Classes you're waiting to join</p>
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

                {waitlistEntries.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Waitlist Entries</h3>
                            <p className="text-gray-600 mb-4">
                                You're not on any waitlists. When a class is full, you can join the waitlist to be notified when a spot opens up.
                            </p>
                            <Button onClick={() => router.push('/parent/browse-classes')}>
                                Browse Classes
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {waitlistEntries.map((entry, index) => (
                            <motion.div
                                key={entry._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {entry.programName}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Booking ID: {entry.bookingId}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                                                    {entry.sessionDate && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            <span>
                                                                {new Date(entry.sessionDate).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {entry.sessionTime && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            <span>
                                                                {entry.sessionTime.startTime} - {entry.sessionTime.endTime}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {entry.locationName && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{entry.locationName}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Participants */}
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Participants:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {entry.participants.map((p, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                                                            >
                                                                <User className="w-3 h-3" />
                                                                {p.childName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-3">
                                                {/* Waitlist Position */}
                                                {entry.waitlistEntry && (
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">Waitlist Position</p>
                                                        <p className="text-3xl font-bold text-blue-600">
                                                            #{entry.waitlistEntry.position}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Remove Button */}
                                                <Button
                                                    onClick={() => handleRemoveFromWaitlist(entry._id)}
                                                    disabled={removingId === entry._id}
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700 border-red-200"
                                                >
                                                    {removingId === entry._id ? (
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Remove
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default WaitlistPage
