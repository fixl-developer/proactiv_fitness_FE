'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import GrowthAnalyticsService, { AcquisitionChannel } from '@/services/modules/growth-analytics.service'
import { motion } from 'framer-motion'
import { Users, AlertCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AcquisitionPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [channels, setChannels] = useState<AcquisitionChannel[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadAcquisitionData()
    }, [isAuthenticated, router])

    const loadAcquisitionData = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await GrowthAnalyticsService.getUserAcquisition('30d')
            setChannels(response)
        } catch (err) {
            console.error('Error loading acquisition data:', err)
            setError('Failed to load acquisition data')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading acquisition data...</p>
                </div>
            </div>
        )
    }

    const totalUsers = channels.reduce((sum, ch) => sum + ch.users, 0)
    const totalCost = channels.reduce((sum, ch) => sum + ch.cost, 0)
    const avgROI = channels.length > 0 ? (channels.reduce((sum, ch) => sum + ch.roi, 0) / channels.length).toFixed(1) : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">User Acquisition</h1>
                        <p className="text-gray-600">Analyze acquisition channels and ROI</p>
                    </div>
                    <Button data-testid="btn-router-marketing-growth-acquisition" onClick={() => router.push('/marketing/growth')} variant="outline">
                        Back to Overview
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Users Acquired</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{totalUsers.toLocaleString()}</div>
                            <p className="text-xs text-green-600 mt-2">+18% from last month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Acquisition Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">${totalCost.toLocaleString()}</div>
                            <p className="text-xs text-red-600 mt-2">-5% from last month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Average ROI</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{avgROI}%</div>
                            <p className="text-xs text-green-600 mt-2">+12% from last month</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Acquisition Channels
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {channels.map((channel, idx) => {
                                const percentage = (channel.users / totalUsers) * 100
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                                            <span className="text-sm font-bold text-blue-600">{percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="bg-blue-600 h-full rounded-full"
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Users</p>
                                                <p className="font-bold text-gray-900">{channel.users.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Cost</p>
                                                <p className="font-bold text-gray-900">${channel.cost.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">ROI</p>
                                                <p className={`font-bold ${channel.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {channel.roi > 0 ? '+' : ''}{channel.roi}%
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performing Channel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {channels.length > 0 && (
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Best ROI</p>
                                    <p className="text-2xl font-bold text-green-600 mb-2">
                                        {channels.reduce((max, ch) => ch.roi > max.roi ? ch : max).name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        ROI: {channels.reduce((max, ch) => ch.roi > max.roi ? ch : max).roi}%
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cost Per Acquisition</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {channels.map((channel, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-sm font-medium text-gray-700">{channel.name}</span>
                                        <span className="font-bold text-gray-900">${(channel.cost / channel.users).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
