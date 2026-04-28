'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Users } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { EnrollmentReportService } from '@/services/reportsService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface EnrollmentReport {
    id: string
    date: string
    programId: string
    locationId: string
    enrollmentCount: number
    status: 'active' | 'inactive' | 'completed'
    notes?: string
    createdAt?: string
}

export default function EnrollmentReportsPage() {
    const [reports, setReports] = useState<EnrollmentReport[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState<{
        date: string
        programId: string
        locationId: string
        enrollmentCount: number
        status: 'active' | 'inactive' | 'completed'
        notes: string
    }>({
        date: '',
        programId: '',
        locationId: '',
        enrollmentCount: 1,
        status: 'active',
        notes: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const statusOptions = ['active', 'inactive', 'completed']
    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        completed: 'bg-gray-100 text-gray-800',
    }

    // Load reports
    const loadReports = async () => {
        try {
            setLoading(true)
            const response = await EnrollmentReportService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
            })
            setReports(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading reports:', error)
            toast.error('Failed to load enrollment reports')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadReports()
    }, [currentPage, searchTerm])

    // Validate form
    const validateFormData = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.date) newErrors.date = 'Date is required'

        if (!formData.programId) newErrors.programId = 'Program ID is required'
        else if (formData.programId.length < 2) newErrors.programId = 'Program ID must be at least 2 characters'

        if (!formData.locationId) newErrors.locationId = 'Location ID is required'
        else if (formData.locationId.length < 2) newErrors.locationId = 'Location ID must be at least 2 characters'

        if (!formData.enrollmentCount) newErrors.enrollmentCount = 'Enrollment count is required'
        else if (formData.enrollmentCount < 1) newErrors.enrollmentCount = 'Enrollment count must be at least 1'

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
                await EnrollmentReportService.update(editingId, formData)
                toast.success('Enrollment report updated successfully')
            } else {
                await EnrollmentReportService.create(formData)
                toast.success('Enrollment report created successfully')
            }

            setShowForm(false)
            resetForm()
            loadReports()
        } catch (error) {
            console.error('Error saving report:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    // Handle edit
    const handleEdit = (report: EnrollmentReport) => {
        setFormData({
            date: report.date,
            programId: report.programId,
            locationId: report.locationId,
            enrollmentCount: report.enrollmentCount,
            status: report.status,
            notes: report.notes || '',
        })
        setEditingId(report.id)
        setShowForm(true)
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            await EnrollmentReportService.delete(id)
            toast.success('Enrollment report deleted successfully')
            setDeleteConfirm(null)
            loadReports()
        } catch (error) {
            console.error('Error deleting report:', error)
            toast.error(getErrorMessage(error))
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            date: '',
            programId: '',
            locationId: '',
            enrollmentCount: 1,
            status: 'active',
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
                        <Users className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Enrollment Reports</h1>
                    </div>
                    <p className="text-slate-600">Manage enrollment data across programs and locations</p>
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
                            placeholder="Search by program or location..."
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
                        Add Report
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
                            <p className="mt-4 text-slate-600">Loading enrollment reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No enrollment reports found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Program</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Location</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Count</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {reports.map((report) => (
                                            <tr key={report.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {new Date(report.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{report.programId}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{report.locationId}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{report.enrollmentCount}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                                                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(report)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(report.id)}
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
                    title={editingId ? 'Edit Enrollment Report' : 'Add New Enrollment Report'}
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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                        </div>

                        {/* Program ID */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Program ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.programId}
                                onChange={(e) => {
                                    setFormData({ ...formData, programId: e.target.value })
                                    if (errors.programId) setErrors({ ...errors, programId: '' })
                                }}
                                placeholder="e.g., PROG001"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.programId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.programId && <p className="mt-1 text-sm text-red-600">{errors.programId}</p>}
                        </div>

                        {/* Location ID */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Location ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.locationId}
                                onChange={(e) => {
                                    setFormData({ ...formData, locationId: e.target.value })
                                    if (errors.locationId) setErrors({ ...errors, locationId: '' })
                                }}
                                placeholder="e.g., LOC001"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.locationId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.locationId && <p className="mt-1 text-sm text-red-600">{errors.locationId}</p>}
                        </div>

                        {/* Enrollment Count */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Enrollment Count <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.enrollmentCount}
                                onChange={(e) => {
                                    setFormData({ ...formData, enrollmentCount: parseInt(e.target.value) || 1 })
                                    if (errors.enrollmentCount) setErrors({ ...errors, enrollmentCount: '' })
                                }}
                                min="1"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.enrollmentCount ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.enrollmentCount && <p className="mt-1 text-sm text-red-600">{errors.enrollmentCount}</p>}
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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
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

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add any additional notes..."
                                rows={4}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {submitting ? 'Saving...' : editingId ? 'Update Report' : 'Create Report'}
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
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Enrollment Report?</h3>
                            <p className="text-slate-600 mb-6">
                                This action cannot be undone. The enrollment data will be permanently removed.
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
