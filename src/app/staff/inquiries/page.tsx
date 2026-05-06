'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService, CustomerInquiry } from '@/services/supportStaffService'
import {
    MessageSquare, Inbox, Clock, CheckCircle, Search, Filter, Send, Eye,
    AlertCircle, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { validateTextArea, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { toast } from 'sonner'

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

const stringify = (v: any): string => {
    if (v == null) return ''
    if (typeof v === 'string') return v
    if (typeof v === 'object') return v.name || v.fullName || v.email || ''
    return String(v)
}

const normalizeInquiry = (raw: any): any => ({
    ...raw,
    id: raw?.inquiryId || raw?.id || raw?._id || '',
    inquiryId: raw?.inquiryId || raw?.id || raw?._id || '',
    customerName: stringify(raw?.customerName) || stringify(raw?.customer),
    customerEmail: stringify(raw?.customerEmail) || stringify(raw?.customer?.email),
    subject: stringify(raw?.subject),
    message: stringify(raw?.message),
    type: stringify(raw?.type) || 'general',
    status: stringify(raw?.status) || 'new',
    priority: stringify(raw?.priority) || 'medium',
    responses: Array.isArray(raw?.responses) ? raw.responses : [],
    created: raw?.created || raw?.createdAt || '',
    updated: raw?.updated || raw?.updatedAt || '',
})

export default function CustomerInquiries() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [inquiries, setInquiries] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [pages, setPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')

    // Drawers
    const [respondDrawer, setRespondDrawer] = useState<any | null>(null)
    const [viewDrawer, setViewDrawer] = useState<any | null>(null)
    const [statusDrawer, setStatusDrawer] = useState<any | null>(null)

    const [responseMessage, setResponseMessage] = useState('')
    const [isInternal, setIsInternal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [responseError, setResponseError] = useState('')
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
            const list = (data?.inquiries || []).map(normalizeInquiry)
            setInquiries(list)
            setTotal(data?.total ?? list.length)
            setPages(data?.pages || 1)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load inquiries')
            setInquiries([])
            setTotal(0)
            setPages(1)
        } finally {
            setLoading(false)
        }
    }, [searchQuery, statusFilter, typeFilter, currentPage])

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        loadInquiries()
    }, [isAuthenticated, router, loadInquiries])

    const totalInquiries = total || inquiries.length
    const newCount = inquiries.filter((i) => i.status === 'new').length
    const inProgressCount = inquiries.filter((i) => i.status === 'in-progress').length
    const resolvedCount = inquiries.filter((i) => i.status === 'resolved').length

    const handleRespond = async () => {
        if (!respondDrawer) return
        const err = validateTextArea(responseMessage, 'Response', 1, 5000)
        if (err) { setResponseError(err); return }
        setResponseError('')
        setSubmitting(true)
        try {
            await supportStaffService.respondToInquiry(respondDrawer.id, responseMessage.trim(), isInternal)
            setRespondDrawer(null)
            setResponseMessage('')
            setIsInternal(false)
            toast.success('Response sent successfully')
            loadInquiries()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to send response')
        } finally {
            setSubmitting(false)
        }
    }

    const handleStatusUpdate = async () => {
        if (!statusDrawer || !newStatus) return
        setSubmitting(true)
        try {
            await supportStaffService.updateInquiry(statusDrawer.id, { status: newStatus as any })
            setStatusDrawer(null)
            setNewStatus('')
            toast.success('Status updated successfully')
            loadInquiries()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update status')
        } finally {
            setSubmitting(false)
        }
    }

    if (!isAuthenticated) return null

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Inquiries</h1>
                        <p className="text-gray-500 mt-1 text-sm">Manage and respond to customer inquiries</p>
                    </div>
                    <button
                        id="staff-inquiries-btn-refresh"
                        onClick={loadInquiries}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Inquiries</p>
                        <p className="text-2xl font-bold text-gray-900">{totalInquiries}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Inbox className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">New</p>
                        <p className="text-2xl font-bold text-gray-900">{newCount}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">In Progress</p>
                        <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Resolved</p>
                        <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or subject..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                id="staff-inquiries-select-status"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm appearance-none bg-white min-w-[160px] capitalize"
                            >
                                <option value="">All Statuses</option>
                                {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                id="staff-inquiries-select-type"
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1) }}
                                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm appearance-none bg-white min-w-[160px] capitalize"
                            >
                                <option value="">All Types</option>
                                {TYPE_OPTIONS.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Inquiries Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                    </div>
                ) : inquiries.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-1">No inquiries found</h3>
                        <p className="text-gray-400 text-sm">Customer inquiries will appear here when submitted.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {inquiries.map((inquiry) => (
                                <div key={inquiry.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border border-gray-100">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <h3 className="font-semibold text-gray-900 truncate">{inquiry.subject}</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">{inquiry.customerName}</p>
                                            <p className="text-xs text-gray-400">{inquiry.customerEmail}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap capitalize ${priorityColors[inquiry.priority] || 'bg-gray-100 text-gray-700'}`}>
                                            {inquiry.priority}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{inquiry.message}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${typeColors[inquiry.type] || 'bg-gray-100 text-gray-700'}`}>{inquiry.type}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[inquiry.status] || 'bg-gray-100 text-gray-700'}`}>{inquiry.status}</span>
                                    </div>
                                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => setViewDrawer(inquiry)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </button>
                                        <button
                                            onClick={() => { setRespondDrawer(inquiry); setResponseMessage(''); setIsInternal(false); setResponseError('') }}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
                                        >
                                            <Send className="w-3.5 h-3.5" /> Respond
                                        </button>
                                        <button
                                            onClick={() => { setStatusDrawer(inquiry); setNewStatus(inquiry.status) }}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" /> Status
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-gray-600 px-3">Page {currentPage} of {pages}</span>
                                <button onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))} disabled={currentPage === pages}
                                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* RESPOND DRAWER (right side) */}
            <SlideInDrawer
                isOpen={!!respondDrawer}
                onClose={() => { setRespondDrawer(null); setResponseMessage(''); setResponseError('') }}
                title="Respond to Inquiry"
                description={respondDrawer?.subject}
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setRespondDrawer(null); setResponseMessage('') }}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                        >Cancel</button>
                        <button
                            onClick={handleRespond}
                            disabled={submitting || !responseMessage.trim()}
                            className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 inline-flex items-center gap-2 text-sm font-medium"
                        >
                            {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Send className="w-4 h-4" />}
                            {submitting ? 'Sending…' : 'Send Response'}
                        </button>
                    </div>
                }
            >
                {respondDrawer && (
                    <div className="space-y-5">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600 mb-2"><strong>From:</strong> {respondDrawer.customerName} ({respondDrawer.customerEmail})</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{respondDrawer.message}</p>
                            <div className="flex gap-2 mt-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[respondDrawer.status]}`}>{respondDrawer.status}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeColors[respondDrawer.type]}`}>{respondDrawer.type}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Response <span className="text-red-500">*</span></label>
                            <textarea
                                value={responseMessage}
                                onChange={(e) => {
                                    setResponseMessage(e.target.value)
                                    const err = validateTextArea(e.target.value, 'Response', 1, 5000)
                                    setResponseError(err || '')
                                }}
                                placeholder="Type your response here..."
                                rows={6}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none ${responseError ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.message} error={responseError} />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isInternal}
                                onChange={(e) => setIsInternal(e.target.checked)}
                                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                            />
                            <span className="text-sm text-gray-700">Internal Note</span>
                            <span className="text-xs text-gray-400">(not visible to customer)</span>
                        </label>
                    </div>
                )}
            </SlideInDrawer>

            {/* VIEW DRAWER (right side) */}
            <SlideInDrawer
                isOpen={!!viewDrawer}
                onClose={() => setViewDrawer(null)}
                title="Inquiry Details"
                description={viewDrawer?.subject}
                size="lg"
                footer={
                    viewDrawer && (
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setViewDrawer(null)}
                                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                            >Close</button>
                            <button
                                onClick={() => { const inq = viewDrawer; setViewDrawer(null); setRespondDrawer(inq); setResponseMessage(''); setIsInternal(false) }}
                                className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 inline-flex items-center gap-2 text-sm font-medium"
                            >
                                <Send className="w-4 h-4" /> Respond
                            </button>
                        </div>
                    )
                }
            >
                {viewDrawer && (
                    <div className="space-y-5">
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[viewDrawer.status]}`}>{viewDrawer.status}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${typeColors[viewDrawer.type]}`}>{viewDrawer.type}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${priorityColors[viewDrawer.priority]}`}>{viewDrawer.priority}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Customer</p>
                                <p className="font-medium text-gray-900">{viewDrawer.customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Email</p>
                                <p className="font-medium text-gray-900 break-all">{viewDrawer.customerEmail}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Created</p>
                                <p className="font-medium text-gray-900">{viewDrawer.created ? new Date(viewDrawer.created).toLocaleString() : '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Updated</p>
                                <p className="font-medium text-gray-900">{viewDrawer.updated ? new Date(viewDrawer.updated).toLocaleString() : '-'}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-2">Message</p>
                            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">{viewDrawer.message}</div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-2">Response History ({viewDrawer.responses?.length || 0})</p>
                            {viewDrawer.responses && viewDrawer.responses.length > 0 ? (
                                <div className="space-y-3">
                                    {viewDrawer.responses.map((resp: any, i: number) => (
                                        <div
                                            key={resp.id || resp.responseId || i}
                                            className={`p-4 rounded-lg border text-sm ${resp.isInternal ? 'bg-yellow-50 border-yellow-200' : 'bg-cyan-50 border-cyan-200'}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900">{stringify(resp.author) || 'Staff'}</span>
                                                <div className="flex items-center gap-2">
                                                    {resp.isInternal && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">Internal</span>}
                                                    <span className="text-xs text-gray-400">{resp.timestamp ? new Date(resp.timestamp).toLocaleString() : ''}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-wrap">{stringify(resp.message)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No responses yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </SlideInDrawer>

            {/* STATUS DRAWER (right side) */}
            <SlideInDrawer
                isOpen={!!statusDrawer}
                onClose={() => { setStatusDrawer(null); setNewStatus('') }}
                title="Update Status"
                description={statusDrawer?.subject}
                size="sm"
                footer={
                    statusDrawer && (
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setStatusDrawer(null); setNewStatus('') }}
                                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                            >Cancel</button>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={submitting || newStatus === statusDrawer.status}
                                className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
                            >
                                {submitting ? 'Updating…' : 'Update Status'}
                            </button>
                        </div>
                    )
                }
            >
                {statusDrawer && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                            Update status for: <strong className="text-gray-900">{statusDrawer.subject}</strong>
                        </p>
                        <div className="space-y-2">
                            {STATUS_OPTIONS.map((s) => (
                                <label
                                    key={s}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${newStatus === s ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={s}
                                        checked={newStatus === s}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-4 h-4 text-cyan-600"
                                    />
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[s]}`}>{s}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </SlideInDrawer>
        </div>
    )
}
