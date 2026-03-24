'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Building2, AlertTriangle, CheckCircle, Wrench, Calendar,
    Plus, Edit2, Trash2, Eye, AlertCircle, X, Save
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LocationManagerService } from '@/services/locationManagerService'

export default function LocationFacilitiesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [facilities, setFacilities] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [editingFacility, setEditingFacility] = useState<any>(null)
    const [formData, setFormData] = useState({ name: '', type: '', capacity: 20, status: 'OPERATIONAL', condition: 'GOOD' })
    const [isSaving, setIsSaving] = useState(false)

    const fetchFacilities = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const statusParam = filterStatus !== 'all' ? filterStatus.toUpperCase() : undefined
            const result = await LocationManagerService.getFacilities(page, 10, searchTerm || undefined, statusParam)
            setFacilities(result?.data || [])
            setTotalPages(result?.totalPages || 1)
        } catch (err: any) {
            console.error('Error fetching facilities:', err)
            setError(err.message || 'Failed to fetch facilities')
            setFacilities([])
        } finally {
            setIsLoading(false)
        }
    }, [page, searchTerm, filterStatus])

    useEffect(() => {
        fetchFacilities()
    }, [fetchFacilities])

    const handleOpenCreate = () => {
        setEditingFacility(null)
        setFormData({ name: '', type: '', capacity: 20, status: 'OPERATIONAL', condition: 'GOOD' })
        setShowModal(true)
    }

    const handleOpenEdit = (facility: any) => {
        setEditingFacility(facility)
        setFormData({
            name: facility.name || '',
            type: facility.type || '',
            capacity: facility.capacity || 20,
            status: facility.status || 'OPERATIONAL',
            condition: facility.condition || 'GOOD'
        })
        setShowModal(true)
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            if (editingFacility) {
                await LocationManagerService.updateFacility(editingFacility.id || editingFacility._id, formData)
            } else {
                await LocationManagerService.createFacility(formData)
            }
            setShowModal(false)
            fetchFacilities()
        } catch (err: any) {
            alert('Failed to save facility: ' + err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteFacility = async (facilityId: string) => {
        if (confirm('Are you sure you want to delete this facility?')) {
            try {
                await LocationManagerService.deleteFacility(facilityId)
                fetchFacilities()
            } catch (err: any) {
                alert('Failed to delete facility: ' + err.message)
            }
        }
    }

    // Compute summary from data
    const totalFacilities = facilities.length
    const operational = facilities.filter(f => (f.status || '').toUpperCase() === 'OPERATIONAL').length
    const underMaintenance = facilities.filter(f => (f.status || '').toUpperCase() === 'MAINTENANCE').length
    const totalIssues = facilities.reduce((sum: number, f: any) => sum + (f.issues || 0), 0)

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
                    <h1 className="text-3xl font-bold text-gray-900">Facilities Management</h1>
                    <p className="text-gray-600 mt-1">Manage location facilities and equipment</p>
                </div>
                <button id="admin-location-facilities-btn" onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Facility
                </button>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Facility Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Total Facilities', value: totalFacilities, icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
                    { title: 'Operational', value: operational, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
                    { title: 'Under Maintenance', value: underMaintenance, icon: Wrench, color: 'text-orange-600', bgColor: 'bg-orange-50' },
                    { title: 'Issues Reported', value: totalIssues, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input placeholder="Search facilities..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }} className="pl-10" />
                        </div>
                        <select id="select-admin-location-facilities-1" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Status</option>
                            <option value="operational">Operational</option>
                            <option value="maintenance">Under Maintenance</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Facilities List */}
            <div className="space-y-4">
                {facilities.map((facility, idx) => (
                    <motion.div key={facility.id || facility._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                                            <Badge variant={(facility.status || '').toUpperCase() === 'OPERATIONAL' ? 'default' : 'secondary'}>
                                                {facility.status || 'N/A'}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Type</p>
                                                <p className="text-sm font-medium text-gray-900">{facility.type || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Capacity</p>
                                                <p className="text-sm font-medium text-gray-900">{facility.capacity || 0} people</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Condition</p>
                                                <p className="text-sm font-medium text-gray-900">{facility.condition || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Issues</p>
                                                <p className="text-sm font-medium text-gray-900">{facility.issues || 0}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Last Maintenance</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {facility.lastMaintenance ? new Date(facility.lastMaintenance).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Next Maintenance</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {facility.nextMaintenance ? new Date(facility.nextMaintenance).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button id="admin-location-facilities-btn-2" onClick={() => handleOpenEdit(facility)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button id="admin-location-facilities-btn-3" onClick={() => handleDeleteFacility(facility.id || facility._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {facilities.length === 0 && !error && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No facilities found</p>
                    </CardContent>
                </Card>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button id="admin-location-facilities-btn-4" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Previous</button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button id="admin-location-facilities-btn-5" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
                </div>
            )}

            {/* Maintenance Schedule */}
            {facilities.filter(f => f.nextMaintenance).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Upcoming Maintenance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {facilities
                                .filter(f => f.nextMaintenance)
                                .sort((a, b) => new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime())
                                .map((facility, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{facility.name}</p>
                                            <p className="text-xs text-gray-600">{new Date(facility.nextMaintenance).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="outline">Scheduled</Badge>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">{editingFacility ? 'Edit Facility' : 'Add New Facility'}</h2>
                            <button id="admin-location-facilities-btn-6" onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name</label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Main Gym Floor" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <Input value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder="e.g., Gymnasium" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                <Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="OPERATIONAL">Operational</option>
                                    <option value="MAINTENANCE">Under Maintenance</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t">
                            <button id="admin-location-facilities-btn-7" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button id="admin-location-facilities-btn-8" onClick={handleSave} disabled={isSaving || !formData.name}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                                {editingFacility ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
