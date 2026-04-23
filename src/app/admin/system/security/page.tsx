'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { SecuritySettingsService, SecuritySetting } from '@/services/systemService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

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

    const [formData, setFormData] = useState({
        setting: '',
        value: '',
        description: '',
        enabled: true,
        category: 'authentication' as const,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const categories = ['authentication', 'encryption', 'access-control']

    // Load settings
    const loadSettings = async () => {
        try {
            setLoading(true)
            const response = await SecuritySettingsService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
            })
            setSettings(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading settings:', error)
            toast.error('Failed to load security settings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSettings()
    }, [currentPage, searchTerm])

    // Validate form
    const validateFormData = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.setting) newErrors.setting = 'Setting name is required'
        else if (formData.setting.length < 2) newErrors.setting = 'Setting name must be at least 2 characters'

        if (!formData.value) newErrors.value = 'Value is required'

        if (!formData.category) newErrors.category = 'Category is required'

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
                await SecuritySettingsService.update(editingId, formData)
                toast.success('Security setting updated successfully')
            } else {
                await SecuritySettingsService.create(formData)
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

    // Handle edit
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

    // Handle delete
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

    // Reset form
    const resetForm = () => {
        setFormData({
            setting: '',
            value: '',
            description: '',
            enabled: true,
            category: 'authentication',
        })
        setErrors({})
        setEditingId(null)
    }

    // Handle close drawer
    const handleCloseDrawer = () => {
        setShowForm(false)
        resetForm()
    }

    const getStatusColor = (enabled: boolean) => {
        return enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }

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
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Lock className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Security Settings</h1>
                    </div>
                    <p className="text-slate-600">Manage security configurations and policies</p>
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
                            placeholder="Search settings..."
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
                        Add Setting
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
                                                        <button
                                                            onClick={() => handleEdit(setting)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(setting.id)}
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
                    title={editingId ? 'Edit Security Setting' : 'Add New Security Setting'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Setting Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Setting Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.setting}
                                onChange={(e) => {
                                    setFormData({ ...formData, setting: e.target.value })
                                    if (errors.setting) setErrors({ ...errors, setting: '' })
                                }}
                                placeholder="e.g., Two-Factor Authentication"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.setting ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.setting && <p className="mt-1 text-sm text-red-600">{errors.setting}</p>}
                        </div>

                        {/* Category */}
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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                        </div>

                        {/* Value */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Value <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.value}
                                onChange={(e) => {
                                    setFormData({ ...formData, value: e.target.value })
                                    if (errors.value) setErrors({ ...errors, value: '' })
                                }}
                                placeholder="e.g., enabled"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.value ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description..."
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Enabled Status */}
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.enabled}
                                        onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-11 h-6 rounded-full transition-colors ${formData.enabled ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <div
                                            className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${formData.enabled ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-0.5'
                                                }`}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-slate-900">Enabled</span>
                            </label>
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
                                {submitting ? 'Saving...' : editingId ? 'Update Setting' : 'Create Setting'}
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
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Security Setting?</h3>
                            <p className="text-slate-600 mb-6">
                                This action cannot be undone. The security setting will be permanently removed.
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
