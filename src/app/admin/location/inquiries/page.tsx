'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    MessageSquare, Inbox, Clock, CheckCircle, Plus, Search,
    Filter, Send, Eye, RefreshCw, AlertCircle, Loader2,
} from 'lucide-react'
import { LocationManagerService } from '@/services/locationManagerService'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import {
    validateName, validateEmail, validatePhone, validateSubject,
    validateTextArea, validateSelect, filterNameInput, filterPhoneInput, FORMAT_HINTS,
} from '@/utils/validation'
import { toast } from 'sonner'

interface InquiryRow {
    id: string
    inquiryId: string
    subject: string
    message: string
    customerName: string
    customerEmail: string
    customerPhone: string
    type: string
    status: string
    priority: string
    responses: any[]
    createdAt: string
    updatedAt: string
}

const STATUS_FILTERS = [
    { value: 'all', label: 'All statuses' },
    { value: 'new', label: 'New' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
]
const TYPES = [
    { value: 'general', label: 'General' },
    { value: 'billing', label: 'Billing' },
    { value: 'technical', label: 'Technical' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'suggestion', label: 'Suggestion' },
]
const PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
]

const statusBadge = (s: string) => {
    const k = s.toLowerCase()
    if (k === 'new') return 'bg-blue-100 text-blue-700 border border-blue-200'
    if (k === 'in-progress') return 'bg-purple-100 text-purple-700 border border-purple-200'
    if (k === 'resolved') return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    if (k === 'closed') return 'bg-gray-200 text-gray-700 border border-gray-300'
    return 'bg-gray-100 text-gray-700 border border-gray-200'
}

const emptyCreate = { subject: '', message: '', customerName: '', customerEmail: '', customerPhone: '', type: 'general', priority: 'medium' }

export default function LocationInquiriesPage() {
    const [rows, setRows] = useState<InquiryRow[]>([])
    const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Create drawer
    const [createOpen, setCreateOpen] = useState(false)
    const [createForm, setCreateForm] = useState(emptyCreate)
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
    const [creating, setCreating] = useState(false)

    // Respond drawer
    const [responding, setResponding] = useState<InquiryRow | null>(null)
    const [responseMessage, setResponseMessage] = useState('')
    const [isInternal, setIsInternal] = useState(false)
    const [responseError, setResponseError] = useState('')
    const [submittingResponse, setSubmittingResponse] = useState(false)

    // View drawer
    const [viewing, setViewing] = useState<InquiryRow | null>(null)

    const fetchInquiries = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await LocationManagerService.getInquiries({
                status: filterStatus !== 'all' ? filterStatus : undefined,
                search: searchTerm || undefined,
                page,
                pageSize: 20,
            })
            setRows(data?.items || [])
            setStats(data?.stats || { total: 0, new: 0, inProgress: 0, resolved: 0 })
            setTotalPages(data?.totalPages || 1)
        } catch (err: any) {
            setError(err?.message || 'Failed to load inquiries')
            setRows([])
        } finally {
            setLoading(false)
        }
    }, [filterStatus, searchTerm, page])

    useEffect(() => {
        const t = setTimeout(() => fetchInquiries(), 250)
        return () => clearTimeout(t)
    }, [fetchInquiries])

    const handleCreateChange = (f: keyof typeof emptyCreate, v: string) => {
        setCreateForm(prev => ({ ...prev, [f]: v }))
        if (createErrors[f]) setCreateErrors(prev => { const n = { ...prev }; delete n[f]; return n })
    }

    const validateCreate = (): Record<string, string> => {
        const errs: Record<string, string> = {}
        const subErr = validateSubject(createForm.subject, 'Subject'); if (subErr) errs.subject = subErr
        const msgErr = validateTextArea(createForm.message, 'Message', 5, 2000); if (msgErr) errs.message = msgErr
        const nmErr = validateName(createForm.customerName, 'Customer name'); if (nmErr) errs.customerName = nmErr
        if (createForm.customerEmail) {
            const emErr = validateEmail(createForm.customerEmail, false); if (emErr) errs.customerEmail = emErr
        }
        if (createForm.customerPhone) {
            const phErr = validatePhone(createForm.customerPhone, false); if (phErr) errs.customerPhone = phErr
        }
        const tErr = validateSelect(createForm.type, 'Type'); if (tErr) errs.type = tErr
        const pErr = validateSelect(createForm.priority, 'Priority'); if (pErr) errs.priority = pErr
        return errs
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validateCreate()
        setCreateErrors(errs)
        if (Object.keys(errs).length > 0) return
        setCreating(true)
        try {
            await LocationManagerService.createInquiry({
                subject: createForm.subject.trim(),
                message: createForm.message.trim(),
                customerName: createForm.customerName.trim(),
                customerEmail: createForm.customerEmail.trim() || undefined,
                customerPhone: createForm.customerPhone.trim() || undefined,
                type: createForm.type,
                priority: createForm.priority,
            })
            toast.success('Inquiry logged')
            setCreateOpen(false)
            setCreateForm(emptyCreate)
            fetchInquiries()
        } catch (err: any) {
            toast.error(err?.message || 'Failed to log inquiry')
        } finally {
            setCreating(false)
        }
    }

    const handleRespond = async () => {
        if (!responding) return
        const err = validateTextArea(responseMessage, 'Response', 1, 5000)
        if (err) { setResponseError(err); return }
        setSubmittingResponse(true)
        try {
            await LocationManagerService.respondToInquiry(responding.id, {
                message: responseMessage.trim(),
                isInternal,
            })
            toast.success('Response sent')
            setResponding(null)
            setResponseMessage('')
            setIsInternal(false)
            setResponseError('')
            fetchInquiries()
        } catch (err: any) {
            toast.error(err?.message || 'Failed to send response')
        } finally {
            setSubmittingResponse(false)
        }
    }

    const handleStatusChange = async (row: InquiryRow, newStatus: string) => {
        try {
            await LocationManagerService.updateInquiry(row.id, { status: newStatus })
            toast.success(`Marked ${newStatus.replace('-', ' ')}`)
            fetchInquiries()
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update status')
        }
    }

    const kpis = [
        { label: 'Total Inquiries', value: stats.total, icon: MessageSquare, cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', titleColor: 'text-blue-700', valueColor: 'text-blue-900' },
        { label: 'New', value: stats.new, icon: Inbox, cardBg: 'bg-gradient-to-br from-cyan-50 to-cyan-100', iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600', titleColor: 'text-cyan-700', valueColor: 'text-cyan-900' },
        { label: 'In Progress', value: stats.inProgress, icon: Clock, cardBg: 'bg-gradient-to-br from-amber-50 to-amber-100', iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600', titleColor: 'text-amber-700', valueColor: 'text-amber-900' },
        { label: 'Resolved', value: stats.resolved, icon: CheckCircle, cardBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', titleColor: 'text-emerald-700', valueColor: 'text-emerald-900' },
    ]

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inquiries</h1>
                    <p className="text-sm text-gray-500 mt-1 font-normal">Phone calls, walk-in queries, parent complaints for this location</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchInquiries}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button
                        onClick={() => { setCreateForm(emptyCreate); setCreateErrors({}); setCreateOpen(true) }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4" /> Log Inquiry
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <motion.div
                        key={k.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`${k.cardBg} border-0 rounded-xl shadow-sm hover:shadow-lg transition-shadow p-5`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${k.iconBg} p-2.5 rounded-lg shadow-md`}>
                                <k.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className={`text-xs font-medium ${k.titleColor} uppercase tracking-wide`}>{k.label}</p>
                        <p className={`text-2xl font-bold ${k.valueColor} mt-1`}>{k.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                            placeholder="Search by subject, customer name…"
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[180px] font-normal capitalize focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {STATUS_FILTERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700 font-normal">{error}</p>
                </div>
            )}

            {/* Card grid */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-normal">Loading inquiries…</p>
                </div>
            ) : rows.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-700">No inquiries logged</h3>
                    <p className="text-sm text-gray-500 mt-1 font-normal">Click "Log Inquiry" to record a phone call or walk-in query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rows.map(row => (
                        <div key={row.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 flex-1">{row.subject}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${statusBadge(row.status)}`}>
                                    {row.status.replace('-', ' ')}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 font-normal mb-1">{row.customerName} · <span className="capitalize">{row.type}</span></p>
                            <p className="text-sm text-gray-700 font-normal line-clamp-2 mb-3">{row.message}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-1">
                                <button
                                    onClick={() => setViewing(row)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg"
                                >
                                    <Eye className="w-3.5 h-3.5" /> View
                                </button>
                                <button
                                    onClick={() => { setResponding(row); setResponseMessage(''); setIsInternal(false); setResponseError('') }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-orange-600 text-white hover:bg-orange-700 rounded-lg"
                                >
                                    <Send className="w-3.5 h-3.5" /> Respond
                                </button>
                                <select
                                    value={row.status}
                                    onChange={(e) => handleStatusChange(row, e.target.value)}
                                    className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white font-normal capitalize focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    {STATUS_FILTERS.filter(s => s.value !== 'all').map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 font-normal">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                        Next
                    </button>
                </div>
            )}

            {/* Create-inquiry drawer */}
            <SlideInDrawer
                isOpen={createOpen}
                onClose={() => { setCreateOpen(false); setCreateErrors({}) }}
                title="Log Inquiry"
                description="Record a phone call, walk-in question, or parent complaint"
                size="md"
            >
                <form onSubmit={handleCreate} className="space-y-4 font-sans">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={createForm.subject}
                            onChange={(e) => handleCreateChange('subject', e.target.value)}
                            maxLength={200}
                            placeholder="e.g. Class schedule question"
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${createErrors.subject ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint="5–200 chars, must contain letters" error={createErrors.subject} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                        <textarea
                            value={createForm.message}
                            onChange={(e) => handleCreateChange('message', e.target.value)}
                            rows={4}
                            maxLength={2000}
                            placeholder="Detailed description of the inquiry"
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal resize-y ${createErrors.message ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint="5–2000 characters" error={createErrors.message} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={createForm.customerName}
                                onChange={(e) => handleCreateChange('customerName', e.target.value)}
                                onKeyDown={filterNameInput}
                                maxLength={80}
                                placeholder="Full name"
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${createErrors.customerName ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.name} error={createErrors.customerName} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={createForm.customerEmail}
                                onChange={(e) => handleCreateChange('customerEmail', e.target.value)}
                                placeholder="email@example.com"
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${createErrors.customerEmail ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.email} error={createErrors.customerEmail} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={createForm.customerPhone}
                                onChange={(e) => handleCreateChange('customerPhone', e.target.value)}
                                onKeyDown={filterPhoneInput}
                                placeholder="+1234567890"
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${createErrors.customerPhone ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.phone} error={createErrors.customerPhone} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={createForm.type}
                                onChange={(e) => handleCreateChange('type', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal capitalize"
                            >
                                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={createForm.priority}
                                onChange={(e) => handleCreateChange('priority', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal capitalize"
                            >
                                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={creating} className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 inline-flex items-center gap-2">
                            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                            {creating ? 'Saving…' : 'Log Inquiry'}
                        </button>
                    </div>
                </form>
            </SlideInDrawer>

            {/* Respond drawer */}
            <SlideInDrawer
                isOpen={!!responding}
                onClose={() => { setResponding(null); setResponseMessage(''); setResponseError('') }}
                title="Respond to Inquiry"
                description={responding?.subject}
                size="md"
            >
                {responding && (
                    <div className="space-y-4 font-sans">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-900">{responding.customerName}</p>
                            <p className="text-xs text-gray-500 font-normal">{responding.customerEmail || responding.customerPhone}</p>
                            <p className="text-sm text-gray-700 font-normal mt-2 whitespace-pre-wrap">{responding.message}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your response <span className="text-red-500">*</span></label>
                            <textarea
                                value={responseMessage}
                                onChange={(e) => { setResponseMessage(e.target.value); setResponseError(validateTextArea(e.target.value, 'Response', 1, 5000) || '') }}
                                rows={6}
                                maxLength={5000}
                                placeholder="Type your response…"
                                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal resize-y ${responseError ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint="1–5000 characters" error={responseError} />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-700 font-normal">
                            <input
                                type="checkbox"
                                checked={isInternal}
                                onChange={(e) => setIsInternal(e.target.checked)}
                                className="w-4 h-4 rounded text-orange-600"
                            />
                            Internal note <span className="text-xs text-gray-400">(not visible to customer)</span>
                        </label>
                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                            <button onClick={() => setResponding(null)} className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button
                                onClick={handleRespond}
                                disabled={submittingResponse || !responseMessage.trim()}
                                className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {submittingResponse && <Loader2 className="w-4 h-4 animate-spin" />}
                                {submittingResponse ? 'Sending…' : 'Send Response'}
                            </button>
                        </div>
                    </div>
                )}
            </SlideInDrawer>

            {/* View drawer */}
            <SlideInDrawer
                isOpen={!!viewing}
                onClose={() => setViewing(null)}
                title="Inquiry Details"
                description={viewing?.subject}
                size="lg"
            >
                {viewing && (
                    <div className="space-y-4 font-sans">
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(viewing.status)}`}>{viewing.status.replace('-', ' ')}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">{viewing.type}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">{viewing.priority}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Customer</p>
                                <p className="font-medium text-gray-900">{viewing.customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500">Contact</p>
                                <p className="font-medium text-gray-900 break-all">{viewing.customerEmail || viewing.customerPhone || '—'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap font-normal">{viewing.message}</div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Responses ({viewing.responses?.length || 0})</p>
                            {viewing.responses && viewing.responses.length > 0 ? (
                                <div className="space-y-2">
                                    {viewing.responses.map((r: any, idx: number) => (
                                        <div key={r.id || idx} className={`p-3 rounded-lg border text-sm ${r.isInternal ? 'bg-yellow-50 border-yellow-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-gray-900">{r.author || 'Manager'}</span>
                                                {r.isInternal && <span className="text-xs font-medium bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Internal</span>}
                                            </div>
                                            <p className="text-gray-700 font-normal whitespace-pre-wrap">{r.message}</p>
                                            <p className="text-xs text-gray-400 mt-1 font-normal">{r.timestamp ? new Date(r.timestamp).toLocaleString() : ''}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic font-normal">No responses yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </SlideInDrawer>
        </div>
    )
}
