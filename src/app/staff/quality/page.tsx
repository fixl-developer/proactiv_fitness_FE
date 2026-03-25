'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import {
    AlertCircle,
    CheckCircle,
    Star,
    Zap,
    Target,
    Heart,
    ClipboardCheck,
    Loader2,
} from 'lucide-react'

interface QualityMetrics {
    overallScore: number
    responseTime: number
    resolutionRate: number
    customerSatisfaction: number
    qualityChecks: number
    passedChecks: number
}

interface QualityReview {
    id: string
    ticket: string
    score: number
    status: 'passed' | 'needs-improvement' | 'failed'
    reviewer: string
    date: string
    feedback: string
}

export default function Quality() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<QualityMetrics | null>(null)
    const [reviews, setReviews] = useState<QualityReview[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadData = async () => {
            setLoading(true)
            setError(null)
            try {
                const [metricsData, reviewsData] = await Promise.all([
                    supportStaffService.getQualityMetrics(),
                    supportStaffService.getQualityReviews(),
                ])
                setMetrics(metricsData)
                setReviews(reviewsData?.reviews || [])
            } catch (err: any) {
                setError(err?.message || 'Failed to load quality data')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [isAuthenticated, router])

    if (!isAuthenticated) return null

    const passRate =
        metrics && metrics.qualityChecks > 0
            ? ((metrics.passedChecks / metrics.qualityChecks) * 100).toFixed(1)
            : '0.0'

    // Score distribution counts
    const passedCount = reviews.filter((r) => r.status === 'passed').length
    const needsImprovementCount = reviews.filter((r) => r.status === 'needs-improvement').length
    const failedCount = reviews.filter((r) => r.status === 'failed').length
    const totalReviews = reviews.length
    const passedPct = totalReviews > 0 ? (passedCount / totalReviews) * 100 : 0
    const needsImprovementPct = totalReviews > 0 ? (needsImprovementCount / totalReviews) * 100 : 0
    const failedPct = totalReviews > 0 ? (failedCount / totalReviews) * 100 : 0

    const getScoreBadgeColor = (score: number) => {
        if (score >= 4) return 'bg-gradient-to-br from-green-500 to-green-600'
        if (score >= 3) return 'bg-gradient-to-br from-yellow-500 to-yellow-600'
        if (score >= 2) return 'bg-gradient-to-br from-orange-500 to-orange-600'
        return 'bg-gradient-to-br from-red-500 to-red-600'
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'passed':
                return 'bg-green-100 text-green-800'
            case 'needs-improvement':
                return 'bg-yellow-100 text-yellow-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'passed':
                return 'Passed'
            case 'needs-improvement':
                return 'Needs Improvement'
            case 'failed':
                return 'Failed'
            default:
                return status
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Quality Assurance</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">Loading quality data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                            {/* Overall Score */}
                            <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                        <Star className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Overall Score</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {metrics?.overallScore?.toFixed(1) ?? '0.0'} / 5.0
                                </p>
                            </div>

                            {/* Response Time */}
                            <div className="rounded-xl border-0 bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-2.5 rounded-lg shadow-md">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Response Time</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {metrics?.responseTime ?? 0} min
                                </p>
                            </div>

                            {/* Resolution Rate */}
                            <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                        <Target className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Resolution Rate</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {metrics?.resolutionRate?.toFixed(1) ?? '0.0'}%
                                </p>
                            </div>

                            {/* Customer Satisfaction */}
                            <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                        <Heart className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Customer Satisfaction</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {metrics?.customerSatisfaction?.toFixed(1) ?? '0.0'} / 5.0
                                </p>
                            </div>

                            {/* Quality Checks */}
                            <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                        <ClipboardCheck className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Quality Checks</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {metrics?.qualityChecks ?? 0}
                                </p>
                            </div>

                            {/* Pass Rate */}
                            <div className="rounded-xl border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-lg shadow-md">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">Pass Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{passRate}%</p>
                            </div>
                        </div>

                        {/* Score Distribution */}
                        {totalReviews > 0 && (
                            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Score Distribution
                                </h2>
                                <div className="flex items-center gap-4 mb-3">
                                    <span className="text-sm text-gray-600 w-36">
                                        Passed ({passedCount})
                                    </span>
                                    <span className="text-sm text-gray-600 w-36">
                                        Needs Improvement ({needsImprovementCount})
                                    </span>
                                    <span className="text-sm text-gray-600 w-36">
                                        Failed ({failedCount})
                                    </span>
                                </div>
                                <div className="w-full h-6 rounded-full overflow-hidden flex bg-gray-100">
                                    {passedPct > 0 && (
                                        <div
                                            className="bg-gradient-to-r from-green-400 to-green-500 h-full transition-all duration-500"
                                            style={{ width: `${passedPct}%` }}
                                            title={`Passed: ${passedPct.toFixed(1)}%`}
                                        />
                                    )}
                                    {needsImprovementPct > 0 && (
                                        <div
                                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full transition-all duration-500"
                                            style={{ width: `${needsImprovementPct}%` }}
                                            title={`Needs Improvement: ${needsImprovementPct.toFixed(1)}%`}
                                        />
                                    )}
                                    {failedPct > 0 && (
                                        <div
                                            className="bg-gradient-to-r from-red-400 to-red-500 h-full transition-all duration-500"
                                            style={{ width: `${failedPct}%` }}
                                            title={`Failed: ${failedPct.toFixed(1)}%`}
                                        />
                                    )}
                                </div>
                                <div className="flex items-center gap-6 mt-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span className="text-xs text-gray-600">
                                            Passed {passedPct.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <span className="text-xs text-gray-600">
                                            Needs Improvement {needsImprovementPct.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <span className="text-xs text-gray-600">
                                            Failed {failedPct.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quality Reviews Table */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Quality Reviews
                                </h2>
                            </div>
                            {reviews.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    No quality reviews found.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">
                                                    Review ID
                                                </th>
                                                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">
                                                    Ticket
                                                </th>
                                                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">
                                                    Score
                                                </th>
                                                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">
                                                    Status
                                                </th>
                                                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">
                                                    Reviewer
                                                </th>
                                                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">
                                                    Date
                                                </th>
                                                <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">
                                                    Feedback
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reviews.map((review) => (
                                                <tr
                                                    key={review.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="py-3 px-6 text-sm text-gray-500 font-mono">
                                                        {review.id}
                                                    </td>
                                                    <td className="py-3 px-6 text-sm text-blue-600 font-medium">
                                                        {review.ticket}
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <div
                                                            className={`w-10 h-10 rounded-full ${getScoreBadgeColor(review.score)} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
                                                        >
                                                            {review.score}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(review.status)}`}
                                                        >
                                                            {getStatusLabel(review.status)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-6 text-sm text-gray-600">
                                                        {review.reviewer}
                                                    </td>
                                                    <td className="py-3 px-6 text-sm text-gray-600">
                                                        {review.date}
                                                    </td>
                                                    <td className="py-3 px-6 text-sm text-gray-600 max-w-xs truncate">
                                                        {review.feedback}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
