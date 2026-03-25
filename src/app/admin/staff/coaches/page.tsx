'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Plus, Edit2, Trash2, Users, Mail, Phone, Award,
    X, Save, RefreshCw, ChevronLeft, ChevronRight, Star,
    UserCheck, UserX, Clock, TrendingUp, Eye, EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { coachAdminService, CoachListItem, CreateCoachPayload, CoachStats } from '@/services/modules/coach-admin.service'
import { toast } from 'sonner'

// ==================== FALLBACK DATA ====================

const FALLBACK_COACHES: CoachListItem[] = [
    {
        _id: '1', staffId: 'coach_sarah_001',
        personalInfo: { firstName: 'Sarah', lastName: 'Johnson' },
        contactInfo: { email: 'sarah.coach@proactiv.com', phone: '+1-555-0101' },
        staffType: 'coach', status: 'active',
        specializations: ['Gymnastics', 'Fitness'], skills: ['Yoga', 'Pilates', 'Strength Training'],
        experienceYears: 5, locationIds: [], createdAt: '2024-01-15', performanceMetrics: []
    },
    {
        _id: '2', staffId: 'coach_mike_002',
        personalInfo: { firstName: 'Mike', lastName: 'Chen' },
        contactInfo: { email: 'mike.coach@proactiv.com', phone: '+1-555-0102' },
        staffType: 'coach', status: 'active',
        specializations: ['Swimming', 'Aquatics'], skills: ['Competitive Swimming', 'Water Polo', 'Diving'],
        experienceYears: 8, locationIds: [], createdAt: '2023-06-20', performanceMetrics: []
    },
    {
        _id: '3', staffId: 'coach_emma_003',
        personalInfo: { firstName: 'Emma', lastName: 'Williams' },
        contactInfo: { email: 'emma.coach@proactiv.com', phone: '+1-555-0103' },
        staffType: 'coach', status: 'active',
        specializations: ['Dance', 'Choreography'], skills: ['Ballet', 'Contemporary', 'Hip Hop'],
        experienceYears: 6, locationIds: [], createdAt: '2023-09-10', performanceMetrics: []
    },
    {
        _id: '4', staffId: 'coach_raj_004',
        personalInfo: { firstName: 'Raj', lastName: 'Patel' },
        contactInfo: { email: 'raj.coach@proactiv.com', phone: '+1-555-0104' },
        staffType: 'coach', status: 'on_leave',
        specializations: ['Martial Arts', 'Self Defense'], skills: ['Karate', 'Judo', 'Boxing'],
        experienceYears: 10, locationIds: [], createdAt: '2022-03-01', performanceMetrics: []
    },
    {
        _id: '5', staffId: 'coach_lisa_005',
        personalInfo: { firstName: 'Lisa', lastName: 'Thompson' },
        contactInfo: { email: 'lisa.coach@proactiv.com', phone: '+1-555-0105' },
        staffType: 'coach', status: 'active',
        specializations: ['Athletics', 'Track & Field'], skills: ['Sprinting', 'Long Jump', 'Conditioning'],
        experienceYears: 4, locationIds: [], createdAt: '2024-02-01', performanceMetrics: []
    }
]

const FALLBACK_STATS: CoachStats = {
    totalCoaches: 5, activeCoaches: 4, onLeaveCoaches: 1, avgExperience: 7
}

// ==================== COMPONENT ====================

export default function CoachesPage() {
    // State
    const [coaches, setCoaches] = useState<CoachListItem[]>([])
    const [stats, setStats] = useState<CoachStats>(FALLBACK_STATS)
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
    const [editingCoach, setEditingCoach] = useState<CoachListItem | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Form state
    const [formData, setFormData] = useState<CreateCoachPayload>({
        firstName: '', lastName: '', email: '', password: '',
        phone: '', specializations: [], skills: [],
        experienceYears: 0, maxHoursPerWeek: 40
    })
    const [editFormData, setEditFormData] = useState<any>({})

    // ==================== DATA FETCHING ====================

    const fetchCoaches = useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await coachAdminService.getCoaches({
                page,
                limit: 10,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                searchText: searchTerm || undefined
            })
            setCoaches(result.data?.length ? result.data : FALLBACK_COACHES)
            setTotalPages(result.totalPages || 1)
        } catch {
            setCoaches(FALLBACK_COACHES)
            toast.error('Could not load live data. Showing demo coaches.')
        }
        setIsLoading(false)
    }, [page, filterStatus, searchTerm])

    const fetchStats = useCallback(async () => {
        try {
            const data = await coachAdminService.getCoachStatistics()
            if (data.totalCoaches > 0) setStats(data)
        } catch {
            setStats(FALLBACK_STATS)
        }
    }, [])

    useEffect(() => { fetchCoaches() }, [fetchCoaches])
    useEffect(() => { fetchStats() }, [fetchStats])

    // ==================== HANDLERS ====================

    const handleCreateCoach = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            toast.error('Please fill all required fields')
            return
        }
        setIsSaving(true)
        try {
            await coachAdminService.createCoach(formData)
            toast.success(`Coach ${formData.firstName} ${formData.lastName} created successfully!`)
            setShowCreateModal(false)
            setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', specializations: [], skills: [], experienceYears: 0, maxHoursPerWeek: 40 })
            fetchCoaches()
            fetchStats()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to create coach')
        }
        setIsSaving(false)
    }

    const handleEditCoach = async () => {
        if (!editingCoach) return
        setIsSaving(true)
        try {
            await coachAdminService.updateCoach(editingCoach.staffId, editFormData)
            toast.success('Coach updated successfully!')
            setShowEditModal(false)
            fetchCoaches()
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update coach')
        }
        setIsSaving(false)
    }

    const handleDeleteCoach = async (staffId: string) => {
        try {
            await coachAdminService.deleteCoach(staffId)
            toast.success('Coach removed successfully')
            setShowDeleteConfirm(null)
            fetchCoaches()
            fetchStats()
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete coach')
        }
    }

    const openEditModal = (coach: CoachListItem) => {
        setEditingCoach(coach)
        setEditFormData({
            personalInfo: { firstName: coach.personalInfo.firstName, lastName: coach.personalInfo.lastName },
            contactInfo: { email: coach.contactInfo.email, phone: coach.contactInfo.phone || '' },
            specializations: coach.specializations || [],
            skills: coach.skills || [],
            experienceYears: coach.experienceYears || 0,
            status: coach.status || 'active'
        })
        setShowEditModal(true)
    }

    // Filter coaches locally by search
    const displayCoaches = coaches.filter(c => {
        const name = `${c.personalInfo.firstName} ${c.personalInfo.lastName}`.toLowerCase()
        const email = c.contactInfo.email.toLowerCase()
        const search = searchTerm.toLowerCase()
        return name.includes(search) || email.includes(search)
    })

    const statusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700'
            case 'on_leave': return 'bg-yellow-100 text-yellow-700'
            case 'inactive': return 'bg-gray-100 text-gray-600'
            case 'suspended': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-600'
        }
    }

    // ==================== RENDER ====================

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Coach Management</h1>
                    <p className="text-gray-500 mt-1">Add, edit and manage all coaches across locations</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { fetchCoaches(); fetchStats() }}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                    </Button>
                    <Button size="sm" onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700">
                        <Plus className="w-4 h-4 mr-1" /> Add Coach
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Coaches', value: stats.totalCoaches, icon: Users, gradient: 'from-blue-50 to-blue-100', iconBg: 'from-blue-500 to-blue-600' },
                    { label: 'Active', value: stats.activeCoaches, icon: UserCheck, gradient: 'from-green-50 to-emerald-100', iconBg: 'from-green-500 to-emerald-600' },
                    { label: 'On Leave', value: stats.onLeaveCoaches, icon: Clock, gradient: 'from-yellow-50 to-orange-100', iconBg: 'from-yellow-500 to-orange-500' },
                    { label: 'Avg Experience', value: `${stats.avgExperience} yrs`, icon: TrendingUp, gradient: 'from-purple-50 to-purple-100', iconBg: 'from-purple-500 to-purple-600' }
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className={`border-0 bg-gradient-to-br ${stat.gradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`bg-gradient-to-br ${stat.iconBg} p-2 rounded-lg`}>
                                        <stat.icon className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search coaches by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                            className="border rounded-lg px-3 py-2 text-sm bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="on_leave">On Leave</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Coaches List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse bg-gray-100 h-28 rounded-lg" />
                    ))}
                </div>
            ) : displayCoaches.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No coaches found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or add a new coach</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {displayCoaches.map((coach, index) => (
                        <motion.div
                            key={coach._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        {/* Coach Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                                {coach.personalInfo.firstName[0]}{coach.personalInfo.lastName[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {coach.personalInfo.firstName} {coach.personalInfo.lastName}
                                                    </h3>
                                                    <Badge className={`text-xs ${statusColor(coach.status)}`}>
                                                        {coach.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {coach.contactInfo.email}
                                                    </span>
                                                    {coach.contactInfo.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" /> {coach.contactInfo.phone}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {coach.specializations?.map((spec, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                    {coach.skills?.slice(0, 3).map((skill, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {(coach.skills?.length || 0) > 3 && (
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                                                            +{coach.skills.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Experience & Actions */}
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="text-center px-3">
                                                <p className="text-lg font-bold text-gray-900">{coach.experienceYears}</p>
                                                <p className="text-xs text-gray-500">Years Exp</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="outline" size="sm" onClick={() => openEditModal(coach)} title="Edit">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm"
                                                    onClick={() => setShowDeleteConfirm(coach.staffId)}
                                                    className="text-red-600 hover:bg-red-50" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delete Confirmation */}
                            {showDeleteConfirm === coach.staffId && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                                    <Card className="border-red-200 bg-red-50">
                                        <CardContent className="p-3 flex items-center justify-between">
                                            <p className="text-sm text-red-700">
                                                Are you sure you want to remove <strong>{coach.personalInfo.firstName} {coach.personalInfo.lastName}</strong>?
                                            </p>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
                                                <Button size="sm" className="bg-red-600 text-white hover:bg-red-700"
                                                    onClick={() => handleDeleteCoach(coach.staffId)}>
                                                    Confirm Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                        Next <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* ==================== CREATE COACH MODAL ==================== */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                                        <Plus className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-semibold">Add New Coach</h2>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">First Name *</label>
                                        <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="e.g. Sarah" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name *</label>
                                        <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="e.g. Johnson" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="coach@proactiv.com" />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Password *</label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Min 8 characters"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Coach will use this to login at /login/staff</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1-555-0100" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Experience (years)</label>
                                        <Input type="number" min={0} value={formData.experienceYears}
                                            onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Max Hours/Week</label>
                                        <Input type="number" min={1} max={80} value={formData.maxHoursPerWeek}
                                            onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: Number(e.target.value) })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Specializations</label>
                                    <Input
                                        placeholder="Gymnastics, Swimming, Dance (comma separated)"
                                        value={formData.specializations?.join(', ')}
                                        onChange={(e) => setFormData({ ...formData, specializations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Skills</label>
                                    <Input
                                        placeholder="Yoga, Pilates, Strength Training (comma separated)"
                                        value={formData.skills?.join(', ')}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 p-5 border-t bg-gray-50 rounded-b-xl">
                                <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                                <Button onClick={handleCreateCoach} disabled={isSaving}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                    {isSaving ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                                    {isSaving ? 'Creating...' : 'Create Coach'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================== EDIT COACH MODAL ==================== */}
            <AnimatePresence>
                {showEditModal && editingCoach && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-5 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                                        <Edit2 className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-semibold">
                                        Edit Coach: {editingCoach.personalInfo.firstName} {editingCoach.personalInfo.lastName}
                                    </h2>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                                        <Input value={editFormData.personalInfo?.firstName || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, personalInfo: { ...editFormData.personalInfo, firstName: e.target.value } })} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                                        <Input value={editFormData.personalInfo?.lastName || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, personalInfo: { ...editFormData.personalInfo, lastName: e.target.value } })} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                                    <Input value={editFormData.contactInfo?.phone || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, contactInfo: { ...editFormData.contactInfo, phone: e.target.value } })} />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                                    <select
                                        value={editFormData.status || 'active'}
                                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="active">Active</option>
                                        <option value="on_leave">On Leave</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Experience (years)</label>
                                    <Input type="number" min={0} value={editFormData.experienceYears || 0}
                                        onChange={(e) => setEditFormData({ ...editFormData, experienceYears: Number(e.target.value) })} />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Specializations</label>
                                    <Input
                                        value={editFormData.specializations?.join(', ') || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, specializations: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Skills</label>
                                    <Input
                                        value={editFormData.skills?.join(', ') || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 p-5 border-t bg-gray-50 rounded-b-xl">
                                <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                                <Button onClick={handleEditCoach} disabled={isSaving}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                    {isSaving ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
