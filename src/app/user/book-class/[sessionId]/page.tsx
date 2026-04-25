'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import {
    Loader, AlertCircle, CheckCircle, MapPin, Clock, User, DollarSign,
    ArrowLeft, CreditCard, Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'

interface ClassInfo {
    id: string
    source?: 'session' | 'program'
    program: string
    coach?: string
    location?: string
    time?: string
    date?: string
    duration?: string | number
    price?: number | string
    description?: string
    availableSpots?: number
}

const UserBookClassPage = () => {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params?.sessionId as string
    const source = (searchParams.get('source') as 'session' | 'program' | null) || 'session'

    const { user, isAuthenticated } = useAuth()

    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'bank-transfer' | 'wallet' | 'cash'>('credit-card')
    const [notes, setNotes] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isBooking, setIsBooking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [confirmationNumber, setConfirmationNumber] = useState<string>('')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/login?redirectTo=${encodeURIComponent(`/user/book-class/${id}?source=${source}`)}`)
            return
        }
        const load = async () => {
            try {
                setIsLoading(true)
                setError(null)
                // Re-use the browse list to find the matching item — it's the only
                // shared shape that already merges Sessions + Programs.
                const res: any = await apiClient.get('/bookings/browse')
                const list = (res?.data ?? res ?? []) as ClassInfo[]
                const found = Array.isArray(list)
                    ? list.find((c) => String(c.id) === String(id) && (!source || (c.source ?? 'session') === source))
                    : null

                if (found) {
                    setClassInfo(found)
                } else {
                    // Couldn't resolve full details — let the booking go through with what we have.
                    setClassInfo({
                        id,
                        source,
                        program: 'Class',
                    })
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || err?.message || 'Failed to load class details')
            } finally {
                setIsLoading(false)
            }
        }
        if (id) load()
    }, [id, source, isAuthenticated, router])

    const handleBook = async () => {
        if (!classInfo) return
        try {
            setIsBooking(true)
            setError(null)
            const payload = {
                classId: classInfo.id,
                className: classInfo.program,
                classDate: classInfo.date || undefined,
                classTime: classInfo.time || undefined,
                location: classInfo.location || undefined,
                price: typeof classInfo.price === 'number' ? classInfo.price : Number(classInfo.price) || 0,
                childName: user?.name || undefined,
                notes: [notes, `payment:${paymentMethod}`, source === 'program' ? 'source:program' : null].filter(Boolean).join(' | '),
            }
            const res: any = await apiClient.post('/bookings/class', payload)
            const data = res?.data ?? res
            setConfirmationNumber(data?.confirmationNumber || data?.bookingId || '')
            setSuccess(true)
            toast.success('Booking confirmed!')
            setTimeout(() => router.push('/user/bookings'), 1500)
        } catch (err: any) {
            if (err?.response?.status === 401) {
                toast.error('Your session expired — please log in again.')
                router.push(`/login?redirectTo=${encodeURIComponent(`/user/book-class/${id}?source=${source}`)}`)
                return
            }
            const msg =
                err?.response?.data?.message ||
                (Array.isArray(err?.response?.data?.errors) && err.response.data.errors.join(', ')) ||
                err?.message ||
                'Failed to book class'
            setError(msg)
            toast.error(msg)
        } finally {
            setIsBooking(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading class details...</p>
            </div>
        )
    }

    if (success) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16">
                <CheckCircle className="w-16 h-16 text-emerald-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                {confirmationNumber && (
                    <p className="text-sm text-gray-500 mb-1">
                        Confirmation: <span className="font-mono font-semibold text-emerald-700">{confirmationNumber}</span>
                    </p>
                )}
                <p className="text-gray-600 mb-4">Your class has been successfully booked.</p>
                <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
            </motion.div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-6">
            <Button
                id="user-book-class-back-btn"
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            <h1 className="text-2xl font-bold text-gray-900">Book a Class</h1>

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
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {classInfo?.program || 'Class'}
                                </h3>
                                {classInfo?.description && (
                                    <p className="text-gray-600 mt-1">{classInfo.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {classInfo?.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-emerald-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Location</p>
                                            <p className="font-semibold">{classInfo.location}</p>
                                        </div>
                                    </div>
                                )}
                                {classInfo?.date && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-emerald-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Date</p>
                                            <p className="font-semibold">
                                                {(() => {
                                                    try {
                                                        const d = new Date(classInfo.date)
                                                        if (isNaN(d.getTime())) return classInfo.date
                                                        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                                    } catch { return classInfo.date }
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {classInfo?.time && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-emerald-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Time</p>
                                            <p className="font-semibold">{classInfo.time}</p>
                                        </div>
                                    </div>
                                )}
                                {classInfo?.coach && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-emerald-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Coach</p>
                                            <p className="font-semibold">{classInfo.coach}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Price</p>
                                        <p className="font-semibold">
                                            {classInfo?.price && Number(classInfo.price) > 0
                                                ? `$${typeof classInfo.price === 'number' ? classInfo.price.toFixed(2) : classInfo.price}`
                                                : 'Free'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Special Requests (optional)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                placeholder="Anything we should know — allergies, special accommodations, prior experience..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                maxLength={500}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Summary sidebar */}
                <div>
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Class</span>
                                    <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">{classInfo?.program || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Booked by</span>
                                    <span className="font-medium text-gray-900 truncate max-w-[60%]">{user?.name || user?.email || 'You'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Class Price</span>
                                    <span className="font-semibold">
                                        {classInfo?.price && Number(classInfo.price) > 0
                                            ? `$${typeof classInfo.price === 'number' ? classInfo.price.toFixed(2) : classInfo.price}`
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
                                        {classInfo?.price && Number(classInfo.price) > 0
                                            ? `$${typeof classInfo.price === 'number' ? classInfo.price.toFixed(2) : classInfo.price}`
                                            : 'Free'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <CreditCard className="w-4 h-4 inline mr-1" />
                                    Payment Method
                                </label>
                                <select
                                    id="select-user-book-class-payment-method"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="credit-card">Credit Card</option>
                                    <option value="bank-transfer">Bank Transfer</option>
                                    <option value="wallet">Wallet</option>
                                    <option value="cash">Cash on arrival</option>
                                </select>
                            </div>

                            <Button
                                id="user-book-class-confirm-btn"
                                onClick={handleBook}
                                disabled={isBooking}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold"
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default UserBookClassPage
