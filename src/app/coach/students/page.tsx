'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Users, Search, Filter, TrendingUp, Award, MessageSquare,
    Phone, Mail, Calendar, Target, Star, MoreVertical,
    RefreshCw, X, Eye, Send, UserMinus, Activity,
    CheckCircle, Clock, ArrowUp, Brain, Sparkles, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { coachService } from '@/services/modules/coach.service'
import { formatAIResponse } from '@/utils/formatAIResponse'
import aiCoachService from '@/services/aiCoachService'

// ==================== MOCK DATA ====================

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

// ==================== STUDENT DETAILS MODAL ====================

interface StudentDetailsModalProps {
    student: any
    onClose: () => void
}

const StudentDetailsModal = ({ student, onClose }: StudentDetailsModalProps) => {
    if (!student) return null

    const getProgressColor = (value: number) => {
        if (value >= 90) return 'bg-green-500'
        if (value >= 70) return 'bg-blue-500'
        if (value >= 50) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const getProgressTextColor = (value: number) => {
        if (value >= 90) return 'text-green-600'
        if (value >= 70) return 'text-blue-600'
        if (value >= 50) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'beginner': return 'bg-blue-100 text-blue-800'
            case 'intermediate': return 'bg-purple-100 text-purple-800'
            case 'advanced': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Simulated attendance history based on student data
    const attendanceHistory = [
        { week: 'Week 1', attended: Math.round(student.attendance / 100 * 5), total: 5 },
        { week: 'Week 2', attended: Math.round(student.attendance / 100 * 4), total: 4 },
        { week: 'Week 3', attended: Math.round(student.attendance / 100 * 5), total: 5 },
        { week: 'Week 4', attended: Math.round(student.attendance / 100 * 4), total: 4 },
    ]

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Student Details</h2>
                            <p className="text-sm text-gray-500">Progress & Performance Overview</p>
                        </div>
                        <Button id="coach-students-modal-close-btn" variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Student Info */}
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                {student.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className={getLevelColor(student.level)}>
                                        {student.level.charAt(0).toUpperCase() + student.level.slice(1)}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-medium">{student.rating}/5.0</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5" /> {student.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" /> {student.phone}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" /> Joined {new Date(student.joinDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <Activity className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-blue-700">{student.classes}</p>
                                <p className="text-xs text-blue-600">Total Classes</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-green-700">{student.attendance}%</p>
                                <p className="text-xs text-green-600">Attendance</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                                <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-purple-700">{student.progress}%</p>
                                <p className="text-xs text-purple-600">Progress</p>
                            </div>
                        </div>

                        {/* Overall Progress Bar */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">Overall Progress</h4>
                                <span className={`text-sm font-bold ${getProgressTextColor(student.progress)}`}>
                                    {student.progress}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <motion.div
                                    className={`h-3 rounded-full ${getProgressColor(student.progress)}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${student.progress}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {student.skills.map((skill: string, i: number) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                                    >
                                        <Target className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">{skill}</span>
                                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-500 h-1.5 rounded-full"
                                                style={{ width: `${60 + Math.random() * 35}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Attendance History */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Attendance History</h4>
                            <div className="space-y-2">
                                {attendanceHistory.map((week, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 w-16">{week.week}</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all"
                                                style={{ width: `${(week.attended / week.total) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 w-10 text-right">
                                            {week.attended}/{week.total}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Performance Trend */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Performance Summary</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Consistency</span>
                                    <span className="flex items-center gap-1 font-medium text-green-600">
                                        <ArrowUp className="w-3 h-3" />
                                        {student.attendance >= 90 ? 'Excellent' : student.attendance >= 75 ? 'Good' : 'Needs Improvement'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Growth Rate</span>
                                    <span className="flex items-center gap-1 font-medium text-blue-600">
                                        <TrendingUp className="w-3 h-3" />
                                        {student.progress >= 85 ? 'Fast' : student.progress >= 65 ? 'Steady' : 'Slow'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Class Engagement</span>
                                    <span className="flex items-center gap-1 font-medium text-purple-600">
                                        <Activity className="w-3 h-3" />
                                        {student.rating >= 4.5 ? 'High' : student.rating >= 3.5 ? 'Medium' : 'Low'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Time Invested</span>
                                    <span className="flex items-center gap-1 font-medium text-gray-700">
                                        <Clock className="w-3 h-3" />
                                        {student.classes} sessions
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                        <Button id="coach-students-details-close-btn" variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button id="coach-students-send-feedback-btn"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                                onClose()
                                window.location.href = `/coach/feedback?studentId=${student.id}&studentName=${encodeURIComponent(student.name)}`
                            }}
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send Feedback
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

// ==================== MAIN PAGE ====================

const CoachStudentsPage = () => {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterLevel, setFilterLevel] = useState('all')
    const [students, setStudents] = useState<any[]>([])
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [usingMockData, setUsingMockData] = useState(false)
    const [aiAnalysis, setAiAnalysis] = useState<Map<string, any>>(new Map())
    const [aiLoadingMap, setAiLoadingMap] = useState<Map<string, boolean>>(new Map())
    const [aiExpandedMap, setAiExpandedMap] = useState<Map<string, boolean>>(new Map())

    const handleAiAnalysis = async (student: any) => {
        const studentId = student.id
        // Toggle expand if already loaded
        if (aiAnalysis.has(studentId)) {
            setAiExpandedMap(prev => {
                const next = new Map(prev)
                next.set(studentId, !prev.get(studentId))
                return next
            })
            return
        }
        // Set loading
        setAiLoadingMap(prev => { const next = new Map(prev); next.set(studentId, true); return next })
        setAiExpandedMap(prev => { const next = new Map(prev); next.set(studentId, true); return next })
        try {
            const result = await aiCoachService.getRecommendations({ studentId })
            setAiAnalysis(prev => { const next = new Map(prev); next.set(studentId, result); return next })
        } catch (err) {
            console.error('AI analysis failed for student:', studentId, err)
            setAiAnalysis(prev => {
                const next = new Map(prev)
                next.set(studentId, { error: true, message: 'AI analysis is currently unavailable.' })
                return next
            })
        } finally {
            setAiLoadingMap(prev => { const next = new Map(prev); next.set(studentId, false); return next })
        }
    }

    const loadStudents = useCallback(async (showRefreshState = false) => {
        try {
            if (showRefreshState) {
                setRefreshing(true)
            } else {
                setIsLoading(true)
            }

            let fetchedStudents: any[] = []

            // Try fetching from API
            try {
                const coachId = user?.id || ''
                if (coachId) {
                    fetchedStudents = await coachService.getMyStudents(coachId)
                }
            } catch (apiError) {
                console.error('API call failed, falling back to mock data:', apiError)
            }

            // Fallback to mock data if API returns empty or fails
            if (!fetchedStudents || fetchedStudents.length === 0) {
                fetchedStudents = mockStudents
                setUsingMockData(true)
            } else {
                setUsingMockData(false)
            }

            setStudents(fetchedStudents)
        } catch (error) {
            console.error('Error loading students:', error)
            setStudents(mockStudents)
            setUsingMockData(true)
        } finally {
            setIsLoading(false)
            setRefreshing(false)
        }
    }, [user?.id])

    useEffect(() => {
        if (!isAuthenticated && !localStorage.getItem('token')) return
        loadStudents()
    }, [isAuthenticated, loadStudents])

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

    const handleViewProgress = (student: any) => {
        setSelectedStudent(student)
    }

    const handleFeedback = (student: any) => {
        router.push(`/coach/feedback?studentId=${student.id}&studentName=${encodeURIComponent(student.name)}`)
    }

    const handleViewDetails = (student: any) => {
        setSelectedStudent(student)
    }

    const handleSendMessage = (student: any) => {
        router.push(`/coach/feedback?studentId=${student.id}&studentName=${encodeURIComponent(student.name)}&type=message`)
    }

    const handleRemoveStudent = async (student: any) => {
        if (window.confirm(`Are you sure you want to remove ${student.name} from your student list?`)) {
            // Remove from local state immediately for responsive UI
            setStudents(prev => prev.filter(s => s.id !== student.id))
            // Note: Backend doesn't have a dedicated "remove student from coach" endpoint
            // This is a UI-level action that filters the display
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
            {/* Student Details Modal */}
            {selectedStudent && (
                <StudentDetailsModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}

            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>My Students</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Manage and track your students' progress
                        {usingMockData && (
                            <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                Demo Data
                            </span>
                        )}
                    </p>
                </div>
                <Button id="coach-students-refresh-btn"
                    variant="outline"
                    size="sm"
                    onClick={() => loadStudents(true)}
                    disabled={refreshing}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
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
                            <select id="select-coach-students-1"
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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button id={`coach-students-menu-${student.id}-btn`} variant="ghost" size="sm">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem id={`coach-students-view-details-${student.id}-btn`} onClick={() => handleViewDetails(student)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem id={`coach-students-send-message-${student.id}-btn`} onClick={() => handleSendMessage(student)}>
                                                <Send className="w-4 h-4 mr-2" />
                                                Send Message
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                id={`coach-students-remove-${student.id}-btn`}
                                                onClick={() => handleRemoveStudent(student)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <UserMinus className="w-4 h-4 mr-2" />
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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
                                        {student.skills.map((skill: string, i: number) => (
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
                                    <Button id={`coach-students-view-progress-${student.id}-btn`}
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleViewProgress(student)}
                                    >
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        View Progress
                                    </Button>
                                    <Button id={`coach-students-feedback-${student.id}-btn`}
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleFeedback(student)}
                                    >
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Feedback
                                    </Button>
                                </div>

                                {/* AI Analysis Button */}
                                <Button
                                    id={`coach-students-ai-analysis-${student.id}-btn`}
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                                    onClick={() => handleAiAnalysis(student)}
                                    disabled={aiLoadingMap.get(student.id) || false}
                                >
                                    {aiLoadingMap.get(student.id) ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Brain className="w-4 h-4 mr-2" />
                                    )}
                                    {aiExpandedMap.get(student.id) && aiAnalysis.has(student.id) ? 'Toggle AI Analysis' : 'AI Analysis'}
                                    <Badge className="ml-2 bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0">
                                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />AI
                                    </Badge>
                                </Button>

                                {/* AI Analysis Expandable Section */}
                                <AnimatePresence>
                                    {aiExpandedMap.get(student.id) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            {aiLoadingMap.get(student.id) ? (
                                                <div className="flex items-center justify-center py-4 text-purple-600">
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    <span className="text-sm">Analyzing...</span>
                                                </div>
                                            ) : aiAnalysis.get(student.id)?.error ? (
                                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                                                    {aiAnalysis.get(student.id)?.message || 'AI analysis unavailable.'}
                                                </div>
                                            ) : aiAnalysis.has(student.id) ? (
                                                <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg space-y-2">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Sparkles className="w-3 h-3 text-purple-600" />
                                                        <span className="text-xs font-semibold text-purple-800">AI Recommendations</span>
                                                    </div>
                                                    {(aiAnalysis.get(student.id)?.recommendations || aiAnalysis.get(student.id)?.data?.recommendations || []).length > 0 ? (
                                                        <ul className="space-y-1">
                                                            {(aiAnalysis.get(student.id)?.recommendations || aiAnalysis.get(student.id)?.data?.recommendations || []).map((rec: string, i: number) => (
                                                                <li key={i} className="text-xs text-purple-700 flex items-start gap-1.5">
                                                                    <Target className="w-3 h-3 mt-0.5 flex-shrink-0 text-purple-500" />
                                                                    {typeof rec === 'string' ? rec : rec?.message || rec?.description || rec?.title || formatAIResponse(rec)}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-xs text-purple-600">No specific recommendations at this time.</p>
                                                    )}
                                                    {aiAnalysis.get(student.id)?.confidence != null && (
                                                        <p className="text-[10px] text-purple-500 mt-1">Confidence: {Math.round(aiAnalysis.get(student.id).confidence * 100)}%</p>
                                                    )}
                                                </div>
                                            ) : null}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                        <Button id="coach-students-btn-clear-filters" variant="outline" onClick={() => {
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
