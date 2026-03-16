'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, Users, MapPin, User, Plus, Filter, Search,
    Download, Eye, Edit, Trash2, CheckCircle, AlertTriangle,
    Activity, Star, Target, BarChart3, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const ClassManagementPage = () => {
    const [selectedLocation, setSelectedLocation] = useState<string>('all')
    const [selectedProgram, setSelectedProgram] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Classes data
    const classes = [
        {
            id: 1,
            name: 'GYMTOTS Morning',
            program: 'GYMTOTS',
            level: 'Beginner',
            ageGroup: '3-4 years',
            location: 'Cyberport',
            studio: 'Studio A',
            schedule: {
                days: ['Tuesday', 'Thursday'],
                time: '10:00 AM - 11:00 AM',
                duration: 60
            },
            capacity: 8,
            enrolled: 6,
            waitlist: 2,
            coach: 'Sarah Chen',
            assistantCoach: 'Monica Liu',
            status: 'active',
            term: 'Spring 2024',
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            price: 1200,
            attendance: 92,
            rating: 4.8,
            notes: 'Popular class, consistently full'
        },
        {
            id: 2,
            name: 'Beginner Gymnastics Afternoon',
            program: 'Beginner Gymnastics',
            level: 'Beginner',
            ageGroup: '5-7 years',
            location: 'Wan Chai',
            studio: 'Studio B',
            schedule: {
                days: ['Monday', 'Wednesday'],
                time: '4:00 PM - 5:00 PM',
                duration: 60
            },
            capacity: 10,
            enrolled: 8,
            waitlist: 0,
            coach: 'Juan Rodriguez',
            assistantCoach: null,
            status: 'active',
            term: 'Spring 2024',
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            price: 1400,
            attendance: 88,
            rating: 4.6,
            notes: 'Good progress, space available'
        },
        {
            id: 3,
            name: 'Intermediate Skills',
            program: 'Intermediate Gymnastics',
            level: 'Intermediate',
            ageGroup: '8-10 years',
            location: 'Cyberport',
            studio: 'Studio A',
            schedule: {
                days: ['Tuesday', 'Friday'],
                time: '5:00 PM - 6:30 PM',
                duration: 90
            },
            capacity: 8,
            enrolled: 5,
            waitlist: 0,
            coach: 'Sarah Chen',
            assistantCoach: 'Alex Wong',
            status: 'underfilled',
            term: 'Spring 2024',
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            price: 1800,
            attendance: 85,
            rating: 4.9,
            notes: 'Consider merging or marketing push needed'
        },
        {
            id: 4,
            name: 'Advanced Competition Prep',
            program: 'Advanced Gymnastics',
            level: 'Advanced',
            ageGroup: '11+ years',
            location: 'Sha Tin',
            studio: 'Studio C',
            schedule: {
                days: ['Monday', 'Wednesday', 'Friday'],
                time: '6:00 PM - 7:30 PM',
                duration: 90
            },
            capacity: 6,
            enrolled: 4,
            waitlist: 1,
            coach: 'Monica Liu',
            assistantCoach: null,
            status: 'active',
            term: 'Spring 2024',
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            price: 2200,
            attendance: 95,
            rating: 4.9,
            notes: 'Elite level training, high performance'
        },
        {
            id: 5,
            name: 'Weekend GYMTOTS',
            program: 'GYMTOTS',
            level: 'Beginner',
            ageGroup: '3-4 years',
            location: 'Cyberport',
            studio: 'Studio B',
            schedule: {
                days: ['Saturday'],
                time: '9:00 AM - 10:00 AM',
                duration: 60
            },
            capacity: 8,
            enrolled: 8,
            waitlist: 5,
            coach: 'Juan Rodriguez',
            assistantCoach: 'Sarah Chen',
            status: 'full',
            term: 'Spring 2024',
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            price: 1200,
            attendance: 96,
            rating: 4.7,
            notes: 'Very popular weekend slot'
        },
        {
            id: 6,
            name: 'Trial Class Special',
            program: 'Trial Classes',
            level: 'Mixed',
            ageGroup: '3-8 years',
            location: 'Wan Chai',
            studio: 'Studio A',
            schedule: {
                days: ['Saturday'],
                time: '11:00 AM - 11:45 AM',
                duration: 45
            },
            capacity: 6,
            enrolled: 3,
            waitlist: 0,
            coach: 'Alex Wong',
            assistantCoach: null,
            status: 'suspended',
            term: 'Spring 2024',
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            price: 200,
            attendance: 75,
            rating: 4.3,
            notes: 'Temporarily suspended due to low enrollment'
        }
    ]

    // Class statistics
    const classStats = {
        total: classes.length,
        active: classes.filter(c => c.status === 'active').length,
        full: classes.filter(c => c.status === 'full').length,
        underfilled: classes.filter(c => c.status === 'underfilled').length,
        totalEnrolled: classes.reduce((sum, c) => sum + c.enrolled, 0),
        totalCapacity: classes.reduce((sum, c) => sum + c.capacity, 0),
        avgAttendance: Math.round(classes.reduce((sum, c) => sum + c.attendance, 0) / classes.length),
        totalRevenue: classes.reduce((sum, c) => sum + (c.price * c.enrolled), 0)
    }

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'text-green-600 bg-green-50 border-green-200',
            full: 'text-blue-600 bg-blue-50 border-blue-200',
            underfilled: 'text-orange-600 bg-orange-50 border-orange-200',
            suspended: 'text-red-600 bg-red-50 border-red-200'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getCapacityColor = (enrolled: number, capacity: number) => {
        const percentage = (enrolled / capacity) * 100
        if (percentage >= 90) return 'text-blue-600'
        if (percentage >= 70) return 'text-green-600'
        if (percentage >= 50) return 'text-yellow-600'
        return 'text-red-600'
    }

    const filteredClasses = classes.filter(classItem => {
        const matchesLocation = selectedLocation === 'all' || classItem.location === selectedLocation
        const matchesProgram = selectedProgram === 'all' || classItem.program === selectedProgram
        const matchesStatus = selectedStatus === 'all' || classItem.status === selectedStatus
        const matchesSearch = searchTerm === '' ||
            classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classItem.coach.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesLocation && matchesProgram && matchesStatus && matchesSearch
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
                    <p className="text-gray-600 mt-2">Manage classes, schedules, and enrollment</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Class
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Classes</CardTitle>
                        <Calendar className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{classStats.total}</div>
                        <div className="text-sm text-blue-600 font-medium">{classStats.active} active</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Enrollment</CardTitle>
                        <Users className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {classStats.totalEnrolled}/{classStats.totalCapacity}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                            {Math.round((classStats.totalEnrolled / classStats.totalCapacity) * 100)}% capacity
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg Attendance</CardTitle>
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{classStats.avgAttendance}%</div>
                        <div className="text-sm text-purple-600 font-medium">Across all classes</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
                        <BarChart3 className="h-5 w-5 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            HK${(classStats.totalRevenue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-yellow-600 font-medium">This term</div>
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
                                    placeholder="Search by class name or coach..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
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
                            <select
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">All Programs</option>
                                <option value="GYMTOTS">GYMTOTS</option>
                                <option value="Beginner Gymnastics">Beginner Gymnastics</option>
                                <option value="Intermediate Gymnastics">Intermediate Gymnastics</option>
                                <option value="Advanced Gymnastics">Advanced Gymnastics</option>
                            </select>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="full">Full</option>
                                <option value="underfilled">Underfilled</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Classes List */}
            <div className="space-y-4">
                {filteredClasses.map((classItem, index) => (
                    <motion.div
                        key={classItem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                {/* Class Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                            {classItem.program.substring(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{classItem.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {classItem.program} • {classItem.level} • {classItem.ageGroup}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className={getStatusColor(classItem.status)}>
                                                    {classItem.status}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {classItem.term}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Class Details Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                    {/* Schedule & Location */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Schedule & Location</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>{classItem.schedule.days.join(', ')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span>{classItem.schedule.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>{classItem.location} - {classItem.studio}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enrollment */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Enrollment</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Enrolled:</span>
                                                <span className={`font-medium ${getCapacityColor(classItem.enrolled, classItem.capacity)}`}>
                                                    {classItem.enrolled}/{classItem.capacity}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Waitlist:</span>
                                                <span className="font-medium">{classItem.waitlist}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Capacity:</span>
                                                <span className="font-medium">
                                                    {Math.round((classItem.enrolled / classItem.capacity) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Staff */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Staff</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span>{classItem.coach}</span>
                                            </div>
                                            {classItem.assistantCoach && (
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-600">{classItem.assistantCoach} (Assistant)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Performance */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Attendance:</span>
                                                <span className="font-medium">{classItem.attendance}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Rating:</span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="font-medium">{classItem.rating}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Price:</span>
                                                <span className="font-medium">HK${classItem.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {classItem.notes && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h5 className="font-medium text-gray-900 mb-1">Notes</h5>
                                        <p className="text-sm text-gray-700">{classItem.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>)
}

export default ClassManagementPage