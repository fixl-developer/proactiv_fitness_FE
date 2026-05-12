'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, MapPin, X, DoorOpen } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { LocationService, BusinessUnitService, CountryService } from '@/services/businessConfigService'
import RoomsTab from '@/components/admin/business-config/RoomsTab'
import PhoneCountryInput from '@/components/admin/business-config/PhoneCountryInput'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import { validateEmail, validateName, validateAddress, validateZipCode, validateNumber, filterNameInput, validateAlphaText, validatePhone10 } from '@/utils/validation'

interface Location {
  id: string
  name: string
  address: string
  city: string
  state?: string
  country: string
  postalCode?: string
  phone?: string
  email?: string
  businessUnitId?: string
  capacity?: number
  facilities?: string[]
  isActive: boolean
}

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState<'locations' | 'rooms'>('locations')
  const [locations, setLocations] = useState<Location[]>([])
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
    address: '',
    city: '',
    state: '',
    country: '',
    countryId: '',
    postalCode: '',
    phone: '',
    email: '',
    businessUnitId: '',
    capacity: 1,
    facilities: [] as string[],
    isActive: true,
  })
  const [countries, setCountries] = useState<any[]>([])

  const [newFacility, setNewFacility] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadLocations = async () => {
    try {
      setLoading(true)
      const response = await LocationService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      })
      setLocations(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading locations:', error)
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
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

  const loadCountries = async () => {
    try {
      const response = await CountryService.getAll({ limit: 100 })
      setCountries(response.data || [])
    } catch (error) {
      console.error('Error loading countries:', error)
    }
  }

  useEffect(() => {
    loadLocations()
  }, [currentPage, searchTerm])

  useEffect(() => {
    loadBusinessUnits()
    loadCountries()
  }, [])

  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    // BUG_003: tighten Location Name — letters only, no digits
    const nameErr = validateAlphaText(formData.name, 'Location name', 100)
    if (nameErr) newErrors.name = nameErr

    const addressErr = validateAddress(formData.address, 'Address')
    if (addressErr) newErrors.address = addressErr

    const cityErr = validateName(formData.city, 'City')
    if (cityErr) newErrors.city = cityErr

    if (formData.state && formData.state.trim()) {
      const stateErr = validateName(formData.state, 'State/Province')
      if (stateErr) newErrors.state = stateErr
    }

    if (!formData.country || !formData.country.trim()) {
      newErrors.country = 'Country is required'
    } else {
      const countryErr = validateName(formData.country, 'Country')
      if (countryErr) newErrors.country = countryErr
    }

    const zipErr = validateZipCode(formData.postalCode, true)
    if (zipErr) newErrors.postalCode = zipErr

    if (!formData.businessUnitId) newErrors.businessUnitId = 'Business unit is required'
    if (!formData.countryId) newErrors.countryId = 'Country (ref) is required'

    // Email optional
    const emailErr = validateEmail(formData.email, false)
    if (emailErr) newErrors.email = emailErr

    // BUG_006: Phone is required and must be exactly 10 digits
    const phoneErr = validatePhone10(formData.phone, true, 'Phone')
    if (phoneErr) newErrors.phone = phoneErr

    if (formData.code && formData.code.trim() && !/^[A-Z0-9-]{2,20}$/.test(formData.code.trim())) {
      newErrors.code = 'Code must be 2-20 chars: uppercase letters, digits and hyphens only'
    }

    const capErr = validateNumber(String(formData.capacity ?? ''), 'Capacity', 1, 100000)
    if (capErr) newErrors.capacity = capErr

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
        await LocationService.update(editingId, formData)
        toast.success('Location updated successfully')
      } else {
        await LocationService.create(formData)
        toast.success('Location created successfully')
      }

      setShowForm(false)
      resetForm()
      setCurrentPage(1)
      await loadLocations()
    } catch (error) {
      console.error('Error saving location:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (location: Location) => {
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state || '',
      country: location.country,
      postalCode: location.postalCode || '',
      phone: location.phone || '',
      email: location.email || '',
      businessUnitId: location.businessUnitId || '',
      countryId: (location as any).countryId || '',
      code: (location as any).code || '',
      capacity: location.capacity || 0,
      facilities: location.facilities || [],
      isActive: location.isActive,
    })
    setEditingId(location.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await LocationService.delete(id)
      toast.success('Location deleted successfully')
      setDeleteConfirm(null)
      await loadLocations()
    } catch (error) {
      console.error('Error deleting location:', error)
      toast.error(getErrorMessage(error))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      country: '',
      countryId: '',
      postalCode: '',
      phone: '',
      email: '',
      businessUnitId: '',
      capacity: 1,
      facilities: [],
      isActive: true,
    })
    setNewFacility('')
    setErrors({})
    setEditingId(null)
  }

  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  const addFacility = () => {
    if (newFacility.trim()) {
      setFormData({ ...formData, facilities: [...formData.facilities, newFacility.trim()] })
      setNewFacility('')
    }
  }

  const removeFacility = (index: number) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Locations</h1>
          </div>
          <p className="text-slate-600">Manage physical locations, facilities, capacity, and individual rooms</p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${activeTab === 'locations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
          >
            <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> Locations</span>
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${activeTab === 'rooms' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
          >
            <span className="inline-flex items-center gap-2"><DoorOpen className="w-4 h-4" /> Rooms</span>
          </button>
        </div>

        {activeTab === 'rooms' && <RoomsTab />}

        {activeTab === 'locations' && (<>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search locations..."
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
              Add Location
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-600">Loading locations...</p>
              </div>
            ) : locations.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No locations found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">City</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Country</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Capacity</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Facilities</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {locations.map((location) => (
                        <tr key={location.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{location.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{location.city}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{location.country}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{location.capacity || '-'}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {location.facilities?.length || 0} facilities
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {location.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(location)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteConfirm(location.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
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

          <SlideInDrawer isOpen={showForm} onClose={handleCloseDrawer} title={editingId ? 'Edit Location' : 'Add New Location'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onKeyDown={(e) => {
                    // BUG_003: only allow letters, spaces and basic punctuation — no digits
                    if (e.key.length === 1 && !/^[A-Za-z\s'.\-&]$/.test(e.key)) e.preventDefault()
                  }}
                  onChange={(e) => {
                    const v = e.target.value
                    setFormData({ ...formData, name: v })
                    const err = validateAlphaText(v, 'Location name', 100)
                    setErrors((prev) => ({ ...prev, name: err || '' }))
                  }}
                  placeholder="e.g., Dubai Marina Center"
                  maxLength={100}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                {!errors.name && <p className="mt-1 text-xs text-slate-500">Letters, spaces and basic punctuation only (max 100 chars)</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value })
                    if (errors.address) setErrors({ ...errors, address: '' })
                  }}
                  placeholder="Full address"
                  rows={2}
                  maxLength={255}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onKeyDown={filterNameInput}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value })
                      if (errors.city) setErrors({ ...errors, city: '' })
                    }}
                    placeholder="City"
                    maxLength={80}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">State/Province</label>
                  <input
                    type="text"
                    value={formData.state}
                    onKeyDown={filterNameInput}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value })
                      if (errors.state) setErrors({ ...errors, state: '' })
                    }}
                    maxLength={80}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.state ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onKeyDown={filterNameInput}
                    onChange={(e) => {
                      setFormData({ ...formData, country: e.target.value })
                      if (errors.country) setErrors({ ...errors, country: '' })
                    }}
                    placeholder="Country"
                    maxLength={80}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.country ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onKeyDown={(e) => {
                      if (e.key.length === 1 && !/^[A-Za-z0-9\s-]$/.test(e.key)) e.preventDefault()
                    }}
                    onChange={(e) => {
                      setFormData({ ...formData, postalCode: e.target.value.toUpperCase() })
                      if (errors.postalCode) setErrors({ ...errors, postalCode: '' })
                    }}
                    placeholder="e.g., 10001"
                    maxLength={10}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.postalCode ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
                  {!errors.postalCode && <p className="mt-1 text-xs text-slate-500">Letters, digits, spaces and hyphens (3-10 chars)</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <PhoneCountryInput
                    value={formData.phone}
                    onChange={(value) => {
                      setFormData({ ...formData, phone: value })
                      // BUG_006: live-validate strict 10 digits
                      const err = validatePhone10(value, true, 'Phone')
                      setErrors((prev) => ({ ...prev, phone: err || '' }))
                    }}
                    error={errors.phone}
                    label="Phone"
                    required={true}
                    placeholder="+1 5551234567"
                    onBlur={() => {
                      const phoneErr = validatePhone10(formData.phone, true, 'Phone')
                      if (phoneErr) setErrors((prev) => ({ ...prev, phone: phoneErr }))
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      if (errors.email) setErrors({ ...errors, email: '' })
                    }}
                    placeholder="venue@example.com"
                    maxLength={120}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  {!errors.email && <p className="mt-1 text-xs text-slate-500">Branch contact for customer "Email" links — leave blank if HQ handles all queries</p>}
                </div>
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
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.businessUnitId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                  >
                    <option value="">Select Business Unit</option>
                    {businessUnits.map((unit) => (
                      <option key={unit.id || unit._id} value={unit.id || unit._id}>
                        {unit.name} {unit.code ? `(${unit.code})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.businessUnitId && <p className="mt-1 text-sm text-red-600">{errors.businessUnitId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Country (ref) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.countryId}
                    onChange={(e) => {
                      setFormData({ ...formData, countryId: e.target.value })
                      if (errors.countryId) setErrors({ ...errors, countryId: '' })
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.countryId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.id || c._id} value={c.id || c._id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  {errors.countryId && <p className="mt-1 text-sm text-red-600">{errors.countryId}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Location Code</label>
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
                  placeholder="Auto-generated from name if empty (e.g., NYC-01)"
                  maxLength={20}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.code ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                {!errors.code && <p className="mt-1 text-xs text-slate-500">Uppercase letters, digits and hyphens only (leave blank to auto-generate)</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => {
                    const v = e.target.value
                    setFormData({ ...formData, capacity: v === '' ? 0 : Number(v) })
                    if (errors.capacity) setErrors({ ...errors, capacity: '' })
                  }}
                  min={1}
                  max={100000}
                  step={1}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.capacity ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
                {!errors.capacity && <p className="mt-1 text-xs text-slate-500">Number of people the venue holds (minimum 1)</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Facilities</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                    placeholder="e.g., Gym, Pool, Parking"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" onClick={addFacility} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.facilities.map((facility, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {facility}
                      <button type="button" onClick={() => removeFacility(index)} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
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
                  {submitting ? 'Saving...' : editingId ? 'Update Location' : 'Create Location'}
                </button>
              </div>
            </form>
          </SlideInDrawer>

          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Location?</h3>
                <p className="text-slate-600 mb-6">This action cannot be undone. Classes and bookings at this location may be affected.</p>
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
        </>)}
      </div>
    </div>
  )
}
