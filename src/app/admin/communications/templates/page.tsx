'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { TemplateService } from '@/services/communicationsService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
    validateSelect,
    validateTitle,
    validateSubject,
    validateNotes,
} from '@/utils/validation'

// Backend `NotificationTemplate` model strict enums:
//   type:   'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP'   (UPPERCASE)
//   status: 'published' | 'draft'
const TYPES = ['EMAIL', 'SMS', 'PUSH', 'IN_APP']
const STATUSES = ['draft', 'published']
const VARIABLE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/

interface Template {
    id: string
    name: string
    type: string
    subject?: string
    body?: string
    content?: string
    variables?: string[] | string
    status: string
    category?: string
    createdAt?: string
}

const formatTypeLabel = (t: string) => t.replace('_', ' ')

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

    const [formData, setFormData] = useState({
        name: '',
        type: 'EMAIL',
        subject: '',
        content: '',
        variables: '', // comma-separated string of variable names
        status: 'draft',
        category: 'General',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const loadTemplates = async () => {
        try {
            setLoading(true)
            const response: any = await TemplateService.getAll({ page: currentPage, limit: 10, search: searchTerm })
            const items = (response.data || []).map((t: any) => ({
                ...t,
                id: t.id || t._id,
                content: t.content || t.body,
            }))
            setTemplates(items)
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading templates:', error)
            toast.error('Failed to load templates')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadTemplates() }, [currentPage, searchTerm])

    const validateFormData = () => {
        const e: Record<string, string> = {}

        const nameErr = validateTitle(formData.name, 'Template name', 100)
        if (nameErr) e.name = nameErr

        const typeErr = validateSelect(formData.type, 'Type')
        if (typeErr) e.type = typeErr

        // Subject is mandatory only for EMAIL templates
        if (formData.type === 'EMAIL') {
            const subjectErr = validateSubject(formData.subject, 'Subject')
            if (subjectErr) e.subject = subjectErr
        } else if (formData.subject.trim()) {
            // Optional but if provided must still pass the subject rules
            const subjectErr = validateSubject(formData.subject, 'Subject')
            if (subjectErr) e.subject = subjectErr
        }

        const contentErr = validateNotes(formData.content, 'Content', true, 5000)
        if (contentErr) e.content = contentErr
        else if (formData.content.trim().length < 20) e.content = 'Content must be at least 20 characters'

        const statusErr = validateSelect(formData.status, 'Status')
        if (statusErr) e.status = statusErr

        if (formData.variables.trim()) {
            // Comma-split first, trim, then validate each identifier against the pattern.
            // Block submit if ANY variable fails; show inline error listing the bad ones.
            const parts = formData.variables.split(',').map(s => s.trim())
            if (parts.some(p => p === '')) {
                e.variables = 'Remove empty entries between commas'
            } else {
                const bad = parts.filter(p => !VARIABLE_NAME_PATTERN.test(p))
                if (bad.length > 0) {
                    e.variables = `Invalid variable name${bad.length > 1 ? 's' : ''}: ${bad.map(b => `"${b}"`).join(', ')} — each must start with a letter, then letters/digits/underscore`
                }
            }
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
            const variables = formData.variables.trim()
                ? formData.variables.split(',').map(s => s.trim()).filter(Boolean)
                : []

            const submitData = {
                name: formData.name.trim(),
                type: formData.type,
                subject: formData.subject.trim(),
                content: formData.content,
                body: formData.content,    // backend column is `body`; sent for compatibility
                variables,
                status: formData.status,
                category: formData.category || 'General',
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

    const handleEdit = (t: Template) => {
        const vars = Array.isArray(t.variables)
            ? t.variables.join(', ')
            : (typeof t.variables === 'string' ? t.variables : '')
        setFormData({
            name: t.name,
            type: (t.type || 'EMAIL').toUpperCase(),
            subject: t.subject || '',
            content: t.content || t.body || '',
            variables: vars,
            status: ['published', 'draft'].includes(t.status) ? t.status : 'draft',
            category: t.category || 'General',
        })
        setEditingId(t.id)
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
            name: '', type: 'EMAIL', subject: '', content: '',
            variables: '', status: 'draft', category: 'General',
        })
        setErrors({})
        setEditingId(null)
    }

    const handleCloseDrawer = () => { setShowForm(false); resetForm() }

    const getStatusColor = (s: string) =>
        s === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-8 h-8 text-purple-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Template Management</h1>
                    </div>
                    <p className="text-slate-600">Create and manage notification templates</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Search templates..."
                            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                        <Plus className="w-5 h-5" />
                        Add Template
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                                        {templates.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{t.name}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium uppercase">
                                                        {formatTypeLabel(t.type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{t.subject || '-'}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(t.status)}`}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm(t.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
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
                    title={editingId ? 'Edit Template' : 'Add New Template'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Name <span className="text-red-500">*</span></label>
                            <input type="text" value={formData.name} maxLength={100}
                                onChange={(e) => {
                                    const v = e.target.value
                                    setFormData({ ...formData, name: v })
                                    const nameErr = validateTitle(v, 'Template name', 100)
                                    setErrors((prev) => ({ ...prev, name: nameErr || '' }))
                                }}
                                placeholder="e.g. Welcome Email"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`} />
                            {errors.name
                                ? <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                : <p className="mt-1 text-xs text-slate-500">Must start with a letter. Letters, digits, spaces and basic punctuation allowed.</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Type <span className="text-red-500">*</span></label>
                            <select value={formData.type}
                                onChange={(e) => { setFormData({ ...formData, type: e.target.value }); if (errors.type) setErrors({ ...errors, type: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`}>
                                <option value="">Select Type</option>
                                {TYPES.map((t) => <option key={t} value={t}>{formatTypeLabel(t)}</option>)}
                            </select>
                            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Subject {formData.type === 'EMAIL' && <span className="text-red-500">*</span>}
                                {formData.type !== 'EMAIL' && <span className="text-slate-500 text-xs"> (Optional)</span>}
                            </label>
                            <input type="text" value={formData.subject} maxLength={200}
                                onChange={(e) => {
                                    const v = e.target.value
                                    setFormData({ ...formData, subject: v })
                                    if (formData.type === 'EMAIL' || v.trim()) {
                                        const subjErr = validateSubject(v, 'Subject')
                                        setErrors((prev) => ({ ...prev, subject: subjErr || '' }))
                                    } else {
                                        setErrors((prev) => ({ ...prev, subject: '' }))
                                    }
                                }}
                                placeholder="Email subject line or title"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`} />
                            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Content <span className="text-red-500">*</span></label>
                            <textarea value={formData.content} rows={6} maxLength={5000}
                                onChange={(e) => {
                                    const v = e.target.value
                                    setFormData({ ...formData, content: v })
                                    let contentErr = validateNotes(v, 'Content', true, 5000)
                                    if (!contentErr && v.trim().length < 20) contentErr = 'Content must be at least 20 characters'
                                    setErrors((prev) => ({ ...prev, content: contentErr || '' }))
                                }}
                                placeholder="Template body. Use {{variable}} for substitutions."
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.content ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`} />
                            {errors.content
                                ? <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                : <p className="mt-1 text-xs text-slate-500">{formData.content.length}/5000 — minimum 20 characters</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Variables (Optional)</label>
                            <input type="text" value={formData.variables}
                                onChange={(e) => {
                                    const v = e.target.value
                                    setFormData({ ...formData, variables: v })
                                    if (!v.trim()) {
                                        setErrors((prev) => ({ ...prev, variables: '' }))
                                        return
                                    }
                                    // Comma-split first, trim, then validate each identifier.
                                    const parts = v.split(',').map(s => s.trim())
                                    if (parts.some(p => p === '')) {
                                        setErrors((prev) => ({ ...prev, variables: 'Remove empty entries between commas' }))
                                        return
                                    }
                                    const bad = parts.filter(p => !VARIABLE_NAME_PATTERN.test(p))
                                    if (bad.length > 0) {
                                        setErrors((prev) => ({ ...prev, variables: `Invalid variable name${bad.length > 1 ? 's' : ''}: ${bad.map(b => `"${b}"`).join(', ')} — each must start with a letter, then letters/digits/underscore` }))
                                    } else {
                                        setErrors((prev) => ({ ...prev, variables: '' }))
                                    }
                                }}
                                placeholder="e.g. firstName, lastName, bookingId"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${errors.variables ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`} />
                            {errors.variables
                                ? <p className="mt-1 text-sm text-red-600">{errors.variables}</p>
                                : <p className="mt-1 text-xs text-slate-500">Comma-separated names. Each must start with a letter (letters, digits, underscore allowed).</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Status <span className="text-red-500">*</span></label>
                            <select value={formData.status}
                                onChange={(e) => { setFormData({ ...formData, status: e.target.value }); if (errors.status) setErrors({ ...errors, status: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'}`}>
                                <option value="">Select Status</option>
                                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-200">
                            <button type="button" onClick={handleCloseDrawer}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                            <button type="submit" disabled={submitting}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition">
                                {submitting ? 'Saving...' : editingId ? 'Update Template' : 'Create Template'}
                            </button>
                        </div>
                    </form>
                </SlideInDrawer>

                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Template?</h3>
                            <p className="text-slate-600 mb-6">This action cannot be undone.</p>
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
