'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Database } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { DatabaseHealthService, DatabaseHealth } from '@/services/systemService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

export default function DatabaseHealthPage() {
    const [databases, setDatabases] = useState<DatabaseHealth[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState<{
        name: string
        host: string
        port: number
        status: DatabaseHealth['status']
        diskUsage: number
        connections: number
    }>({
        name: '',
        host: '',
        port: 5432,
        status: 'healthy',
        diskUsage: 0,
        connections: 0,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const statuses = ['healthy', 'warning', 'critical']

    // Load databases
    const loadDatabases = async () => {
        try {
            setLoading(true)
            const response = await DatabaseHealthService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
            })
            setDatabases(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading databases:', error)
            toast.error('Failed to load database health data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDatabases()
    }, [currentPage, searchTerm])

    // Validate form
    const validateFormData = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name) newErrors.name = 'Database name is required'
        else if (formData.name.length < 2) newErrors.name = 'Database name must be at least 2 characters'

        if (!formData.host) newErrors.host = 'Host is required'
        else if (!/^[a-zA-Z0-9.-]+$/.test(formData.host)) newErrors.host = 'Invalid host format'

        if (!formData.port) newErrors.port = 'Port is required'
        else if (formData.port < 1 || formData.port > 65535) newErrors.port = 'Port must be between 1 and 65535'

        if (!formData.status) newErrors.status = 'Status is required'

        if (formData.diskUsage < 0 || formData.diskUsage > 100) newErrors.diskUsage = 'Disk usage must be between 0 and 100'

        if (formData.connections < 0) newErrors.connections = 'Connections cannot be negative'

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
                await DatabaseHealthService.update(editingId, formData)
                toast.success('Database health record updated successfully')
            } else {
                await DatabaseHealthService.create(formData)
                toast.success('Database health record created successfully')
            }

            setShowForm(false)
            resetForm()
            loadDatabases()
        } catch (error) {
            console.error('Error saving database:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    // Handle edit
    const handleEdit = (db: DatabaseHealth) => {
        setFormData({
            name: db.name,
            host: db.host,
            port: db.port,
            status: db.status,
            diskUsage: db.diskUsage,
            connections: db.connections || 0,
        })
        setEditingId(db.id)
        setShowForm(true)
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            await DatabaseHealthService.delete(id)
            toast.success('Database health record deleted successfully')
            setDeleteConfirm(null)
            loadDatabases()
        } catch (error) {
            console.error('Error deleting database:', error)
            toast.error(getErrorMessage(error))
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            host: '',
            port: 5432,
            status: 'healthy',
            diskUsage: 0,
            connections: 0,
        })
        setErrors({})
        setEditingId(null)
    }

    // Handle close drawer
    const handleCloseDrawer = () => {
        setShowForm(false)
        resetForm()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-100 text-green-800'
            case 'warning':
                return 'bg-yellow-100 text-yellow-800'
            case 'critical':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-slate-100 text-slate-800'
        }
    }

    const getDiskUsageColor = (usage: number) => {
        if (usage < 70) return 'text-green-600'
        if (usage < 85) return 'text-yellow-600'
        return 'text-red-600'
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
                        <Database className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Database Health</h1>
                    </div>
                    <p className="text-slate-600">Monitor database performance, connections, and query times</p>
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
                            placeholder="Search databases..."
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
                        Add Database
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
                            <p className="mt-4 text-slate-600">Loading database health...</p>
                        </div>
                    ) : databases.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No databases found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Host</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Port</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Connections</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Disk Usage</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {databases.map((db) => (
                                            <tr key={db.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{db.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{db.host}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{db.port}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{db.connections}</td>
                                                <td className={`px-6 py-4 text-sm font-medium ${getDiskUsageColor(db.diskUsage)}`}>
                                                    {db.diskUsage}%
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(db.status)}`}>
                                                        {db.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(db)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(db.id)}
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
                    title={editingId ? 'Edit Database' : 'Add New Database'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Database Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Database Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value })
                                    if (errors.name) setErrors({ ...errors, name: '' })
                                }}
                                placeholder="e.g., Production DB"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Host */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Host <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.host}
                                onChange={(e) => {
                                    setFormData({ ...formData, host: e.target.value })
                                    if (errors.host) setErrors({ ...errors, host: '' })
                                }}
                                placeholder="e.g., db.example.com"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.host ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.host && <p className="mt-1 text-sm text-red-600">{errors.host}</p>}
                        </div>

                        {/* Port */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Port <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.port}
                                onChange={(e) => {
                                    setFormData({ ...formData, port: parseInt(e.target.value) || 5432 })
                                    if (errors.port) setErrors({ ...errors, port: '' })
                                }}
                                placeholder="e.g., 5432"
                                min="1"
                                max="65535"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.port ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.port && <p className="mt-1 text-sm text-red-600">{errors.port}</p>}
                        </div>

                        {/* Connections */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Active Connections
                            </label>
                            <input
                                type="number"
                                value={formData.connections}
                                onChange={(e) => {
                                    setFormData({ ...formData, connections: parseInt(e.target.value) || 0 })
                                    if (errors.connections) setErrors({ ...errors, connections: '' })
                                }}
                                placeholder="e.g., 45"
                                min="0"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.connections ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.connections && <p className="mt-1 text-sm text-red-600">{errors.connections}</p>}
                        </div>

                        {/* Disk Usage */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Disk Usage (%)
                            </label>
                            <input
                                type="number"
                                value={formData.diskUsage}
                                onChange={(e) => {
                                    setFormData({ ...formData, diskUsage: parseInt(e.target.value) || 0 })
                                    if (errors.diskUsage) setErrors({ ...errors, diskUsage: '' })
                                }}
                                placeholder="e.g., 65"
                                min="0"
                                max="100"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.diskUsage ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.diskUsage && <p className="mt-1 text-sm text-red-600">{errors.diskUsage}</p>}
                            <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${formData.diskUsage < 70 ? 'bg-green-500' : formData.diskUsage < 85 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${formData.diskUsage}%` }}
                                />
                            </div>
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
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
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
                                {submitting ? 'Saving...' : editingId ? 'Update Database' : 'Create Database'}
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
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Database?</h3>
                            <p className="text-slate-600 mb-6">
                                This action cannot be undone. The database health record will be permanently removed.
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
