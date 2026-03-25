'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Eye, Calendar, Users, Clock, Award, X, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LocationManagerService, LocationClass } from '@/services/locationManagerService'

export default function LocationClassesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterLevel, setFilterLevel] = useState('all')
    const [classes, setClasses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [editingClass, setEditingClass] = useState<any>(null)
    const [formData, setFormData] = useState({ name: '', level: 'BEGINNER', coach: '', schedule: '', capacity: 20, room: '' })
    const [isSaving, setIsSaving] = useState(false)

    const fetchClasses = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const levelParam = filterLevel !== 'all' ? filterLevel : undefined
            const result = await LocationManagerService.getClasses(page, 10, searchTerm || undefined, levelParam)
            setClasses(result?.data || [])
            setTotalPages(result?.totalPages || 1)
        } catch (err: any) {
            console.error('Error fetching classes:', err)
            setError(err.message || 'Failed to fetch classes')
            setClasses([])
        } finally {
            setIsLoading(false)
        }
    }, [page, searchTerm, filterLevel])

    useEffect(() => {
        fetchClasses()
    }, [fetchClasses])

    const handleOpenCreate = () => {
        setEditingClass(null)
        setFormData({ name: '', level: 'BEGINNER', coach: '', schedule: '', capacity: 20, room: '' })
        setShowModal(true)
    }

    const handleOpenEdit = (cls: any) => {
        setEditingClass(cls)
        setFormData({
            name: cls.name || '',
            level: cls.level || 'BEGINNER',
            coach: cls.coach || '',
            schedule: cls.schedule || '',
            capacity: cls.capacity || 20,
            room: cls.room || ''
        })
        setShowModal(true)
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            if (editingClass) {
                await LocationManagerService.updateClass(editingClass.id || editingClass._id, formData)
            } else {
                await LocationManagerService.createClass(formData)
            }
            setShowModal(false)
            fetchClasses()
        } catch (err: any) {
            alert('Failed to save class: ' + err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (classId: string) => {
        if (confirm('Are you sure you want to delete this class?')) {
            try {
                await LocationManagerService.deleteClass(classId)
                fetchClasses()
            } catch (err: any) {
                alert('Failed to delete class: ' + err.message)
            }
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
                    <p className="text-gray-600 mt-1">Manage all classes at this location</p>
                </div>
                <button id="admin-location-classes-btn"
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Class
                </button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search classes..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                                className="pl-10"
                            />
                        </div>
                        <select
                            id="select-admin-location-classes-1"
                            value={filterLevel}
                            onChange={(e) => { setFilterLevel(e.target.value); setPage(1) }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Levels</option>
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                            <option value="ELITE">Elite</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
                {classes.map((cls, idx) => (
                    <motion.div
                        key={cls.id || cls._id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <Calendar className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900">{cls.name || cls.sessionName || 'Unnamed Class'}</h3>
                                                    <Badge variant="outline">{cls.level || 'N/A'}</Badge>
                                                    <Badge variant={cls.status === 'ACTIVE' || cls.status === 'scheduled' ? 'default' : 'secondary'}>
                                                        {cls.status || 'N/A'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">Coach: <span className="font-medium">{cls.coach || 'Unassigned'}</span></p>
                                                <p className="text-sm text-gray-600">Schedule: <span className="font-medium">{cls.schedule || cls.timeSlot || 'N/A'}</span></p>
                                                {cls.room && <p className="text-sm text-gray-600">Room: <span className="font-medium">{cls.room}</span></p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm text-gray-600">Students</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">
                                                {cls.enrolled ?? cls.students ?? 0}/{cls.capacity ?? cls.maxCapacity ?? 0}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Award className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-gray-600">Occupancy</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">
                                                {cls.capacity > 0 ? Math.round(((cls.enrolled ?? cls.students ?? 0) / (cls.capacity ?? cls.maxCapacity ?? 1)) * 100) : 0}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full lg:w-auto">
                                        <button id="admin-location-classes-btn-2"
                                            onClick={() => handleOpenEdit(cls)}
                                            className="flex-1 lg:flex-none px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Edit</span>
                                        </button>
                                        <button id="admin-location-classes-btn-3"
                                            onClick={() => handleDelete(cls.id || cls._id)}
                                            className="flex-1 lg:flex-none px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {classes.length === 0 && !error && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No classes found</p>
                    </CardContent>
                </Card>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button id="admin-location-classes-btn-4"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button id="admin-location-classes-btn-5"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingClass ? 'Edit Class' : 'Add New Class'}
                            </h2>
                            <button id="admin-location-classes-btn-6" onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter class name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                    <option value="ELITE">Elite</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coach</label>
                                <Input value={formData.coach} onChange={(e) => setFormData({ ...formData, coach: e.target.value })} placeholder="Coach name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                                <Input value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} placeholder="e.g., Mon, Wed, Fri - 9:00 AM" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                <Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                                <Input value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} placeholder="Room number" />
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t">
                            <button id="admin-location-classes-btn-7" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button id="admin-location-classes-btn-8" onClick={handleSave} disabled={isSaving || !formData.name}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                                {editingClass ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
