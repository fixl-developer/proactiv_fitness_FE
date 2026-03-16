'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Building2, AlertTriangle, CheckCircle, Wrench, Calendar,
    Plus, Edit2, Trash2, Eye, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function LocationFacilitiesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [facilities, setFacilities] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchFacilities()
    }, [searchTerm, filterStatus])

    const fetchFacilities = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Mock data for development
            setFacilities([
                {
                    id: '1',
                    name: 'Main Gym Floor',
                    type: 'Gymnasium',
                    capacity: 50,
                    status: 'OPERATIONAL',
                    lastMaintenance: '2024-03-10',
                    nextMaintenance: '2024-04-10',
                    condition: 'Excellent',
                    issues: 0
                },
                {
                    id: '2',
                    name: 'Trampoline Area',
                    type: 'Specialized Equipment',
                    capacity: 20,
                    status: 'OPERATIONAL',
                    lastMaintenance: '2024-02-15',
                    nextMaintenance: '2024-03-15',
                    condition: 'Good',
                    issues: 1
                },
                {
                    id: '3',
                    name: 'Locker Rooms',
                    type: 'Facility',
                    capacity: 100,
                    status: 'MAINTENANCE',
                    lastMaintenance: '2024-03-05',
                    nextMaintenance: '2024-04-05',
                    condition: 'Fair',
                    issues: 2
                },
                {
                    id: '4',
                    name: 'Party Room',
                    type: 'Event Space',
                    capacity: 30,
                    status: 'OPERATIONAL',
                    lastMaintenance: '2024-03-01',
                    nextMaintenance: '2024-04-01',
                    condition: 'Excellent',
                    issues: 0
                },
            ])
        } catch (err: any) {
            console.error('Error fetching facilities:', err)
            setError(err.message || 'Failed to fetch facilities')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteFacility = async (facilityId: string) => {
        if (confirm('Are you sure you want to delete this facility?')) {
            try {
                fetchFacilities()
            } catch (err: any) {
                alert('Failed to delete facility: ' + err.message)
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
                    <h1 className="text-3xl font-bold text-gray-900">Facilities Management</h1>
                    <p className="text-gray-600 mt-1">Manage location facilities and equipment</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Facility
                </button>
            </div>

            {/* Facility Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Total Facilities',
                        value: '4',
                        icon: Building2,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Operational',
                        value: '3',
                        icon: CheckCircle,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Under Maintenance',
                        value: '1',
                        icon: Wrench,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50'
                    },
                    {
                        title: 'Issues Reported',
                        value: '3',
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
                            <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search facilities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
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
                    <motion.div
                        key={facility.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                                            <Badge variant={facility.status === 'OPERATIONAL' ? 'default' : 'secondary'}>
                                                {facility.status}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Type</p>
                                                <p className="text-sm font-medium text-gray-900">{facility.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Capacity</p>
                                                <p className="text-sm font-medium text-gray-900">{facility.capacity} people</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Condition</p>
                                                <p className="text-sm font-medium text-gray-900">{facility.condition}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Issues</p>
                                                <p className="text-sm font-medium text-gray-900">{facility.issues}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Last Maintenance</p>
                                                <p className="text-sm font-medium text-gray-900">{facility.lastMaintenance}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Next Maintenance</p>
                                                <p className="text-sm font-medium text-gray-900">{facility.nextMaintenance}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFacility(facility.id)}
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

            {facilities.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No facilities found</p>
                    </CardContent>
                </Card>
            )}

            {/* Maintenance Schedule */}
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
                                        <p className="text-xs text-gray-600">{facility.nextMaintenance}</p>
                                    </div>
                                    <Badge variant="outline">Scheduled</Badge>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>

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
