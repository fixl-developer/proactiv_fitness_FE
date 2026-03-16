'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Calendar, Star, Target, CheckCircle, Clock,
    AlertTriangle, Filter, Download, Eye, Plus, Search,
    MapPin, User, Award, TrendingUp, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const CustomerAssessmentsPage = () => {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')

    // Assessment statistics
    const assessmentStats = {
        totalAssessments: 1247,
        pendingAssessments: 89,
        completedThisMonth: 156,
        averageScore: 7.8,
        completionRate: 92.3,
        overdueAssessments: 12,
        averageTimeToComplete: 14, // days
        satisfactionScore: 4.6
    }

    // Recent assessments
    const recentAssessments = [
        {
            id: 'ASS-2024-001',
            studentName: 'Emma Chen',
            parentName: 'Mrs. Sarah Chen',
            program: 'GYMTOTS',
            location: 'Cyberport',
            assessor: 'Coach Lisa',
            scheduledDate: '2024-01-25',
            status: 'completed',
            score: 8.5,
            skills: {
                balance: 9,
                coordination: 8,
                strength: 8,
                flexibility: 9,
                listening: 8
            },
            recommendations: 'Ready for beginner level',
            nextSteps: 'Enroll in regular classes'
        },
        {
            id: 'ASS-2024-002',
            studentName: 'Alex Wong',
            parentName: 'Mr. David Wong',
            program: 'Beginner Gymnastics',
            location: 'Wan Chai',
            assessor: 'Coach Mike',
            scheduledDate: '2024-01-26',
            status: 'pending',
            score: null,
            skills: {},
            recommendations: '',
            nextSteps: ''
        },
        {
            id: 'ASS-2024-003',
            studentName: 'Sophie Li',
            parentName: 'Mrs. Lisa Li',
            program: 'Intermediate Gymnastics',
            location: 'Sha Tin',
            assessor: 'Coach Anna',
            scheduledDate: '2024-01-24',
            status: 'overdue',
            score: null,
            skills: {},
            recommendations: '',
            nextSteps: ''
        },
        {
            id: 'ASS-2024-004',
            studentName: 'Ryan Kim',
            parentName: 'Mr. James Kim',
            program: 'GYMTOTS',
            location: 'Cyberport',
            assessor: 'Coach Lisa',
            scheduledDate: '2024-01-23',
            status: 'completed',
            score: 7.2,
            skills: {
                balance: 7,
                coordination: 7,
                strength: 8,
                flexibility: 7,
                listening: 7
            },
            recommendations: 'Continue with current level',
            nextSteps: 'Regular practice sessions'
        }
    ]

    // Assessment metrics by location
    const locationMetrics = [
        {
            location: 'Cyberport',
            totalAssessments: 389,
            completed: 356,
            pending: 28,
            overdue: 5,
            averageScore: 8.1,
            completionRate: 94.2,
            topAssessor: 'Coach Lisa'
        },
        {
            location: 'Wan Chai',
            totalAssessments: 312,
            completed: 289,
            pending: 19,
            overdue: 4,
            averageScore: 7.8,
            completionRate: 92.6,
            topAssessor: 'Coach Mike'
        },
        {
            location: 'Sha Tin',
            totalAssessments: 298,
            completed: 271,
            pending: 24,
            overdue: 3,
            averageScore: 7.6,
            completionRate: 90.9,
            topAssessor: 'Coach Anna'
        },
        {
            location: 'Tsim Sha Tsui',
            totalAssessments: 248,
            completed: 225,
            pending: 18,
            overdue: 5,
            averageScore: 7.4,
            completionRate: 90.7,
            topAssessor: 'Coach Tom'
        }
    ]

    // Assessment trends
    const assessmentTrends = [
        { month: 'Aug 2023', assessments: 98, avgScore: 7.2, completionRate: 89.8 },
        { month: 'Sep 2023', assessments: 124, avgScore: 7.4, completionRate: 91.1 },
        { month: 'Oct 2023', assessments: 142, avgScore: 7.6, completionRate: 92.3 },
        { month: 'Nov 2023', assessments: 118, avgScore: 7.5, completionRate: 91.5 },
        { month: 'Dec 2023', assessments: 134, avgScore: 7.7, completionRate: 92.5 },
        { month: 'Jan 2024', assessments: 156, avgScore: 7.8, completionRate: 92.3 }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            completed: 'text-green-600 bg-green-50',
            pending: 'text-yellow-600 bg-yellow-50',
            overdue: 'text-red-600 bg-red-50',
            scheduled: 'text-blue-600 bg-blue-50'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-600'
        if (score >= 6) return 'text-yellow-600'
        return 'text-red-600'
    }

    const filteredAssessments = recentAssessments.filter(assessment => {
        if (selectedFilter === 'all') return true
        return assessment.status === selectedFilter
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Customer Assessments</h1>
                    <p className="text-gray-600 mt-2">Manage and track student skill assessments</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Assessment
                    </Button>
                </div>
            </div>

            {/* Assessment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Assessments</CardTitle>
                        <Users className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{assessmentStats.totalAssessments}</div>
                        <div className="text-sm text-blue-600 font-medium">All time</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Assessments</CardTitle>
                        <Clock className="h-5 w-5 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{assessmentStats.pendingAssessments}</div>
                        <div className="text-sm text-yellow-600 font-medium">Awaiting completion</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
                        <Star className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{assessmentStats.averageScore}/10</div>
                        <div className="text-sm text-green-600 font-medium">This month</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{assessmentStats.completionRate}%</div>
                        <div className="text-sm text-purple-600 font-medium">On-time completion</div>
                    </CardContent>
                </Card>
            </div>

            {/* Assessment Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    {['all', 'pending', 'completed', 'overdue'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setSelectedFilter(filter as any)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedFilter === filter
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search assessments..."
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Recent Assessments */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Recent Assessments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredAssessments.map((assessment, index) => (
                            <motion.div
                                key={assessment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {assessment.studentName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{assessment.studentName}</h4>
                                            <p className="text-sm text-gray-600">{assessment.parentName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getStatusColor(assessment.status)}>
                                            {assessment.status}
                                        </Badge>
                                        {assessment.score && (
                                            <div className={`font-bold ${getScoreColor(assessment.score)}`}>
                                                {assessment.score}/10
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                    <div>
                                        <span className="text-sm text-gray-600">Program:</span>
                                        <div className="font-medium">{assessment.program}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Location:</span>
                                        <div className="font-medium">{assessment.location}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Assessor:</span>
                                        <div className="font-medium">{assessment.assessor}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Date:</span>
                                        <div className="font-medium">{assessment.scheduledDate}</div>
                                    </div>
                                </div>

                                {assessment.status === 'completed' && assessment.skills && Object.keys(assessment.skills).length > 0 && (
                                    <div className="mt-4 p-3 bg-white rounded-lg">
                                        <h5 className="font-medium text-gray-900 mb-2">Skill Assessment</h5>
                                        <div className="grid grid-cols-5 gap-3">
                                            {Object.entries(assessment.skills).map(([skill, score]) => (
                                                <div key={skill} className="text-center">
                                                    <div className="text-sm text-gray-600 capitalize">{skill}</div>
                                                    <div className={`text-lg font-bold ${getScoreColor(score as number)}`}>
                                                        {score}/10
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {assessment.recommendations && (
                                            <div className="mt-3 p-2 bg-blue-50 rounded">
                                                <div className="text-sm font-medium text-blue-900">Recommendations:</div>
                                                <div className="text-sm text-blue-700">{assessment.recommendations}</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 mt-3">
                                    <Button variant="outline" size="sm">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                    </Button>
                                    {assessment.status === 'pending' && (
                                        <Button size="sm">
                                            Complete Assessment
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Location Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        Assessment Performance by Location
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {locationMetrics.map((location, index) => (
                            <motion.div
                                key={location.location}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-gray-900">{location.location}</h4>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">{location.averageScore}/10</div>
                                        <div className="text-sm text-gray-600">Avg Score</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="text-center p-2 bg-white rounded">
                                        <div className="text-lg font-bold text-green-600">{location.completed}</div>
                                        <div className="text-xs text-gray-600">Completed</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                        <div className="text-lg font-bold text-yellow-600">{location.pending}</div>
                                        <div className="text-xs text-gray-600">Pending</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                        <div className="text-lg font-bold text-red-600">{location.overdue}</div>
                                        <div className="text-xs text-gray-600">Overdue</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Completion Rate:</span>
                                        <span className="font-medium">{location.completionRate}%</span>
                                    </div>
                                    <Progress value={location.completionRate} className="h-2" />
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Top Assessor:</span>
                                        <span className="font-medium">{location.topAssessor}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>)
}

export default CustomerAssessmentsPage