'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Eye, Users, Mail, Phone, CheckCircle, AlertCircle, X, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LocationManagerService } from '@/services/locationManagerService'

export default function LocationStaffPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [staff, setStaff] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [editingStaff, setEditingStaff] = useState<any>(null)
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'COACH', status: 'ACTIVE' })
    const [isSaving, setIsSaving] = useState(false)

    const fetchStaff = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const roleParam = filterRole !== 'all' ? filterRole : undefined
            const statusParam = filterStatus !== 'all' ? filterStatus : undefined
            const result = await LocationManagerService.getStaff(page, 10, searchTerm || undefined, roleParam, statusParam)
            setStaff(result?.data || [])
            setTotalPages(result?.totalPages || 1)
        } catch (err: any) {
            console.error('Error fetching staff:', err)
            setError(err.message || 'Failed to fetch staff')
            setStaff([])
        } finally {
            setIsLoading(false)
        }
    }, [page, searchTerm, filterRole, filterStatus])

    useEffect(() => {
        fetchStaff()
    }, [fetchStaff])

    const handleOpenCreate = () => {
        setEditingStaff(null)
        setFormData({ name: '', email: '', phone: '', role: 'COACH', status: 'ACTIVE' })
        setShowModal(true)
    }

    const handleOpenEdit = (member: any) => {
        setEditingStaff(member)
        setFormData({
            name: member.name || '',
            email: member.email || '',
            phone: member.phone || '',
            role: member.role || 'COACH',
            status: member.status || 'ACTIVE'
        })
        setShowModal(true)
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            if (editingStaff) {
                await LocationManagerService.updateStaff(editingStaff.id || editingStaff._id, formData)
            } else {
                await LocationManagerService.createStaff(formData)
            }
            setShowModal(false)
            fetchStaff()
        } catch (err: any) {
            alert('Failed to save staff: ' + err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteStaff = async (staffId: string) => {
        if (confirm('Are you sure you want to delete this staff member?')) {
            try {
                await LocationManagerService.deleteStaff(staffId)
                fetchStaff()
            } catch (err: any) {
                alert('Failed to delete staff: ' + err.message)
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
                    <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-gray-600 mt-1">Manage location staff members</p>
                </div>
                <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Staff
                </button>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input placeholder="Search staff..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }} className="pl-10" />
                        </div>
                        <select data-testid="select-admin-location-staff-1" value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1) }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Roles</option>
                            <option value="COACH">Coach</option>
                            <option value="MANAGER">Manager</option>
                            <option value="SUPPORT_STAFF">Support Staff</option>
                        </select>
                        <select data-testid="select-admin-location-staff-2" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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

            {/* Staff Table */}
            <Card>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilization</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((member, idx) => (
                                    <motion.tr
                                        key={member.id || member._id || idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-900">{member.name || `${member.personalInfo?.firstName || ''} ${member.personalInfo?.lastName || ''}`.trim() || 'N/A'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">{member.email || member.contactInfo?.email || 'N/A'}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline">{member.role || member.staffType || 'N/A'}</Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                {(member.status || '').toLowerCase() === 'active' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-gray-400" />
                                                )}
                                                <Badge variant={(member.status || '').toLowerCase() === 'active' ? 'default' : 'secondary'}>
                                                    {member.status || 'N/A'}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600" style={{ width: `${member.utilization || 0}%` }}></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{member.utilization || 0}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenEdit(member)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteStaff(member.id || member._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {staff.length === 0 && !error && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No staff members found</p>
                    </CardContent>
                </Card>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Previous</button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email address" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone number" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="COACH">Coach</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="SUPPORT_STAFF">Support Staff</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t">
                            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} disabled={isSaving || !formData.name || !formData.email}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                                {editingStaff ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
