'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    UserCheck, Users, Calendar, Star, Plus, RefreshCw, Eye, Edit, Mail, Phone,
    Clock, Award, TrendingUp, Activity, X, Save, Trash2, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface StaffMember {
    id: string
    name: string
    role: string
    specialization: string
    experience: string
    students: number
    rating: number
    status: string
    email: string
    phone: string
    joinDate: string
    certifications: string[]
}

const MOCK_STAFF: StaffMember[] = [
    {
        id: '1',
        name: 'Sarah Johnson',
        role: 'Senior Coach',
        specialization: 'Gymnastics',
        experience: '5 years',
        students: 24,
        rating: 4.9,
        status: 'active',
        email: 'sarah.johnson@proactivsports.net',
        phone: '+852 9876 1234',
        joinDate: '2019-03-15',
        certifications: ['Level 3 Gymnastics', 'First Aid']
    },
    {
        id: '2',
        name: 'Mike Chen',
        role: 'Coach',
        specialization: 'Gymnastics',
        experience: '3 years',
        students: 18,
        rating: 4.7,
        status: 'active',
        email: 'mike.chen@proactivsports.net',
        phone: '+852 9876 1235',
        joinDate: '2021-06-10',
        certifications: ['Level 2 Gymnastics', 'CPR']
    },
    {
        id: '3',
        name: 'Lisa Zhang',
        role: 'Private Coach',
        specialization: 'Advanced Gymnastics',
        experience: '7 years',
        students: 12,
        rating: 4.8,
        status: 'active',
        email: 'lisa.zhang@proactivsports.net',
        phone: '+852 9876 1236',
        joinDate: '2017-09-20',
        certifications: ['Level 4 Gymnastics', 'Sports Psychology']
    },
    {
        id: '4',
        name: 'Tom Wilson',
        role: 'Assistant Coach',
        specialization: 'Beginner Programs',
        experience: '2 years',
        students: 15,
        rating: 4.5,
        status: 'active',
        email: 'tom.wilson@proactivsports.net',
        phone: '+852 9876 1237',
        joinDate: '2022-01-15',
        certifications: ['Level 1 Gymnastics', 'First Aid']
    }
]

const ManagerStaffPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'coaches' | 'assistants'>('all')
    const [staffData, setStaffData] = useState<StaffMember[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
    const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '', role: 'Coach', specialization: '', email: '', phone: ''
    })

    const loadStaff = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true)
            else setIsLoading(true)

            const response = await apiClient.get('/staff')
            if (response.success && response.data?.length > 0) {
                setStaffData(response.data.map((s: any) => ({
                    id: s._id || s.id,
                    name: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim(),
                    role: s.role || 'Coach',
                    specialization: s.specialization || '',
                    experience: s.experience || '',
                    students: s.students || 0,
                    rating: s.rating || 0,
                    status: s.status || 'active',
                    email: s.email || '',
                    phone: s.phone || '',
                    joinDate: s.joinDate || s.createdAt || '',
                    certifications: s.certifications || []
                })))
            } else {
                setStaffData(MOCK_STAFF)
            }
        } catch (error) {
            console.error('Error loading staff:', error)
            setStaffData(MOCK_STAFF)
        } finally {
            setIsLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        loadStaff()
    }, [loadStaff])

    const handleAddStaff = async () => {
        if (!formData.name || !formData.email) {
            toast.error('Name and email are required')
            return
        }
        try {
            setIsSaving(true)
            const response = await apiClient.post('/staff', formData)
            if (response.success) {
                toast.success('Staff member added successfully')
                setShowAddModal(false)
                setFormData({ name: '', role: 'Coach', specialization: '', email: '', phone: '' })
                await loadStaff()
            } else {
                toast.error(response.message || 'Failed to add staff')
            }
        } catch (error: any) {
            console.error('Error adding staff:', error)
            toast.error(error?.response?.data?.message || 'Failed to add staff member')
        } finally {
            setIsSaving(false)
        }
    }

    const handleEditStaff = async () => {
        if (!editingStaff) return
        try {
            setIsSaving(true)
            const response = await apiClient.put(`/staff/${editingStaff.id}`, formData)
            if (response.success) {
                toast.success('Staff member updated successfully')
                setEditingStaff(null)
                await loadStaff()
            } else {
                toast.error(response.message || 'Failed to update staff')
            }
        } catch (error: any) {
            console.error('Error updating staff:', error)
            toast.error(error?.response?.data?.message || 'Failed to update staff member')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteStaff = async (staffId: string) => {
        if (!window.confirm('Are you sure you want to remove this staff member?')) return
        try {
            const response = await apiClient.delete(`/staff/${staffId}`)
            if (response.success) {
                toast.success('Staff member removed')
                setStaffData(prev => prev.filter(s => s.id !== staffId))
            } else {
                toast.error(response.message || 'Failed to remove staff')
            }
        } catch (error: any) {
            console.error('Error deleting staff:', error)
            toast.error(error?.response?.data?.message || 'Failed to remove staff member')
        }
    }

    const openEditModal = (staff: StaffMember) => {
        setFormData({
            name: staff.name,
            role: staff.role,
            specialization: staff.specialization,
            email: staff.email,
            phone: staff.phone
        })
        setEditingStaff(staff)
    }

    const staffStats = {
        totalStaff: staffData.length,
        activeCoaches: staffData.filter(s => s.role.includes('Coach') && !s.role.includes('Assistant')).length,
        assistants: staffData.filter(s => s.role.includes('Assistant')).length,
        averageRating: staffData.length > 0
            ? +(staffData.reduce((sum, s) => sum + s.rating, 0) / staffData.length).toFixed(1)
            : 0
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            on_leave: 'bg-yellow-100 text-yellow-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            'Senior Coach': 'bg-purple-100 text-purple-800',
            'Coach': 'bg-blue-100 text-blue-800',
            'Private Coach': 'bg-indigo-100 text-indigo-800',
            'Assistant Coach': 'bg-green-100 text-green-800'
        }
        return colors[role] || 'bg-gray-100 text-gray-800'
    }

    const filteredStaff = staffData.filter(staff => {
        if (selectedFilter === 'all') return true
        if (selectedFilter === 'coaches') return staff.role.includes('Coach') && !staff.role.includes('Assistant')
        if (selectedFilter === 'assistants') return staff.role.includes('Assistant')
        return true
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
            {(showAddModal || editingStaff) && (
                <motion.div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => { setShowAddModal(false); setEditingStaff(null) }}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                            <h2 className="text-lg font-bold text-gray-900">
                                {isEdit ? 'Edit Staff Member' : 'Add Staff Member'}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => { setShowAddModal(false); setEditingStaff(null) }}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="Senior Coach">Senior Coach</option>
                                    <option value="Coach">Coach</option>
                                    <option value="Private Coach">Private Coach</option>
                                    <option value="Assistant Coach">Assistant Coach</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                <Input
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    placeholder="e.g. Gymnastics"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <Input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+852 9876 1234"
                                />
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                            <Button variant="outline" onClick={() => { setShowAddModal(false); setEditingStaff(null) }} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button onClick={isEdit ? handleEditStaff : handleAddStaff} disabled={isSaving}>
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEdit ? 'Saving...' : 'Adding...'}</>
                                ) : (
                                    <><Save className="w-4 h-4 mr-2" />{isEdit ? 'Save Changes' : 'Add Staff'}</>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Modals */}
            {showAddModal && renderFormModal(false)}
            {editingStaff && renderFormModal(true)}

            {/* View Modal */}
            <AnimatePresence>
                {viewingStaff && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setViewingStaff(null)}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                            {viewingStaff.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{viewingStaff.name}</h3>
                                            <Badge className={getRoleColor(viewingStaff.role)}>{viewingStaff.role}</Badge>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setViewingStaff(null)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-3 text-sm">
                                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" />{viewingStaff.email}</div>
                                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{viewingStaff.phone}</div>
                                    <div className="flex items-center gap-2"><Award className="w-4 h-4 text-gray-400" />{viewingStaff.specialization}</div>
                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" />{viewingStaff.experience} experience</div>
                                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" />{viewingStaff.students} students</div>
                                    <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" />{viewingStaff.rating} rating</div>
                                </div>
                                {viewingStaff.certifications.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Certifications</p>
                                        <div className="flex flex-wrap gap-2">
                                            {viewingStaff.certifications.map((cert, i) => (
                                                <Badge key={i} variant="outline">{cert}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Manage coaches and staff members</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button id="manager-staff-refresh-btn" variant="outline" size="sm" onClick={() => loadStaff(true)} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button id="manager-staff-add-btn" size="sm" onClick={() => {
                        setFormData({ name: '', role: 'Coach', specialization: '', email: '', phone: '' })
                        setShowAddModal(true)
                    }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Staff
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { title: 'Total Staff', value: staffStats.totalStaff, icon: Users, color: 'text-purple-600', pct: 85 },
                    { title: 'Active Coaches', value: staffStats.activeCoaches, icon: UserCheck, color: 'text-green-600', pct: 90 },
                    { title: 'Assistants', value: staffStats.assistants, icon: Activity, color: 'text-blue-600', pct: 60 },
                    { title: 'Average Rating', value: staffStats.averageRating, icon: Star, color: 'text-yellow-600', pct: 94 },
                ].map((stat, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                                <Progress value={stat.pct} className="mt-3 h-1.5 sm:h-2" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Staff List */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <CardTitle className="text-base sm:text-lg">Staff Members</CardTitle>
                        <select id="select-manager-staff-1"
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value as any)}
                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Staff</option>
                            <option value="coaches">Coaches</option>
                            <option value="assistants">Assistants</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredStaff.map((staff, index) => (
                            <motion.div
                                key={staff.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg hover:shadow-md transition-all gap-3"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {staff.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{staff.name}</h4>
                                            <Badge className={getRoleColor(staff.role)}>{staff.role}</Badge>
                                            <Badge className={getStatusColor(staff.status)}>{staff.status}</Badge>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600 truncate">{staff.specialization} - {staff.experience} experience</p>
                                        <p className="text-xs text-gray-500">{staff.students} students - Rating: {staff.rating}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block text-right flex-shrink-0">
                                    <p className="text-sm text-gray-600 truncate">{staff.email}</p>
                                    <p className="text-sm text-gray-600">{staff.phone}</p>
                                    <p className="text-xs text-gray-500">Joined: {staff.joinDate}</p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    <Button id={`manager-staff-view-${staff.id}-btn`} variant="ghost" size="sm" onClick={() => setViewingStaff(staff)}>
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button id={`manager-staff-edit-${staff.id}-btn`} variant="ghost" size="sm" onClick={() => openEditModal(staff)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button id={`manager-staff-delete-${staff.id}-btn`} variant="ghost" size="sm" onClick={() => handleDeleteStaff(staff.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                        {filteredStaff.length === 0 && (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No staff members found</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <Button id="manager-staff-quick-add-btn" className="h-16 sm:h-20 flex-col gap-2 text-xs sm:text-sm" variant="outline"
                            onClick={() => { setFormData({ name: '', role: 'Coach', specialization: '', email: '', phone: '' }); setShowAddModal(true) }}>
                            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Add Staff</span>
                        </Button>
                        <Button id="manager-staff-quick-schedule-btn" className="h-16 sm:h-20 flex-col gap-2 text-xs sm:text-sm" variant="outline"
                            onClick={() => window.location.href = '/manager/schedule'}>
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Schedule</span>
                        </Button>
                        <Button id="manager-staff-quick-performance-btn" className="h-16 sm:h-20 flex-col gap-2 text-xs sm:text-sm" variant="outline"
                            onClick={() => window.location.href = '/manager/reports'}>
                            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Performance</span>
                        </Button>
                        <Button id="manager-staff-quick-message-btn" className="h-16 sm:h-20 flex-col gap-2 text-xs sm:text-sm" variant="outline">
                            <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Send Message</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ManagerStaffPage
