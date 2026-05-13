'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Phone, Shield, Building2, MapPin, Save, X, AlertCircle, Eye, EyeOff, Search, Edit, Trash2, UserX, UserCheck, ChevronDown, Info, Lock, CheckCircle2, XCircle, ToggleLeft, ToggleRight, ShieldAlert, FileText, Briefcase, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api/client'
import { LocationService, BusinessUnitService, RegionService } from '@/services/businessConfigService'
import { toast } from 'sonner'
import Link from 'next/link'
import { PARTNER_TYPE_OPTIONS } from '@/config/partnerTypeConfig'
import { validateName, validateEmail, validatePhone, validatePassword as validatePasswordShared, filterNameInput, filterPhoneInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'

// ---------------------------------------------------------------------------
// RBAC Hierarchy – mirrors backend `rbac.middleware.ts`. Self-register roles
// (PARENT, USER, STUDENT) are intentionally not creatable from the admin UI.
// ---------------------------------------------------------------------------
const ROLE_HIERARCHY: Record<string, string[]> = {
  'ADMIN': ['ADMIN', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'LOCATION_MANAGER', 'MANAGER', 'COACH', 'STAFF', 'SUPPORT_STAFF', 'PARTNER_ADMIN'],
  'REGIONAL_ADMIN': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'COACH', 'STAFF', 'SUPPORT_STAFF'],
  'FRANCHISE_OWNER': ['LOCATION_MANAGER', 'COACH', 'STAFF'],
  'LOCATION_MANAGER': ['COACH', 'STAFF'],
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
  locationName?: string
  organizationName?: string
  createdBy?: string
}

interface Location {
  id: string
  name: string
  regionId?: string
  franchiseId?: string
}

interface Organization {
  id: string
  name: string
}

interface CurrentUser {
  id: string
  firstName: string
  lastName: string
  role: string
  email: string
  locationId?: string
  locationName?: string
  regionId?: string
  franchiseId?: string
  organizationId?: string
}

interface FieldErrors {
  [key: string]: string
}

// ---------------------------------------------------------------------------
// Password requirement helpers
// ---------------------------------------------------------------------------
const PASSWORD_REQUIREMENTS = [
  { label: 'Minimum 8 characters', test: (pw: string) => pw.length >= 8 },
  { label: 'At least one uppercase letter (A-Z)', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'At least one lowercase letter (a-z)', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'At least one number (0-9)', test: (pw: string) => /[0-9]/.test(pw) },
  { label: 'At least one special character (@$!%*?&)', test: (pw: string) => /[@$!%*?&]/.test(pw) },
]

// Roles that require a location assignment
const ROLES_NEEDING_LOCATION = ['COACH', 'LOCATION_MANAGER', 'MANAGER', 'STAFF', 'SUPPORT_STAFF']
// Roles that require a region / organization assignment
const ROLES_NEEDING_ORGANIZATION = ['REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'PARTNER_ADMIN']
// Roles that require a region assignment
const ROLES_NEEDING_REGION = ['REGIONAL_ADMIN']

export default function CreateUserPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [sendEmailVerification, setSendEmailVerification] = useState(true)
  const [gdprConsent, setGdprConsent] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    locationId: '',
    organizationId: '',
    regionId: '',
    partnerType: '',
  })

  // Current user state (from localStorage / auth)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  // Locations, organizations & regions fetched from API
  const [locations, setLocations] = useState<Location[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [locationsLoading, setLocationsLoading] = useState(false)
  const [orgsLoading, setOrgsLoading] = useState(false)
  const [regionsLoading, setRegionsLoading] = useState(false)

  // Users list state
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const ALL_ROLES = [
    { value: 'ADMIN', label: 'Admin', color: 'bg-red-100 text-red-800' },
    { value: 'REGIONAL_ADMIN', label: 'Regional Admin', color: 'bg-purple-100 text-purple-800' },
    { value: 'FRANCHISE_OWNER', label: 'Franchise Owner', color: 'bg-blue-100 text-blue-800' },
    { value: 'LOCATION_MANAGER', label: 'Location Manager', color: 'bg-green-100 text-green-800' },
    { value: 'MANAGER', label: 'Manager', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'COACH', label: 'Coach', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'STAFF', label: 'Staff', color: 'bg-orange-100 text-orange-800' },
    { value: 'SUPPORT_STAFF', label: 'Support Staff', color: 'bg-orange-100 text-orange-800' },
    { value: 'PARTNER_ADMIN', label: 'Partner Admin', color: 'bg-pink-100 text-pink-800' },
    // Read-only entries for the *list* badge — not creatable.
    { value: 'PARENT', label: 'Parent (self-register)', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'STUDENT', label: 'Student (self-register)', color: 'bg-teal-100 text-teal-800' },
    { value: 'USER', label: 'User (self-register)', color: 'bg-gray-100 text-gray-800' },
  ]

  // ---------------------------------------------------------------------------
  // Derive allowed roles for current user based on RBAC hierarchy
  // ---------------------------------------------------------------------------
  const allowedRoleValues = useMemo(() => {
    if (!currentUser) return []
    return ROLE_HIERARCHY[currentUser.role] || []
  }, [currentUser])

  const allowedRoles = useMemo(() => {
    return ALL_ROLES.filter(r => allowedRoleValues.includes(r.value))
  }, [allowedRoleValues])

  const getRoleBadgeColor = (role: string) => {
    const found = ALL_ROLES.find(r => r.value === role)
    return found?.color || 'bg-gray-100 text-gray-800'
  }

  // ---------------------------------------------------------------------------
  // Load current user from localStorage
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('currentUser')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Normalize role — handle legacy SUPER_ADMIN / HQ_ADMIN stored in localStorage
        const rawRole = typeof parsed.role === 'object' ? parsed.role?.name : parsed.role
        const normalizedRole = rawRole?.toUpperCase?.() || ''
        const roleMap: Record<string, string> = {
          'SUPER_ADMIN': 'ADMIN',
          'HQ_ADMIN': 'ADMIN',
        }
        parsed.role = roleMap[normalizedRole] || normalizedRole
        setCurrentUser(parsed)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // If user's role is not in ROLE_HIERARCHY, redirect away
  useEffect(() => {
    if (currentUser && !ROLE_HIERARCHY[currentUser.role]) {
      toast.error('You do not have permission to create users.')
      router.push('/admin/users')
    }
  }, [currentUser, router])

  // Set default role to first allowed role when allowedRoles loads
  useEffect(() => {
    if (allowedRoles.length > 0 && !formData.role) {
      setFormData(prev => ({ ...prev, role: allowedRoles[0].value }))
    }
  }, [allowedRoles, formData.role])

  // ---------------------------------------------------------------------------
  // Fetch locations based on creator's scope
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchLocations = async () => {
      if (!currentUser) return
      setLocationsLoading(true)
      try {
        const params: { page: number; limit: number; businessUnitId?: string } = { page: 1, limit: 200 }

        if (currentUser.role === 'REGIONAL_ADMIN' && currentUser.regionId) {
          // LocationService.getAll accepts businessUnitId/search, not regionId, but
          // the legacy backend ignores unknown filters — pass it through anyway in
          // case it gets wired up later.
          (params as any).regionId = currentUser.regionId
        } else if (currentUser.role === 'REGIONAL_ADMIN' && currentUser.organizationId) {
          params.businessUnitId = currentUser.organizationId
        } else if (currentUser.role === 'FRANCHISE_OWNER') {
          if (currentUser.organizationId) {
            params.businessUnitId = currentUser.organizationId
          }
        }

        const response = await LocationService.getAll(params)
        setLocations((response.data || []) as any)

        // LOCATION_MANAGER: auto-assign their location
        if (currentUser.role === 'LOCATION_MANAGER' && currentUser.locationId) {
          setFormData(prev => ({ ...prev, locationId: currentUser.locationId! }))
        }
      } catch (err) {
        console.error('Failed to load locations for Create User:', err)
        setLocations([])
      } finally {
        setLocationsLoading(false)
      }
    }
    fetchLocations()
  }, [currentUser])

  // Fetch organizations / business-units
  useEffect(() => {
    const fetchOrgs = async () => {
      setOrgsLoading(true)
      try {
        const response = await BusinessUnitService.getAll({ page: 1, limit: 200 })
        setOrganizations((response.data || []) as any)
      } catch (err) {
        console.error('Failed to load business units for Create User:', err)
        setOrganizations([])
      } finally {
        setOrgsLoading(false)
      }
    }
    fetchOrgs()
  }, [])

  // Fetch regions (for REGIONAL_ADMIN assignment)
  useEffect(() => {
    const fetchRegions = async () => {
      setRegionsLoading(true)
      try {
        const response = await RegionService.getAll({ page: 1, limit: 200 })
        setRegions((response.data || []) as any)
      } catch (err) {
        console.error('Failed to load regions for Create User:', err)
        setRegions([])
      } finally {
        setRegionsLoading(false)
      }
    }
    fetchRegions()
  }, [])

  // ---------------------------------------------------------------------------
  // Password validation
  // ---------------------------------------------------------------------------
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain a number'
    if (!/[@$!%*?&]/.test(password)) return 'Password must contain a special character (@$!%*?&)'
    return null
  }

  const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
    if (!password) return { label: '', color: '', width: '0%' }
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[@$!%*?&]/.test(password)) score++

    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' }
    if (score <= 4) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' }
    return { label: 'Strong', color: 'bg-green-500', width: '100%' }
  }

  // ---------------------------------------------------------------------------
  // Load users list
  // ---------------------------------------------------------------------------
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true)
      const params: Record<string, string> = { page: '1', limit: '50' }
      if (roleFilter !== 'all') params.role = roleFilter
      if (statusFilter !== 'all') params.status = statusFilter

      const data = await apiClient.get<any>('/admin/users', { params })
      const usersList = data?.users || data?.data || (Array.isArray(data) ? data : [])
      setUsers(usersList)
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Failed to load users:', error)
      }
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }, [roleFilter, statusFilter])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // ---------------------------------------------------------------------------
  // Form validation
  // ---------------------------------------------------------------------------
  const validateForm = (): boolean => {
    const errors: FieldErrors = {}

    const fnErr = validateName(formData.firstName, 'First name')
    if (fnErr) errors.firstName = fnErr
    const lnErr = validateName(formData.lastName, 'Last name')
    if (lnErr) errors.lastName = lnErr
    const emErr = validateEmail(formData.email)
    if (emErr) errors.email = emErr

    const pwError = validatePasswordShared(formData.password)
    if (pwError) errors.password = pwError

    if (formData.phone) {
      const phErr = validatePhone(formData.phone, false)
      if (phErr) errors.phone = phErr
    }

    if (!formData.role) errors.role = 'Role is required'

    // Location required for certain roles
    if (ROLES_NEEDING_LOCATION.includes(formData.role) && !formData.locationId && currentUser?.role !== 'LOCATION_MANAGER') {
      errors.locationId = 'Location assignment is required for this role'
    }

    // Organization required for certain roles
    if (ROLES_NEEDING_ORGANIZATION.includes(formData.role) && !formData.organizationId) {
      errors.organizationId = 'Organization assignment is required for this role'
    }

    // Region required for REGIONAL_ADMIN
    if (ROLES_NEEDING_REGION.includes(formData.role) && !formData.regionId) {
      errors.regionId = 'Region assignment is required for Regional Admin'
    }

    // Partner type required for PARTNER_ADMIN
    if (formData.role === 'PARTNER_ADMIN' && !formData.partnerType) {
      errors.partnerType = 'Partner type is required for Partner Admin role'
    }

    // GDPR consent
    if (!gdprConsent) {
      errors.gdprConsent = 'Data processing consent is required to create a user'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await apiClient.post('/users', {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
        phone: formData.phone.trim() || undefined,
        locationId: formData.locationId || undefined,
        organizationId: formData.organizationId || undefined,
        regionId: formData.regionId || undefined,
        partnerType: formData.role === 'PARTNER_ADMIN' ? formData.partnerType : undefined,
        sendEmailVerification,
        gdprConsent,
      })

      toast.success('User created successfully!')

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: allowedRoles.length > 0 ? allowedRoles[0].value : '',
        locationId: currentUser?.role === 'LOCATION_MANAGER' ? (currentUser.locationId || '') : '',
        organizationId: '',
        regionId: '',
        partnerType: '',
      })
      setFieldErrors({})
      setGdprConsent(false)
      setSendEmailVerification(true)

      loadUsers()
    } catch (error: any) {
      const responseData = error?.response?.data
      if (responseData?.errors && typeof responseData.errors === 'object') {
        const backendErrors: FieldErrors = {}
        for (const [key, value] of Object.entries(responseData.errors)) {
          backendErrors[key] = Array.isArray(value) ? value[0] : String(value)
        }
        setFieldErrors(backendErrors)
        toast.error('Please fix the validation errors')
      } else if (responseData?.message) {
        toast.error(responseData.message)
      } else if (error?.response?.status === 409) {
        setFieldErrors({ email: 'A user with this email already exists' })
        toast.error('A user with this email already exists')
      } else {
        toast.error('Failed to create user. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // User list actions with RBAC checks
  // ---------------------------------------------------------------------------
  const canManageRole = (targetRole: string): boolean => {
    if (!currentUser) return false
    const allowed = ROLE_HIERARCHY[currentUser.role] || []
    return allowed.includes(targetRole)
  }

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

  const handleStatusChange = async (userId: string, currentStatus: string, userName: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setActionLoading(userId)
    try {
      await apiClient.patch(`/users/${userId}/status`, { status: newStatus })
      toast.success(`User "${userName}" ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`)
      loadUsers()
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update user status'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  // Filter users by search
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      user.email?.toLowerCase().includes(term) ||
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term)
    )
  })

  const passwordStrength = getPasswordStrength(formData.password)

  // Show/hide location dropdown
  const showLocationDropdown = ROLES_NEEDING_LOCATION.includes(formData.role) && currentUser?.role !== 'LOCATION_MANAGER'
  const showLocationAutoAssign = ROLES_NEEDING_LOCATION.includes(formData.role) && currentUser?.role === 'LOCATION_MANAGER'
  const showOrganizationDropdown = ROLES_NEEDING_ORGANIZATION.includes(formData.role)
  const showRegionDropdown = ROLES_NEEDING_REGION.includes(formData.role)
  const showPartnerTypeDropdown = formData.role === 'PARTNER_ADMIN'

  // If user cannot create anyone, show access denied
  if (currentUser && !ROLE_HIERARCHY[currentUser.role]) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">Your role does not have permission to create users.</p>
            <Button id="btn-router-admin-users-create" onClick={() => router.push('/admin/users')}>Back to Users</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
          <p className="text-gray-600 mt-2">Add a new user to the system</p>
        </div>
        <Button id="btn-router-admin-users-create" variant="outline" onClick={() => router.back()}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Security Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg"
      >
        <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <h4 className="font-semibold text-amber-900">Security & Audit Information</h4>
          {currentUser && (
            <p className="text-sm text-amber-800">
              Creating user as: <span className="font-medium">{currentUser.firstName} {currentUser.lastName}</span> ({currentUser.role.replace(/_/g, ' ')})
            </p>
          )}
          <p className="text-sm text-amber-700">This action will be logged in the audit trail.</p>
        </div>
      </motion.div>

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-900">Important Information</h4>
          <p className="text-sm text-blue-700 mt-1">
            Set a password for the new user. They can change it after their first login.
            Password must be at least 8 characters with uppercase, lowercase, number, and special character.
          </p>
        </div>
      </motion.div>

      <form id="form-admin-users-create" onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <CardTitle>Personal Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input id="input-text-admin-users-create"
                  type="text"
                  required
                  value={formData.firstName}
                  onKeyDown={filterNameInput}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value })
                    const err = validateName(e.target.value, 'First name')
                    setFieldErrors(prev => ({ ...prev, firstName: err || '' }))
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${fieldErrors.firstName ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                  placeholder="Enter first name"
                />
                <FormFieldHint hint={FORMAT_HINTS.firstName} error={fieldErrors.firstName} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input id="input-text-admin-users-create"
                  type="text"
                  required
                  value={formData.lastName}
                  onKeyDown={filterNameInput}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value })
                    const err = validateName(e.target.value, 'Last name')
                    setFieldErrors(prev => ({ ...prev, lastName: err || '' }))
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${fieldErrors.lastName ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                  placeholder="Enter last name"
                />
                <FormFieldHint hint={FORMAT_HINTS.lastName} error={fieldErrors.lastName} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input id="input-email-admin-users-create"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    const err = validateEmail(e.target.value)
                    setFieldErrors(prev => ({ ...prev, email: err || '' }))
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${fieldErrors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                  placeholder="user@example.com"
                />
                <FormFieldHint hint={FORMAT_HINTS.email} error={fieldErrors.email} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <input id="input-tel-admin-users-create"
                  type="tel"
                  value={formData.phone}
                  onKeyDown={filterPhoneInput}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value })
                    if (e.target.value) {
                      const err = validatePhone(e.target.value, false)
                      setFieldErrors(prev => ({ ...prev, phone: err || '' }))
                    } else {
                      setFieldErrors(prev => ({ ...prev, phone: '' }))
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${fieldErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                  placeholder="+852 1234 5678"
                />
                <FormFieldHint hint={FORMAT_HINTS.phone} error={fieldErrors.phone} />
              </div>

              {/* Password */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value })
                      const err = validatePasswordShared(e.target.value)
                      setFieldErrors(prev => ({ ...prev, password: err || '' }))
                    }}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none transition-colors ${fieldErrors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                    placeholder="Min 8 chars: uppercase, lowercase, number, special char"
                  />
                  <button id="admin-users-create-btn"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Strength bar */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Strength: {passwordStrength.label}</p>
                  </div>
                )}
                {/* Password requirements checklist */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    {PASSWORD_REQUIREMENTS.map((req, idx) => {
                      const met = req.test(formData.password)
                      return (
                        <div key={idx} className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-red-500'}`}>
                          {met ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {req.label}
                        </div>
                      )
                    })}
                  </div>
                )}
                <FormFieldHint hint={FORMAT_HINTS.password} error={fieldErrors.password} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Permissions – filtered by RBAC hierarchy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <CardTitle>Role & Permissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Role <span className="text-red-500">*</span>
                </label>
                {allowedRoles.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Loading allowed roles...</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allowedRoles.map((role) => (
                      <button id="admin-users-create-btn-2"
                        key={role.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, role: role.value, locationId: '', organizationId: '', regionId: '', partnerType: '' })
                          if (fieldErrors.role) setFieldErrors(prev => ({ ...prev, role: '' }))
                        }}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${formData.role === role.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <Badge className={role.color}>{role.label}</Badge>
                        <p className="text-xs text-gray-600 mt-2">
                          {role.value === 'ADMIN' && 'Full system access'}
                          {role.value === 'REGIONAL_ADMIN' && 'Regional management'}
                          {role.value === 'FRANCHISE_OWNER' && 'Franchise operations'}
                          {role.value === 'LOCATION_MANAGER' && 'Location management'}
                          {role.value === 'COACH' && 'Class instruction'}
                          {role.value === 'SUPPORT_STAFF' && 'Customer support'}
                          {role.value === 'PARTNER_ADMIN' && 'Partner portal'}
                          {role.value === 'PARENT' && 'Parent dashboard'}
                          {role.value === 'USER' && 'Student access'}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {fieldErrors.role && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.role}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment – Location / Organization */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-600" />
              <CardTitle>Assignment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assign to Location */}
              {showLocationDropdown && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Assign to Location <span className="text-red-500">*</span>
                  </label>
                  <select id="select-admin-users-create-11"
                    value={formData.locationId}
                    onChange={(e) => {
                      setFormData({ ...formData, locationId: e.target.value })
                      if (fieldErrors.locationId) setFieldErrors(prev => ({ ...prev, locationId: '' }))
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${fieldErrors.locationId ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                  >
                    <option value="">Select Location</option>
                    {locationsLoading ? (
                      <option disabled>Loading locations...</option>
                    ) : (
                      locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))
                    )}
                  </select>
                  {fieldErrors.locationId && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.locationId}
                    </p>
                  )}
                </div>
              )}

              {/* Location auto-assigned for LOCATION_MANAGER creator */}
              {showLocationAutoAssign && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location (Auto-assigned)
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {currentUser?.locationName || currentUser?.locationId || 'Your location'}
                  </div>
                  <p className="text-xs text-gray-500">Users you create are automatically assigned to your location.</p>
                </div>
              )}

              {/* Assign to Organization */}
              {showOrganizationDropdown && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Assign to Organization <span className="text-red-500">*</span>
                  </label>
                  <select id="select-admin-users-create-12"
                    value={formData.organizationId}
                    onChange={(e) => {
                      setFormData({ ...formData, organizationId: e.target.value })
                      if (fieldErrors.organizationId) setFieldErrors(prev => ({ ...prev, organizationId: '' }))
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${fieldErrors.organizationId ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                  >
                    <option value="">Select Organization</option>
                    {orgsLoading ? (
                      <option disabled>Loading organizations...</option>
                    ) : (
                      organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))
                    )}
                  </select>
                  {fieldErrors.organizationId && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.organizationId}
                    </p>
                  )}
                </div>
              )}

              {/* Region Assignment - shown for REGIONAL_ADMIN */}
              {showRegionDropdown && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Assign to Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.regionId}
                    onChange={(e) => {
                      setFormData({ ...formData, regionId: e.target.value })
                      if (fieldErrors.regionId) setFieldErrors(prev => ({ ...prev, regionId: '' }))
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${fieldErrors.regionId ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                  >
                    <option value="">Select Region</option>
                    {regionsLoading ? (
                      <option disabled>Loading regions...</option>
                    ) : (
                      regions.map((region: any) => (
                        <option key={region.id || region._id} value={region.id || region._id}>{region.name}</option>
                      ))
                    )}
                  </select>
                  {fieldErrors.regionId && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.regionId}
                    </p>
                  )}
                </div>
              )}

              {/* Partner Type Selection - shown for PARTNER_ADMIN */}
              {showPartnerTypeDropdown && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Partner Type <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select the type of partner organization. This determines the dashboard terminology and experience.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PARTNER_TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, partnerType: option.value })
                          if (fieldErrors.partnerType) setFieldErrors(prev => ({ ...prev, partnerType: '' }))
                        }}
                        className={`p-3 border-2 rounded-lg text-left transition-all ${formData.partnerType === option.value
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                      </button>
                    ))}
                  </div>
                  {fieldErrors.partnerType && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {fieldErrors.partnerType}
                    </p>
                  )}
                </div>
              )}

              {/* Fallback when no assignment fields are visible */}
              {!showLocationDropdown && !showLocationAutoAssign && !showOrganizationDropdown && !showRegionDropdown && !showPartnerTypeDropdown && (
                <div className="md:col-span-2 text-sm text-gray-500 italic">
                  No location or organization assignment is required for the selected role.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Verification Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <CardTitle>Email Verification</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Send Email Verification</p>
                  <p className="text-xs text-gray-500 mt-0.5">Require user to verify their email before logging in</p>
                </div>
                <button id="admin-users-create-btn-3"
                  type="button"
                  onClick={() => setSendEmailVerification(!sendEmailVerification)}
                  className="flex items-center"
                >
                  {sendEmailVerification ? (
                    <ToggleRight className="w-10 h-10 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-400" />
                  )}
                </button>
              </div>
              {sendEmailVerification ? (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    User will receive a verification email and must verify before logging in.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    User will be able to login without email verification. This is an admin override.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* GDPR Consent */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <CardTitle>Data Processing Consent</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="gdprConsent"
                  checked={gdprConsent}
                  onChange={(e) => {
                    setGdprConsent(e.target.checked)
                    if (fieldErrors.gdprConsent) setFieldErrors(prev => ({ ...prev, gdprConsent: '' }))
                  }}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="gdprConsent" className="text-sm text-gray-700">
                  User has provided consent for data processing <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  By checking this box, you confirm that the user has been informed about and consented to the processing
                  of their personal data in accordance with applicable data protection regulations (GDPR / PDPO).
                  This includes data storage, processing for service delivery, and communication purposes.
                </p>
              </div>
              {fieldErrors.gdprConsent && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.gdprConsent}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button id="admin-users-create-btn-cancel"
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button id="admin-users-create-btn-4"
            type="submit"
            disabled={isSubmitting}
            className="min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create User
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Users List Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <CardTitle>Existing Users</CardTitle>
            </div>
            <Link id="admin-users"
              href="/admin/users"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              View All Users
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="input-text-admin-users-create"
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <select id="select-admin-users-create-13"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {ALL_ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <select id="select-admin-users-create-14"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* Users Table */}
          {usersLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 mt-2 text-sm">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              No users found{searchTerm && ` matching "${searchTerm}"`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location / Org</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          user.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {user.locationName || user.organizationName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                          {user.createdBy && (
                            <div className="text-xs text-gray-400">by {user.createdBy}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canManageRole(user.role) && (
                            <Link id="admin-users-create-nav-edit"
                              href={`/admin/users/${user.id}`}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}
                          {canManageRole(user.role) && (
                            <button id="btn-admin-users-create-3"
                              onClick={() => handleStatusChange(user.id, user.status, `${user.firstName} ${user.lastName}`)}
                              disabled={actionLoading === user.id}
                              className={`p-1.5 rounded transition ${user.status === 'ACTIVE'
                                ? 'text-orange-600 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
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
                          )}
                          {canManageRole(user.role) && (
                            <button id="btn-admin-users-create-4"
                              onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                              disabled={actionLoading === user.id}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {!canManageRole(user.role) && (
                            <span className="text-xs text-gray-400 italic px-2">No access</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
