'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Eye, MapPin, Users, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function FranchiseLocationsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    const locations = [
        {
            id: 1,
            name: 'Manhattan',
            address: '123 5th Ave, New York, NY',
            manager: 'John Smith',
            students: 320,
            revenue: 385000,
            occupancy: 88,
            status: 'active',
            rating: 4.9
        },
        {
            id: 2,
            name: 'Brooklyn',
            address: '456 Atlantic Ave, Brooklyn, NY',
            manager: 'Sarah Johnson',
            students: 280,
            revenue: 335000,
            occupancy: 82,
            status: 'active',
            rating: 4.7
        },
        {
            id: 3,
            name: 'Queens',
            address: '789 Queens Blvd, Queens, NY',
            manager: 'Michael Chen',
            students: 210,
            revenue: 252000,
            occupancy: 75,
            status: 'active',
            rating: 4.5
        },
        {
            id: 4,
            name: 'Bronx',
            address: '321 Grand Concourse, Bronx, NY',
            manager: 'Emily Rodriguez',
            students: 170,
            revenue: 228000,
            occupancy: 70,
            status: 'active',
            rating: 4.3
        },
    ]

    const filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Franchise Locations</h1>
                    <p className="text-gray-600 mt-1">Manage all locations in your franchise</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Location
                </button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Search locations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

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
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <MapPin className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900">{location.name}</h3>
                                                    <Badge variant="default">Active</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                                                <p className="text-sm text-gray-600">Manager: <span className="font-medium">{location.manager}</span></p>
                                            </div>
                                        </div>
                                    </div>

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
        </div>
    )
}
