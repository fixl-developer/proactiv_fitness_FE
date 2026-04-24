'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle, AlertTriangle, XCircle, Search, Plus, Edit2, Trash2,
    Shield, X, Loader2, AlertCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { RegionalAdminService } from '@/services/regionalAdminService'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { validateRequired, validateNumber, filterNumberInput } from '@/utils/validation'

const CATEGORIES = ['SAFETY', 'PERSONNEL', 'FACILITY', 'INSURANCE', 'DATA', 'FINANCIAL', 'OTHER']

interface ComplianceItem {
    id: string
    category: string
    title: string
    status: string
    completionRate: number
    dueDate: string
    lastAudit?: string
    notes?: string
}

export default function RegionalCompliancePage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [isLoading, setIsLoading] = useState(true)
    const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([])
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    // Form drawer
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<ComplianceItem | null>(null)
    const [form, setForm] = useState({ category: 'SAFETY', title: '', dueDate: '', completionRate: '0', notes: '' })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<ComplianceItem | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 4000)
        return () => clearTimeout(t)
    }, [toast])

    const fetchCompliance = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await RegionalAdminService.getCompliance()
            const items: ComplianceItem[] = (data?.items || []).map((item: any) => ({
                id: item.id,
                category: item.category,
                title: item.title,
                status: item.status,
                completionRate: Number(item.completionRate) || 0,
                dueDate: item.dueDate || '',
                lastAudit: item.lastAudit,
                notes: item.notes || ''
            }))
            setComplianceItems(items)
        } catch (err: any) {
            console.error('Error fetching compliance:', err)
            setToast({ message: err.message || 'Failed to load compliance items', type: 'error' })
            setComplianceItems([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { fetchCompliance() }, [fetchCompliance])

    const openAdd = () => {
        setEditing(null)
        setForm({ category: 'SAFETY', title: '', dueDate: '', completionRate: '0', notes: '' })
        setFormErrors({})
        setFormOpen(true)
    }

    const openEdit = (item: ComplianceItem) => {
        setEditing(item)
        setForm({
            category: item.category,
            title: item.title,
            dueDate: item.dueDate || '',
            completionRate: String(item.completionRate),
            notes: item.notes || ''
        })
        setFormErrors({})
        setFormOpen(true)
    }

    const validateForm = (): boolean => {
        const errs: Record<string, string> = {}
        if (!CATEGORIES.includes(form.category)) errs.category = 'Please select a valid category'
        const titleErr = validateRequired(form.title, 'Title'); if (titleErr) errs.title = titleErr
        else if (form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters'
        const rateErr = validateNumber(form.completionRate, 'Completion rate', 0, 100); if (rateErr) errs.completionRate = rateErr
        if (form.dueDate) {
            const d = new Date(form.dueDate)
            if (isNaN(d.getTime())) errs.dueDate = 'Invalid date'
        }
        if (form.notes && form.notes.length > 500) errs.notes = 'Notes must be less than 500 characters'
        setFormErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return
        setSubmitting(true)
        try {
            const payload = {
                category: form.category,
                title: form.title.trim(),
                dueDate: form.dueDate || undefined,
                completionRate: Number(form.completionRate),
                notes: form.notes.trim() || undefined,
            }
            if (editing) {
                await RegionalAdminService.updateComplianceItem(editing.id, payload)
                setToast({ message: 'Compliance item updated', type: 'success' })
            } else {
                await RegionalAdminService.createComplianceItem(payload)
                setToast({ message: 'Compliance item created', type: 'success' })
            }
            setFormOpen(false)
            fetchCompliance()
        } catch (err: any) {
            setToast({ message: err.message || 'Operation failed', type: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await RegionalAdminService.deleteComplianceItem(deleteTarget.id)
            setToast({ message: 'Compliance item deleted', type: 'success' })
            setDeleteTarget(null)
            fetchCompliance()
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to delete', type: 'error' })
        } finally {
            setDeleting(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLIANT': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' }
            case 'NEEDS_ATTENTION':
            case 'WARNING': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' }
            case 'NON_COMPLIANT': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
            default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' }
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLIANT': return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'NEEDS_ATTENTION':
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
            case 'NON_COMPLIANT': return <XCircle className="w-5 h-5 text-red-600" />
            default: return null
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const compliant = complianceItems.filter(c => c.status === 'COMPLIANT').length
    const warning = complianceItems.filter(c => c.status === 'NEEDS_ATTENTION' || c.status === 'WARNING').length
    const nonCompliant = complianceItems.filter(c => c.status === 'NON_COMPLIANT').length
    const complianceRate = complianceItems.length > 0 ? Math.round((compliant / complianceItems.length) * 100) : 0

    const filteredItems = complianceItems.filter(item => {
        const matchesSearch = !searchTerm || (item.title || '').toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus || (filterStatus === 'WARNING' && item.status === 'NEEDS_ATTENTION')
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Compliance & Audits</h1>
                    <p className="text-gray-600 mt-1">Track regional compliance status and audit results</p>
                </div>
                <button
                    id="admin-regional-compliance-btn-add"
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Compliance Item
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { title: 'Overall Compliance', value: `${complianceRate}%`, icon: Shield, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', showProgress: true },
                    { title: 'Compliant', value: compliant, icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
                    { title: 'Warnings', value: warning, icon: AlertTriangle, gradient: 'from-yellow-500 to-amber-600', bgGradient: 'from-yellow-50 to-amber-100' },
                    { title: 'Non-Compliant', value: nonCompliant, icon: XCircle, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
                ].map((stat, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${stat.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                {stat.showProgress && <Progress value={complianceRate} className="mt-3 h-2" />}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search compliance items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            id="select-admin-regional-compliance-status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="COMPLIANT">Compliant</option>
                            <option value="WARNING">Needs Attention</option>
                            <option value="NON_COMPLIANT">Non-Compliant</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Compliance Items */}
            <div className="space-y-4">
                {filteredItems.length === 0 && (
                    <Card>
                        <CardContent className="pt-12 pb-12 text-center">
                            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-600 mb-3">No compliance items found</p>
                            <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add First Item</button>
                        </CardContent>
                    </Card>
                )}
                {filteredItems.map((item, idx) => {
                    const colors = getStatusColor(item.status)
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className={`border-2 ${colors.border} ${colors.bg}`}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(item.status)}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                                {item.notes && <p className="text-sm text-gray-600">{item.notes}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={item.status === 'COMPLIANT' ? 'default' : (item.status === 'NEEDS_ATTENTION' || item.status === 'WARNING') ? 'secondary' : 'destructive'}>
                                                {item.status.replace('_', ' ')}
                                            </Badge>
                                            <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-white/50 rounded text-blue-600" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setDeleteTarget(item)} className="p-1.5 hover:bg-white/50 rounded text-red-600" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                                            <span className="text-sm font-bold text-gray-900">{item.completionRate}%</span>
                                        </div>
                                        <Progress value={item.completionRate} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Category</p>
                                            <p className="font-medium text-gray-900">{item.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Last Audit</p>
                                            <p className="font-medium text-gray-900">{item.lastAudit || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Due Date</p>
                                            <p className="font-medium text-gray-900">{item.dueDate || 'N/A'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                    >
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form Drawer */}
            <SlideInDrawer
                isOpen={formOpen}
                onClose={() => { setFormOpen(false); setEditing(null) }}
                title={editing ? 'Edit Compliance Item' : 'New Compliance Item'}
                description="Track a specific compliance requirement"
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. Safety Certifications"
                            className={formErrors.title ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="Minimum 3 characters" error={formErrors.title} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Completion Rate (%) *</label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={form.completionRate}
                            onChange={(e) => setForm(prev => ({ ...prev, completionRate: e.target.value }))}
                            onKeyDown={filterNumberInput}
                            className={formErrors.completionRate ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="0-100 percent; status is computed from this" error={formErrors.completionRate} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <Input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                            className={formErrors.dueDate ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="Optional - when this must be complete" error={formErrors.dueDate} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            placeholder="Optional notes / details"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.notes ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint="Max 500 characters" error={formErrors.notes} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button
                            type="button"
                            onClick={() => { setFormOpen(false); setEditing(null) }}
                            disabled={submitting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editing ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </SlideInDrawer>

            {/* Delete confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-50 rounded-full"><AlertCircle className="w-6 h-6 text-red-600" /></div>
                                <h2 className="text-xl font-bold text-gray-900">Delete Compliance Item</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <span className="font-semibold">{deleteTarget.title}</span>?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
