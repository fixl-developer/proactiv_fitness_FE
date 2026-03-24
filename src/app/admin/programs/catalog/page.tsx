'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

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

const EMPTY_FORM: Omit<Program, '_id'> = {
  name: '',
  type: 'gymnastics',
  level: 'beginner',
  ageGroup: '',
  description: '',
  capacity: 15,
  price: 0,
  status: 'active',
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
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

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
      const raw = res?.data ?? res
      const list = Array.isArray(raw) ? raw : raw?.programs ?? raw?.data ?? []
      setPrograms(Array.isArray(list) ? list : [])
      setTotalPages(res?.totalPages ?? raw?.totalPages ?? res?.meta?.totalPages ?? 1)
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

  useEffect(() => {
    loadPrograms()
    loadStats()
  }, [loadPrograms, loadStats])

  // ── Create / Edit ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await apiClient.put(`/programs/${editingId}`, formData)
        toast.success('Program updated successfully')
      } else {
        await apiClient.post('/programs', formData)
        toast.success('Program created successfully')
      }
      resetForm()
      loadPrograms()
      loadStats()
    } catch (err: any) {
      toast.error(editingId ? 'Failed to update program' : 'Failed to create program')
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
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(EMPTY_FORM)
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
            { label: 'Total Programs', value: stats.totalPrograms, color: 'blue' },
            { label: 'Active Programs', value: stats.activePrograms, color: 'green' },
            { label: 'Total Enrolled', value: stats.totalEnrolled, color: 'purple' },
            { label: 'Avg Capacity', value: stats.averageCapacity, color: 'orange' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
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
          <form id="form-admin-programs-catalog" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Program Name</label>
                <input id="input-text-admin-programs-catalog"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select id="select-admin-programs-catalog-19"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="gymnastics">Gymnastics</option>
                  <option value="tumbling">Tumbling</option>
                  <option value="ninja">Ninja</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Age Group</label>
                <input id="input-text-admin-programs-catalog"
                  type="text"
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., 5-7"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Level</label>
                <select id="select-admin-programs-catalog-20"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Capacity</label>
                <input id="input-number-admin-programs-catalog"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price ($)</label>
                <input id="input-number-admin-programs-catalog"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  min={0}
                  step={0.01}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select id="select-admin-programs-catalog-21"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Program['status'] })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
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
                {programs.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
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
