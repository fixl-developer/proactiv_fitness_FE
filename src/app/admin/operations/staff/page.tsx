'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, UserCheck, GraduationCap, Briefcase } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

// ── Fallback mock data ──────────────────────────────────────────────
const MOCK_STAFF = [
  { _id: 'mock-1', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', role: 'trainer', locationId: { _id: 'loc-1', name: 'Main Gym' }, status: 'active', certifications: ['CPT', 'Yoga'], phone: '555-0101', createdAt: '2025-06-01' },
  { _id: 'mock-2', firstName: 'John', lastName: 'Smith', email: 'john@example.com', role: 'manager', locationId: { _id: 'loc-2', name: 'Downtown' }, status: 'active', certifications: ['MBA'], phone: '555-0102', createdAt: '2025-07-15' },
  { _id: 'mock-3', firstName: 'Emily', lastName: 'Clark', email: 'emily@example.com', role: 'receptionist', locationId: { _id: 'loc-1', name: 'Main Gym' }, status: 'inactive', certifications: [], phone: '555-0103', createdAt: '2025-08-20' },
]

const MOCK_STATS = { totalStaff: 3, activeStaff: 2, trainers: 1, managers: 1 }

// ── Types ───────────────────────────────────────────────────────────
interface StaffMember {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  locationId: any
  status: string
  certifications: string[]
  phone?: string
  createdAt?: string
}

interface StaffStats {
  totalStaff: number
  activeStaff: number
  trainers: number
  managers: number
}

// ── Component ───────────────────────────────────────────────────────
export default function OperationsStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [stats, setStats] = useState<StaffStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiFailed, setApiFailed] = useState(false)

  // Filters
  const [roleFilter, setRoleFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'trainer',
    locationId: '',
    certifications: '',
    phone: '',
  })

  // ── Load data ───────────────────────────────────────────────────
  const loadStaff = useCallback(async () => {
    try {
      const data = await apiClient.get<any>('/staff')
      const raw = data?.data ?? data
      const list = Array.isArray(raw) ? raw : raw?.staff ?? raw?.data ?? []
      setStaff(Array.isArray(list) ? list : [])
      setApiFailed(false)
    } catch (error: any) {
      console.error('Failed to load staff:', error)
      setStaff(MOCK_STAFF)
      setApiFailed(true)
    }
  }, [])

  const loadStats = useCallback(async (staffList?: StaffMember[]) => {
    try {
      const data = await apiClient.get<any>('/staff/statistics/overview')
      const raw = data?.data ?? data
      setStats({
        totalStaff: raw?.totalStaff ?? raw?.total ?? 0,
        activeStaff: raw?.activeStaff ?? raw?.active ?? 0,
        trainers: raw?.trainers ?? raw?.coaches ?? 0,
        managers: raw?.managers ?? 0,
      })
    } catch {
      // Compute from loaded staff if API fails
      const list = staffList || []
      const total = list.length
      const active = list.filter(s => s.status === 'active').length
      const trainers = list.filter(s => s.role === 'trainer' || s.role === 'coach').length
      const managers = list.filter(s => s.role === 'manager' || s.role === 'admin').length
      setStats(total > 0 ? { totalStaff: total, activeStaff: active, trainers, managers } : MOCK_STATS)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadStaff(), loadStats()])
      setLoading(false)
    }
    init()
  }, [loadStaff, loadStats])

  // ── Create / Edit ─────────────────────────────────────────────
  const openCreate = () => {
    setEditingStaff(null)
    setForm({ firstName: '', lastName: '', email: '', role: 'trainer', locationId: '', certifications: '', phone: '' })
    setShowModal(true)
  }

  const openEdit = (s: StaffMember) => {
    setEditingStaff(s)
    setForm({
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      role: s.role,
      locationId: typeof s.locationId === 'object' ? s.locationId?._id ?? '' : s.locationId ?? '',
      certifications: (s.certifications ?? []).join(', '),
      phone: s.phone ?? '',
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error('First name, last name and email are required')
      return
    }
    setSubmitting(true)
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: form.role,
      locationId: form.locationId || undefined,
      certifications: form.certifications.split(',').map((c) => c.trim()).filter(Boolean),
      phone: form.phone || undefined,
    }

    try {
      if (editingStaff) {
        await apiClient.put(`/staff/${editingStaff._id}`, payload)
        toast.success('Staff member updated successfully')
      } else {
        await apiClient.post('/staff', payload)
        toast.success('Staff member created successfully')
      }
      setShowModal(false)
      await loadStaff()
      await loadStats()
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || 'Operation failed'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Filtering ─────────────────────────────────────────────────
  const filteredStaff = staff.filter((s) => {
    if (roleFilter && s.role !== roleFilter) return false
    if (statusFilter && s.status !== statusFilter) return false
    if (locationFilter) {
      const locId = typeof s.locationId === 'object' ? s.locationId?._id : s.locationId
      if (locId !== locationFilter) return false
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase()
      if (!fullName.includes(q) && !s.email.toLowerCase().includes(q)) return false
    }
    return true
  })

  const uniqueRoles = [...new Set(staff.map((s) => s.role))].filter(Boolean)
  const uniqueLocations = staff.reduce<{ id: string; name: string }[]>((acc, s) => {
    const id = typeof s.locationId === 'object' ? s.locationId?._id : s.locationId
    const name = typeof s.locationId === 'object' ? s.locationId?.name : s.locationId
    if (id && !acc.find((l) => l.id === id)) acc.push({ id, name: name ?? id })
    return acc
  }, [])

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Add Staff
        </button>
      </div>

      {/* API warning banner */}
      {apiFailed && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-sm">
          Unable to reach the staff API. Showing fallback demo data.
        </div>
      )}

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Staff', value: stats.totalStaff, icon: Users, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
            { label: 'Active Staff', value: stats.activeStaff, icon: UserCheck, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
            { label: 'Trainers', value: stats.trainers, icon: GraduationCap, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
            { label: 'Managers', value: stats.managers, icon: Briefcase, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input
            type="text"
            placeholder="Name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Roles</option>
            {uniqueRoles.map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Locations</option>
            {uniqueLocations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading staff...</div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">No staff members match your filters.</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600">Certifications</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStaff.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">{s.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{typeof s.locationId === 'object' ? s.locationId?.name : s.locationId ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{(s.certifications ?? []).join(', ') || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="trainer">Trainer</option>
                    <option value="manager">Manager</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Location ID</label>
                  <input type="text" value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })} placeholder="e.g. loc-1" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Certifications (comma-separated)</label>
                <input type="text" value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} placeholder="CPT, Yoga, Pilates" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 text-sm font-medium">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50">
                {submitting ? 'Saving...' : editingStaff ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
