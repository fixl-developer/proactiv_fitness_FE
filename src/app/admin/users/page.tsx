'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, UserPlus, Edit, Trash2, Download, Mail, UserX, UserCheck, RefreshCw, X, Save, AlertCircle, Building2, MapPin, Users, Shield } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// RBAC Hierarchy – mirrors the create page
// ---------------------------------------------------------------------------
const ROLE_HIERARCHY: Record<string, string[]> = {
  'ADMIN': ['ADMIN', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'LOCATION_MANAGER', 'COACH', 'PARTNER_ADMIN', 'SUPPORT_STAFF'],
  'REGIONAL_ADMIN': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'COACH', 'SUPPORT_STAFF'],
  'FRANCHISE_OWNER': ['LOCATION_MANAGER', 'COACH'],
  'LOCATION_MANAGER': ['COACH'],
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  phone?: string
  createdAt: string
  lastLogin?: string
  locationName?: string
  organizationName?: string
  createdBy?: string
}

interface CurrentUser {
  id: string
  firstName: string
  lastName: string
  role: string
  email: string
}

interface EditingUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  phone: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const limit = 20

  const roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'REGIONAL_ADMIN', label: 'Regional Admin' },
    { value: 'FRANCHISE_OWNER', label: 'Franchise Owner' },
    { value: 'LOCATION_MANAGER', label: 'Location Manager' },
    { value: 'COACH', label: 'Coach' },
    { value: 'SUPPORT_STAFF', label: 'Support Staff' },
    { value: 'PARTNER_ADMIN', label: 'Partner Admin' },
    { value: 'PARENT', label: 'Parent' },
    { value: 'USER', label: 'User' },
  ]

  // ---------------------------------------------------------------------------
  // Load current user from localStorage
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('currentUser')
      if (stored) {
        const parsed = JSON.parse(stored)
        const rawRole = typeof parsed.role === 'object' ? parsed.role?.name : parsed.role
        const normalizedRole = rawRole?.toUpperCase?.() || ''
        const roleMap: Record<string, string> = { 'SUPER_ADMIN': 'ADMIN', 'HQ_ADMIN': 'ADMIN' }
        parsed.role = roleMap[normalizedRole] || normalizedRole
        setCurrentUser(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  // Allowed roles the current user can manage
  const allowedRoles = useMemo(() => {
    if (!currentUser) return [] as string[]
    return ROLE_HIERARCHY[currentUser.role] || []
  }, [currentUser])

  const canManageRole = (targetRole: string): boolean => {
    return allowedRoles.includes(targetRole)
  }

  // Roles the current user can assign when editing
  const editableRoleOptions = useMemo(() => {
    return roles.filter(r => allowedRoles.includes(r.value))
  }, [allowedRoles])

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number> = { page, limit }
      if (roleFilter !== 'all') params.role = roleFilter
      if (statusFilter !== 'all') params.status = statusFilter
      if (searchTerm) params.search = searchTerm

      const data = await apiClient.get<any>('/users', { params })

      const usersList = data?.users || data?.data || (Array.isArray(data) ? data : [])
      const totalCount = data?.total ?? data?.meta?.total ?? usersList.length
      const pages = data?.totalPages ?? data?.meta?.totalPages ?? Math.ceil(totalCount / limit)

      setUsers(usersList)
      setTotal(totalCount)
      setTotalPages(pages)
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Failed to load users:', error)
        toast.error('Failed to load users')
      }
      setUsers([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter, statusFilter, searchTerm])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) return

    setActionLoading(userId)
    try {
      await apiClient.delete(`/users/${userId}`)
      toast.success(`User "${userName}" deleted successfully`)
      loadUsers()
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete user'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusToggle = async (userId: string, currentStatus: string, userName: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setActionLoading(userId)
    try {
      await apiClient.patch(`/users/${userId}/status`, { status: newStatus })
      toast.success(`User "${userName}" ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`)
      loadUsers()
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update user status'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  const startEdit = (user: User) => {
    setEditingUser({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
    })
    setEditErrors({})
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setEditErrors({})
  }

  const handleEditSave = async () => {
    if (!editingUser) return

    const errors: Record<string, string> = {}
    if (!editingUser.firstName.trim()) errors.firstName = 'Required'
    if (!editingUser.lastName.trim()) errors.lastName = 'Required'
    if (!editingUser.email.trim()) errors.email = 'Required'

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setEditLoading(true)
    try {
      await apiClient.put(`/users/${editingUser.id}`, {
        firstName: editingUser.firstName.trim(),
        lastName: editingUser.lastName.trim(),
        email: editingUser.email.trim(),
        role: editingUser.role,
        phone: editingUser.phone.trim() || undefined,
      })
      toast.success('User updated successfully')
      setEditingUser(null)
      loadUsers()
    } catch (error: any) {
      const responseData = error?.response?.data
      if (responseData?.errors) {
        const backendErrors: Record<string, string> = {}
        for (const [key, value] of Object.entries(responseData.errors)) {
          backendErrors[key] = Array.isArray(value) ? value[0] : String(value)
        }
        setEditErrors(backendErrors)
      } else {
        toast.error(responseData?.message || 'Failed to update user')
      }
    } finally {
      setEditLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const data = await apiClient.get<any>('/users', {
        params: { page: 1, limit: 10000 },
      })
      const allUsers: User[] = data?.users || data?.data || (Array.isArray(data) ? data : [])

      const headers = ['First Name', 'Last Name', 'Email', 'Role', 'Status', 'Location', 'Organization', 'Created By', 'Created']
      const rows = allUsers.map(u => [
        u.firstName,
        u.lastName,
        u.email,
        u.role,
        u.status,
        u.locationName || '',
        u.organizationName || '',
        u.createdBy || '',
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
      ])

      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Users exported successfully')
    } catch (error) {
      toast.error('Failed to export users')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-red-100 text-red-800',
      'REGIONAL_ADMIN': 'bg-purple-100 text-purple-800',
      'FRANCHISE_OWNER': 'bg-blue-100 text-blue-800',
      'LOCATION_MANAGER': 'bg-green-100 text-green-800',
      'COACH': 'bg-yellow-100 text-yellow-800',
      'SUPPORT_STAFF': 'bg-orange-100 text-orange-800',
      'PARTNER_ADMIN': 'bg-pink-100 text-pink-800',
      'PARENT': 'bg-indigo-100 text-indigo-800',
      'USER': 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  // Stats from current page data
  const activeCount = users.filter(u => u.status === 'ACTIVE').length
  const inactiveCount = users.filter(u => u.status === 'INACTIVE' || u.status === 'SUSPENDED').length
  const adminCount = users.filter(u => u.role === 'ADMIN').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all users and their roles
            {currentUser && (
              <span className="ml-2 text-xs text-gray-400">
                (Logged in as {currentUser.firstName} {currentUser.lastName} &mdash; {currentUser.role.replace(/_/g, ' ')})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button id="btn-admin-users-1"
            onClick={() => loadUsers()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button id="btn-admin-users-2"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          {currentUser && ROLE_HIERARCHY[currentUser.role] && (
            <Link id="admin-users-create"
              href="/admin/users/create"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              Create User
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Users', value: total, icon: Users, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
          { title: 'Active (this page)', value: activeCount, icon: UserCheck, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
          { title: 'Inactive (this page)', value: inactiveCount, icon: UserX, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
          { title: 'Admins (this page)', value: adminCount, icon: Shield, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
        ].map((stat, idx) => (
          <div key={idx} className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 font-medium mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input id="input-text-admin-users-search"
              type="text"
              placeholder="Search users by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button id="btn-admin-users-3"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
              showFilters ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(roleFilter !== 'all' || statusFilter !== 'all') && (
              <span className="ml-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {(roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select id="select-admin-users-21"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {roles.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select id="select-admin-users-22"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            {(roleFilter !== 'all' || statusFilter !== 'all') && (
              <div className="md:col-span-2">
                <button id="btn-admin-users-4"
                  onClick={() => { setRoleFilter('all'); setStatusFilter('all'); setPage(1) }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button id="btn-admin-users-5" onClick={cancelEdit} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input id="input-text-admin-users"
                    type="text"
                    value={editingUser.firstName}
                    onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      editErrors.firstName ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {editErrors.firstName && <p className="text-xs text-red-600 mt-1">{editErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input id="input-text-admin-users"
                    type="text"
                    value={editingUser.lastName}
                    onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      editErrors.lastName ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {editErrors.lastName && <p className="text-xs text-red-600 mt-1">{editErrors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input id="input-email-admin-users"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    editErrors.email ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {editErrors.email && <p className="text-xs text-red-600 mt-1">{editErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input id="input-tel-admin-users"
                  type="tel"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select id="select-admin-users-23"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {/* Show allowed roles plus the current role (so it's always visible even if not manageable) */}
                  {editableRoleOptions.length > 0 ? (
                    editableRoleOptions.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))
                  ) : (
                    roles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button id="btn-admin-users-6"
                onClick={cancelEdit}
                disabled={editLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm"
              >
                Cancel
              </button>
              <button id="btn-admin-users-7"
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50"
              >
                {editLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading users...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location / Org
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          user.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          {user.locationName && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {user.locationName}
                            </span>
                          )}
                          {user.organizationName && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              {user.organizationName}
                            </span>
                          )}
                          {!user.locationName && !user.organizationName && '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdBy || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          {canManageRole(user.role) ? (
                            <>
                              <button id="btn-admin-users-8"
                                onClick={() => startEdit(user)}
                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button id="btn-admin-users-9"
                                onClick={() => handleStatusToggle(user.id, user.status, `${user.firstName} ${user.lastName}`)}
                                disabled={actionLoading === user.id}
                                className={`p-2 rounded transition ${
                                  user.status === 'ACTIVE'
                                    ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
                                    : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                                }`}
                                title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              >
                                {actionLoading === user.id ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : user.status === 'ACTIVE' ? (
                                  <UserX className="w-4 h-4" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                              </button>
                              <button id="btn-admin-users-10"
                                onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                                disabled={actionLoading === user.id}
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic px-2">No access</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found matching your criteria</p>
                {(roleFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
                  <button id="btn-admin-users-11"
                    onClick={() => {
                      setRoleFilter('all')
                      setStatusFilter('all')
                      setSearchInput('')
                      setSearchTerm('')
                      setPage(1)
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{Math.min((page - 1) * limit + 1, total)}</span> to{' '}
                <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-medium">{total}</span> users
              </div>
              <div className="flex items-center gap-2">
                <button id="btn-admin-users-12"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                >
                  First
                </button>
                <button id="btn-admin-users-13"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button id="btn-admin-users-14"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
                <button id="btn-admin-users-15"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
