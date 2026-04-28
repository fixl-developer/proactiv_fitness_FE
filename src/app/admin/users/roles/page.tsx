'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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

// =============================================================================
// Types
// =============================================================================
interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  roleType?: 'admin' | 'manager' | 'staff' | 'user' | 'custom'
  status?: 'active' | 'inactive' | 'deprecated'
  isSystem?: boolean
  createdAt?: string
}

interface Permission {
  id: string
  name: string
  description?: string
  module: string
  action: string
  status?: 'active' | 'inactive' | 'deprecated'
  isSystemPermission?: boolean
  createdAt?: string
}

// =============================================================================
// Constants — must match backend enums in
// backend/src/modules/permissions/permission.routes.ts
// =============================================================================
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
] as const

const ACTIONS = ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export'] as const

const ROLE_TYPES = [
  { value: 'admin', label: 'Admin (Full System Access)' },
  { value: 'manager', label: 'Manager (Location/Team Management)' },
  { value: 'staff', label: 'Staff (Staff Operations)' },
  { value: 'user', label: 'User (End-User Role)' },
  { value: 'custom', label: 'Custom' },
] as const

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deprecated', label: 'Deprecated' },
] as const

// =============================================================================
// Validation helpers (page-local — module-action strings need a different
// regex than person names, so we don't reuse /utils/validation here)
// =============================================================================
const ROLE_NAME_RE = /^[A-Za-z][A-Za-z0-9 _-]{1,49}$/
const PERMISSION_NAME_RE = /^[a-z]+(\.[a-z_]+)+$/

function validateRoleName(value: string): string | null {
  const v = value.trim()
  if (!v) return 'Role name is required'
  if (v.length < 2) return 'Role name must be at least 2 characters'
  if (v.length > 50) return 'Role name cannot exceed 50 characters'
  if (!ROLE_NAME_RE.test(v)) {
    return 'Role name must start with a letter and contain only letters, numbers, spaces, underscore or hyphen'
  }
  return null
}

function validatePermissionName(value: string): string | null {
  const v = value.trim()
  if (!v) return 'Permission name is required'
  if (v.length < 3) return 'Permission name must be at least 3 characters'
  if (v.length > 100) return 'Permission name cannot exceed 100 characters'
  if (!PERMISSION_NAME_RE.test(v)) {
    return 'Use the form module.action (lowercase letters and dots only, e.g. users.view)'
  }
  return null
}

function validateDescription(value: string): string | null {
  if (value && value.length > 500) return 'Description cannot exceed 500 characters'
  return null
}

// Block characters that shouldn't be typed into a role-name field at all
function filterRoleNameKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key.length !== 1) return // allow Backspace, arrows, etc.
  if (!/^[A-Za-z0-9 _-]$/.test(e.key)) e.preventDefault()
}

// Block characters that shouldn't be typed into a permission-name field
function filterPermissionNameKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key.length !== 1) return
  if (!/^[a-z._]$/.test(e.key)) e.preventDefault()
}

type TabKey = 'roles' | 'permissions'

// =============================================================================
// Page shell
// =============================================================================
export default function RolesAndPermissionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('permissions')

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
            Define permissions, group them into roles, and assign roles to users.
          </p>
          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Workflow:</strong> 1) Create permissions in the{' '}
              <em>Permissions</em> tab. 2) Create a role in the <em>Roles</em> tab and tick the
              permissions it should grant. 3) On <a href="/admin/users/create" className="underline font-medium">Create User</a>, pick that role.
              The user can then sign in at <code className="bg-white px-1 rounded">/login/staff</code> and land on the dashboard mapped to their role.
            </div>
          </div>
        </motion.div>

        <div className="mb-6 border-b border-slate-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('permissions')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 font-medium text-sm transition ${activeTab === 'permissions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
            >
              <Lock className="w-4 h-4" />
              Permissions
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 font-medium text-sm transition ${activeTab === 'roles'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
            >
              <Shield className="w-4 h-4" />
              Roles
            </button>
          </nav>
        </div>

        {activeTab === 'permissions' ? <PermissionsTab /> : <RolesTab />}
      </div>
    </div>
  )
}

// =============================================================================
// Permissions Tab
// =============================================================================
function PermissionsTab() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Permission | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterModule, setFilterModule] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Permission | null>(null)

  const [formData, setFormData] = useState({
    module: '',
    action: '',
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await PermissionService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        module: filterModule || undefined,
      })
      setPermissions(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading permissions:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, filterModule])

  useEffect(() => {
    loadPermissions()
  }, [loadPermissions])

  const resetForm = () => {
    setFormData({ module: '', action: '', name: '', description: '' })
    setErrors({})
    setEditing(null)
  }

  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  const validateAll = (): boolean => {
    const next: Record<string, string> = {}
    if (!formData.module) next.module = 'Module is required'
    if (!formData.action) next.action = 'Action is required'
    const nameErr = validatePermissionName(formData.name)
    if (nameErr) next.name = nameErr
    const descErr = validateDescription(formData.description)
    if (descErr) next.description = descErr
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) {
      toast.error('Please fix the highlighted fields')
      return
    }
    try {
      setSubmitting(true)
      const payload = {
        name: formData.name.trim(),
        module: formData.module,
        action: formData.action,
        description: formData.description.trim() || undefined,
      }
      if (editing) {
        // backend update endpoint only accepts description / status / resourceType
        await PermissionService.update(editing.id, { description: payload.description })
        toast.success('Permission updated')
      } else {
        await PermissionService.create(payload)
        toast.success('Permission created')
      }
      handleCloseDrawer()
      loadPermissions()
    } catch (error) {
      console.error('Error saving permission:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (p: Permission) => {
    setFormData({
      module: p.module,
      action: p.action,
      name: p.name,
      description: p.description || '',
    })
    setEditing(p)
    setShowForm(true)
  }

  const handleDelete = async (p: Permission) => {
    try {
      await PermissionService.delete(p.id)
      toast.success('Permission deleted')
      setDeleteConfirm(null)
      loadPermissions()
    } catch (error) {
      console.error('Error deleting permission:', error)
      toast.error(getErrorMessage(error))
    }
  }

  // Auto-fill `name` from module+action when both are picked and the user
  // hasn't typed a name yet (or hasn't customised it).
  const onModuleChange = (mod: string) => {
    setFormData((prev) => {
      const next = { ...prev, module: mod }
      const auto = mod && prev.action ? `${mod}.${prev.action}` : ''
      const wasAuto = !prev.name || prev.name === `${prev.module}.${prev.action}`
      if (auto && wasAuto) next.name = auto
      return next
    })
    if (errors.module) setErrors((e) => ({ ...e, module: '' }))
  }

  const onActionChange = (act: string) => {
    setFormData((prev) => {
      const next = { ...prev, action: act }
      const auto = prev.module && act ? `${prev.module}.${act}` : ''
      const wasAuto = !prev.name || prev.name === `${prev.module}.${prev.action}`
      if (auto && wasAuto) next.name = auto
      return next
    })
    if (errors.action) setErrors((e) => ({ ...e, action: '' }))
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
          {MODULES.map((m) => (
            <option key={m} value={m}>
              {m}
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Permission</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Module</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {permissions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{p.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {p.module}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {p.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">{p.description || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${p.isSystemPermission
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          {p.isSystemPermission ? 'System' : 'Custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(p)}
                            disabled={!!p.isSystemPermission}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                            title={p.isSystemPermission ? 'System permissions cannot be deleted' : 'Delete'}
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
        title={editing ? 'Edit Permission' : 'Create New Permission'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {editing?.isSystemPermission && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                This is a system permission. You can edit its description but module, action and name
                are locked.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Module <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.module}
              onChange={(e) => onModuleChange(e.target.value)}
              disabled={!!editing}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.module
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
                } disabled:bg-slate-100`}
            >
              <option value="">Select Module</option>
              {MODULES.map((m) => (
                <option key={m} value={m}>
                  {m}
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
              onChange={(e) => onActionChange(e.target.value)}
              disabled={!!editing}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.action
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
                } disabled:bg-slate-100`}
            >
              <option value="">Select Action</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
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
              onKeyDown={filterPermissionNameKey}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value.toLowerCase() })
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
              disabled={!!editing}
              placeholder="e.g. users.view"
              maxLength={100}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
                } disabled:bg-slate-100`}
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Format: <code>module.action</code> — lowercase letters, dots and underscores only.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
                if (errors.description) setErrors({ ...errors, description: '' })
              }}
              placeholder="Describe what this permission allows"
              rows={3}
              maxLength={500}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.description
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
                }`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-xs text-slate-500">{formData.description.length} / 500 characters</p>
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
              {submitting ? 'Saving...' : editing ? 'Update Permission' : 'Create Permission'}
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
                onClick={() => handleDelete(deleteConfirm)}
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
// Roles Tab
// =============================================================================
function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Role | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    roleType: 'custom' as 'admin' | 'manager' | 'staff' | 'user' | 'custom',
    status: 'active' as 'active' | 'inactive' | 'deprecated',
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
      toast.error(getErrorMessage(error))
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

  const groupedPermissions = useMemo(() => {
    return allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
      const key = p.module || 'other'
      if (!acc[key]) acc[key] = []
      acc[key].push(p)
      return acc
    }, {})
  }, [allPermissions])

  const validateAll = (): boolean => {
    const next: Record<string, string> = {}
    const nameErr = validateRoleName(formData.name)
    if (nameErr) next.name = nameErr
    const descErr = validateDescription(formData.description)
    if (descErr) next.description = descErr
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) {
      toast.error('Please fix the highlighted fields')
      return
    }
    try {
      setSubmitting(true)
      if (editing) {
        await RoleService.update(editing.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          permissions: formData.permissions,
          roleType: formData.roleType,
          status: formData.status,
        })
        toast.success('Role updated')
      } else {
        await RoleService.create({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          permissions: formData.permissions,
          roleType: formData.roleType,
          status: formData.status,
        })
        toast.success('Role created')
      }
      handleCloseDrawer()
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
      roleType: role.roleType || 'custom',
      status: role.status || 'active',
    })
    setEditing(role)
    setShowForm(true)
  }

  const handleDelete = async (role: Role) => {
    try {
      await RoleService.delete(role.id)
      toast.success('Role deleted')
      setDeleteConfirm(null)
      loadRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error(getErrorMessage(error))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
      roleType: 'custom',
      status: 'active',
    })
    setErrors({})
    setEditing(null)
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Description</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Permissions</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Source</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{role.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                        {role.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                          {role.roleType || 'custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${role.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : role.status === 'inactive'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-orange-100 text-orange-800'
                            }`}
                        >
                          {role.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {role.permissions?.length || 0} permissions
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${role.isSystem
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
        title={editing ? 'Edit Role' : 'Create New Role'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {editing?.isSystem && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                This is a system role. You can adjust permissions, type and status but the name is locked.
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
              onKeyDown={filterRoleNameKey}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
              disabled={!!editing?.isSystem}
              placeholder="e.g. Content Manager"
              maxLength={50}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
                } disabled:bg-slate-100`}
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Letters, numbers, spaces, underscore or hyphen. Must start with a letter.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value })
                if (errors.description) setErrors({ ...errors, description: '' })
              }}
              placeholder="Describe the role and its responsibilities"
              rows={3}
              maxLength={500}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.description
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:ring-blue-500'
                }`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-xs text-slate-500">{formData.description.length} / 500 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Role Type</label>
            <select
              value={formData.roleType}
              onChange={(e) =>
                setFormData({ ...formData, roleType: e.target.value as typeof formData.roleType })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as typeof formData.status })
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
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
              {submitting ? 'Saving...' : editing ? 'Update Role' : 'Create Role'}
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
              This will permanently delete the role &ldquo;{deleteConfirm.name}&rdquo;. Users with
              this role may lose access.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
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
