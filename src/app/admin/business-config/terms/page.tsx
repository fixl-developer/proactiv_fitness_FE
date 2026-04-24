'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Calendar, X } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { TermService, LocationService, BusinessUnitService } from '@/services/businessConfigService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface Term {
  id: string
  name: string
  code?: string
  businessUnitId?: string
  startDate: string
  endDate: string
  locationId?: string
  holidays?: Holiday[]
  isActive: boolean
}

interface Holiday {
  name: string
  date: string
  type: string
}

export default function TermsPage() {
  const [terms, setTerms] = useState<Term[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [businessUnits, setBusinessUnits] = useState<any[]>([])
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
    businessUnitId: '',
    startDate: '',
    endDate: '',
    locationId: '',
    holidays: [] as Holiday[],
    isActive: true,
  })

  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', type: 'Public Holiday' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [holidayError, setHolidayError] = useState<string>('')

  const holidayTypes = ['Public Holiday', 'School Holiday', 'Company Holiday', 'Observance']

  const loadTerms = async () => {
    try {
      setLoading(true)
      const response = await TermService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      })
      setTerms(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading terms:', error)
      toast.error('Failed to load terms')
    } finally {
      setLoading(false)
    }
  }

  const loadLocations = async () => {
    try {
      const response = await LocationService.getAll({ limit: 100 })
      setLocations(response.data || [])
    } catch (error) {
      console.error('Error loading locations:', error)
    }
  }

  const loadBusinessUnits = async () => {
    try {
      const response = await BusinessUnitService.getAll({ limit: 100 })
      setBusinessUnits(response.data || [])
    } catch (error) {
      console.error('Error loading business units:', error)
    }
  }

  useEffect(() => {
    loadTerms()
  }, [currentPage, searchTerm])

  useEffect(() => {
    loadLocations()
    loadBusinessUnits()
  }, [])

  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || !formData.name.trim()) newErrors.name = 'Term name is required'
    else if (formData.name.trim().length < 2) newErrors.name = 'Term name must be at least 2 characters'
    else if (formData.name.trim().length > 80) newErrors.name = 'Term name must be 80 characters or fewer'

    if (formData.code && formData.code.trim() && !/^[A-Z0-9-]{2,20}$/.test(formData.code.trim())) {
      newErrors.code = 'Code must be 2-20 chars: uppercase letters, digits and hyphens only'
    }

    if (!formData.businessUnitId) newErrors.businessUnitId = 'Business unit is required'

    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (isNaN(start.getTime())) newErrors.startDate = 'Invalid start date'
      if (isNaN(end.getTime())) newErrors.endDate = 'Invalid end date'
      if (!newErrors.startDate && !newErrors.endDate && end <= start) {
        newErrors.endDate = 'End date must be after start date'
      }
    }

    // Validate any holidays already added
    for (const [i, h] of formData.holidays.entries()) {
      if (!h.name || !h.name.trim()) {
        newErrors.holidays = `Holiday #${i + 1} is missing a name`
        break
      }
      if (!h.date || isNaN(new Date(h.date).getTime())) {
        newErrors.holidays = `Holiday #${i + 1} has an invalid date`
        break
      }
      if (formData.startDate && formData.endDate) {
        const hd = new Date(h.date)
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        if (hd < start || hd > end) {
          newErrors.holidays = `Holiday "${h.name}" falls outside the term range`
          break
        }
      }
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
        await TermService.update(editingId, formData)
        toast.success('Term updated successfully')
      } else {
        await TermService.create(formData)
        toast.success('Term created successfully')
      }

      setShowForm(false)
      resetForm()
      loadTerms()
    } catch (error) {
      console.error('Error saving term:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (term: Term) => {
    setFormData({
      name: term.name,
      code: term.code || '',
      businessUnitId: term.businessUnitId || '',
      startDate: term.startDate?.split('T')[0] || '',
      endDate: term.endDate?.split('T')[0] || '',
      locationId: term.locationId || '',
      holidays: (term.holidays || []).map((h) => ({
        ...h,
        date: h.date?.split('T')[0] || h.date || '',
      })),
      isActive: term.isActive,
    })
    setEditingId(term.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await TermService.delete(id)
      toast.success('Term deleted successfully')
      setDeleteConfirm(null)
      loadTerms()
    } catch (error) {
      console.error('Error deleting term:', error)
      toast.error(getErrorMessage(error))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      businessUnitId: '',
      startDate: '',
      endDate: '',
      locationId: '',
      holidays: [],
      isActive: true,
    })
    setNewHoliday({ name: '', date: '', type: 'Public Holiday' })
    setErrors({})
    setHolidayError('')
    setEditingId(null)
  }

  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  const addHoliday = () => {
    const name = newHoliday.name.trim()
    if (!name) {
      setHolidayError('Holiday name is required')
      return
    }
    if (name.length < 2) {
      setHolidayError('Holiday name must be at least 2 characters')
      return
    }
    if (!newHoliday.date) {
      setHolidayError('Holiday date is required')
      return
    }
    const hd = new Date(newHoliday.date)
    if (isNaN(hd.getTime())) {
      setHolidayError('Holiday date is invalid')
      return
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (hd < start || hd > end) {
        setHolidayError('Holiday date must fall within the term range')
        return
      }
    }
    if (formData.holidays.some((h) => h.date === newHoliday.date && h.name.toLowerCase() === name.toLowerCase())) {
      setHolidayError('This holiday is already added')
      return
    }
    setFormData({
      ...formData,
      holidays: [...formData.holidays, { ...newHoliday, name }],
    })
    setNewHoliday({ name: '', date: '', type: 'Public Holiday' })
    setHolidayError('')
    if (errors.holidays) setErrors({ ...errors, holidays: '' })
  }

  const removeHoliday = (index: number) => {
    setFormData({
      ...formData,
      holidays: formData.holidays.filter((_, i) => i !== index),
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getWeeksBetween = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMs = end.getTime() - start.getTime()
    return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Terms & Holidays</h1>
          </div>
          <p className="text-slate-600">Manage academic terms, schedules, and holiday calendars</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search terms..."
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
            Add Term
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading terms...</p>
            </div>
          ) : terms.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No terms found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Start Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">End Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Duration</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Holidays</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {terms.map((term) => (
                      <tr key={term.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{term.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(term.startDate)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(term.endDate)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {getWeeksBetween(term.startDate, term.endDate)} weeks
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {term.holidays?.length || 0} holidays
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${term.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {term.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(term)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(term.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
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

        <SlideInDrawer isOpen={showForm} onClose={handleCloseDrawer} title={editingId ? 'Edit Term' : 'Add New Term'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Term Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onKeyDown={(e) => {
                  if (e.key.length === 1 && !/^[A-Za-z0-9\s'&().,-]$/.test(e.key)) e.preventDefault()
                }}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: '' })
                }}
                placeholder="e.g., Spring Term 2025"
                maxLength={80}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              {!errors.name && <p className="mt-1 text-xs text-slate-500">2-80 chars; letters, digits, spaces and basic punctuation</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.businessUnitId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                >
                  <option value="">Select Business Unit</option>
                  {businessUnits.map((unit) => (
                    <option key={unit.id || unit._id} value={unit.id || unit._id}>
                      {unit.name}{unit.code ? ` (${unit.code})` : ''}
                    </option>
                  ))}
                </select>
                {errors.businessUnitId && <p className="mt-1 text-sm text-red-600">{errors.businessUnitId}</p>}
                {!errors.businessUnitId && businessUnits.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">No business units yet — create one under Business Units first.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Term Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onKeyDown={(e) => {
                    if (e.key.length === 1 && !/^[A-Za-z0-9-]$/.test(e.key)) e.preventDefault()
                  }}
                  onChange={(e) => {
                    setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })
                    if (errors.code) setErrors({ ...errors, code: '' })
                  }}
                  placeholder="Auto-generated if empty (e.g., SPR-2025)"
                  maxLength={20}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.code ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                {!errors.code && <p className="mt-1 text-xs text-slate-500">Unique code for the term (A-Z, 0-9, hyphens)</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value })
                    if (errors.startDate) setErrors({ ...errors, startDate: '' })
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.startDate ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate || undefined}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value })
                    if (errors.endDate) setErrors({ ...errors, endDate: '' })
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.endDate ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Location (Optional)</label>
              <select
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">Leave blank to apply this term to all locations under the business unit</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Holidays</label>
              <div className="space-y-3 mb-3">
                <div className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={newHoliday.name}
                    onKeyDown={(e) => {
                      if (e.key.length === 1 && !/^[A-Za-z0-9\s'&().,-]$/.test(e.key)) e.preventDefault()
                    }}
                    onChange={(e) => {
                      setNewHoliday({ ...newHoliday, name: e.target.value })
                      if (holidayError) setHolidayError('')
                    }}
                    placeholder="Holiday name"
                    maxLength={60}
                    className="col-span-5 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="date"
                    value={newHoliday.date}
                    min={formData.startDate || undefined}
                    max={formData.endDate || undefined}
                    onChange={(e) => {
                      setNewHoliday({ ...newHoliday, date: e.target.value })
                      if (holidayError) setHolidayError('')
                    }}
                    className="col-span-4 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <select
                    value={newHoliday.type}
                    onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                    className="col-span-2 px-2 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {holidayTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(' Holiday', '')}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addHoliday}
                    className="col-span-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {holidayError && <p className="text-sm text-red-600">{holidayError}</p>}
                {errors.holidays && <p className="text-sm text-red-600">{errors.holidays}</p>}
              </div>

              <div className="space-y-2">
                {formData.holidays.map((holiday, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{holiday.name}</p>
                      <p className="text-xs text-slate-600">
                        {formatDate(holiday.date)} • {holiday.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHoliday(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="sr-only" />
                  <div className={`w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${formData.isActive ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-0.5'
                        }`}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-900">Active</span>
              </label>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button type="button" onClick={handleCloseDrawer} className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                {submitting ? 'Saving...' : editingId ? 'Update Term' : 'Create Term'}
              </button>
            </div>
          </form>
        </SlideInDrawer>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Term?</h3>
              <p className="text-slate-600 mb-6">This action cannot be undone. Classes and schedules linked to this term may be affected.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
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
