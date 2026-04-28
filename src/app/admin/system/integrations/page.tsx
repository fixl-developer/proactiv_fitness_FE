'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Plug, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { IntegrationGatewayService, Integration } from '@/services/systemService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
    validateRequired,
    validateSelect,
    validateUrl,
} from '@/utils/validation'

const TYPES = ['payment', 'email', 'sms', 'analytics']
const STATUSES = ['active', 'inactive', 'error', 'pending']
const INTEGRATION_NAME_PATTERN = /^[A-Za-z0-9 _.\-]+$/

export default function IntegrationGatewayPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})

    const [formData, setFormData] = useState<{
        name: string
        type: Integration['type']
        url: string
        apiKey: string
        status: Integration['status']
    }>({
        name: '',
        type: 'payment',
        url: '',
        apiKey: '',
        status: 'active',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const loadIntegrations = async () => {
        try {
            setLoading(true)
            const response = await IntegrationGatewayService.getAll({ page: currentPage, limit: 10, search: searchTerm })
            setIntegrations(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading integrations:', error)
            toast.error('Failed to load integrations')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadIntegrations() }, [currentPage, searchTerm])

    const validateFormData = () => {
        const e: Record<string, string> = {}

        const nameErr = validateRequired(formData.name, 'Integration name')
        if (nameErr) e.name = nameErr
        else if (formData.name.trim().length < 2) e.name = 'Integration name must be at least 2 characters'
        else if (!INTEGRATION_NAME_PATTERN.test(formData.name.trim())) {
            e.name = 'Letters, digits, spaces, dots, hyphens and underscores only'
        }

        const typeErr = validateSelect(formData.type, 'Type')
        if (typeErr) e.type = typeErr

        const urlErr = validateUrl(formData.url, true)
        if (urlErr) e.url = urlErr

        const apiKeyErr = validateRequired(formData.apiKey, 'API Key')
        if (apiKeyErr) e.apiKey = apiKeyErr
        else if (formData.apiKey.trim().length < 8) e.apiKey = 'API Key must be at least 8 characters'

        const statusErr = validateSelect(formData.status, 'Status')
        if (statusErr) e.status = statusErr

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
                type: formData.type,
                url: formData.url.trim(),
                apiKey: formData.apiKey.trim(),
                status: formData.status,
            }

            if (editingId) {
                await IntegrationGatewayService.update(editingId, submitData)
                toast.success('Integration updated successfully')
            } else {
                await IntegrationGatewayService.create(submitData)
                toast.success('Integration created successfully')
            }

            setShowForm(false)
            resetForm()
            loadIntegrations()
        } catch (error) {
            console.error('Error saving integration:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (i: Integration) => {
        setFormData({
            name: i.name,
            type: i.type,
            url: i.url || '',
            apiKey: i.apiKey || '',
            status: i.status,
        })
        setEditingId(i.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await IntegrationGatewayService.delete(id)
            toast.success('Integration deleted successfully')
            setDeleteConfirm(null)
            loadIntegrations()
        } catch (error) {
            console.error('Error deleting integration:', error)
            toast.error(getErrorMessage(error))
        }
    }

    const resetForm = () => {
        setFormData({ name: '', type: 'payment', url: '', apiKey: '', status: 'active' })
        setErrors({})
        setEditingId(null)
    }

    const handleCloseDrawer = () => { setShowForm(false); resetForm() }

    const maskApiKey = (key: string) => {
        if (!key) return ''
        if (key.length <= 8) return '*'.repeat(key.length)
        return key.substring(0, 4) + '*'.repeat(Math.max(0, key.length - 8)) + key.substring(key.length - 4)
    }

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'inactive': return 'bg-yellow-100 text-yellow-800'
            case 'error': return 'bg-red-100 text-red-800'
            case 'pending': return 'bg-blue-100 text-blue-800'
            default: return 'bg-slate-100 text-slate-800'
        }
    }

    const getTypeColor = (t: string) => {
        const colors: Record<string, string> = {
            payment: 'bg-blue-100 text-blue-800',
            email: 'bg-purple-100 text-purple-800',
            sms: 'bg-green-100 text-green-800',
            analytics: 'bg-orange-100 text-orange-800',
            api: 'bg-slate-100 text-slate-800',
            service: 'bg-slate-100 text-slate-800',
            webhook: 'bg-slate-100 text-slate-800',
        }
        return colors[t] || 'bg-slate-100 text-slate-800'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Plug className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Integration Gateway</h1>
                    </div>
                    <p className="text-slate-600">Manage third-party integrations and connections</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Search integrations..."
                            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <Plus className="w-5 h-5" />
                        Add Integration
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-slate-600">Loading integrations...</p>
                        </div>
                    ) : integrations.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No integrations found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">URL</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">API Key</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {integrations.map((i) => (
                                            <tr key={i.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{i.name}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(i.type)}`}>
                                                        {i.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-mono truncate max-w-xs">{i.url || '-'}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-slate-600">
                                                            {showApiKey[i.id] ? (i.apiKey || '-') : maskApiKey(i.apiKey || '')}
                                                        </span>
                                                        <button onClick={() => setShowApiKey({ ...showApiKey, [i.id]: !showApiKey[i.id] })}
                                                            className="p-1 text-slate-400 hover:text-slate-600 transition">
                                                            {showApiKey[i.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(i.status)}`}>
                                                        {i.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(i)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm(i.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
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
                    title={editingId ? 'Edit Integration' : 'Add New Integration'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Integration Name <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={formData.name} maxLength={80}
                                onChange={(e) => {
                                    const v = e.target.value
                                    if (v === '' || INTEGRATION_NAME_PATTERN.test(v)) {
                                        setFormData({ ...formData, name: v })
                                        if (errors.name) setErrors({ ...errors, name: '' })
                                    }
                                }}
                                placeholder="e.g. Stripe Payment Gateway"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.name
                                ? <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                : <p className="mt-1 text-xs text-slate-500">Letters, digits, spaces, dots, hyphens and underscores only</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Type <span className="text-red-500">*</span>
                            </label>
                            <select value={formData.type}
                                onChange={(e) => { setFormData({ ...formData, type: e.target.value as any }); if (errors.type) setErrors({ ...errors, type: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                                <option value="">Select Type</option>
                                {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                URL <span className="text-red-500">*</span>
                            </label>
                            <input type="url" value={formData.url} maxLength={500}
                                onChange={(e) => { setFormData({ ...formData, url: e.target.value }); if (errors.url) setErrors({ ...errors, url: '' }) }}
                                placeholder="e.g. https://api.stripe.com"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.url ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.url
                                ? <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                                : <p className="mt-1 text-xs text-slate-500">Must start with http:// or https://</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                API Key <span className="text-red-500">*</span>
                            </label>
                            <input type="password" value={formData.apiKey} maxLength={500}
                                onChange={(e) => { setFormData({ ...formData, apiKey: e.target.value }); if (errors.apiKey) setErrors({ ...errors, apiKey: '' }) }}
                                placeholder="Enter API key"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.apiKey ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.apiKey
                                ? <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>
                                : <p className="mt-1 text-xs text-slate-500">At least 8 characters; stored encrypted on the server</p>}
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
                                {submitting ? 'Saving...' : editingId ? 'Update Integration' : 'Create Integration'}
                            </button>
                        </div>
                    </form>
                </SlideInDrawer>

                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Integration?</h3>
                            <p className="text-slate-600 mb-6">This action cannot be undone. The integration will be permanently removed.</p>
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
