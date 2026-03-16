'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Eye, MapPin, Users, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function RegionalLocationsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    const locations = [
        {
            id: 1,
            name: 'Boston Downtown',
            address: '123 Main St, Boston, MA',
            manager: 'Sarah Johnson',
            students: 320,
            revenue: 185000,
            occupancy: 85,
            status: 'active',
            rating: 4.8
        },
        {
            id: 2,
            name: 'Boston Suburbs',
            address: '456 Oak Ave, Brookline, MA',
            manager: 'Michael Chen',
            students: 280,
            revenue: 165000,
            occupancy: 78,
            status: 'active',
            rating: 4.6
        },
        {
            id: 3,
            name: 'Providence',
            address: '789 Elm St, Providence, RI',
            manager: 'Emily Rodriguez',
            students: 210,
            revenue: 125000,
            occupancy: 72,
            status: 'active',
            rating: 4.4
        },
        {
            id: 4,
            name: 'Hartford',
            address: '321 Pine Rd, Hartford, CT',
            manager: 'David Williams',
            students: 240,
            revenue: 145000,
            occupancy: 80,
            status: 'active',
            rating: 4.5
        },
        {
            id: 5,
            name: 'New Haven',
            address: '654 Maple Dr, New Haven, CT',
            manager: 'Jessica Lee',
            students: 200,
            revenue: 115000,
            occupancy: 65,
            status: 'needs-attention',
            rating: 4.2
        },
    ]

    const filteredLocations = locations.filter(location => {
        const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.address.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || location.status === filterStatus
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Regional Locations</h1>
                    <p className="text-gray-600 mt-1">Manage all locations in your region</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Location
                </button>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search locations..."
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
                            <option value="needs-attention">Needs Attention</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Locations Grid */}
            <div className="grid grid-cols-1 gap-6">
                {filteredLocations.map((location, idx) => (
                    <motion.div
                        key={location.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                    {/* Location Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <MapPin className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900">{location.name}</h3>
                                                    <Badge variant={location.status === 'active' ? 'default' : 'secondary'}>
                                                        {location.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                                                <p className="text-sm text-gray-600">Manager: <span className="font-medium">{location.manager}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm text-gray-600">Students</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">{location.students}</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-gray-600">Revenue</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">${(location.revenue / 1000).toFixed(0)}K</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <TrendingUp className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm text-gray-600">Occupancy</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">{location.occupancy}%</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <span className="text-sm text-gray-600">Rating</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">⭐ {location.rating}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 w-full lg:w-auto">
                                        <button className="flex-1 lg:flex-none px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            <span className="hidden sm:inline">View</span>
                                        </button>
                                        <button className="flex-1 lg:flex-none px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                            <Edit2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Edit</span>
                                        </button>
                                        <button className="flex-1 lg:flex-none px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredLocations.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No locations found</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
