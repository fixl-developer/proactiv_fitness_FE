'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Shield,
  Lock,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { RoleService, PermissionService } from '@/services/userService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  isSystem?: boolean
  createdAt?: string
}

interface Permission {
  id: string
  name: string
  description?: string
  module: string
  action: string
  isSystem?: boolean
  createdAt?: string
}

const MODULES = [
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

const ACTIONS = ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export']

type TabKey = 'roles' | 'permissions'

export default function RolesAndPermissionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('roles')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Roles &amp; Permissions</h1>
          </div>
          <p className="text-slate-600">
            Define roles and assign granular permissions to control access across the system.
          </p>
        </motion.div>

        <div className="mb-6 border-b border-slate-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 font-medium text-sm transition ${
                activeTab === 'roles'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              Roles
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 font-medium text-sm transition ${
                activeTab === 'permissions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              Permissions
            </button>
          </nav>
        </div>

        {activeTab === 'roles' ? <RolesTab /> : <PermissionsTab />}
      </div>
    </div>
  )
}

// =============================================================================
// Roles Tab
// =============================================================================
function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Role | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadRoles = useCallback(async () => {
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
  }, [currentPage, searchTerm])

  const loadAllPermissions = useCallback(async () => {
    try {
      const response = await PermissionService.getAll({ page: 1, limit: 200 })
      setAllPermissions(response.data || [])
    } catch (error) {
      console.error('Error loading permissions:', error)
    }
  }, [])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  useEffect(() => {
    loadAllPermissions()
  }, [loadAllPermissions])

  const validateFormData = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Role name is required'
    else if (formData.name.trim().length < 2)
      newErrors.name = 'Role name must be at least 2 characters'
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
      if (editingRole) {
        await RoleService.update(editingRole.id, formData)
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

  const handleEdit = (role: Role) => {
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
    })
    setEditingRole(role)
    setShowForm(true)
  }

  const handleDelete = async (role: Role) => {
    try {
      await RoleService.delete(role.id)
      toast.success('Role deleted successfully')
      setDeleteConfirm(null)
      loadRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error(getErrorMessage(error))
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', permissions: [] })
    setErrors({})
    setEditingRole(null)
  }

  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  const togglePermission = (permissionName: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter((p) => p !== permissionName)
        : [...prev.permissions, permissionName],
    }))
  }

  // Group permissions by module for the picker
  const groupedPermissions = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const key = p.module || 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex gap-3 items-center flex-wrap"
      >
        <div className="flex-1 min-w-[260px] relative">
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Role Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{role.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {role.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {role.permissions?.length || 0} permissions
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            role.isSystem
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {role.isSystem ? 'System' : 'Custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(role)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(role)}
                            disabled={!!role.isSystem}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                            title={role.isSystem ? 'System roles cannot be deleted' : 'Delete'}
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
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {editingRole?.isSystem && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                This is a system role. You can adjust its permissions but cannot rename or delete it.
              </p>
            </div>
          )}

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
              disabled={!!editingRole?.isSystem}
              placeholder="e.g., Content Manager"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              } disabled:bg-slate-100`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

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

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">
              Permissions ({formData.permissions.length} selected)
            </label>
            {allPermissions.length === 0 ? (
              <div className="p-4 border border-slate-200 rounded-lg text-sm text-slate-500">
                No permissions defined yet. Add some from the Permissions tab first.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-4">
                {Object.entries(groupedPermissions).map(([module, perms]) => {
                  const modulePermNames = perms.map((p) => p.name)
                  const allModuleChecked = modulePermNames.every((n) =>
                    formData.permissions.includes(n)
                  )
                  return (
                    <div key={module}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          {module}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              permissions: allModuleChecked
                                ? prev.permissions.filter((p) => !modulePermNames.includes(p))
                                : Array.from(new Set([...prev.permissions, ...modulePermNames])),
                            }))
                          }}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {allModuleChecked ? 'Clear all' : 'Select all'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {perms.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission.name)}
                              onChange={() => togglePermission(permission.name)}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-slate-700">{permission.name}</span>
                            <span className="text-xs text-slate-400 ml-auto">
                              {permission.action}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
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
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Role?</h3>
            <p className="text-slate-600 mb-6">
              This will permanently delete the role &ldquo;{deleteConfirm.name}&rdquo;. Users with this
              role may lose access.
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
    </>
  )
}

// =============================================================================
// Permissions Tab
// =============================================================================
function PermissionsTab() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterModule, setFilterModule] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Permission | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    module: '',
    action: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadPermissions = useCallback(async () => {
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
  }, [currentPage, searchTerm, filterModule])

  useEffect(() => {
    loadPermissions()
  }, [loadPermissions])

  const validateFormData = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Permission name is required'
    else if (formData.name.trim().length < 2)
      newErrors.name = 'Permission name must be at least 2 characters'
    if (!formData.module) newErrors.module = 'Module is required'
    if (!formData.action) newErrors.action = 'Action is required'
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
      if (editingPermission) {
        await PermissionService.update(editingPermission.id, formData)
        toast.success('Permission updated successfully')
      } else {
        await PermissionService.create(formData)
        toast.success('Permission created successfully')
      }
      setShowForm(false)
      resetForm()
      loadPermissions()
    } catch (error) {
      console.error('Error saving permission:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (permission: Permission) => {
    setFormData({
      name: permission.name,
      description: permission.description || '',
      module: permission.module,
      action: permission.action,
    })
    setEditingPermission(permission)
    setShowForm(true)
  }

  const handleDelete = async (permission: Permission) => {
    try {
      await PermissionService.delete(permission.id)
      toast.success('Permission deleted successfully')
      setDeleteConfirm(null)
      loadPermissions()
    } catch (error) {
      console.error('Error deleting permission:', error)
      toast.error(getErrorMessage(error))
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', module: '', action: '' })
    setErrors({})
    setEditingPermission(null)
  }

  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  const buildName = () => {
    if (!formData.module || !formData.action) return
    const suggested = `${formData.module}.${formData.action}`
    if (!formData.name) setFormData((prev) => ({ ...prev, name: suggested }))
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex gap-3 items-center flex-wrap"
      >
        <div className="flex-1 min-w-[260px] relative">
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
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">All Modules</option>
          {MODULES.map((module) => (
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Permission
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Module
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {permissions.map((permission) => (
                    <tr key={permission.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {permission.name}
                      </td>
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
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {permission.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            permission.isSystem
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {permission.isSystem ? 'System' : 'Custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(permission)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(permission)}
                            disabled={!!permission.isSystem}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                            title={
                              permission.isSystem
                                ? 'System permissions cannot be deleted'
                                : 'Delete'
                            }
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
        title={editingPermission ? 'Edit Permission' : 'Create New Permission'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {editingPermission?.isSystem && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                This is a system permission. You can edit its description or metadata but cannot
                rename or delete it.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Module <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.module}
              onChange={(e) => {
                setFormData({ ...formData, module: e.target.value })
                if (errors.module) setErrors({ ...errors, module: '' })
                setTimeout(buildName, 0)
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.module
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select Module</option>
              {MODULES.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
            {errors.module && <p className="mt-1 text-sm text-red-600">{errors.module}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Action <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.action}
              onChange={(e) => {
                setFormData({ ...formData, action: e.target.value })
                if (errors.action) setErrors({ ...errors, action: '' })
                setTimeout(buildName, 0)
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.action
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select Action</option>
              {ACTIONS.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            {errors.action && <p className="mt-1 text-sm text-red-600">{errors.action}</p>}
          </div>

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
              disabled={!!editingPermission?.isSystem}
              placeholder="e.g., users.view"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              } disabled:bg-slate-100`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            {!errors.name && (
              <p className="mt-1 text-xs text-slate-500">
                Auto-filled from module + action. You can override it.
              </p>
            )}
          </div>

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
              {submitting
                ? 'Saving...'
                : editingPermission
                  ? 'Update Permission'
                  : 'Create Permission'}
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
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Permission?</h3>
            <p className="text-slate-600 mb-6">
              This will permanently delete &ldquo;{deleteConfirm.name}&rdquo;. Roles using this
              permission will lose it.
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
    </>
  )
}
