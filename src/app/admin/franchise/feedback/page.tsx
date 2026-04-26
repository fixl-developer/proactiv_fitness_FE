'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    MessageSquare, Star, ThumbsUp, ThumbsDown, Search,
    Users, Calendar, Reply, Trash2, Eye, CheckCircle, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { FranchiseOwnerService } from '@/services/franchiseOwnerService'

export default function CustomerFeedbackPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRating, setFilterRating] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [feedback, setFeedback] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Modal states
    const [replyModal, setReplyModal] = useState<{ open: boolean; feedbackId: string; feedbackTitle: string }>({ open: false, feedbackId: '', feedbackTitle: '' })
    const [replyText, setReplyText] = useState('')
    const [replyLoading, setReplyLoading] = useState(false)

    const [viewModal, setViewModal] = useState<{ open: boolean; item: any | null }>({ open: false, item: null })

    const [deleteModal, setDeleteModal] = useState<{ open: boolean; feedbackId: string; feedbackTitle: string }>({ open: false, feedbackId: '', feedbackTitle: '' })
    const [deleteLoading, setDeleteLoading] = useState(false)

    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchFeedback = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const ratingParam = filterRating !== 'all' ? filterRating : undefined
            const statusParam = filterStatus !== 'all' ? filterStatus.toUpperCase() : undefined
            const result = await FranchiseOwnerService.getFeedback(page, 20, ratingParam, statusParam)
            setFeedback(result.data || [])
            setTotalPages(result.totalPages || 1)
        } catch (err: any) {
            setError(err.message || 'Failed to fetch feedback')
            setFeedback([])
        } finally {
            setIsLoading(false)
        }
    }, [page, filterRating, filterStatus])

    useEffect(() => {
        fetchFeedback()
    }, [fetchFeedback])

    // Client-side search filter
    const filteredFeedback = feedback.filter((item) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
            (item.title || '').toLowerCase().includes(term) ||
            (item.comment || '').toLowerCase().includes(term) ||
            (item.customerName || '').toLowerCase().includes(term) ||
            (item.program || '').toLowerCase().includes(term)
        )
    })

    // Stats computed from current data
    const avgRating = feedback.length > 0
        ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length).toFixed(1)
        : '0.0'
    const publishedCount = feedback.filter(f => f.status === 'PUBLISHED').length
    const pendingCount = feedback.filter(f => f.status === 'PENDING').length

    const ratingDistribution = [
        { rating: '5 Stars', count: feedback.filter(f => f.rating === 5).length },
        { rating: '4 Stars', count: feedback.filter(f => f.rating === 4).length },
        { rating: '3 Stars', count: feedback.filter(f => f.rating === 3).length },
        { rating: '2 Stars', count: feedback.filter(f => f.rating === 2).length },
        { rating: '1 Star', count: feedback.filter(f => f.rating === 1).length },
    ]

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#dc2626']

    // Action handlers
    const handlePublish = async (id: string) => {
        try {
            setActionLoading(id)
            await FranchiseOwnerService.publishFeedback(id)
            await fetchFeedback()
        } catch (err: any) {
            setError(err.message || 'Failed to publish feedback')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return
        try {
            setReplyLoading(true)
            await FranchiseOwnerService.replyToFeedback(replyModal.feedbackId, replyText.trim())
            setReplyModal({ open: false, feedbackId: '', feedbackTitle: '' })
            setReplyText('')
            await fetchFeedback()
        } catch (err: any) {
            setError(err.message || 'Failed to reply to feedback')
        } finally {
            setReplyLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            setDeleteLoading(true)
            await FranchiseOwnerService.deleteFeedback(deleteModal.feedbackId)
            setDeleteModal({ open: false, feedbackId: '', feedbackTitle: '' })
            await fetchFeedback()
        } catch (err: any) {
            setError(err.message || 'Failed to delete feedback')
        } finally {
            setDeleteLoading(false)
        }
    }

    const renderStars = (rating: number) => (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    )

    if (isLoading && feedback.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 text-sm">Loading feedback...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Customer Feedback</h1>
                    <p className="text-gray-600 mt-1">Reviews and ratings management</p>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4 pb-4 flex items-center justify-between">
                        <p className="text-sm text-red-800">{error}</p>
                        <button id="admin-franchise-feedback-btn-dismiss"
                            onClick={() => setError(null)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Dismiss
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Average Rating',
                        value: `${avgRating}/5.0`,
                        icon: Star,
                        gradient: 'from-yellow-50 to-yellow-100',
                        iconGradient: 'from-yellow-500 to-yellow-600',
                    },
                    {
                        title: 'Total Reviews',
                        value: feedback.length.toString(),
                        icon: MessageSquare,
                        gradient: 'from-blue-50 to-blue-100',
                        iconGradient: 'from-blue-500 to-blue-600',
                    },
                    {
                        title: 'Published',
                        value: publishedCount.toString(),
                        icon: CheckCircle,
                        gradient: 'from-green-50 to-green-100',
                        iconGradient: 'from-green-500 to-green-600',
                    },
                    {
                        title: 'Pending Review',
                        value: pendingCount.toString(),
                        icon: Calendar,
                        gradient: 'from-orange-50 to-orange-100',
                        iconGradient: 'from-orange-500 to-orange-600',
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`bg-gradient-to-br ${metric.gradient} border-0`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`bg-gradient-to-br ${metric.iconGradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Rating Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={ratingDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ rating, count }) => `${rating}: ${count}`}
                                    outerRadius={80}
                                    dataKey="count"
                                >
                                    {ratingDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rating Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {ratingDistribution.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < parseInt(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 transition-all duration-300"
                                            style={{ width: feedback.length > 0 ? `${(item.count / feedback.length) * 100}%` : '0%' }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 w-8 text-right">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search feedback..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            id="select-admin-franchise-feedback-1"
                            value={filterRating}
                            onChange={(e) => { setFilterRating(e.target.value); setPage(1) }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                        <select
                            id="select-admin-franchise-feedback-2"
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Feedback List */}
            {filteredFeedback.length === 0 && !isLoading ? (
                <Card>
                    <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No feedback found</h3>
                        <p className="text-gray-500 text-sm">
                            {searchTerm || filterRating !== 'all' || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'No customer feedback has been submitted yet.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredFeedback.map((item, idx) => (
                        <motion.div
                            key={item.id || idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                                <Badge variant={item.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                                    {item.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                {renderStars(item.rating)}
                                                <span className="text-sm text-gray-600 ml-2">{item.rating}/5</span>
                                            </div>
                                            <p className="text-gray-700 mb-2">{item.comment}</p>
                                            {item.reply && (
                                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2">
                                                    <p className="text-sm text-blue-800"><span className="font-semibold">Reply:</span> {item.reply}</p>
                                                </div>
                                            )}
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                <span>By: {item.customerName}</span>
                                                {item.program && <span>Program: {item.program}</span>}
                                                {item.date && <span>Date: {item.date}</span>}
                                            </div>
                                            <div className="flex gap-4 mt-3">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <ThumbsUp className="w-4 h-4 text-green-600" />
                                                    <span className="text-gray-600">{item.helpful || 0} helpful</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <ThumbsDown className="w-4 h-4 text-red-600" />
                                                    <span className="text-gray-600">{item.unhelpful || 0} unhelpful</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {item.status === 'PENDING' && (
                                                <button id="admin-franchise-feedback-btn"
                                                    onClick={() => handlePublish(item.id)}
                                                    disabled={actionLoading === item.id}
                                                    className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors disabled:opacity-50"
                                                    title="Publish"
                                                >
                                                    {actionLoading === item.id ? (
                                                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                            <button id="admin-franchise-feedback-btn-2"
                                                onClick={() => {
                                                    setReplyModal({ open: true, feedbackId: item.id, feedbackTitle: item.title || 'Feedback' })
                                                    setReplyText('')
                                                }}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                title="Reply"
                                            >
                                                <Reply className="w-4 h-4" />
                                            </button>
                                            <button id="admin-franchise-feedback-btn-3"
                                                onClick={() => setViewModal({ open: true, item })}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button id="admin-franchise-feedback-btn-4"
                                                onClick={() => setDeleteModal({ open: true, feedbackId: item.id, feedbackTitle: item.title || 'Feedback' })}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button id="admin-franchise-feedback-btn-5"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button id="admin-franchise-feedback-btn-6"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Reply Drawer */}
            <SlideInDrawer
                isOpen={replyModal.open}
                onClose={() => setReplyModal({ open: false, feedbackId: '', feedbackTitle: '' })}
                title="Reply to Feedback"
                description={replyModal.feedbackTitle}
                size="md"
                footer={
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setReplyModal({ open: false, feedbackId: '', feedbackTitle: '' })}
                            disabled={replyLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReplySubmit}
                            disabled={replyLoading || !replyText.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {replyLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Send Reply
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        rows={6}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>
            </SlideInDrawer>

            {/* View Detail Drawer */}
            <SlideInDrawer
                isOpen={viewModal.open && !!viewModal.item}
                onClose={() => setViewModal({ open: false, item: null })}
                title="Feedback Details"
                description={viewModal.item?.title}
                size="md"
                footer={
                    <Button
                        variant="outline"
                        onClick={() => setViewModal({ open: false, item: null })}
                        className="w-full"
                    >
                        Close
                    </Button>
                }
            >
                {viewModal.item && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">{viewModal.item.title}</h3>
                            <Badge variant={viewModal.item.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                {viewModal.item.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderStars(viewModal.item.rating)}
                            <span className="text-sm text-gray-600">{viewModal.item.rating}/5</span>
                        </div>
                        <p className="text-gray-700">{viewModal.item.comment}</p>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">Customer:</span> {viewModal.item.customerName}</p>
                            {viewModal.item.email && <p><span className="font-medium">Email:</span> {viewModal.item.email}</p>}
                            {viewModal.item.program && <p><span className="font-medium">Program:</span> {viewModal.item.program}</p>}
                            {viewModal.item.date && <p><span className="font-medium">Date:</span> {viewModal.item.date}</p>}
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1 text-sm">
                                <ThumbsUp className="w-4 h-4 text-green-600" />
                                <span>{viewModal.item.helpful || 0} helpful</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <ThumbsDown className="w-4 h-4 text-red-600" />
                                <span>{viewModal.item.unhelpful || 0} unhelpful</span>
                            </div>
                        </div>
                        {viewModal.item.reply && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                <p className="text-sm font-semibold text-blue-800 mb-1">Admin Reply</p>
                                <p className="text-sm text-blue-700">{viewModal.item.reply}</p>
                            </div>
                        )}
                    </div>
                )}
            </SlideInDrawer>

            {/* Delete Confirmation Drawer */}
            <SlideInDrawer
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, feedbackId: '', feedbackTitle: '' })}
                title="Delete Feedback"
                description={`Permanently remove "${deleteModal.feedbackTitle}"`}
                size="sm"
                footer={
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModal({ open: false, feedbackId: '', feedbackTitle: '' })}
                            disabled={deleteLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                Are you sure you want to delete this feedback?
                            </p>
                            <p className="text-sm text-gray-500 mt-1 font-medium">
                                &quot;{deleteModal.feedbackTitle}&quot;
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>
            </SlideInDrawer>
        </div>
    )
}
