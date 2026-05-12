'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Lock, Info } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { PermissionService } from '@/services/userService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface Permission {
    id: string
    name: string
    description?: string
    module: string
    action: string
    resourceType?: string
    status?: 'active' | 'inactive' | 'deprecated'
    isSystemPermission?: boolean
    createdAt?: string
}

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [filterModule, setFilterModule] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        module: '',
        action: '',
        resourceType: '',
        status: 'active' as 'active' | 'inactive' | 'deprecated',
        isSystemPermission: false,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Available modules
    const modules = [
        'users',
        'roles',
        'permissions',
        'cms',
        'bookings',
        'payments',
        'reports',
        'settings',
        'locations',
        'staff',
        'students',
        'parents',
    ]

    // Available actions
    const actions = ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export']

    // Available resource types
    const resourceTypes = [
        'User',
        'Role',
        'Permission',
        'Booking',
        'Payment',
        'Report',
        'Location',
        'Staff',
        'Student',
        'Parent',
        'Program',
        'Schedule',
        'Class',
        'Session',
    ]

    // Status options
    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'deprecated', label: 'Deprecated' },
    ]

    // Load permissions
    const loadPermissions = async () => {
        try {
            setLoading(true)
            const response = await PermissionService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
                module: filterModule,
            })
            setPermissions(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading permissions:', error)
            toast.error('Failed to load permissions')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPermissions()
    }, [currentPage, searchTerm, filterModule])

    // Validate form
    const validateFormData = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name) newErrors.name = 'Permission name is required'
        else if (formData.name.length < 2) newErrors.name = 'Permission name must be at least 2 characters'

        if (!formData.module) newErrors.module = 'Module is required'
        if (!formData.action) newErrors.action = 'Action is required'

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
                await PermissionService.update(editingId, formData)
                toast.success('Permission updated successfully')
            } else {
                await PermissionService.create(formData)
                toast.success(
                    'Permission created. Now attach it to a role under Roles & Permissions for it to take effect.',
                    { duration: 7000 }
                )
            }

            setShowForm(false)
            resetForm()
            // Jump back to the first page so the newly created permission
            // (sorted by createdAt desc on the backend) is visible immediately.
            if (!editingId && currentPage !== 1) {
                setCurrentPage(1)
            } else {
                loadPermissions()
            }
        } catch (error) {
            console.error('Error saving permission:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    // Handle edit
    const handleEdit = (permission: Permission) => {
        setFormData({
            name: permission.name,
            description: permission.description || '',
            module: permission.module,
            action: permission.action,
            resourceType: permission.resourceType || '',
            status: permission.status || 'active',
            isSystemPermission: permission.isSystemPermission || false,
        })
        setEditingId(permission.id)
        setShowForm(true)
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            await PermissionService.delete(id)
            toast.success('Permission deleted successfully')
            setDeleteConfirm(null)
            loadPermissions()
        } catch (error) {
            console.error('Error deleting permission:', error)
            toast.error(getErrorMessage(error))
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            module: '',
            action: '',
            resourceType: '',
            status: 'active',
            isSystemPermission: false,
        })
        setErrors({})
        setEditingId(null)
    }

    // Handle close drawer
    const handleCloseDrawer = () => {
        setShowForm(false)
        resetForm()
    }

    // Get unique modules from permissions
    const uniqueModules = Array.from(new Set(permissions.map((p) => p.module)))

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
                        <h1 className="text-4xl font-bold text-slate-900">Permissions Management</h1>
                    </div>
                    <p className="text-slate-600">Define granular permissions for access control</p>
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>
                            Creating a permission here only adds it to the catalogue. To take effect for users, attach
                            it to a role on the{' '}
                            <a href="/admin/users/roles" className="underline font-medium">
                                Roles &amp; Permissions
                            </a>{' '}
                            page.
                        </p>
                    </div>
                </motion.div>

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex gap-4 items-center flex-wrap"
                >
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search permissions..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={filterModule}
                        onChange={(e) => {
                            setFilterModule(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Modules</option>
                        {modules.map((module) => (
                            <option key={module} value={module}>
                                {module}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            resetForm()
                            setShowForm(true)
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add Permission
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
                            <p className="mt-4 text-slate-600">Loading permissions...</p>
                        </div>
                    ) : permissions.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No permissions found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Permission Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Module</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Resource Type</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {permissions.map((permission) => (
                                            <tr key={permission.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{permission.name}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                                        {permission.module}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                        {permission.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                        {permission.resourceType || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${permission.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                                            permission.status === 'inactive' ? 'bg-slate-100 text-slate-800' :
                                                                'bg-orange-100 text-orange-800'
                                                        }`}>
                                                        {permission.status || 'active'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${permission.isSystemPermission ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {permission.isSystemPermission ? 'System' : 'Custom'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(permission)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(permission.id)}
                                                            disabled={permission.isSystemPermission}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                            title={permission.isSystemPermission ? 'System permissions cannot be deleted' : 'Delete'}
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
                    title={editingId ? 'Edit Permission' : 'Create New Permission'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Permission Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Permission Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value })
                                    if (errors.name) setErrors({ ...errors, name: '' })
                                }}
                                placeholder="e.g., users.view"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Module */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Module <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.module}
                                onChange={(e) => {
                                    setFormData({ ...formData, module: e.target.value })
                                    if (errors.module) setErrors({ ...errors, module: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.module ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            >
                                <option value="">Select Module</option>
                                {modules.map((module) => (
                                    <option key={module} value={module}>
                                        {module}
                                    </option>
                                ))}
                            </select>
                            {errors.module && <p className="mt-1 text-sm text-red-600">{errors.module}</p>}
                        </div>

                        {/* Action */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Action <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.action}
                                onChange={(e) => {
                                    setFormData({ ...formData, action: e.target.value })
                                    if (errors.action) setErrors({ ...errors, action: '' })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.action ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            >
                                <option value="">Select Action</option>
                                {actions.map((action) => (
                                    <option key={action} value={action}>
                                        {action}
                                    </option>
                                ))}
                            </select>
                            {errors.action && <p className="mt-1 text-sm text-red-600">{errors.action}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe what this permission allows"
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Resource Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Resource Type
                            </label>
                            <select
                                value={formData.resourceType}
                                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Resource Type</option>
                                {resourceTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-slate-500">Specifies what resource this permission applies to</p>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'deprecated' })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-slate-500">
                                {formData.status === 'active' && 'Permission is available for use'}
                                {formData.status === 'inactive' && 'Permission is disabled'}
                                {formData.status === 'deprecated' && 'Permission will be removed soon'}
                            </p>
                        </div>

                        {/* Is System Permission */}
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isSystemPermission}
                                    onChange={(e) => setFormData({ ...formData, isSystemPermission: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-900">Mark as System Permission</span>
                            </label>
                            <p className="mt-2 text-xs text-slate-500">
                                System permissions cannot be deleted and are protected from accidental removal
                            </p>
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
                                {submitting ? 'Saving...' : editingId ? 'Update Permission' : 'Create Permission'}
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
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Permission?</h3>
                            <p className="text-slate-600 mb-6">This action cannot be undone. Roles using this permission may be affected.</p>
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
