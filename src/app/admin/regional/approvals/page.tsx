'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle, XCircle, Clock, AlertCircle, Search,
    Plus, TrendingUp, X, Loader2, Eye
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { RegionalAdminService } from '@/services/regionalAdminService'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { validateAlphaText } from '@/utils/validation'

const APPROVAL_TYPES = [
    { value: 'STAFF_HIRING', label: 'Staff Hiring' },
    { value: 'BUDGET_ALLOCATION', label: 'Budget Allocation' },
    { value: 'FACILITY_UPGRADE', label: 'Facility Upgrade' },
    { value: 'PROGRAM_LAUNCH', label: 'Program Launch' },
    { value: 'PRICE_CHANGE', label: 'Price Change' },
    { value: 'OTHER', label: 'Other' },
]

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export default function RegionalApprovalsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [approvals, setApprovals] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    // New Request drawer state
    const [newOpen, setNewOpen] = useState(false)
    const [newForm, setNewForm] = useState({ type: 'STAFF_HIRING', title: '', description: '', priority: 'MEDIUM', location: '', details: '' })
    const [newErrors, setNewErrors] = useState<Record<string, string>>({})
    const [creating, setCreating] = useState(false)

    // Rejection drawer state
    const [rejectTarget, setRejectTarget] = useState<any | null>(null)
    const [rejectReason, setRejectReason] = useState('')
    const [rejectError, setRejectError] = useState<string | null>(null)
    const [rejecting, setRejecting] = useState(false)

    // Approve confirmation drawer
    const [approveTarget, setApproveTarget] = useState<any | null>(null)
    const [approveNotes, setApproveNotes] = useState('')
    const [approving, setApproving] = useState(false)

    // View details drawer
    const [viewTarget, setViewTarget] = useState<any | null>(null)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 4000)
        return () => clearTimeout(t)
    }, [toast])

    const fetchApprovals = useCallback(async () => {
        try {
            setIsLoading(true)
            const resp = await RegionalAdminService.getPendingApprovals(1, 50, filterStatus, filterType)
            setApprovals(Array.isArray(resp?.data) ? resp.data : [])
        } catch (err: any) {
            console.error('Error fetching approvals:', err)
            setToast({ message: err?.message || 'Failed to load approvals', type: 'error' })
            setApprovals([])
        } finally {
            setIsLoading(false)
        }
    }, [filterStatus, filterType])

    useEffect(() => { fetchApprovals() }, [fetchApprovals])

    const handleApproveConfirm = async () => {
        if (!approveTarget) return
        setApproving(true)
        try {
            await RegionalAdminService.approveRequest(approveTarget.id, approveNotes || undefined)
            setApprovals(prev => prev.map(a => a.id === approveTarget.id ? { ...a, status: 'APPROVED' } : a))
            setToast({ message: 'Request approved successfully!', type: 'success' })
            setApproveTarget(null); setApproveNotes('')
        } catch (err: any) {
            setToast({ message: err?.message || 'Failed to approve', type: 'error' })
        } finally {
            setApproving(false)
        }
    }

    const handleRejectConfirm = async () => {
        if (!rejectTarget) return
        if (!rejectReason.trim() || rejectReason.trim().length < 3) {
            setRejectError('Please enter a rejection reason (min 3 characters)')
            return
        }
        setRejecting(true)
        setRejectError(null)
        try {
            await RegionalAdminService.rejectRequest(rejectTarget.id, rejectReason.trim())
            setApprovals(prev => prev.map(a => a.id === rejectTarget.id ? { ...a, status: 'REJECTED' } : a))
            setToast({ message: 'Request rejected', type: 'success' })
            setRejectTarget(null); setRejectReason('')
        } catch (err: any) {
            setToast({ message: err?.message || 'Failed to reject', type: 'error' })
        } finally {
            setRejecting(false)
        }
    }

    const validateNewForm = (): boolean => {
        const errs: Record<string, string> = {}
        if (!newForm.type) errs.type = 'Type is required'
        if (!newForm.title.trim()) errs.title = 'Title is required'
        else if (newForm.title.trim().length < 3) errs.title = 'Title must be at least 3 characters'
        if (newForm.description && newForm.description.length > 500) errs.description = 'Description must be less than 500 characters'
        if (!newForm.priority) errs.priority = 'Priority is required'
        // Location — when provided, must be alphabetic only (no "Boston@123"
        // style input). Optional, so empty is allowed.
        if (newForm.location && newForm.location.trim()) {
            const locErr = validateAlphaText(newForm.location, 'Location', 80)
            if (locErr) errs.location = locErr
        }
        setNewErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleCreateRequest = async () => {
        if (!validateNewForm()) return
        setCreating(true)
        try {
            await RegionalAdminService.createApprovalRequest({
                type: newForm.type,
                title: newForm.title.trim(),
                description: newForm.description.trim() || undefined,
                priority: newForm.priority,
                location: newForm.location.trim() || undefined,
                details: newForm.details.trim() || undefined,
            })
            setToast({ message: 'Request created successfully', type: 'success' })
            setNewOpen(false)
            setNewForm({ type: 'STAFF_HIRING', title: '', description: '', priority: 'MEDIUM', location: '', details: '' })
            setNewErrors({})
            fetchApprovals()
        } catch (err: any) {
            setToast({ message: err?.message || 'Failed to create request', type: 'error' })
        } finally {
            setCreating(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-50 border-yellow-200'
            case 'APPROVED': return 'bg-green-50 border-green-200'
            case 'REJECTED': return 'bg-red-50 border-red-200'
            default: return 'bg-gray-50 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-5 h-5 text-yellow-600" />
            case 'APPROVED': return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'REJECTED': return <XCircle className="w-5 h-5 text-red-600" />
            default: return null
        }
    }

    const filteredApprovals = approvals.filter(a => {
        const matchesSearch = !searchTerm || (a.title || '').toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Approvals & Requests</h1>
                    <p className="text-gray-600 mt-1">Manage pending approvals and requests</p>
                </div>
                <button
                    id="admin-regional-approvals-btn-new"
                    onClick={() => setNewOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Request
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Requests', value: approvals.length, icon: TrendingUp, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
                    { label: 'Pending', value: approvals.filter(a => a.status === 'PENDING').length, icon: Clock, gradient: 'from-yellow-500 to-amber-600', bgGradient: 'from-yellow-50 to-amber-100' },
                    { label: 'Approved', value: approvals.filter(a => a.status === 'APPROVED').length, icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
                    { label: 'Rejected', value: approvals.filter(a => a.status === 'REJECTED').length, icon: XCircle, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
                ].map((stat, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${stat.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search approvals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            id="select-admin-regional-approvals-status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <select
                            id="select-admin-regional-approvals-type"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            {APPROVAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            <div className="space-y-4">
                {filteredApprovals.map((approval, idx) => (
                    <motion.div
                        key={approval.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className={`border-2 ${getStatusColor(approval.status)}`}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusIcon(approval.status)}
                                            <h3 className="text-lg font-semibold text-gray-900">{approval.title}</h3>
                                            <Badge variant={approval.priority === 'HIGH' || approval.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                                                {approval.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{approval.description}</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Requested By</p>
                                                <p className="font-medium text-gray-900">{approval.requestedBy}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Date</p>
                                                <p className="font-medium text-gray-900">{approval.requestedDate ? new Date(approval.requestedDate).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Location</p>
                                                <p className="font-medium text-gray-900">{approval.location}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Status</p>
                                                <Badge variant={approval.status === 'APPROVED' ? 'default' : approval.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                    {approval.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            id="admin-regional-approvals-btn-view"
                                            onClick={() => setViewTarget(approval)}
                                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                        {approval.status === 'PENDING' && (
                                            <>
                                                <button
                                                    id="admin-regional-approvals-btn-approve"
                                                    onClick={() => setApproveTarget(approval)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    id="admin-regional-approvals-btn-reject"
                                                    onClick={() => setRejectTarget(approval)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredApprovals.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No approvals found</p>
                    </CardContent>
                </Card>
            )}

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${
                            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}
                    >
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Request Drawer */}
            <SlideInDrawer
                isOpen={newOpen}
                onClose={() => { setNewOpen(false); setNewErrors({}) }}
                title="New Approval Request"
                description="Submit a new request for approval"
                size="lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                        <select
                            value={newForm.type}
                            onChange={(e) => setNewForm(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {APPROVAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <FormFieldHint hint="Choose the category of your request" error={newErrors.type} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <Input
                            value={newForm.title}
                            onChange={(e) => setNewForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Short descriptive title"
                            className={newErrors.title ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="3-120 characters" error={newErrors.title} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                        <select
                            value={newForm.priority}
                            onChange={(e) => setNewForm(prev => ({ ...prev, priority: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <Input
                            value={newForm.location}
                            onChange={(e) => {
                                setNewForm(prev => ({ ...prev, location: e.target.value }))
                                if (newErrors.location) setNewErrors(prev => { const n = { ...prev }; delete n.location; return n })
                            }}
                            placeholder="e.g. Boston Downtown"
                            maxLength={80}
                            className={newErrors.location ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="Letters and basic punctuation only — no digits or special characters" error={newErrors.location} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={newForm.description}
                            onChange={(e) => setNewForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            placeholder="Brief description of the request"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${newErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint="Max 500 characters" error={newErrors.description} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                        <textarea
                            value={newForm.details}
                            onChange={(e) => setNewForm(prev => ({ ...prev, details: e.target.value }))}
                            rows={4}
                            placeholder="Additional details or justification"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button
                            type="button"
                            onClick={() => setNewOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={creating}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateRequest}
                            disabled={creating}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                            Submit Request
                        </button>
                    </div>
                </div>
            </SlideInDrawer>

            {/* Rejection Drawer */}
            <SlideInDrawer
                isOpen={!!rejectTarget}
                onClose={() => { setRejectTarget(null); setRejectReason(''); setRejectError(null) }}
                title="Reject Request"
                description={rejectTarget?.title || ''}
                size="md"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                            You are about to reject this request. Please provide a clear reason so the requester understands your decision.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason *</label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => { setRejectReason(e.target.value); if (rejectError) setRejectError(null) }}
                            rows={5}
                            placeholder="Explain why this request is being rejected..."
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${rejectError ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint="Minimum 3 characters" error={rejectError || undefined} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button
                            type="button"
                            onClick={() => { setRejectTarget(null); setRejectReason('') }}
                            disabled={rejecting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleRejectConfirm}
                            disabled={rejecting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {rejecting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Confirm Reject
                        </button>
                    </div>
                </div>
            </SlideInDrawer>

            {/* Approve Confirmation Drawer */}
            <SlideInDrawer
                isOpen={!!approveTarget}
                onClose={() => { setApproveTarget(null); setApproveNotes('') }}
                title="Approve Request"
                description={approveTarget?.title || ''}
                size="md"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            Confirm approval of this request. You may add optional notes.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approval Notes</label>
                        <textarea
                            value={approveNotes}
                            onChange={(e) => setApproveNotes(e.target.value)}
                            rows={4}
                            placeholder="Optional notes for the requester..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button
                            type="button"
                            onClick={() => { setApproveTarget(null); setApproveNotes('') }}
                            disabled={approving}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleApproveConfirm}
                            disabled={approving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {approving && <Loader2 className="w-4 h-4 animate-spin" />}
                            Confirm Approve
                        </button>
                    </div>
                </div>
            </SlideInDrawer>

            {/* View Details Drawer */}
            <SlideInDrawer
                isOpen={!!viewTarget}
                onClose={() => setViewTarget(null)}
                title="Request Details"
                description={viewTarget?.title || ''}
                size="md"
            >
                {viewTarget && (
                    <div className="space-y-3">
                        {[
                            ['Title', viewTarget.title],
                            ['Type', viewTarget.type],
                            ['Priority', viewTarget.priority],
                            ['Status', viewTarget.status],
                            ['Requested By', viewTarget.requestedBy],
                            ['Date', viewTarget.requestedDate ? new Date(viewTarget.requestedDate).toLocaleString() : 'N/A'],
                            ['Location', viewTarget.location],
                            ['Description', viewTarget.description],
                            ['Details', viewTarget.details],
                        ].map(([label, value]) => (
                            <div key={label} className="py-2 border-b border-gray-100 last:border-0">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                                <p className="text-sm text-gray-900">{value || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </SlideInDrawer>
        </div>
    )
}
