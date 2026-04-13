'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Eye, Users, Mail, Phone, CheckCircle, AlertCircle, X, Save, UserCheck, Award, Activity, Loader2, AlertTriangle, Lock, Shield, Brain, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { LocationManagerService } from '@/services/locationManagerService'
import { apiClient } from '@/services/api/client'
import { validateName, validateEmail, validatePhone, validatePassword, filterNameInput, filterPhoneInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'

const ALLOWED_ROLES = ['COACH'] as const
const ROLE_LABELS: Record<string, string> = {
    COACH: 'Coach',
}

interface StaffFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
    password: string
    status: string
}

const defaultForm: StaffFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'COACH',
    password: '',
    status: 'ACTIVE',
}

// ─── Toast Notification ──────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${
                type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
        >
            {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
        </motion.div>
    )
}

// ─── Staff Form Modal ────────────────────────────────────────────
function StaffFormModal({
    open,
    onClose,
    onSubmit,
    initial,
    submitting,
    modalError,
}: {
    open: boolean
    onClose: () => void
    onSubmit: (data: any) => void
    initial: any | null
    submitting: boolean
    modalError: string | null
}) {
    const [form, setForm] = useState<StaffFormData>(defaultForm)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (initial) {
            const nameParts = (initial.name || '').split(' ')
            setForm({
                firstName: initial.firstName || nameParts[0] || '',
                lastName: initial.lastName || nameParts.slice(1).join(' ') || '',
                email: initial.email || '',
                phone: initial.phone || '',
                role: initial.role || 'COACH',
                password: '',
                status: initial.status || 'ACTIVE',
            })
        } else {
            setForm(defaultForm)
        }
        setValidationErrors({})
    }, [initial, open])

    const validate = (): boolean => {
        const errors: Record<string, string> = {}
        const fnErr = validateName(form.firstName, 'First name'); if (fnErr) errors.firstName = fnErr
        const lnErr = validateName(form.lastName, 'Last name'); if (lnErr) errors.lastName = lnErr
        const emErr = validateEmail(form.email); if (emErr) errors.email = emErr
        const phErr = validatePhone(form.phone, false); if (phErr) errors.phone = phErr
        if (!initial) { const pwErr = validatePassword(form.password); if (pwErr) errors.password = pwErr }
        else if (form.password) { const pwErr = validatePassword(form.password); if (pwErr) errors.password = pwErr }
        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        const payload: any = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            role: form.role,
            status: form.status,
        }
        if (form.password) payload.password = form.password
        onSubmit(payload)
    }

    const handleChange = (field: keyof StaffFormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
        let error: string | null = null
        if (field === 'firstName') error = validateName(value, 'First name')
        else if (field === 'lastName') error = validateName(value, 'Last name')
        else if (field === 'email') error = validateEmail(value)
        else if (field === 'phone') error = validatePhone(value, false)
        else if (field === 'password' && (value || !initial)) error = validatePassword(value)
        setValidationErrors(prev => { const n = { ...prev }; if (error) n[field] = error; else delete n[field]; return n })
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">{initial ? 'Edit Staff' : 'Add New Staff'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {modalError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {modalError}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <Input
                                value={form.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                onKeyDown={filterNameInput}
                                placeholder="First name"
                                className={validationErrors.firstName ? 'border-red-500' : ''}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.firstName} error={validationErrors.firstName} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <Input
                                value={form.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                onKeyDown={filterNameInput}
                                placeholder="Last name"
                                className={validationErrors.lastName ? 'border-red-500' : ''}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.lastName} error={validationErrors.lastName} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="email@example.com"
                            className={validationErrors.email ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint={FORMAT_HINTS.email} error={validationErrors.email} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <Input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            onKeyDown={filterPhoneInput}
                            placeholder="+1 (555) 000-0000"
                            className={validationErrors.phone ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint={FORMAT_HINTS.phone} error={validationErrors.phone} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <select
                            value={form.role}
                            onChange={(e) => handleChange('role', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {ALLOWED_ROLES.map(r => (
                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Location Managers can only create Coach roles</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password {initial ? '(leave blank to keep current)' : '*'}
                        </label>
                        <Input
                            type="password"
                            value={form.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder={initial ? '********' : 'Enter password (min 8 chars)'}
                            className={validationErrors.password ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint={FORMAT_HINTS.password} error={validationErrors.password} />
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} disabled={submitting}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {initial ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

// ─── View Detail Modal ───────────────────────────────────────────
function StaffDetailModal({ open, onClose, staff }: { open: boolean; onClose: () => void; staff: any | null }) {
    if (!open || !staff) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Staff Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
                            {(staff.name || staff.firstName || '?').charAt(0)}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{staff.name || `${staff.firstName || ''} ${staff.lastName || ''}`.trim()}</p>
                            <Badge variant="outline">{ROLE_LABELS[staff.role] || staff.role}</Badge>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                            <p className="text-gray-900 font-medium">{staff.email || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                            <p className="text-gray-900 font-medium">{staff.phone || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Status</p>
                            <Badge variant={(staff.status || '').toUpperCase() === 'ACTIVE' ? 'default' : 'secondary'}>
                                {staff.status || 'N/A'}
                            </Badge>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Utilization</p>
                            <p className="text-gray-900 font-medium">{staff.utilization || 0}%</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-6 border-t">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
                </div>
            </motion.div>
        </div>
    )
}

// ─── Delete Confirm Modal ────────────────────────────────────────
function DeleteConfirmModal({
    open, onClose, onConfirm, staff, deleting
}: {
    open: boolean; onClose: () => void; onConfirm: () => void; staff: any | null; deleting: boolean
}) {
    if (!open || !staff) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-7 h-7 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Staff Member</h3>
                    <p className="text-gray-600">
                        Are you sure you want to delete <span className="font-medium">{staff.name || `${staff.firstName || ''} ${staff.lastName || ''}`}</span>? This action cannot be undone.
                    </p>
                </div>
                <div className="flex gap-3 p-6 border-t">
                    <button onClick={onClose} disabled={deleting}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50">Cancel</button>
                    <button onClick={onConfirm} disabled={deleting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                        {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Delete
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────
export default function LocationStaffPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [staff, setStaff] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [editingStaff, setEditingStaff] = useState<any>(null)
    const [viewTarget, setViewTarget] = useState<any>(null)
    const [deleteTarget, setDeleteTarget] = useState<any>(null)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [modalError, setModalError] = useState<string | null>(null)

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    // AI state
    const [aiInsights, setAiInsights] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const loadAiStaffInsights = async () => {
        setAiLoading(true)
        try {
            const result = await apiClient.get<any>('/advanced-analytics/insights')
            setAiInsights(result?.data || result)
        } catch (err) {
            console.error('AI staff insights unavailable:', err)
        } finally {
            setAiLoading(false)
        }
    }

    const fetchStaff = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const roleParam = filterRole !== 'all' ? filterRole : undefined
            const statusParam = filterStatus !== 'all' ? filterStatus : undefined
            const result = await LocationManagerService.getStaff(page, 10, searchTerm || undefined, roleParam, statusParam)
            setStaff(result?.data || [])
            setTotalPages(result?.totalPages || 1)
        } catch (err: any) {
            console.error('Error fetching staff:', err)
            setError(err.message || 'Failed to fetch staff')
            setStaff([])
        } finally {
            setIsLoading(false)
        }
    }, [page, searchTerm, filterRole, filterStatus])

    useEffect(() => {
        fetchStaff()
        loadAiStaffInsights()
    }, [fetchStaff])

    const handleOpenCreate = () => {
        setEditingStaff(null)
        setModalError(null)
        setShowModal(true)
    }

    const handleOpenEdit = (member: any) => {
        setEditingStaff(member)
        setModalError(null)
        setShowModal(true)
    }

    const handleSave = async (formPayload: any) => {
        try {
            setSubmitting(true)
            setModalError(null)
            if (editingStaff) {
                await LocationManagerService.updateStaff(editingStaff.id || editingStaff._id, formPayload)
                setToast({ message: 'Staff member updated successfully', type: 'success' })
            } else {
                await LocationManagerService.createStaff(formPayload)
                setToast({ message: 'Staff member created successfully', type: 'success' })
            }
            setShowModal(false)
            setEditingStaff(null)
            fetchStaff()
        } catch (err: any) {
            setModalError(err.message || 'Failed to save staff member')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            await LocationManagerService.deleteStaff(deleteTarget.id || deleteTarget._id)
            setDeleteTarget(null)
            setToast({ message: 'Staff member deleted successfully', type: 'success' })
            fetchStaff()
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to delete staff', type: 'error' })
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-gray-600 mt-1">Manage location staff members (Coaches)</p>
                </div>
                <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Coach
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Staff', value: staff.length, icon: Users, cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', titleColor: 'text-blue-700', valueColor: 'text-blue-900' },
                    { title: 'Active Staff', value: staff.filter(s => s.status?.toUpperCase() === 'ACTIVE').length, icon: UserCheck, cardBg: 'bg-gradient-to-br from-green-50 to-green-100', iconBg: 'bg-gradient-to-br from-green-500 to-green-600', titleColor: 'text-green-700', valueColor: 'text-green-900' },
                    { title: 'Coaches', value: staff.filter(s => s.role?.toUpperCase() === 'COACH').length, icon: Award, cardBg: 'bg-gradient-to-br from-purple-50 to-purple-100', iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600', titleColor: 'text-purple-700', valueColor: 'text-purple-900' },
                    { title: 'Avg Utilization', value: staff.length > 0 ? `${Math.round(staff.reduce((sum, s) => sum + (s.utilization || 0), 0) / staff.length)}%` : '0%', icon: Activity, cardBg: 'bg-gradient-to-br from-orange-50 to-orange-100', iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600', titleColor: 'text-orange-700', valueColor: 'text-orange-900' },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <Card className={`${metric.cardBg} border-0 shadow-sm hover:shadow-lg transition-shadow`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${metric.titleColor}`}>{metric.title}</p>
                                        <p className={`text-3xl font-bold ${metric.valueColor} mt-2`}>{metric.value}</p>
                                    </div>
                                    <div className={`${metric.iconBg} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* AI Staff Optimization */}
            <Card className="border-purple-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle className="text-base">AI Staff Optimization</CardTitle>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                        </div>
                        <button onClick={loadAiStaffInsights} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {aiLoading ? (
                        <div className="flex items-center justify-center py-4 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">Analyzing staff performance...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-semibold text-blue-700 uppercase">Utilization Analysis</span>
                                </div>
                                {(() => {
                                    const avgUtil = staff.length > 0 ? Math.round(staff.reduce((sum, s) => sum + (s.utilization || 0), 0) / staff.length) : 0
                                    const underUtilized = staff.filter(s => (s.utilization || 0) < 50).length
                                    return (
                                        <>
                                            <p className="text-sm font-medium text-blue-900">Average: {avgUtil}%</p>
                                            <Progress value={avgUtil} className="h-2 mt-2" />
                                            {underUtilized > 0 && (
                                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {underUtilized} staff under-utilized (&lt;50%)
                                                </p>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-semibold text-green-700 uppercase">Performance Score</span>
                                </div>
                                {(() => {
                                    const avgSat = staff.length > 0 ? (staff.reduce((sum, s) => sum + (s.satisfaction || 0), 0) / staff.length).toFixed(1) : '0'
                                    return (
                                        <>
                                            <p className="text-2xl font-bold text-green-900">{avgSat}/5.0</p>
                                            <p className="text-xs text-green-600 mt-1">Avg staff satisfaction score</p>
                                        </>
                                    )
                                })()}
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-semibold text-purple-700 uppercase">AI Recommendation</span>
                                </div>
                                <p className="text-sm font-medium text-purple-900">
                                    {aiInsights?.insights?.[0]?.title || aiInsights?.keyMetricsSummary || (staff.length > 0 ? 'Staff performance is being monitored by AI' : 'Add staff to enable AI analysis')}
                                </p>
                                {aiInsights?.immediateActions?.[0] && (
                                    <p className="text-xs text-purple-600 mt-2">{aiInsights.immediateActions[0]}</p>
                                )}
                                <Badge className="mt-2 bg-purple-100 text-purple-700 text-xs">
                                    {aiInsights?.aiPowered ? 'AI Active' : 'Analysis Mode'}
                                </Badge>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input placeholder="Search staff..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }} className="pl-10" />
                        </div>
                        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="py-8 text-center">
                        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                        <p className="text-red-600 font-medium mb-2">Error loading staff</p>
                        <p className="text-gray-500 text-sm mb-4">{error}</p>
                        <button onClick={fetchStaff} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
                    </CardContent>
                </Card>
            )}

            {/* Loading */}
            {isLoading && !error && (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-spin" />
                        <p className="text-gray-500">Loading staff...</p>
                    </CardContent>
                </Card>
            )}

            {/* Staff Table */}
            {!isLoading && !error && staff.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilization</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.map((member, idx) => (
                                        <motion.tr
                                            key={member.id || member._id || idx}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-900">{member.name || `${member.personalInfo?.firstName || ''} ${member.personalInfo?.lastName || ''}`.trim() || 'N/A'}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm text-gray-600">{member.email || member.contactInfo?.email || 'N/A'}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline">{ROLE_LABELS[member.role] || member.role || member.staffType || 'N/A'}</Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {(member.status || '').toUpperCase() === 'ACTIVE' ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    )}
                                                    <Badge variant={(member.status || '').toUpperCase() === 'ACTIVE' ? 'default' : 'secondary'}>
                                                        {member.status || 'N/A'}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-600" style={{ width: `${member.utilization || 0}%` }}></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{member.utilization || 0}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => setViewTarget(member)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="View">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleOpenEdit(member)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors" title="Edit">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteTarget(member)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && staff.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-1">No staff members found</p>
                        <p className="text-sm text-gray-400">
                            {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Add your first coach to get started'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Previous</button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                <StaffFormModal
                    open={showModal}
                    onClose={() => { setShowModal(false); setEditingStaff(null); setModalError(null) }}
                    onSubmit={handleSave}
                    initial={editingStaff}
                    submitting={submitting}
                    modalError={modalError}
                />
                <StaffDetailModal
                    open={!!viewTarget}
                    onClose={() => setViewTarget(null)}
                    staff={viewTarget}
                />
                <DeleteConfirmModal
                    open={!!deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDeleteConfirm}
                    staff={deleteTarget}
                    deleting={deleting}
                />
            </AnimatePresence>
        </div>
    )
}
