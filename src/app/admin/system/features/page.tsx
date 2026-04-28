'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Flag } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FeatureFlagsService, FeatureFlag } from '@/services/systemService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
    validateRequired,
    validateNumber,
    validateTextArea,
} from '@/utils/validation'

// Feature flag key (recommend snake_case): letters/digits/underscore
const FEATURE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/
// Target users: comma-separated tokens of letters/digits/underscore/hyphen/dot
const TARGET_PATTERN = /^[A-Za-z0-9_\-., ]*$/

export default function FeatureFlagsPage() {
    const [flags, setFlags] = useState<FeatureFlag[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        enabled: false,
        rolloutPercentage: '0',
        targetUsers: '', // comma-separated
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const loadFlags = async () => {
        try {
            setLoading(true)
            const response = await FeatureFlagsService.getAll({ page: currentPage, limit: 10, search: searchTerm })
            setFlags(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading feature flags:', error)
            toast.error('Failed to load feature flags')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadFlags() }, [currentPage, searchTerm])

    const validateFormData = () => {
        const e: Record<string, string> = {}

        const nameErr = validateRequired(formData.name, 'Feature name')
        if (nameErr) e.name = nameErr
        else if (formData.name.trim().length < 2) e.name = 'Feature name must be at least 2 characters'
        else if (!FEATURE_NAME_PATTERN.test(formData.name.trim())) {
            e.name = 'Must start with a letter; letters, digits and underscores only (e.g. new_dashboard_ui)'
        }

        if (formData.description) {
            const descErr = validateTextArea(formData.description, 'Description', 0, 500)
            if (descErr) e.description = descErr
        }

        const rolloutErr = validateNumber(formData.rolloutPercentage, 'Rollout percentage', 0, 100)
        if (rolloutErr) e.rolloutPercentage = rolloutErr

        if (formData.targetUsers && !TARGET_PATTERN.test(formData.targetUsers)) {
            e.targetUsers = 'Letters, digits, dots, hyphens, underscores and commas only'
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

            const targetUsers = formData.targetUsers.trim()
                ? formData.targetUsers.split(',').map(s => s.trim()).filter(Boolean)
                : []

            const submitData = {
                name: formData.name.trim(),
                description: formData.description,
                enabled: formData.enabled,
                rolloutPercentage: parseInt(formData.rolloutPercentage, 10) || 0,
                targetUsers,
            }

            if (editingId) {
                await FeatureFlagsService.update(editingId, submitData as any)
                toast.success('Feature flag updated successfully')
            } else {
                await FeatureFlagsService.create(submitData as any)
                toast.success('Feature flag created successfully')
            }

            setShowForm(false)
            resetForm()
            loadFlags()
        } catch (error) {
            console.error('Error saving feature flag:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (flag: FeatureFlag) => {
        const target = Array.isArray((flag as any).targetUsers)
            ? ((flag as any).targetUsers as string[]).join(', ')
            : (typeof flag.targetUsers === 'string' ? flag.targetUsers : '')
        setFormData({
            name: flag.name,
            description: flag.description || '',
            enabled: flag.enabled,
            rolloutPercentage: String(flag.rolloutPercentage ?? 0),
            targetUsers: target,
        })
        setEditingId(flag.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await FeatureFlagsService.delete(id)
            toast.success('Feature flag deleted successfully')
            setDeleteConfirm(null)
            loadFlags()
        } catch (error) {
            console.error('Error deleting feature flag:', error)
            toast.error(getErrorMessage(error))
        }
    }

    const resetForm = () => {
        setFormData({
            name: '', description: '', enabled: false,
            rolloutPercentage: '0', targetUsers: '',
        })
        setErrors({})
        setEditingId(null)
    }

    const handleCloseDrawer = () => { setShowForm(false); resetForm() }

    const getRolloutColor = (p: number) =>
        p === 0 ? 'text-slate-600' : p < 50 ? 'text-yellow-600' : p < 100 ? 'text-blue-600' : 'text-green-600'

    const targetDisplay = (f: FeatureFlag) => {
        const t = (f as any).targetUsers
        if (Array.isArray(t)) return t.length ? t.join(', ') : 'All'
        return (t && String(t).trim()) || 'All'
    }

    const rolloutNum = parseInt(formData.rolloutPercentage, 10) || 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Flag className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Feature Flags</h1>
                    </div>
                    <p className="text-slate-600">Manage feature toggles for A/B testing and gradual rollouts</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Search feature flags..."
                            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <Plus className="w-5 h-5" />
                        Add Flag
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-slate-600">Loading feature flags...</p>
                        </div>
                    ) : flags.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No feature flags found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Description</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Rollout %</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Target Audience</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {flags.map((flag) => (
                                            <tr key={flag.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{flag.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{flag.description || '-'}</td>
                                                <td className={`px-6 py-4 text-sm font-medium ${getRolloutColor(flag.rolloutPercentage || 0)}`}>
                                                    {flag.rolloutPercentage ?? 0}%
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${flag.enabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                                        {flag.enabled ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{targetDisplay(flag)}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(flag)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm(flag.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
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
                    title={editingId ? 'Edit Feature Flag' : 'Add New Feature Flag'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Feature Name <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={formData.name} maxLength={64}
                                onChange={(e) => {
                                    const v = e.target.value
                                    if (v === '' || /^[A-Za-z][A-Za-z0-9_]*$/.test(v)) {
                                        setFormData({ ...formData, name: v })
                                        if (errors.name) setErrors({ ...errors, name: '' })
                                    }
                                }}
                                placeholder="e.g. new_dashboard_ui"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.name
                                ? <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                : <p className="mt-1 text-xs text-slate-500">Must start with a letter, then letters / digits / underscores</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
                            <textarea value={formData.description} rows={3} maxLength={500}
                                onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: '' }) }}
                                placeholder="Describe what this feature does..."
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Rollout Percentage (0-100)</label>
                            <input type="text" inputMode="numeric" value={formData.rolloutPercentage}
                                onChange={(e) => {
                                    const v = e.target.value
                                    if (v === '' || /^\d{0,3}$/.test(v)) {
                                        setFormData({ ...formData, rolloutPercentage: v })
                                        if (errors.rolloutPercentage) setErrors({ ...errors, rolloutPercentage: '' })
                                    }
                                }}
                                placeholder="e.g. 50"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.rolloutPercentage ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.rolloutPercentage
                                ? <p className="mt-1 text-sm text-red-600">{errors.rolloutPercentage}</p>
                                : <p className="mt-1 text-xs text-slate-500">Whole number between 0 and 100</p>}
                            <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                                <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, rolloutNum)}%` }} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Target Users (Optional)</label>
                            <input type="text" value={formData.targetUsers}
                                onChange={(e) => {
                                    const v = e.target.value
                                    if (v === '' || TARGET_PATTERN.test(v)) {
                                        setFormData({ ...formData, targetUsers: v })
                                        if (errors.targetUsers) setErrors({ ...errors, targetUsers: '' })
                                    }
                                }}
                                placeholder="e.g. beta_users, premium_members"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${errors.targetUsers ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.targetUsers
                                ? <p className="mt-1 text-sm text-red-600">{errors.targetUsers}</p>
                                : <p className="mt-1 text-xs text-slate-500">Comma-separated list (letters, digits, dots, hyphens, underscores)</p>}
                        </div>

                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.enabled}
                                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm font-medium text-slate-900">Enable Feature</span>
                            </label>
                            <p className="mt-1 text-xs text-slate-500">Toggle to enable or disable this feature flag</p>
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-200">
                            <button type="button" onClick={handleCloseDrawer}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                            <button type="submit" disabled={submitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                                {submitting ? 'Saving...' : editingId ? 'Update Flag' : 'Create Flag'}
                            </button>
                        </div>
                    </form>
                </SlideInDrawer>

                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Feature Flag?</h3>
                            <p className="text-slate-600 mb-6">This action cannot be undone. The feature flag will be permanently removed.</p>
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
