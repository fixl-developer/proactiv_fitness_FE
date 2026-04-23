'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { TemplateService } from '@/services/communicationsService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface Template {
    id: string
    name: string
    type: 'email' | 'sms' | 'push'
    subject: string
    content: string
    variables?: string
    status: 'active' | 'inactive'
    createdAt?: string
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([])
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
        type: 'email' | 'sms' | 'push'
        subject: string
        content: string
        variables: string
        status: 'active' | 'inactive'
    }>({
        name: '',
        type: 'email',
        subject: '',
        content: '',
        variables: '',
        status: 'active',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const types = ['email', 'sms', 'push']
    const statuses = ['active', 'inactive']

    const loadTemplates = async () => {
        try {
            setLoading(true)
            const response = await TemplateService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
            })
            setTemplates(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading templates:', error)
            toast.error('Failed to load templates')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTemplates()
    }, [currentPage, searchTerm])

    const validateFormData = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name) newErrors.name = 'Name is required'
        else if (formData.name.length < 3) newErrors.name = 'Name must be at least 3 characters'

        if (!formData.type) newErrors.type = 'Type is required'

        if (!formData.subject) newErrors.subject = 'Subject is required'
        else if (formData.subject.length < 5) newErrors.subject = 'Subject must be at least 5 characters'

        if (!formData.content) newErrors.content = 'Content is required'
        else if (formData.content.length < 20) newErrors.content = 'Content must be at least 20 characters'

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

            const submitData = {
                ...formData,
                variables: formData.variables ? JSON.parse(formData.variables) : undefined,
            }

            if (editingId) {
                await TemplateService.update(editingId, submitData)
                toast.success('Template updated successfully')
            } else {
                await TemplateService.create(submitData)
                toast.success('Template created successfully')
            }

            setShowForm(false)
            resetForm()
            loadTemplates()
        } catch (error) {
            console.error('Error saving template:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (template: Template) => {
        setFormData({
            name: template.name,
            type: template.type,
            subject: template.subject,
            content: template.content,
            variables: template.variables || '',
            status: template.status,
        })
        setEditingId(template.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await TemplateService.delete(id)
            toast.success('Template deleted successfully')
            setDeleteConfirm(null)
            loadTemplates()
        } catch (error) {
            console.error('Error deleting template:', error)
            toast.error(getErrorMessage(error))
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'email',
            subject: '',
            content: '',
            variables: '',
            status: 'active',
        })
        setErrors({})
        setEditingId(null)
    }

    const handleCloseDrawer = () => {
        setShowForm(false)
        resetForm()
    }

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                        <FileText className="w-8 h-8 text-purple-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Template Management</h1>
                    </div>
                    <p className="text-slate-600">Create and manage notification templates</p>
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
                            placeholder="Search templates..."
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
                        Add Template
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <p className="mt-4 text-slate-600">Loading templates...</p>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No templates found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Subject</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {templates.map((template) => (
                                            <tr key={template.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{template.name}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium uppercase">
                                                        {template.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{template.subject}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(template.status)}`}>
                                                        {template.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(template)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(template.id)}
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
                    title={editingId ? 'Edit Template' : 'Add New Template'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value })
                                    if (errors.name) setErrors({ ...errors, name: '' })
                                }}
                                placeholder="Template name"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`}
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
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => {
                                    setFormData({ ...formData, subject: e.target.value })
                                    if (errors.subject) setErrors({ ...errors, subject: '' })
                                }}
                                placeholder="Template subject"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`}
                            />
                            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => {
                                    setFormData({ ...formData, content: e.target.value })
                                    if (errors.content) setErrors({ ...errors, content: '' })
                                }}
                                placeholder="Template content"
                                rows={5}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.content ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`}
                            />
                            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Variables (JSON - Optional)</label>
                            <textarea
                                value={formData.variables}
                                onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                                placeholder='{"name": "string", "email": "string"}'
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                            />
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
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`}
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
                                {submitting ? 'Saving...' : editingId ? 'Update Template' : 'Create Template'}
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
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Template?</h3>
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
