'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import { AlertCircle, Plus, Calendar, Sun, Sunset, CheckCircle, X, Edit2 } from 'lucide-react'

interface Schedule {
    id: string
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

export default function Schedules() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [showNewModal, setShowNewModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
    const [formData, setFormData] = useState(emptyForm)
    const [submitting, setSubmitting] = useState(false)

    const loadSchedules = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await supportStaffService.getSchedules()
            setSchedules(data?.schedules || [])
        } catch {
            setSchedules([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadSchedules()
    }, [isAuthenticated, router])

    const morningCount = schedules.filter(s => s.shiftType === 'morning').length
    const eveningCount = schedules.filter(s => s.shiftType === 'evening').length
    const confirmedCount = schedules.filter(s => s.status === 'confirmed').length

    const handleOpenNew = () => {
        setFormData(emptyForm)
        setShowNewModal(true)
    }

    const handleOpenEdit = (schedule: Schedule) => {
        setEditingSchedule(schedule)
        setFormData({
            staffName: schedule.staffName,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            shiftType: schedule.shiftType,
            location: schedule.location,
            status: schedule.status,
        })
        setShowEditModal(true)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await supportStaffService.createSchedule(formData)
            setShowNewModal(false)
            await loadSchedules()
        } catch {
            setError('Failed to create schedule.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingSchedule) return
        setSubmitting(true)
        try {
            await supportStaffService.updateSchedule(editingSchedule.id, formData)
            setShowEditModal(false)
            setEditingSchedule(null)
            await loadSchedules()
        } catch {
            setError('Failed to update schedule.')
        } finally {
            setSubmitting(false)
        }
    }

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
        }
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        )
    }

    const renderFormFields = () => (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
                <input
                    type="text"
                    name="staffName"
                    value={formData.staffName}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                <select
                    name="shiftType"
                    value={formData.shiftType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                    <option value="full-day">Full Day</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </>
    )

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Staff Schedules</h1>
                    <button
                        id="staff-schedules-new-btn"
                        onClick={handleOpenNew}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Schedule
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Schedules */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Schedules</p>
                        <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
                    </div>

                    {/* Morning Shifts */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                <Sun className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Morning Shifts</p>
                        <p className="text-2xl font-bold text-gray-900">{morningCount}</p>
                    </div>

                    {/* Evening Shifts */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                <Sunset className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Evening Shifts</p>
                        <p className="text-2xl font-bold text-gray-900">{eveningCount}</p>
                    </div>

                    {/* Confirmed */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-emerald-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Confirmed</p>
                        <p className="text-2xl font-bold text-gray-900">{confirmedCount}</p>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading schedules...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Staff Name</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Date</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Start Time</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">End Time</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Shift Type</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Location</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-gray-500">
                                            No schedules found. Click &quot;New Schedule&quot; to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    schedules.map((schedule) => (
                                        <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-6 text-gray-900 font-medium">{schedule.staffName}</td>
                                            <td className="py-3 px-6 text-gray-600">{schedule.date}</td>
                                            <td className="py-3 px-6 text-gray-600">{schedule.startTime}</td>
                                            <td className="py-3 px-6 text-gray-600">{schedule.endTime}</td>
                                            <td className="py-3 px-6 text-gray-600 capitalize">{schedule.shiftType}</td>
                                            <td className="py-3 px-6">{statusBadge(schedule.status)}</td>
                                            <td className="py-3 px-6 text-gray-600">{schedule.location}</td>
                                            <td className="py-3 px-6">
                                                <button
                                                    id={`staff-schedules-edit-${schedule.id}-btn`}
                                                    onClick={() => handleOpenEdit(schedule)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* New Schedule Modal */}
            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">New Schedule</h2>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {renderFormFields()}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowNewModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? 'Creating...' : 'Create Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Schedule Modal */}
            {showEditModal && editingSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Edit Schedule</h2>
                            <button
                                onClick={() => { setShowEditModal(false); setEditingSchedule(null) }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            {renderFormFields()}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditModal(false); setEditingSchedule(null) }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? 'Updating...' : 'Update Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
