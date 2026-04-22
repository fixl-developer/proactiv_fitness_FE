'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { PerformanceAnalyticsService } from '@/services/reportsService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface PerformanceAnalytics {
    id: string
    date: string
    metric: 'attendance' | 'completion' | 'satisfaction' | 'progress'
    value: number
    locationId?: string
    notes?: string
    createdAt?: string
}

export default function PerformanceAnalyticsPage() {
    const [records, setRecords] = useState<PerformanceAnalytics[]>([])
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
        metric: 'attendance' as const,
        value: 0,
        locationId: '',
        notes: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const metricOptions = ['attendance', 'completion', 'satisfaction', 'progress']
    const metricColors: Record<string, string> = {
        attendance: 'bg-blue-100 text-blue-800',
        completion: 'bg-green-100 text-green-800',
        satisfaction: 'bg-purple-100 text-purple-800',
        progress: 'bg-orange-100 text-orange-800',
    }

    // Load records
    const loadRecords = async () => {
        try {
            setLoading(true)
            const response = await PerformanceAnalyticsService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
            })
            setRecords(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading records:', error)
            toast.error('Failed to load performance analytics')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRecords()
    }, [currentPage, searchTerm])

    // Validate form
    const validateFormData = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.date) newErrors.date = 'Date is required'

        if (!formData.metric) newErrors.metric = 'Metric is required'

        if (formData.value === null || formData.value === undefined) {
            newErrors.value = 'Value is required'
        } else if (formData.value < 0 || formData.value > 100) {
            newErrors.value = 'Value must be between 0 and 100'
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

            if (editingId) {
                await PerformanceAnalyticsService.update(editingId, formData)
                toast.success('Performance analytics updated successfully')
            } else {
                await PerformanceAnalyticsService.create(formData)
                toast.success('Performance analytics created successfully')
            }

            setShowForm(false)
            resetForm()
            loadRecords()
        } catch (error) {
            console.error('Error saving record:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    // Handle edit
    const handleEdit = (record: PerformanceAnalytics) => {
        setFormData({
            date: record.date,
            metric: record.metric,
            value: record.value,
            locationId: record.locationId || '',
            notes: record.notes || '',
        })
        setEditingId(record.id)
        setShowForm(true)
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            await PerformanceAnalyticsService.delete(id)
            toast.success('Performance analytics deleted successfully')
            setDeleteConfirm(null)
            loadRecords()
        } catch (error) {
            console.error('Error deleting record:', error)
            toast.error(getErrorMessage(error))
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            date: '',
            metric: 'attendance',
            value: 0,
            locationId: '',
            notes: '',
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
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Performance Analytics</h1>
                    </div>
                    <p className="text-slate-600">Track and manage performance metrics across your organization</p>
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
                            placeholder="Search by metric or location..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                            resetForm()
                            setShowForm(true)
                        }}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add Metric
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
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <p className="mt-4 text-slate-600">Loading performance analytics...</p>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No performance analytics found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Metric</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Value</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Location</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {records.map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {new Date(record.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${metricColors[record.metric]}`}>
                                                        {record.metric.charAt(0).toUpperCase() + record.metric.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{record.value}%</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{record.locationId || '-'}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(record)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(record.id)}
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
                    title={editingId ? 'Edit Performance Analytics' : 'Add New Performance Analytics'}
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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'
                                    }`}
                            />
                            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                        </div>

                        {/* Metric */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Metric <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.metric}
                                onChange={(e) => {
                                    setFormData({ ...formData, metric: e.target.value as any })
                                    if (errors.metric) setErrors({ ...errors, metric: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.metric ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'
                                    }`}
                            >
                                <option value="">Select Metric</option>
                                {metricOptions.map((metric) => (
                                    <option key={metric} value={metric}>
                                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.metric && <p className="mt-1 text-sm text-red-600">{errors.metric}</p>}
                        </div>

                        {/* Value */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Value (0-100) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => {
                                        setFormData({ ...formData, value: parseInt(e.target.value) || 0 })
                                        if (errors.value) setErrors({ ...errors, value: '' })
                                    }}
                                    min="0"
                                    max="100"
                                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.value ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'
                                        }`}
                                />
                                <div className="flex-1 flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-600 transition-all"
                                            style={{ width: `${formData.value}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900 w-12">{formData.value}%</span>
                                </div>
                            </div>
                            {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
                        </div>

                        {/* Location ID */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Location ID (Optional)</label>
                            <input
                                type="text"
                                value={formData.locationId}
                                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                                placeholder="e.g., LOC001"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add any additional notes..."
                                rows={4}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                            >
                                {submitting ? 'Saving...' : editingId ? 'Update Analytics' : 'Create Analytics'}
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
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Performance Analytics?</h3>
                            <p className="text-slate-600 mb-6">
                                This action cannot be undone. The analytics data will be permanently removed.
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
