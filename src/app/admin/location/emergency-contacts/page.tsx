'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Phone, AlertTriangle, Users, Shield, Search,
    Plus, Edit2, Trash2, Eye, MapPin, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function LocationEmergencyContactsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [emergencyContacts, setEmergencyContacts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchEmergencyContacts()
    }, [searchTerm, filterType])

    const fetchEmergencyContacts = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Mock data for development
            setEmergencyContacts([
                {
                    id: '1',
                    studentName: 'Emma Johnson',
                    parentName: 'Sarah Johnson',
                    contactName: 'Michael Johnson',
                    relationship: 'Father',
                    primaryPhone: '+852 9876 5432',
                    alternatePhone: '+852 2345 6789',
                    email: 'michael.johnson@email.com',
                    address: '123 Happy Valley Road, Hong Kong',
                    isAuthorizedPickup: true,
                    medicalInfo: 'No known allergies',
                    lastUpdated: '2024-03-10',
                    status: 'VERIFIED'
                },
                {
                    id: '2',
                    studentName: 'Alex Chen',
                    parentName: 'Michael Chen',
                    contactName: 'Lisa Chen',
                    relationship: 'Aunt',
                    primaryPhone: '+852 9876 5433',
                    alternatePhone: '+852 2345 6788',
                    email: 'lisa.chen@email.com',
                    address: '456 Central District, Hong Kong',
                    isAuthorizedPickup: true,
                    medicalInfo: 'Asthma - inhaler required',
                    lastUpdated: '2024-03-08',
                    status: 'VERIFIED'
                },
                {
                    id: '3',
                    studentName: 'Lily Wong',
                    parentName: 'Jenny Wong',
                    contactName: 'David Wong',
                    relationship: 'Uncle',
                    primaryPhone: '+852 9876 5434',
                    alternatePhone: null,
                    email: 'david.wong@email.com',
                    address: '789 Tsim Sha Tsui, Hong Kong',
                    isAuthorizedPickup: false,
                    medicalInfo: 'Peanut allergy - severe',
                    lastUpdated: '2024-03-05',
                    status: 'PENDING'
                },
                {
                    id: '4',
                    studentName: 'Ryan Lee',
                    parentName: 'David Lee',
                    contactName: 'Grace Lee',
                    relationship: 'Grandmother',
                    primaryPhone: '+852 9876 5435',
                    alternatePhone: '+852 2345 6787',
                    email: 'grace.lee@email.com',
                    address: '321 Wan Chai, Hong Kong',
                    isAuthorizedPickup: true,
                    medicalInfo: 'Lactose intolerant',
                    lastUpdated: '2024-03-01',
                    status: 'EXPIRED'
                }
            ])
        } catch (err: any) {
            console.error('Error fetching emergency contacts:', err)
            setError(err.message || 'Failed to fetch emergency contacts')
        } finally {
            setIsLoading(false)
        }
    }
    const handleVerifyContact = async (contactId: string) => {
        try {
            // API call would go here
            alert('Contact verified successfully!')
            fetchEmergencyContacts()
        } catch (err: any) {
            alert('Failed to verify contact: ' + err.message)
        }
    }

    const handleDeleteContact = async (contactId: string) => {
        if (confirm('Are you sure you want to delete this emergency contact?')) {
            try {
                // API call would go here
                fetchEmergencyContacts()
            } catch (err: any) {
                alert('Failed to delete contact: ' + err.message)
            }
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VERIFIED': return 'bg-green-100 text-green-800'
            case 'PENDING': return 'bg-yellow-100 text-yellow-800'
            case 'EXPIRED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
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
                    <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
                    <p className="text-gray-600 mt-1">Manage student emergency contact information</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Contact
                </button>
            </div>

            {/* Emergency Contact Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Total Contacts',
                        value: '4',
                        icon: Users,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Verified',
                        value: '2',
                        icon: Shield,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Pending Verification',
                        value: '1',
                        icon: Clock,
                        color: 'text-yellow-600',
                        bgColor: 'bg-yellow-50'
                    },
                    {
                        title: 'Expired',
                        value: '1',
                        icon: AlertTriangle,
                        color: 'text-red-600',
                        bgColor: 'bg-red-50'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
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
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search students or contacts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
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
                    <motion.div
                        key={contact.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{contact.contactName}</h3>
                                            <Badge className={getStatusColor(contact.status)}>
                                                {contact.status}
                                            </Badge>
                                            {contact.isAuthorizedPickup && (
                                                <Badge variant="outline" className="text-green-600 border-green-600">
                                                    Authorized Pickup
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Student</p>
                                                <p className="text-sm font-medium text-gray-900">{contact.studentName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Relationship</p>
                                                <p className="text-sm font-medium text-gray-900">{contact.relationship}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Primary Phone</p>
                                                <p className="text-sm font-medium text-gray-900">{contact.primaryPhone}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Email</p>
                                                <p className="text-sm font-medium text-gray-900">{contact.email}</p>
                                            </div>
                                            {contact.alternatePhone && (
                                                <div>
                                                    <p className="text-xs text-gray-600">Alternate Phone</p>
                                                    <p className="text-sm font-medium text-gray-900">{contact.alternatePhone}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs text-gray-600">Last Updated</p>
                                                <p className="text-sm font-medium text-gray-900">{contact.lastUpdated}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-600">Address</p>
                                            <p className="text-sm text-gray-700 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {contact.address}
                                            </p>
                                        </div>
                                        {contact.medicalInfo && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-600">Medical Information</p>
                                                <p className="text-sm text-gray-700 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                                    {contact.medicalInfo}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {contact.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleVerifyContact(contact.id)}
                                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                            >
                                                Verify
                                            </button>
                                        )}
                                        <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                            <Phone className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteContact(contact.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {emergencyContacts.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No emergency contacts found</p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ {error} - Showing mock data for development
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
