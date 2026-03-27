'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader, Gift, Calendar, CheckCircle, RefreshCw, XCircle, ArrowRight, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'

interface CreditSummary {
    available: number
    used: number
    expired: number
}

interface CreditItem {
    id: string
    amount?: number
    reason?: string
    expiryDate?: string
    usedAt?: string
    usedFor?: string
    originalBookingId?: string
    [key: string]: any
}

const MakeupCreditsPage = () => {
    const router = useRouter()
    const [summary, setSummary] = useState<CreditSummary>({ available: 0, used: 0, expired: 0 })
    const [availableCredits, setAvailableCredits] = useState<CreditItem[]>([])
    const [usedCredits, setUsedCredits] = useState<CreditItem[]>([])
    const [expiredCredits, setExpiredCredits] = useState<CreditItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const { user, isAuthenticated } = useAuth()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadCredits()
    }, [isAuthenticated, router])

    const loadCredits = async () => {
        try {
            setIsLoading(true)
            setError('')
            const response = await apiClient.get<any>('/parent/makeup-credits')
            const data = response?.data || response || {}

            // data.summary has { available, used, expired }
            setSummary(data.summary || { available: 0, used: 0, expired: 0 })

            // data.credits has { available[], used[], expired[] }
            const credits = data.credits || {}
            setAvailableCredits(Array.isArray(credits.available) ? credits.available : [])
            setUsedCredits(Array.isArray(credits.used) ? credits.used : [])
            setExpiredCredits(Array.isArray(credits.expired) ? credits.expired : [])
        } catch (err: any) {
            console.error('Error loading makeup credits:', err)
            setError(err.message || 'Failed to load makeup credits')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUseCredit = () => {
        router.push('/parent/browse-classes')
    }

    const handleRetry = () => {
        loadCredits()
    }

    const hasNoCredits = availableCredits.length === 0 && usedCredits.length === 0 && expiredCredits.length === 0

    const summaryCards = [
        {
            label: 'Available Credits',
            value: summary.available,
            icon: Gift,
            gradient: 'from-green-500 to-emerald-600',
            bgLight: 'from-green-50 to-emerald-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-700',
            valueColor: 'text-white',
            iconBg: 'bg-green-400/30',
        },
        {
            label: 'Used Credits',
            value: summary.used,
            icon: CheckCircle,
            gradient: 'from-blue-500 to-cyan-600',
            bgLight: 'from-blue-50 to-cyan-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            valueColor: 'text-white',
            iconBg: 'bg-blue-400/30',
        },
        {
            label: 'Expired Credits',
            value: summary.expired,
            icon: XCircle,
            gradient: 'from-red-500 to-rose-600',
            bgLight: 'from-red-50 to-rose-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-700',
            valueColor: 'text-white',
            iconBg: 'bg-red-400/30',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-3xl font-bold text-gray-900">Makeup Credits</h1>
                <p className="text-gray-600 mt-2">Use your makeup credits for missed classes</p>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                >
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading makeup credits...</p>
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

            {/* Summary Cards */}
            {!isLoading && !error && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {summaryCards.map((card, index) => {
                            const Icon = card.icon
                            return (
                                <motion.div
                                    key={card.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                >
                                    <Card className={`overflow-hidden bg-gradient-to-br ${card.gradient} border-0 shadow-lg`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-white/80">{card.label}</p>
                                                    <p className={`text-4xl font-bold ${card.valueColor} mt-2`}>
                                                        {card.value}
                                                    </p>
                                                </div>
                                                <div className={`w-14 h-14 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                                                    <Icon className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Empty State - No Credits At All */}
                    {hasNoCredits && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Makeup Credits</h3>
                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                        You don't have any makeup credits yet. When you miss a class, you'll receive a makeup credit that you can use for any available session.
                                    </p>
                                    <Button
                                        id="parent-makeup-credits-browse-btn"
                                        onClick={() => router.push('/parent/browse-classes')}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Browse Classes
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Available Credits */}
                    {availableCredits.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-green-600" />
                                Available Credits
                                <Badge className="bg-green-100 text-green-700 ml-2">{availableCredits.length}</Badge>
                            </h2>
                            <div className="space-y-3">
                                {availableCredits.map((credit, index) => (
                                    <motion.div
                                        key={credit.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
                                    >
                                        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {credit.reason || 'Makeup Credit'}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                                            {credit.expiryDate && (
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>
                                                                        Expires: {new Date(credit.expiryDate).toLocaleDateString('en-US', {
                                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {credit.originalBookingId && (
                                                                <span className="text-gray-400">From: {credit.originalBookingId}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        id={`parent-makeup-credits-use-${credit.id}-btn`}
                                                        onClick={handleUseCredit}
                                                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:from-green-700 hover:to-emerald-700"
                                                    >
                                                        Use Credit
                                                        <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Used Credits */}
                    {usedCredits.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                Used Credits
                                <Badge className="bg-blue-100 text-blue-700 ml-2">{usedCredits.length}</Badge>
                            </h2>
                            <div className="space-y-3">
                                {usedCredits.map((credit, index) => (
                                    <motion.div
                                        key={credit.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.08, duration: 0.3 }}
                                    >
                                        <Card className="opacity-75 border-l-4 border-l-blue-400">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {credit.reason || 'Makeup Credit'}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                                            {credit.usedAt && (
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>Used: {new Date(credit.usedAt).toLocaleDateString('en-US', {
                                                                        month: 'short', day: 'numeric', year: 'numeric'
                                                                    })}</span>
                                                                </div>
                                                            )}
                                                            {credit.usedFor && (
                                                                <span>For: {credit.usedFor}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Expired Credits */}
                    {expiredCredits.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-500" />
                                Expired Credits
                                <Badge className="bg-red-100 text-red-700 ml-2">{expiredCredits.length}</Badge>
                            </h2>
                            <div className="space-y-3">
                                {expiredCredits.map((credit, index) => (
                                    <motion.div
                                        key={credit.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.08, duration: 0.3 }}
                                    >
                                        <Card className="opacity-50 border-l-4 border-l-red-400">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-700">
                                                            {credit.reason || 'Makeup Credit'}
                                                        </h3>
                                                        <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>
                                                                Expired: {credit.expiryDate
                                                                    ? new Date(credit.expiryDate).toLocaleDateString('en-US', {
                                                                        month: 'short', day: 'numeric', year: 'numeric'
                                                                    })
                                                                    : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    )
}

export default MakeupCreditsPage
