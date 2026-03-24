'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Search, Filter, Plus, RefreshCw, Eye, Edit, Mail, Phone,
    Calendar, Star, TrendingUp, UserCheck, BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const ManagerStudentsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all')

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

    const studentStats = {
        totalStudents: 89,
        activeStudents: 76,
        newThisMonth: 12,
        averageRating: 4.6
    }

    const studentsData = [
        {
            id: 1,
            name: 'Emma Chen',
            age: 8,
            parent: 'David Chen',
            program: 'Beginner Gymnastics',
            coach: 'Sarah Johnson',
            joinDate: '2024-01-15',
            status: 'active',
            progress: 85,
            rating: 4.8,
            email: 'david.chen@email.com',
            phone: '+852 9876 5432'
        },
        {
            id: 2,
            name: 'Lucas Wong',
            age: 10,
            parent: 'Michelle Wong',
            program: 'Intermediate Gymnastics',
            coach: 'Mike Chen',
            joinDate: '2023-11-20',
            status: 'active',
            progress: 92,
            rating: 4.7,
            email: 'michelle.wong@email.com',
            phone: '+852 9876 5433'
        },
        {
            id: 3,
            name: 'Sophia Li',
            age: 7,
            parent: 'James Li',
            program: 'Private Coaching',
            coach: 'Lisa Zhang',
            joinDate: '2024-01-10',
            status: 'active',
            progress: 78,
            rating: 4.9,
            email: 'james.li@email.com',
            phone: '+852 9876 5434'
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const filteredStudents = studentsData.filter(student =>
        selectedFilter === 'all' || student.status === selectedFilter
    )

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
                    <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
                    <p className="text-gray-600 mt-2">Monitor student progress and enrollment</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button id="manager-students-refresh-btn" variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button id="manager-students-add-btn" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Student
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                            <Users className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{studentStats.totalStudents}</div>
                            <Progress value={85} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Students</CardTitle>
                            <UserCheck className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{studentStats.activeStudents}</div>
                            <Progress value={90} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">New This Month</CardTitle>
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{studentStats.newThisMonth}</div>
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
                            <div className="text-2xl font-bold text-gray-900">{studentStats.averageRating}</div>
                            <Progress value={92} className="mt-3 h-2" />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Students List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Students List</CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <select id="select-manager-students-1"
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">All Students</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredStudents.map((student, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                            <Badge className={getStatusColor(student.status)}>
                                                {student.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{student.program} • Coach: {student.coach}</p>
                                        <p className="text-xs text-gray-500">Parent: {student.parent} • Age: {student.age}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-purple-600">{student.progress}%</p>
                                    <p className="text-sm text-gray-600">Progress</p>
                                    <p className="text-xs text-yellow-600">⭐ {student.rating}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <Button id={`manager-students-view-${student.id}-btn`} variant="ghost" size="sm">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button id={`manager-students-email-${student.id}-btn`} variant="ghost" size="sm">
                                        <Mail className="w-4 h-4" />
                                    </Button>
                                    <Button id={`manager-students-edit-${student.id}-btn`} variant="ghost" size="sm">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ManagerStudentsPage
