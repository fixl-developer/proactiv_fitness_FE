'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService, SupportTicket } from '@/services/supportStaffService'
import { Plus, Search, Ticket, AlertCircle, Clock, CheckCircle, ChevronDown, RefreshCw } from 'lucide-react'
import { validateRequired, validateEmail, validateTextArea, validateName, validateSubject, filterNameInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { toast } from 'sonner'

const stringify = (v: any): string => {
    if (v == null) return ''
    if (typeof v === 'string') return v
    if (typeof v === 'number' || typeof v === 'boolean') return String(v)
    if (typeof v === 'object') return v.name || v.fullName || v.email || v.label || ''
    return ''
}

const normalizeTicket = (raw: any): any => ({
    ...raw,
    // Prefer ticketId over _id because backend update/delete routes use :ticketId
    id: raw?.ticketId || raw?.ticketNumber || raw?.id || raw?._id || '',
    ticketId: raw?.ticketId || raw?.ticketNumber || raw?.id || raw?._id || '',
    subject: stringify(raw?.subject) || stringify(raw?.title),
    description: stringify(raw?.description),
    customer: stringify(raw?.customer) || stringify(raw?.createdBy) || stringify(raw?.user),
    customerEmail: stringify(raw?.customerEmail) || stringify(raw?.customer?.email) || stringify(raw?.createdBy?.email),
    assignedTo: stringify(raw?.assignedToName) || stringify(raw?.assignedTo),
    priority: stringify(raw?.priority) || 'medium',
    status: stringify(raw?.status) || 'open',
    category: stringify(raw?.category),
    resolution: stringify(raw?.resolution),
    tags: Array.isArray(raw?.tags) ? raw.tags.map(stringify).filter(Boolean) : [],
    created: raw?.created || raw?.createdAt || '',
    updated: raw?.updated || raw?.updatedAt || '',
})

const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
const STATUSES: SupportTicket['status'][] = ['open', 'in-progress', 'pending', 'resolved', 'closed']
const CATEGORIES = ['Billing', 'Technical', 'Account', 'Booking', 'General']

const emptyForm = {
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    category: '',
    customer: '',
    customerEmail: '',
}

export default function SupportTickets() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tickets, setTickets] = useState<any[]>([])
    const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 1, limit: 10 })
    const [total, setTotal] = useState(0)
    const [pages, setPages] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    // Create / Edit drawer
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [submitting, setSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Detail drawer
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null)

    // Inline status dropdown
    const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
    const statusDropdownRef = useRef<HTMLDivElement>(null)

    const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 })

    const loadTickets = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await supportStaffService.getTickets(filters)
            const ticketList = (data?.tickets || []).map(normalizeTicket)
            setTickets(ticketList)
            setTotal(data?.total || ticketList.length)
            setPages(data?.pages || 0)
            const totalCount = data?.total || ticketList.length
            const openCount = ticketList.filter((t: any) => t.status === 'open').length
            const inProgressCount = ticketList.filter((t: any) => t.status === 'in-progress').length
            const resolvedCount = ticketList.filter((t: any) => t.status === 'resolved').length
            setStats({ total: totalCount, open: openCount, inProgress: inProgressCount, resolved: resolvedCount })
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load tickets')
            setTickets([])
            setTotal(0)
            setStats({ total: 0, open: 0, inProgress: 0, resolved: 0 })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        loadTickets()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, router, filters])

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
                setStatusDropdownId(null)
            }
        }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [])

    const handleSearch = () => setFilters({ ...filters, search: searchQuery.trim(), page: 1 })

    const validateForm = (): Record<string, string> => {
        const errs: Record<string, string> = {}
        // Subject: reject special-character-only / gibberish strings (BUG_002).
        const sub = validateSubject(form.subject, 'Subject'); if (sub) errs.subject = sub
        const desc = validateTextArea(form.description, 'Description', 5, 5000); if (desc) errs.description = desc
        const cust = validateName(form.customer, 'Customer Name'); if (cust) errs.customer = cust
        const em = validateEmail(form.customerEmail); if (em) errs.customerEmail = em
        const cat = validateRequired(form.category, 'Category'); if (cat) errs.category = cat
        return errs
    }

    const openCreateDrawer = () => {
        setEditingId(null)
        setForm(emptyForm)
        setFormErrors({})
        setDrawerOpen(true)
    }

    const openEditDrawer = (t: any) => {
        setEditingId(t.id)
        setForm({
            subject: t.subject || '',
            description: t.description || '',
            priority: (t.priority as any) || 'medium',
            category: t.category || '',
            customer: t.customer || '',
            customerEmail: t.customerEmail || '',
        })
        setFormErrors({})
        setDrawerOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validateForm()
        setFormErrors(errs)
        if (Object.keys(errs).length > 0) return
        setSubmitting(true)
        try {
            const payload = {
                subject: form.subject.trim(),
                description: form.description.trim(),
                priority: form.priority,
                category: form.category.trim(),
                customer: { name: form.customer.trim(), email: form.customerEmail.trim() },
                customerEmail: form.customerEmail.trim(),
            } as any
            if (editingId) {
                await supportStaffService.updateTicket(editingId, payload)
                toast.success('Ticket updated')
            } else {
                await supportStaffService.createTicket(payload)
                toast.success('Ticket created')
            }
            setDrawerOpen(false)
            setForm(emptyForm)
            setEditingId(null)
            loadTickets()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save ticket')
        } finally {
            setSubmitting(false)
        }
    }

    const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
        setUpdatingStatus(ticketId)
        try {
            await supportStaffService.updateTicket(ticketId, { status: newStatus })
            setStatusDropdownId(null)
            toast.success('Status updated')
            loadTickets()
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status: newStatus })
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update status')
        } finally {
            setUpdatingStatus(null)
        }
    }

    const handleDelete = async (ticketId: string) => {
        if (!confirm('Delete this ticket? This cannot be undone.')) return
        try {
            await supportStaffService.deleteTicket(ticketId)
            toast.success('Ticket deleted')
            setSelectedTicket(null)
            loadTickets()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to delete ticket')
        }
    }

    const priorityBadge = (p: string) => {
        const cls =
            p === 'critical' ? 'bg-red-100 text-red-800' :
            p === 'high' ? 'bg-orange-100 text-orange-800' :
            p === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}>{p}</span>
    }

    const statusBadge = (s: string) => {
        const cls =
            s === 'open' ? 'bg-blue-100 text-blue-800' :
            s === 'in-progress' ? 'bg-purple-100 text-purple-800' :
            s === 'resolved' ? 'bg-green-100 text-green-800' :
            s === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}>{s}</span>
    }

    if (!isAuthenticated) return null

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Support Tickets</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and resolve customer issues</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            id="staff-tickets-btn-refresh"
                            onClick={loadTickets}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            id="staff-tickets-btn-create"
                            onClick={openCreateDrawer}
                            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 inline-flex items-center gap-2 text-sm font-medium shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> New Ticket
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Stats Cards (DYNAMIC from list count) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Ticket className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Tickets</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Open</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">In Progress</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Resolved</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by subject, customer, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <button
                            id="staff-tickets-btn-search"
                            onClick={handleSearch}
                            className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 text-sm font-medium"
                        >
                            Search
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            id="staff-tickets-select-status"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">All Status</option>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select
                            id="staff-tickets-select-priority"
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">All Priority</option>
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                {/* Tickets Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600" />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No tickets found</h3>
                        <p className="text-gray-500 mb-4">Create your first support ticket to get started.</p>
                        <button
                            onClick={openCreateDrawer}
                            className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Create Ticket
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">ID</th>
                                        <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Subject</th>
                                        <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Customer</th>
                                        <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Priority</th>
                                        <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Status</th>
                                        <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Category</th>
                                        <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => setSelectedTicket(ticket)}
                                        >
                                            <td className="py-3 px-6 text-cyan-600 font-medium text-sm">{ticket.ticketId || ticket.id}</td>
                                            <td className="py-3 px-6 text-gray-900 text-sm">{ticket.subject}</td>
                                            <td className="py-3 px-6 text-gray-600 text-sm">{ticket.customer}</td>
                                            <td className="py-3 px-6">{priorityBadge(ticket.priority)}</td>
                                            <td className="py-3 px-6 relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setStatusDropdownId(statusDropdownId === ticket.id ? null : ticket.id)
                                                    }}
                                                    className="inline-flex items-center gap-1 hover:opacity-80"
                                                >
                                                    {statusBadge(ticket.status)}
                                                    <ChevronDown className="w-3 h-3 text-gray-500" />
                                                </button>
                                                {statusDropdownId === ticket.id && (
                                                    <div
                                                        ref={statusDropdownRef}
                                                        className="absolute z-20 top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]"
                                                    >
                                                        {STATUSES.map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleStatusChange(ticket.id, s)
                                                                }}
                                                                disabled={updatingStatus === ticket.id}
                                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 capitalize ${
                                                                    ticket.status === s ? 'bg-cyan-50 font-semibold text-cyan-700' : 'text-gray-700'
                                                                }`}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-6 text-gray-600 text-sm">{ticket.category || '-'}</td>
                                            <td className="py-3 px-6 text-gray-600 text-sm">
                                                {ticket.created ? new Date(ticket.created).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {tickets.length > 0 && (
                    <div className="mt-6 flex justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            Showing {tickets.length} of {total} tickets
                            {pages > 1 && <span className="ml-1">(Page {filters.page} of {pages})</span>}
                        </p>
                        <div className="flex gap-2">
                            <button
                                id="staff-tickets-btn-prev"
                                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                                disabled={filters.page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
                            >
                                Previous
                            </button>
                            <button
                                id="staff-tickets-btn-next"
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                disabled={filters.page >= pages}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT DRAWER (right side) */}
            <SlideInDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditingId(null); setForm(emptyForm); setFormErrors({}) }}
                title={editingId ? 'Edit Ticket' : 'Create New Ticket'}
                description={editingId ? 'Update the ticket details below' : 'Fill in the ticket details. Required fields are marked.'}
                size="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => { setDrawerOpen(false); setForm(emptyForm); setEditingId(null) }}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="ticket-form"
                            disabled={submitting}
                            className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 inline-flex items-center gap-2 text-sm font-medium"
                        >
                            {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                            {submitting ? 'Saving…' : (editingId ? 'Save Changes' : 'Create Ticket')}
                        </button>
                    </div>
                }
            >
                <form id="ticket-form" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={(e) => {
                                setForm({ ...form, subject: e.target.value })
                                const err = validateSubject(e.target.value, 'Subject')
                                setFormErrors(p => { const n = { ...p }; if (err) n.subject = err; else delete n.subject; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.subject ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Brief summary of the issue"
                            maxLength={200}
                        />
                        <FormFieldHint hint="5–200 characters, avoid special-character-only input" error={formErrors.subject} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.customer}
                            onKeyDown={filterNameInput}
                            onChange={(e) => {
                                setForm({ ...form, customer: e.target.value })
                                const err = validateName(e.target.value, 'Customer Name')
                                setFormErrors(p => { const n = { ...p }; if (err) n.customer = err; else delete n.customer; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.customer ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Customer's full name"
                        />
                        <FormFieldHint hint={FORMAT_HINTS.name} error={formErrors.customer} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            value={form.customerEmail}
                            onChange={(e) => {
                                setForm({ ...form, customerEmail: e.target.value })
                                const err = validateEmail(e.target.value)
                                setFormErrors(p => { const n = { ...p }; if (err) n.customerEmail = err; else delete n.customerEmail; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.customerEmail ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="customer@example.com"
                        />
                        <FormFieldHint hint={FORMAT_HINTS.email} error={formErrors.customerEmail} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority <span className="text-red-500">*</span></label>
                            <select
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
                            >
                                {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                            <select
                                value={form.category}
                                onChange={(e) => {
                                    setForm({ ...form, category: e.target.value })
                                    const err = validateRequired(e.target.value, 'Category')
                                    setFormErrors(p => { const n = { ...p }; if (err) n.category = err; else delete n.category; return n })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <FormFieldHint hint="Pick the closest match" error={formErrors.category} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                        <textarea
                            rows={5}
                            value={form.description}
                            onChange={(e) => {
                                setForm({ ...form, description: e.target.value })
                                const err = validateTextArea(e.target.value, 'Description', 5, 5000)
                                setFormErrors(p => { const n = { ...p }; if (err) n.description = err; else delete n.description; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Detailed description of the issue (min 5 chars)"
                        />
                        <FormFieldHint hint="At least 5 characters" error={formErrors.description} />
                    </div>
                </form>
            </SlideInDrawer>

            {/* DETAIL DRAWER (right side) */}
            <SlideInDrawer
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                title={selectedTicket?.subject || 'Ticket'}
                description={`Ticket ${selectedTicket?.ticketId || selectedTicket?.id || ''}`}
                size="lg"
                footer={
                    selectedTicket && (
                        <div className="flex justify-between gap-3">
                            <button
                                onClick={() => handleDelete(selectedTicket.id)}
                                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium"
                            >
                                Delete
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { const t = selectedTicket; setSelectedTicket(null); openEditDrawer(t) }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )
                }
            >
                {selectedTicket && (
                    <div className="space-y-5">
                        <div className="flex flex-wrap gap-3">
                            {priorityBadge(selectedTicket.priority)}
                            {statusBadge(selectedTicket.status)}
                            {selectedTicket.category && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                    {selectedTicket.category}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Customer</p>
                                <p className="text-sm text-gray-900 font-medium">{selectedTicket.customer || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Email</p>
                                <p className="text-sm text-gray-900">{selectedTicket.customerEmail || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Created</p>
                                <p className="text-sm text-gray-900">{selectedTicket.created ? new Date(selectedTicket.created).toLocaleString() : '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Updated</p>
                                <p className="text-sm text-gray-900">{selectedTicket.updated ? new Date(selectedTicket.updated).toLocaleString() : '-'}</p>
                            </div>
                            {selectedTicket.assignedTo && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500 font-medium">Assigned To</p>
                                    <p className="text-sm text-gray-900">{selectedTicket.assignedTo}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-2">Description</p>
                            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
                                {selectedTicket.description || 'No description provided.'}
                            </div>
                        </div>

                        {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-2">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTicket.tags.map((tag: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-md">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-200 pt-4">
                            <p className="text-xs text-gray-500 font-medium mb-2">Quick Status Change</p>
                            <div className="flex flex-wrap gap-2">
                                {STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusChange(selectedTicket.id, s)}
                                        disabled={updatingStatus === selectedTicket.id}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors capitalize ${
                                            selectedTicket.status === s
                                                ? 'bg-cyan-600 text-white border-cyan-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </SlideInDrawer>
        </div>
    )
}
