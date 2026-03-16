'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useLocalStorage } from '@/hooks/useClientOnly'
import { EnhancedBookingService, MakeupCredit } from '@/services/enhancedBookingService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, Gift, Calendar, DollarSign, CheckCircle } from 'lucide-react'

const MakeupCreditsPage = () => {
    const router = useRouter()
    const [credits, setCredits] = useState<MakeupCredit[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [totalCredits, setTotalCredits] = useState(0)

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

    // Load makeup credits
    useEffect(() => {
        const loadCredits = async () => {
            try {
                setIsLoading(true)
                const bookingService = new EnhancedBookingService()
                const creditsData = await bookingService.getMyMakeupCredits()
                setCredits(creditsData)

                // Calculate total available credits
                const total = creditsData
                    .filter(c => !c.usedAt)
                    .reduce((sum, c) => sum + c.amount, 0)
                setTotalCredits(total)
            } catch (err: any) {
                setError(err.message || 'Failed to load makeup credits')
            } finally {
                setIsLoading(false)
            }
        }

        loadCredits()
    }, [])

    const handleUseCredit = (creditId: string) => {
        router.push(`/parent/browse-classes?useCredit=${creditId}`)
    }

    const isExpired = (expiryDate: string) => {
        return new Date(expiryDate) < new Date()
    }

    const isExpiringSoon = (expiryDate: string) => {
        const daysUntilExpiry = Math.ceil(
            (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0
    }

    const getDaysUntilExpiry = (expiryDate: string) => {
        return Math.ceil(
            (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
    }

    if (isLoading) {
        return (
            <DashboardLayout userRole="parent" userName={userName} userEmail={userEmail}>
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading makeup credits...</p>
                </div>
            </DashboardLayout>
        )
    }

    const availableCredits = credits.filter(c => !c.usedAt && !isExpired(c.expiryDate))
    const usedCredits = credits.filter(c => c.usedAt)
    const expiredCredits = credits.filter(c => !c.usedAt && isExpired(c.expiryDate))

    return (
        <DashboardLayout userRole="parent" userName={userName} userEmail={userEmail}>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Makeup Credits</h1>
                    <p className="text-gray-600 mt-2">Use your makeup credits for missed classes</p>
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

                {/* Total Credits Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Available Credits</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">
                                        ${totalCredits.toFixed(2)}
                                    </p>
                                </div>
                                <Gift className="w-12 h-12 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">Used Credits</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">
                                        ${usedCredits.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                                    </p>
                                </div>
                                <CheckCircle className="w-12 h-12 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-700 font-medium">Expired Credits</p>
                                    <p className="text-3xl font-bold text-red-600 mt-2">
                                        ${expiredCredits.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
                                    </p>
                                </div>
                                <AlertCircle className="w-12 h-12 text-red-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Available Credits */}
                {availableCredits.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Credits</h2>
                        <div className="space-y-3">
                            {availableCredits.map((credit, index) => (
                                <motion.div
                                    key={credit._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className={`hover:shadow-md transition-shadow ${isExpiringSoon(credit.expiryDate) ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                                        <CardContent className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            ${credit.amount.toFixed(2)} Credit
                                                        </h3>
                                                        {isExpiringSoon(credit.expiryDate) && (
                                                            <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                                                Expiring Soon
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>
                                                                Expires: {new Date(credit.expiryDate).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                        {credit.originalBookingId && (
                                                            <div className="flex items-center gap-2">
                                                                <span>From: {credit.originalBookingId}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isExpiringSoon(credit.expiryDate) && (
                                                        <p className="text-sm text-yellow-700 font-medium mt-2">
                                                            Expires in {getDaysUntilExpiry(credit.expiryDate)} days
                                                        </p>
                                                    )}
                                                </div>

                                                <Button
                                                    onClick={() => handleUseCredit(credit._id)}
                                                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:from-green-700 hover:to-emerald-700"
                                                >
                                                    Use Credit
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Used Credits */}
                {usedCredits.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Used Credits</h2>
                        <div className="space-y-3">
                            {usedCredits.map((credit, index) => (
                                <motion.div
                                    key={credit._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="opacity-75">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        ${credit.amount.toFixed(2)} Credit
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Used on: {credit.usedAt ? new Date(credit.usedAt).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                                <CheckCircle className="w-6 h-6 text-green-600" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Expired Credits */}
                {expiredCredits.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Expired Credits</h2>
                        <div className="space-y-3">
                            {expiredCredits.map((credit, index) => (
                                <motion.div
                                    key={credit._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="opacity-50 border-red-200">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        ${credit.amount.toFixed(2)} Credit
                                                    </h3>
                                                    <p className="text-sm text-red-600 mt-1">
                                                        Expired on: {new Date(credit.expiryDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <AlertCircle className="w-6 h-6 text-red-600" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {credits.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Makeup Credits</h3>
                            <p className="text-gray-600 mb-4">
                                You don't have any makeup credits yet. When you miss a class, you'll receive a makeup credit that you can use for any available session.
                            </p>
                            <Button onClick={() => router.push('/parent/browse-classes')}>
                                Browse Classes
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}

export default MakeupCreditsPage
