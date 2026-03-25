'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import { AlertTriangle, Clock, Eye, CheckCircle, Plus, X, AlertCircle, MoreVertical } from 'lucide-react'

interface Escalation {
    id: string
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

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    acknowledged: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
}

export default function Escalations() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [escalations, setEscalations] = useState<Escalation[]>([])
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [creating, setCreating] = useState(false)
    const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
    const [createForm, setCreateForm] = useState<CreateForm>({
        ticketId: '',
        title: '',
        customer: '',
        priority: 'medium',
        reason: '',
    })

    const loadEscalations = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await supportStaffService.getEscalations()
            setEscalations(data?.escalations || [])
        } catch {
            setEscalations([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadEscalations()
    }, [isAuthenticated, router])

    const handleCreateEscalation = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        setError(null)
        try {
            await supportStaffService.createEscalation(createForm)
            setShowCreateModal(false)
            setCreateForm({ ticketId: '', title: '', customer: '', priority: 'medium', reason: '' })
            await loadEscalations()
        } catch {
            setError('Failed to create escalation. Please try again.')
        } finally {
            setCreating(false)
        }
    }

    const handleUpdateStatus = async (escalationId: string, newStatus: string) => {
        setUpdatingStatus(escalationId)
        setError(null)
        try {
            await supportStaffService.updateEscalation(escalationId, { status: newStatus })
            setStatusDropdownId(null)
            await loadEscalations()
        } catch {
            setError('Failed to update escalation status. Please try again.')
        } finally {
            setUpdatingStatus(null)
        }
    }

    // Stats derived from data
    const totalEscalations = escalations.length
    const pendingCount = escalations.filter((e) => e.status === 'pending').length
    const acknowledgedCount = escalations.filter((e) => e.status === 'acknowledged').length
    const resolvedCount = escalations.filter((e) => e.status === 'resolved').length

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Escalations</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        New Escalation
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Total Escalations */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Escalations</p>
                        <p className="text-2xl font-bold text-gray-900">{totalEscalations}</p>
                    </div>

                    {/* Pending */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                    </div>

                    {/* Acknowledged */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                <Eye className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Acknowledged</p>
                        <p className="text-2xl font-bold text-gray-900">{acknowledgedCount}</p>
                    </div>

                    {/* Resolved */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-emerald-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Resolved</p>
                        <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading escalations...</p>
                        </div>
                    </div>
                ) : escalations.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Escalations Found</h3>
                        <p className="text-gray-500 mb-4">There are no escalations at the moment.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create First Escalation
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
                                        <tr key={escalation.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-5 text-gray-500 text-sm font-mono">{escalation.id}</td>
                                            <td className="py-3 px-5 text-blue-600 font-medium text-sm">{escalation.ticketId}</td>
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
                                                          year: 'numeric',
                                                          month: 'short',
                                                          day: 'numeric',
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      })
                                                    : '-'}
                                            </td>
                                            <td className="py-3 px-5 relative">
                                                <button
                                                    onClick={() =>
                                                        setStatusDropdownId(statusDropdownId === escalation.id ? null : escalation.id)
                                                    }
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                                                    title="Update Status"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                                {statusDropdownId === escalation.id && (
                                                    <div className="absolute right-5 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[160px]">
                                                        <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                            Update Status
                                                        </p>
                                                        {(['pending', 'acknowledged', 'resolved'] as const).map((status) => (
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
                                                                {updatingStatus === escalation.id ? 'Updating...' : status}
                                                            </button>
                                                        ))}
                                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                                            <button
                                                                onClick={() => setStatusDropdownId(null)}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
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

            {/* Create Escalation Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-gray-900">Create New Escalation</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateEscalation} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket ID</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.ticketId}
                                    onChange={(e) => setCreateForm({ ...createForm, ticketId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                                    placeholder="e.g. TKT-001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.title}
                                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                                    placeholder="Brief description of the escalation"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.customer}
                                    onChange={(e) => setCreateForm({ ...createForm, customer: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                                    placeholder="Customer full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={createForm.priority}
                                    onChange={(e) =>
                                        setCreateForm({
                                            ...createForm,
                                            priority: e.target.value as CreateForm['priority'],
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={createForm.reason}
                                    onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                                    placeholder="Explain why this ticket is being escalated..."
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {creating ? 'Creating...' : 'Create Escalation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
