'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar, Clock, MapPin, Users, Plus, Edit2, Trash2,
    ChevronLeft, ChevronRight, AlertCircle, CheckCircle, X, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog, DialogContent, DialogHeader, DialogFooter,
    DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { coachService } from '@/services/modules/coach.service'

// ────────────────────────────── types ──────────────────────────────

interface ScheduleItem {
    id: string
    className: string
    date: string
    time: string
    startTime: string
    endTime: string
    location: string
    level: string
    enrolledStudents: number
    capacity: number
    duration: number
    status: string
}

interface ScheduleFormData {
    className: string
    date: string
    startTime: string
    endTime: string
    location: string
    level: string
    capacity: number
}

interface FormErrors {
    className?: string
    date?: string
    startTime?: string
    endTime?: string
    location?: string
    level?: string
    capacity?: string
}

// ────────────────────────── mock fallback ───────────────────────────

const MOCK_SCHEDULES: ScheduleItem[] = [
    {
        id: 'mock-1',
        className: 'Morning Yoga',
        date: new Date().toISOString().split('T')[0],
        time: '07:00 - 08:00',
        startTime: '07:00',
        endTime: '08:00',
        location: 'Studio A',
        level: 'beginner',
        enrolledStudents: 8,
        capacity: 20,
        duration: 60,
        status: 'active'
    },
    {
        id: 'mock-2',
        className: 'HIIT Training',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 - 11:00',
        startTime: '10:00',
        endTime: '11:00',
        location: 'Gym Floor',
        level: 'advanced',
        enrolledStudents: 12,
        capacity: 15,
        duration: 60,
        status: 'active'
    },
    {
        id: 'mock-3',
        className: 'Pilates',
        date: (() => {
            const d = new Date()
            d.setDate(d.getDate() + 2)
            return d.toISOString().split('T')[0]
        })(),
        time: '14:00 - 15:00',
        startTime: '14:00',
        endTime: '15:00',
        location: 'Studio B',
        level: 'intermediate',
        enrolledStudents: 6,
        capacity: 12,
        duration: 60,
        status: 'active'
    }
]

// ────────────────────── notification component ─────────────────────

interface Notification {
    id: number
    type: 'success' | 'error'
    message: string
}

const Notifications = ({ items, onDismiss }: { items: Notification[]; onDismiss: (id: number) => void }) => (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
        <AnimatePresence>
            {items.map(n => (
                <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className={`flex items-center gap-2 p-3 rounded-lg shadow-lg text-sm font-medium ${
                        n.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                >
                    {n.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="flex-1">{n.message}</span>
                    <button onClick={() => onDismiss(n.id)} className="ml-2">
                        <X className="w-3 h-3" />
                    </button>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
)

// ────────────────────────── helpers ─────────────────────────────────

const emptyForm = (): ScheduleFormData => ({
    className: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    level: '',
    capacity: 0
})

const validateForm = (data: ScheduleFormData): FormErrors => {
    const errors: FormErrors = {}
    if (!data.className.trim()) errors.className = 'Class name is required'
    if (!data.date) errors.date = 'Date is required'
    if (!data.startTime) errors.startTime = 'Start time is required'
    if (!data.endTime) errors.endTime = 'End time is required'
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
        errors.endTime = 'End time must be after start time'
    }
    if (!data.location.trim()) errors.location = 'Location is required'
    if (!data.level) errors.level = 'Level is required'
    if (!data.capacity || data.capacity <= 0) errors.capacity = 'Capacity must be greater than 0'
    return errors
}

// ────────────────────────── main page ──────────────────────────────

const CoachSchedulePage = () => {
    const { isAuthenticated, user } = useAuth()

    // data
    const [isLoading, setIsLoading] = useState(true)
    const [schedules, setSchedules] = useState<ScheduleItem[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDay, setSelectedDay] = useState<string | null>(null)

    // modals
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null)
    const [deletingSchedule, setDeletingSchedule] = useState<ScheduleItem | null>(null)

    // form
    const [formData, setFormData] = useState<ScheduleFormData>(emptyForm())
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [isSaving, setIsSaving] = useState(false)

    // notifications
    const [notifications, setNotifications] = useState<Notification[]>([])
    let notifCounter = 0
    const notify = useCallback((type: 'success' | 'error', message: string) => {
        const id = Date.now() + Math.random()
        setNotifications(prev => [...prev, { id, type, message }])
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000)
    }, [])
    const dismissNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }, [])

    // ──────────── load schedules ────────────

    const loadSchedules = useCallback(async () => {
        try {
            setIsLoading(true)
            const coachId = user?.id || ''
            const dateFrom = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
                .toISOString().split('T')[0]
            const dateTo = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
                .toISOString().split('T')[0]

            const data = await coachService.getSchedules(coachId, { dateFrom, dateTo })
            setSchedules(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error loading schedules, falling back to mock:', error)
            setSchedules(MOCK_SCHEDULES)
        } finally {
            setIsLoading(false)
        }
    }, [user?.id, currentDate])

    useEffect(() => {
        if (!isAuthenticated && !localStorage.getItem('token')) return
        loadSchedules()
    }, [isAuthenticated, loadSchedules])

    // ──────────── calendar helpers ────────────

    const getDaysInMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

    const getFirstDayOfMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    const getSchedulesForDate = (day: number): ScheduleItem[] => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            .toISOString().split('T')[0]
        return schedules.filter(s => s.date === dateStr)
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
        setSelectedDay(null)
    }
    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
        setSelectedDay(null)
    }

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    // upcoming classes: sorted by date, only today or later
    const today = new Date().toISOString().split('T')[0]
    const upcomingClasses = [...schedules]
        .filter(s => s.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
        .slice(0, 5)

    // ──────────── form helpers ────────────

    const updateField = (field: keyof ScheduleFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (formErrors[field]) {
            setFormErrors(prev => {
                const next = { ...prev }
                delete next[field]
                return next
            })
        }
    }

    // ──────────── open modals ────────────

    const openAddModal = (prefillDate?: string) => {
        setFormData({
            ...emptyForm(),
            date: prefillDate || ''
        })
        setFormErrors({})
        setShowAddModal(true)
    }

    const openEditModal = (schedule: ScheduleItem) => {
        setFormData({
            className: schedule.className,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            location: schedule.location,
            level: schedule.level,
            capacity: schedule.capacity
        })
        setFormErrors({})
        setEditingSchedule(schedule)
    }

    const openDeleteConfirm = (schedule: ScheduleItem) => {
        setDeletingSchedule(schedule)
    }

    // ──────────── CRUD ────────────

    const handleCreate = async () => {
        const errors = validateForm(formData)
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }
        try {
            setIsSaving(true)
            await coachService.createSchedule({
                ...formData,
                coachId: user?.id
            })
            notify('success', 'Class created successfully')
            setShowAddModal(false)
            await loadSchedules()
        } catch (error) {
            console.error('Error creating schedule:', error)
            notify('error', 'Failed to create class. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdate = async () => {
        if (!editingSchedule) return
        const errors = validateForm(formData)
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }
        try {
            setIsSaving(true)
            await coachService.updateSchedule(editingSchedule.id, {
                ...formData,
                coachId: user?.id
            })
            notify('success', 'Class updated successfully')
            setEditingSchedule(null)
            await loadSchedules()
        } catch (error) {
            console.error('Error updating schedule:', error)
            notify('error', 'Failed to update class. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingSchedule) return
        try {
            setIsSaving(true)
            await coachService.deleteSchedule(deletingSchedule.id)
            setSchedules(prev => prev.filter(s => s.id !== deletingSchedule.id))
            notify('success', 'Class deleted successfully')
            setDeletingSchedule(null)
            await loadSchedules()
        } catch (error) {
            console.error('Error deleting schedule:', error)
            notify('error', 'Failed to delete class. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    // ──────────── shared form fields JSX ────────────

    const renderFormFields = () => (
        <div className="space-y-4 py-4">
            {/* Class Name */}
            <div className="space-y-1.5">
                <Label htmlFor="className">Class Name</Label>
                <Input
                    id="className"
                    placeholder="e.g. Morning Yoga"
                    value={formData.className}
                    onChange={e => updateField('className', e.target.value)}
                    className={formErrors.className ? 'border-red-500' : ''}
                />
                {formErrors.className && (
                    <p className="text-xs text-red-600">{formErrors.className}</p>
                )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={e => updateField('date', e.target.value)}
                    className={formErrors.date ? 'border-red-500' : ''}
                />
                {formErrors.date && (
                    <p className="text-xs text-red-600">{formErrors.date}</p>
                )}
            </div>

            {/* Start / End time */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={e => updateField('startTime', e.target.value)}
                        className={formErrors.startTime ? 'border-red-500' : ''}
                    />
                    {formErrors.startTime && (
                        <p className="text-xs text-red-600">{formErrors.startTime}</p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={e => updateField('endTime', e.target.value)}
                        className={formErrors.endTime ? 'border-red-500' : ''}
                    />
                    {formErrors.endTime && (
                        <p className="text-xs text-red-600">{formErrors.endTime}</p>
                    )}
                </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    placeholder="e.g. Studio A"
                    value={formData.location}
                    onChange={e => updateField('location', e.target.value)}
                    className={formErrors.location ? 'border-red-500' : ''}
                />
                {formErrors.location && (
                    <p className="text-xs text-red-600">{formErrors.location}</p>
                )}
            </div>

            {/* Level */}
            <div className="space-y-1.5">
                <Label htmlFor="level">Level</Label>
                <Select value={formData.level} onValueChange={v => updateField('level', v)}>
                    <SelectTrigger className={formErrors.level ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                </Select>
                {formErrors.level && (
                    <p className="text-xs text-red-600">{formErrors.level}</p>
                )}
            </div>

            {/* Capacity */}
            <div className="space-y-1.5">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                    id="capacity"
                    type="number"
                    min={1}
                    placeholder="e.g. 20"
                    value={formData.capacity || ''}
                    onChange={e => updateField('capacity', parseInt(e.target.value) || 0)}
                    className={formErrors.capacity ? 'border-red-500' : ''}
                />
                {formErrors.capacity && (
                    <p className="text-xs text-red-600">{formErrors.capacity}</p>
                )}
            </div>
        </div>
    )

    // ──────────── loading state ────────────

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    // ──────────── render ────────────

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Notifications */}
            <Notifications items={notifications} onDismiss={dismissNotification} />

            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Class Schedule</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Manage your coaching schedule and classes
                    </p>
                </div>
                <Button
                    data-testid="btn-add-class"
                    onClick={() => openAddModal()}
                    className="w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Class
                </Button>
            </div>

            {/* Calendar + Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{monthName}</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleNextMonth}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square"></div>
                                ))}

                                {days.map(day => {
                                    const daySchedules = getSchedulesForDate(day)
                                    const isSelected = selectedDay === day.toString()
                                    const isToday =
                                        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                                            .toISOString().split('T')[0] === today

                                    return (
                                        <motion.button
                                            key={day}
                                            onClick={() => setSelectedDay(isSelected ? null : day.toString())}
                                            whileHover={{ scale: 1.05 }}
                                            className={`aspect-square rounded-lg border-2 transition-all ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : daySchedules.length > 0
                                                        ? 'border-green-500 bg-green-50'
                                                        : isToday
                                                            ? 'border-blue-300 bg-blue-25'
                                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <span className={`font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                                    {day}
                                                </span>
                                                {daySchedules.length > 0 && (
                                                    <span className="text-xs text-green-600 font-medium">
                                                        {daySchedules.length} {daySchedules.length === 1 ? 'class' : 'classes'}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Classes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Classes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingClasses.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No upcoming classes</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingClasses.map((schedule, index) => (
                                    <motion.div
                                        key={schedule.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-gray-900 text-sm">
                                                {schedule.className}
                                            </h4>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {schedule.level}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 text-xs text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {schedule.date}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {schedule.time || `${schedule.startTime} - ${schedule.endTime}`}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3" />
                                                {schedule.location}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3 h-3" />
                                                {schedule.enrolledStudents}/{schedule.capacity} Students
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 h-7 text-xs"
                                                onClick={() => openEditModal(schedule)}
                                            >
                                                <Edit2 className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 h-7 text-xs text-red-600 hover:text-red-700"
                                                onClick={() => openDeleteConfirm(schedule)}
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Selected Day Details */}
            {selectedDay && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>
                                    Classes on{' '}
                                    {new Date(
                                        currentDate.getFullYear(),
                                        currentDate.getMonth(),
                                        parseInt(selectedDay)
                                    ).toLocaleDateString()}
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        const dateStr = new Date(
                                            currentDate.getFullYear(),
                                            currentDate.getMonth(),
                                            parseInt(selectedDay)
                                        ).toISOString().split('T')[0]
                                        openAddModal(dateStr)
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {getSchedulesForDate(parseInt(selectedDay)).length > 0 ? (
                                <div className="space-y-4">
                                    {getSchedulesForDate(parseInt(selectedDay)).map(schedule => (
                                        <div
                                            key={schedule.id}
                                            className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900">
                                                    {schedule.className}
                                                </h4>
                                                <Badge className="capitalize">{schedule.level}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-600">Time</p>
                                                    <p className="font-medium text-gray-900">
                                                        {schedule.time || `${schedule.startTime} - ${schedule.endTime}`}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Location</p>
                                                    <p className="font-medium text-gray-900">{schedule.location}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Duration</p>
                                                    <p className="font-medium text-gray-900">{schedule.duration} min</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Students</p>
                                                    <p className="font-medium text-gray-900">
                                                        {schedule.enrolledStudents}/{schedule.capacity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditModal(schedule)}
                                                >
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => openDeleteConfirm(schedule)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-600">No classes scheduled for this day</p>
                                    <Button
                                        className="mt-4"
                                        onClick={() => {
                                            const dateStr = new Date(
                                                currentDate.getFullYear(),
                                                currentDate.getMonth(),
                                                parseInt(selectedDay)
                                            ).toISOString().split('T')[0]
                                            openAddModal(dateStr)
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Class
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* ──────────── Add Class Modal ──────────── */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Class</DialogTitle>
                        <DialogDescription>
                            Fill in the details to create a new class on your schedule.
                        </DialogDescription>
                    </DialogHeader>
                    {renderFormFields()}
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddModal(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Class
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ──────────── Edit Class Modal ──────────── */}
            <Dialog open={!!editingSchedule} onOpenChange={open => { if (!open) setEditingSchedule(null) }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Class</DialogTitle>
                        <DialogDescription>
                            Update the details for this class.
                        </DialogDescription>
                    </DialogHeader>
                    {renderFormFields()}
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setEditingSchedule(null)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ──────────── Delete Confirmation Dialog ──────────── */}
            <Dialog open={!!deletingSchedule} onOpenChange={open => { if (!open) setDeletingSchedule(null) }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Class</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deletingSchedule?.className}</strong>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeletingSchedule(null)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CoachSchedulePage
