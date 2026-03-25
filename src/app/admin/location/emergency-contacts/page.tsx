'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Phone, AlertTriangle, Users, Shield, Search,
    Plus, Edit2, Trash2, Eye, MapPin, Clock, X, Save
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LocationManagerService } from '@/services/locationManagerService'

export default function LocationEmergencyContactsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [emergencyContacts, setEmergencyContacts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [editingContact, setEditingContact] = useState<any>(null)
    const [formData, setFormData] = useState({
        contactName: '', relationship: '', primaryPhone: '', alternatePhone: '',
        email: '', address: '', isAuthorizedPickup: false, medicalInfo: ''
    })
    const [isSaving, setIsSaving] = useState(false)

    const fetchEmergencyContacts = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const statusParam = filterType !== 'all' ? filterType.toUpperCase() : undefined
            const result = await LocationManagerService.getEmergencyContacts(page, 10, searchTerm || undefined, statusParam)
            setEmergencyContacts(result?.data || [])
            setTotalPages(result?.totalPages || 1)
        } catch (err: any) {
            console.error('Error fetching emergency contacts:', err)
            setError(err.message || 'Failed to fetch emergency contacts')
            setEmergencyContacts([])
        } finally {
            setIsLoading(false)
        }
    }, [page, searchTerm, filterType])

    useEffect(() => {
        fetchEmergencyContacts()
    }, [fetchEmergencyContacts])

    const handleOpenCreate = () => {
        setEditingContact(null)
        setFormData({ contactName: '', relationship: '', primaryPhone: '', alternatePhone: '', email: '', address: '', isAuthorizedPickup: false, medicalInfo: '' })
        setShowModal(true)
    }

    const handleOpenEdit = (contact: any) => {
        setEditingContact(contact)
        setFormData({
            contactName: contact.contactName || '',
            relationship: contact.relationship || '',
            primaryPhone: contact.primaryPhone || '',
            alternatePhone: contact.alternatePhone || '',
            email: contact.email || '',
            address: contact.address || '',
            isAuthorizedPickup: contact.isAuthorizedPickup || false,
            medicalInfo: contact.medicalInfo || ''
        })
        setShowModal(true)
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            if (editingContact) {
                await LocationManagerService.updateEmergencyContact(editingContact.id || editingContact._id, formData)
            } else {
                await LocationManagerService.createEmergencyContact(formData)
            }
            setShowModal(false)
            fetchEmergencyContacts()
        } catch (err: any) {
            alert('Failed to save contact: ' + err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleVerifyContact = async (contactId: string) => {
        try {
            await LocationManagerService.verifyEmergencyContact(contactId)
            fetchEmergencyContacts()
        } catch (err: any) {
            alert('Failed to verify contact: ' + err.message)
        }
    }

    const handleDeleteContact = async (contactId: string) => {
        if (confirm('Are you sure you want to delete this emergency contact?')) {
            try {
                await LocationManagerService.deleteEmergencyContact(contactId)
                fetchEmergencyContacts()
            } catch (err: any) {
                alert('Failed to delete contact: ' + err.message)
            }
        }
    }

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'VERIFIED': return 'bg-green-100 text-green-800'
            case 'PENDING': return 'bg-yellow-100 text-yellow-800'
            case 'EXPIRED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Compute summary from data
    const totalContacts = emergencyContacts.length
    const verified = emergencyContacts.filter(c => c.status?.toUpperCase() === 'VERIFIED').length
    const pending = emergencyContacts.filter(c => c.status?.toUpperCase() === 'PENDING').length
    const expired = emergencyContacts.filter(c => c.status?.toUpperCase() === 'EXPIRED').length

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
                    <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
                    <p className="text-gray-600 mt-1">Manage student emergency contact information</p>
                </div>
                <button id="admin-location-emergency-contacts-btn" onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Contact
                </button>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Emergency Contact Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Total Contacts', value: totalContacts, icon: Users, cardBg: 'bg-gradient-to-br from-blue-50 to-blue-100', iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', titleColor: 'text-blue-700', valueColor: 'text-blue-900' },
                    { title: 'Verified', value: verified, icon: Shield, cardBg: 'bg-gradient-to-br from-green-50 to-green-100', iconBg: 'bg-gradient-to-br from-green-500 to-green-600', titleColor: 'text-green-700', valueColor: 'text-green-900' },
                    { title: 'Pending Verification', value: pending, icon: Clock, cardBg: 'bg-gradient-to-br from-yellow-50 to-yellow-100', iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600', titleColor: 'text-yellow-700', valueColor: 'text-yellow-900' },
                    { title: 'Expired', value: expired, icon: AlertTriangle, cardBg: 'bg-gradient-to-br from-red-50 to-red-100', iconBg: 'bg-gradient-to-br from-red-500 to-red-600', titleColor: 'text-red-700', valueColor: 'text-red-900' },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`${metric.cardBg} border-0 shadow-sm hover:shadow-lg transition-shadow`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${metric.titleColor}`}>{metric.title}</p>
                                        <p className={`text-2xl font-bold ${metric.valueColor} mt-2`}>{metric.value}</p>
                                    </div>
                                    <div className={`${metric.iconBg} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
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
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input placeholder="Search students or contacts..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }} className="pl-10" />
                        </div>
                        <select id="select-admin-location-emergency-contacts-1" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Contacts</option>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Emergency Contacts List */}
            <div className="space-y-4">
                {emergencyContacts.map((contact, idx) => (
                    <motion.div key={contact.id || contact._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{contact.contactName}</h3>
                                            <Badge className={getStatusColor(contact.status)}>{contact.status || 'N/A'}</Badge>
                                            {contact.isAuthorizedPickup && (
                                                <Badge variant="outline" className="text-green-600 border-green-600">Authorized Pickup</Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Student</p>
                                                <p className="text-sm font-medium text-gray-900">{contact.studentName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Relationship</p>
                                                <p className="text-sm font-medium text-gray-900">{contact.relationship || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Primary Phone</p>
                                                <p className="text-sm font-medium text-gray-900">{contact.primaryPhone || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Email</p>
                                                <p className="text-sm font-medium text-gray-900">{contact.email || 'N/A'}</p>
                                            </div>
                                            {contact.alternatePhone && (
                                                <div>
                                                    <p className="text-xs text-gray-600">Alternate Phone</p>
                                                    <p className="text-sm font-medium text-gray-900">{contact.alternatePhone}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs text-gray-600">Last Updated</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {contact.lastUpdated || contact.updatedAt ? new Date(contact.lastUpdated || contact.updatedAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        {contact.address && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-600">Address</p>
                                                <p className="text-sm text-gray-700 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />{contact.address}
                                                </p>
                                            </div>
                                        )}
                                        {contact.medicalInfo && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-600">Medical Information</p>
                                                <p className="text-sm text-gray-700 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3 text-red-500" />{contact.medicalInfo}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {contact.status?.toUpperCase() === 'PENDING' && (
                                            <button id="admin-location-emergency-contacts-btn-2" onClick={() => handleVerifyContact(contact.id || contact._id)}
                                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">Verify</button>
                                        )}
                                        <button id="admin-location-emergency-contacts-btn-3" onClick={() => handleOpenEdit(contact)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button id="admin-location-emergency-contacts-btn-4" onClick={() => handleDeleteContact(contact.id || contact._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {emergencyContacts.length === 0 && !error && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No emergency contacts found</p>
                    </CardContent>
                </Card>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button id="admin-location-emergency-contacts-btn-5" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Previous</button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button id="admin-location-emergency-contacts-btn-6" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">Next</button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">{editingContact ? 'Edit Contact' : 'Add New Contact'}</h2>
                            <button id="admin-location-emergency-contacts-btn-7" onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                <Input value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} placeholder="Full name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                <Input value={formData.relationship} onChange={(e) => setFormData({ ...formData, relationship: e.target.value })} placeholder="e.g., Father, Mother, Guardian" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone</label>
                                <Input type="tel" value={formData.primaryPhone} onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })} placeholder="Phone number" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                                <Input type="tel" value={formData.alternatePhone} onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })} placeholder="Optional" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email address" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Info</label>
                                <Input value={formData.medicalInfo} onChange={(e) => setFormData({ ...formData, medicalInfo: e.target.value })} placeholder="Allergies, conditions, etc." />
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" checked={formData.isAuthorizedPickup}
                                    onChange={(e) => setFormData({ ...formData, isAuthorizedPickup: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                                <label className="text-sm font-medium text-gray-700">Authorized for Pickup</label>
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t">
                            <button id="admin-location-emergency-contacts-btn-8" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button id="admin-location-emergency-contacts-btn-9" onClick={handleSave} disabled={isSaving || !formData.contactName || !formData.primaryPhone}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                                {editingContact ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
