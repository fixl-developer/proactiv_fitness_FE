'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Building2 } from 'lucide-react'
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

export default function BusinessUnitsPage() {
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [countries, setCountries] = useState<any[]>([])
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
    type: 'franchise',
    countryId: '',
    managerId: '',
    isActive: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Business unit types
  const unitTypes = [
    { value: 'franchise', label: 'Franchise' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'partner', label: 'Partner' },
    { value: 'regional', label: 'Regional Office' },
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

  // Load countries for dropdown
  const loadCountries = async () => {
    try {
      const response = await CountryService.getAll({ limit: 100 })
      setCountries(response.data || [])
    } catch (error) {
      console.error('Error loading countries:', error)
    }
  }

  useEffect(() => {
    loadUnits()
  }, [currentPage, searchTerm])

  useEffect(() => {
    loadCountries()
  }, [])

  // Validate form
  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = 'Business unit name is required'
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters'

    if (!formData.code) newErrors.code = 'Business unit code is required'
    else if (!/^[A-Z0-9]{2,10}$/.test(formData.code)) newErrors.code = 'Code must be 2-10 uppercase letters/numbers'

    if (!formData.type) newErrors.type = 'Business unit type is required'
    if (!formData.countryId) newErrors.countryId = 'Country is required'

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
        await BusinessUnitService.update(editingId, formData)
        toast.success('Business unit updated successfully')
      } else {
        await BusinessUnitService.create(formData)
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
      type: 'franchise',
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

  // Get country name by ID
  const getCountryName = (countryId: string) => {
    const country = countries.find((c) => c.id === countryId)
    return country?.name || countryId
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
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Business Units</h1>
          </div>
          <p className="text-slate-600">Manage franchises, corporate offices, and regional units</p>
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
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Business Unit Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: '' })
                }}
                placeholder="e.g., Dubai Franchise"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Business Unit Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => {
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  if (errors.code) setErrors({ ...errors, code: '' })
                }}
                placeholder="e.g., DXB01"
                maxLength={10}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.code ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
              <p className="mt-1 text-xs text-slate-500">2-10 uppercase letters/numbers (e.g., DXB01, HQ001)</p>
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.countryId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.countryId && <p className="mt-1 text-sm text-red-600">{errors.countryId}</p>}
            </div>

            {/* Manager ID (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Manager ID (Optional)</label>
              <input
                type="text"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                placeholder="e.g., MGR001"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500">Leave empty if no manager assigned yet</p>
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
