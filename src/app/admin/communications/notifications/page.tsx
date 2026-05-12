'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { NotificationService } from '@/services/communicationsService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
    validateRequired,
    validateSelect,
    validateTitle,
    validateNotes,
} from '@/utils/validation'

// Backend `Notification` model accepts:
//   type:     'email' | 'sms' | 'push' | 'in_app'
//   category: 'booking' | 'payment' | 'alert' | 'reminder' | 'announcement' |
//             'achievement' | 'attendance' | 'schedule' | 'staff' | 'program' |
//             'ticket' | 'feedback'
//   status:   'pending' | 'sent' | 'failed' | 'read'   (also 'draft' allowed)
const TYPES = ['email', 'sms', 'push', 'in_app']
const CATEGORIES = [
    'booking', 'payment', 'alert', 'reminder', 'announcement',
    'achievement', 'attendance', 'schedule', 'staff', 'program',
    'ticket', 'feedback',
]
const STATUSES = ['draft', 'pending', 'sent', 'failed', 'read']
const USER_ID_PATTERN = /^[A-Za-z0-9_-]+$/

interface Notification {
    id: string
    userId: string
    type: string
    category: string
    title: string
    message: string
    status: string
    scheduledTime?: string
    metadata?: any
    createdAt?: string
}

const formatLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        userId: '',
        type: 'email',
        category: 'announcement',
        title: '',
        message: '',
        status: 'draft',
        scheduledTime: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const loadNotifications = async () => {
        try {
            setLoading(true)
            const response: any = await NotificationService.getAll({ page: currentPage, limit: 10, search: searchTerm })
            const items = (response.data || []).map((n: any) => ({
                ...n,
                id: n.id || n._id,
                scheduledTime: n.scheduledTime || n.metadata?.scheduledTime,
            }))
            setNotifications(items)
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading notifications:', error)
            toast.error('Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadNotifications() }, [currentPage, searchTerm])

    const validateFormData = () => {
        const e: Record<string, string> = {}

        const userIdErr = validateRequired(formData.userId, 'User ID')
        if (userIdErr) e.userId = userIdErr
        else if (!USER_ID_PATTERN.test(formData.userId.trim())) {
            e.userId = 'Letters, digits, hyphens and underscores only'
        }

        const typeErr = validateSelect(formData.type, 'Type')
        if (typeErr) e.type = typeErr

        const categoryErr = validateSelect(formData.category, 'Category')
        if (categoryErr) e.category = categoryErr

        const titleErr = validateTitle(formData.title, 'Title', 120)
        if (titleErr) e.title = titleErr

        const messageErr = validateNotes(formData.message, 'Message', true, 2000)
        if (messageErr) e.message = messageErr
        else if (formData.message.trim().length < 10) e.message = 'Message must be at least 10 characters'

        const statusErr = validateSelect(formData.status, 'Status')
        if (statusErr) e.status = statusErr

        if (formData.scheduledTime) {
            const d = new Date(formData.scheduledTime)
            if (isNaN(d.getTime())) e.scheduledTime = 'Please enter a valid date and time'
        }

        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault()
        if (!validateFormData()) {
            toast.error('Please fix the highlighted fields')
            return
        }

        try {
            setSubmitting(true)
            const submitData = {
                userId: formData.userId.trim(),
                type: formData.type,
                category: formData.category,
                title: formData.title.trim(),
                message: formData.message.trim(),
                status: formData.status,
                ...(formData.scheduledTime ? { scheduledTime: formData.scheduledTime } : {}),
            }

            if (editingId) {
                await NotificationService.update(editingId, submitData)
                toast.success('Notification updated successfully')
            } else {
                await NotificationService.create(submitData)
                toast.success('Notification created successfully')
            }

            setShowForm(false)
            resetForm()
            loadNotifications()
        } catch (error) {
            console.error('Error saving notification:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (n: Notification) => {
        setFormData({
            userId: n.userId,
            type: n.type,
            category: n.category,
            title: n.title,
            message: n.message,
            status: n.status,
            scheduledTime: n.scheduledTime ? new Date(n.scheduledTime).toISOString().slice(0, 16) : '',
        })
        setEditingId(n.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await NotificationService.delete(id)
            toast.success('Notification deleted successfully')
            setDeleteConfirm(null)
            loadNotifications()
        } catch (error) {
            console.error('Error deleting notification:', error)
            toast.error(getErrorMessage(error))
        }
    }

    const resetForm = () => {
        setFormData({
            userId: '', type: 'email', category: 'announcement',
            title: '', message: '', status: 'draft', scheduledTime: '',
        })
        setErrors({})
        setEditingId(null)
    }

    const handleCloseDrawer = () => { setShowForm(false); resetForm() }

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'draft': return 'bg-yellow-100 text-yellow-800'
            case 'pending': return 'bg-blue-100 text-blue-800'
            case 'sent': return 'bg-green-100 text-green-800'
            case 'failed': return 'bg-red-100 text-red-800'
            case 'read': return 'bg-purple-100 text-purple-800'
            default: return 'bg-slate-100 text-slate-800'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Notification Management</h1>
                    </div>
                    <p className="text-slate-600">Manage and send notifications to users</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Search notifications..."
                            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <Plus className="w-5 h-5" />
                        Add Notification
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-slate-600">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No notifications found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">User</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {notifications.map((n) => (
                                            <tr key={n.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{n.userId}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">
                                                        {formatLabel(n.type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 capitalize">{n.category}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{n.title}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(n.status)}`}>
                                                        {n.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(n)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm(n.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                <p className="text-sm text-slate-600">Page {currentPage} of {totalPages}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"><ChevronLeft className="w-5 h-5" /></button>
                                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                <SlideInDrawer isOpen={showForm} onClose={handleCloseDrawer}
                    title={editingId ? 'Edit Notification' : 'Add New Notification'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">User ID <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.userId} maxLength={64}
                                onChange={(e) => {
                                    const v = e.target.value
                                    if (v === '' || USER_ID_PATTERN.test(v)) {
                                        setFormData({ ...formData, userId: v })
                                        if (errors.userId) setErrors({ ...errors, userId: '' })
                                    }
                                }}
                                placeholder="e.g. USER001 or 65a1b2c3d4e5f60012345678"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.userId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.userId
                                ? <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
                                : <p className="mt-1 text-xs text-slate-500">Letters, digits, hyphens and underscores only</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Type <span className="text-red-500">*</span></label>
                            <select value={formData.type}
                                onChange={(e) => { setFormData({ ...formData, type: e.target.value }); if (errors.type) setErrors({ ...errors, type: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                                <option value="">Select Type</option>
                                {TYPES.map((t) => <option key={t} value={t}>{formatLabel(t)}</option>)}
                            </select>
                            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Category <span className="text-red-500">*</span></label>
                            <select value={formData.category}
                                onChange={(e) => { setFormData({ ...formData, category: e.target.value }); if (errors.category) setErrors({ ...errors, category: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                                <option value="">Select Category</option>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Title <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.title} maxLength={120}
                                onChange={(e) => {
                                    const v = e.target.value
                                    setFormData({ ...formData, title: v })
                                    const titleErr = validateTitle(v, 'Title', 120)
                                    setErrors((prev) => ({ ...prev, title: titleErr || '' }))
                                }}
                                placeholder="Notification title"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.title
                                ? <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                : <p className="mt-1 text-xs text-slate-500">{formData.title.length}/120 — minimum 5 characters</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Message <span className="text-red-500">*</span></label>
                            <textarea value={formData.message} rows={4} maxLength={2000}
                                onChange={(e) => {
                                    const v = e.target.value
                                    setFormData({ ...formData, message: v })
                                    let msgErr = validateNotes(v, 'Message', true, 2000)
                                    if (!msgErr && v.trim().length < 10) msgErr = 'Message must be at least 10 characters'
                                    setErrors((prev) => ({ ...prev, message: msgErr || '' }))
                                }}
                                placeholder="Notification message body"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.message
                                ? <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                                : <p className="mt-1 text-xs text-slate-500">{formData.message.length}/2000 — minimum 10 characters</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Status <span className="text-red-500">*</span></label>
                            <select value={formData.status}
                                onChange={(e) => { setFormData({ ...formData, status: e.target.value }); if (errors.status) setErrors({ ...errors, status: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                                <option value="">Select Status</option>
                                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Scheduled Time (Optional)</label>
                            <input type="datetime-local" value={formData.scheduledTime}
                                onChange={(e) => { setFormData({ ...formData, scheduledTime: e.target.value }); if (errors.scheduledTime) setErrors({ ...errors, scheduledTime: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.scheduledTime ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.scheduledTime && <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>}
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-200">
                            <button type="button" onClick={handleCloseDrawer}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                            <button type="submit" disabled={submitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                                {submitting ? 'Saving...' : editingId ? 'Update Notification' : 'Create Notification'}
                            </button>
                        </div>
                    </form>
                </SlideInDrawer>

                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Notification?</h3>
                            <p className="text-slate-600 mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                                <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}
