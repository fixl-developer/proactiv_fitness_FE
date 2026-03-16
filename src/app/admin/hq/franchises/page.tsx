'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Globe, MapPin, Users, DollarSign, TrendingUp,
    Edit, Trash2, Plus, Search, Filter, Eye, CheckCircle,
    AlertCircle, Clock, Award, BarChart3, PieChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function HQFranchisesPage() {
    const [franchises, setFranchises] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setFranchises([
                {
                    id: 1,
                    name: 'NYC Franchise',
                    owner: 'John Smith',
                    locations: 4,
                    status: 'active',
                    revenue: 1200000,
                    growth: 15.2,
                    students: 850,
                    coaches: 24,
                    rating: 4.8,
                    joinDate: '2023-01-15',
                    contract: 'Active - Expires 2026-01-15'
                },
                {
                    id: 2,
                    name: 'LA Franchise',
                    owner: 'Sarah Johnson',
                    locations: 3,
                    status: 'active',
                    revenue: 950000,
                    growth: 12.8,
                    students: 680,
                    coaches: 18,
                    rating: 4.7,
                    joinDate: '2023-03-20',
                    contract: 'Active - Expires 2026-03-20'
                },
                {
                    id: 3,
                    name: 'Chicago Franchise',
                    owner: 'Michael Chen',
                    locations: 3,
                    status: 'active',
                    revenue: 850000,
                    growth: 18.5,
                    students: 620,
                    coaches: 16,
                    rating: 4.6,
                    joinDate: '2023-05-10',
                    contract: 'Active - Expires 2026-05-10'
                },
                {
                    id: 4,
                    name: 'Boston Franchise',
                    owner: 'Emily Davis',
                    locations: 2,
                    status: 'active',
                    revenue: 650000,
                    growth: 8.3,
                    students: 480,
                    coaches: 12,
                    rating: 4.5,
                    joinDate: '2023-07-05',
                    contract: 'Active - Expires 2026-07-05'
                },
                {
                    id: 5,
                    name: 'Miami Franchise',
                    owner: 'Carlos Rodriguez',
                    locations: 2,
                    status: 'active',
                    revenue: 550000,
                    growth: -2.1,
                    students: 380,
                    coaches: 10,
                    rating: 4.4,
                    joinDate: '2023-09-12',
                    contract: 'Active - Expires 2026-09-12'
                },
                {
                    id: 6,
                    name: 'Seattle Franchise',
                    owner: 'Lisa Anderson',
                    locations: 2,
                    status: 'pending',
                    revenue: 450000,
                    growth: 22.5,
                    students: 320,
                    coaches: 8,
                    rating: 4.3,
                    joinDate: '2024-01-08',
                    contract: 'Pending Approval'
                },
            ])
            setIsLoading(false)
        }, 1000)
    }, [])

    const filteredFranchises = franchises.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.owner.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterStatus === 'all' || f.status === filterStatus
        return matchesSearch && matchesFilter
    })

    const franchisePerformanceData = [
        { month: 'Jan', revenue: 850000, target: 800000 },
        { month: 'Feb', revenue: 920000, target: 850000 },
        { month: 'Mar', revenue: 1050000, target: 900000 },
        { month: 'Apr', revenue: 1150000, target: 950000 },
        { month: 'May', revenue: 1280000, target: 1000000 },
        { month: 'Jun', revenue: 1450000, target: 1100000 },
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            inactive: 'bg-red-100 text-red-800'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const totalRevenue = franchises.reduce((sum, f) => sum + f.revenue, 0)
    const totalLocations = franchises.reduce((sum, f) => sum + f.locations, 0)
    const totalStudents = franchises.reduce((sum, f) => sum + f.students, 0)
    const avgGrowth = (franchises.reduce((sum, f) => sum + f.growth, 0) / franchises.length).toFixed(1)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Franchise Management</h1>
                    <p className="text-gray-600 mt-1">Manage all franchise partners and their performance</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Franchise
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Franchises', value: franchises.length, icon: Globe, color: 'text-blue-600' },
                    { label: 'Total Locations', value: totalLocations, icon: MapPin, color: 'text-green-600' },
                    { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-purple-600' },
                    { label: 'Total Revenue', value: `$${(totalRevenue / 1000000).toFixed(2)}M`, icon: DollarSign, color: 'text-orange-600' },
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

            {/* Revenue Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Franchise Revenue Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={franchisePerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${(Number(value) / 1000000).toFixed(2)}M`} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                            <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search franchises..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Franchises Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFranchises.map((franchise, idx) => (
                    <motion.div
                        key={franchise.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow h-full">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{franchise.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">Owner: {franchise.owner}</p>
                                    </div>
                                    <Badge className={getStatusColor(franchise.status)}>
                                        {franchise.status}
                                    </Badge>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Locations</span>
                                        <span className="font-semibold text-gray-900">{franchise.locations}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Students</span>
                                        <span className="font-semibold text-gray-900">{franchise.students}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Coaches</span>
                                        <span className="font-semibold text-gray-900">{franchise.coaches}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Revenue</span>
                                        <span className="font-semibold text-gray-900">${(franchise.revenue / 1000).toFixed(0)}K</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <span className="text-sm text-gray-600">Growth</span>
                                        <span className={`font-semibold ${franchise.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {franchise.growth >= 0 ? '+' : ''}{franchise.growth}%
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Contract Status</p>
                                    <p className="text-sm font-medium text-gray-900">{franchise.contract}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Button>
                                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Franchise Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Franchise</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Locations</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Growth</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFranchises.map((franchise) => (
                                    <tr key={franchise.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <p className="font-medium text-gray-900">{franchise.name}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="text-gray-700">{franchise.owner}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="font-semibold text-gray-900">{franchise.locations}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="font-semibold text-gray-900">${(franchise.revenue / 1000).toFixed(0)}K</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`font-semibold ${franchise.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {franchise.growth >= 0 ? '+' : ''}{franchise.growth}%
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-500">★</span>
                                                <span className="font-semibold text-gray-900">{franchise.rating}</span>
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
