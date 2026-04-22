'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { AuditLogService } from '@/services/reportsService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface AuditLog {
    id: string
    date: string
    action: 'create' | 'update' | 'delete' | 'view' | 'export'
    entityType: 'user' | 'payment' | 'booking' | 'staff'
    entityId: string
    userId: string
    changes?: string
    status: 'success' | 'failed'
    createdAt?: string
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        date: '',
        action: 'create' as const,
        entityType: 'user' as const,
        entityId: '',
        userId: '',
        changes: '',
        status: 'success' as const,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const actionOptions = ['create', 'update', 'delete', 'view', 'export']
    const entityTypeOptions = ['user', 'payment', 'booking', 'staff']
    const statusOptions = ['success', 'failed']

    const actionColors: Record<string, string> = {
        create: 'bg-green-100 text-green-800',
        update: 'bg-blue-100 text-blue-800',
        delete: 'bg-red-100 text-red-800',
        view: 'bg-gray-100 text-gray-800',
        export: 'bg-purple-100 text-purple-800',
    }

    const statusColors: Record<string, string> = {
        success: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
    }

    // Load logs
    const loadLogs = async () => {
        try {
            setLoading(true)
            const response = await AuditLogService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
            })
            setLogs(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading logs:', error)
            toast.error('Failed to load audit logs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLogs()
    }, [currentPage, searchTerm])

    // Validate form
    const validateFormData = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.date) newErrors.date = 'Date is required'

        if (!formData.action) newErrors.action = 'Action is required'

        if (!formData.entityType) newErrors.entityType = 'Entity type is required'

        if (!formData.entityId) newErrors.entityId = 'Entity ID is required'
        else if (formData.entityId.length < 2) newErrors.entityId = 'Entity ID must be at least 2 characters'

        if (!formData.userId) newErrors.userId = 'User ID is required'
        else if (formData.userId.length < 2) newErrors.userId = 'User ID must be at least 2 characters'

        if (!formData.status) newErrors.status = 'Status is required'

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

            if (editingId) {
                await AuditLogService.update(editingId, formData)
                toast.success('Audit log updated successfully')
            } else {
                await AuditLogService.create(formData)
                toast.success('Audit log created successfully')
            }

            setShowForm(false)
            resetForm()
            loadLogs()
        } catch (error) {
            console.error('Error saving log:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    // Handle edit
    const handleEdit = (log: AuditLog) => {
        setFormData({
            date: log.date,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            userId: log.userId,
            changes: log.changes || '',
            status: log.status,
        })
        setEditingId(log.id)
        setShowForm(true)
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            await AuditLogService.delete(id)
            toast.success('Audit log deleted successfully')
            setDeleteConfirm(null)
            loadLogs()
        } catch (error) {
            console.error('Error deleting log:', error)
            toast.error(getErrorMessage(error))
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            date: '',
            action: 'create',
            entityType: 'user',
            entityId: '',
            userId: '',
            changes: '',
            status: 'success',
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
                        <Shield className="w-8 h-8 text-red-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Audit Logs</h1>
                    </div>
                    <p className="text-slate-600">Track and manage system audit logs and user activities</p>
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
                            placeholder="Search by entity or user..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                            resetForm()
                            setShowForm(true)
                        }}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add Log
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
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            <p className="mt-4 text-slate-600">Loading audit logs...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No audit logs found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Entity</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">User</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {new Date(log.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${actionColors[log.action]}`}>
                                                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div>
                                                        <p className="font-medium text-slate-900">{log.entityType}</p>
                                                        <p className="text-xs text-slate-500">{log.entityId}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{log.userId}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[log.status]}`}>
                                                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(log)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(log.id)}
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
                    title={editingId ? 'Edit Audit Log' : 'Add New Audit Log'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => {
                                    setFormData({ ...formData, date: e.target.value })
                                    if (errors.date) setErrors({ ...errors, date: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-red-500'
                                    }`}
                            />
                            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                        </div>

                        {/* Action */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Action <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.action}
                                onChange={(e) => {
                                    setFormData({ ...formData, action: e.target.value as any })
                                    if (errors.action) setErrors({ ...errors, action: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.action ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-red-500'
                                    }`}
                            >
                                <option value="">Select Action</option>
                                {actionOptions.map((action) => (
                                    <option key={action} value={action}>
                                        {action.charAt(0).toUpperCase() + action.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.action && <p className="mt-1 text-sm text-red-600">{errors.action}</p>}
                        </div>

                        {/* Entity Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Entity Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.entityType}
                                onChange={(e) => {
                                    setFormData({ ...formData, entityType: e.target.value as any })
                                    if (errors.entityType) setErrors({ ...errors, entityType: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.entityType ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-red-500'
                                    }`}
                            >
                                <option value="">Select Entity Type</option>
                                {entityTypeOptions.map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.entityType && <p className="mt-1 text-sm text-red-600">{errors.entityType}</p>}
                        </div>

                        {/* Entity ID */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Entity ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.entityId}
                                onChange={(e) => {
                                    setFormData({ ...formData, entityId: e.target.value })
                                    if (errors.entityId) setErrors({ ...errors, entityId: '' })
                                }}
                                placeholder="e.g., ENT001"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.entityId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-red-500'
                                    }`}
                            />
                            {errors.entityId && <p className="mt-1 text-sm text-red-600">{errors.entityId}</p>}
                        </div>

                        {/* User ID */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                User ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.userId}
                                onChange={(e) => {
                                    setFormData({ ...formData, userId: e.target.value })
                                    if (errors.userId) setErrors({ ...errors, userId: '' })
                                }}
                                placeholder="e.g., USER001"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.userId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-red-500'
                                    }`}
                            />
                            {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId}</p>}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => {
                                    setFormData({ ...formData, status: e.target.value as any })
                                    if (errors.status) setErrors({ ...errors, status: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-red-500'
                                    }`}
                            >
                                <option value="">Select Status</option>
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>

                        {/* Changes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Changes (Optional)</label>
                            <textarea
                                value={formData.changes}
                                onChange={(e) => setFormData({ ...formData, changes: e.target.value })}
                                placeholder="Describe what changed..."
                                rows={4}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
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
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                            >
                                {submitting ? 'Saving...' : editingId ? 'Update Log' : 'Create Log'}
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
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Audit Log?</h3>
                            <p className="text-slate-600 mb-6">
                                This action cannot be undone. The audit log will be permanently removed.
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
