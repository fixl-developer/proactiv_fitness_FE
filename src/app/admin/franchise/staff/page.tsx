'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Search, Plus, Edit2, Trash2, Eye, Users, Mail, Phone,
    Shield, CheckCircle, AlertCircle, Activity, Star,
    UserCheck, Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FranchiseOwnerService, FranchiseStaff } from '@/services/franchiseOwnerService'
import { validateName, validateEmail, validatePhone, validatePassword, filterNameInput, filterPhoneInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'

// ------- Types -------
interface StaffFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    role: 'COACH' | 'LOCATION_MANAGER'
    location: string
    password: string
}

type ModalMode = 'add' | 'edit' | 'view' | 'delete' | null

const ROLES = ['COACH', 'LOCATION_MANAGER'] as const
const PAGE_SIZE = 10

const defaultForm: StaffFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'COACH',
    location: '',
    password: '',
}

// ------- Helpers -------
function roleBadgeVariant(role: string) {
    switch (role) {
        case 'MANAGER': return 'default'
        case 'COACH': return 'secondary'
        default: return 'outline'
    }
}

function roleLabel(role: string) {
    return role.replace('_', ' ')
}

// ------- Component -------
export default function FranchiseStaffPage() {
    // Data state
    const [staff, setStaff] = useState<FranchiseStaff[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filter / pagination
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalStaff, setTotalStaff] = useState(0)

    // Modal state
    const [modalMode, setModalMode] = useState<ModalMode>(null)
    const [selectedStaff, setSelectedStaff] = useState<FranchiseStaff | null>(null)
    const [formData, setFormData] = useState<StaffFormData>(defaultForm)
    const [submitting, setSubmitting] = useState(false)
    const [modalError, setModalError] = useState<string | null>(null)

    // ------- Fetch -------
    const fetchStaff = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const roleParam = filterRole !== 'all' ? filterRole : undefined
            const statusParam = filterStatus !== 'all' ? filterStatus.toUpperCase() : undefined
            const searchParam = searchTerm.trim() || undefined

            const response = await FranchiseOwnerService.getStaff(
                page,
                PAGE_SIZE,
                searchParam,
                roleParam,
                statusParam
            )
            setStaff(response.data || [])
            setTotalPages(response.totalPages)
            setTotalStaff(response.total)
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
    }, [fetchStaff])

    // Reset page when filters change
    useEffect(() => {
        setPage(1)
    }, [searchTerm, filterRole, filterStatus])

    // ------- Computed summary -------
    const activeStaff = staff.filter(s => s.status === 'ACTIVE').length
    const avgUtilization = staff.length > 0
        ? Math.round(staff.reduce((sum, s) => sum + (s.utilization || 0), 0) / staff.length)
        : 0
    const avgSatisfaction = staff.length > 0
        ? (staff.reduce((sum, s) => sum + (s.satisfaction || 0), 0) / staff.length).toFixed(1)
        : '0.0'

    // ------- Modal handlers -------
    const openAddModal = () => {
        setFormData(defaultForm)
        setSelectedStaff(null)
        setModalError(null)
        setModalMode('add')
    }

    const openViewModal = async (member: FranchiseStaff) => {
        try {
            setModalError(null)
            setModalMode('view')
            setSelectedStaff(member)
            // Fetch fresh detail
            const detail = await FranchiseOwnerService.getStaffMember(member.id)
            setSelectedStaff(detail)
        } catch (err: any) {
            // Fall back to the row data already set
            console.error('Failed to fetch staff detail:', err)
        }
    }

    const openEditModal = (member: FranchiseStaff) => {
        setSelectedStaff(member)
        const nameParts = (member.name || '').split(' ')
        setFormData({
            firstName: (member as any).firstName || nameParts[0] || '',
            lastName: (member as any).lastName || nameParts.slice(1).join(' ') || '',
            email: member.email,
            phone: member.phone,
            role: member.role === 'MANAGER' ? 'LOCATION_MANAGER' : member.role as any,
            location: member.location,
            password: '',
        })
        setModalError(null)
        setModalMode('edit')
    }

    const openDeleteModal = (member: FranchiseStaff) => {
        setSelectedStaff(member)
        setModalError(null)
        setModalMode('delete')
    }

    const closeModal = () => {
        setModalMode(null)
        setSelectedStaff(null)
        setFormData(defaultForm)
        setModalError(null)
    }

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const handleFormChange = (field: keyof StaffFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        let error: string | null = null
        if (field === 'firstName') error = validateName(value, 'First name')
        else if (field === 'lastName') error = validateName(value, 'Last name')
        else if (field === 'email') error = validateEmail(value)
        else if (field === 'phone') error = validatePhone(value, false)
        else if (field === 'password' && (value || modalMode === 'add')) error = validatePassword(value)
        setFieldErrors(prev => { const n = { ...prev }; if (error) n[field] = error; else delete n[field]; return n })
    }

    const validateForm = (): string | null => {
        const errs: Record<string, string> = {}
        const fnErr = validateName(formData.firstName, 'First name'); if (fnErr) errs.firstName = fnErr
        const lnErr = validateName(formData.lastName, 'Last name'); if (lnErr) errs.lastName = lnErr
        const emErr = validateEmail(formData.email); if (emErr) errs.email = emErr
        const phErr = validatePhone(formData.phone, false); if (phErr) errs.phone = phErr
        if (modalMode === 'add') { const pwErr = validatePassword(formData.password); if (pwErr) errs.password = pwErr }
        else if (formData.password) { const pwErr = validatePassword(formData.password); if (pwErr) errs.password = pwErr }
        setFieldErrors(errs)
        if (Object.keys(errs).length > 0) return Object.values(errs)[0]
        return null
    }

    const buildPayload = () => {
        const payload: any = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            role: formData.role,
            location: formData.location.trim(),
        }
        if (formData.password) payload.password = formData.password
        return payload
    }

    const handleCreate = async () => {
        const error = validateForm()
        if (error) { setModalError(error); return }
        try {
            setSubmitting(true)
            setModalError(null)
            await FranchiseOwnerService.createStaff(buildPayload())
            closeModal()
            fetchStaff()
        } catch (err: any) {
            setModalError(err.message || 'Failed to create staff member')
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdate = async () => {
        if (!selectedStaff) return
        const error = validateForm()
        if (error) { setModalError(error); return }
        try {
            setSubmitting(true)
            setModalError(null)
            await FranchiseOwnerService.updateStaff(selectedStaff.id, buildPayload())
            closeModal()
            fetchStaff()
        } catch (err: any) {
            setModalError(err.message || 'Failed to update staff member')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedStaff) return
        try {
            setSubmitting(true)
            setModalError(null)
            await FranchiseOwnerService.deleteStaff(selectedStaff.id)
            closeModal()
            fetchStaff()
        } catch (err: any) {
            setModalError(err.message || 'Failed to delete staff member')
        } finally {
            setSubmitting(false)
        }
    }

    // ------- Render -------
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-gray-600 mt-1">Manage your franchise staff members</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Add Staff
                </motion.button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-700">Total Staff</p>
                                    <p className="text-3xl font-bold text-blue-900">{totalStaff}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-700">Active Staff</p>
                                    <p className="text-3xl font-bold text-green-900">{activeStaff}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                    <UserCheck className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-700">Avg Utilization</p>
                                    <p className="text-3xl font-bold text-purple-900">{avgUtilization}%</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-orange-700">Avg Satisfaction</p>
                                    <p className="text-3xl font-bold text-orange-900">{avgSatisfaction}</p>
                                </div>
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                    <Star className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search staff by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            id="select-admin-franchise-staff-1"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">All Roles</option>
                            {ROLES.map(role => (
                                <option key={role} value={role}>{roleLabel(role)}</option>
                            ))}
                        </select>
                        <select
                            id="select-admin-franchise-staff-2"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Error Banner */}
            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-4 pb-4 flex items-center justify-between">
                            <p className="text-sm text-red-800">{error}</p>
                            <button id="admin-franchise-staff-btn-retry" onClick={fetchStaff} className="text-sm text-red-700 underline hover:text-red-900">
                                Retry
                            </button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Loading */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                </div>
            ) : staff.length === 0 ? (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">No staff members found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new staff member.</p>
                    </CardContent>
                </Card>
            ) : (
                /* Staff Table */
                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Role</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Location</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Utilization</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.map((member, idx) => (
                                        <motion.tr
                                            key={member.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-900">{member.name}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm text-gray-600">{member.email}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={roleBadgeVariant(member.role)}>
                                                    {roleLabel(member.role)}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-sm text-gray-600">{member.location}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {member.status === 'ACTIVE' ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-gray-400" />
                                                    )}
                                                    <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                        {member.status}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600 rounded-full transition-all"
                                                            style={{ width: `${member.utilization || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {member.utilization || 0}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-1">
                                                    <button id="admin-franchise-staff-btn"
                                                        onClick={() => openViewModal(member)}
                                                        title="View"
                                                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button id="admin-franchise-staff-btn-2"
                                                        onClick={() => openEditModal(member)}
                                                        title="Edit"
                                                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button id="admin-franchise-staff-btn-3"
                                                        onClick={() => openDeleteModal(member)}
                                                        title="Delete"
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button id="admin-franchise-staff-btn-4"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .reduce<(number | string)[]>((acc, p, i, arr) => {
                            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                            acc.push(p)
                            return acc
                        }, [])
                        .map((item, i) =>
                            typeof item === 'string' ? (
                                <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
                            ) : (
                                <button id="admin-franchise-staff-btn-5"
                                    key={item}
                                    onClick={() => setPage(item)}
                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                        page === item
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    {item}
                                </button>
                            )
                        )}
                    <button id="admin-franchise-staff-btn-6"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* ===================== DRAWERS ===================== */}

            {/* View Drawer */}
            <SlideInDrawer
                isOpen={modalMode === 'view'}
                onClose={closeModal}
                title="Staff Details"
                description={selectedStaff?.name}
                size="md"
                footer={
                    <Button variant="outline" onClick={closeModal} className="w-full">
                        Close
                    </Button>
                }
            >
                {selectedStaff && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white text-xl font-bold">
                                    {selectedStaff.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{selectedStaff.name}</h3>
                                <Badge variant={roleBadgeVariant(selectedStaff.role)}>
                                    {roleLabel(selectedStaff.role)}
                                </Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedStaff.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedStaff.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Shield className="w-4 h-4 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {selectedStaff.status === 'ACTIVE' ? (
                                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                        ) : (
                                            <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                                        )}
                                        <span className="text-sm font-medium text-gray-900">{selectedStaff.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <Users className="w-4 h-4 text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedStaff.location || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-purple-600 mb-1">Utilization</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-600 rounded-full"
                                            style={{ width: `${selectedStaff.utilization || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-purple-900">{selectedStaff.utilization || 0}%</span>
                                </div>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg">
                                <p className="text-xs text-orange-600 mb-1">Satisfaction</p>
                                <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm font-bold text-orange-900">{selectedStaff.satisfaction || 0}/5</span>
                                </div>
                            </div>
                        </div>
                        {selectedStaff.createdAt && (
                            <p className="text-xs text-gray-400 mt-4">
                                Member since {new Date(selectedStaff.createdAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                )}
            </SlideInDrawer>

            {/* Add / Edit Drawer */}
            <SlideInDrawer
                isOpen={modalMode === 'add' || modalMode === 'edit'}
                onClose={closeModal}
                title={modalMode === 'add' ? 'Add New Staff' : 'Edit Staff'}
                description={modalMode === 'add' ? 'Create a new staff member' : `Update ${selectedStaff?.name ?? ''}`}
                size="lg"
                footer={
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={closeModal} disabled={submitting} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={modalMode === 'add' ? handleCreate : handleUpdate}
                            disabled={submitting || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {modalMode === 'add' ? 'Create Staff' : 'Save Changes'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
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
                                placeholder="e.g. Jane"
                                value={formData.firstName}
                                onChange={(e) => handleFormChange('firstName', e.target.value)}
                                onKeyDown={filterNameInput}
                                className={fieldErrors.firstName ? 'border-red-500' : ''}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.firstName} error={fieldErrors.firstName} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <Input
                                placeholder="e.g. Doe"
                                value={formData.lastName}
                                onChange={(e) => handleFormChange('lastName', e.target.value)}
                                onKeyDown={filterNameInput}
                                className={fieldErrors.lastName ? 'border-red-500' : ''}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.lastName} error={fieldErrors.lastName} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <Input
                            type="email"
                            placeholder="e.g. jane@franchise.com"
                            value={formData.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                            className={fieldErrors.email ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint={FORMAT_HINTS.email} error={fieldErrors.email} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <Input
                            type="tel"
                            placeholder="e.g. +1 (212) 555-0100"
                            value={formData.phone}
                            onChange={(e) => handleFormChange('phone', e.target.value)}
                            onKeyDown={filterPhoneInput}
                            className={fieldErrors.phone ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint={FORMAT_HINTS.phone} error={fieldErrors.phone} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <select
                            value={formData.role}
                            onChange={(e) => handleFormChange('role', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            {ROLES.map(role => (
                                <option key={role} value={role}>{roleLabel(role)}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">Franchise Owners can create Location Manager and Coach roles</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <Input
                            placeholder="e.g. Main Location"
                            value={formData.location}
                            onChange={(e) => handleFormChange('location', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password {modalMode === 'edit' ? '(leave blank to keep current)' : '*'}
                        </label>
                        <Input
                            type="password"
                            placeholder={modalMode === 'edit' ? '********' : 'Enter password (min 8 chars)'}
                            value={formData.password}
                            onChange={(e) => handleFormChange('password', e.target.value)}
                            className={fieldErrors.password ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint={FORMAT_HINTS.password} error={fieldErrors.password} />
                    </div>
                </div>
            </SlideInDrawer>

            {/* Delete Confirmation Drawer */}
            <SlideInDrawer
                isOpen={modalMode === 'delete'}
                onClose={closeModal}
                title="Delete Staff Member"
                description={selectedStaff ? `Permanently remove ${selectedStaff.name}` : undefined}
                size="sm"
                footer={
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={closeModal} disabled={submitting} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={submitting}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete Staff
                        </Button>
                    </div>
                }
            >
                {selectedStaff && (
                    <div className="space-y-4">
                        {modalError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {modalError}
                            </div>
                        )}
                        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                            <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    Are you sure you want to delete <span className="font-bold">{selectedStaff.name}</span>?
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    This action cannot be undone. All data associated with this staff member will be permanently removed.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </SlideInDrawer>
        </div>
    )
}
