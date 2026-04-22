'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { RoleService } from '@/services/userService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface Role {
    id: string
    name: string
    description?: string
    permissions: string[]
    createdAt?: string
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([])
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
        description: '',
        permissions: [] as string[],
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Available permissions (you can fetch this from API)
    const availablePermissions = [
        'users.view',
        'users.create',
        'users.edit',
        'users.delete',
        'roles.view',
        'roles.create',
        'roles.edit',
        'roles.delete',
        'cms.view',
        'cms.edit',
        'bookings.view',
        'bookings.manage',
        'reports.view',
        'settings.view',
        'settings.edit',
    ]

    // Load roles
    const loadRoles = async () => {
        try {
            setLoading(true)
            const response = await RoleService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
            })
            setRoles(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading roles:', error)
            toast.error('Failed to load roles')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRoles()
    }, [currentPage, searchTerm])

    // Validate form
    const validateFormData = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name) newErrors.name = 'Role name is required'
        else if (formData.name.length < 2) newErrors.name = 'Role name must be at least 2 characters'

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
                await RoleService.update(editingId, formData)
                toast.success('Role updated successfully')
            } else {
                await RoleService.create(formData)
                toast.success('Role created successfully')
            }

            setShowForm(false)
            resetForm()
            loadRoles()
        } catch (error) {
            console.error('Error saving role:', error)
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    // Handle edit
    const handleEdit = (role: Role) => {
        setFormData({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || [],
        })
        setEditingId(role.id)
        setShowForm(true)
    }

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            await RoleService.delete(id)
            toast.success('Role deleted successfully')
            setDeleteConfirm(null)
            loadRoles()
        } catch (error) {
            console.error('Error deleting role:', error)
            toast.error(getErrorMessage(error))
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            permissions: [],
        })
        setErrors({})
        setEditingId(null)
    }

    // Handle close drawer
    const handleCloseDrawer = () => {
        setShowForm(false)
        resetForm()
    }

    // Toggle permission
    const togglePermission = (permission: string) => {
        setFormData((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter((p) => p !== permission)
                : [...prev.permissions, permission],
        }))
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
                        <Shield className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">Roles Management</h1>
                    </div>
                    <p className="text-slate-600">Define roles and assign permissions to control access</p>
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
                            placeholder="Search roles..."
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
                        Add Role
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
                            <p className="mt-4 text-slate-600">Loading roles...</p>
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No roles found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Description</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Permissions</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {roles.map((role) => (
                                            <tr key={role.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{role.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{role.description || '-'}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                        {role.permissions?.length || 0} permissions
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(role)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(role.id)}
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
                    title={editingId ? 'Edit Role' : 'Create New Role'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Role Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value })
                                    if (errors.name) setErrors({ ...errors, name: '' })
                                }}
                                placeholder="e.g., Content Manager"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the role and its responsibilities"
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Permissions */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-3">Permissions</label>
                            <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-4">
                                {availablePermissions.map((permission) => (
                                    <label key={permission} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.includes(permission)}
                                            onChange={() => togglePermission(permission)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700">{permission}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                Selected: {formData.permissions.length} permission(s)
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
                                {submitting ? 'Saving...' : editingId ? 'Update Role' : 'Create Role'}
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
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Role?</h3>
                            <p className="text-slate-600 mb-6">This action cannot be undone. Users with this role may lose access.</p>
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
