'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Users, Search, Filter, TrendingUp, Award, MessageSquare,
    Phone, Mail, Calendar, Target, Star, MoreVertical
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { rbacManager } from '@/services/auth/rbac'

const CoachStudentsPage = () => {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterLevel, setFilterLevel] = useState('all')
    const [students, setStudents] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        if (!rbacManager.hasPermission('coach_students')) {
            router.push('/parent/dashboard')
            return
        }

        loadStudents()
    }, [isAuthenticated, router])

    const loadStudents = async () => {
        try {
            setIsLoading(true)
            // Mock data for demo
            const mockStudents = [
                {
                    id: '1',
                    name: 'Aarav Patel',
                    email: 'aarav@example.com',
                    phone: '+91-9876543210',
                    level: 'beginner',
                    joinDate: '2024-01-15',
                    classes: 12,
                    attendance: 92,
                    progress: 75,
                    skills: ['Balance', 'Flexibility'],
                    rating: 4.5
                },
                {
                    id: '2',
                    name: 'Priya Singh',
                    email: 'priya@example.com',
                    phone: '+91-9876543211',
                    level: 'intermediate',
                    joinDate: '2023-11-20',
                    classes: 24,
                    attendance: 95,
                    progress: 85,
                    skills: ['Tumbling', 'Coordination'],
                    rating: 4.8
                },
                {
                    id: '3',
                    name: 'Rohan Kumar',
                    email: 'rohan@example.com',
                    phone: '+91-9876543212',
                    level: 'advanced',
                    joinDate: '2023-08-10',
                    classes: 36,
                    attendance: 98,
                    progress: 92,
                    skills: ['Acrobatics', 'Strength'],
                    rating: 4.9
                },
                {
                    id: '4',
                    name: 'Ananya Sharma',
                    email: 'ananya@example.com',
                    phone: '+91-9876543213',
                    level: 'beginner',
                    joinDate: '2024-02-01',
                    classes: 8,
                    attendance: 88,
                    progress: 65,
                    skills: ['Stretching'],
                    rating: 4.2
                },
                {
                    id: '5',
                    name: 'Vikram Desai',
                    email: 'vikram@example.com',
                    phone: '+91-9876543214',
                    level: 'intermediate',
                    joinDate: '2023-12-05',
                    classes: 18,
                    attendance: 91,
                    progress: 78,
                    skills: ['Balance', 'Agility'],
                    rating: 4.6
                }
            ]
            setStudents(mockStudents)
            setIsLoading(false)
        } catch (error) {
            console.error('Error loading students:', error)
            setIsLoading(false)
        }
    }

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterLevel === 'all' || student.level === filterLevel
        return matchesSearch && matchesFilter
    })

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'beginner':
                return 'bg-blue-100 text-blue-800'
            case 'intermediate':
                return 'bg-purple-100 text-purple-800'
            case 'advanced':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <h1 className={responsiveClasses.headerTitle}>My Students</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Manage and track your students' progress
                    </p>
                </div>
            </div>

            {/* Search and Filter */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search students by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Levels</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Students Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student, index) => (
                    <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{student.name}</h3>
                                        <Badge className={`mt-2 ${getLevelColor(student.level)}`}>
                                            {student.level.charAt(0).toUpperCase() + student.level.slice(1)}
                                        </Badge>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Contact Info */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{student.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{student.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {new Date(student.joinDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-200">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-600">Classes</p>
                                        <p className="font-bold text-gray-900">{student.classes}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-600">Attendance</p>
                                        <p className="font-bold text-green-600">{student.attendance}%</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-600">Progress</p>
                                        <p className="font-bold text-blue-600">{student.progress}%</p>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {student.skills.map((skill, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2 py-2 bg-yellow-50 rounded-lg px-3">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-semibold text-gray-900">{student.rating}</span>
                                    <span className="text-sm text-gray-600">/ 5.0</span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => router.push(`/coach/students/${student.id}`)}
                                    >
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        View Progress
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Feedback
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No students found matching your criteria</p>
                        <Button variant="outline" onClick={() => {
                            setSearchTerm('')
                            setFilterLevel('all')
                        }}>
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default CoachStudentsPage
