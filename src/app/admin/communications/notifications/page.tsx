'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { NotificationService } from '@/services/communicationsService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface Notification {
    id: string
    userId: string
    type: 'email' | 'sms' | 'push' | 'in-app'
    category: 'alert' | 'reminder' | 'update' | 'promotion'
    title: string
    message: string
    status: 'draft' | 'sent' | 'failed'
    scheduledTime?: string
    createdAt?: string
}

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

    const [formData, setFormData] = useState<{
        userId: string
        type: 'email' | 'sms' | 'push' | 'in-app'
        category: 'alert' | 'reminder' | 'update' | 'promotion'
        title: string
        message: string
        status: 'draft' | 'sent' | 'failed'
        scheduledTime: string
    }>({
        userId: '',
        type: 'email',
        category: 'alert',
        title: '',
        message: '',
        status: 'draft',
        scheduledTime: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const types = ['email', 'sms', 'push', 'in-app']
    const categories = ['alert', 'reminder', 'update', 'promotion']
    const statuses = ['draft', 'sent', 'failed']

    const loadNotifications = async () => {
        try {
            setLoading(true)
            const response = await NotificationService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
            })
            setNotifications(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading notifications:', error)
            toast.error('Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadNotifications()
    }, [currentPage, searchTerm])

    const validateFormData = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.userId) newErrors.userId = 'User ID is required'
        if (!formData.type) newErrors.type = 'Type is required'
        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.title) newErrors.title = 'Title is required'
        else if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters'
        if (!formData.message) newErrors.message = 'Message is required'
        else if (formData.message.length < 10) newErrors.message = 'Message must be at least 10 characters'
        if (!formData.status) newErrors.status = 'Status is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateFormData()) {
            toast.error('Please fix the highlighted fields')
            return
        }

        try {
            setSubmitting(true)

            if (editingId) {
                await NotificationService.update(editingId, formData)
                toast.success('Notification updated successfully')
            } else {
                await NotificationService.create(formData)
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

    const handleEdit = (notification: Notification) => {
        setFormData({
            userId: notification.userId,
            type: notification.type,
            category: notification.category,
            title: notification.title,
            message: notification.message,
            status: notification.status,
            scheduledTime: notification.scheduledTime || '',
        })
        setEditingId(notification.id)
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
            userId: '',
            type: 'email',
            category: 'alert',
            title: '',
            message: '',
            status: 'draft',
            scheduledTime: '',
        })
        setErrors({})
        setEditingId(null)
    }

    const handleCloseDrawer = () => {
        setShowForm(false)
        resetForm()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-yellow-100 text-yellow-800'
            case 'sent':
                return 'bg-green-100 text-green-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-slate-100 text-slate-800'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Notification Management</h1>
                    </div>
                    <p className="text-slate-600">Manage and send notifications to users</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex gap-4 items-center"
                >
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
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
                        Add Notification
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
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
                                        {notifications.map((notification) => (
                                            <tr key={notification.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{notification.userId}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium capitalize">
                                                        {notification.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 capitalize">{notification.category}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{notification.title}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(notification.status)}`}>
                                                        {notification.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(notification)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(notification.id)}
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

                <SlideInDrawer
                    isOpen={showForm}
                    onClose={handleCloseDrawer}
                    title={editingId ? 'Edit Notification' : 'Add New Notification'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.userId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                            />
                            {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => {
                                    setFormData({ ...formData, type: e.target.value as any })
                                    if (errors.type) setErrors({ ...errors, type: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                            >
                                <option value="">Select Type</option>
                                {types.map((type) => (
                                    <option key={type} value={type}>
                                        {type.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => {
                                    setFormData({ ...formData, category: e.target.value as any })
                                    if (errors.category) setErrors({ ...errors, category: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>

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
                                placeholder="Notification title"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => {
                                    setFormData({ ...formData, message: e.target.value })
                                    if (errors.message) setErrors({ ...errors, message: '' })
                                }}
                                placeholder="Notification message"
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                            />
                            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                        </div>

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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                            >
                                <option value="">Select Status</option>
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Scheduled Time (Optional)</label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledTime}
                                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

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
                                {submitting ? 'Saving...' : editingId ? 'Update Notification' : 'Create Notification'}
                            </button>
                        </div>
                    </form>
                </SlideInDrawer>

                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-lg p-6 max-w-sm"
                        >
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Notification?</h3>
                            <p className="text-slate-600 mb-6">This action cannot be undone.</p>
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
