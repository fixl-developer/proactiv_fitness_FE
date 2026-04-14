'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Search, Plus, RefreshCw, Eye, Edit, Mail,
    Star, TrendingUp, UserCheck, X, Save, Trash2, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface Student {
    id: string
    name: string
    age: number
    parent: string
    program: string
    coach: string
    joinDate: string
    status: string
    progress: number
    rating: number
    email: string
    phone: string
}

const MOCK_STUDENTS: Student[] = [
    { id: '1', name: 'Emma Chen', age: 8, parent: 'David Chen', program: 'Beginner Gymnastics', coach: 'Sarah Johnson', joinDate: '2024-01-15', status: 'active', progress: 85, rating: 4.8, email: 'david.chen@email.com', phone: '+852 9876 5432' },
    { id: '2', name: 'Lucas Wong', age: 10, parent: 'Michelle Wong', program: 'Intermediate Gymnastics', coach: 'Mike Chen', joinDate: '2023-11-20', status: 'active', progress: 92, rating: 4.7, email: 'michelle.wong@email.com', phone: '+852 9876 5433' },
    { id: '3', name: 'Sophia Li', age: 7, parent: 'James Li', program: 'Private Coaching', coach: 'Lisa Zhang', joinDate: '2024-01-10', status: 'active', progress: 78, rating: 4.9, email: 'james.li@email.com', phone: '+852 9876 5434' },
]

const ManagerStudentsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [studentsData, setStudentsData] = useState<Student[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Student | null>(null)
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '', age: '', parent: '', program: '', coach: '', email: '', phone: ''
    })

    const loadStudents = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true)
            else setIsLoading(true)

            const response = await apiClient.get('/students')
            if (response.success && response.data?.length > 0) {
                setStudentsData(response.data.map((s: any) => ({
                    id: s._id || s.id,
                    name: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
                    age: s.age || 0,
                    parent: s.parentName || s.parent || '',
                    program: s.program || '',
                    coach: s.coachName || s.coach || '',
                    joinDate: s.joinDate || s.createdAt || '',
                    status: s.status || 'active',
                    progress: s.progress || 0,
                    rating: s.rating || 0,
                    email: s.email || s.parentEmail || '',
                    phone: s.phone || s.parentPhone || ''
                })))
            } else {
                setStudentsData(MOCK_STUDENTS)
            }
        } catch (error) {
            console.error('Error loading students:', error)
            setStudentsData(MOCK_STUDENTS)
        } finally {
            setIsLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        loadStudents()
    }, [loadStudents])

    const handleAddStudent = async () => {
        if (!formData.name || !formData.email) {
            toast.error('Name and email are required')
            return
        }
        try {
            setIsSaving(true)
            const response = await apiClient.post('/students', {
                ...formData,
                age: parseInt(formData.age) || 0
            })
            if (response.success) {
                toast.success('Student added successfully')
                setShowAddModal(false)
                setFormData({ name: '', age: '', parent: '', program: '', coach: '', email: '', phone: '' })
                await loadStudents()
            } else {
                toast.error(response.message || 'Failed to add student')
            }
        } catch (error: any) {
            console.error('Error adding student:', error)
            toast.error(error?.response?.data?.message || 'Failed to add student')
        } finally {
            setIsSaving(false)
        }
    }

    const handleEditStudent = async () => {
        if (!editingStudent) return
        try {
            setIsSaving(true)
            const response = await apiClient.put(`/students/${editingStudent.id}`, {
                ...formData,
                age: parseInt(formData.age) || 0
            })
            if (response.success) {
                toast.success('Student updated successfully')
                setEditingStudent(null)
                await loadStudents()
            } else {
                toast.error(response.message || 'Failed to update student')
            }
        } catch (error: any) {
            console.error('Error updating student:', error)
            toast.error(error?.response?.data?.message || 'Failed to update student')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteStudent = async (studentId: string) => {
        if (!window.confirm('Are you sure you want to remove this student?')) return
        try {
            const response = await apiClient.delete(`/students/${studentId}`)
            if (response.success) {
                toast.success('Student removed')
                setStudentsData(prev => prev.filter(s => s.id !== studentId))
            } else {
                toast.error(response.message || 'Failed to remove student')
            }
        } catch (error: any) {
            console.error('Error deleting student:', error)
            toast.error(error?.response?.data?.message || 'Failed to remove student')
        }
    }

    const openEditModal = (student: Student) => {
        setFormData({
            name: student.name,
            age: student.age.toString(),
            parent: student.parent,
            program: student.program,
            coach: student.coach,
            email: student.email,
            phone: student.phone
        })
        setEditingStudent(student)
    }

    const studentStats = {
        totalStudents: studentsData.length,
        activeStudents: studentsData.filter(s => s.status === 'active').length,
        newThisMonth: studentsData.filter(s => {
            const joinDate = new Date(s.joinDate)
            const now = new Date()
            return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
        }).length,
        averageRating: studentsData.length > 0
            ? +(studentsData.reduce((sum, s) => sum + s.rating, 0) / studentsData.length).toFixed(1)
            : 0
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const filteredStudents = studentsData.filter(student => {
        const matchesFilter = selectedFilter === 'all' || student.status === selectedFilter
        const matchesSearch = !searchTerm ||
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.parent.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderFormModal = (isEdit: boolean) => (
        <AnimatePresence>
            {(showAddModal || editingStudent) && (
                <motion.div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => { setShowAddModal(false); setEditingStudent(null) }}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                            <h2 className="text-lg font-bold">{isEdit ? 'Edit Student' : 'Add Student'}</h2>
                            <Button variant="ghost" size="sm" onClick={() => { setShowAddModal(false); setEditingStudent(null) }}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                    <Input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="Age" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                                    <Input value={formData.parent} onChange={(e) => setFormData({ ...formData, parent: e.target.value })} placeholder="Parent name" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                                <Input value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })} placeholder="e.g. Beginner Gymnastics" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coach</label>
                                <Input value={formData.coach} onChange={(e) => setFormData({ ...formData, coach: e.target.value })} placeholder="Coach name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="parent@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+852 9876 5432" />
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                            <Button variant="outline" onClick={() => { setShowAddModal(false); setEditingStudent(null) }} disabled={isSaving}>Cancel</Button>
                            <Button onClick={isEdit ? handleEditStudent : handleAddStudent} disabled={isSaving}>
                                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEdit ? 'Saving...' : 'Adding...'}</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? 'Save Changes' : 'Add Student'}</>}
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
            {editingStudent && renderFormModal(true)}

            {/* View Modal */}
            <AnimatePresence>
                {viewingStudent && (
                    <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setViewingStudent(null)}>
                        <motion.div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold">{viewingStudent.name}</h3>
                                        <Badge className={getStatusColor(viewingStudent.status)}>{viewingStudent.status}</Badge>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setViewingStudent(null)}><X className="w-5 h-5" /></Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-xs text-gray-500">Age</p><p className="font-medium">{viewingStudent.age}</p></div>
                                    <div><p className="text-xs text-gray-500">Parent</p><p className="font-medium">{viewingStudent.parent}</p></div>
                                    <div><p className="text-xs text-gray-500">Program</p><p className="font-medium">{viewingStudent.program}</p></div>
                                    <div><p className="text-xs text-gray-500">Coach</p><p className="font-medium">{viewingStudent.coach}</p></div>
                                    <div><p className="text-xs text-gray-500">Progress</p><p className="font-medium text-purple-600">{viewingStudent.progress}%</p></div>
                                    <div><p className="text-xs text-gray-500">Rating</p><p className="font-medium text-yellow-600">{viewingStudent.rating}</p></div>
                                </div>
                                <div className="text-sm space-y-1">
                                    <p className="text-gray-600">{viewingStudent.email}</p>
                                    <p className="text-gray-600">{viewingStudent.phone}</p>
                                    <p className="text-gray-500 text-xs">Joined: {viewingStudent.joinDate}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Students Management</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Monitor student progress and enrollment</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button id="manager-students-refresh-btn" variant="outline" size="sm" onClick={() => loadStudents(true)} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button id="manager-students-add-btn" size="sm" onClick={() => {
                        setFormData({ name: '', age: '', parent: '', program: '', coach: '', email: '', phone: '' })
                        setShowAddModal(true)
                    }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Student
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { title: 'Total Students', value: studentStats.totalStudents, icon: Users, color: 'text-purple-600' },
                    { title: 'Active Students', value: studentStats.activeStudents, icon: UserCheck, color: 'text-green-600' },
                    { title: 'New This Month', value: studentStats.newThisMonth, icon: TrendingUp, color: 'text-blue-600' },
                    { title: 'Average Rating', value: studentStats.averageRating, icon: Star, color: 'text-yellow-600' },
                ].map((stat, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                                <Progress value={75} className="mt-3 h-1.5 sm:h-2" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Students List */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <CardTitle className="text-base sm:text-lg">Students List</CardTitle>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <select id="select-manager-students-1"
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value as any)}
                                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Students</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredStudents.map((student, index) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg hover:shadow-md transition-all gap-3"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{student.name}</h4>
                                            <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 truncate">{student.program} - Coach: {student.coach}</p>
                                        <p className="text-xs text-gray-500">Parent: {student.parent} - Age: {student.age}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block text-right flex-shrink-0">
                                    <p className="text-lg font-bold text-purple-600">{student.progress}%</p>
                                    <p className="text-sm text-gray-600">Progress</p>
                                    <p className="text-xs text-yellow-600">Rating: {student.rating}</p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    <Button id={`manager-students-view-${student.id}-btn`} variant="ghost" size="sm" onClick={() => setViewingStudent(student)}>
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button id={`manager-students-edit-${student.id}-btn`} variant="ghost" size="sm" onClick={() => openEditModal(student)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button id={`manager-students-delete-${student.id}-btn`} variant="ghost" size="sm" onClick={() => handleDeleteStudent(student.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                        {filteredStudents.length === 0 && (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No students found</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ManagerStudentsPage
