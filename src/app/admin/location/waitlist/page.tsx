'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Clock, CheckCircle, XCircle, AlertCircle,
    Plus, Edit2, Trash2, Eye, Filter, Search, Brain, Loader2, RefreshCw, Sparkles, TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LocationManagerService } from '@/services/locationManagerService'
import { smartSchedulerService, revenueIntelligenceService } from '@/services/advancedAIServices'

export default function LocationWaitlistPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [waitlistEntries, setWaitlistEntries] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [aiInsights, setAiInsights] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const loadAiWaitlistInsights = async () => {
        setAiLoading(true)
        try {
            const [autoFillRes, churnRes] = await Promise.allSettled([
                smartSchedulerService.predictAttendance({ classId: 'waitlist-analysis', date: new Date().toISOString() }),
                revenueIntelligenceService.getUpsellOpportunities()
            ])
            const autoFill = autoFillRes.status === 'fulfilled' ? autoFillRes.value?.data || autoFillRes.value : null
            const upsell = churnRes.status === 'fulfilled' ? churnRes.value?.data || churnRes.value : null
            setAiInsights({ autoFill, upsell })
        } catch (err) {
            console.error('AI waitlist insights unavailable:', err)
        } finally {
            setAiLoading(false)
        }
    }

    const fetchWaitlistEntries = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const statusParam = filterStatus !== 'all' ? filterStatus.toUpperCase() : undefined
            const result = await LocationManagerService.getWaitlist(page, 10, searchTerm || undefined, statusParam)
            setWaitlistEntries(result?.data || [])
            setTotalPages(result?.totalPages || 1)
        } catch (err: any) {
            console.error('Error fetching waitlist entries:', err)
            setError(err.message || 'Failed to fetch waitlist entries')
            setWaitlistEntries([])
        } finally {
            setIsLoading(false)
        }
    }, [page, searchTerm, filterStatus])

    useEffect(() => {
        fetchWaitlistEntries()
        loadAiWaitlistInsights()
    }, [fetchWaitlistEntries])

    const handleOfferSpot = async (entryId: string) => {
        try {
            await LocationManagerService.offerWaitlistSpot(entryId)
            fetchWaitlistEntries()
        } catch (err: any) {
            alert('Failed to offer spot: ' + err.message)
        }
    }

    const handleRemoveFromWaitlist = async (entryId: string) => {
        if (confirm('Are you sure you want to remove this entry from the waitlist?')) {
            try {
                await LocationManagerService.removeFromWaitlist(entryId)
                fetchWaitlistEntries()
            } catch (err: any) {
                alert('Failed to remove from waitlist: ' + err.message)
            }
        }
    }

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE': return 'bg-green-100 text-green-800'
            case 'OFFERED': return 'bg-blue-100 text-blue-800'
            case 'EXPIRED': return 'bg-red-100 text-red-800'
            case 'CANCELLED': return 'bg-gray-100 text-gray-800'
            case 'ENROLLED': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH': return 'bg-red-100 text-red-800'
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
            case 'LOW': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Compute summary from data
    const totalWaitlisted = waitlistEntries.length
    const activeEntries = waitlistEntries.filter(e => e.status?.toUpperCase() === 'ACTIVE').length
    const offeredEntries = waitlistEntries.filter(e => e.status?.toUpperCase() === 'OFFERED').length
    const expiredEntries = waitlistEntries.filter(e => e.status?.toUpperCase() === 'EXPIRED').length

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Waitlist Management</h1>
                    <p className="text-gray-600 mt-1">Manage class waitlists and student enrollment</p>
                </div>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Waitlist Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Total Waitlisted', value: totalWaitlisted, icon: Users, cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', titleColor: 'text-blue-700', valueColor: 'text-blue-900' },
                    { title: 'Active Entries', value: activeEntries, icon: Clock, cardBg: 'bg-gradient-to-br from-green-50 to-green-100', iconBg: 'bg-gradient-to-br from-green-500 to-green-600', titleColor: 'text-green-700', valueColor: 'text-green-900' },
                    { title: 'Spots Offered', value: offeredEntries, icon: CheckCircle, cardBg: 'bg-gradient-to-br from-orange-50 to-orange-100', iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600', titleColor: 'text-orange-700', valueColor: 'text-orange-900' },
                    { title: 'Expired Offers', value: expiredEntries, icon: XCircle, cardBg: 'bg-gradient-to-br from-red-50 to-red-100', iconBg: 'bg-gradient-to-br from-red-500 to-red-600', titleColor: 'text-red-700', valueColor: 'text-red-900' },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`${metric.cardBg} border-0 shadow-sm hover:shadow-lg transition-shadow`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${metric.titleColor}`}>{metric.title}</p>
                                        <p className={`text-2xl font-bold ${metric.valueColor} mt-2`}>{metric.value}</p>
                                    </div>
                                    <div className={`${metric.iconBg} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* AI Waitlist Insights */}
            <Card className="border-purple-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle className="text-base">AI Waitlist Intelligence</CardTitle>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                        </div>
                        <button onClick={loadAiWaitlistInsights} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {aiLoading ? (
                        <div className="flex items-center justify-center py-4 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">Analyzing waitlist patterns...</p>
                        </div>
                    ) : aiInsights ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-semibold text-blue-700 uppercase">Auto-Fill Suggestion</span>
                                </div>
                                <p className="text-sm font-medium text-blue-900">
                                    {aiInsights.autoFill?.insights || `${activeEntries} students can be auto-promoted based on AI analysis`}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    No-show rate: {Math.round((aiInsights.autoFill?.classNoShowRate || 0.15) * 100)}% - safe to overbook
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-semibold text-green-700 uppercase">Conversion Potential</span>
                                </div>
                                <p className="text-sm font-medium text-green-900">
                                    {aiInsights.upsell?.opportunities?.length || totalWaitlisted} upsell opportunities
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    {aiInsights.upsell?.message || 'Waitlisted students are high-intent leads'}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-semibold text-purple-700 uppercase">AI Action</span>
                                </div>
                                <p className="text-sm font-medium text-purple-900">
                                    {offeredEntries > 0 ? `${offeredEntries} spots already offered` : 'No pending offers'}
                                </p>
                                <p className="text-xs text-purple-600 mt-1">
                                    AI recommends offering spots to top {Math.min(activeEntries, 3)} priority students
                                </p>
                                <Badge className="mt-2 bg-purple-100 text-purple-700 text-xs">
                                    {aiInsights.autoFill?.aiPowered ? 'AI Active' : 'Fallback Mode'}
                                </Badge>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <Brain className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">AI waitlist analysis unavailable</p>
                            <button onClick={loadAiWaitlistInsights} className="mt-1 text-xs text-purple-600 hover:underline">Generate Insights</button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input placeholder="Search students or parents..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }} className="pl-10" />
                        </div>
                        <select id="select-admin-location-waitlist-1" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="offered">Offered</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Waitlist Entries */}
            <div className="space-y-4">
                {waitlistEntries.map((entry, idx) => (
                    <motion.div key={entry.id || entry._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{entry.studentName || 'N/A'}</h3>
                                            <Badge className={getStatusColor(entry.status)}>{entry.status || 'N/A'}</Badge>
                                            <Badge className={getPriorityColor(entry.priority)}>{entry.priority || 'N/A'}</Badge>
                                            <span className="text-sm text-gray-600">Position #{entry.position || 'N/A'}</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Parent</p>
                                                <p className="text-sm font-medium text-gray-900">{entry.parentName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Class</p>
                                                <p className="text-sm font-medium text-gray-900">{entry.className || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Time</p>
                                                <p className="text-sm font-medium text-gray-900">{entry.classTime || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Email</p>
                                                <p className="text-sm font-medium text-gray-900">{entry.parentEmail || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Phone</p>
                                                <p className="text-sm font-medium text-gray-900">{entry.parentPhone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Joined</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {entry.joinedDate ? new Date(entry.joinedDate).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        {entry.notes && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-600">Notes</p>
                                                <p className="text-sm text-gray-700">{entry.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {entry.status?.toUpperCase() === 'ACTIVE' && (
                                            <button id="admin-location-waitlist-btn" onClick={() => handleOfferSpot(entry.id || entry._id)}
                                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                                Offer Spot
                                            </button>
                                        )}
                                        <button id="admin-location-waitlist-btn-2" onClick={() => handleRemoveFromWaitlist(entry.id || entry._id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {waitlistEntries.length === 0 && !error && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No waitlist entries found</p>
                    </CardContent>
                </Card>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button id="admin-location-waitlist-btn-3" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Previous</button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button id="admin-location-waitlist-btn-4" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
                </div>
            )}
        </div>
    )
}
