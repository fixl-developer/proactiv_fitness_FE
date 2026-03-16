'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Star, Calendar, Phone, Mail, MessageSquare, Eye,
    Filter, Search, Award, TrendingUp, Clock, Target, Baby,
    CheckCircle, AlertTriangle, Activity, BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

const CoachStudentsPage = () => {
    const [selectedProgram, setSelectedProgram] = useState<string>('all')
    const [selectedLevel, setSelectedLevel] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Coach's students data
    const myStudents = [
        {
            id: 1,
            name: 'Emma Chen',
            age: 4,
            parentName: 'Mrs. Sarah Chen',
            parentPhone: '+852 9876 5432',
            parentEmail: 'sarah.chen@email.com',
            program: 'GYMTOTS',
            level: 'Beginner',
            startDate: '2023-09-20',
            classSchedule: 'Tue 10:00 AM, Thu 10:00 AM',
            attendance: 95,
            totalClasses: 40,
            attendedClasses: 38,
            skillProgress: {
                balance: 4,
                coordination: 4,
                strength: 3,
                flexibility: 5,
                listening: 5,
                following_instructions: 5
            },
            recentNotes: [
                { date: '2024-01-20', note: 'Excellent progress on balance beam. Very confident now.' },
                { date: '2024-01-15', note: 'Great listening skills, follows all instructions perfectly.' }
            ],
            parentFeedback: 4.9,
            goals: ['Master forward roll', 'Improve handstand hold', 'Build confidence on beam'],
            achievements: ['First cartwheel', 'Perfect attendance month', 'Listening champion'],
            nextAssessment: '2024-02-15'
        },
        {
            id: 2,
            name: 'Lucas Wong',
            age: 6,
            parentName: 'Mr. David Wong',
            parentPhone: '+852 9123 4567',
            parentEmail: 'david.wong@email.com',
            program: 'Beginner Gymnastics',
            level: 'Intermediate',
            startDate: '2023-11-25',
            classSchedule: 'Mon 4:00 PM, Wed 4:00 PM',
            attendance: 88,
            totalClasses: 24,
            attendedClasses: 21,
            skillProgress: {
                balance: 3,
                coordination: 4,
                strength: 4,
                flexibility: 3,
                listening: 4,
                following_instructions: 4
            },
            recentNotes: [
                { date: '2024-01-18', note: 'Working on cartwheel technique. Needs more practice.' },
                { date: '2024-01-10', note: 'Good strength development, ready for more challenging skills.' }
            ],
            parentFeedback: 4.7,
            goals: ['Perfect cartwheel', 'Handstand progression', 'Improve flexibility'],
            achievements: ['First handstand', 'Strength improvement'],
            nextAssessment: '2024-02-20'
        },
        {
            id: 3,
            name: 'Sophia Li',
            age: 8,
            parentName: 'Mrs. Lisa Li',
            parentPhone: '+852 9234 5678',
            parentEmail: 'lisa.li@email.com',
            program: 'Intermediate Gymnastics',
            level: 'Advanced',
            startDate: '2023-08-15',
            classSchedule: 'Tue 5:00 PM, Fri 5:00 PM',
            attendance: 97,
            totalClasses: 60,
            attendedClasses: 58,
            skillProgress: {
                balance: 5,
                coordination: 5,
                strength: 4,
                flexibility: 5,
                listening: 5,
                following_instructions: 5
            },
            recentNotes: [
                { date: '2024-01-22', note: 'Exceptional talent. Ready for competition preparation.' },
                { date: '2024-01-17', note: 'Mastered back walkover. Working on aerial cartwheel.' }
            ],
            parentFeedback: 4.9,
            goals: ['Master aerial cartwheel', 'Competition preparation', 'Leadership skills'],
            achievements: ['Back walkover mastery', 'Student mentor', 'Perfect form award'],
            nextAssessment: '2024-02-10'
        },
        {
            id: 4,
            name: 'Ryan Kim',
            age: 5,
            parentName: 'Mr. James Kim',
            parentPhone: '+852 9345 6789',
            parentEmail: 'james.kim@email.com',
            program: 'GYMTOTS',
            level: 'Trial',
            startDate: '2024-01-10',
            classSchedule: 'Wed 11:00 AM',
            attendance: 100,
            totalClasses: 3,
            attendedClasses: 3,
            skillProgress: {
                balance: 2,
                coordination: 3,
                strength: 2,
                flexibility: 3,
                listening: 4,
                following_instructions: 3
            },
            recentNotes: [
                { date: '2024-01-22', note: 'New student, very eager to learn. Needs confidence building.' },
                { date: '2024-01-17', note: 'Good listening skills for age. Working on basic movements.' }
            ],
            parentFeedback: 4.5,
            goals: ['Build confidence', 'Basic skill development', 'Social interaction'],
            achievements: ['First class completion'],
            nextAssessment: '2024-02-01'
        },
        {
            id: 5,
            name: 'Mia Zhang',
            age: 7,
            parentName: 'Mrs. Amy Zhang',
            parentPhone: '+852 9456 7890',
            parentEmail: 'amy.zhang@email.com',
            program: 'Beginner Gymnastics',
            level: 'Beginner',
            startDate: '2023-06-15',
            classSchedule: 'Thu 4:00 PM, Sat 10:00 AM',
            attendance: 82,
            totalClasses: 48,
            attendedClasses: 39,
            skillProgress: {
                balance: 3,
                coordination: 3,
                strength: 3,
                flexibility: 4,
                listening: 3,
                following_instructions: 3
            },
            recentNotes: [
                { date: '2024-01-19', note: 'Attendance has been irregular. Need to discuss with parent.' },
                { date: '2024-01-12', note: 'Good flexibility, but needs to focus more during class.' }
            ],
            parentFeedback: 4.2,
            goals: ['Improve attendance', 'Better focus', 'Skill consistency'],
            achievements: ['Flexibility improvement'],
            nextAssessment: '2024-02-25'
        }
    ]

    // Student statistics
    const studentStats = {
        total: myStudents.length,
        avgAttendance: Math.round(myStudents.reduce((sum, s) => sum + s.attendance, 0) / myStudents.length),
        avgRating: (myStudents.reduce((sum, s) => sum + s.parentFeedback, 0) / myStudents.length).toFixed(1),
        upcomingAssessments: myStudents.filter(s => new Date(s.nextAssessment) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length
    }

    const getAttendanceColor = (attendance: number) => {
        if (attendance >= 90) return 'text-green-600'
        if (attendance >= 80) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getSkillColor = (score: number) => {
        if (score >= 4) return 'text-green-600'
        if (score >= 3) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getLevelColor = (level: string) => {
        const colors = {
            'Trial': 'text-blue-600 bg-blue-50',
            'Beginner': 'text-green-600 bg-green-50',
            'Intermediate': 'text-yellow-600 bg-yellow-50',
            'Advanced': 'text-purple-600 bg-purple-50'
        }
        return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const filteredStudents = myStudents.filter(student => {
        const matchesProgram = selectedProgram === 'all' || student.program === selectedProgram
        const matchesLevel = selectedLevel === 'all' || student.level === selectedLevel
        const matchesSearch = searchTerm === '' ||
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.parentName.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesProgram && matchesLevel && matchesSearch
    })

    return (
        <DashboardLayout userRole="coach" userName="Sarah Chen">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
                        <p className="text-gray-600 mt-2">Track progress and manage student development</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Class Notes
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                            <Users className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{studentStats.total}</div>
                            <div className="text-sm text-blue-600 font-medium">Active students</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Avg Attendance</CardTitle>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{studentStats.avgAttendance}%</div>
                            <div className="text-sm text-green-600 font-medium">Class attendance</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Parent Rating</CardTitle>
                            <Star className="h-5 w-5 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{studentStats.avgRating}/5.0</div>
                            <div className="text-sm text-yellow-600 font-medium">Average feedback</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Assessments Due</CardTitle>
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{studentStats.upcomingAssessments}</div>
                            <div className="text-sm text-purple-600 font-medium">This week</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search by student or parent name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={selectedProgram}
                                    onChange={(e) => setSelectedProgram(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All Programs</option>
                                    <option value="GYMTOTS">GYMTOTS</option>
                                    <option value="Beginner Gymnastics">Beginner Gymnastics</option>
                                    <option value="Intermediate Gymnastics">Intermediate Gymnastics</option>
                                </select>
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="Trial">Trial</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Students List */}
                <div className="space-y-6">
                    {filteredStudents.map((student, index) => (
                        <motion.div
                            key={student.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    {/* Student Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {student.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{student.name}</h3>
                                                <p className="text-sm text-gray-600">Age {student.age} • {student.program}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={getLevelColor(student.level)}>
                                                        {student.level}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        Started {student.startDate}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Phone className="w-4 h-4 mr-2" />
                                                Call Parent
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Message
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                Details
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Student Details Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                                        {/* Basic Info */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Class Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Schedule:</span>
                                                    <span className="font-medium text-right">{student.classSchedule}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Attendance:</span>
                                                    <span className={`font-medium ${getAttendanceColor(student.attendance)}`}>
                                                        {student.attendance}% ({student.attendedClasses}/{student.totalClasses})
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Parent Rating:</span>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="font-medium">{student.parentFeedback}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Next Assessment:</span>
                                                    <span className="font-medium">{student.nextAssessment}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Parent Contact */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Parent Contact</h4>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Name:</span>
                                                    <span className="ml-2 font-medium">{student.parentName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{student.parentPhone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs">{student.parentEmail}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skill Progress */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Skill Assessment</h4>
                                            <div className="space-y-2">
                                                {Object.entries(student.skillProgress).map(([skill, score]) => (
                                                    <div key={skill} className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600 capitalize">
                                                            {skill.replace('_', ' ')}:
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`w-3 h-3 ${star <= score
                                                                            ? 'text-yellow-400 fill-yellow-400'
                                                                            : 'text-gray-300'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className={`text-xs font-medium ${getSkillColor(score)}`}>
                                                                {score}/5
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Goals and Achievements */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Current Goals</h4>
                                            <div className="space-y-1">
                                                {student.goals.map((goal, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <Target className="w-3 h-3 text-blue-600" />
                                                        <span className="text-sm text-gray-700">{goal}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Achievements</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {student.achievements.map((achievement, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        <Award className="w-3 h-3 mr-1" />
                                                        {achievement}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Notes */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <h4 className="font-medium text-gray-900 mb-2">Recent Class Notes</h4>
                                        <div className="space-y-2">
                                            {student.recentNotes.slice(0, 2).map((note, idx) => (
                                                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs text-gray-500">{note.date}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{note.note}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default CoachStudentsPage