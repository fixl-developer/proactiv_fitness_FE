'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Plus, RefreshCw, Eye, Edit, Calendar, Star, TrendingUp,
    BookOpen, Award, Activity, Loader, AlertCircle, Trophy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { FamilySchedulerService } from '@/services/modules/family-scheduler.service'
import ParentROIService from '@/services/modules/parent-roi.service'

const ParentChildrenPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [children, setChildren] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    const parentId = user?.id || 'parent-1'

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadChildren()
    }, [isAuthenticated, router, parentId])

    const loadChildren = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Load family schedule to get children
            const roiService = new ParentROIService()

            // Get upcoming events to identify children
            await FamilySchedulerService.getUpcomingEvents(parentId, 30)

            // Get ROI data for all children
            const roiData = await roiService.getParentROI(parentId)

            // Combine data
            const fetchedChildren = roiData?.data?.children || []
            setChildren(fetchedChildren)
        } catch (err) {
            console.error('Error loading children:', err)
            setError('Failed to load children data')
        } finally {
            setIsLoading(false)
        }
    }

    const childrenData = [
        {
            id: 1,
            name: 'Emma Chen',
            age: 8,
            dateOfBirth: '2015-06-15',
            program: 'Beginner Gymnastics',
            level: 'Level 2',
            coach: 'Sarah Johnson',
            joinDate: '2024-01-15',
            totalClasses: 12,
            attendedClasses: 11,
            progress: 85,
            rating: 4.8,
            nextClass: '2024-01-25 10:00 AM',
            achievements: ['Perfect Attendance', 'Quick Learner', 'Team Player'],
            skills: {
                flexibility: 90,
                strength: 75,
                coordination: 85,
                confidence: 95
            },
            medicalInfo: {
                allergies: ['None'],
                medications: ['None'],
                emergencyContact: 'David Chen (+852 9876 5432)'
            }
        },
        {
            id: 2,
            name: 'Lucas Chen',
            age: 10,
            dateOfBirth: '2013-09-22',
            program: 'Intermediate Gymnastics',
            level: 'Level 3',
            coach: 'Mike Wong',
            joinDate: '2023-11-20',
            totalClasses: 28,
            attendedClasses: 26,
            progress: 92,
            rating: 4.7,
            nextClass: '2024-01-26 2:00 PM',
            achievements: ['Advanced Skills', 'Leadership', 'Consistency Champion'],
            skills: {
                flexibility: 85,
                strength: 90,
                coordination: 88,
                confidence: 92
            },
            medicalInfo: {
                allergies: ['Peanuts'],
                medications: ['Inhaler (as needed)'],
                emergencyContact: 'David Chen (+852 9876 5432)'
            }
        }
    ]

    const getSkillColor = (score: number) => {
        if (score >= 90) return 'text-green-600'
        if (score >= 80) return 'text-blue-600'
        if (score >= 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
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
                    <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
                    <p className="text-gray-600 mt-2">Track your children's progress and development</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Child
                    </Button>
                </div>
            </div>

            {/* Children Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {childrenData.map((child, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                            {child.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{child.name}</CardTitle>
                                            <p className="text-sm text-gray-500">{child.age} years old • Born: {child.dateOfBirth}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-800">
                                        {child.level}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Program Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Program</p>
                                            <p className="font-semibold text-gray-900">{child.program}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Coach</p>
                                            <p className="font-semibold text-gray-900">{child.coach}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Classes Attended</p>
                                            <p className="font-semibold text-gray-900">{child.attendedClasses}/{child.totalClasses}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Rating</p>
                                            <p className="font-semibold text-yellow-600">⭐ {child.rating}</p>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Overall Progress</span>
                                            <span className="font-medium">{child.progress}%</span>
                                        </div>
                                        <Progress value={child.progress} className="h-3" />
                                    </div>

                                    {/* Skills Assessment */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-900">Skills Assessment</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(child.skills).map(([skill, score]) => (
                                                <div key={skill} className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="capitalize text-gray-600">{skill}</span>
                                                        <span className={`font-medium ${getSkillColor(score)}`}>{score}%</span>
                                                    </div>
                                                    <Progress value={score} className="h-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Achievements */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-900">Achievements</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {child.achievements.map((achievement, idx) => (
                                                <Badge key={idx} className="bg-yellow-100 text-yellow-800 text-xs">
                                                    <Trophy className="w-3 h-3 mr-1" />
                                                    {achievement}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Next Class */}
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Next Class:</strong> {child.nextClass}
                                        </p>
                                    </div>

                                    {/* Medical Info */}
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <h5 className="font-semibold text-red-800 text-sm mb-2">Medical Information</h5>
                                        <div className="text-xs text-red-700 space-y-1">
                                            <p><strong>Allergies:</strong> {child.medicalInfo.allergies.join(', ')}</p>
                                            <p><strong>Medications:</strong> {child.medicalInfo.medications.join(', ')}</p>
                                            <p><strong>Emergency Contact:</strong> {child.medicalInfo.emergencyContact}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button className="flex-1" variant="outline" size="sm">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                        <Button className="flex-1" variant="outline" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                        <Button className="flex-1" variant="outline" size="sm">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Schedule
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Plus className="w-6 h-6" />
                            <span>Add Child</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <BookOpen className="w-6 h-6" />
                            <span>Book Class</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Star className="w-6 h-6" />
                            <span>Assessment</span>
                        </Button>
                        <Button className="h-20 flex-col gap-2" variant="outline">
                            <Activity className="w-6 h-6" />
                            <span>Progress Report</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ParentChildrenPage
