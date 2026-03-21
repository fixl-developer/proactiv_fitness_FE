'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import {
  Calendar, CheckCircle, Clock, AlertTriangle, X, Plus, Loader2,
  RotateCcw, Trash2, Send, Search, ChevronDown, MapPin, User, BookOpen
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────
interface Schedule {
  _id: string
  name: string
  programId: string
  programName?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  instructor: string
  room: string
  locationId?: string
  locationName?: string
  status: 'draft' | 'published' | 'archived'
  conflicts?: Conflict[]
  createdAt?: string
}

interface Conflict {
  type: string
  message: string
  scheduleIds: string[]
}

interface SelectOption {
  _id: string
  name: string
}

interface GenerateFormData {
  termId: string
  programIds: string[]
  locationIds: string[]
  startDate: string
  endDate: string
  settings: {
    maxSessionsPerDay: number
    minBreakBetweenSessions: number
    preferredStartTime: string
    preferredEndTime: string
    avoidWeekends: boolean
  }
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7)

// ── Component ──────────────────────────────────────────────────────────────
export default function ProgramSchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Dropdown data
  const [programs, setPrograms] = useState<SelectOption[]>([])
  const [locations, setLocations] = useState<SelectOption[]>([])
  const [terms, setTerms] = useState<SelectOption[]>([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)

  // Form state
  const [form, setForm] = useState<GenerateFormData>({
    termId: '',
    programIds: [],
    locationIds: [],
    startDate: '',
    endDate: '',
    settings: {
      maxSessionsPerDay: 6,
      minBreakBetweenSessions: 15,
      preferredStartTime: '08:00',
      preferredEndTime: '18:00',
      avoidWeekends: false,
    },
  })

  // ── Load schedules ─────────────────────────────────────────────────────
  const loadSchedules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res: any = await apiClient.get('/scheduling')
      const raw = res?.data ?? res?.schedules ?? res
      const list = Array.isArray(raw) ? raw : []
      setSchedules(list.map((s: any) => ({
        _id: s._id || s.id || '',
        name: s.name || s.sessionName || '',
        programId: s.programId || '',
        programName: s.programName || s.program?.name || s.name || '',
        dayOfWeek: Number(s.dayOfWeek) || 0,
        startTime: s.startTime || '09:00',
        endTime: s.endTime || '10:00',
        instructor: s.instructor || s.coachName || s.coach?.name || '',
        room: s.room || s.roomName || '',
        locationId: s.locationId || '',
        locationName: s.locationName || s.location?.name || '',
        status: s.status || 'draft',
        conflicts: s.conflicts || [],
        createdAt: s.createdAt || '',
      })))
    } catch (err: any) {
      console.error('Failed to load schedules:', err)
      setError('Failed to load schedules. Please ensure the backend is running.')
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSchedules()
  }, [loadSchedules])

  // ── Load dropdown data for generate form ────────────────────────────────
  const loadDropdownData = useCallback(async () => {
    setLoadingDropdowns(true)
    try {
      const [programsRes, locationsRes, termsRes] = await Promise.allSettled([
        apiClient.get('/programs'),
        apiClient.get('/locations'),
        apiClient.get('/terms'),
      ])

      if (programsRes.status === 'fulfilled') {
        const d: any = programsRes.value
        const list = d?.data || d || []
        setPrograms(Array.isArray(list) ? list.map((p: any) => ({ _id: p._id || p.id, name: p.name })).filter((p: any) => p._id) : [])
      }
      if (locationsRes.status === 'fulfilled') {
        const d: any = locationsRes.value
        const list = d?.data || d || []
        setLocations(Array.isArray(list) ? list.map((l: any) => ({ _id: l._id || l.id, name: l.name })).filter((l: any) => l._id) : [])
      }
      if (termsRes.status === 'fulfilled') {
        const d: any = termsRes.value
        const list = d?.data || d || []
        setTerms(Array.isArray(list) ? list.map((t: any) => ({ _id: t._id || t.id, name: t.name || t.termName })).filter((t: any) => t._id) : [])
      }
    } catch {
      // Partial data is fine
    }
    setLoadingDropdowns(false)
  }, [])

  // ── Generate schedule ──────────────────────────────────────────────────
  const handleGenerate = async () => {
    // Validation
    if (!form.startDate || !form.endDate) {
      toast.error('Start date and end date are required')
      return
    }
    if (form.programIds.length === 0) {
      toast.error('Select at least one program')
      return
    }
    if (form.locationIds.length === 0) {
      toast.error('Select at least one location')
      return
    }

    setGenerating(true)
    try {
      const payload = {
        termId: form.termId || undefined,
        programIds: form.programIds,
        locationIds: form.locationIds,
        startDate: form.startDate,
        endDate: form.endDate,
        settings: form.settings,
      }
      await apiClient.post('/scheduling/generate', payload)
      toast.success('Schedule generated successfully!')
      setShowGenerateModal(false)
      resetForm()
      loadSchedules()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to generate schedule'
      toast.error(msg)
    } finally {
      setGenerating(false)
    }
  }

  const resetForm = () => {
    setForm({
      termId: '',
      programIds: [],
      locationIds: [],
      startDate: '',
      endDate: '',
      settings: {
        maxSessionsPerDay: 6,
        minBreakBetweenSessions: 15,
        preferredStartTime: '08:00',
        preferredEndTime: '18:00',
        avoidWeekends: false,
      },
    })
  }

  // ── Publish ────────────────────────────────────────────────────────────
  const handlePublish = async (s: Schedule) => {
    try {
      await apiClient.post(`/scheduling/${s._id}/publish`)
      toast.success(`"${s.programName || s.name}" published`)
      loadSchedules()
    } catch {
      toast.error('Failed to publish schedule')
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/scheduling/${id}`)
      toast.success('Schedule deleted')
      setShowDeleteConfirm(null)
      loadSchedules()
    } catch {
      toast.error('Failed to delete schedule')
    }
  }

  // ── Detect conflicts ──────────────────────────────────────────────────
  const handleDetectConflicts = async (s: Schedule) => {
    try {
      const res: any = await apiClient.post(`/scheduling/${s._id}/detect-conflicts`)
      const conflicts: Conflict[] = res?.conflicts ?? res?.data ?? []
      if (conflicts.length === 0) {
        toast.success('No conflicts detected')
      } else {
        toast.warning(`${conflicts.length} conflict(s) detected`)
      }
      setSchedules((prev) =>
        prev.map((item) => (item._id === s._id ? { ...item, conflicts } : item))
      )
    } catch {
      toast.error('Failed to detect conflicts')
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  const statusColor = (s: string) => {
    switch (s) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getSchedulesForDayHour = (day: number, hour: number): Schedule[] => {
    return schedules.filter((s) => {
      if (s.dayOfWeek !== day) return false
      const startH = parseInt(s.startTime.split(':')[0], 10)
      const endH = parseInt(s.endTime.split(':')[0], 10)
      return hour >= startH && hour < endH
    })
  }

  const scheduleColors = [
    'bg-blue-100 border-blue-400 text-blue-800',
    'bg-green-100 border-green-400 text-green-800',
    'bg-purple-100 border-purple-400 text-purple-800',
    'bg-orange-100 border-orange-400 text-orange-800',
    'bg-pink-100 border-pink-400 text-pink-800',
    'bg-teal-100 border-teal-400 text-teal-800',
  ]

  const getColorForSchedule = (id: string) => {
    const idx = schedules.findIndex((s) => s._id === id)
    return scheduleColors[idx % scheduleColors.length]
  }

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]

  const openGenerateModal = () => {
    loadDropdownData()
    setShowGenerateModal(true)
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3"
        >
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
          <button data-testid="btn-admin-programs-schedule-1" onClick={loadSchedules} className="ml-auto text-red-700 hover:text-red-900">
            <RotateCcw className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Program Schedule</h1>
        <div className="flex gap-3">
          <div className="flex border rounded-lg overflow-hidden">
            <button data-testid="btn-admin-programs-schedule-2"
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Calendar
            </button>
            <button data-testid="btn-admin-programs-schedule-3"
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              List
            </button>
          </div>
          <button data-testid="btn-admin-programs-schedule-4"
            onClick={openGenerateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
          >
            <Plus className="h-4 w-4" /> Generate Schedule
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Sessions', value: schedules.length, icon: Calendar, gradient: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-blue-100' },
          { label: 'Published', value: schedules.filter((s) => s.status === 'published').length, icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-emerald-100' },
          { label: 'Drafts', value: schedules.filter((s) => s.status === 'draft').length, icon: Clock, gradient: 'from-yellow-500 to-yellow-600', bg: 'from-yellow-50 to-yellow-100' },
          { label: 'With Conflicts', value: schedules.filter((s) => s.conflicts && s.conflicts.length > 0).length, icon: AlertTriangle, gradient: 'from-red-500 to-red-600', bg: 'from-red-50 to-red-100' },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className={`rounded-lg border-0 bg-gradient-to-br ${card.bg} p-4 hover:shadow-lg transition-all`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`bg-gradient-to-br ${card.gradient} p-2.5 rounded-lg shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-medium mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-500">Loading schedules...</span>
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-4">No schedules found. Click &quot;Generate Schedule&quot; to create one.</p>
          <button data-testid="btn-admin-programs-schedule-5"
            onClick={openGenerateModal}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Generate Schedule
          </button>
        </div>
      ) : viewMode === 'calendar' ? (
        /* ── Weekly Calendar View ──────────────────────────────────────── */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-3 text-sm font-semibold text-gray-600 w-20">Time</th>
                  {DAYS.map((d) => (
                    <th key={d} className="border px-2 py-3 text-sm font-semibold text-gray-600">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour} className="hover:bg-gray-50/50">
                    <td className="border px-2 py-2 text-xs text-gray-500 text-center font-medium whitespace-nowrap">
                      {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                    </td>
                    {DAYS.map((_, dayIdx) => {
                      const items = getSchedulesForDayHour(dayIdx, hour)
                      return (
                        <td key={dayIdx} className="border px-1 py-1 align-top h-16">
                          {items.map((s) => {
                            const startH = parseInt(s.startTime.split(':')[0], 10)
                            if (startH !== hour) return null
                            return (
                              <div key={s._id} className={`rounded border-l-4 px-2 py-1 text-xs mb-1 ${getColorForSchedule(s._id)}`}>
                                <div className="font-semibold truncate">{s.programName || s.name}</div>
                                <div className="opacity-75">{s.startTime} - {s.endTime}</div>
                                <div className="opacity-75 truncate">{s.instructor} · {s.room}</div>
                                {s.conflicts && s.conflicts.length > 0 && (
                                  <div className="text-red-600 font-semibold mt-0.5">Conflict!</div>
                                )}
                              </div>
                            )
                          })}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── List View ─────────────────────────────────────────────────── */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Session</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Day</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Instructor</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Room</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {schedules.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{s.programName || s.name}</div>
                      {s.locationName && <div className="text-xs text-gray-500">{s.locationName}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm">{DAYS[s.dayOfWeek] || '-'}</td>
                    <td className="px-4 py-3 text-sm">{s.startTime} - {s.endTime}</td>
                    <td className="px-4 py-3 text-sm">{s.instructor || '-'}</td>
                    <td className="px-4 py-3 text-sm">{s.room || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor(s.status)}`}>
                        {s.status}
                      </span>
                      {s.conflicts && s.conflicts.length > 0 && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {s.conflicts.length} conflict(s)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {s.status === 'draft' && (
                          <button data-testid="btn-admin-programs-schedule-6" onClick={() => handlePublish(s)} className="text-green-600 hover:text-green-800 px-2 py-1 text-sm rounded hover:bg-green-50 flex items-center gap-1">
                            <Send className="h-3 w-3" /> Publish
                          </button>
                        )}
                        <button data-testid="btn-admin-programs-schedule-7" onClick={() => handleDetectConflicts(s)} className="text-yellow-600 hover:text-yellow-800 px-2 py-1 text-sm rounded hover:bg-yellow-50">
                          Check
                        </button>
                        <button data-testid="btn-admin-programs-schedule-8" onClick={() => setShowDeleteConfirm(s._id)} className="text-red-600 hover:text-red-800 px-2 py-1 text-sm rounded hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Generate Schedule Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Generate Schedule</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Configure and auto-generate class schedules</p>
                </div>
                <button data-testid="btn-admin-programs-schedule-9" onClick={() => setShowGenerateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {loadingDropdowns ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-500">Loading form data...</span>
                </div>
              ) : (
                <div className="px-6 py-5 space-y-6">
                  {/* Term Selection */}
                  {terms.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <BookOpen className="h-4 w-4 inline mr-1.5 text-gray-400" />
                        Term (Optional)
                      </label>
                      <select data-testid="select-admin-programs-schedule-23"
                        value={form.termId}
                        onChange={(e) => setForm({ ...form, termId: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select a term...</option>
                        {terms.map((t) => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input data-testid="input-date-admin-programs-schedule"
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input data-testid="input-date-admin-programs-schedule"
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Programs Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <BookOpen className="h-4 w-4 inline mr-1.5 text-gray-400" />
                      Programs <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-400 ml-2">({form.programIds.length} selected)</span>
                    </label>
                    {programs.length > 0 ? (
                      <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, programIds: form.programIds.length === programs.length ? [] : programs.map((p) => p._id) })}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium mb-1"
                        >
                          {form.programIds.length === programs.length ? 'Deselect All' : 'Select All'}
                        </button>
                        {programs.map((p) => (
                          <label key={p._id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                            <input data-testid="input-checkbox-admin-programs-schedule"
                              type="checkbox"
                              checked={form.programIds.includes(p._id)}
                              onChange={() => setForm({ ...form, programIds: toggleArrayItem(form.programIds, p._id) })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{p.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 border rounded-lg p-3">No programs found. Create programs first.</p>
                    )}
                  </div>

                  {/* Locations Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin className="h-4 w-4 inline mr-1.5 text-gray-400" />
                      Locations <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-400 ml-2">({form.locationIds.length} selected)</span>
                    </label>
                    {locations.length > 0 ? (
                      <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, locationIds: form.locationIds.length === locations.length ? [] : locations.map((l) => l._id) })}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium mb-1"
                        >
                          {form.locationIds.length === locations.length ? 'Deselect All' : 'Select All'}
                        </button>
                        {locations.map((l) => (
                          <label key={l._id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                            <input data-testid="input-checkbox-admin-programs-schedule"
                              type="checkbox"
                              checked={form.locationIds.includes(l._id)}
                              onChange={() => setForm({ ...form, locationIds: toggleArrayItem(form.locationIds, l._id) })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{l.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 border rounded-lg p-3">No locations found. Create locations first.</p>
                    )}
                  </div>

                  {/* Schedule Settings */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Schedule Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Max Sessions / Day</label>
                        <input data-testid="input-number-admin-programs-schedule"
                          type="number"
                          min={1}
                          max={20}
                          value={form.settings.maxSessionsPerDay}
                          onChange={(e) => setForm({ ...form, settings: { ...form.settings, maxSessionsPerDay: Number(e.target.value) } })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Break Between Sessions (min)</label>
                        <input data-testid="input-number-admin-programs-schedule"
                          type="number"
                          min={0}
                          max={120}
                          value={form.settings.minBreakBetweenSessions}
                          onChange={(e) => setForm({ ...form, settings: { ...form.settings, minBreakBetweenSessions: Number(e.target.value) } })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Preferred Start Time</label>
                        <input data-testid="input-time-admin-programs-schedule"
                          type="time"
                          value={form.settings.preferredStartTime}
                          onChange={(e) => setForm({ ...form, settings: { ...form.settings, preferredStartTime: e.target.value } })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Preferred End Time</label>
                        <input data-testid="input-time-admin-programs-schedule"
                          type="time"
                          value={form.settings.preferredEndTime}
                          onChange={(e) => setForm({ ...form, settings: { ...form.settings, preferredEndTime: e.target.value } })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input data-testid="input-checkbox-admin-programs-schedule"
                        type="checkbox"
                        checked={form.settings.avoidWeekends}
                        onChange={(e) => setForm({ ...form, settings: { ...form.settings, avoidWeekends: e.target.checked } })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Avoid scheduling on weekends</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t sticky bottom-0 bg-white">
                <button data-testid="btn-admin-programs-schedule-10"
                  onClick={() => { setShowGenerateModal(false); resetForm() }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button data-testid="btn-admin-programs-schedule-11"
                  onClick={handleGenerate}
                  disabled={generating || loadingDropdowns}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" /> Generate Schedule
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Schedule</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this schedule? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button data-testid="btn-admin-programs-schedule-12"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button data-testid="btn-admin-programs-schedule-13"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
