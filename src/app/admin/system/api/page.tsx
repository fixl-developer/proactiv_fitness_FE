'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { ApiMonitoringService, ApiIntegration } from '@/services/systemService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
    validateRequired,
    validateSelect,
    validateNumber,
} from '@/utils/validation'

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
const STATUSES = ['active', 'inactive', 'error']
// API friendly name: letters/digits/spaces/hyphens/underscores/dots
const API_NAME_PATTERN = /^[A-Za-z0-9 _.\-]+$/
// Endpoint must start with `/`, then any URL-safe chars
const ENDPOINT_PATTERN = /^\/[A-Za-z0-9_\-./:{}*?=&]+$/

export default function ApiMonitoringPage() {
    const [apis, setApis] = useState<ApiIntegration[]>([])
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
        endpoint: string
        method: ApiIntegration['method']
        status: ApiIntegration['status']
        responseTime: string
    }>({
        name: '',
        endpoint: '',
        method: 'GET',
        status: 'active',
        responseTime: '0',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const loadApis = async () => {
        try {
            setLoading(true)
            const response = await ApiMonitoringService.getAll({ page: currentPage, limit: 10, search: searchTerm })
            setApis(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading APIs:', error)
            toast.error('Failed to load API monitoring data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadApis() }, [currentPage, searchTerm])

    const validateFormData = () => {
        const e: Record<string, string> = {}

        const nameErr = validateRequired(formData.name, 'API name')
        if (nameErr) e.name = nameErr
        else if (formData.name.trim().length < 2) e.name = 'API name must be at least 2 characters'
        else if (!API_NAME_PATTERN.test(formData.name.trim())) e.name = 'Letters, digits, spaces, dots, hyphens and underscores only'

        const endpointErr = validateRequired(formData.endpoint, 'Endpoint')
        if (endpointErr) e.endpoint = endpointErr
        else if (!formData.endpoint.startsWith('/')) e.endpoint = 'Endpoint must start with /'
        else if (!ENDPOINT_PATTERN.test(formData.endpoint.trim())) e.endpoint = 'Invalid endpoint format'

        const methodErr = validateSelect(formData.method, 'Method')
        if (methodErr) e.method = methodErr

        const statusErr = validateSelect(formData.status, 'Status')
        if (statusErr) e.status = statusErr

        const rtErr = validateNumber(formData.responseTime, 'Response time', 0, 60000)
        if (rtErr) e.responseTime = rtErr

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
                name: formData.name.trim(),
                endpoint: formData.endpoint.trim(),
                method: formData.method,
                status: formData.status,
                responseTime: parseInt(formData.responseTime, 10) || 0,
            }

            if (editingId) {
                await ApiMonitoringService.update(editingId, submitData)
                toast.success('API endpoint updated successfully')
            } else {
                await ApiMonitoringService.create(submitData)
                toast.success('API endpoint created successfully')
            }

            setShowForm(false)
            resetForm()
            loadApis()
        } catch (error) {
            console.error('Error saving API:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (api: ApiIntegration) => {
        setFormData({
            name: api.name,
            endpoint: api.endpoint,
            method: api.method,
            status: api.status,
            responseTime: String(api.responseTime || 0),
        })
        setEditingId(api.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await ApiMonitoringService.delete(id)
            toast.success('API endpoint deleted successfully')
            setDeleteConfirm(null)
            loadApis()
        } catch (error) {
            console.error('Error deleting API:', error)
            toast.error(getErrorMessage(error))
        }
    }

    const resetForm = () => {
        setFormData({ name: '', endpoint: '', method: 'GET', status: 'active', responseTime: '0' })
        setErrors({})
        setEditingId(null)
    }

    const handleCloseDrawer = () => { setShowForm(false); resetForm() }

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'inactive': return 'bg-yellow-100 text-yellow-800'
            case 'error': return 'bg-red-100 text-red-800'
            default: return 'bg-slate-100 text-slate-800'
        }
    }

    const getMethodColor = (m: string) => {
        const colors: Record<string, string> = {
            GET: 'bg-blue-100 text-blue-800',
            POST: 'bg-green-100 text-green-800',
            PUT: 'bg-orange-100 text-orange-800',
            DELETE: 'bg-red-100 text-red-800',
            PATCH: 'bg-purple-100 text-purple-800',
        }
        return colors[m] || 'bg-slate-100 text-slate-800'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">API Monitoring</h1>
                    </div>
                    <p className="text-slate-600">Monitor API endpoints, response times, and error rates</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Search API endpoints..."
                            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <Plus className="w-5 h-5" />
                        Add Endpoint
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-slate-600">Loading API endpoints...</p>
                        </div>
                    ) : apis.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No API endpoints found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Endpoint</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Method</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Response Time</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {apis.map((api) => (
                                            <tr key={api.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{api.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-mono truncate max-w-xs">{api.endpoint}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(api.method)}`}>
                                                        {api.method}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{api.responseTime}ms</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(api.status)}`}>
                                                        {api.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(api)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm(api.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
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
                    title={editingId ? 'Edit API Endpoint' : 'Add New API Endpoint'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                API Name <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={formData.name} maxLength={80}
                                onChange={(e) => {
                                    const v = e.target.value
                                    if (v === '' || API_NAME_PATTERN.test(v)) {
                                        setFormData({ ...formData, name: v })
                                        if (errors.name) setErrors({ ...errors, name: '' })
                                    }
                                }}
                                placeholder="e.g. User Service API"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.name
                                ? <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                : <p className="mt-1 text-xs text-slate-500">Letters, digits, spaces, dots, hyphens and underscores only</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Endpoint <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={formData.endpoint} maxLength={200}
                                onChange={(e) => { setFormData({ ...formData, endpoint: e.target.value }); if (errors.endpoint) setErrors({ ...errors, endpoint: '' }) }}
                                placeholder="e.g. /api/v1/users"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${errors.endpoint ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.endpoint
                                ? <p className="mt-1 text-sm text-red-600">{errors.endpoint}</p>
                                : <p className="mt-1 text-xs text-slate-500">Must start with / (e.g. /api/v1/users)</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                HTTP Method <span className="text-red-500">*</span>
                            </label>
                            <select value={formData.method}
                                onChange={(e) => { setFormData({ ...formData, method: e.target.value as any }); if (errors.method) setErrors({ ...errors, method: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.method ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                                <option value="">Select Method</option>
                                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                            {errors.method && <p className="mt-1 text-sm text-red-600">{errors.method}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Average Response Time (ms)</label>
                            <input type="text" inputMode="numeric" value={formData.responseTime}
                                onChange={(e) => {
                                    const v = e.target.value
                                    if (v === '' || /^\d+$/.test(v)) {
                                        setFormData({ ...formData, responseTime: v })
                                        if (errors.responseTime) setErrors({ ...errors, responseTime: '' })
                                    }
                                }}
                                placeholder="e.g. 150"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.responseTime ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.responseTime
                                ? <p className="mt-1 text-sm text-red-600">{errors.responseTime}</p>
                                : <p className="mt-1 text-xs text-slate-500">Whole milliseconds (0–60000)</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select value={formData.status}
                                onChange={(e) => { setFormData({ ...formData, status: e.target.value as any }); if (errors.status) setErrors({ ...errors, status: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                                <option value="">Select Status</option>
                                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-200">
                            <button type="button" onClick={handleCloseDrawer}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                            <button type="submit" disabled={submitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                                {submitting ? 'Saving...' : editingId ? 'Update Endpoint' : 'Create Endpoint'}
                            </button>
                        </div>
                    </form>
                </SlideInDrawer>

                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete API Endpoint?</h3>
                            <p className="text-slate-600 mb-6">This action cannot be undone. The API endpoint will be permanently removed from monitoring.</p>
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
