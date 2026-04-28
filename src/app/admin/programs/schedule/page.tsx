'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '@/services/api/client'
import { extractList } from '@/utils/apiResponse'
import { toast } from 'sonner'
import {
  Calendar, CheckCircle, Clock, AlertTriangle, X, Plus, Loader2,
  RotateCcw, Trash2, Send, Search, ChevronDown, MapPin, User, BookOpen,
  Eye, Pencil, Save
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

// Flat session for the calendar — comes from GET /scheduling/all-sessions.
// Each row is one Session, positioned by its real date+time, not the parent
// Schedule's container default.
interface CalSession {
  id: string
  scheduleId: string
  scheduleName: string
  scheduleStatus: string
  date: string
  dayOfWeek: number
  startTime: string
  endTime: string
  programName: string
  locationName: string
  coachName: string
  status: string
  enrolled: number
  capacity: number
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
  const [calSessions, setCalSessions] = useState<CalSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // ── Detail / Edit drawer state ─────────────────────────────────────────
  // `detail` holds the populated schedule (with sessionsList) the backend
  // returns from GET /scheduling/:id. `editMode` toggles between read-only
  // detail panel and the editable form (only `name` + `description` are
  // updatable per the backend's updateScheduleValidation).
  const [detail, setDetail] = useState<any | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [savingDetail, setSavingDetail] = useState(false)

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
      // Fetch schedule containers (for List view + drawer index) and the flat
      // session feed (for Calendar grid) in parallel — each serves a different
      // view and they share no work.
      const [schedRes, sessRes]: any = await Promise.all([
        apiClient.get('/scheduling'),
        apiClient.get('/scheduling/all-sessions').catch(() => ({ data: [] })),
      ])

      const list = extractList<any>(schedRes)
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

      const sessList = (sessRes?.data ?? sessRes ?? []) as any[]
      setCalSessions(Array.isArray(sessList) ? sessList.map((s: any) => ({
        id: String(s.id || s._id || ''),
        scheduleId: String(s.scheduleId || ''),
        scheduleName: s.scheduleName || '',
        scheduleStatus: s.scheduleStatus || '',
        date: s.date || '',
        dayOfWeek: Number(s.dayOfWeek ?? 0),
        startTime: s.startTime || '',
        endTime: s.endTime || '',
        programName: s.programName || '',
        locationName: s.locationName || '',
        coachName: s.coachName || '',
        status: s.status || 'scheduled',
        enrolled: Number(s.enrolled) || 0,
        capacity: Number(s.capacity) || 0,
      })) : [])
    } catch (err: any) {
      console.error('Failed to load schedules:', err)
      setError('Failed to load schedules. Please ensure the backend is running.')
      setSchedules([])
      setCalSessions([])
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

      // /programs returns `{data: {programs: [...], totalCount, filters}}`,
      // /locations returns `{data: {data: [...], pagination}}`,
      // /terms returns `{data: [...]}` — extractList handles all three shapes.
      if (programsRes.status === 'fulfilled') {
        const list = extractList<any>(programsRes.value)
        setPrograms(list.map((p: any) => ({ _id: p._id || p.id, name: p.name })).filter((p: any) => p._id))
      }
      if (locationsRes.status === 'fulfilled') {
        const list = extractList<any>(locationsRes.value)
        setLocations(list.map((l: any) => ({ _id: l._id || l.id, name: l.name })).filter((l: any) => l._id))
      }
      if (termsRes.status === 'fulfilled') {
        const list = extractList<any>(termsRes.value)
        setTerms(list.map((t: any) => ({ _id: t._id || t.id, name: t.name || t.termName })).filter((t: any) => t._id))
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

  // ── Open detail drawer ────────────────────────────────────────────────
  // Click handler shared by calendar block + list row. Fetches the populated
  // schedule (with sessions) so the drawer doesn't show stale list-view data.
  const openDetail = async (id: string) => {
    if (!id) return
    setDetail(null)
    setEditMode(false)
    setDetailLoading(true)
    try {
      const res: any = await apiClient.get(`/scheduling/${id}`)
      const d = res?.data ?? res
      setDetail(d)
      setEditForm({
        name: d?.name || '',
        description: d?.description || '',
      })
    } catch {
      toast.error('Failed to load schedule details')
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setDetail(null)
    setEditMode(false)
    setEditForm({ name: '', description: '' })
  }

  const saveDetail = async () => {
    if (!detail?._id && !detail?.id) return
    if (!editForm.name.trim()) {
      toast.error('Schedule name is required')
      return
    }
    setSavingDetail(true)
    try {
      const id = detail._id || detail.id
      await apiClient.put(`/scheduling/${id}`, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      })
      toast.success('Schedule updated')
      // Reload both the list (so the row reflects new name) and the drawer
      await Promise.all([loadSchedules(), openDetail(id)])
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update schedule'
      toast.error(msg)
    } finally {
      setSavingDetail(false)
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

  // Calendar grid: bucket sessions by their REAL day-of-week + start hour.
  // Multiple session dates that recur on the same day/time stack in one cell
  // — we group identical (programName, scheduleId, startTime, endTime, dayOfWeek)
  // tuples and surface the dates as a comma-separated subtitle.
  type SessionGroup = {
    key: string
    scheduleId: string
    scheduleName: string
    scheduleStatus: string
    programName: string
    coachName: string
    locationName: string
    startTime: string
    endTime: string
    sessionCount: number
    nextDate: string
  }

  const groupSessionsForCell = (day: number, hour: number): SessionGroup[] => {
    const cellSessions = calSessions.filter((s) => {
      if (s.dayOfWeek !== day) return false
      if (!s.startTime) return false
      const startH = parseInt(s.startTime.split(':')[0], 10)
      return startH === hour
    })

    const map = new Map<string, SessionGroup>()
    for (const s of cellSessions) {
      const key = `${s.scheduleId}|${s.programName}|${s.startTime}|${s.endTime}`
      const existing = map.get(key)
      if (!existing) {
        map.set(key, {
          key,
          scheduleId: s.scheduleId,
          scheduleName: s.scheduleName,
          scheduleStatus: s.scheduleStatus,
          programName: s.programName,
          coachName: s.coachName,
          locationName: s.locationName,
          startTime: s.startTime,
          endTime: s.endTime,
          sessionCount: 1,
          nextDate: s.date,
        })
      } else {
        existing.sessionCount += 1
        // keep the earliest date as the "next" representative
        if (!existing.nextDate || (s.date && s.date < existing.nextDate)) existing.nextDate = s.date
      }
    }
    return Array.from(map.values())
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
          <button id="btn-admin-programs-schedule-1" onClick={loadSchedules} className="ml-auto text-red-700 hover:text-red-900">
            <RotateCcw className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Program Schedule</h1>
        <div className="flex gap-3">
          <div className="flex border rounded-lg overflow-hidden">
            <button id="btn-admin-programs-schedule-2"
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Calendar
            </button>
            <button id="btn-admin-programs-schedule-3"
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              List
            </button>
          </div>
          <button id="btn-admin-programs-schedule-4"
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
          <button id="btn-admin-programs-schedule-5"
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
                      const groups = groupSessionsForCell(dayIdx, hour)
                      return (
                        <td key={dayIdx} className="border px-1 py-1 align-top h-16">
                          {groups.map((g) => (
                            <button
                              key={g.key}
                              type="button"
                              onClick={() => openDetail(g.scheduleId)}
                              className={`w-full text-left rounded border-l-4 px-2 py-1 text-xs mb-1 hover:ring-2 hover:ring-blue-300 transition cursor-pointer ${getColorForSchedule(g.scheduleId)}`}
                              title={`${g.programName} — ${g.scheduleName}\n${g.sessionCount} session${g.sessionCount > 1 ? 's' : ''} · click to view details`}
                            >
                              <div className="font-semibold truncate">{g.programName || g.scheduleName || 'Session'}</div>
                              <div className="opacity-75">{g.startTime} - {g.endTime}</div>
                              <div className="opacity-75 truncate">
                                {g.coachName || 'Unassigned'}{g.locationName ? ` · ${g.locationName}` : ''}
                              </div>
                              {g.sessionCount > 1 && (
                                <div className="opacity-75 text-[10px] mt-0.5">
                                  {g.sessionCount}× recurring
                                </div>
                              )}
                            </button>
                          ))}
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
                  <tr key={s._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(s._id)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-blue-700 hover:text-blue-900">{s.programName || s.name}</div>
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
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button id="btn-admin-programs-schedule-view" onClick={() => openDetail(s._id)} className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm rounded hover:bg-blue-50 flex items-center gap-1" title="View / edit details">
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        {s.status === 'draft' && (
                          <button id="btn-admin-programs-schedule-6" onClick={() => handlePublish(s)} className="text-green-600 hover:text-green-800 px-2 py-1 text-sm rounded hover:bg-green-50 flex items-center gap-1">
                            <Send className="h-3 w-3" /> Publish
                          </button>
                        )}
                        <button id="btn-admin-programs-schedule-7" onClick={() => handleDetectConflicts(s)} className="text-yellow-600 hover:text-yellow-800 px-2 py-1 text-sm rounded hover:bg-yellow-50">
                          Check
                        </button>
                        <button id="btn-admin-programs-schedule-8" onClick={() => setShowDeleteConfirm(s._id)} className="text-red-600 hover:text-red-800 px-2 py-1 text-sm rounded hover:bg-red-50">
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
                <button id="btn-admin-programs-schedule-9" onClick={() => setShowGenerateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
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
                      <select id="select-admin-programs-schedule-23"
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
                      <input id="input-date-admin-programs-schedule-start"
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
                      <input id="input-date-admin-programs-schedule"
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
                        <button id="admin-programs-schedule-btn"
                          type="button"
                          onClick={() => setForm({ ...form, programIds: form.programIds.length === programs.length ? [] : programs.map((p) => p._id) })}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium mb-1"
                        >
                          {form.programIds.length === programs.length ? 'Deselect All' : 'Select All'}
                        </button>
                        {programs.map((p) => (
                          <label key={p._id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                            <input id={`input-checkbox-admin-programs-schedule-${p._id}`}
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
                        <button id="admin-programs-schedule-btn-2"
                          type="button"
                          onClick={() => setForm({ ...form, locationIds: form.locationIds.length === locations.length ? [] : locations.map((l) => l._id) })}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium mb-1"
                        >
                          {form.locationIds.length === locations.length ? 'Deselect All' : 'Select All'}
                        </button>
                        {locations.map((l) => (
                          <label key={l._id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                            <input id={`input-checkbox-admin-programs-schedule-${l._id}`}
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
                        <label className="block text-xs text-gray-500 mb-1">Max Sessions Per Day</label>
                        <input id="input-number-admin-programs-schedule-max"
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
                        <input id="input-number-admin-programs-schedule"
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
                        <input id="input-time-admin-programs-schedule"
                          type="time"
                          value={form.settings.preferredStartTime}
                          onChange={(e) => setForm({ ...form, settings: { ...form.settings, preferredStartTime: e.target.value } })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Preferred End Time</label>
                        <input id="input-time-admin-programs-schedule"
                          type="time"
                          value={form.settings.preferredEndTime}
                          onChange={(e) => setForm({ ...form, settings: { ...form.settings, preferredEndTime: e.target.value } })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                      <input id="input-checkbox-admin-programs-schedule"
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
                <button id="btn-admin-programs-schedule-10"
                  onClick={() => { setShowGenerateModal(false); resetForm() }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button id="btn-admin-programs-schedule-11"
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
                <button id="btn-admin-programs-schedule-12"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button id="btn-admin-programs-schedule-13"
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

      {/* ── Detail / Edit Drawer ────────────────────────────────────────── */}
      <AnimatePresence>
        {(detail || detailLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={closeDetail}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editMode ? 'Edit Schedule' : 'Schedule Details'}
                  </h2>
                  {detail && !editMode && (
                    <p className="text-xs text-gray-500 mt-0.5">{detail.id || detail._id}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {detail && !editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                  )}
                  <button onClick={closeDetail} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Close">
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto p-5">
                {detailLoading && (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading…
                  </div>
                )}

                {detail && !editMode && (
                  <div className="space-y-6">
                    {/* Headline + status */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{detail.name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor(detail.status)}`}>
                          {detail.status}
                        </span>
                      </div>
                      {detail.description && (
                        <p className="text-sm text-gray-600">{detail.description}</p>
                      )}
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700 font-medium">Total Sessions</p>
                        <p className="text-2xl font-bold text-blue-900">{detail.totalSessions ?? (detail.sessionsList?.length || 0)}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-700 font-medium">Locations</p>
                        <p className="text-2xl font-bold text-green-900">{(detail.locationNames || []).length || (detail.locationIds || []).length}</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-700 font-medium">Conflicts</p>
                        <p className="text-2xl font-bold text-purple-900">{detail.statistics?.totalConflicts ?? 0}</p>
                      </div>
                    </div>

                    {/* Date range + term */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Start Date</p>
                        <p className="font-medium text-gray-900">{detail.startDate ? new Date(detail.startDate).toLocaleDateString() : '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">End Date</p>
                        <p className="font-medium text-gray-900">{detail.endDate ? new Date(detail.endDate).toLocaleDateString() : '-'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Term</p>
                        <p className="font-medium text-gray-900">{detail.termName || '-'}</p>
                      </div>
                    </div>

                    {/* Locations */}
                    {(detail.locationNames || []).length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> Locations
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {detail.locationNames.map((n: string) => (
                            <span key={n} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">{n}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sessions list */}
                    <div>
                      <p className="text-sm text-gray-700 font-semibold mb-3 flex items-center gap-1">
                        <BookOpen className="h-4 w-4" /> Sessions ({detail.sessionsList?.length || 0})
                      </p>
                      {(!detail.sessionsList || detail.sessionsList.length === 0) ? (
                        <p className="text-sm text-gray-500 italic">No sessions found for this schedule.</p>
                      ) : (
                        <div className="space-y-2">
                          {detail.sessionsList.map((s: any) => (
                            <div key={s.id} className="border rounded-lg p-3 hover:bg-gray-50">
                              <div className="flex items-start justify-between mb-1">
                                <div>
                                  <p className="font-medium text-gray-900">{s.programName || 'Session'}</p>
                                  <p className="text-xs text-gray-500">{s.programType}</p>
                                </div>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${statusColor(s.status)}`}>
                                  {s.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-3 text-xs text-gray-600 mt-2">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3 w-3" />
                                  {s.date ? new Date(s.date).toLocaleDateString() : '-'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  {s.startTime} - {s.endTime}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3" />
                                  {s.locationName || '-'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3 w-3" />
                                  {s.coachName}
                                </div>
                                <div className="col-span-2 text-gray-500 mt-1">
                                  Enrolled: <span className="font-medium text-gray-700">{s.enrolled}/{s.capacity}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {detail && editMode && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                      Only the schedule&apos;s name and description can be edited. To change programs, locations, or dates, delete this schedule and generate a new one.
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        maxLength={100}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        maxLength={500}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer footer (edit mode only) */}
              {detail && editMode && (
                <div className="border-t p-4 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditMode(false)
                      setEditForm({ name: detail.name || '', description: detail.description || '' })
                    }}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={savingDetail}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveDetail}
                    disabled={savingDetail || !editForm.name.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingDetail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {savingDetail ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
