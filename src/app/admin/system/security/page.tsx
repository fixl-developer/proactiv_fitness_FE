'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { SecuritySettingsService, SecuritySetting } from '@/services/systemService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
    validateRequired,
    validateSelect,
    validateTextArea,
} from '@/utils/validation'

const CATEGORIES = ['authentication', 'encryption', 'access-control']
const SETTING_NAME_PATTERN = /^[A-Za-z0-9_\- ]+$/

export default function SecuritySettingsPage() {
    const [settings, setSettings] = useState<SecuritySetting[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState<{
        setting: string
        value: string
        description: string
        enabled: boolean
        category: 'authentication' | 'encryption' | 'access-control'
    }>({
        setting: '',
        value: '',
        description: '',
        enabled: true,
        category: 'authentication',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const loadSettings = async () => {
        try {
            setLoading(true)
            const response = await SecuritySettingsService.getAll({ page: currentPage, limit: 10, search: searchTerm })
            setSettings(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading settings:', error)
            toast.error('Failed to load security settings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadSettings() }, [currentPage, searchTerm])

    const validateFormData = () => {
        const e: Record<string, string> = {}

        const settingErr = validateRequired(formData.setting, 'Setting name')
        if (settingErr) e.setting = settingErr
        else if (formData.setting.trim().length < 2) e.setting = 'Setting name must be at least 2 characters'
        else if (!SETTING_NAME_PATTERN.test(formData.setting.trim())) {
            e.setting = 'Letters, digits, spaces, hyphens and underscores only'
        }

        const valueErr = validateRequired(formData.value, 'Value')
        if (valueErr) e.value = valueErr
        else if (formData.value.length > 200) e.value = 'Value must be less than 200 characters'

        const categoryErr = validateSelect(formData.category, 'Category')
        if (categoryErr) e.category = categoryErr

        if (formData.description) {
            const descErr = validateTextArea(formData.description, 'Description', 0, 500)
            if (descErr) e.description = descErr
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
                setting: formData.setting.trim(),
                value: formData.value,
                description: formData.description,
                enabled: formData.enabled,
                category: formData.category,
            }

            if (editingId) {
                await SecuritySettingsService.update(editingId, submitData)
                toast.success('Security setting updated successfully')
            } else {
                await SecuritySettingsService.create(submitData)
                toast.success('Security setting created successfully')
            }

            setShowForm(false)
            resetForm()
            loadSettings()
        } catch (error) {
            console.error('Error saving setting:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (setting: SecuritySetting) => {
        setFormData({
            setting: setting.setting,
            value: setting.value,
            description: setting.description || '',
            enabled: setting.enabled,
            category: setting.category,
        })
        setEditingId(setting.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await SecuritySettingsService.delete(id)
            toast.success('Security setting deleted successfully')
            setDeleteConfirm(null)
            loadSettings()
        } catch (error) {
            console.error('Error deleting setting:', error)
            toast.error(getErrorMessage(error))
        }
    }

    const resetForm = () => {
        setFormData({
            setting: '', value: '', description: '',
            enabled: true, category: 'authentication',
        })
        setErrors({})
        setEditingId(null)
    }

    const handleCloseDrawer = () => { setShowForm(false); resetForm() }

    const getStatusColor = (enabled: boolean) =>
        enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            authentication: 'bg-blue-100 text-blue-800',
            encryption: 'bg-purple-100 text-purple-800',
            'access-control': 'bg-orange-100 text-orange-800',
        }
        return colors[category] || 'bg-gray-100 text-gray-800'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Lock className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Security Settings</h1>
                    </div>
                    <p className="text-slate-600">Manage security configurations and policies</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Search settings..."
                            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <Plus className="w-5 h-5" />
                        Add Setting
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-slate-600">Loading security settings...</p>
                        </div>
                    ) : settings.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No security settings found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Setting</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Value</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {settings.map((setting) => (
                                            <tr key={setting.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{setting.setting}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(setting.category)}`}>
                                                        {setting.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{setting.value}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(setting.enabled)}`}>
                                                        {setting.enabled ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(setting)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm(setting.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
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
                    title={editingId ? 'Edit Security Setting' : 'Add New Security Setting'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Setting Name <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={formData.setting} maxLength={80}
                                onChange={(e) => {
                                    const v = e.target.value
                                    if (v === '' || SETTING_NAME_PATTERN.test(v)) {
                                        setFormData({ ...formData, setting: v })
                                        if (errors.setting) setErrors({ ...errors, setting: '' })
                                    }
                                }}
                                placeholder="e.g. Two-Factor Authentication"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.setting ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.setting
                                ? <p className="mt-1 text-sm text-red-600">{errors.setting}</p>
                                : <p className="mt-1 text-xs text-slate-500">Letters, digits, spaces, hyphens and underscores only</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select value={formData.category}
                                onChange={(e) => { setFormData({ ...formData, category: e.target.value as any }); if (errors.category) setErrors({ ...errors, category: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                                <option value="">Select Category</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Value <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={formData.value} maxLength={200}
                                onChange={(e) => { setFormData({ ...formData, value: e.target.value }); if (errors.value) setErrors({ ...errors, value: '' }) }}
                                placeholder="e.g. enabled, 30, ${'{'}argon2id${'}'}"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.value ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.value
                                ? <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                                : <p className="mt-1 text-xs text-slate-500">Any text value (max 200 characters)</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
                            <textarea value={formData.description} rows={3} maxLength={500}
                                onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: '' }) }}
                                placeholder="Optional description..."
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={formData.enabled}
                                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm font-medium text-slate-900">Enabled</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-200">
                            <button type="button" onClick={handleCloseDrawer}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                            <button type="submit" disabled={submitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                                {submitting ? 'Saving...' : editingId ? 'Update Setting' : 'Create Setting'}
                            </button>
                        </div>
                    </form>
                </SlideInDrawer>

                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Security Setting?</h3>
                            <p className="text-slate-600 mb-6">This action cannot be undone. The security setting will be permanently removed.</p>
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
