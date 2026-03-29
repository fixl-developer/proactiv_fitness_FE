'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Plus, RefreshCw, Eye, Edit, Calendar, Star, TrendingUp,
    BookOpen, Award, Activity, Loader, AlertCircle, Trophy, X,
    Brain, Sparkles, Zap, ChevronDown, ChevronUp
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
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingChild, setEditingChild] = useState<any>(null)
    const [formSubmitting, setFormSubmitting] = useState(false)
    // AI Insights state per child
    const [aiInsightsOpen, setAiInsightsOpen] = useState<Record<string, boolean>>({})
    const [aiReportLoading, setAiReportLoading] = useState<Record<string, boolean>>({})
    const [aiReportResult, setAiReportResult] = useState<Record<string, any>>({})
    const [aiReportError, setAiReportError] = useState<Record<string, string | null>>({})
    const [aiReadinessLoading, setAiReadinessLoading] = useState<Record<string, boolean>>({})
    const [aiReadinessResult, setAiReadinessResult] = useState<Record<string, any>>({})
    const [aiReadinessError, setAiReadinessError] = useState<Record<string, string | null>>({})
    const [aiChallengesLoading, setAiChallengesLoading] = useState<Record<string, boolean>>({})
    const [aiChallengesResult, setAiChallengesResult] = useState<Record<string, any>>({})
    const [aiChallengesError, setAiChallengesError] = useState<Record<string, string | null>>({})

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

    const handleAddChild = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormSubmitting(true)
        const formData = new FormData(e.currentTarget)
        const data = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            dateOfBirth: formData.get('dateOfBirth') as string,
            gender: formData.get('gender') as string,
            medicalInfo: {
                allergies: (formData.get('allergies') as string)
                    .split(',')
                    .map((a) => a.trim())
                    .filter(Boolean),
            },
        }
        try {
            await apiClient.post('/parent/children', data)
            setShowAddModal(false)
            await loadChildren()
        } catch (err) {
            console.error('Error adding child:', err)
            alert('Failed to add child. Please try again.')
        } finally {
            setFormSubmitting(false)
        }
    }

    const handleEditChild = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingChild) return
        setFormSubmitting(true)
        const formData = new FormData(e.currentTarget)
        const data = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            dateOfBirth: formData.get('dateOfBirth') as string,
            gender: formData.get('gender') as string,
            medicalInfo: {
                allergies: (formData.get('allergies') as string)
                    .split(',')
                    .map((a) => a.trim())
                    .filter(Boolean),
            },
        }
        try {
            await apiClient.put(`/parent/children/${editingChild.id}`, data)
            setShowEditModal(false)
            setEditingChild(null)
            await loadChildren()
        } catch (err) {
            console.error('Error updating child:', err)
            alert('Failed to update child. Please try again.')
        } finally {
            setFormSubmitting(false)
        }
    }

    const openEditModal = (child: any) => {
        setEditingChild(child)
        setShowEditModal(true)
    }

    // AI Insights handlers
    const toggleAiInsights = (childId: string) => {
        setAiInsightsOpen(prev => ({ ...prev, [childId]: !prev[childId] }))
    }

    const handleAiReport = async (childId: string) => {
        setAiReportLoading(prev => ({ ...prev, [childId]: true }))
        setAiReportError(prev => ({ ...prev, [childId]: null }))
        setAiReportResult(prev => ({ ...prev, [childId]: null }))
        try {
            const response = await apiClient.post(`/parent-ai-assistant/report-card/${childId}`)
            setAiReportResult(prev => ({ ...prev, [childId]: response?.data || response }))
        } catch (err: any) {
            console.error('AI Report error:', err)
            setAiReportError(prev => ({ ...prev, [childId]: err?.message || 'Failed to generate AI report. The service may be temporarily unavailable.' }))
        } finally {
            setAiReportLoading(prev => ({ ...prev, [childId]: false }))
        }
    }

    const handleCompetitionReadiness = async (childId: string) => {
        setAiReadinessLoading(prev => ({ ...prev, [childId]: true }))
        setAiReadinessError(prev => ({ ...prev, [childId]: null }))
        setAiReadinessResult(prev => ({ ...prev, [childId]: null }))
        try {
            const response = await apiClient.get(`/student-digital-twin/competition-readiness/${childId}`)
            setAiReadinessResult(prev => ({ ...prev, [childId]: response?.data || response }))
        } catch (err: any) {
            console.error('Competition Readiness error:', err)
            setAiReadinessError(prev => ({ ...prev, [childId]: err?.message || 'Failed to check competition readiness. The service may be temporarily unavailable.' }))
        } finally {
            setAiReadinessLoading(prev => ({ ...prev, [childId]: false }))
        }
    }

    const handleAiChallenges = async (childId: string) => {
        setAiChallengesLoading(prev => ({ ...prev, [childId]: true }))
        setAiChallengesError(prev => ({ ...prev, [childId]: null }))
        setAiChallengesResult(prev => ({ ...prev, [childId]: null }))
        try {
            const response = await apiClient.post(`/ai-gamification-engine/generate-challenges/${childId}`)
            setAiChallengesResult(prev => ({ ...prev, [childId]: response?.data || response }))
        } catch (err: any) {
            console.error('AI Challenges error:', err)
            setAiChallengesError(prev => ({ ...prev, [childId]: err?.message || 'Failed to generate AI challenges. The service may be temporarily unavailable.' }))
        } finally {
            setAiChallengesLoading(prev => ({ ...prev, [childId]: false }))
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

    // Derive first/last name and allergies string from a child object for prefilling
    const getChildFirstName = (child: any) => {
        if (child.firstName) return child.firstName
        const parts = (child.name || '').split(' ')
        return parts[0] || ''
    }
    const getChildLastName = (child: any) => {
        if (child.lastName) return child.lastName
        const parts = (child.name || '').split(' ')
        return parts.slice(1).join(' ') || ''
    }
    const getChildAllergies = (child: any) => {
        if (child.medicalInfo?.allergies && Array.isArray(child.medicalInfo.allergies)) {
            return child.medicalInfo.allergies.join(', ')
        }
        return ''
    }

    // Reusable modal form content
    const renderChildForm = (
        onSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
        defaults?: any,
    ) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        required
                        defaultValue={defaults?.firstName || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="First name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        required
                        defaultValue={defaults?.lastName || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Last name"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                    type="date"
                    name="dateOfBirth"
                    required
                    defaultValue={defaults?.dateOfBirth || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                    name="gender"
                    required
                    defaultValue={defaults?.gender || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Info - Allergies</label>
                <textarea
                    name="allergies"
                    rows={3}
                    defaultValue={defaults?.allergies || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Comma-separated allergies (e.g. peanuts, dust, pollen)"
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setShowAddModal(false)
                        setShowEditModal(false)
                        setEditingChild(null)
                    }}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={formSubmitting}>
                    {formSubmitting ? (
                        <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : defaults ? 'Update Child' : 'Add Child'}
                </Button>
            </div>
        </form>
    )

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
            {/* Add Child Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Child</h2>
                        {renderChildForm(handleAddChild)}
                    </div>
                </div>
            )}

            {/* Edit Child Modal */}
            {showEditModal && editingChild && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 relative">
                        <button
                            onClick={() => { setShowEditModal(false); setEditingChild(null) }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Child</h2>
                        {renderChildForm(handleEditChild, {
                            firstName: getChildFirstName(editingChild),
                            lastName: getChildLastName(editingChild),
                            dateOfBirth: editingChild.dateOfBirth || '',
                            gender: editingChild.gender || '',
                            allergies: getChildAllergies(editingChild),
                        })}
                    </div>
                </div>
            )}

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
                        onClick={() => setShowAddModal(true)}
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
                {children.map((child: any, index: number) => {
                    const childId = child.id || child._id || `child-${index}`
                    return (
                        <motion.div
                            key={childId}
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
                                                onClick={() => openEditModal(child)}
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

                                        {/* AI Insights Expandable Section */}
                                        <div className="border border-indigo-100 rounded-lg overflow-hidden">
                                            <button
                                                id={`parent-children-ai-toggle-${childId}-btn`}
                                                onClick={() => toggleAiInsights(childId)}
                                                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Brain className="w-4 h-4 text-indigo-600" />
                                                    <span className="font-semibold text-sm text-indigo-900">AI Insights</span>
                                                </div>
                                                {aiInsightsOpen[childId] ? (
                                                    <ChevronUp className="w-4 h-4 text-indigo-600" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-indigo-600" />
                                                )}
                                            </button>

                                            {aiInsightsOpen[childId] && (
                                                <div className="p-4 bg-white space-y-3">
                                                    {/* AI Progress Report */}
                                                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Sparkles className="w-4 h-4 text-indigo-600" />
                                                            <h5 className="font-semibold text-sm text-indigo-900">AI Progress Report</h5>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-2">Generate an AI-powered progress analysis for {child.name}.</p>
                                                        <Button
                                                            id={`parent-children-ai-report-${childId}-btn`}
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                                                            onClick={() => handleAiReport(childId)}
                                                            disabled={aiReportLoading[childId]}
                                                        >
                                                            {aiReportLoading[childId] ? (
                                                                <>
                                                                    <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                                                    Generating Report...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Sparkles className="w-3 h-3 mr-2" />
                                                                    AI Progress Report
                                                                </>
                                                            )}
                                                        </Button>
                                                        {aiReportResult[childId] && (
                                                            <div className="mt-2 p-2 bg-white rounded border border-indigo-100">
                                                                <p className="text-xs text-indigo-800">
                                                                    {aiReportResult[childId].summary || aiReportResult[childId].report || aiReportResult[childId].message || JSON.stringify(aiReportResult[childId])}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {aiReportError[childId] && (
                                                            <div className="mt-2 p-2 bg-red-50 rounded border border-red-100">
                                                                <p className="text-xs text-red-600">{aiReportError[childId]}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Competition Readiness */}
                                                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Zap className="w-4 h-4 text-purple-600" />
                                                            <h5 className="font-semibold text-sm text-purple-900">Competition Readiness</h5>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-2">Check if {child.name} is ready for upcoming competitions.</p>
                                                        <Button
                                                            id={`parent-children-ai-readiness-${childId}-btn`}
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full border-purple-200 text-purple-700 hover:bg-purple-100"
                                                            onClick={() => handleCompetitionReadiness(childId)}
                                                            disabled={aiReadinessLoading[childId]}
                                                        >
                                                            {aiReadinessLoading[childId] ? (
                                                                <>
                                                                    <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                                                    Checking...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Zap className="w-3 h-3 mr-2" />
                                                                    Competition Readiness
                                                                </>
                                                            )}
                                                        </Button>
                                                        {aiReadinessResult[childId] && (
                                                            <div className="mt-2 p-2 bg-white rounded border border-purple-100">
                                                                <p className="text-xs text-purple-800">
                                                                    {aiReadinessResult[childId].readiness !== undefined && (
                                                                        <span className="font-semibold">Readiness: {aiReadinessResult[childId].readiness}% - </span>
                                                                    )}
                                                                    {aiReadinessResult[childId].summary || aiReadinessResult[childId].assessment || aiReadinessResult[childId].message || JSON.stringify(aiReadinessResult[childId])}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {aiReadinessError[childId] && (
                                                            <div className="mt-2 p-2 bg-red-50 rounded border border-red-100">
                                                                <p className="text-xs text-red-600">{aiReadinessError[childId]}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* AI Challenges */}
                                                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Brain className="w-4 h-4 text-amber-600" />
                                                            <h5 className="font-semibold text-sm text-amber-900">AI Challenges</h5>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-2">Generate personalized challenges to motivate {child.name}.</p>
                                                        <Button
                                                            id={`parent-children-ai-challenges-${childId}-btn`}
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full border-amber-200 text-amber-700 hover:bg-amber-100"
                                                            onClick={() => handleAiChallenges(childId)}
                                                            disabled={aiChallengesLoading[childId]}
                                                        >
                                                            {aiChallengesLoading[childId] ? (
                                                                <>
                                                                    <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                                                    Generating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Brain className="w-3 h-3 mr-2" />
                                                                    AI Challenges
                                                                </>
                                                            )}
                                                        </Button>
                                                        {aiChallengesResult[childId] && (
                                                            <div className="mt-2 p-2 bg-white rounded border border-amber-100">
                                                                {aiChallengesResult[childId].challenges ? (
                                                                    <ul className="text-xs text-amber-800 space-y-1">
                                                                        {(Array.isArray(aiChallengesResult[childId].challenges) ? aiChallengesResult[childId].challenges : [aiChallengesResult[childId].challenges]).map((challenge: any, i: number) => (
                                                                            <li key={i} className="flex items-start gap-1">
                                                                                <Trophy className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                                                                <span>{typeof challenge === 'string' ? challenge : challenge.title || challenge.name || JSON.stringify(challenge)}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <p className="text-xs text-amber-800">
                                                                        {aiChallengesResult[childId].message || JSON.stringify(aiChallengesResult[childId])}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                        {aiChallengesError[childId] && (
                                                            <div className="mt-2 p-2 bg-red-50 rounded border border-red-100">
                                                                <p className="text-xs text-red-600">{aiChallengesError[childId]}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* Empty State */}
            {children.length === 0 && !error && (
                <Card className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Children Found</h3>
                    <p className="text-gray-600 mb-4">Add your children to start tracking their progress.</p>
                    <Button onClick={() => setShowAddModal(true)}>
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
                            onClick={() => setShowAddModal(true)}
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
