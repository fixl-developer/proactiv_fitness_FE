'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService, CustomerInquiry } from '@/services/supportStaffService'
import {
    MessageSquare,
    Inbox,
    Clock,
    CheckCircle,
    Search,
    Filter,
    Send,
    Eye,
    X,
    AlertCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { validateTextArea, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'

const STATUS_OPTIONS = ['new', 'in-progress', 'resolved', 'closed'] as const
const TYPE_OPTIONS = ['general', 'billing', 'technical', 'complaint', 'suggestion'] as const

const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
}

const typeColors: Record<string, string> = {
    general: 'bg-slate-100 text-slate-800',
    billing: 'bg-amber-100 text-amber-800',
    technical: 'bg-cyan-100 text-cyan-800',
    complaint: 'bg-red-100 text-red-800',
    suggestion: 'bg-teal-100 text-teal-800',
}

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
}

export default function CustomerInquiries() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [inquiries, setInquiries] = useState<CustomerInquiry[]>([])
    const [total, setTotal] = useState(0)
    const [pages, setPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')

    // Modals
    const [respondModal, setRespondModal] = useState<CustomerInquiry | null>(null)
    const [viewModal, setViewModal] = useState<CustomerInquiry | null>(null)
    const [statusModal, setStatusModal] = useState<CustomerInquiry | null>(null)

    // Respond form
    const [responseMessage, setResponseMessage] = useState('')
    const [isInternal, setIsInternal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [responseError, setResponseError] = useState('')

    // Status update
    const [newStatus, setNewStatus] = useState('')

    const loadInquiries = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const filters: any = {}
            if (searchQuery) filters.search = searchQuery
            if (statusFilter) filters.status = statusFilter
            if (typeFilter) filters.type = typeFilter
            filters.page = currentPage

            const data = await supportStaffService.getInquiries(filters)
            setInquiries(data?.inquiries || [])
            setTotal(data?.total || 0)
            setPages(data?.pages || 1)
        } catch {
            setInquiries([])
            setTotal(0)
            setPages(1)
        } finally {
            setLoading(false)
        }
    }, [searchQuery, statusFilter, typeFilter, currentPage])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadInquiries()
    }, [isAuthenticated, router, loadInquiries])

    // Stats
    const totalInquiries = total || inquiries.length
    const newCount = inquiries.filter((i) => i.status === 'new').length
    const inProgressCount = inquiries.filter((i) => i.status === 'in-progress').length
    const resolvedCount = inquiries.filter((i) => i.status === 'resolved').length

    const handleRespond = async () => {
        if (!respondModal) return
        const err = validateTextArea(responseMessage, 'Response', 1, 5000)
        if (err) { setResponseError(err); return }
        setResponseError('')
        setSubmitting(true)
        try {
            await supportStaffService.respondToInquiry(respondModal.id, responseMessage.trim(), isInternal)
            setRespondModal(null)
            setResponseMessage('')
            setIsInternal(false)
            loadInquiries()
        } catch {
            setError('Failed to send response. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleStatusUpdate = async () => {
        if (!statusModal || !newStatus) return
        setSubmitting(true)
        try {
            await supportStaffService.updateInquiry(statusModal.id, { status: newStatus as CustomerInquiry['status'] })
            setStatusModal(null)
            setNewStatus('')
            loadInquiries()
        } catch {
            setError('Failed to update status. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Customer Inquiries</h1>
                        <p className="text-gray-500 mt-1">Manage and respond to customer inquiries</p>
                    </div>
                    <button
                        onClick={loadInquiries}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-red-800">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Total Inquiries */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                <MessageSquare className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Inquiries</p>
                        <p className="text-2xl font-bold text-gray-900">{totalInquiries}</p>
                    </div>

                    {/* New */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                <Inbox className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">New</p>
                        <p className="text-2xl font-bold text-gray-900">{newCount}</p>
                    </div>

                    {/* In Progress */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">In Progress</p>
                        <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                    </div>

                    {/* Resolved */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Resolved</p>
                        <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or subject..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white min-w-[160px]"
                            >
                                <option value="">All Statuses</option>
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white min-w-[160px]"
                            >
                                <option value="">All Types</option>
                                {TYPE_OPTIONS.map((t) => (
                                    <option key={t} value={t}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Inquiries Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading inquiries...</p>
                        </div>
                    </div>
                ) : inquiries.length === 0 ? (
                    <div className="text-center py-16">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-1">No inquiries found</h3>
                        <p className="text-gray-400 text-sm">Try adjusting your filters or search query.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {inquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border border-gray-100"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <h3 className="font-semibold text-gray-900 truncate">{inquiry.subject}</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">{inquiry.customerName}</p>
                                            <p className="text-xs text-gray-400">{inquiry.customerEmail}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${priorityColors[inquiry.priority] || 'bg-gray-100 text-gray-700'}`}>
                                            {inquiry.priority}
                                        </span>
                                    </div>

                                    {/* Message preview */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{inquiry.message}</p>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[inquiry.type] || 'bg-gray-100 text-gray-700'}`}>
                                            {inquiry.type}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[inquiry.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {inquiry.status}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => setViewModal(inquiry)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => {
                                                setRespondModal(inquiry)
                                                setResponseMessage('')
                                                setIsInternal(false)
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            Respond
                                        </button>
                                        <button
                                            onClick={() => {
                                                setStatusModal(inquiry)
                                                setNewStatus(inquiry.status)
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Status
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-gray-600 px-3">
                                    Page {currentPage} of {pages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                                    disabled={currentPage === pages}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ===== RESPOND MODAL ===== */}
            {respondModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRespondModal(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Respond to Inquiry</h2>
                            <button
                                onClick={() => setRespondModal(null)}
                                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Inquiry Details */}
                        <div className="p-6 bg-gray-50 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-1">{respondModal.subject}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                                From: {respondModal.customerName} ({respondModal.customerEmail})
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-3">{respondModal.message}</p>
                            <div className="flex gap-2 mt-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[respondModal.status]}`}>
                                    {respondModal.status}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[respondModal.type]}`}>
                                    {respondModal.type}
                                </span>
                            </div>
                        </div>

                        {/* Response Form */}
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
                            <textarea
                                value={responseMessage}
                                onChange={(e) => {
                                    setResponseMessage(e.target.value)
                                    const err = validateTextArea(e.target.value, 'Response', 1, 5000)
                                    setResponseError(err || '')
                                }}
                                placeholder="Type your response here..."
                                rows={5}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none ${responseError ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.message} error={responseError} />

                            <label className="flex items-center gap-2 mt-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isInternal}
                                    onChange={(e) => setIsInternal(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-600">Internal Note</span>
                                <span className="text-xs text-gray-400">(not visible to customer)</span>
                            </label>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setRespondModal(null)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRespond}
                                    disabled={submitting || !responseMessage.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    {submitting ? 'Sending...' : 'Send Response'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== VIEW MODAL ===== */}
            {viewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewModal(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
                            <button
                                onClick={() => setViewModal(null)}
                                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Inquiry Info */}
                        <div className="p-6">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[viewModal.status]}`}>
                                    {viewModal.status}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[viewModal.type]}`}>
                                    {viewModal.type}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[viewModal.priority]}`}>
                                    {viewModal.priority}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">{viewModal.subject}</h3>

                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Customer:</span>
                                    <p className="font-medium text-gray-900">{viewModal.customerName}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Email:</span>
                                    <p className="font-medium text-gray-900">{viewModal.customerEmail}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Created:</span>
                                    <p className="font-medium text-gray-900">
                                        {viewModal.created ? new Date(viewModal.created).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Updated:</span>
                                    <p className="font-medium text-gray-900">
                                        {viewModal.updated ? new Date(viewModal.updated).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Message</h4>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewModal.message}</p>
                            </div>

                            {/* Response History */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                    Response History ({viewModal.responses?.length || 0})
                                </h4>
                                {viewModal.responses && viewModal.responses.length > 0 ? (
                                    <div className="space-y-3">
                                        {viewModal.responses.map((resp) => (
                                            <div
                                                key={resp.id}
                                                className={`p-4 rounded-lg border text-sm ${
                                                    resp.isInternal
                                                        ? 'bg-yellow-50 border-yellow-200'
                                                        : 'bg-blue-50 border-blue-200'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-900">{resp.author}</span>
                                                    <div className="flex items-center gap-2">
                                                        {resp.isInternal && (
                                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                                                                Internal
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-400">
                                                            {resp.timestamp
                                                                ? new Date(resp.timestamp).toLocaleString()
                                                                : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 whitespace-pre-wrap">{resp.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No responses yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-6 border-t border-gray-100">
                            <button
                                onClick={() => setViewModal(null)}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    const inq = viewModal
                                    setViewModal(null)
                                    setRespondModal(inq)
                                    setResponseMessage('')
                                    setIsInternal(false)
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                                Respond
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== UPDATE STATUS MODAL ===== */}
            {statusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setStatusModal(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Update Status</h2>
                            <button
                                onClick={() => setStatusModal(null)}
                                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Update status for: <strong>{statusModal.subject}</strong>
                            </p>

                            <div className="space-y-2">
                                {STATUS_OPTIONS.map((s) => (
                                    <label
                                        key={s}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                            newStatus === s
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={s}
                                            checked={newStatus === s}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[s]}`}>
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setStatusModal(null)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={submitting || newStatus === statusModal.status}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
