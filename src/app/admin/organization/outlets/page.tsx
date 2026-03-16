'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Building2, MapPin, Users, Calendar, DollarSign, TrendingUp,
    Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye,
    Phone, Mail, Clock, CheckCircle, AlertTriangle, Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { responsiveClasses } from '@/lib/responsiveClasses'
const OutletsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Mock outlets data
    const outlets = [
        {
            id: 1,
            name: 'ProGym Cyberport',
            businessUnit: 'Gym Locations',
            address: 'Shop 3-4, G/F, The Arcade, 100 Cyberport Road',
            manager: 'Lisa Zhang',
            phone: '+852 2234 5678',
            email: 'cyberport@progym.hk',
            status: 'active',
            capacity: 120,
            currentStudents: 95,
            monthlyRevenue: 180000,
            operatingHours: '9:00 AM - 9:00 PM',
            coaches: 6,
            rating: 4.8,
            openDate: '2022-03-15'
        },
        {
            id: 2,
            name: 'ProGym Wan Chai',
            businessUnit: 'Gym Locations',
            address: '15/F, Southorn Centre, 130 Hennessy Road',
            manager: 'David Wong',
            phone: '+852 2345 6789',
            email: 'wanchai@progym.hk',
            status: 'active',
            capacity: 100,
            currentStudents: 88,
            monthlyRevenue: 165000,
            operatingHours: '10:00 AM - 8:00 PM',
            coaches: 5,
            rating: 4.6,
            openDate: '2021-09-20'
        },
        {
            id: 3,
            name: 'ProGym Sha Tin',
            businessUnit: 'Gym Locations',
            address: 'Level 2, New Town Plaza, Sha Tin',
            manager: 'Sarah Chen',
            phone: '+852 3456 7890',
            email: 'shatin@progym.hk',
            status: 'active',
            capacity: 80,
            currentStudents: 72,
            monthlyRevenue: 145000,
            operatingHours: '9:30 AM - 8:30 PM',
            coaches: 4,
            rating: 4.7,
            openDate: '2023-01-10'
        },
        {
            id: 4,
            name: 'Island School Program',
            businessUnit: 'School Programs',
            address: 'Island School, 20 Borrett Road, Mid-Levels',
            manager: 'Monica Liu',
            phone: '+852 4567 8901',
            email: 'island@progym.hk',
            status: 'active',
            capacity: 200,
            currentStudents: 185,
            monthlyRevenue: 95000,
            operatingHours: '3:00 PM - 6:00 PM',
            coaches: 3,
            rating: 4.9,
            openDate: '2020-09-01'
        },
        {
            id: 5,
            name: 'Discovery Bay Partner',
            businessUnit: 'Partner Gyms',
            address: 'Discovery Bay Recreation Club',
            manager: 'Alex Kim',
            phone: '+852 5678 9012',
            email: 'db@progym.hk',
            status: 'maintenance',
            capacity: 60,
            currentStudents: 45,
            monthlyRevenue: 85000,
            operatingHours: '4:00 PM - 7:00 PM',
            coaches: 2,
            rating: 4.5,
            openDate: '2022-11-15'
        }
    ]

    const filteredOutlets = outlets.filter(outlet => {
        const matchesSearch = outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            outlet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            outlet.manager.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterStatus === 'all' || outlet.status === filterStatus
        return matchesSearch && matchesFilter
    })

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-700',
            maintenance: 'bg-yellow-100 text-yellow-700',
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
                            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Outlet Management</h1>
                    <p className={responsiveClasses.headerSubtitle}>Manage all locations and their operations</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Outlet
                </Button>
            </div>

            {/* Summary Stats */}
            <div className={responsiveClasses.metricsGrid}>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Outlets</p>
                                <p className="text-2xl font-bold text-gray-900">{outlets.length}</p>
                            </div>
                            <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Outlets</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {outlets.filter(o => o.status === 'active').length}
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
                                <p className="text-sm font-medium text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {outlets.reduce((sum, o) => sum + o.currentStudents, 0)}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    HK${(outlets.reduce((sum, o) => sum + o.monthlyRevenue, 0) / 1000).toFixed(0)}K
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600" />
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
                                    placeholder="Search outlets, managers, or addresses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <Button variant="outline">
                                <Filter className="w-4 h-4 mr-2" />
                                More Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Outlets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredOutlets.map((outlet, index) => (
                    <motion.div
                        key={outlet.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg font-semibold text-gray-900">
                                            {outlet.name}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">{outlet.businessUnit}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getStatusColor(outlet.status)}>
                                            {outlet.status}
                                        </Badge>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Location Info */}
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600">{outlet.address}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-600">{outlet.operatingHours}</p>
                                    </div>
                                </div>

                                {/* Manager Info */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs font-medium text-gray-500 mb-1">MANAGER</p>
                                    <p className="font-medium text-gray-900">{outlet.manager}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-600">{outlet.phone}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-3 h-3 text-gray-400" />
                                            <p className="text-xs text-gray-600">{outlet.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">CAPACITY</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="font-semibold text-gray-900">
                                                {outlet.currentStudents}/{outlet.capacity}
                                            </p>
                                            <p className={`text-xs font-medium ${getUtilizationColor((outlet.currentStudents / outlet.capacity) * 100)}`}>
                                                {Math.round((outlet.currentStudents / outlet.capacity) * 100)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">COACHES</p>
                                        <p className="font-semibold text-gray-900 mt-1">{outlet.coaches}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">REVENUE</p>
                                        <p className="font-semibold text-gray-900 mt-1">
                                            HK${(outlet.monthlyRevenue / 1000).toFixed(0)}K
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">RATING</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <p className="font-semibold text-gray-900">{outlet.rating}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
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
            {filteredOutlets.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No outlets found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search criteria or add a new outlet.
                        </p>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Outlet
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default OutletsPage
