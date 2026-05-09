'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import { AlertTriangle, Clock, Eye, CheckCircle, Plus, AlertCircle, MoreVertical, RefreshCw, Trash2 } from 'lucide-react'
import { validateRequired, validateName, validateTextArea, filterNameInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { toast } from 'sonner'

interface Escalation {
    id: string
    escalationId?: string
    ticketId: string
    title: string
    customer: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    status: 'pending' | 'acknowledged' | 'resolved'
    escalatedAt: string
    reason?: string
}

interface CreateForm {
    ticketId: string
    title: string
    customer: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    reason: string
}

const emptyForm: CreateForm = { ticketId: '', title: '', customer: '', priority: 'medium', reason: '' }

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
}
const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    acknowledged: 'bg-cyan-100 text-cyan-800',
    resolved: 'bg-green-100 text-green-800',
}

const STATUSES = ['pending', 'acknowledged', 'resolved'] as const
const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const

export default function Escalations() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [escalations, setEscalations] = useState<Escalation[]>([])
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
    const [form, setForm] = useState<CreateForm>(emptyForm)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const loadEscalations = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await supportStaffService.getEscalations()
            setEscalations(data?.escalations || [])
        } catch (err: any) {
            setEscalations([])
            setError(err?.response?.data?.message || 'Failed to load escalations')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        loadEscalations()
    }, [isAuthenticated, router])

    const validateForm = (): Record<string, string> => {
        const errs: Record<string, string> = {}
        const tk = validateRequired(form.ticketId, 'Ticket ID'); if (tk) errs.ticketId = tk
        const ti = validateRequired(form.title, 'Title'); if (ti) errs.title = ti
        const c = validateName(form.customer, 'Customer Name'); if (c) errs.customer = c
        const r = validateTextArea(form.reason, 'Reason', 5, 2000); if (r) errs.reason = r
        return errs
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validateForm()
        setFormErrors(errs)
        if (Object.keys(errs).length > 0) return
        setCreating(true)
        try {
            await supportStaffService.createEscalation({
                ticketId: form.ticketId.trim(),
                title: form.title.trim(),
                customer: form.customer.trim(),
                priority: form.priority,
                reason: form.reason.trim(),
            })
            setDrawerOpen(false)
            setForm(emptyForm)
            toast.success('Escalation created')
            await loadEscalations()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to create escalation')
        } finally {
            setCreating(false)
        }
    }

    const handleUpdateStatus = async (escalationId: string, newStatus: string) => {
        setUpdatingStatus(escalationId)
        try {
            await supportStaffService.updateEscalation(escalationId, { status: newStatus })
            setStatusDropdownId(null)
            toast.success(`Marked ${newStatus}`)
            await loadEscalations()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update status')
        } finally {
            setUpdatingStatus(null)
        }
    }

    const handleDelete = async (esc: Escalation) => {
        if (!confirm(`Delete escalation "${esc.title}"?`)) return
        try {
            const id = esc.escalationId || esc.id
            const apiClient = (await import('@/services/api/client')).apiClient
            await apiClient.delete(`/staff/escalations/${id}`)
            toast.success('Escalation deleted')
            await loadEscalations()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to delete escalation')
        }
    }

    const totalEscalations = escalations.length
    const pendingCount = escalations.filter((e) => e.status === 'pending').length
    const acknowledgedCount = escalations.filter((e) => e.status === 'acknowledged').length
    const resolvedCount = escalations.filter((e) => e.status === 'resolved').length

    if (!isAuthenticated) return null

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Escalations</h1>
                        <p className="text-sm text-gray-500 mt-1">Critical tickets requiring senior attention</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={loadEscalations}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            id="staff-escalations-btn-create"
                            onClick={() => { setForm(emptyForm); setFormErrors({}); setDrawerOpen(true) }}
                            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 inline-flex items-center gap-2 text-sm font-medium shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> New Escalation
                        </button>
                    </div>
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
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Escalations</p>
                        <p className="text-2xl font-bold text-gray-900">{totalEscalations}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Eye className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Acknowledged</p>
                        <p className="text-2xl font-bold text-gray-900">{acknowledgedCount}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Resolved</p>
                        <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                    </div>
                ) : escalations.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Escalations Found</h3>
                        <p className="text-gray-500 mb-4 text-sm">There are no escalations at the moment.</p>
                        <button
                            onClick={() => { setForm(emptyForm); setDrawerOpen(true) }}
                            className="inline-flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-700 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Create First Escalation
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">ID</th>
                                        <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">Ticket ID</th>
                                        <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">Title</th>
                                        <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">Customer</th>
                                        <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">Priority</th>
                                        <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">Status</th>
                                        <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">Escalated At</th>
                                        <th className="text-left py-3 px-5 font-semibold text-gray-700 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {escalations.map((escalation) => (
                                        <tr key={escalation.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-5 text-gray-500 text-xs font-mono">{escalation.id}</td>
                                            <td className="py-3 px-5 text-cyan-600 font-medium text-sm">{escalation.ticketId}</td>
                                            <td className="py-3 px-5 text-gray-900 text-sm max-w-xs truncate">{escalation.title}</td>
                                            <td className="py-3 px-5 text-gray-700 text-sm">{escalation.customer}</td>
                                            <td className="py-3 px-5">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${priorityColors[escalation.priority] || 'bg-gray-100 text-gray-800'}`}>
                                                    {escalation.priority}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[escalation.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {escalation.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-gray-600 text-sm">
                                                {escalation.escalatedAt
                                                    ? new Date(escalation.escalatedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                                    })
                                                    : '-'}
                                            </td>
                                            <td className="py-3 px-5 relative">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setStatusDropdownId(statusDropdownId === escalation.id ? null : escalation.id)}
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                                                        title="Update Status"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(escalation)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {statusDropdownId === escalation.id && (
                                                    <div className="absolute right-5 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[160px]">
                                                        <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                            Update Status
                                                        </p>
                                                        {STATUSES.map((status) => (
                                                            <button
                                                                key={status}
                                                                disabled={escalation.status === status || updatingStatus === escalation.id}
                                                                onClick={() => handleUpdateStatus(escalation.id, status)}
                                                                className={`w-full text-left px-3 py-2 text-sm capitalize transition-colors ${
                                                                    escalation.status === status
                                                                        ? 'text-gray-300 cursor-not-allowed'
                                                                        : 'text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                {updatingStatus === escalation.id ? 'Updating…' : status}
                                                            </button>
                                                        ))}
                                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                                            <button
                                                                onClick={() => setStatusDropdownId(null)}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
                                                            >Cancel</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE DRAWER (right side) */}
            <SlideInDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setForm(emptyForm); setFormErrors({}) }}
                title="New Escalation"
                description="Escalate a critical ticket for senior review"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setDrawerOpen(false); setForm(emptyForm) }}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                        >Cancel</button>
                        <button
                            type="submit"
                            form="escalation-form"
                            disabled={creating}
                            className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 inline-flex items-center gap-2 text-sm font-medium"
                        >
                            {creating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                            {creating ? 'Creating…' : 'Create Escalation'}
                        </button>
                    </div>
                }
            >
                <form id="escalation-form" onSubmit={handleCreate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ticket ID <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.ticketId}
                            onChange={(e) => {
                                setForm({ ...form, ticketId: e.target.value })
                                const err = validateRequired(e.target.value, 'Ticket ID')
                                setFormErrors(p => { const n = { ...p }; if (err) n.ticketId = err; else delete n.ticketId; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.ticketId ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g. TKT-1778012781140-JGLBV9"
                        />
                        <FormFieldHint hint="ID of the ticket being escalated" error={formErrors.ticketId} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => {
                                setForm({ ...form, title: e.target.value })
                                const err = validateRequired(e.target.value, 'Title')
                                setFormErrors(p => { const n = { ...p }; if (err) n.title = err; else delete n.title; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Brief summary of the escalation"
                        />
                        <FormFieldHint hint="" error={formErrors.title} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer <span className="text-red-500">*</span></label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
                        <textarea
                            rows={5}
                            value={form.reason}
                            onChange={(e) => {
                                setForm({ ...form, reason: e.target.value })
                                const err = validateTextArea(e.target.value, 'Reason', 5, 2000)
                                setFormErrors(p => { const n = { ...p }; if (err) n.reason = err; else delete n.reason; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${formErrors.reason ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Explain why this ticket needs to be escalated…"
                        />
                        <FormFieldHint hint="Minimum 5 characters" error={formErrors.reason} />
                    </div>
                </form>
            </SlideInDrawer>
        </div>
    )
}
