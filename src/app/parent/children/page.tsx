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
import { apiClient } from '@/services/api/client'

const ParentChildrenPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [children, setChildren] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadChildren()
    }, [isAuthenticated, router])

    const loadChildren = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await apiClient.get('/parent/children')
            const fetchedChildren = response?.data || []
            setChildren(fetchedChildren)
        } catch (err) {
            console.error('Error loading children:', err)
            setError('Failed to load children data')
        } finally {
            setIsLoading(false)
        }
    }

    const totalChildren = children.length
    const activePrograms = new Set(children.map((c: any) => c.program).filter(Boolean)).size
    const totalClasses = children.reduce((sum: number, c: any) => sum + (c.totalClasses || 0), 0)
    const avgAttendance = children.length > 0
        ? Math.round(children.reduce((sum: number, c: any) => {
            const attended = c.attendedClasses || 0
            const total = c.totalClasses || 1
            return sum + (attended / total) * 100
        }, 0) / children.length)
        : 0

    const metricCards = [
        {
            title: 'Total Children',
            value: totalChildren,
            icon: Users,
            bgGradient: 'from-blue-50 to-blue-100',
            gradient: 'from-blue-500 to-blue-600',
            badge: `${totalChildren} enrolled`,
        },
        {
            title: 'Active Programs',
            value: activePrograms,
            icon: BookOpen,
            bgGradient: 'from-green-50 to-emerald-100',
            gradient: 'from-green-500 to-emerald-600',
            badge: `${activePrograms} active`,
        },
        {
            title: 'Total Classes',
            value: totalClasses,
            icon: Calendar,
            bgGradient: 'from-purple-50 to-purple-100',
            gradient: 'from-purple-500 to-purple-600',
            badge: `${totalClasses} sessions`,
        },
        {
            title: 'Avg Attendance',
            value: `${avgAttendance}%`,
            icon: TrendingUp,
            bgGradient: 'from-orange-50 to-orange-100',
            gradient: 'from-orange-500 to-orange-600',
            badge: `${avgAttendance}% rate`,
        },
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
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
                    <p className="text-gray-600 mt-2">Track your children&apos;s progress and development</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        id="parent-children-refresh-btn"
                        variant="outline"
                        size="sm"
                        onClick={() => loadChildren()}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        id="parent-children-add-btn"
                        size="sm"
                        onClick={() => alert('Feature coming soon')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Child
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700">{error}</p>
                    <Button variant="outline" size="sm" onClick={() => loadChildren()} className="ml-auto">
                        Retry
                    </Button>
                </div>
            )}

            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metricCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${card.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${card.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <card.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                        {card.badge}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Children Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {children.map((child: any, index: number) => (
                    <motion.div
                        key={child.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                            {(child.name || '??').split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{child.name}</CardTitle>
                                            <p className="text-sm text-gray-500">{child.age} years old{child.dateOfBirth ? ` \u2022 Born: ${child.dateOfBirth}` : ''}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-800">
                                        {child.level || 'N/A'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Program Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Program</p>
                                            <p className="font-semibold text-gray-900">{child.program || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Coach</p>
                                            <p className="font-semibold text-gray-900">{child.coach || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Classes Attended</p>
                                            <p className="font-semibold text-gray-900">{child.attendedClasses || 0}/{child.totalClasses || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Rating</p>
                                            <p className="font-semibold text-yellow-600">{child.rating ? `\u2B50 ${child.rating}` : 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Overall Progress</span>
                                            <span className="font-medium">{child.progress || 0}%</span>
                                        </div>
                                        <Progress value={child.progress || 0} className="h-3" />
                                    </div>

                                    {/* Skills Assessment */}
                                    {child.skills && Object.keys(child.skills).length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-gray-900">Skills Assessment</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(child.skills).map(([skill, score]) => (
                                                    <div key={skill} className="space-y-1">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="capitalize text-gray-600">{skill}</span>
                                                            <span className={`font-medium ${getSkillColor(score as number)}`}>{score as number}%</span>
                                                        </div>
                                                        <Progress value={score as number} className="h-2" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Achievements */}
                                    {child.achievements && child.achievements.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-gray-900">Achievements</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {child.achievements.map((achievement: string, idx: number) => (
                                                    <Badge key={idx} className="bg-yellow-100 text-yellow-800 text-xs">
                                                        <Trophy className="w-3 h-3 mr-1" />
                                                        {achievement}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Medical Info */}
                                    {child.medicalInfo && (
                                        <div className="p-3 bg-red-50 rounded-lg">
                                            <h5 className="font-semibold text-red-800 text-sm mb-2">Medical Information</h5>
                                            <div className="text-xs text-red-700 space-y-1">
                                                {child.medicalInfo.allergies && (
                                                    <p><strong>Allergies:</strong> {child.medicalInfo.allergies.join(', ')}</p>
                                                )}
                                                {child.medicalInfo.medications && (
                                                    <p><strong>Medications:</strong> {child.medicalInfo.medications.join(', ')}</p>
                                                )}
                                                {child.medicalInfo.emergencyContact && (
                                                    <p><strong>Emergency Contact:</strong> {child.medicalInfo.emergencyContact}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            id={`parent-children-view-${child.id}-btn`}
                                            className="flex-1"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push('/parent/children')}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                        <Button
                                            id={`parent-children-edit-${child.id}-btn`}
                                            className="flex-1"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => alert('Feature coming soon')}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                        <Button
                                            id={`parent-children-schedule-${child.id}-btn`}
                                            className="flex-1"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push('/parent/browse-classes')}
                                        >
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

            {/* Empty State */}
            {children.length === 0 && !error && (
                <Card className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Children Found</h3>
                    <p className="text-gray-600 mb-4">Add your children to start tracking their progress.</p>
                    <Button onClick={() => alert('Feature coming soon')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Child
                    </Button>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                            id="parent-children-quick-add-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => alert('Feature coming soon')}
                        >
                            <Plus className="w-6 h-6" />
                            <span>Add Child</span>
                        </Button>
                        <Button
                            id="parent-children-quick-book-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => router.push('/parent/browse-classes')}
                        >
                            <BookOpen className="w-6 h-6" />
                            <span>Book Class</span>
                        </Button>
                        <Button
                            id="parent-children-quick-assessment-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => alert('Feature coming soon')}
                        >
                            <Star className="w-6 h-6" />
                            <span>Assessment</span>
                        </Button>
                        <Button
                            id="parent-children-quick-progress-btn"
                            className="h-20 flex-col gap-2"
                            variant="outline"
                            onClick={() => alert('Feature coming soon')}
                        >
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
