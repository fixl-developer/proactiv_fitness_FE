'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { StaffService } from '@/services/operationsService'
import { BusinessUnitService, LocationService } from '@/services/businessConfigService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
  validateName,
  validateEmail,
  validatePhone10,
  filterNameInput,
  filterPhoneInput,
  todayISODate,
  validateAlphaText,
} from '@/utils/validation'

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  locationId?: string
  status: 'active' | 'inactive'
  hireDate?: string
  certifications?: string[]
  createdAt?: string
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Coach',
    businessUnitId: '',
    locationId: '',
    status: 'active' as 'active' | 'inactive',
    hireDate: '',
    certifications: [] as string[],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newCertification, setNewCertification] = useState('')
  const [certError, setCertError] = useState('')
  const [businessUnits, setBusinessUnits] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])

  // Role options — match backend staffType enum
  const roles = ['Coach', 'Trainer', 'Manager', 'Admin', 'Instructor', 'Assistant']

  // Load business units + locations once for dropdowns
  useEffect(() => {
    ;(async () => {
      try {
        const [buRes, locRes] = await Promise.all([
          BusinessUnitService.getAll({ limit: 100 }),
          LocationService.getAll({ limit: 100 }),
        ])
        setBusinessUnits(buRes?.data || [])
        setLocations(locRes?.data || [])
      } catch (error) {
        console.error('Failed to load business units/locations:', error)
      }
    })()
  }, [])

  // Load staff
  const loadStaff = async () => {
    try {
      setLoading(true)
      const response = await StaffService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      })
      const payload = response?.data ?? response
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : []
      const pagination = payload?.pagination ?? response?.pagination
      setStaff(list)
      setTotalPages(pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading staff:', error)
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [currentPage, searchTerm])

  // Validate form
  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    const firstErr = validateName(formData.firstName, 'First name')
    if (firstErr) newErrors.firstName = firstErr

    const lastErr = validateName(formData.lastName, 'Last name')
    if (lastErr) newErrors.lastName = lastErr

    const emailErr = validateEmail(formData.email)
    if (emailErr) newErrors.email = emailErr

    const phoneErr = validatePhone10(formData.phone, true, 'Phone number')
    if (phoneErr) newErrors.phone = phoneErr

    if (!formData.role) newErrors.role = 'Role is required'
    if (!formData.businessUnitId) newErrors.businessUnitId = 'Business unit is required'
    if (!formData.locationId) newErrors.locationId = 'Location is required'

    // Hire date is required by the backend (Staff.hireDate is a required field).
    // Hire date represents when the staff member was hired — it CAN be in the past
    // (the common case) but MUST NOT be in the future. Validate as a real date
    // that is on or before today.
    if (!formData.hireDate) {
      newErrors.hireDate = 'Hire date is required'
    } else {
      const picked = new Date(formData.hireDate)
      if (isNaN(picked.getTime())) {
        newErrors.hireDate = 'Please enter a valid hire date'
      } else {
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (picked > today) {
          newErrors.hireDate = 'Hire date cannot be in the future'
        }
      }
    }

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
        await StaffService.update(editingId, formData)
        toast.success('Staff member updated successfully')
      } else {
        await StaffService.create(formData)
        toast.success('Staff member created successfully')
      }

      setShowForm(false)
      resetForm()
      loadStaff()
    } catch (error: any) {
      console.error('Error saving staff member:', error)
      // Surface backend validation messages (400/422) clearly so the admin knows
      // *which* field the server rejected instead of a vague "request failed".
      const status = error?.response?.status || error?.status
      const backendMsg = error?.response?.data?.message || error?.data?.message
      if ((status === 400 || status === 422) && backendMsg) {
        toast.error(`Cannot save staff: ${backendMsg}`)
      } else {
        toast.error(getErrorMessage(error))
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (member: StaffMember) => {
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      businessUnitId: (member as any).businessUnitId || '',
      locationId: member.locationId || '',
      status: member.status,
      hireDate: member.hireDate || '',
      certifications: member.certifications || [],
    })
    setEditingId(member.id)
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await StaffService.delete(id)
      toast.success('Staff member deleted successfully')
      setDeleteConfirm(null)
      loadStaff()
    } catch (error) {
      console.error('Error deleting staff member:', error)
      toast.error(getErrorMessage(error))
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'Coach',
      businessUnitId: '',
      locationId: '',
      status: 'active',
      hireDate: '',
      certifications: [],
    })
    setErrors({})
    setEditingId(null)
    setNewCertification('')
    setCertError('')
  }

  // Handle close drawer
  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  // Add certification — validate the entered text first to block junk like "@@" or "123"
  const addCertification = () => {
    const value = newCertification.trim()
    if (!value) {
      setCertError('Enter a certification name')
      return
    }
    const err = validateAlphaText(value, 'Certification', 100)
    if (err) {
      setCertError(err)
      return
    }
    if (formData.certifications.includes(value)) {
      setCertError('Certification already added')
      return
    }
    setFormData({
      ...formData,
      certifications: [...formData.certifications, value],
    })
    setNewCertification('')
    setCertError('')
  }

  // Remove certification
  const removeCertification = (cert: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c !== cert),
    })
  }

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      Coach: 'bg-blue-100 text-blue-800',
      Trainer: 'bg-purple-100 text-purple-800',
      Manager: 'bg-orange-100 text-orange-800',
      Admin: 'bg-red-100 text-red-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
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
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Staff Management</h1>
          </div>
          <p className="text-slate-600">Manage staff members, roles, and certifications</p>
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
              placeholder="Search staff..."
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
            Add Staff
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
              <p className="mt-4 text-slate-600">Loading staff...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No staff members found</p>
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
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Certifications</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {staff.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {member.firstName} {member.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{member.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{member.phone || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${member.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {member.certifications && member.certifications.length > 0
                            ? member.certifications.join(', ')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(member)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(member.id)}
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
          title={editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name */}
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
                placeholder="e.g., John"
                maxLength={50}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              {!errors.firstName && <p className="mt-1 text-xs text-slate-500">Letters, spaces, hyphens and apostrophes only</p>}
            </div>

            {/* Last Name */}
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
                placeholder="e.g., Doe"
                maxLength={50}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              {!errors.lastName && <p className="mt-1 text-xs text-slate-500">Letters, spaces, hyphens and apostrophes only</p>}
            </div>

            {/* Email */}
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
                placeholder="e.g., john.doe@example.com"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onKeyDown={filterPhoneInput}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value })
                  if (errors.phone) setErrors({ ...errors, phone: '' })
                }}
                placeholder="e.g., 9876543210 or +919876543210"
                maxLength={15}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              {!errors.phone && <p className="mt-1 text-xs text-slate-500">10-digit phone number, optional country code (e.g., +91)</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value })
                  if (errors.role) setErrors({ ...errors, role: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.role ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            {/* Business Unit */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Business Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.businessUnitId}
                onChange={(e) => {
                  setFormData({ ...formData, businessUnitId: e.target.value })
                  if (errors.businessUnitId) setErrors({ ...errors, businessUnitId: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.businessUnitId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
              >
                <option value="">Select Business Unit</option>
                {businessUnits.map((bu) => (
                  <option key={bu.id || bu._id} value={bu.id || bu._id}>
                    {bu.name} {bu.code ? `(${bu.code})` : ''}
                  </option>
                ))}
              </select>
              {errors.businessUnitId && <p className="mt-1 text-sm text-red-600">{errors.businessUnitId}</p>}
            </div>

            {/* Location */}
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.locationId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.id || loc._id} value={loc.id || loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              {errors.locationId && <p className="mt-1 text-sm text-red-600">{errors.locationId}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Hire Date */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Hire Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.hireDate}
                max={todayISODate()}
                onChange={(e) => {
                  const v = e.target.value
                  setFormData({ ...formData, hireDate: v })
                  // Inline check: must be a valid date and not in the future
                  let err = ''
                  if (v) {
                    const picked = new Date(v)
                    if (isNaN(picked.getTime())) {
                      err = 'Please enter a valid hire date'
                    } else {
                      const today = new Date()
                      today.setHours(23, 59, 59, 999)
                      if (picked > today) err = 'Hire date cannot be in the future'
                    }
                  }
                  setErrors({ ...errors, hireDate: err })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.hireDate ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.hireDate && <p className="mt-1 text-sm text-red-600">{errors.hireDate}</p>}
              {!errors.hireDate && <p className="mt-1 text-xs text-slate-500">Today or a past date (when the staff member was hired)</p>}
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Certifications</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCertification}
                  maxLength={100}
                  onChange={(e) => {
                    setNewCertification(e.target.value)
                    if (certError) setCertError('')
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCertification()
                    }
                  }}
                  placeholder="e.g., First Aid Certified"
                  className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${certError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                >
                  Add
                </button>
              </div>
              {certError && <p className="mb-2 text-sm text-red-600">{certError}</p>}
              {!certError && <p className="mb-2 text-xs text-slate-500">Letters only (no digits or symbols)</p>}
              {formData.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCertification(cert)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                {submitting ? 'Saving...' : editingId ? 'Update Staff' : 'Create Staff'}
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
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Staff Member?</h3>
              <p className="text-slate-600 mb-6">
                This action cannot be undone. The staff member will be permanently removed.
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
      </div>
    </div>
  )
}
