'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, Clock, MapPin, User, Trash2, RefreshCw, BookOpen, Calendar, Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'

interface WaitlistEntry {
    id: string
    program: string
    bookingId: string
    date: string
    time: string
    location: string
    participants: string[]
    position: number
}

const WaitlistPage = () => {
    const router = useRouter()
    const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [removingId, setRemovingId] = useState<string | null>(null)
    const { user, isAuthenticated } = useAuth()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadWaitlist()
    }, [isAuthenticated, router])

    const loadWaitlist = async () => {
        try {
            setIsLoading(true)
            setError('')
            const response = await apiClient.get<any>('/parent/waitlist')
            const entries = response?.data || response || []
            setWaitlistEntries(Array.isArray(entries) ? entries : [])
        } catch (err: any) {
            console.error('Error loading waitlist:', err)
            setError(err.message || 'Failed to load waitlist')
            setWaitlistEntries([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveFromWaitlist = async (entryId: string) => {
        if (!confirm('Are you sure you want to remove yourself from this waitlist?')) {
            return
        }

        setRemovingId(entryId)
        try {
            await apiClient.delete(`/parent/waitlist/${entryId}`)
            // Refresh the full list after removal
            await loadWaitlist()
        } catch (err: any) {
            console.error('Error removing from waitlist:', err)
            setError(err.message || 'Failed to remove from waitlist')
        } finally {
            setRemovingId(null)
        }
    }

    const handleRetry = () => {
        loadWaitlist()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-3xl font-bold text-gray-900">My Waitlist</h1>
                <p className="text-gray-600 mt-2">Classes you're waiting to join</p>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                >
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading waitlist...</p>
                </motion.div>
            )}

            {/* Error State */}
            {!isLoading && error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center text-center"
                >
                    <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                    <p className="text-red-700 font-medium mb-1">Something went wrong</p>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <Button onClick={handleRetry} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !error && waitlistEntries.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardContent className="p-12 text-center">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Waitlist Entries</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                You're not on any waitlists. When a class is full, you can join the waitlist to be notified when a spot opens up.
                            </p>
                            <Button
                                id="parent-waitlist-browse-classes-btn"
                                onClick={() => router.push('/parent/browse-classes')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Browse Classes
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Waitlist Entries */}
            {!isLoading && !error && waitlistEntries.length > 0 && (
                <div className="space-y-4">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-gray-500"
                    >
                        {waitlistEntries.length} waitlist entr{waitlistEntries.length !== 1 ? 'ies' : 'y'}
                    </motion.p>

                    {waitlistEntries.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08, duration: 0.3 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {entry.program}
                                                </h3>
                                                <Badge className="bg-amber-100 text-amber-800">
                                                    <Hash className="w-3 h-3 mr-1" />
                                                    Position {entry.position}
                                                </Badge>
                                            </div>

                                            <p className="text-xs text-gray-400 mb-3">Booking: {entry.bookingId}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                                {entry.date && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 flex-shrink-0" />
                                                        <span>
                                                            {new Date(entry.date).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                )}

                                                {entry.time && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                                        <span>{entry.time}</span>
                                                    </div>
                                                )}

                                                {entry.location && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                                        <span>{entry.location}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Participants */}
                                            {entry.participants && entry.participants.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <p className="text-xs font-medium text-gray-500 mb-2">Participants:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {entry.participants.map((name: string, idx: number) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                                                            >
                                                                <User className="w-3 h-3" />
                                                                {name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-3">
                                            {/* Waitlist Position */}
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">Queue Position</p>
                                                <p className="text-3xl font-bold text-blue-600">
                                                    #{entry.position}
                                                </p>
                                            </div>

                                            {/* Remove Button */}
                                            <Button
                                                id={`parent-waitlist-remove-${entry.id}-btn`}
                                                onClick={() => handleRemoveFromWaitlist(entry.id)}
                                                disabled={removingId === entry.id}
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                            >
                                                {removingId === entry.id ? (
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Remove from Waitlist
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
    )
}

export default WaitlistPage
