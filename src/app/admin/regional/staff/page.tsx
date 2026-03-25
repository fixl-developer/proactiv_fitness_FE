'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Eye, Users, Mail, Phone, MapPin, Award, X, Loader2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { RegionalAdminService, RegionalStaff, RegionalLocation } from '@/services/regionalAdminService'

const ROLES = ['COACH', 'LOCATION_MANAGER', 'SUPPORT_STAFF', 'FRANCHISE_OWNER'] as const
const ROLE_LABELS: Record<string, string> = {
    COACH: 'Coach',
    LOCATION_MANAGER: 'Location Manager',
    SUPPORT_STAFF: 'Support Staff',
    FRANCHISE_OWNER: 'Franchise Owner',
}
const PAGE_SIZE = 10

// ─── Staff Form Modal ────────────────────────────────────────────────
function StaffFormModal({
    open,
    onClose,
    onSubmit,
    initial,
    locations,
    submitting,
}: {
    open: boolean
    onClose: () => void
    onSubmit: (data: any) => void
    initial?: RegionalStaff | null
    locations: RegionalLocation[]
    submitting: boolean
}) {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'COACH',
        locationId: '',
        password: '',
    })

    useEffect(() => {
        if (initial) {
            const nameParts = (initial.name || '').split(' ')
            setForm({
                firstName: initial.firstName || nameParts[0] || '',
                lastName: initial.lastName || nameParts.slice(1).join(' ') || '',
                email: initial.email || '',
                phone: initial.phone || '',
                role: initial.role || 'COACH',
                locationId: initial.locationId || '',
                password: '',
            })
        } else {
            setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'COACH', locationId: '', password: '' })
        }
    }, [initial, open])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const payload: any = { ...form }
        if (!payload.password) delete payload.password
        if (!payload.locationId) delete payload.locationId
        onSubmit(payload)
    }

    if (!open) return null

    return (
        <div id="admin-regional-staff-div-clickable" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {initial ? 'Edit Staff Member' : 'Add Staff Member'}
                    </h2>
                    <button id="admin-regional-staff-btn" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <Input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="First name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <Input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Last name" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <Input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {ROLES.map(r => (
                                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <select
                            name="locationId"
                            value={form.locationId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select location...</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password {initial ? '(leave blank to keep current)' : ''}
                        </label>
                        <Input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder={initial ? '********' : 'Enter password'}
                            {...(!initial ? { required: true } : {})}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button id="admin-regional-staff-btn-cancel"
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button id="admin-regional-staff-btn-2"
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {initial ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

// ─── View Detail Modal ───────────────────────────────────────────────
function StaffDetailModal({
    open,
    onClose,
    staff,
}: {
    open: boolean
    onClose: () => void
    staff: RegionalStaff | null
}) {
    if (!open || !staff) return null

    return (
        <div id="admin-regional-staff-div-clickable-2" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Staff Details</h2>
                    <button id="admin-regional-staff-btn-3" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
                            {staff.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{staff.name}</p>
                            <Badge variant="outline">{ROLE_LABELS[staff.role] || staff.role}</Badge>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 mb-1">Email</p>
                            <p className="flex items-center gap-1 text-gray-900"><Mail className="w-4 h-4 text-gray-400" />{staff.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Phone</p>
                            <p className="flex items-center gap-1 text-gray-900"><Phone className="w-4 h-4 text-gray-400" />{staff.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Location</p>
                            <p className="flex items-center gap-1 text-gray-900"><MapPin className="w-4 h-4 text-gray-400" />{staff.location || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Status</p>
                            <Badge variant={staff.status === 'active' || staff.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {staff.status}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Join Date</p>
                            <p className="text-gray-900">{staff.joinDate ? new Date(staff.joinDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        {staff.performance != null && (
                            <div>
                                <p className="text-gray-500 mb-1">Performance</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${staff.performance}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{staff.performance}%</span>
                                </div>
                            </div>
                        )}
                        {staff.utilization != null && (
                            <div>
                                <p className="text-gray-500 mb-1">Utilization</p>
                                <p className="text-gray-900">{staff.utilization}%</p>
                            </div>
                        )}
                        {staff.satisfaction != null && (
                            <div>
                                <p className="text-gray-500 mb-1">Satisfaction</p>
                                <p className="text-gray-900">{staff.satisfaction}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end p-6 border-t">
                    <button id="admin-regional-staff-btn-close"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// ─── Delete Confirmation Modal ───────────────────────────────────────
function DeleteConfirmModal({
    open,
    onClose,
    onConfirm,
    staff,
    deleting,
}: {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    staff: RegionalStaff | null
    deleting: boolean
}) {
    if (!open || !staff) return null

    return (
        <div id="admin-regional-staff-div-clickable-3" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-7 h-7 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Staff Member</h3>
                    <p className="text-gray-600">
                        Are you sure you want to delete <span className="font-medium">{staff.name}</span>? This action cannot be undone.
                    </p>
                </div>
                <div className="flex gap-3 p-6 border-t">
                    <button id="admin-regional-staff-btn-cancel-2"
                        onClick={onClose}
                        disabled={deleting}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button id="admin-regional-staff-btn--delete"
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Delete
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function RegionalStaffPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [page, setPage] = useState(1)

    // Data
    const [staff, setStaff] = useState<RegionalStaff[]>([])
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [locations, setLocations] = useState<RegionalLocation[]>([])

    // State
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Modal state
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<RegionalStaff | null>(null)
    const [viewTarget, setViewTarget] = useState<RegionalStaff | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<RegionalStaff | null>(null)

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ── Debounce search ──────────────────────────────────────────────
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setPage(1)
        }, 400)
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [searchTerm])

    // ── Fetch staff ──────────────────────────────────────────────────
    const fetchStaff = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const role = filterRole === 'all' ? undefined : filterRole
            const res = await RegionalAdminService.getStaff(page, PAGE_SIZE, debouncedSearch || undefined, role)
            setStaff(res.data || [])
            setTotal(res.total || 0)
            setTotalPages(res.totalPages || 1)
        } catch (err: any) {
            console.error('Failed to fetch staff:', err)
            setError(err?.message || 'Failed to load staff data')
            setStaff([])
        } finally {
            setLoading(false)
        }
    }, [page, debouncedSearch, filterRole])

    useEffect(() => {
        fetchStaff()
    }, [fetchStaff])

    // ── Fetch locations for dropdowns ────────────────────────────────
    useEffect(() => {
        RegionalAdminService.getLocations(1, 100)
            .then(res => setLocations(res.data || []))
            .catch(() => setLocations([]))
    }, [])

    // ── Reset page when filter changes ───────────────────────────────
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterRole(e.target.value)
        setPage(1)
    }

    // ── Create / Update ──────────────────────────────────────────────
    const handleFormSubmit = async (data: any) => {
        setSubmitting(true)
        try {
            if (editTarget) {
                await RegionalAdminService.updateStaff(editTarget.id, data)
            } else {
                await RegionalAdminService.createStaff(data)
            }
            setFormOpen(false)
            setEditTarget(null)
            fetchStaff()
        } catch (err: any) {
            console.error('Failed to save staff:', err)
            alert(err?.message || 'Failed to save staff member')
        } finally {
            setSubmitting(false)
        }
    }

    // ── Delete ───────────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await RegionalAdminService.deleteStaff(deleteTarget.id)
            setDeleteTarget(null)
            fetchStaff()
        } catch (err: any) {
            console.error('Failed to delete staff:', err)
            alert(err?.message || 'Failed to delete staff member')
        } finally {
            setDeleting(false)
        }
    }

    // ── Open modals ──────────────────────────────────────────────────
    const openAdd = () => {
        setEditTarget(null)
        setFormOpen(true)
    }
    const openEdit = (member: RegionalStaff) => {
        setEditTarget(member)
        setFormOpen(true)
    }
    const openView = (member: RegionalStaff) => setViewTarget(member)
    const openDelete = (member: RegionalStaff) => setDeleteTarget(member)

    const roles = ['all', ...ROLES]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Regional Staff</h1>
                    <p className="text-gray-600 mt-1">
                        Manage staff across all regional locations
                        {!loading && <span className="ml-1">({total} total)</span>}
                    </p>
                </div>
                <button id="admin-regional-staff-btn-4"
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Staff
                </button>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search staff..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            id="select-admin-regional-staff-1"
                            value={filterRole}
                            onChange={handleRoleChange}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {roles.map(role => (
                                <option key={role} value={role}>
                                    {role === 'all' ? 'All Roles' : ROLE_LABELS[role] || role}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Card>
                    <CardContent className="py-8 text-center">
                        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                        <p className="text-red-600 font-medium mb-2">Error loading staff</p>
                        <p className="text-gray-500 text-sm mb-4">{error}</p>
                        <button id="admin-regional-staff-btn-retry"
                            onClick={fetchStaff}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {loading && !error && (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-spin" />
                        <p className="text-gray-500">Loading staff...</p>
                    </CardContent>
                </Card>
            )}

            {/* Staff Table */}
            {!loading && !error && staff.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Performance</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.map((member, idx) => (
                                        <motion.tr
                                            key={member.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-900">{member.name}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline">{ROLE_LABELS[member.role] || member.role}</Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm text-gray-600">{member.location || 'N/A'}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-600">
                                                    <p className="flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</p>
                                                    {member.phone && (
                                                        <p className="flex items-center gap-1"><Phone className="w-3 h-3" />{member.phone}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {member.performance != null ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-green-600 h-2 rounded-full"
                                                                style={{ width: `${member.performance}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{member.performance}%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={member.status === 'active' || member.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                    {member.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button id="admin-regional-staff-btn-5"
                                                        onClick={() => openView(member)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button id="admin-regional-staff-btn-6"
                                                        onClick={() => openEdit(member)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button id="admin-regional-staff-btn-7"
                                                        onClick={() => openDelete(member)}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
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
            {!loading && !error && staff.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-1">No staff members found</p>
                        <p className="text-sm text-gray-400">
                            {debouncedSearch || filterRole !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Add your first staff member to get started'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} staff
                    </p>
                    <div className="flex items-center gap-2">
                        <button id="admin-regional-staff-btn-8"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .reduce<(number | string)[]>((acc, p, i, arr) => {
                                if (i > 0 && (arr[i - 1] as number) < p - 1) acc.push('...')
                                acc.push(p)
                                return acc
                            }, [])
                            .map((item, idx) =>
                                typeof item === 'string' ? (
                                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                                ) : (
                                    <button id="admin-regional-staff-btn-9"
                                        key={item}
                                        onClick={() => setPage(item)}
                                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                            page === item
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                )
                        )}
                        <button id="admin-regional-staff-btn-10"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                <StaffFormModal
                    open={formOpen}
                    onClose={() => { setFormOpen(false); setEditTarget(null) }}
                    onSubmit={handleFormSubmit}
                    initial={editTarget}
                    locations={locations}
                    submitting={submitting}
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
