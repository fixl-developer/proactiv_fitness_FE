'use client'

import { useState, useEffect, useCallback } from 'react'
import { Layers, CheckCircle2, Users, Gauge } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { BusinessUnitService, LocationService } from '@/services/businessConfigService'
import { extractList, extractPagination } from '@/utils/apiResponse'
import { toast } from 'sonner'
import {
  validateRequired,
  validateSelect,
  validateNumber,
  validateCurrency,
  validateTextArea,
} from '@/utils/validation'

// Program name: letters, digits, spaces, hyphens, apostrophes, ampersand
const PROGRAM_NAME_PATTERN = /^[A-Za-z0-9 '&\-]+$/
// Age group: "5-10", "5 - 10", or just "5+" (we accept the dash form)
const AGE_GROUP_PATTERN = /^\s*\d{1,2}\s*-\s*\d{1,2}\s*$/

// ── Types ──────────────────────────────────────────────────────────────────
interface Program {
  _id: string
  name: string
  type: string
  level: string
  ageGroup: string
  description: string
  capacity: number
  price: number
  status: 'active' | 'inactive' | 'draft'
  enrolledCount?: number
  createdAt?: string
}

interface ProgramStats {
  totalPrograms: number
  activePrograms: number
  totalEnrolled: number
  averageCapacity: number
}

interface FormState extends Omit<Program, '_id'> {
  businessUnitId: string
  locationIds: string[]
}

const EMPTY_FORM: FormState = {
  name: '',
  type: 'gymnastics',
  level: 'beginner',
  ageGroup: '',
  description: '',
  capacity: 15,
  price: 0,
  status: 'active',
  businessUnitId: '',
  locationIds: [],
}

// ── Fallback mock data ─────────────────────────────────────────────────────
const FALLBACK_PROGRAMS: Program[] = [
  { _id: 'mock-1', name: 'Tiny Tumblers', type: 'gymnastics', level: 'beginner', ageGroup: '3-5', description: 'Intro gymnastics for toddlers', capacity: 12, price: 89, status: 'active', enrolledCount: 10 },
  { _id: 'mock-2', name: 'Ninja Warriors', type: 'ninja', level: 'intermediate', ageGroup: '7-12', description: 'Obstacle course training', capacity: 16, price: 109, status: 'active', enrolledCount: 14 },
  { _id: 'mock-3', name: 'Advanced Tumbling', type: 'tumbling', level: 'advanced', ageGroup: '10-16', description: 'Competition-level tumbling', capacity: 10, price: 139, status: 'draft', enrolledCount: 0 },
]

const FALLBACK_STATS: ProgramStats = {
  totalPrograms: 3,
  activePrograms: 2,
  totalEnrolled: 24,
  averageCapacity: 13,
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ProgramCatalogPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [stats, setStats] = useState<ProgramStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiFailed, setApiFailed] = useState(false)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  // Dropdown data for Business Unit + Locations (required by backend)
  const [businessUnits, setBusinessUnits] = useState<Array<{ id: string; name: string }>>([])
  const [locationOptions, setLocationOptions] = useState<Array<{ id: string; name: string; businessUnitId?: string }>>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)

  // Search / filter
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null)

  // ── Load programs ──────────────────────────────────────────────────────
  const loadPrograms = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (filterType) params.set('type', filterType)
      if (filterLevel) params.set('level', filterLevel)
      if (filterStatus) params.set('status', filterStatus)

      const res: any = await apiClient.get(`/programs?${params.toString()}`)
      const list = extractList<any>(res)
      // Normalize: backend mixes _id / id across list endpoints — collapse to _id
      // so the table key (and edit/delete actions) always have a stable identifier.
      const normalized: Program[] = list.map((p: any) => ({
        _id: p._id || p.id || '',
        name: p.name || '',
        type: p.type || '',
        level: p.level || '',
        ageGroup: p.ageGroup || '',
        description: p.description || '',
        capacity: Number(p.capacity) || 0,
        price: Number(p.price) || 0,
        status: p.status || 'active',
        enrolledCount: p.enrolledCount,
        createdAt: p.createdAt,
      })).filter((p: Program) => p._id)
      setPrograms(normalized)
      setTotalPages(extractPagination(res).totalPages)
      setApiFailed(false)
    } catch (err: any) {
      console.error('Failed to load programs:', err)
      setApiFailed(true)
      setPrograms(FALLBACK_PROGRAMS)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterType, filterLevel, filterStatus])

  const loadStats = useCallback(async () => {
    try {
      const res: any = await apiClient.get('/programs/statistics')
      setStats(res?.data ?? res)
    } catch {
      setStats(FALLBACK_STATS)
    }
  }, [])

  // Load Business Units and Locations for the form dropdowns.
  // Backend requires both — see program.validation.ts (businessUnitId required, locationIds min 1).
  const loadFormDropdowns = useCallback(async () => {
    setLoadingDropdowns(true)
    try {
      const [buRes, locRes] = await Promise.allSettled([
        BusinessUnitService.getAll({ page: 1, limit: 100 }),
        LocationService.getAll({ page: 1, limit: 200 }),
      ])
      if (buRes.status === 'fulfilled') {
        setBusinessUnits(buRes.value.data.map((b: any) => ({ id: b.id || b._id, name: b.name })).filter((b: any) => b.id))
      }
      if (locRes.status === 'fulfilled') {
        setLocationOptions(locRes.value.data.map((l: any) => ({
          id: l.id || l._id,
          name: l.name,
          businessUnitId: l.businessUnitId,
        })).filter((l: any) => l.id))
      }
    } catch (err) {
      console.error('Failed to load form dropdowns:', err)
    } finally {
      setLoadingDropdowns(false)
    }
  }, [])

  useEffect(() => {
    loadPrograms()
    loadStats()
  }, [loadPrograms, loadStats])

  useEffect(() => {
    if (showForm && businessUnits.length === 0 && locationOptions.length === 0) {
      loadFormDropdowns()
    }
  }, [showForm, businessUnits.length, locationOptions.length, loadFormDropdowns])

  // Transform minimal form data into the full payload the backend Joi schema expects.
  // The UI only collects top-level fields; nested rules/templates get safe defaults.
  const buildCreatePayload = (): any => {
    // Backend Joi expects lowercase enum values (see ProgramType validation)
    const programTypeMap: Record<string, string> = {
      gymnastics: 'regular',
      ninja: 'regular',
      tumbling: 'regular',
      regular: 'regular',
      camp: 'camp',
      event: 'event',
      party: 'party',
      assessment: 'assessment',
      private: 'private',
    }
    const skillLevelMap: Record<string, string> = {
      beginner: 'beginner',
      intermediate: 'intermediate',
      advanced: 'advanced',
      expert: 'expert',
    }
    const [minStr, maxStr] = (formData.ageGroup || '5-10').split('-')
    const minAge = Number(minStr) || 5
    const maxAge = Number(maxStr) || 12

    const description = formData.description || formData.name || 'Program'
    const ageDescription = `Ages ${minAge}-${maxAge}`
    const ageGroup = { minAge, maxAge, ageType: 'years', description: ageDescription }

    return {
      name: formData.name,
      description,
      shortDescription: description.slice(0, 200),
      programType: programTypeMap[formData.type] || 'regular',
      category: formData.type || 'general',
      businessUnitId: formData.businessUnitId,
      locationIds: formData.locationIds,
      ageGroups: [ageGroup],
      skillLevels: [skillLevelMap[formData.level] || 'beginner'],
      capacityRules: {
        minParticipants: 1,
        maxParticipants: formData.capacity || 15,
        coachToParticipantRatio: 10,
        waitlistCapacity: 5,
        allowOverbooking: false,
      },
      eligibilityRules: {
        ageRestrictions: ageGroup,
        medicalClearanceRequired: false,
        parentalConsentRequired: true,
      },
      pricingModel: {
        basePrice: formData.price || 0,
        currency: 'USD',
        pricingType: 'per_term',
      },
      classTemplates: [{
        name: 'Default Session',
        description: 'Standard class template',
        duration: 60,
        activities: ['Warm-up', 'Skill practice', 'Cool-down'],
        learningObjectives: ['Skill development', 'Safety awareness'],
      }],
      sessionDuration: 60,
      sessionsPerWeek: 1,
      termDuration: 12,
      availableDays: ['monday', 'wednesday', 'friday'],
      availableTimeSlots: [{ startTime: '16:00', endTime: '17:00', days: ['monday', 'wednesday', 'friday'] }],
      isActive: formData.status === 'active',
      isPublic: formData.status !== 'draft',
    }
  }

  // ── Validation ─────────────────────────────────────────────────────────
  const validateFormData = () => {
    const e: Record<string, string> = {}

    const nameErr = validateRequired(formData.name, 'Program name')
    if (nameErr) e.name = nameErr
    else if (formData.name.trim().length < 3) e.name = 'Program name must be at least 3 characters'
    else if (formData.name.length > 80) e.name = 'Program name must be less than 80 characters'
    else if (!PROGRAM_NAME_PATTERN.test(formData.name.trim())) {
      e.name = 'Letters, digits, spaces, hyphens, apostrophes and & only'
    }

    const typeErr = validateSelect(formData.type, 'Type')
    if (typeErr) e.type = typeErr

    const ageErr = validateRequired(formData.ageGroup, 'Age group')
    if (ageErr) e.ageGroup = ageErr
    else if (!AGE_GROUP_PATTERN.test(formData.ageGroup.trim())) {
      e.ageGroup = 'Use format min-max (e.g. 5-10)'
    } else {
      const [minStr, maxStr] = formData.ageGroup.trim().split('-')
      const min = parseInt(minStr, 10)
      const max = parseInt(maxStr, 10)
      if (min < 1 || min > 99) e.ageGroup = 'Min age must be between 1 and 99'
      else if (max < 1 || max > 99) e.ageGroup = 'Max age must be between 1 and 99'
      else if (min > max) e.ageGroup = 'Min age cannot be greater than max age'
    }

    const levelErr = validateSelect(formData.level, 'Level')
    if (levelErr) e.level = levelErr

    const capErr = validateNumber(String(formData.capacity), 'Capacity', 1, 1000)
    if (capErr) e.capacity = capErr

    const priceErr = validateCurrency(String(formData.price), 'Price')
    if (priceErr) e.price = priceErr

    const statusErr = validateSelect(formData.status, 'Status')
    if (statusErr) e.status = statusErr

    if (formData.description) {
      const descErr = validateTextArea(formData.description, 'Description', 0, 2000)
      if (descErr) e.description = descErr
    }

    if (!editingId) {
      const buErr = validateSelect(formData.businessUnitId, 'Business unit')
      if (buErr) e.businessUnitId = buErr
      if (!formData.locationIds || formData.locationIds.length === 0) {
        e.locationIds = 'Select at least one location'
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Create / Edit ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateFormData()) {
      toast.error('Please fix the highlighted fields')
      return
    }
    setSubmitting(true)
    try {
      if (editingId) {
        // Strip dropdown fields from update payload — backend update schema doesn't expect them
        const { businessUnitId: _bu, locationIds: _loc, ...updatePayload } = formData
        await apiClient.put(`/programs/${editingId}`, updatePayload)
        toast.success('Program updated successfully')
      } else {
        await apiClient.post('/programs', buildCreatePayload())
        toast.success('Program created successfully')
      }
      resetForm()
      loadPrograms()
      loadStats()
    } catch (err: any) {
      const data = err?.response?.data
      const msg = (Array.isArray(data?.errors) && data.errors.length > 0)
        ? data.errors.join(', ')
        : data?.message || (editingId ? 'Failed to update program' : 'Failed to create program')
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (p: Program) => {
    setEditingId(p._id)
    setFormData({
      name: p.name,
      type: p.type,
      level: p.level,
      ageGroup: p.ageGroup,
      description: p.description,
      capacity: p.capacity,
      price: p.price,
      status: p.status,
      businessUnitId: (p as any).businessUnitId || '',
      locationIds: Array.isArray((p as any).locationIds) ? (p as any).locationIds : [],
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setErrors({})
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await apiClient.delete(`/programs/${deleteTarget._id}`)
      toast.success(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
      loadPrograms()
      loadStats()
    } catch {
      toast.error('Failed to delete program')
    }
  }

  // ── Toggle status ──────────────────────────────────────────────────────
  const toggleStatus = async (p: Program) => {
    try {
      await apiClient.patch(`/programs/${p._id}/status`, {
        status: p.status === 'active' ? 'inactive' : 'active',
      })
      toast.success(`Status toggled for "${p.name}"`)
      loadPrograms()
      loadStats()
    } catch {
      toast.error('Failed to toggle status')
    }
  }

  // ── Duplicate ──────────────────────────────────────────────────────────
  const duplicateProgram = async (p: Program) => {
    try {
      await apiClient.post(`/programs/${p._id}/duplicate`)
      toast.success(`"${p.name}" duplicated`)
      loadPrograms()
      loadStats()
    } catch {
      toast.error('Failed to duplicate program')
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const levelColor = (l: string) => {
    switch (l) {
      case 'beginner': return 'bg-blue-100 text-blue-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* API warning banner */}
      {apiFailed && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 flex items-center gap-2">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Unable to reach the programs API. Showing sample data.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Program Catalog</h1>
        <button id="btn-admin-programs-catalog-1"
          onClick={() => { showForm ? resetForm() : setShowForm(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Create Program'}
        </button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Programs',
              value: stats.totalPrograms,
              Icon: Layers,
              gradient: 'from-blue-50 to-blue-100',
              border: 'border-blue-200',
              iconBg: 'bg-blue-500',
              valueText: 'text-blue-700',
            },
            {
              label: 'Active Programs',
              value: stats.activePrograms,
              Icon: CheckCircle2,
              gradient: 'from-green-50 to-emerald-100',
              border: 'border-green-200',
              iconBg: 'bg-green-500',
              valueText: 'text-green-700',
            },
            {
              label: 'Total Enrolled',
              value: stats.totalEnrolled,
              Icon: Users,
              gradient: 'from-purple-50 to-fuchsia-100',
              border: 'border-purple-200',
              iconBg: 'bg-purple-500',
              valueText: 'text-purple-700',
            },
            {
              label: 'Avg Capacity',
              value: stats.averageCapacity,
              Icon: Gauge,
              gradient: 'from-orange-50 to-amber-100',
              border: 'border-orange-200',
              iconBg: 'bg-orange-500',
              valueText: 'text-orange-700',
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`relative overflow-hidden bg-gradient-to-br ${s.gradient} border ${s.border} rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 min-h-[120px] flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-600">{s.label}</p>
                <div className={`w-10 h-10 ${s.iconBg} rounded-lg flex items-center justify-center shadow-sm shrink-0`}>
                  <s.Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className={`text-3xl font-bold ${s.valueText}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input id="input-text-admin-programs-catalog-search"
            type="text"
            placeholder="Search programs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="px-4 py-2 border rounded-lg col-span-1 md:col-span-2"
          />
          <select id="select-admin-programs-catalog-16" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1) }} className="px-4 py-2 border rounded-lg">
            <option value="">All Types</option>
            <option value="gymnastics">Gymnastics</option>
            <option value="tumbling">Tumbling</option>
            <option value="ninja">Ninja</option>
          </select>
          <select id="select-admin-programs-catalog-17" value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setPage(1) }} className="px-4 py-2 border rounded-lg">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select id="select-admin-programs-catalog-18" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }} className="px-4 py-2 border rounded-lg">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Program' : 'Create Program'}</h2>
          <form id="form-admin-programs-catalog" onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Program Name <span className="text-red-500">*</span>
                </label>
                <input id="input-text-admin-programs-catalog"
                  type="text"
                  value={formData.name}
                  maxLength={80}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '' || PROGRAM_NAME_PATTERN.test(v)) {
                      setFormData({ ...formData, name: v })
                      if (errors.name) setErrors({ ...errors, name: '' })
                    }
                  }}
                  placeholder="e.g. Tiny Tumblers"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                />
                {errors.name
                  ? <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  : <p className="mt-1 text-xs text-gray-500">Letters, digits, spaces, hyphens, apostrophes and &amp; only</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select id="select-admin-programs-catalog-19"
                  value={formData.type}
                  onChange={(e) => { setFormData({ ...formData, type: e.target.value }); if (errors.type) setErrors({ ...errors, type: '' }) }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                >
                  <option value="">Select type</option>
                  <option value="gymnastics">Gymnastics</option>
                  <option value="tumbling">Tumbling</option>
                  <option value="ninja">Ninja</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Age Group <span className="text-red-500">*</span>
                </label>
                <input id="input-text-admin-programs-catalog"
                  type="text"
                  value={formData.ageGroup}
                  maxLength={10}
                  onChange={(e) => {
                    const v = e.target.value
                    // Only digits, hyphen and a single space allowed while typing
                    if (v === '' || /^[\d\- ]*$/.test(v)) {
                      setFormData({ ...formData, ageGroup: v })
                      if (errors.ageGroup) setErrors({ ...errors, ageGroup: '' })
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.ageGroup ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  placeholder="e.g., 5-7"
                />
                {errors.ageGroup
                  ? <p className="mt-1 text-sm text-red-600">{errors.ageGroup}</p>
                  : <p className="mt-1 text-xs text-gray-500">Format: min-max (numbers only)</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Level <span className="text-red-500">*</span>
                </label>
                <select id="select-admin-programs-catalog-20"
                  value={formData.level}
                  onChange={(e) => { setFormData({ ...formData, level: e.target.value }); if (errors.level) setErrors({ ...errors, level: '' }) }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.level ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input id="input-number-admin-programs-catalog"
                  type="text"
                  inputMode="numeric"
                  value={String(formData.capacity)}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '' || /^\d+$/.test(v)) {
                      setFormData({ ...formData, capacity: v === '' ? 0 : Number(v) })
                      if (errors.capacity) setErrors({ ...errors, capacity: '' })
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.capacity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  placeholder="e.g. 15"
                />
                {errors.capacity
                  ? <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
                  : <p className="mt-1 text-xs text-gray-500">Whole number between 1 and 1000</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input id="input-number-admin-programs-catalog"
                  type="text"
                  inputMode="decimal"
                  value={String(formData.price)}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '' || /^\d+(\.\d{0,2})?$/.test(v) || /^\d+\.$/.test(v)) {
                      setFormData({ ...formData, price: v === '' ? 0 : parseFloat(v) || 0 })
                      if (errors.price) setErrors({ ...errors, price: '' })
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  placeholder="0.00"
                />
                {errors.price
                  ? <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  : <p className="mt-1 text-xs text-gray-500">Numbers only, up to 2 decimal places</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select id="select-admin-programs-catalog-21"
                  value={formData.status}
                  onChange={(e) => { setFormData({ ...formData, status: e.target.value as Program['status'] }); if (errors.status) setErrors({ ...errors, status: '' }) }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
              </div>
            </div>

            {/* Business Unit + Locations — required by backend */}
            {!editingId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-admin-programs-catalog-bu"
                    value={formData.businessUnitId}
                    onChange={(e) => {
                      setFormData({ ...formData, businessUnitId: e.target.value, locationIds: [] })
                      if (errors.businessUnitId) setErrors({ ...errors, businessUnitId: '' })
                    }}
                    className={`w-full px-4 py-2 border rounded-lg disabled:bg-gray-100 focus:outline-none focus:ring-2 ${errors.businessUnitId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    disabled={loadingDropdowns || businessUnits.length === 0}
                  >
                    <option value="">
                      {loadingDropdowns
                        ? 'Loading...'
                        : businessUnits.length === 0
                          ? 'No business units found — create one first'
                          : 'Select a business unit'}
                    </option>
                    {businessUnits.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {errors.businessUnitId && <p className="mt-1 text-sm text-red-600">{errors.businessUnitId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Locations <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-400 ml-2">({formData.locationIds.length} selected)</span>
                  </label>
                  {(() => {
                    const filtered = formData.businessUnitId
                      ? locationOptions.filter((l) => !l.businessUnitId || l.businessUnitId === formData.businessUnitId)
                      : locationOptions
                    if (loadingDropdowns) {
                      return <p className="text-sm text-gray-400 border rounded-lg p-3">Loading...</p>
                    }
                    if (filtered.length === 0) {
                      return (
                        <p className="text-sm text-gray-400 border rounded-lg p-3">
                          {formData.businessUnitId
                            ? 'No locations for this business unit. Create one first.'
                            : 'Select a business unit first.'}
                        </p>
                      )
                    }
                    return (
                      <div className={`border rounded-lg p-3 max-h-32 overflow-y-auto space-y-1 ${errors.locationIds ? 'border-red-500' : 'border-gray-300'}`}>
                        {filtered.map((l) => (
                          <label key={l.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.locationIds.includes(l.id)}
                              onChange={() => {
                                const next = formData.locationIds.includes(l.id)
                                  ? formData.locationIds.filter((id) => id !== l.id)
                                  : [...formData.locationIds, l.id]
                                setFormData({ ...formData, locationIds: next })
                                if (errors.locationIds) setErrors({ ...errors, locationIds: '' })
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{l.name}</span>
                          </label>
                        ))}
                      </div>
                    )
                  })()}
                  {errors.locationIds && <p className="mt-1 text-sm text-red-600">{errors.locationIds}</p>}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => { setFormData({ ...formData, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                rows={3}
                maxLength={2000}
                placeholder="Brief description of the program (max 2000 characters)"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            <div className="flex gap-3">
              <button id="admin-programs-catalog-btn"
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Program' : 'Create Program'}
              </button>
              <button id="btn-admin-programs-catalog-2" type="button" onClick={resetForm} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Programs table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading programs...</div>
      ) : programs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          No programs found. Create your first program to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Level</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Age Group</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Capacity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {programs.map((p, idx) => (
                  <tr key={p._id || `program-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.name}</div>
                      {p.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.description}</div>}
                    </td>
                    <td className="px-4 py-3 capitalize text-sm">{p.type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${levelColor(p.level)}`}>
                        {p.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{p.ageGroup}</td>
                    <td className="px-4 py-3 text-sm">
                      {p.enrolledCount !== undefined ? `${p.enrolledCount}/` : ''}{p.capacity}
                    </td>
                    <td className="px-4 py-3 text-sm">${p.price}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button id="btn-admin-programs-catalog-3" onClick={() => startEdit(p)} className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm rounded hover:bg-blue-50" title="Edit">
                          Edit
                        </button>
                        <button id="btn-admin-programs-catalog-4" onClick={() => toggleStatus(p)} className="text-yellow-600 hover:text-yellow-800 px-2 py-1 text-sm rounded hover:bg-yellow-50" title="Toggle Status">
                          {p.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button id="btn-admin-programs-catalog-5" onClick={() => duplicateProgram(p)} className="text-green-600 hover:text-green-800 px-2 py-1 text-sm rounded hover:bg-green-50" title="Duplicate">
                          Duplicate
                        </button>
                        <button id="btn-admin-programs-catalog-6" onClick={() => setDeleteTarget(p)} className="text-red-600 hover:text-red-800 px-2 py-1 text-sm rounded hover:bg-red-50" title="Delete">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <button id="btn-admin-programs-catalog-7"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button id="btn-admin-programs-catalog-8"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button id="btn-admin-programs-catalog-9" onClick={() => setDeleteTarget(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button id="btn-admin-programs-catalog-10" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
