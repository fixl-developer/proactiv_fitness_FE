'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Eye,
    Mail,
    Phone,
    Calendar,
    MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Student {
    id: string
    name: string
    email: string
    phone: string
    age: number
    program: string
    location: string
    joinDate: string
    status: 'active' | 'inactive' | 'trial'
    parent: string
    parentEmail: string
}

const StudentsPage = () => {
    const [students, setStudents] = useState<Student[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'trial'>('all')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setStudents([
                {
                    id: '1',
                    name: 'Emma Chen',
                    email: 'emma.chen@email.com',
                    phone: '+852 9999 0001',
                    age: 8,
                    program: 'Beginner Gymnastics',
                    location: 'Cyberport',
                    joinDate: '2024-01-15',
                    status: 'active',
                    parent: 'David Chen',
                    parentEmail: 'david.chen@email.com'
                },
                {
                    id: '2',
                    name: 'Lucas Wong',
                    email: 'lucas.wong@email.com',
                    phone: '+852 9999 0002',
                    age: 10,
                    program: 'Intermediate Gymnastics',
                    location: 'Wan Chai',
                    joinDate: '2024-02-01',
                    status: 'active',
                    parent: 'Sarah Wong',
                    parentEmail: 'sarah.wong@email.com'
                },
                {
                    id: '3',
                    name: 'Sophia Li',
                    email: 'sophia.li@email.com',
                    phone: '+852 9999 0003',
                    age: 6,
                    program: 'Trial Class',
                    location: 'Cyberport',
                    joinDate: '2024-02-10',
                    status: 'trial',
                    parent: 'Michael Li',
                    parentEmail: 'michael.li@email.com'
                }
            ])
            setIsLoading(false)
        }, 1000)
    }, [])

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.parent.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterStatus === 'all' || student.status === filterStatus
        return matchesSearch && matchesFilter
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'inactive':
                return 'bg-red-100 text-red-800'
            case 'trial':
                return 'bg-yellow-100 text-yellow-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
                    <h2 className="text-2xl font-bold text-gray-900">Students Management</h2>
                    <p className="text-gray-600">Manage all student enrollments and information</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search students, parents, or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['all', 'active', 'inactive', 'trial'].map((status) => (
                                <Button
                                    key={status}
                                    variant={filterStatus === status ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus(status as any)}
                                    className="capitalize"
                                >
                                    {status}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Students List */}
            <div className="space-y-4">
                {filteredStudents.map((student, index) => (
                    <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold text-lg">
                                                {student.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-3">
                                                <h3 className="font-semibold text-lg">{student.name}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                                    {student.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    <Mail className="w-4 h-4" />
                                                    <span>{student.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{student.phone}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Age: {student.age}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{student.location}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Program: <span className="font-medium">{student.program}</span> |
                                                Parent: <span className="font-medium">{student.parent}</span> ({student.parentEmail})
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredStudents.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default StudentsPage