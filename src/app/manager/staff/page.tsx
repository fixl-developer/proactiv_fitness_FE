'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    UserCheck, Users, Calendar, Star, Plus, RefreshCw, Eye, Edit, Mail, Phone,
    Clock, Award, TrendingUp, Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const ManagerStaffPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'coaches' | 'assistants'>('all')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            const userRole = localStorage.getItem('userRole')
            if (!isAuthenticated || userRole !== 'MANAGER') {
                window.location.href = '/login'
                return
            }
        }
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    const staffStats = {
        totalStaff: 12,
        activeCoaches: 8,
        assistants: 4,
        averageRating: 4.7
    }

    const staffData = [
        {
            id: 1,
            name: 'Sarah Johnson',
            role: 'Senior Coach',
            specialization: 'Gymnastics',
            experience: '5 years',
            students: 24,
            rating: 4.9,
            status: 'active',
            email: 'sarah.johnson@proactivsports.net',
            phone: '+852 9876 1234',
            joinDate: '2019-03-15',
            certifications: ['Level 3 Gymnastics', 'First Aid']
        },
        {
            id: 2,
            name: 'Mike Chen',
            role: 'Coach',
            specialization: 'Gymnastics',
            experience: '3 years',
            students: 18,
            rating: 4.7,
            status: 'active',
            email: 'mike.chen@proactivsports.net',
            phone: '+852 9876 1235',
            joinDate: '2021-06-10',
            certifications: ['Level 2 Gymnastics', 'CPR']
        },
        {
            id: 3,
            name: 'Lisa Zhang',
            role: 'Private Coach',
            specialization: 'Advanced Gymnastics',
            experience: '7 years',
            students: 12,
            rating: 4.8,
            status: 'active',
            email: 'lisa.zhang@proactivsports.net',
            phone: '+852 9876 1236',
            joinDate: '2017-09-20',
            certifications: ['Level 4 Gymnastics', 'Sports Psychology']
        },
        {
            id: 4,
            name: 'Tom Wilson',
            role: 'Assistant Coach',
            specialization: 'Beginner Programs',
            experience: '2 years',
            students: 15,
            rating: 4.5,
            status: 'active',
            email: 'tom.wilson@proactivsports.net',
            phone: '+852 9876 1237',
            joinDate: '2022-01-15',
            certifications: ['Level 1 Gymnastics', 'First Aid']
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            on_leave: 'bg-yellow-100 text-yellow-800'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getRoleColor = (role: string) => {
        const colors = {
            'Senior Coach': 'bg-purple-100 text-purple-800',
            'Coach': 'bg-blue-100 text-blue-800',
            'Private Coach': 'bg-indigo-100 text-indigo-800',
            'Assistant Coach': 'bg-green-100 text-green-800'
        }
        return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const filteredStaff = staffData.filter(staff => {
        if (selectedFilter === 'all') return true
        if (selectedFilter === 'coaches') return staff.role.includes('Coach') && !staff.role.includes('Assistant')
        if (selectedFilter === 'assistants') return staff.role.includes('Assistant')
        return true
    })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-gray-600 mt-2">Manage coaches and staff members</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Staff
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Staff</CardTitle>
                            <Users className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{staffStats.totalStaff}</div>
                            <Progress value={85} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Coaches</CardTitle>
                            <UserCheck className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{staffStats.activeCoaches}</div>
                            <Progress value={90} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Assistants</CardTitle>
                            <Activity className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{staffStats.assistants}</div>
                            <Progress value={60} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
                            <Star className="h-5 w-5 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{staffStats.averageRating}</div>
                            <Progress value={94} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Staff List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Staff Members</CardTitle>
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Staff</option>
                                <option value="coaches">Coaches</option>
                                <option value="assistants">Assistants</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredStaff.map((staff, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        {staff.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{staff.name}</h4>
                                            <Badge className={getRoleColor(staff.role)}>
                                                {staff.role}
                                            </Badge>
                                            <Badge className={getStatusColor(staff.status)}>
                                                {staff.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{staff.specialization} • {staff.experience} experience</p>
                                        <p className="text-xs text-gray-500">{staff.students} students • ⭐ {staff.rating}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">{staff.email}</p>
                                    <p className="text-sm text-gray-600">{staff.phone}</p>
                                    <p className="text-xs text-gray-500">Joined: {staff.joinDate}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Mail className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Plus className="w-6 h-6" />
                            <span>Add Staff</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Calendar className="w-6 h-6" />
                            <span>Schedule</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Award className="w-6 h-6" />
                            <span>Performance</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Mail className="w-6 h-6" />
                            <span>Send Message</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ManagerStaffPage
