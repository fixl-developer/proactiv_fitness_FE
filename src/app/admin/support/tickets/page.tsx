'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { SupportTicketService } from '@/services/supportService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import { extractList, extractPagination } from '@/utils/apiResponse'

// Backend enum: priority = low|medium|high|critical, status = open|in-progress|pending|resolved|closed
type TicketPriority = 'low' | 'medium' | 'high' | 'critical'
type TicketStatus = 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed'

interface SupportTicket {
    id: string
    ticketId?: string
    title?: string
    subject?: string
    description: string
    userId?: string
    customerId?: string
    priority: TicketPriority
    status: TicketStatus
    assignedTo?: string
    createdAt?: string
}

export default function SupportTicketsPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState<{
        title: string
        description: string
        priority: TicketPriority
        status: TicketStatus
        assignedTo: string
    }>({
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        assignedTo: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Priority colors
    const priorityColors: Record<string, string> = {
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        critical: 'bg-red-100 text-red-800',
    }

    // Status colors
    const statusColors: Record<string, string> = {
        open: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        pending: 'bg-purple-100 text-purple-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
    }

    const formatLabel = (s: string) =>
        s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

    // Load tickets
    const loadTickets = async () => {
        try {
            setLoading(true)
            const response = await SupportTicketService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
            })
            const list = extractList<any>(response).map((t: any) => ({
                ...t,
                id: t.id || t._id,
            }))
            setTickets(list)
            setTotalPages(extractPagination(response).totalPages)
        } catch (error) {
            console.error('Error loading tickets:', error)
            toast.error('Failed to load support tickets')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTickets()
    }, [currentPage, searchTerm])

    // Validate form (per-field rules)
    const validateFormData = () => {
        const newErrors: Record<string, string> = {}

        const title = formData.title.trim()
        if (!title) newErrors.title = 'Title is required'
        else if (title.length < 3) newErrors.title = 'Title must be at least 3 characters'
        else if (title.length > 150) newErrors.title = 'Title must be under 150 characters'

        const description = formData.description.trim()
        if (!description) newErrors.description = 'Description is required'
        else if (description.length < 10) newErrors.description = 'Description must be at least 10 characters'
        else if (description.length > 2000) newErrors.description = 'Description must be under 2000 characters'

        const validPriorities: TicketPriority[] = ['low', 'medium', 'high', 'critical']
        if (!validPriorities.includes(formData.priority)) newErrors.priority = 'Select a valid priority'

        const validStatuses: TicketStatus[] = ['open', 'in-progress', 'pending', 'resolved', 'closed']
        if (!validStatuses.includes(formData.status)) newErrors.status = 'Select a valid status'

        // Assigned To is a name field — reject digits/special chars when present
        const assignedTo = formData.assignedTo.trim()
        if (assignedTo) {
            if (!/^[A-Za-z][A-Za-z\s.'-]{1,49}$/.test(assignedTo)) {
                newErrors.assignedTo = 'Name must contain only letters, spaces, . \' - (no digits)'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateFormData()) {
            toast.error('Please fix the highlighted fields')
            return
        }

        try {
            setSubmitting(true)

            // Backend expects `subject` (not `title`), priority enum is critical (not urgent),
            // and status uses hyphenated `in-progress` (not `in_progress`).
            const payload: any = {
                subject: formData.title.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
                status: formData.status,
                category: 'general',
            }
            const assignedTo = formData.assignedTo.trim()
            if (assignedTo) payload.assignedTo = assignedTo

            if (editingId) {
                await SupportTicketService.update(editingId, payload)
                toast.success('Ticket updated successfully')
            } else {
                await SupportTicketService.create(payload)
                toast.success('Ticket created successfully')
            }

            setShowForm(false)
            resetForm()
            loadTickets()
        } catch (error) {
            console.error('Error saving ticket:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    // Handle edit
    const handleEdit = (ticket: SupportTicket) => {
        setFormData({
            title: ticket.title || ticket.subject || '',
            description: ticket.description,
            priority: ticket.priority,
            status: ticket.status,
            assignedTo: ticket.assignedTo || '',
        })
        setEditingId(ticket.id)
        setShowForm(true)
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            await SupportTicketService.delete(id)
            toast.success('Ticket deleted successfully')
            setDeleteConfirm(null)
            loadTickets()
        } catch (error) {
            console.error('Error deleting ticket:', error)
            toast.error(getErrorMessage(error))
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            status: 'open',
            assignedTo: '',
        })
        setErrors({})
        setEditingId(null)
    }

    // Handle close drawer
    const handleCloseDrawer = () => {
        setShowForm(false)
        resetForm()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Ticket className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Support Tickets</h1>
                    </div>
                    <p className="text-slate-600">Manage customer support tickets and track resolutions</p>
                </motion.div>

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex gap-4 items-center"
                >
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                            resetForm()
                            setShowForm(true)
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Create Ticket
                    </button>
                </motion.div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-slate-600">Loading tickets...</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No tickets found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Priority</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Assigned To</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Created</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {tickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {ticket.title || ticket.subject}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority] || 'bg-slate-100 text-slate-700'}`}>
                                                        {formatLabel(ticket.priority || '')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status] || 'bg-slate-100 text-slate-700'}`}>
                                                        {formatLabel(ticket.status || '')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {ticket.assignedTo || 'Unassigned'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(ticket)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(ticket.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Form Drawer */}
                <SlideInDrawer
                    isOpen={showForm}
                    onClose={handleCloseDrawer}
                    title={editingId ? 'Edit Ticket' : 'Create New Ticket'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({ ...formData, title: e.target.value })
                                    if (errors.title) setErrors({ ...errors, title: '' })
                                }}
                                placeholder="e.g., Payment processing error"
                                maxLength={150}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.title
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => {
                                    setFormData({ ...formData, description: e.target.value })
                                    if (errors.description) setErrors({ ...errors, description: '' })
                                }}
                                placeholder="Detailed description of the issue..."
                                rows={4}
                                maxLength={2000}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.description
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Priority <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        priority: e.target.value as TicketPriority,
                                    })
                                    if (errors.priority) setErrors({ ...errors, priority: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.priority
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                            {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority}</p>}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        status: e.target.value as TicketStatus,
                                    })
                                    if (errors.status) setErrors({ ...errors, status: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            >
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>

                        {/* Assigned To */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Assigned To
                            </label>
                            <input
                                type="text"
                                value={formData.assignedTo}
                                onChange={(e) => {
                                    // Name field — strip any digit the user types
                                    const cleaned = e.target.value.replace(/[0-9]/g, '')
                                    setFormData({ ...formData, assignedTo: cleaned })
                                    if (errors.assignedTo) setErrors({ ...errors, assignedTo: '' })
                                }}
                                placeholder="e.g., John Doe"
                                maxLength={50}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.assignedTo
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.assignedTo && <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>}
                            <p className="mt-1 text-xs text-slate-500">Leave empty for unassigned. Letters only.</p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={handleCloseDrawer}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {submitting ? 'Saving...' : editingId ? 'Update Ticket' : 'Create Ticket'}
                            </button>
                        </div>
                    </form>
                </SlideInDrawer>

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-lg p-6 max-w-sm"
                        >
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Ticket?</h3>
                            <p className="text-slate-600 mb-6">
                                This action cannot be undone. The ticket and all associated data will be permanently deleted.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}
