'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Star, Calendar, MapPin, Phone, Mail, Award, Clock,
    Plus, Search, Filter, MoreHorizontal, Edit, Eye, UserCheck,
    TrendingUp, Activity, CheckCircle, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { responsiveClasses } from '@/lib/responsiveClasses'

const CoachesPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterLocation, setFilterLocation] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Mock coaches data
    const coaches = [
        {
            id: 1,
            name: 'Sarah Chen',
            email: 'sarah.chen@progym.hk',
            phone: '+852 9876 5432',
            locations: ['Cyberport', 'Wan Chai'],
            primaryLocation: 'Cyberport',
            status: 'active',
            employeeId: 'PG-C-001',
            joinDate: '2023-03-15',
            specializations: ['Gymnastics', 'Tumbling', 'Flexibility'],
            certifications: ['Level 2 Gymnastics', 'First Aid', 'Child Safety'],
            weeklyHours: 32,
            maxHours: 40,
            monthlyClasses: 120,
            totalStudents: 89,
            rating: 4.9,
            totalReviews: 156,
            monthlyRevenue: 12500,
            lastActive: '2024-01-25',
            profileImage: null
        },
        {
            id: 2,
            name: 'Monica Liu',
            email: 'monica.liu@progym.hk',
            phone: '+852 9876 5433',
            locations: ['Cyberport'],
            primaryLocation: 'Cyberport',
            status: 'active',
            employeeId: 'PG-C-002',
            joinDate: '2022-09-20',
            specializations: ['GYMTOTS', 'Beginner Classes', 'Parent-Child'],
            certifications: ['Level 1 Gymnastics', 'Early Childhood', 'First Aid'],
            weeklyHours: 28,
            maxHours: 35,
            monthlyClasses: 96,
            totalStudents: 72,
            rating: 4.8,
            totalReviews: 134,
            monthlyRevenue: 10800,
            lastActive: '2024-01-25',
            profileImage: null
        },
        {
            id: 3,
            name: 'Juan Rodriguez',
            email: 'juan.rodriguez@progym.hk',
            phone: '+852 9876 5434',
            locations: ['Wan Chai', 'Sha Tin'],
            primaryLocation: 'Wan Chai',
            status: 'active',
            employeeId: 'PG-C-003',
            joinDate: '2023-01-10',
            specializations: ['Advanced Gymnastics', 'Competition Prep', 'Strength Training'],
            certifications: ['Level 3 Gymnastics', 'Competition Coach', 'Sports Psychology'],
            weeklyHours: 35,
            maxHours: 40,
            monthlyClasses: 108,
            totalStudents: 65,
            rating: 4.7,
            totalReviews: 98,
            monthlyRevenue: 13200,
            lastActive: '2024-01-24',
            profileImage: null
        },
        {
            id: 4,
            name: 'Alex Kim',
            email: 'alex.kim@progym.hk',
            phone: '+852 9876 5435',
            locations: ['Sha Tin'],
            primaryLocation: 'Sha Tin',
            status: 'on_leave',
            employeeId: 'PG-C-004',
            joinDate: '2023-06-01',
            specializations: ['Intermediate Classes', 'Skills Development'],
            certifications: ['Level 2 Gymnastics', 'First Aid'],
            weeklyHours: 0,
            maxHours: 30,
            monthlyClasses: 0,
            totalStudents: 45,
            rating: 4.6,
            totalReviews: 67,
            monthlyRevenue: 0,
            lastActive: '2024-01-15',
            profileImage: null
        },
        {
            id: 5,
            name: 'Lisa Zhang',
            email: 'lisa.zhang@progym.hk',
            phone: '+852 9876 5436',
            locations: ['Cyberport', 'Wan Chai', 'Sha Tin'],
            primaryLocation: 'Cyberport',
            status: 'active',
            employeeId: 'PG-C-005',
            joinDate: '2021-11-15',
            specializations: ['All Levels', 'Training Coordinator', 'Assessment'],
            certifications: ['Level 3 Gymnastics', 'Trainer Certification', 'Assessment Specialist'],
            weeklyHours: 38,
            maxHours: 40,
            monthlyClasses: 140,
            totalStudents: 112,
            rating: 4.9,
            totalReviews: 203,
            monthlyRevenue: 15600,
            lastActive: '2024-01-25',
            profileImage: null
        },
        {
            id: 6,
            name: 'David Wong',
            email: 'david.wong@progym.hk',
            phone: '+852 9876 5437',
            locations: ['School Programs'],
            primaryLocation: 'Island School',
            status: 'active',
            employeeId: 'PG-C-006',
            joinDate: '2022-08-01',
            specializations: ['School Programs', 'Group Classes', 'PE Integration'],
            certifications: ['Education Degree', 'Level 2 Gymnastics', 'School Sports'],
            weeklyHours: 25,
            maxHours: 30,
            monthlyClasses: 80,
            totalStudents: 185,
            rating: 4.8,
            totalReviews: 89,
            monthlyRevenue: 8500,
            lastActive: '2024-01-25',
            profileImage: null
        }
    ]

    const locations = ['all', 'Cyberport', 'Wan Chai', 'Sha Tin', 'School Programs']
    const statuses = ['all', 'active', 'on_leave', 'inactive']

    const filteredCoaches = coaches.filter(coach => {
        const matchesSearch = coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coach.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesLocation = filterLocation === 'all' || coach.locations.includes(filterLocation) || coach.primaryLocation === filterLocation
        const matchesStatus = filterStatus === 'all' || coach.status === filterStatus
        return matchesSearch && matchesLocation && matchesStatus
    })

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-700',
            on_leave: 'bg-yellow-100 text-yellow-700',
            inactive: 'bg-red-100 text-red-700'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700'
    }

    const getUtilizationColor = (utilization: number) => {
        if (utilization >= 90) return 'text-red-600'
        if (utilization >= 75) return 'text-yellow-600'
        return 'text-green-600'
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Coach Profiles</h1>
                    <p className="text-gray-600 mt-2">Manage coach information, certifications, and performance</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Coach
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Coaches</p>
                                <p className="text-2xl font-bold text-gray-900">{coaches.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Coaches</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {coaches.filter(c => c.status === 'active').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {(coaches.reduce((sum, c) => sum + c.rating, 0) / coaches.length).toFixed(1)}
                                </p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {coaches.reduce((sum, c) => sum + c.totalStudents, 0)}
                                </p>
                            </div>
                            <Activity className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search coaches by name, email, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterLocation}
                                onChange={(e) => setFilterLocation(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {locations.map(location => (
                                    <option key={location} value={location}>
                                        {location === 'all' ? 'All Locations' : location}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>
                                        {status === 'all' ? 'All Status' : status.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Coaches Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCoaches.map((coach, index) => (
                    <motion.div
                        key={coach.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {coach.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-gray-900">
                                                {coach.name}
                                            </CardTitle>
                                            <p className="text-sm text-gray-600">{coach.employeeId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getStatusColor(coach.status)}>
                                            {coach.status.replace('_', ' ')}
                                        </Badge>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Contact Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-600">{coach.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-600">{coach.phone}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-600">{coach.primaryLocation}</p>
                                    </div>
                                </div>

                                {/* Locations */}
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-2">LOCATIONS</p>
                                    <div className="flex flex-wrap gap-1">
                                        {coach.locations.map(location => (
                                            <Badge key={location} variant="outline" className="text-xs">
                                                {location}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Specializations */}
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-2">SPECIALIZATIONS</p>
                                    <div className="flex flex-wrap gap-1">
                                        {coach.specializations.slice(0, 2).map(spec => (
                                            <Badge key={spec} variant="secondary" className="text-xs">
                                                {spec}
                                            </Badge>
                                        ))}
                                        {coach.specializations.length > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{coach.specializations.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">RATING</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <p className="font-semibold text-gray-900">{coach.rating}</p>
                                            <p className="text-xs text-gray-500">({coach.totalReviews})</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">STUDENTS</p>
                                        <p className="font-semibold text-gray-900 mt-1">{coach.totalStudents}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">UTILIZATION</p>
                                        <div className="mt-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-semibold ${getUtilizationColor((coach.weeklyHours / coach.maxHours) * 100)}`}>
                                                    {Math.round((coach.weeklyHours / coach.maxHours) * 100)}%
                                                </p>
                                            </div>
                                            <Progress
                                                value={(coach.weeklyHours / coach.maxHours) * 100}
                                                className="h-1 mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">REVENUE</p>
                                        <p className="font-semibold text-gray-900 mt-1">
                                            HK${(coach.monthlyRevenue / 1000).toFixed(0)}K
                                        </p>
                                    </div>
                                </div>

                                {/* Certifications */}
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-2">CERTIFICATIONS</p>
                                    <div className="flex flex-wrap gap-1">
                                        {coach.certifications.slice(0, 2).map(cert => (
                                            <Badge key={cert} className="bg-green-100 text-green-700 text-xs">
                                                <Award className="w-3 h-3 mr-1" />
                                                {cert}
                                            </Badge>
                                        ))}
                                        {coach.certifications.length > 2 && (
                                            <Badge className="bg-green-100 text-green-700 text-xs">
                                                +{coach.certifications.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Profile
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* No Results */}
            {filteredCoaches.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No coaches found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search criteria or add a new coach.
                        </p>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Coach
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default CoachesPage