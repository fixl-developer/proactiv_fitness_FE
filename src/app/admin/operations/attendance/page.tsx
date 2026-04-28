'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, ClipboardCheck } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { AttendanceService } from '@/services/operationsService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import {
  validateRequired,
  validateSelect,
  validateTextArea,
} from '@/utils/validation'

// Backend stores attendance with `personId` (student) and `classId` — both are
// free-form strings (not Mongo ObjectIds), so accept any letter/digit identifier.
const ID_PATTERN = /^[A-Za-z0-9_-]+$/
const STATUSES = ['present', 'absent', 'late']

interface AttendanceRecord {
  id: string
  studentId: string
  classId: string
  date: string
  status: 'present' | 'absent' | 'late'
  notes?: string
  checkInTime?: string
  createdAt?: string
}

export default function AttendanceTrackingPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    date: '',
    status: 'present' as 'present' | 'absent' | 'late',
    notes: '',
    checkInTime: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadRecords = async () => {
    try {
      setLoading(true)
      const response: any = await AttendanceService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        date: dateFilter,
      })
      setRecords(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading attendance records:', error)
      toast.error('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [currentPage, searchTerm, dateFilter])

  const validateFormData = () => {
    const e: Record<string, string> = {}

    const studentErr = validateRequired(formData.studentId, 'Student ID')
    if (studentErr) e.studentId = studentErr
    else if (!ID_PATTERN.test(formData.studentId.trim())) {
      e.studentId = 'Student ID can only contain letters, digits, hyphens and underscores'
    } else if (formData.studentId.trim().length < 2) {
      e.studentId = 'Student ID must be at least 2 characters'
    }

    const classErr = validateRequired(formData.classId, 'Class ID')
    if (classErr) e.classId = classErr
    else if (!ID_PATTERN.test(formData.classId.trim())) {
      e.classId = 'Class ID can only contain letters, digits, hyphens and underscores'
    } else if (formData.classId.trim().length < 2) {
      e.classId = 'Class ID must be at least 2 characters'
    }

    const dateErr = validateRequired(formData.date, 'Date')
    if (dateErr) e.date = dateErr
    else {
      const d = new Date(formData.date)
      if (isNaN(d.getTime())) e.date = 'Please enter a valid date'
      else if (d > new Date(Date.now() + 24 * 60 * 60 * 1000)) e.date = 'Date cannot be in the future'
    }

    const statusErr = validateSelect(formData.status, 'Status')
    if (statusErr) e.status = statusErr

    if (formData.checkInTime && !/^\d{2}:\d{2}$/.test(formData.checkInTime)) {
      e.checkInTime = 'Check-in time must be in HH:MM format'
    }

    if (formData.notes) {
      const notesErr = validateTextArea(formData.notes, 'Notes', 0, 500)
      if (notesErr) e.notes = notesErr
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validateFormData()) {
      toast.error('Please fix the highlighted fields')
      return
    }

    try {
      setSubmitting(true)
      const submitData = {
        studentId: formData.studentId.trim(),
        classId: formData.classId.trim(),
        date: formData.date,
        status: formData.status,
        notes: formData.notes,
        checkInTime: formData.checkInTime,
      }

      if (editingId) {
        await AttendanceService.update(editingId, submitData)
        toast.success('Attendance record updated successfully')
      } else {
        await AttendanceService.create(submitData)
        toast.success('Attendance record created successfully')
      }

      setShowForm(false)
      resetForm()
      loadRecords()
    } catch (error) {
      console.error('Error saving attendance record:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (record: AttendanceRecord) => {
    setFormData({
      studentId: record.studentId,
      classId: record.classId,
      date: record.date ? new Date(record.date).toISOString().slice(0, 10) : '',
      status: record.status,
      notes: record.notes || '',
      checkInTime: record.checkInTime || '',
    })
    setEditingId(record.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await AttendanceService.delete(id)
      toast.success('Attendance record deleted successfully')
      setDeleteConfirm(null)
      loadRecords()
    } catch (error) {
      console.error('Error deleting attendance record:', error)
      toast.error(getErrorMessage(error))
    }
  }

  const resetForm = () => {
    setFormData({ studentId: '', classId: '', date: '', status: 'present', notes: '', checkInTime: '' })
    setErrors({})
    setEditingId(null)
  }

  const handleCloseDrawer = () => { setShowForm(false); resetForm() }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardCheck className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Attendance Tracking</h1>
          </div>
          <p className="text-slate-600">Track and manage student attendance records</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Search records..."
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <input type="date" value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1) }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            Add Record
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading attendance records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No attendance records found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Student ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Class ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Check-In</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Notes</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{record.studentId}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{record.classId}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(record.status)}`}>{record.status}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{record.checkInTime || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{record.notes || '-'}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(record)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(record.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
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
                <p className="text-sm text-slate-600">Page {currentPage} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        <SlideInDrawer isOpen={showForm} onClose={handleCloseDrawer}
          title={editingId ? 'Edit Attendance Record' : 'Add New Attendance Record'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Student ID <span className="text-red-500">*</span>
              </label>
              <input type="text" value={formData.studentId} maxLength={64}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '' || ID_PATTERN.test(v)) {
                    setFormData({ ...formData, studentId: v })
                    if (errors.studentId) setErrors({ ...errors, studentId: '' })
                  }
                }}
                placeholder="e.g. STU-12345"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.studentId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.studentId
                ? <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
                : <p className="mt-1 text-xs text-slate-500">Letters, digits, hyphens and underscores only</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Class ID <span className="text-red-500">*</span>
              </label>
              <input type="text" value={formData.classId} maxLength={64}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '' || ID_PATTERN.test(v)) {
                    setFormData({ ...formData, classId: v })
                    if (errors.classId) setErrors({ ...errors, classId: '' })
                  }
                }}
                placeholder="e.g. CLS-67890"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.classId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.classId
                ? <p className="mt-1 text-sm text-red-600">{errors.classId}</p>
                : <p className="mt-1 text-xs text-slate-500">Letters, digits, hyphens and underscores only</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input type="date" value={formData.date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => { setFormData({ ...formData, date: e.target.value }); if (errors.date) setErrors({ ...errors, date: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select value={formData.status}
                onChange={(e) => { setFormData({ ...formData, status: e.target.value as any }); if (errors.status) setErrors({ ...errors, status: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}>
                <option value="">Select Status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Check-In Time (Optional)</label>
              <input type="time" value={formData.checkInTime}
                onChange={(e) => { setFormData({ ...formData, checkInTime: e.target.value }); if (errors.checkInTime) setErrors({ ...errors, checkInTime: '' }) }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.checkInTime ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.checkInTime && <p className="mt-1 text-sm text-red-600">{errors.checkInTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Notes (Optional)</label>
              <textarea value={formData.notes} rows={4} maxLength={500}
                onChange={(e) => { setFormData({ ...formData, notes: e.target.value }); if (errors.notes) setErrors({ ...errors, notes: '' }) }}
                placeholder="Optional notes..."
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${errors.notes ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`} />
              {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button type="button" onClick={handleCloseDrawer}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                {submitting ? 'Saving...' : editingId ? 'Update Record' : 'Create Record'}
              </button>
            </div>
          </form>
        </SlideInDrawer>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Attendance Record?</h3>
              <p className="text-slate-600 mb-6">This action cannot be undone. The attendance record will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
