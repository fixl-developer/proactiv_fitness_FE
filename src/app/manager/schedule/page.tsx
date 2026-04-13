'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar, Clock, Users, MapPin, Plus, Search, RefreshCw,
    ChevronLeft, ChevronRight, Eye, Edit, Trash2, X, Save, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface ScheduleItem {
    id: string
    title: string
    coach: string
    time: string
    date: string
    students: number
    capacity: number
    status: string
    location: string
}

const MOCK_SCHEDULE: ScheduleItem[] = [
    { id: '1', title: 'Beginner Gymnastics', coach: 'Sarah Johnson', time: '10:00 AM - 11:00 AM', date: '2024-01-25', students: 8, capacity: 12, status: 'confirmed', location: 'Main Gym' },
    { id: '2', title: 'Advanced Gymnastics', coach: 'Mike Chen', time: '2:00 PM - 3:30 PM', date: '2024-01-25', students: 6, capacity: 8, status: 'confirmed', location: 'Training Area' },
    { id: '3', title: 'Private Coaching', coach: 'Lisa Zhang', time: '4:00 PM - 5:00 PM', date: '2024-01-25', students: 1, capacity: 1, status: 'pending', location: 'Private Room' },
]

const ManagerSchedulePage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>('week')
    const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingSession, setEditingSession] = useState<ScheduleItem | null>(null)
    const [viewingSession, setViewingSession] = useState<ScheduleItem | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        title: '', coach: '', time: '', date: '', capacity: '', location: '', status: 'confirmed'
    })

    const loadSchedule = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true)
            else setIsLoading(true)

            const response = await apiClient.get('/schedules')
            if (response.success && response.data?.length > 0) {
                setScheduleData(response.data.map((s: any) => ({
                    id: s._id || s.id,
                    title: s.title || s.className || '',
                    coach: s.coachName || s.coach || '',
                    time: s.time || `${s.startTime || ''} - ${s.endTime || ''}`,
                    date: s.date || '',
                    students: s.enrolledStudents || s.students || 0,
                    capacity: s.capacity || 0,
                    status: s.status || 'confirmed',
                    location: s.location || ''
                })))
            } else {
                setScheduleData(MOCK_SCHEDULE)
            }
        } catch (error) {
            console.error('Error loading schedule:', error)
            setScheduleData(MOCK_SCHEDULE)
        } finally {
            setIsLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        loadSchedule()
    }, [loadSchedule])

    const handleAddSession = async () => {
        if (!formData.title || !formData.coach || !formData.date) {
            toast.error('Title, coach, and date are required')
            return
        }
        try {
            setIsSaving(true)
            const response = await apiClient.post('/schedules', {
                ...formData,
                capacity: parseInt(formData.capacity) || 0
            })
            if (response.success) {
                toast.success('Class added successfully')
                setShowAddModal(false)
                setFormData({ title: '', coach: '', time: '', date: '', capacity: '', location: '', status: 'confirmed' })
                await loadSchedule()
            } else {
                toast.error(response.message || 'Failed to add class')
            }
        } catch (error: any) {
            console.error('Error adding class:', error)
            toast.error(error?.response?.data?.message || 'Failed to add class')
        } finally {
            setIsSaving(false)
        }
    }

    const handleEditSession = async () => {
        if (!editingSession) return
        try {
            setIsSaving(true)
            const response = await apiClient.put(`/schedules/${editingSession.id}`, {
                ...formData,
                capacity: parseInt(formData.capacity) || 0
            })
            if (response.success) {
                toast.success('Class updated successfully')
                setEditingSession(null)
                await loadSchedule()
            } else {
                toast.error(response.message || 'Failed to update class')
            }
        } catch (error: any) {
            console.error('Error updating class:', error)
            toast.error(error?.response?.data?.message || 'Failed to update class')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteSession = async (sessionId: string) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return
        try {
            const response = await apiClient.delete(`/schedules/${sessionId}`)
            if (response.success) {
                toast.success('Class deleted')
                setScheduleData(prev => prev.filter(s => s.id !== sessionId))
            } else {
                toast.error(response.message || 'Failed to delete class')
            }
        } catch (error: any) {
            console.error('Error deleting class:', error)
            toast.error(error?.response?.data?.message || 'Failed to delete class')
        }
    }

    const openEditModal = (session: ScheduleItem) => {
        setFormData({
            title: session.title,
            coach: session.coach,
            time: session.time,
            date: session.date,
            capacity: session.capacity.toString(),
            location: session.location,
            status: session.status
        })
        setEditingSession(session)
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const filteredSchedule = scheduleData.filter(s =>
        !searchTerm || s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.coach.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderFormModal = (isEdit: boolean) => (
        <AnimatePresence>
            {(showAddModal || editingSession) && (
                <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => { setShowAddModal(false); setEditingSession(null) }}>
                    <motion.div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                            <h2 className="text-lg font-bold">{isEdit ? 'Edit Class' : 'Add Class'}</h2>
                            <Button variant="ghost" size="sm" onClick={() => { setShowAddModal(false); setEditingSession(null) }}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class Title *</label>
                                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Beginner Gymnastics" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coach *</label>
                                <Input value={formData.coach} onChange={(e) => setFormData({ ...formData, coach: e.target.value })} placeholder="Coach name" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                                    <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <Input value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} placeholder="10:00 AM - 11:00 AM" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Main Gym" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                    <Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} placeholder="12" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="confirmed">Confirmed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                            <Button variant="outline" onClick={() => { setShowAddModal(false); setEditingSession(null) }} disabled={isSaving}>Cancel</Button>
                            <Button onClick={isEdit ? handleEditSession : handleAddSession} disabled={isSaving}>
                                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEdit ? 'Saving...' : 'Adding...'}</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? 'Save Changes' : 'Add Class'}</>}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {showAddModal && renderFormModal(false)}
            {editingSession && renderFormModal(true)}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Location Schedule</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Manage classes and coaching sessions</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button id="manager-schedule-refresh-btn" variant="outline" size="sm" onClick={() => loadSchedule(true)} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button id="manager-schedule-add-class-btn" size="sm" onClick={() => {
                        setFormData({ title: '', coach: '', time: '', date: '', capacity: '', location: '', status: 'confirmed' })
                        setShowAddModal(true)
                    }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Class
                    </Button>
                </div>
            </div>

            {/* Calendar Navigation */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                            <Button id="manager-schedule-prev-btn" variant="outline" size="sm"
                                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <h2 className="text-lg sm:text-xl font-semibold">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <Button id="manager-schedule-next-btn" variant="outline" size="sm"
                                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            {['day', 'week', 'month'].map((view) => (
                                <Button id={`manager-schedule-view-${view}-btn`}
                                    key={view}
                                    variant={selectedView === view ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedView(view as any)}
                                >
                                    {view.charAt(0).toUpperCase() + view.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Schedule List */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <CardTitle className="text-base sm:text-lg">Today's Classes</CardTitle>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search classes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="space-y-4 min-w-0">
                            {filteredSchedule.map((session, index) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg hover:shadow-md transition-all gap-3"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{session.title}</h4>
                                                <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600">Coach: {session.coach} - {session.location}</p>
                                            <p className="text-xs text-gray-500">{session.time}</p>
                                        </div>
                                    </div>
                                    <div className="hidden md:block text-right flex-shrink-0">
                                        <p className="text-lg font-bold text-purple-600">{session.students}/{session.capacity}</p>
                                        <p className="text-sm text-gray-600">Students</p>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                        <Button id={`manager-schedule-view-${session.id}-btn`} variant="ghost" size="sm"
                                            onClick={() => setViewingSession(session)}>
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button id={`manager-schedule-edit-${session.id}-btn`} variant="ghost" size="sm"
                                            onClick={() => openEditModal(session)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button id={`manager-schedule-delete-${session.id}-btn`} variant="ghost" size="sm"
                                            onClick={() => handleDeleteSession(session.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                            {filteredSchedule.length === 0 && (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No classes scheduled</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* View Modal */}
            <AnimatePresence>
                {viewingSession && (
                    <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setViewingSession(null)}>
                        <motion.div className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold">{viewingSession.title}</h3>
                                        <Badge className={getStatusColor(viewingSession.status)}>{viewingSession.status}</Badge>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setViewingSession(null)}><X className="w-5 h-5" /></Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /><span>Coach: {viewingSession.coach}</span></div>
                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span>{viewingSession.time}</span></div>
                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span>{viewingSession.location}</span></div>
                                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /><span>{viewingSession.students}/{viewingSession.capacity} students</span></div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ManagerSchedulePage
