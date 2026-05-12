'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  UserCheck,
  UserX,
  Users as UsersIcon,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { UserService, RoleService } from '@/services/userService'
import { apiClient } from '@/services/api/client'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import { useAuth } from '@/hooks/useAuth'
import {
  validateName,
  validateEmail,
  validatePhone,
  filterNameInput,
  filterPhoneInput,
} from '@/utils/validation'

// Admin-creatable roles only. Self-register roles (PARENT, USER, STUDENT)
// are handled via the public /register flow and are not creatable from here,
// but they remain visible in the *list* + filter so admins can audit them.
const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin', color: 'bg-red-100 text-red-800', dashboard: '/admin/dashboard', loginUrl: '/login/staff' },
  { value: 'REGIONAL_ADMIN', label: 'Regional Admin', color: 'bg-purple-100 text-purple-800', dashboard: '/admin/regional/dashboard', loginUrl: '/login/staff' },
  { value: 'FRANCHISE_OWNER', label: 'Franchise Owner', color: 'bg-blue-100 text-blue-800', dashboard: '/admin/franchise/dashboard', loginUrl: '/login/staff' },
  { value: 'LOCATION_MANAGER', label: 'Location Manager', color: 'bg-green-100 text-green-800', dashboard: '/admin/location/dashboard', loginUrl: '/login/staff' },
  { value: 'MANAGER', label: 'Manager', color: 'bg-emerald-100 text-emerald-800', dashboard: '/manager/dashboard', loginUrl: '/login/staff' },
  { value: 'COACH', label: 'Coach', color: 'bg-yellow-100 text-yellow-800', dashboard: '/coach/dashboard', loginUrl: '/login/staff' },
  { value: 'STAFF', label: 'Staff', color: 'bg-orange-100 text-orange-800', dashboard: '/staff/dashboard', loginUrl: '/login/staff' },
  { value: 'SUPPORT_STAFF', label: 'Support Staff', color: 'bg-orange-100 text-orange-800', dashboard: '/staff/dashboard', loginUrl: '/login/staff' },
  { value: 'PARTNER_ADMIN', label: 'Partner Admin', color: 'bg-pink-100 text-pink-800', dashboard: '/partner/dashboard', loginUrl: '/login/staff' },
  // Read-only entries below — for filtering / display only.
  { value: 'PARENT', label: 'Parent (self-register)', color: 'bg-indigo-100 text-indigo-800', dashboard: '/parent/dashboard', loginUrl: '/login', selfRegister: true },
  { value: 'STUDENT', label: 'Student (self-register)', color: 'bg-teal-100 text-teal-800', dashboard: '/user/dashboard', loginUrl: '/login', selfRegister: true },
  { value: 'USER', label: 'User (self-register)', color: 'bg-gray-100 text-gray-800', dashboard: '/user/dashboard', loginUrl: '/login', selfRegister: true },
] as const

// Roles the admin can actually create (matches backend ROLE_HIERARCHY['ADMIN'])
const CREATABLE_ROLES = ROLE_OPTIONS.filter((r) => !(r as any).selfRegister)

// Roles that need a location assignment
const ROLES_NEEDING_LOCATION = ['LOCATION_MANAGER', 'MANAGER', 'COACH', 'STAFF', 'SUPPORT_STAFF']

function getRoleMeta(role: string) {
  return ROLE_OPTIONS.find((r) => r.value === role?.toUpperCase()) || ROLE_OPTIONS[ROLE_OPTIONS.length - 1]
}

function validateWeakPw(value: string, editing: boolean): string | null {
  if (!editing && !value) return 'Password is required'
  if (value && value.length < 8) return 'Password must be at least 8 characters'
  if (value && !/[A-Z]/.test(value)) return 'Password must contain an uppercase letter'
  if (value && !/[a-z]/.test(value)) return 'Password must contain a lowercase letter'
  if (value && !/[0-9]/.test(value)) return 'Password must contain a number'
  return null
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  status: string
  createdAt?: string
}

interface LocationOption {
  id: string
  name: string
}

interface RolePermissions {
  name: string
  description?: string
  permissions: string[]
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const currentUserId = (currentUser as any)?.userId || (currentUser as any)?.id || ''
  const currentUserEmail = (currentUser as any)?.email || ''
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [statusActionId, setStatusActionId] = useState<string | null>(null)
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [rolePermissionsMap, setRolePermissionsMap] = useState<Record<string, RolePermissions>>({})
  const [createdUserInfo, setCreatedUserInfo] = useState<{ email: string; role: string; loginUrl: string; dashboard: string } | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'COACH',
    locationId: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await UserService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })
      setUsers(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, roleFilter, statusFilter])

  // Load locations once for the location dropdown.
  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          const data: any = await apiClient.get('/admin/business-config/locations')
          if (cancelled) return
          const list = data?.locations || data?.data || (Array.isArray(data) ? data : [])
          setLocations(
            list.map((l: any) => ({ id: String(l.id || l._id), name: l.name }))
              .filter((l: any) => l.id && l.name)
          )
        } catch {
          if (!cancelled) setLocations([])
        }
      })()
    return () => { cancelled = true }
  }, [])

  // Load role definitions (system roles + their permissions) once for the
  // "Permissions for this role" preview.
  useEffect(() => {
    let cancelled = false
      ; (async () => {
        try {
          const response = await RoleService.getAll({ page: 1, limit: 100 })
          if (cancelled) return
          const map: Record<string, RolePermissions> = {}
          for (const role of response.data || []) {
            map[role.name] = {
              name: role.name,
              description: role.description,
              permissions: role.permissions || [],
            }
          }
          setRolePermissionsMap(map)
        } catch {
          // non-fatal — drawer just won't show the permission preview
        }
      })()
    return () => { cancelled = true }
  }, [])

  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    const emailErr = validateEmail(formData.email)
    if (emailErr) newErrors.email = emailErr

    const pwErr = validateWeakPw(formData.password, !!editingId)
    if (pwErr) newErrors.password = pwErr

    const firstErr = validateName(formData.firstName, 'First name')
    if (firstErr) newErrors.firstName = firstErr

    const lastErr = validateName(formData.lastName, 'Last name')
    if (lastErr) newErrors.lastName = lastErr

    if (formData.phone) {
      const phoneErr = validatePhone(formData.phone, false)
      if (phoneErr) newErrors.phone = phoneErr
    }

    if (!formData.role) newErrors.role = 'Role is required'

    if (!editingId && ROLES_NEEDING_LOCATION.includes(formData.role) && !formData.locationId) {
      newErrors.locationId = 'Location assignment is required for this role'
    }

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

      if (editingId) {
        // Only include `role` in the update payload when the admin actually
        // changed it. Sending an unchanged role still passes backend hierarchy
        // checks, but omitting it short-circuits the role-change branch in
        // canUpdateUser() and avoids edge-case 403s when the target user has
        // a self-register role (PARENT/STUDENT/USER) that is in the create-
        // hierarchy view but not the assign-hierarchy view.
        const originalUser = users.find((u) => u.id === editingId)
        const originalRole = (originalUser?.role || '').toUpperCase()
        const updateData: Record<string, any> = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }
        if (formData.role && formData.role !== originalRole) {
          updateData.role = formData.role
        }
        await UserService.update(editingId, updateData)
        toast.success('User updated successfully')
      } else {
        const payload: any = { ...formData }
        if (!payload.locationId) delete payload.locationId
        if (!payload.phone) delete payload.phone
        await UserService.create(payload)
        const meta = ROLE_OPTIONS.find((r) => r.value === formData.role)
        if (meta) {
          setCreatedUserInfo({
            email: formData.email,
            role: meta.label,
            loginUrl: meta.loginUrl,
            dashboard: meta.dashboard,
          })
        }
        toast.success('User created successfully')
      }

      setShowForm(false)
      resetForm()
      loadUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (user: User) => {
    // Self-edit through this page is not supported — the backend protects
    // admins from self-demotion (which would surface as a misleading 403),
    // so block it here and steer the admin to Profile settings.
    const isSelf =
      !!currentUserId &&
      (user.id === currentUserId ||
        (!!currentUserEmail && user.email?.toLowerCase() === currentUserEmail.toLowerCase()))
    if (isSelf) {
      toast.error('You cannot edit your own account here. Use Profile settings instead.')
      return
    }
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: (user.role || '').toUpperCase(),
      locationId: '',
    })
    setEditingId(user.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await UserService.delete(id)
      toast.success('User deleted successfully')
      setDeleteConfirm(null)
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(getErrorMessage(error))
    }
  }

  const handleToggleStatus = async (user: User) => {
    const isActive = (user.status || '').toUpperCase() === 'ACTIVE'
    const next = isActive ? 'INACTIVE' : 'ACTIVE'
    try {
      setStatusActionId(user.id)
      await UserService.updateStatus(user.id, next)
      toast.success(`User ${next === 'ACTIVE' ? 'activated' : 'deactivated'}`)
      loadUsers()
    } catch (error) {
      console.error('Error changing status:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setStatusActionId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'COACH',
      locationId: '',
    })
    setErrors({})
    setEditingId(null)
  }

  const selectedRoleMeta = ROLE_OPTIONS.find((r) => r.value === formData.role)
  const selectedRolePermissions = rolePermissionsMap[formData.role]?.permissions || []
  const showLocationField = !editingId && ROLES_NEEDING_LOCATION.includes(formData.role)

  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <UsersIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Users Management</h1>
          </div>
          <p className="text-slate-600">Manage system users, roles, and permissions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex gap-3 items-center flex-wrap"
        >
          <div className="flex-1 min-w-[260px] relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
          </select>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add User
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
              <p className="mt-4 text-slate-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((user) => {
                      const roleMeta = getRoleMeta(user.role)
                      const isActive = (user.status || '').toUpperCase() === 'ACTIVE'
                      const isSelf =
                        !!currentUserId &&
                        (user.id === currentUserId ||
                          (!!currentUserEmail && user.email?.toLowerCase() === currentUserEmail.toLowerCase()))
                      return (
                        <tr key={user.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-sm text-slate-900">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{user.phone || '-'}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleMeta.color}`}>
                              {roleMeta.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${isActive
                                  ? 'bg-green-100 text-green-800'
                                  : (user.status || '').toUpperCase() === 'SUSPENDED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                              {user.status || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(user)}
                                disabled={isSelf}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                                title={isSelf ? 'You cannot edit your own account here. Use Profile settings instead.' : 'Edit'}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user)}
                                disabled={statusActionId === user.id || isSelf}
                                className={`p-2 rounded transition ${isActive
                                    ? 'text-orange-600 hover:bg-orange-50'
                                    : 'text-green-600 hover:bg-green-50'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title={isSelf ? 'You cannot change your own status' : isActive ? 'Deactivate' : 'Activate'}
                              >
                                {statusActionId === user.id ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : isActive ? (
                                  <UserX className="w-4 h-4" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(user.id)}
                                disabled={isSelf}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                                title={isSelf ? 'You cannot delete your own account' : 'Delete'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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
          title={editingId ? 'Edit User' : 'Create New User'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (errors.email) setErrors({ ...errors, email: '' })
                }}
                disabled={!!editingId}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  } disabled:bg-slate-100`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: '' })
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                {!errors.password && (
                  <p className="mt-1 text-xs text-slate-500">
                    Min 8 chars with uppercase, lowercase, and number.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onKeyDown={filterNameInput}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value })
                  if (errors.firstName) setErrors({ ...errors, firstName: '' })
                }}
                placeholder="John"
                maxLength={50}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onKeyDown={filterNameInput}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value })
                  if (errors.lastName) setErrors({ ...errors, lastName: '' })
                }}
                placeholder="Smith"
                maxLength={50}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onKeyDown={filterPhoneInput}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value })
                  if (errors.phone) setErrors({ ...errors, phone: '' })
                }}
                placeholder="+1 555 123 4567"
                maxLength={20}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value, locationId: '' })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(editingId ? ROLE_OPTIONS : CREATABLE_ROLES).map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}

              {/* Role permissions preview — read-only display of what this
                  role grants. Edit the actual list under Roles & Permissions. */}
              {selectedRoleMeta && (
                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold mb-1">
                    <Info className="w-3.5 h-3.5" />
                    Permissions for {selectedRoleMeta.label}
                  </div>
                  {selectedRolePermissions.length === 0 ? (
                    <p className="text-blue-700">
                      No permissions defined yet for this role. Configure them under{' '}
                      <a href="/admin/users/roles" className="underline font-medium">
                        Roles &amp; Permissions
                      </a>.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedRolePermissions.slice(0, 12).map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded bg-white text-blue-800 border border-blue-200">
                          {p}
                        </span>
                      ))}
                      {selectedRolePermissions.length > 12 && (
                        <span className="px-2 py-0.5 text-blue-700">
                          +{selectedRolePermissions.length - 12} more
                        </span>
                      )}
                    </div>
                  )}
                  {!editingId && (
                    <p className="mt-2 text-blue-700">
                      After creation, the user will sign in at{' '}
                      <code className="bg-white px-1 rounded">{selectedRoleMeta.loginUrl}</code>{' '}
                      and land on{' '}
                      <code className="bg-white px-1 rounded">{selectedRoleMeta.dashboard}</code>.
                    </p>
                  )}
                </div>
              )}
            </div>

            {showLocationField && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) => {
                    setFormData({ ...formData, locationId: e.target.value })
                    if (errors.locationId) setErrors({ ...errors, locationId: '' })
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.locationId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                {errors.locationId && <p className="mt-1 text-sm text-red-600">{errors.locationId}</p>}
              </div>
            )}

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
                {submitting ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </SlideInDrawer>

        {createdUserInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-[90%]"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                User created
              </h3>
              <p className="text-slate-700 mb-4">
                <strong>{createdUserInfo.email}</strong> ko successfully{' '}
                <span className="font-medium">{createdUserInfo.role}</span> banaya gaya hai.
              </p>
              <div className="space-y-2 mb-5 text-sm">
                <div className="rounded border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-600">Login URL</p>
                  <code className="text-slate-900 break-all">{createdUserInfo.loginUrl}</code>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-600">Dashboard after login</p>
                  <code className="text-slate-900 break-all">{createdUserInfo.dashboard}</code>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Email verification is auto-skipped for admin-created users — they can log in immediately
                with the password you set.
              </p>
              <button
                onClick={() => setCreatedUserInfo(null)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete User?</h3>
              <p className="text-slate-600 mb-6">This action cannot be undone.</p>
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
