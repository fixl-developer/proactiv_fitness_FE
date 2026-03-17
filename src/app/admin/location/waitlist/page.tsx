'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Clock, CheckCircle, XCircle, AlertCircle,
    Plus, Edit2, Trash2, Eye, Filter, Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function LocationWaitlistPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [waitlistEntries, setWaitlistEntries] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchWaitlistEntries()
    }, [searchTerm, filterStatus])

    const fetchWaitlistEntries = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Mock data for development
            setWaitlistEntries([
                {
                    id: '1',
                    studentName: 'Emma Johnson',
                    parentName: 'Sarah Johnson',
                    parentEmail: 'sarah.johnson@email.com',
                    parentPhone: '+852 9876 5432',
                    className: 'Beginner Gymnastics',
                    classTime: 'Monday 4:00 PM',
                    position: 1,
                    joinedDate: '2024-03-10',
                    status: 'ACTIVE',
                    priority: 'HIGH',
                    notes: 'Flexible with timing'
                },
                {
                    id: '2',
                    studentName: 'Alex Chen',
                    parentName: 'Michael Chen',
                    parentEmail: 'michael.chen@email.com',
                    parentPhone: '+852 9876 5433',
                    className: 'Intermediate Gymnastics',
                    classTime: 'Wednesday 5:00 PM',
                    position: 2,
                    joinedDate: '2024-03-08',
                    status: 'ACTIVE',
                    priority: 'MEDIUM',
                    notes: 'Prefers evening classes'
                },
                {
                    id: '3',
                    studentName: 'Lily Wong',
                    parentName: 'Jenny Wong',
                    parentEmail: 'jenny.wong@email.com',
                    parentPhone: '+852 9876 5434',
                    className: 'Advanced Gymnastics',
                    classTime: 'Friday 6:00 PM',
                    position: 1,
                    joinedDate: '2024-03-05',
                    status: 'OFFERED',
                    priority: 'HIGH',
                    notes: 'Spot offered, awaiting response'
                },
                {
                    id: '4',
                    studentName: 'Ryan Lee',
                    parentName: 'David Lee',
                    parentEmail: 'david.lee@email.com',
                    parentPhone: '+852 9876 5435',
                    className: 'Beginner Gymnastics',
                    classTime: 'Saturday 10:00 AM',
                    position: 3,
                    joinedDate: '2024-03-01',
                    status: 'EXPIRED',
                    priority: 'LOW',
                    notes: 'Offer expired, no response'
                }
            ])
        } catch (err: any) {
            console.error('Error fetching waitlist entries:', err)
            setError(err.message || 'Failed to fetch waitlist entries')
        } finally {
            setIsLoading(false)
        }
    }
    const handleOfferSpot = async (entryId: string) => {
        try {
            // API call would go here
            alert('Spot offered successfully!')
            fetchWaitlistEntries()
        } catch (err: any) {
            alert('Failed to offer spot: ' + err.message)
        }
    }

    const handleRemoveFromWaitlist = async (entryId: string) => {
        if (confirm('Are you sure you want to remove this entry from the waitlist?')) {
            try {
                // API call would go here
                fetchWaitlistEntries()
            } catch (err: any) {
                alert('Failed to remove from waitlist: ' + err.message)
            }
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800'
            case 'OFFERED': return 'bg-blue-100 text-blue-800'
            case 'EXPIRED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return 'bg-red-100 text-red-800'
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
            case 'LOW': return 'bg-gray-100 text-gray-800'
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
                    <h1 className="text-3xl font-bold text-gray-900">Waitlist Management</h1>
                    <p className="text-gray-600 mt-1">Manage class waitlists and student enrollment</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add to Waitlist
                </button>
            </div>

            {/* Waitlist Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Total Waitlisted',
                        value: '4',
                        icon: Users,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Active Entries',
                        value: '2',
                        icon: Clock,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Spots Offered',
                        value: '1',
                        icon: CheckCircle,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50'
                    },
                    {
                        title: 'Expired Offers',
                        value: '1',
                        icon: XCircle,
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
                                placeholder="Search students or parents..."
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
                            <option value="active">Active</option>
                            <option value="offered">Offered</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Waitlist Entries */}
            <div className="space-y-4">
                {waitlistEntries.map((entry, idx) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{entry.studentName}</h3>
                                            <Badge className={getStatusColor(entry.status)}>
                                                {entry.status}
                                            </Badge>
                                            <Badge className={getPriorityColor(entry.priority)}>
                                                {entry.priority}
                                            </Badge>
                                            <span className="text-sm text-gray-600">Position #{entry.position}</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Parent</p>
                                                <p className="text-sm font-medium text-gray-900">{entry.parentName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Class</p>
                                                <p className="text-sm font-medium text-gray-900">{entry.className}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Time</p>
                                                <p className="text-sm font-medium text-gray-900">{entry.classTime}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Email</p>
                                                <p className="text-sm font-medium text-gray-900">{entry.parentEmail}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Phone</p>
                                                <p className="text-sm font-medium text-gray-900">{entry.parentPhone}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Joined</p>
                                                <p className="text-sm font-medium text-gray-900">{entry.joinedDate}</p>
                                            </div>
                                        </div>
                                        {entry.notes && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-600">Notes</p>
                                                <p className="text-sm text-gray-700">{entry.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {entry.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => handleOfferSpot(entry.id)}
                                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                            >
                                                Offer Spot
                                            </button>
                                        )}
                                        <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveFromWaitlist(entry.id)}
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

            {waitlistEntries.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No waitlist entries found</p>
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
