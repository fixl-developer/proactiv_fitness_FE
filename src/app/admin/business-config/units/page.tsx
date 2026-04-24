'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Building2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { BusinessUnitService, CountryService } from '@/services/businessConfigService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface BusinessUnit {
  id: string
  name: string
  code: string
  type: string
  countryId: string
  managerId?: string
  isActive: boolean
  createdAt?: string
}

interface Country {
  id: string
  name: string
  code: string
}

// Valid business unit name: letters, digits, spaces, and &.'- (covers real-world
// names like "5th Ave Gym", "St. Mary's Academy", "Proactiv - HQ").
const NAME_ALLOWED_RE = /^[A-Za-z0-9\s&'.\-]+$/
const NAME_ALLOWED_KEY_RE = /^[A-Za-z0-9\s&'.\-]$/
const CODE_ALLOWED_KEY_RE = /^[A-Za-z0-9]$/
const MANAGER_ID_ALLOWED_KEY_RE = /^[A-Za-z0-9]$/
const OBJECT_ID_RE = /^[a-f0-9]{24}$/i

export default function BusinessUnitsPage() {
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
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
    code: '',
    type: 'GYM',
    countryId: '',
    managerId: '',
    isActive: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Business unit types — must match backend enum BusinessUnitType
  const unitTypes = [
    { value: 'GYM', label: 'Gym' },
    { value: 'SCHOOL', label: 'School' },
    { value: 'CAMP', label: 'Camp' },
    { value: 'EVENT', label: 'Event' },
    { value: 'PARTY', label: 'Party' },
    { value: 'ELITE_ACADEMY', label: 'Elite Academy' },
  ]

  // Load business units
  const loadUnits = async () => {
    try {
      setLoading(true)
      const response = await BusinessUnitService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      })
      setUnits(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading business units:', error)
      toast.error('Failed to load business units')
    } finally {
      setLoading(false)
    }
  }

  // Load countries for dropdown (backend-only — source of truth is Countries & Regions page)
  const loadCountries = async () => {
    try {
      setCountriesLoading(true)
      const response = await CountryService.getAll({ limit: 500 })
      setCountries((response.data as Country[]) || [])
    } catch (error) {
      console.error('Error loading countries:', error)
    } finally {
      setCountriesLoading(false)
    }
  }

  useEffect(() => {
    loadUnits()
  }, [currentPage, searchTerm])

  useEffect(() => {
    loadCountries()
  }, [])

  // ── Field validators ─────────────────────────────────────────
  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    // Name
    const name = formData.name.trim()
    if (!name) newErrors.name = 'Business unit name is required'
    else if (name.length < 2) newErrors.name = 'Name must be at least 2 characters'
    else if (name.length > 80) newErrors.name = 'Name must be at most 80 characters'
    else if (!NAME_ALLOWED_RE.test(name)) newErrors.name = "Name can only contain letters, numbers, spaces, and & . ' -"

    // Code
    const code = formData.code.trim()
    if (!code) newErrors.code = 'Business unit code is required'
    else if (!/^[A-Z0-9]{2,10}$/.test(code)) newErrors.code = 'Code must be 2-10 uppercase letters/numbers'

    // Type
    if (!formData.type) newErrors.type = 'Business unit type is required'
    else if (!unitTypes.some((t) => t.value === formData.type)) newErrors.type = 'Invalid business unit type'

    // Country — must match an existing backend-added country
    if (!formData.countryId) newErrors.countryId = 'Country is required'
    else if (!countries.some((c) => c.id === formData.countryId)) newErrors.countryId = 'Please pick a valid country'

    // Manager ID — optional, but if provided must be a Mongo ObjectId
    const managerId = formData.managerId.trim()
    if (managerId && !OBJECT_ID_RE.test(managerId)) {
      newErrors.managerId = 'Manager ID must be a 24-character hex ID (or leave empty)'
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

      // Backend BusinessUnit schema: name, code, type, countryId, regionId (opt),
      // description, isActive, settings. managerId is UI-only — backend ignores it.
      const payload: any = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        countryId: formData.countryId,
        isActive: formData.isActive,
      }

      if (editingId) {
        await BusinessUnitService.update(editingId, payload)
        toast.success('Business unit updated successfully')
      } else {
        await BusinessUnitService.create(payload)
        toast.success('Business unit created successfully')
      }

      setShowForm(false)
      resetForm()
      loadUnits()
    } catch (error) {
      console.error('Error saving business unit:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (unit: BusinessUnit) => {
    setFormData({
      name: unit.name,
      code: unit.code,
      type: unit.type,
      countryId: unit.countryId,
      managerId: unit.managerId || '',
      isActive: unit.isActive,
    })
    setEditingId(unit.id)
    setErrors({})
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await BusinessUnitService.delete(id)
      toast.success('Business unit deleted successfully')
      setDeleteConfirm(null)
      loadUnits()
    } catch (error) {
      console.error('Error deleting business unit:', error)
      toast.error(getErrorMessage(error))
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'GYM',
      countryId: '',
      managerId: '',
      isActive: true,
    })
    setErrors({})
    setEditingId(null)
  }

  // Handle close drawer
  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  // Open form — block if no countries have been added yet.
  const handleOpenAddForm = () => {
    if (countries.length === 0 && !countriesLoading) {
      toast.error('No countries added yet. Please add a country in Countries & Regions first.')
      return
    }
    resetForm()
    setShowForm(true)
  }

  // Get country name by ID (for table display)
  const getCountryName = (countryId: string) => {
    const country = countries.find((c) => c.id === countryId)
    return country?.name || countryId
  }

  const noCountriesYet = !countriesLoading && countries.length === 0

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
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Business Units</h1>
          </div>
          <p className="text-slate-600">Manage franchises, corporate offices, and regional units</p>
        </motion.div>

        {/* No countries banner */}
        {noCountriesYet && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 border border-amber-300 bg-amber-50 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">No countries added yet</p>
              <p className="text-sm text-amber-800 mt-1">
                Business units need a parent country. Add at least one country first, then come back here.
              </p>
              <Link
                href="/admin/business-config/regions"
                className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-900 underline hover:text-amber-700"
              >
                Go to Countries &amp; Regions
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}

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
              placeholder="Search business units..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleOpenAddForm}
            disabled={noCountriesYet}
            title={noCountriesYet ? 'Add a country first in Countries & Regions' : undefined}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Add Business Unit
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
              <p className="mt-4 text-slate-600">Loading business units...</p>
            </div>
          ) : units.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No business units found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Code</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Country</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{unit.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {unit.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                            {unit.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{getCountryName(unit.countryId)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${unit.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {unit.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(unit)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(unit.id)}
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
          title={editingId ? 'Edit Business Unit' : 'Add New Business Unit'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Business Unit Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                maxLength={80}
                onKeyDown={(e) => {
                  if (e.key.length === 1 && !NAME_ALLOWED_KEY_RE.test(e.key)) e.preventDefault()
                }}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: '' })
                }}
                placeholder="e.g., Dubai Franchise"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              {!errors.name && <p className="mt-1 text-xs text-slate-500">2-80 characters. Letters, numbers, spaces and & . ' -</p>}
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Business Unit Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                maxLength={10}
                onKeyDown={(e) => {
                  if (e.key.length === 1 && !CODE_ALLOWED_KEY_RE.test(e.key)) e.preventDefault()
                }}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
                  setFormData({ ...formData, code: cleaned })
                  if (errors.code) setErrors({ ...errors, code: '' })
                }}
                placeholder="e.g., DXB01"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.code ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
              {!errors.code && <p className="mt-1 text-xs text-slate-500">2-10 uppercase letters/numbers (e.g., DXB01, HQ001)</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  setFormData({ ...formData, type: e.target.value })
                  if (errors.type) setErrors({ ...errors, type: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              >
                {unitTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.countryId}
                onChange={(e) => {
                  setFormData({ ...formData, countryId: e.target.value })
                  if (errors.countryId) setErrors({ ...errors, countryId: '' })
                }}
                disabled={countries.length === 0}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed ${errors.countryId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              >
                <option value="">
                  {countriesLoading
                    ? 'Loading countries...'
                    : countries.length === 0
                      ? 'No countries added yet'
                      : 'Select Country'}
                </option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
              {errors.countryId && <p className="mt-1 text-sm text-red-600">{errors.countryId}</p>}
              {!errors.countryId && countries.length === 0 && !countriesLoading && (
                <p className="mt-1 text-xs text-amber-700">
                  Add a country first in{' '}
                  <Link href="/admin/business-config/regions" className="underline font-medium">
                    Countries &amp; Regions
                  </Link>
                  .
                </p>
              )}
              {!errors.countryId && countries.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Only countries added in Countries &amp; Regions are shown here.
                </p>
              )}
            </div>

            {/* Manager ID (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Manager ID (Optional)</label>
              <input
                type="text"
                value={formData.managerId}
                maxLength={24}
                onKeyDown={(e) => {
                  if (e.key.length === 1 && !MANAGER_ID_ALLOWED_KEY_RE.test(e.key)) e.preventDefault()
                }}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^A-Za-z0-9]/g, '')
                  setFormData({ ...formData, managerId: cleaned })
                  if (errors.managerId) setErrors({ ...errors, managerId: '' })
                }}
                placeholder="e.g., 65a1b2c3d4e5f6a7b8c9d0e1"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.managerId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.managerId && <p className="mt-1 text-sm text-red-600">{errors.managerId}</p>}
              {!errors.managerId && (
                <p className="mt-1 text-xs text-slate-500">
                  24-character hex ID of an existing user. Leave empty if no manager is assigned yet.
                </p>
              )}
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${formData.isActive ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-0.5'
                        }`}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-900">Active</span>
              </label>
              <p className="mt-1 text-xs text-slate-500">Inactive units won't be available for operations</p>
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
                {submitting ? 'Saving...' : editingId ? 'Update Unit' : 'Create Unit'}
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
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Business Unit?</h3>
              <p className="text-slate-600 mb-6">
                This action cannot be undone. Locations under this unit may be affected.
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
