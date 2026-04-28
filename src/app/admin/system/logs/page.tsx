'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, FileText, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { SystemLogsService, SystemLog } from '@/services/systemService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
    validateRequired,
    validateSelect,
    validateTextArea,
} from '@/utils/validation'

const LEVELS = ['info', 'warning', 'error', 'critical']
const SERVICE_PATTERN = /^[A-Za-z0-9_\- ]+$/

export default function SystemLogsPage() {
    const [logs, setLogs] = useState<SystemLog[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [levelFilter, setLevelFilter] = useState('')
    const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null)

    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState<{
        service: string
        message: string
        level: SystemLog['level']
        details: string
        timestamp: string
    }>({
        service: '',
        message: '',
        level: 'info',
        details: '',
        timestamp: '',
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const loadLogs = async () => {
        try {
            setLoading(true)
            const response = await SystemLogsService.getAll({
                page: currentPage, limit: 10, search: searchTerm, level: levelFilter,
            })
            setLogs(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading logs:', error)
            toast.error('Failed to load system logs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadLogs() }, [currentPage, searchTerm, levelFilter])

    const validateFormData = () => {
        const e: Record<string, string> = {}

        const serviceErr = validateRequired(formData.service, 'Service name')
        if (serviceErr) e.service = serviceErr
        else if (formData.service.trim().length < 2) e.service = 'Service name must be at least 2 characters'
        else if (!SERVICE_PATTERN.test(formData.service.trim())) {
            e.service = 'Letters, digits, spaces, hyphens and underscores only'
        }

        const messageErr = validateTextArea(formData.message, 'Message', 5, 1000)
        if (messageErr) e.message = messageErr

        const levelErr = validateSelect(formData.level, 'Level')
        if (levelErr) e.level = levelErr

        if (formData.details) {
            const detailsErr = validateTextArea(formData.details, 'Details', 0, 5000)
            if (detailsErr) e.details = detailsErr
        }

        if (formData.timestamp) {
            const d = new Date(formData.timestamp)
            if (isNaN(d.getTime())) e.timestamp = 'Please enter a valid date and time'
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
            const submitData: any = {
                service: formData.service.trim(),
                message: formData.message.trim(),
                level: formData.level,
                details: formData.details,
            }
            if (formData.timestamp) submitData.timestamp = formData.timestamp

            if (editingId) {
                await SystemLogsService.update(editingId, submitData)
                toast.success('Log entry updated successfully')
            } else {
                await SystemLogsService.create(submitData)
                toast.success('Log entry created successfully')
            }

            setShowForm(false)
            resetForm()
            loadLogs()
        } catch (error) {
            console.error('Error saving log entry:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (log: SystemLog) => {
        setFormData({
            service: log.service,
            message: log.message,
            level: log.level,
            details: log.details || '',
            timestamp: log.timestamp ? new Date(log.timestamp).toISOString().slice(0, 16) : '',
        })
        setEditingId(log.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await SystemLogsService.delete(id)
            toast.success('Log entry deleted successfully')
            setDeleteConfirm(null)
            loadLogs()
        } catch (error) {
            console.error('Error deleting log entry:', error)
            toast.error(getErrorMessage(error))
        }
    }

    const resetForm = () => {
        setFormData({ service: '', message: '', level: 'info', details: '', timestamp: '' })
        setErrors({})
        setEditingId(null)
    }

    const handleCloseDrawer = () => { setShowForm(false); resetForm() }

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'info': return 'bg-blue-100 text-blue-800'
            case 'warning': return 'bg-yellow-100 text-yellow-800'
            case 'error': return 'bg-red-100 text-red-800'
            case 'critical': return 'bg-red-200 text-red-900'
            default: return 'bg-slate-100 text-slate-800'
        }
    }

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'info': return '🔵'
            case 'warning': return '⚠️'
            case 'error': return '❌'
            case 'critical': return '🔴'
            default: return '⚪'
        }
    }

    const formatTimestamp = (timestamp: string) => {
        try { return new Date(timestamp).toLocaleString() } catch { return timestamp }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">System Logs</h1>
                    </div>
                    <p className="text-slate-600">View system activity and append manual log entries</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center flex-wrap">
                    <div className="flex-1 min-w-xs relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder="Search logs..."
                            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-slate-600" />
                        <select value={levelFilter}
                            onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1) }}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">All Levels</option>
                            {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                        </select>
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <Plus className="w-5 h-5" />
                        Add Log Entry
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-slate-600">Loading system logs...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No logs found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Timestamp</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Level</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Service</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Message</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm text-slate-600 font-mono whitespace-nowrap">
                                                    {formatTimestamp(log.timestamp)}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize inline-flex items-center gap-1 ${getLevelColor(log.level)}`}>
                                                        <span>{getLevelIcon(log.level)}</span>
                                                        {log.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{log.service}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{log.message}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setSelectedLog(log)}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-medium">
                                                            View
                                                        </button>
                                                        <button onClick={() => handleEdit(log)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteConfirm(log.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
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
                    title={editingId ? 'Edit Log Entry' : 'Add New Log Entry'} size="lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Service Name <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={formData.service} maxLength={64}
                                onChange={(e) => {
                                    const v = e.target.value
                                    if (v === '' || SERVICE_PATTERN.test(v)) {
                                        setFormData({ ...formData, service: v })
                                        if (errors.service) setErrors({ ...errors, service: '' })
                                    }
                                }}
                                placeholder="e.g. payments-service"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${errors.service ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.service
                                ? <p className="mt-1 text-sm text-red-600">{errors.service}</p>
                                : <p className="mt-1 text-xs text-slate-500">Letters, digits, spaces, hyphens and underscores only</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Level <span className="text-red-500">*</span>
                            </label>
                            <select value={formData.level}
                                onChange={(e) => { setFormData({ ...formData, level: e.target.value as any }); if (errors.level) setErrors({ ...errors, level: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.level ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                                <option value="">Select Level</option>
                                {LEVELS.map((l) => <option key={l} value={l}>{getLevelIcon(l)}  {l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                            </select>
                            {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea value={formData.message} rows={3} maxLength={1000}
                                onChange={(e) => { setFormData({ ...formData, message: e.target.value }); if (errors.message) setErrors({ ...errors, message: '' }) }}
                                placeholder="Short summary of the log event"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.message
                                ? <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                                : <p className="mt-1 text-xs text-slate-500">{formData.message.length}/1000 — minimum 5 characters</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Details (Optional)</label>
                            <textarea value={formData.details} rows={5} maxLength={5000}
                                onChange={(e) => { setFormData({ ...formData, details: e.target.value }); if (errors.details) setErrors({ ...errors, details: '' }) }}
                                placeholder="Stack trace, payload or extra context"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono text-sm ${errors.details ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.details && <p className="mt-1 text-sm text-red-600">{errors.details}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Timestamp (Optional)</label>
                            <input type="datetime-local" value={formData.timestamp}
                                onChange={(e) => { setFormData({ ...formData, timestamp: e.target.value }); if (errors.timestamp) setErrors({ ...errors, timestamp: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.timestamp ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
                            {errors.timestamp
                                ? <p className="mt-1 text-sm text-red-600">{errors.timestamp}</p>
                                : <p className="mt-1 text-xs text-slate-500">Defaults to now if left empty</p>}
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-200">
                            <button type="button" onClick={handleCloseDrawer}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                            <button type="submit" disabled={submitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                                {submitting ? 'Saving...' : editingId ? 'Update Log' : 'Create Log'}
                            </button>
                        </div>
                    </form>
                </SlideInDrawer>

                {selectedLog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">Log Details</h3>
                                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600 transition">✕</button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Timestamp</label>
                                    <p className="text-slate-900 font-mono">{formatTimestamp(selectedLog.timestamp)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Level</label>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getLevelColor(selectedLog.level)}`}>{selectedLog.level}</span>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Service</label>
                                    <p className="text-slate-900 font-mono">{selectedLog.service}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Message</label>
                                    <p className="text-slate-900 break-words">{selectedLog.message}</p>
                                </div>
                                {selectedLog.details && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Details</label>
                                        <pre className="bg-slate-50 p-3 rounded text-xs text-slate-700 overflow-x-auto">{selectedLog.details}</pre>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Log ID</label>
                                    <p className="text-slate-900 font-mono text-xs">{selectedLog.id}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button onClick={() => setSelectedLog(null)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Close</button>
                                <button onClick={() => {
                                    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2))
                                    toast.success('Log details copied to clipboard')
                                }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Copy JSON</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Log Entry?</h3>
                            <p className="text-slate-600 mb-6">This action cannot be undone. Audit-vault entries can only be deleted if they are admin-created log records.</p>
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
