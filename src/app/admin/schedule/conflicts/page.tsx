'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    AlertTriangle, Calendar, Clock, Users, MapPin, User,
    CheckCircle, XCircle, RefreshCw, Filter, Search,
    Eye, Edit, MessageSquare, Phone, Mail, Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const ScheduleConflictsPage = () => {
    const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Schedule conflicts data
    const conflicts = [
        {
            id: 1,
            type: 'coach_double_booking',
            severity: 'critical',
            status: 'unresolved',
            location: 'Cyberport',
            date: '2024-01-25',
            time: '4:00 PM - 5:00 PM',
            description: 'Sarah Chen scheduled for two classes simultaneously',
            affectedClasses: [
                {
                    id: 'C001',
                    name: 'Beginner Gymnastics',
                    students: 8,
                    studio: 'Studio A'
                },
                {
                    id: 'C002',
                    name: 'GYMTOTS',
                    students: 6,
                    studio: 'Studio B'
                }
            ],
            coach: 'Sarah Chen',
            suggestedActions: [
                'Assign substitute coach for one class',
                'Reschedule one class to different time',
                'Merge classes if skill levels compatible'
            ],
            createdAt: '2024-01-20 09:30 AM',
            lastUpdated: '2024-01-22 02:15 PM'
        },
        {
            id: 2,
            type: 'studio_overlap',
            severity: 'high',
            status: 'in_progress',
            location: 'Wan Chai',
            date: '2024-01-26',
            time: '3:30 PM - 4:30 PM',
            description: 'Studio A booked for overlapping classes',
            affectedClasses: [
                {
                    id: 'C003',
                    name: 'Intermediate Gymnastics',
                    students: 10,
                    studio: 'Studio A'
                },
                {
                    id: 'C004',
                    name: 'Advanced Skills',
                    students: 6,
                    studio: 'Studio A'
                }
            ],
            coach: 'Monica Liu',
            suggestedActions: [
                'Move one class to Studio B',
                'Adjust class timing by 30 minutes',
                'Use outdoor space if weather permits'
            ],
            createdAt: '2024-01-21 11:45 AM',
            lastUpdated: '2024-01-23 10:20 AM',
            assignedTo: 'Location Manager'
        },
        {
            id: 3,
            type: 'capacity_exceeded',
            severity: 'medium',
            status: 'resolved',
            location: 'Sha Tin',
            date: '2024-01-24',
            time: '5:00 PM - 6:00 PM',
            description: 'Class enrollment exceeds studio capacity',
            affectedClasses: [
                {
                    id: 'C005',
                    name: 'Beginner Gymnastics',
                    students: 12,
                    studio: 'Studio A',
                    capacity: 10
                }
            ],
            coach: 'Alex Wong',
            suggestedActions: [
                'Split class into two sessions',
                'Move to larger studio',
                'Add waitlist for future classes'
            ],
            createdAt: '2024-01-19 03:20 PM',
            lastUpdated: '2024-01-24 09:00 AM',
            resolvedBy: 'Admin',
            resolution: 'Class moved to larger Studio B, all students accommodated'
        },
        {
            id: 4,
            type: 'coach_unavailable',
            severity: 'high',
            status: 'unresolved',
            location: 'Cyberport',
            date: '2024-01-27',
            time: '10:00 AM - 11:00 AM',
            description: 'Coach marked unavailable but has scheduled class',
            affectedClasses: [
                {
                    id: 'C006',
                    name: 'GYMTOTS',
                    students: 8,
                    studio: 'Studio A'
                }
            ],
            coach: 'Juan Rodriguez',
            suggestedActions: [
                'Find substitute coach',
                'Reschedule class',
                'Cancel class and notify parents'
            ],
            createdAt: '2024-01-22 08:15 AM',
            lastUpdated: '2024-01-22 08:15 AM'
        },
        {
            id: 5,
            type: 'equipment_conflict',
            severity: 'low',
            status: 'in_progress',
            location: 'Wan Chai',
            date: '2024-01-28',
            time: '2:00 PM - 3:00 PM',
            description: 'Specialized equipment needed by multiple classes',
            affectedClasses: [
                {
                    id: 'C007',
                    name: 'Advanced Gymnastics',
                    students: 6,
                    studio: 'Studio A'
                },
                {
                    id: 'C008',
                    name: 'Competition Prep',
                    students: 4,
                    studio: 'Studio B'
                }
            ],
            coach: 'Monica Liu',
            suggestedActions: [
                'Stagger equipment usage',
                'Purchase additional equipment',
                'Modify lesson plans'
            ],
            createdAt: '2024-01-23 01:30 PM',
            lastUpdated: '2024-01-23 04:45 PM',
            assignedTo: 'Equipment Manager'
        }
    ]

    // Conflict statistics
    const conflictStats = {
        total: conflicts.length,
        critical: conflicts.filter(c => c.severity === 'critical').length,
        unresolved: conflicts.filter(c => c.status === 'unresolved').length,
        inProgress: conflicts.filter(c => c.status === 'in_progress').length,
        resolved: conflicts.filter(c => c.status === 'resolved').length
    }

    const getSeverityColor = (severity: string) => {
        const colors = {
            critical: 'text-red-600 bg-red-50 border-red-200',
            high: 'text-orange-600 bg-orange-50 border-orange-200',
            medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            low: 'text-blue-600 bg-blue-50 border-blue-200'
        }
        return colors[severity as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getStatusColor = (status: string) => {
        const colors = {
            unresolved: 'text-red-600 bg-red-50',
            in_progress: 'text-yellow-600 bg-yellow-50',
            resolved: 'text-green-600 bg-green-50'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const getConflictIcon = (type: string) => {
        const icons = {
            coach_double_booking: User,
            studio_overlap: MapPin,
            capacity_exceeded: Users,
            coach_unavailable: XCircle,
            equipment_conflict: Settings
        }
        return icons[type as keyof typeof icons] || AlertTriangle
    }

    const filteredConflicts = conflicts.filter(conflict => {
        const matchesSeverity = selectedSeverity === 'all' || conflict.severity === selectedSeverity
        const matchesLocation = selectedLocation === 'all' || conflict.location === selectedLocation
        const matchesSearch = searchTerm === '' ||
            conflict.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conflict.coach.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesSeverity && matchesLocation && matchesSearch
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Schedule Conflicts</h1>
                    <p className="text-gray-600 mt-2">Monitor and resolve scheduling conflicts across all locations</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Conflicts
                    </Button>
                    <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Conflict Rules
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Conflicts</CardTitle>
                        <AlertTriangle className="h-5 w-5 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{conflictStats.total}</div>
                        <div className="text-sm text-gray-600 font-medium">Active issues</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Critical</CardTitle>
                        <XCircle className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{conflictStats.critical}</div>
                        <div className="text-sm text-red-600 font-medium">Urgent attention</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Unresolved</CardTitle>
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{conflictStats.unresolved}</div>
                        <div className="text-sm text-orange-600 font-medium">Need action</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
                        <RefreshCw className="h-5 w-5 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{conflictStats.inProgress}</div>
                        <div className="text-sm text-yellow-600 font-medium">Being resolved</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{conflictStats.resolved}</div>
                        <div className="text-sm text-green-600 font-medium">Completed</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search conflicts by description or coach..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={selectedSeverity}
                                onChange={(e) => setSelectedSeverity(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">All Severity</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">All Locations</option>
                                <option value="Cyberport">Cyberport</option>
                                <option value="Wan Chai">Wan Chai</option>
                                <option value="Sha Tin">Sha Tin</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Conflicts List */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Conflicts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredConflicts.map((conflict, index) => {
                            const ConflictIcon = getConflictIcon(conflict.type)
                            return (
                                <motion.div
                                    key={conflict.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-6 bg-gray-50 rounded-lg hover:shadow-md transition-all"
                                >
                                    {/* Conflict Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getSeverityColor(conflict.severity)}`}>
                                                <ConflictIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{conflict.description}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {conflict.location} • {conflict.date} • {conflict.time}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={getSeverityColor(conflict.severity)}>
                                                        {conflict.severity}
                                                    </Badge>
                                                    <Badge className={getStatusColor(conflict.status)}>
                                                        {conflict.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="w-4 h-4 mr-2" />
                                                Resolve
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Conflict Details */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                                        {/* Affected Classes */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Affected Classes</h4>
                                            <div className="space-y-2">
                                                {conflict.affectedClasses.map((cls, idx) => (
                                                    <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h5 className="font-medium text-gray-900">{cls.name}</h5>
                                                                <p className="text-sm text-gray-600">{cls.studio}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium">{cls.students} students</p>
                                                                {cls.capacity && (
                                                                    <p className="text-xs text-gray-500">Capacity: {cls.capacity}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Suggested Actions */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Suggested Actions</h4>
                                            <div className="space-y-2">
                                                {conflict.suggestedActions.map((action, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm text-gray-700">{action}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conflict Metadata */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Coach:</span>
                                                <span className="ml-2 font-medium">{conflict.coach}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Created:</span>
                                                <span className="ml-2 font-medium">{conflict.createdAt}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Last Updated:</span>
                                                <span className="ml-2 font-medium">{conflict.lastUpdated}</span>
                                            </div>
                                        </div>

                                        {conflict.assignedTo && (
                                            <div className="mt-2">
                                                <span className="text-gray-600 text-sm">Assigned to:</span>
                                                <span className="ml-2 font-medium text-sm">{conflict.assignedTo}</span>
                                            </div>
                                        )}

                                        {conflict.resolution && (
                                            <div className="mt-2 p-3 bg-green-50 rounded-lg">
                                                <h5 className="font-medium text-green-900 mb-1">Resolution</h5>
                                                <p className="text-sm text-green-700">{conflict.resolution}</p>
                                                <p className="text-xs text-green-600 mt-1">Resolved by: {conflict.resolvedBy}</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>)
}

export default ScheduleConflictsPage
