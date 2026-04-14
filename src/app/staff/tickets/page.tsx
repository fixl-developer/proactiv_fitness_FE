'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService, SupportTicket } from '@/services/supportStaffService'
import { Plus, Search, Ticket, AlertCircle, Clock, CheckCircle, X, ChevronDown } from 'lucide-react'
import { validateRequired, validateEmail, validateTextArea, validateName, filterNameInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { toast } from 'sonner'

export default function SupportTickets() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 1, limit: 10 })
    const [total, setTotal] = useState(0)
    const [pages, setPages] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    // New Ticket modal state
    const [showNewTicketModal, setShowNewTicketModal] = useState(false)
    const [newTicketForm, setNewTicketForm] = useState({
        subject: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
        category: '',
        customer: '',
        customerEmail: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Ticket detail modal state
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)

    // Status dropdown state
    const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
    const statusDropdownRef = useRef<HTMLDivElement>(null)

    // Stats
    const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 })

    const loadTickets = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await supportStaffService.getTickets(filters)
            const ticketList = data?.tickets || []
            setTickets(ticketList)
            setTotal(data?.total || 0)
            setPages(data?.pages || 0)

            // Compute stats from all tickets if no filters, otherwise from response
            const totalCount = data?.total || ticketList.length
            const openCount = ticketList.filter((t: SupportTicket) => t.status === 'open').length
            const inProgressCount = ticketList.filter((t: SupportTicket) => t.status === 'in-progress').length
            const resolvedCount = ticketList.filter((t: SupportTicket) => t.status === 'resolved').length
            setStats({ total: totalCount, open: openCount, inProgress: inProgressCount, resolved: resolvedCount })
        } catch {
            setTickets([])
            setTotal(0)
            setStats({ total: 0, open: 0, inProgress: 0, resolved: 0 })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadTickets()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, router, filters])

    // Close status dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
                setStatusDropdownId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = () => {
        setFilters({ ...filters, search: searchQuery.trim(), page: 1 })
    }

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        const newErrors: Record<string, string> = {}
        const subErr = validateRequired(newTicketForm.subject, 'Subject')
        if (subErr) newErrors.subject = subErr
        const descErr = validateTextArea(newTicketForm.description, 'Description', 5, 5000)
        if (descErr) newErrors.description = descErr
        const custErr = validateName(newTicketForm.customer, 'Customer Name')
        if (custErr) newErrors.customer = custErr
        const emailErr = validateEmail(newTicketForm.customerEmail)
        if (emailErr) newErrors.customerEmail = emailErr
        setFormErrors(newErrors)
        if (Object.keys(newErrors).length > 0) return
        setSubmitting(true)
        try {
            await supportStaffService.createTicket({
                subject: newTicketForm.subject,
                description: newTicketForm.description,
                priority: newTicketForm.priority,
                category: newTicketForm.category,
                customer: newTicketForm.customer,
                customerEmail: newTicketForm.customerEmail,
            })
            setShowNewTicketModal(false)
            setNewTicketForm({ subject: '', description: '', priority: 'medium', category: '', customer: '', customerEmail: '' })
            toast.success('Ticket created successfully')
            loadTickets()
        } catch {
            toast.error('Failed to create ticket. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
        setUpdatingStatus(ticketId)
        try {
            await supportStaffService.updateTicket(ticketId, { status: newStatus })
            setStatusDropdownId(null)
            toast.success('Ticket status updated')
            loadTickets()
        } catch {
            toast.error('Failed to update ticket status.')
        } finally {
            setUpdatingStatus(null)
        }
    }

    const priorityBadge = (priority: string) => {
        const cls =
            priority === 'critical' ? 'bg-red-100 text-red-800' :
            priority === 'high' ? 'bg-orange-100 text-orange-800' :
            priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{priority}</span>
    }

    const statusBadge = (status: string) => {
        const cls =
            status === 'open' ? 'bg-blue-100 text-blue-800' :
            status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
            status === 'resolved' ? 'bg-green-100 text-green-800' :
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
        return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{status}</span>
    }

    const statuses: SupportTicket['status'][] = ['open', 'in-progress', 'pending', 'resolved', 'closed']

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900">Support Tickets</h1>
                    <button
                        id="staff-tickets-btn"
                        onClick={() => setShowNewTicketModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Ticket
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Total Tickets - Blue */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                <Ticket className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Tickets</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>

                    {/* Open - Orange */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Open</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                    </div>

                    {/* In Progress - Purple */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">In Progress</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                    </div>

                    {/* Resolved - Green */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
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
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            id="btn-staff-tickets-1"
                            onClick={handleSearch}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Search
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            id="select-staff-tickets-2"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select
                            id="select-staff-tickets-3"
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </div>

                {/* Tickets Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading tickets...</p>
                        </div>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No tickets found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your filters or create a new ticket.</p>
                        <button
                            onClick={() => setShowNewTicketModal(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Ticket
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">ID</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Subject</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Customer</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Priority</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Category</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => setSelectedTicket(ticket)}
                                    >
                                        <td className="py-3 px-6 text-blue-600 font-medium">{ticket.id}</td>
                                        <td className="py-3 px-6 text-gray-900">{ticket.subject}</td>
                                        <td className="py-3 px-6 text-gray-600">{ticket.customer}</td>
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
                                                    {statuses.map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleStatusChange(ticket.id, s)
                                                            }}
                                                            disabled={updatingStatus === ticket.id}
                                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                                                ticket.status === s ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-700'
                                                            } ${updatingStatus === ticket.id ? 'opacity-50' : ''}`}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 text-gray-600">{ticket.category || '-'}</td>
                                        <td className="py-3 px-6 text-gray-600">
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
                <div className="mt-6 flex justify-between items-center">
                    <p className="text-gray-600">
                        Showing {tickets.length} of {total} tickets
                        {pages > 0 && <span className="ml-1">(Page {filters.page} of {pages})</span>}
                    </p>
                    <div className="flex gap-2">
                        <button
                            id="staff-tickets-btn-2"
                            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                            disabled={filters.page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            id="staff-tickets-btn-3"
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                            disabled={filters.page >= pages || tickets.length < filters.limit}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* New Ticket Modal */}
            {showNewTicketModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowNewTicketModal(false)}
                    />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Create New Ticket</h2>
                            <button
                                onClick={() => setShowNewTicketModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={newTicketForm.subject}
                                    onChange={(e) => {
                                        setNewTicketForm({ ...newTicketForm, subject: e.target.value })
                                        const err = validateRequired(e.target.value, 'Subject')
                                        setFormErrors(prev => { const n = { ...prev }; if (err) n.subject = err; else delete n.subject; return n })
                                    }}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.subject ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Ticket subject"
                                />
                                <FormFieldHint hint={FORMAT_HINTS.subject} error={formErrors.subject} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={newTicketForm.description}
                                    onChange={(e) => {
                                        setNewTicketForm({ ...newTicketForm, description: e.target.value })
                                        const err = validateTextArea(e.target.value, 'Description', 5, 5000)
                                        setFormErrors(prev => { const n = { ...prev }; if (err) n.description = err; else delete n.description; return n })
                                    }}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Describe the issue..."
                                />
                                <FormFieldHint hint={FORMAT_HINTS.description} error={formErrors.description} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={newTicketForm.priority}
                                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value as any })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={newTicketForm.category}
                                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Billing, Technical, General"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newTicketForm.customer}
                                    onKeyDown={filterNameInput}
                                    onChange={(e) => {
                                        setNewTicketForm({ ...newTicketForm, customer: e.target.value })
                                        const err = validateName(e.target.value, 'Customer Name')
                                        setFormErrors(prev => { const n = { ...prev }; if (err) n.customer = err; else delete n.customer; return n })
                                    }}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.customer ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Customer full name"
                                />
                                <FormFieldHint hint={FORMAT_HINTS.name} error={formErrors.customer} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newTicketForm.customerEmail}
                                    onChange={(e) => {
                                        setNewTicketForm({ ...newTicketForm, customerEmail: e.target.value })
                                        const err = validateEmail(e.target.value)
                                        setFormErrors(prev => { const n = { ...prev }; if (err) n.customerEmail = err; else delete n.customerEmail; return n })
                                    }}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.customerEmail ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="customer@example.com"
                                />
                                <FormFieldHint hint={FORMAT_HINTS.email} error={formErrors.customerEmail} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowNewTicketModal(false)}
                                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    )}
                                    {submitting ? 'Creating...' : 'Create Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedTicket(null)}
                    />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                                <p className="text-sm text-gray-500 mt-1">Ticket {selectedTicket.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
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
                                    <p className="text-sm text-gray-900 font-medium">{selectedTicket.customer}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Email</p>
                                    <p className="text-sm text-gray-900">{selectedTicket.customerEmail}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Created</p>
                                    <p className="text-sm text-gray-900">
                                        {selectedTicket.created ? new Date(selectedTicket.created).toLocaleString() : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Updated</p>
                                    <p className="text-sm text-gray-900">
                                        {selectedTicket.updated ? new Date(selectedTicket.updated).toLocaleString() : '-'}
                                    </p>
                                </div>
                                {selectedTicket.assignedTo && (
                                    <div>
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

                            {selectedTicket.resolution && (
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-2">Resolution</p>
                                    <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
                                        {selectedTicket.resolution}
                                    </div>
                                </div>
                            )}

                            {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 font-medium mb-2">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTicket.tags.map((tag, i) => (
                                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick status change in detail modal */}
                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-xs text-gray-500 font-medium mb-2">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {statuses.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => {
                                                handleStatusChange(selectedTicket.id, s)
                                                setSelectedTicket({ ...selectedTicket, status: s })
                                            }}
                                            disabled={updatingStatus === selectedTicket.id}
                                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                                selectedTicket.status === s
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            } ${updatingStatus === selectedTicket.id ? 'opacity-50' : ''}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end p-6 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
