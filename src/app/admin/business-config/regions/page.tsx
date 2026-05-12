'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, Globe, Map } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { CountryService } from '@/services/businessConfigService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import { validateName, filterNameInput } from '@/utils/validation'
import { COUNTRIES, ALL_CURRENCIES } from '@/data/countries'
import RegionsTab from '@/components/admin/business-config/RegionsTab'

interface Country {
  id: string
  name: string
  code: string
  currency: string
  timezone: string
  isActive: boolean
  createdAt?: string
}

export default function RegionsPage() {
  const [activeTab, setActiveTab] = useState<'countries' | 'regions'>('countries')
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState<{
    name: string
    code: string
    currency: string
    timezone: string
    languages: string[]
    isActive: boolean
  }>({
    name: '',
    code: '',
    currency: '',
    timezone: '',
    languages: ['EN'],
    isActive: true,
  })

  const languageOptions = [
    { value: 'EN', label: 'English' },
    { value: 'JA', label: 'Japanese' },
    { value: 'ZH_HK', label: 'Chinese (Hong Kong)' },
    { value: 'ZH_CN', label: 'Chinese (Simplified)' },
  ]

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Common timezones. The currently-selected value (e.g. autofilled from a
  // country pick) is merged in below so it always appears as a valid option.
  const baseTimezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Hong_Kong',
    'Asia/Tokyo',
    'Australia/Sydney',
  ]
  const timezones = formData.timezone && !baseTimezones.includes(formData.timezone)
    ? [formData.timezone, ...baseTimezones]
    : baseTimezones

  // Full ISO 4217 currency list. If the currently-selected currency isn't in
  // the list yet (e.g. an older record), merge it in so the <select> can display it.
  const currencies = formData.currency && !ALL_CURRENCIES.includes(formData.currency)
    ? [formData.currency, ...ALL_CURRENCIES]
    : ALL_CURRENCIES

  // BUG_009: filter datalist options by the typed country name (case-insensitive)
  const filteredCountries = formData.name.trim()
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(formData.name.trim().toLowerCase()) ||
        c.code.toLowerCase().includes(formData.name.trim().toLowerCase())
      )
    : COUNTRIES

  // Load countries
  const loadCountries = async () => {
    try {
      setLoading(true)
      const response = await CountryService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      })
      setCountries(Array.isArray(response?.data) ? response.data : [])
      setTotalPages(response?.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading countries:', error)
      toast.error('Failed to load countries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCountries()
  }, [currentPage, searchTerm])

  // Validate form
  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    const nameErr = validateName(formData.name, 'Country name')
    if (nameErr) newErrors.name = nameErr

    if (!formData.code) newErrors.code = 'Country code is required'
    else if (!/^[A-Z]{2}$/.test(formData.code)) newErrors.code = 'Country code must be exactly 2 uppercase letters (ISO 3166-1, e.g., US, AE)'

    if (!formData.currency) newErrors.currency = 'Currency is required'
    else if (!/^[A-Z]{3}$/.test(formData.currency)) newErrors.currency = 'Currency must be 3 uppercase letters (e.g., USD)'

    if (!formData.timezone) newErrors.timezone = 'Timezone is required'

    if (!formData.languages || formData.languages.length === 0) newErrors.languages = 'At least one language is required'

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
        await CountryService.update(editingId, formData)
        toast.success('Country updated successfully')
      } else {
        await CountryService.create(formData)
        toast.success('Country created successfully')
      }

      setShowForm(false)
      resetForm()
      // Go back to page 1 so newly created items on any page are visible
      setCurrentPage(1)
      await loadCountries()
    } catch (error) {
      console.error('Error saving country:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (country: Country) => {
    setFormData({
      name: country.name,
      code: country.code,
      currency: country.currency,
      timezone: country.timezone,
      languages: (country as any).languages || ['EN'],
      isActive: country.isActive,
    })
    setEditingId(country.id)
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await CountryService.delete(id)
      toast.success('Country deleted successfully')
      setDeleteConfirm(null)
      await loadCountries()
    } catch (error) {
      console.error('Error deleting country:', error)
      toast.error(getErrorMessage(error))
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      currency: '',
      timezone: '',
      languages: ['EN'],
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
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Countries & Regions</h1>
          </div>
          <p className="text-slate-600">Manage countries, currencies, timezones, and regional sub-divisions</p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('countries')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${activeTab === 'countries' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
          >
            <span className="inline-flex items-center gap-2"><Globe className="w-4 h-4" /> Countries</span>
          </button>
          <button
            onClick={() => setActiveTab('regions')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${activeTab === 'regions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
          >
            <span className="inline-flex items-center gap-2"><Map className="w-4 h-4" /> Regions</span>
          </button>
        </div>

        {activeTab === 'regions' && <RegionsTab />}

        {activeTab === 'countries' && (<>

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
              placeholder="Search countries..."
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
            Add Country
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
              <p className="mt-4 text-slate-600">Loading countries...</p>
            </div>
          ) : countries.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No countries found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Country</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Code</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Currency</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Timezone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {countries.map((country) => (
                      <tr key={country.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{country.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {country.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{country.currency}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{country.timezone}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${country.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {country.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(country)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(country.id)}
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
          title={editingId ? 'Edit Country' : 'Add New Country'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Country Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Country Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="country-options"
                autoComplete="off"
                value={formData.name}
                onKeyDown={filterNameInput}
                onChange={(e) => {
                  const name = e.target.value
                  const match = COUNTRIES.find((c) => c.name === name)
                  if (match) {
                    setFormData({
                      ...formData,
                      name: match.name,
                      code: match.code,
                      currency: match.currency,
                      timezone: match.timezone,
                    })
                    setErrors({ ...errors, name: '', code: '', currency: '', timezone: '' })
                  } else {
                    setFormData({ ...formData, name })
                    if (errors.name) setErrors({ ...errors, name: '' })
                  }
                }}
                placeholder="Type to search — e.g., United Arab Emirates"
                maxLength={80}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {/* BUG_009: filter datalist by query (case-insensitive substring) */}
              <datalist id="country-options">
                {filteredCountries.map((c) => (
                  <option key={c.code} value={c.name}>{`${c.code} · ${c.currency}`}</option>
                ))}
              </datalist>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              {/* BUG_010: surface "no results" when the typed value matches nothing */}
              {!errors.name && formData.name && filteredCountries.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">No results found for &quot;{formData.name}&quot;</p>
              )}
              {!errors.name && filteredCountries.length > 0 && <p className="mt-1 text-xs text-slate-500">Pick a country to autofill code, currency and timezone</p>}
            </div>

            {/* Country Code */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Country Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onKeyDown={(e) => {
                  if (e.key.length === 1 && !/^[A-Za-z]$/.test(e.key)) e.preventDefault()
                }}
                onChange={(e) => {
                  const letters = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase()
                  setFormData({ ...formData, code: letters })
                  if (errors.code) setErrors({ ...errors, code: '' })
                }}
                placeholder="e.g., US, AE, GB"
                maxLength={2}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.code ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
              <p className="mt-1 text-xs text-slate-500">Exactly 2 uppercase letters (ISO 3166-1 alpha-2, e.g., US, AE, GB)</p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => {
                  setFormData({ ...formData, currency: e.target.value })
                  if (errors.currency) setErrors({ ...errors, currency: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.currency ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select Currency</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              {errors.currency && <p className="mt-1 text-sm text-red-600">{errors.currency}</p>}
              {!errors.currency && <p className="mt-1 text-xs text-slate-500">Auto-filled from the selected country; change it if this location uses a different currency.</p>}
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Timezone <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => {
                  setFormData({ ...formData, timezone: e.target.value })
                  if (errors.timezone) setErrors({ ...errors, timezone: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.timezone ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select Timezone</option>
                {timezones.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
              {errors.timezone && <p className="mt-1 text-sm text-red-600">{errors.timezone}</p>}
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Languages <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-3 border border-slate-300 rounded-lg">
                {languageOptions.map((lang) => (
                  <label key={lang.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(lang.value)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...formData.languages, lang.value]
                          : formData.languages.filter((l) => l !== lang.value)
                        setFormData({ ...formData, languages: next })
                        if (errors.languages) setErrors({ ...errors, languages: '' })
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{lang.label}</span>
                  </label>
                ))}
              </div>
              {errors.languages && <p className="mt-1 text-sm text-red-600">{errors.languages}</p>}
              {!errors.languages && <p className="mt-1 text-xs text-slate-500">Select at least one supported language</p>}
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
              <p className="mt-1 text-xs text-slate-500">Inactive countries won't be available for selection</p>
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
                {submitting ? 'Saving...' : editingId ? 'Update Country' : 'Create Country'}
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
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Country?</h3>
              <p className="text-slate-600 mb-6">
                This action cannot be undone. Business units and locations in this country may be affected.
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
        </>)}
      </div>
    </div>
  )
}
