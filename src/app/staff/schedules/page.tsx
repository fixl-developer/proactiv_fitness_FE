'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import { AlertCircle, Plus, Calendar, Sun, Sunset, CheckCircle, Edit2, Trash2, RefreshCw } from 'lucide-react'
import { validateRequired, validateName, filterNameInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { toast } from 'sonner'

interface Schedule {
    id: string
    scheduleId?: string
    staffName: string
    date: string
    startTime: string
    endTime: string
    shiftType: string
    status: string
    location: string
}

const emptyForm = {
    staffName: '',
    date: '',
    startTime: '',
    endTime: '',
    shiftType: 'morning',
    location: '',
    status: 'pending',
}

const SHIFT_TYPES = ['morning', 'evening', 'night', 'full-day'] as const
const STATUSES = ['confirmed', 'pending', 'cancelled'] as const

export default function Schedules() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [submitting, setSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const loadSchedules = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await supportStaffService.getSchedules()
            setSchedules(data?.schedules || [])
        } catch (err: any) {
            setSchedules([])
            setError(err?.response?.data?.message || 'Failed to load schedules')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        loadSchedules()
    }, [isAuthenticated, router])

    const morningCount = schedules.filter(s => s.shiftType === 'morning').length
    const eveningCount = schedules.filter(s => s.shiftType === 'evening').length
    const confirmedCount = schedules.filter(s => s.status === 'confirmed').length

    const validateForm = (): Record<string, string> => {
        const errs: Record<string, string> = {}
        const sn = validateName(form.staffName, 'Staff Name'); if (sn) errs.staffName = sn
        if (!form.date) errs.date = 'Date is required'
        if (!form.startTime) errs.startTime = 'Start time is required'
        if (!form.endTime) errs.endTime = 'End time is required'
        if (form.startTime && form.endTime && form.startTime >= form.endTime) errs.endTime = 'End time must be after start time'
        const loc = validateRequired(form.location, 'Location'); if (loc) errs.location = loc
        return errs
    }

    const openCreate = () => {
        setEditingId(null)
        setForm(emptyForm)
        setFormErrors({})
        setDrawerOpen(true)
    }

    const openEdit = (schedule: Schedule) => {
        setEditingId(schedule.scheduleId || schedule.id)
        setForm({
            staffName: schedule.staffName || '',
            date: schedule.date || '',
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || '',
            shiftType: schedule.shiftType || 'morning',
            location: schedule.location || '',
            status: schedule.status || 'pending',
        })
        setFormErrors({})
        setDrawerOpen(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        // Clear errors for this field
        setFormErrors(prev => { const n = { ...prev }; delete n[name]; return n })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validateForm()
        setFormErrors(errs)
        if (Object.keys(errs).length > 0) return
        setSubmitting(true)
        try {
            const payload = { ...form, staffName: form.staffName.trim(), location: form.location.trim() }
            if (editingId) {
                await supportStaffService.updateSchedule(editingId, payload)
                toast.success('Schedule updated')
            } else {
                await supportStaffService.createSchedule(payload)
                toast.success('Schedule created')
            }
            setDrawerOpen(false)
            setForm(emptyForm)
            setEditingId(null)
            await loadSchedules()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save schedule')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (schedule: Schedule) => {
        if (!confirm(`Delete this schedule for ${schedule.staffName}?`)) return
        try {
            const id = schedule.scheduleId || schedule.id
            await (supportStaffService as any).deleteSchedule(id)
            toast.success('Schedule deleted')
            await loadSchedules()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to delete schedule')
        }
    }

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
        }
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        )
    }

    if (!isAuthenticated) return null

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Staff Schedules</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage support team work shifts</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={loadSchedules}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            id="staff-schedules-btn-create"
                            onClick={openCreate}
                            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 inline-flex items-center gap-2 text-sm font-medium shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> New Schedule
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Schedules</p>
                        <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Sun className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Morning Shifts</p>
                        <p className="text-2xl font-bold text-gray-900">{morningCount}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Sunset className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Evening Shifts</p>
                        <p className="text-2xl font-bold text-gray-900">{eveningCount}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Confirmed</p>
                        <p className="text-2xl font-bold text-gray-900">{confirmedCount}</p>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Staff Name</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Date</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Start Time</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">End Time</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Shift Type</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Status</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Location</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">
                                            No schedules found. Click &quot;New Schedule&quot; to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    schedules.map((schedule) => (
                                        <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-6 text-gray-900 font-medium text-sm">{schedule.staffName}</td>
                                            <td className="py-3 px-6 text-gray-600 text-sm">{schedule.date}</td>
                                            <td className="py-3 px-6 text-gray-600 text-sm">{schedule.startTime}</td>
                                            <td className="py-3 px-6 text-gray-600 text-sm">{schedule.endTime}</td>
                                            <td className="py-3 px-6 text-gray-600 text-sm capitalize">{schedule.shiftType}</td>
                                            <td className="py-3 px-6">{statusBadge(schedule.status)}</td>
                                            <td className="py-3 px-6 text-gray-600 text-sm">{schedule.location}</td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEdit(schedule)}
                                                        className="text-cyan-600 hover:text-cyan-800 inline-flex items-center gap-1 text-sm"
                                                    >
                                                        <Edit2 className="w-4 h-4" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(schedule)}
                                                        className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CREATE / EDIT DRAWER (right side) */}
            <SlideInDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditingId(null); setForm(emptyForm); setFormErrors({}) }}
                title={editingId ? 'Edit Schedule' : 'New Schedule'}
                description={editingId ? 'Update the schedule details below' : 'Add a new staff shift'}
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setDrawerOpen(false); setForm(emptyForm); setEditingId(null) }}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                        >Cancel</button>
                        <button
                            type="submit"
                            form="schedule-form"
                            disabled={submitting}
                            className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 inline-flex items-center gap-2 text-sm font-medium"
                        >
                            {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                            {submitting ? 'Saving…' : (editingId ? 'Save Changes' : 'Create Schedule')}
                        </button>
                    </div>
                }
            >
                <form id="schedule-form" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="staffName"
                            value={form.staffName}
                            onKeyDown={filterNameInput}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.staffName ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Staff member's full name"
                        />
                        <FormFieldHint hint={FORMAT_HINTS.name} error={formErrors.staffName} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint="" error={formErrors.date} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time <span className="text-red-500">*</span></label>
                            <input
                                type="time"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.startTime ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint="" error={formErrors.startTime} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time <span className="text-red-500">*</span></label>
                            <input
                                type="time"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.endTime ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint="" error={formErrors.endTime} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type <span className="text-red-500">*</span></label>
                        <select
                            name="shiftType"
                            value={form.shiftType}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
                        >
                            {SHIFT_TYPES.map(s => <option key={s} value={s} className="capitalize">{s.replace('-', ' ')}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g. Main Office, Remote"
                        />
                        <FormFieldHint hint="" error={formErrors.location} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
                        >
                            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                    </div>
                </form>
            </SlideInDrawer>
        </div>
    )
}
