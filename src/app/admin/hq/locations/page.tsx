'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Building2, MapPin, Users, DollarSign, Calendar,
    Edit, Trash2, Plus, Search, Filter, Eye, MoreVertical,
    CheckCircle, AlertCircle, Clock, TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function HQLocationsPage() {
    const [locations, setLocations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setLocations([
                {
                    id: 1,
                    name: 'ProGym Cyberport',
                    address: 'Cyberport, Hong Kong',
                    type: 'gym',
                    status: 'active',
                    students: 450,
                    coaches: 12,
                    revenue: 425000,
                    capacity: 500,
                    utilization: 90,
                    rating: 4.8,
                    createdDate: '2024-01-15'
                },
                {
                    id: 2,
                    name: 'ProGym Wan Chai',
                    address: 'Wan Chai, Hong Kong',
                    type: 'gym',
                    status: 'active',
                    students: 380,
                    coaches: 10,
                    revenue: 385000,
                    capacity: 400,
                    utilization: 95,
                    rating: 4.7,
                    createdDate: '2024-02-20'
                },
                {
                    id: 3,
                    name: 'School Programs - HK International',
                    address: 'Mid-Levels, Hong Kong',
                    type: 'school',
                    status: 'active',
                    students: 600,
                    coaches: 15,
                    revenue: 520000,
                    capacity: 700,
                    utilization: 85,
                    rating: 4.9,
                    createdDate: '2024-03-10'
                },
                {
                    id: 4,
                    name: 'Partner Gym - Montessori',
                    address: 'Pok Fu Lam, Hong Kong',
                    type: 'partner',
                    status: 'active',
                    students: 120,
                    coaches: 4,
                    revenue: 95000,
                    capacity: 150,
                    utilization: 80,
                    rating: 4.6,
                    createdDate: '2024-04-05'
                },
                {
                    id: 5,
                    name: 'Holiday Camps Center',
                    address: 'Central, Hong Kong',
                    type: 'camp',
                    status: 'seasonal',
                    students: 85,
                    coaches: 6,
                    revenue: 75000,
                    capacity: 200,
                    utilization: 42,
                    rating: 4.5,
                    createdDate: '2024-05-12'
                },
                {
                    id: 6,
                    name: 'New Location - Setup',
                    address: 'Causeway Bay, Hong Kong',
                    type: 'gym',
                    status: 'setup',
                    students: 0,
                    coaches: 0,
                    revenue: 0,
                    capacity: 300,
                    utilization: 0,
                    rating: 0,
                    createdDate: '2024-06-01'
                },
            ])
            setIsLoading(false)
        }, 1000)
    }, [])

    const filteredLocations = locations.filter(loc => {
        const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loc.address.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterStatus === 'all' || loc.status === filterStatus
        return matchesSearch && matchesFilter
    })

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            seasonal: 'bg-blue-100 text-blue-800',
            setup: 'bg-yellow-100 text-yellow-800',
            inactive: 'bg-red-100 text-red-800'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getTypeIcon = (type: string) => {
        const icons = {
            gym: '🏋️',
            school: '🏫',
            partner: '🤝',
            camp: '🏕️'
        }
        return icons[type as keyof typeof icons] || '📍'
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Locations</h1>
                    <p className="text-gray-600 mt-1">Manage all business locations across franchises</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                </Button>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search locations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="seasonal">Seasonal</option>
                                <option value="setup">Setup</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Locations', value: locations.length, icon: Building2, color: 'text-blue-600' },
                    { label: 'Active', value: locations.filter(l => l.status === 'active').length, icon: CheckCircle, color: 'text-green-600' },
                    { label: 'Total Students', value: locations.reduce((sum, l) => sum + l.students, 0), icon: Users, color: 'text-purple-600' },
                    { label: 'Total Revenue', value: `$${(locations.reduce((sum, l) => sum + l.revenue, 0) / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-orange-600' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    </div>
                                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Locations Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Students</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilization</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLocations.map((location, idx) => (
                                    <motion.tr
                                        key={location.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getTypeIcon(location.type)}</span>
                                                <div>
                                                    <p className="font-medium text-gray-900">{location.name}</p>
                                                    <p className="text-xs text-gray-500">{location.address}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge variant="outline">{location.type}</Badge>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge className={getStatusColor(location.status)}>
                                                {location.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="font-semibold text-gray-900">{location.students}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="font-semibold text-gray-900">${(location.revenue / 1000).toFixed(0)}K</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${location.utilization}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{location.utilization}%</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-500">★</span>
                                                <span className="font-semibold text-gray-900">{location.rating}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-yellow-50 rounded-lg text-yellow-600 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Location Performance Cards */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Location Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLocations.slice(0, 6).map((location, idx) => (
                        <motion.div
                            key={location.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{location.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{location.address}</p>
                                        </div>
                                        <Badge className={getStatusColor(location.status)}>
                                            {location.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Students</span>
                                            <span className="font-semibold text-gray-900">{location.students}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Coaches</span>
                                            <span className="font-semibold text-gray-900">{location.coaches}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Revenue</span>
                                            <span className="font-semibold text-gray-900">${(location.revenue / 1000).toFixed(0)}K</span>
                                        </div>
                                        <div className="pt-3 border-t">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600">Utilization</span>
                                                <span className="font-semibold text-gray-900">{location.utilization}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${location.utilization >= 90 ? 'bg-green-500' :
                                                            location.utilization >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
                                                        }`}
                                                    style={{ width: `${location.utilization}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            View Details
                                        </Button>
                                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                            Manage
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
