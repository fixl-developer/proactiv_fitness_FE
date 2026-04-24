'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar, Clock, MapPin, User, Search, Eye, X, RefreshCw, Plus,
    CheckCircle, XCircle, Star, MessageSquare, Dumbbell,
    Sparkles, Brain, Loader2,
    AlertTriangle, Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import UserClassesService from '@/services/modules/user-classes.service'
import aiCoachService from '@/services/aiCoachService'
import { apiClient } from '@/services/api/client'
import { validateSelect, validateTextArea } from '@/utils/validation'
import { toast } from 'sonner'

const DROP_REASONS = [
    'Schedule Conflict',
    'Not Interested Anymore',
    'Too Difficult',
    'Other',
]

export default function MyClassesPage() {
    const [classes, setClasses] = useState<any[]>([])
    const [filteredClasses, setFilteredClasses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'dropped'>('all')
    const [programFilter, setProgramFilter] = useState<string>('all')
    const [feedbackDrawer, setFeedbackDrawer] = useState<{ classId: string; className: string } | null>(null)
    const [feedbackRating, setFeedbackRating] = useState(0)
    const [feedbackComment, setFeedbackComment] = useState('')
    const [submittingFeedback, setSubmittingFeedback] = useState(false)
    const [dropDrawer, setDropDrawer] = useState<{ classId: string; className: string } | null>(null)
    const [dropReason, setDropReason] = useState('')
    const [dropNotes, setDropNotes] = useState('')
    const [dropErrors, setDropErrors] = useState<{ reason?: string; notes?: string }>({})
    const [submittingDrop, setSubmittingDrop] = useState(false)
    const [aiRecommendations, setAiRecommendations] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [selectedClassDetail, setSelectedClassDetail] = useState<any>(null)
    const [skillGaps, setSkillGaps] = useState<any>(null)
    const [learningPath, setLearningPath] = useState<any>(null)
    const [aiInsightsLoading, setAiInsightsLoading] = useState(false)
    const [learningPathLoading, setLearningPathLoading] = useState(false)
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()
    const classesService = useMemo(() => new UserClassesService(), [])

    // Distinct programs derived from fetched classes (replaces hardcoded eventData)
    const programOptions = useMemo(() => {
        const set = new Set<string>()
        classes.forEach(c => {
            const p = c.program || c.programName || c.type
            if (p) set.add(p)
        })
        return Array.from(set)
    }, [classes])

    const loadAiRecommendations = useCallback(async () => {
        try {
            setAiLoading(true)
            const response = await aiCoachService.getRecommendations({ studentId: user?.id || '', skillLevel: 'all' })
            setAiRecommendations(response?.data || response)
        } catch (error) {
            console.error('Error loading AI recommendations:', error)
            setAiRecommendations(null)
        } finally {
            setAiLoading(false)
        }
    }, [user?.id])

    const loadSkillGaps = useCallback(async () => {
        try {
            setAiInsightsLoading(true)
            const userId = user?.id || ''
            const response = await apiClient.get<any>(`/student-digital-twin/skill-gaps/${userId}`)
            setSkillGaps(response?.data || response)
        } catch (error) {
            console.error('Skill gap analysis unavailable:', error)
            setSkillGaps(null)
        } finally {
            setAiInsightsLoading(false)
        }
    }, [user?.id])

    const handleGenerateLearningPath = async () => {
        try {
            setLearningPathLoading(true)
            const userId = user?.id || ''
            const response = await apiClient.post<any>(`/student-digital-twin/learning-path/${userId}`)
            setLearningPath(response?.data || response)
        } catch (error) {
            console.error('Learning path generation unavailable:', error)
            setLearningPath(null)
        } finally {
            setLearningPathLoading(false)
        }
    }

    const loadClasses = useCallback(async () => {
        try {
            setLoadError(null)
            // Uses existing service which calls apiClient.get('/user/classes')
            const data = await classesService.getClasses()
            setClasses(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Error loading classes:', err)
            setClasses([])
            setLoadError('Failed to load classes. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [classesService])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadClasses()
        loadAiRecommendations()
        loadSkillGaps()
    }, [isAuthenticated, router, loadClasses, loadAiRecommendations, loadSkillGaps])

    const filterClasses = useCallback(() => {
        let filtered = classes

        if (activeFilter !== 'all') {
            filtered = filtered.filter(cls => {
                const s = (cls.status || '').toLowerCase()
                if (activeFilter === 'active') return s === 'active' || s === 'upcoming' || s === 'enrolled'
                if (activeFilter === 'dropped') return s === 'dropped' || s === 'cancelled'
                return s === activeFilter
            })
        }

        if (programFilter !== 'all') {
            filtered = filtered.filter(cls => (cls.program || cls.programName || cls.type) === programFilter)
        }

        if (searchQuery) {
            filtered = filtered.filter(cls =>
                cls.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cls.coach?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cls.location?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredClasses(filtered)
    }, [classes, searchQuery, activeFilter, programFilter])

    useEffect(() => {
        filterClasses()
    }, [filterClasses])

    const handleRefresh = async () => {
        setRefreshing(true)
        setLoadError(null)
        await loadClasses()
        loadAiRecommendations()
        setRefreshing(false)
    }

    const openDropDrawer = (cls: any) => {
        setDropDrawer({ classId: cls.id, className: cls.className })
        setDropReason('')
        setDropNotes('')
        setDropErrors({})
    }

    const handleConfirmDrop = async () => {
        if (!dropDrawer) return
        const errs: { reason?: string; notes?: string } = {}
        const reasonErr = validateSelect(dropReason, 'Reason')
        if (reasonErr) errs.reason = reasonErr
        const notesErr = validateTextArea(dropNotes, 'Notes', 0, 500)
        if (notesErr) errs.notes = notesErr
        setDropErrors(errs)
        if (Object.keys(errs).length > 0) return

        try {
            setSubmittingDrop(true)
            // Preserve existing drop endpoint; fall back to service.cancelClass (DELETE /user/classes/:id)
            try {
                await apiClient.post(`/user/my-classes/${dropDrawer.classId}/drop`, {
                    reason: dropReason,
                    notes: dropNotes,
                })
            } catch {
                await classesService.cancelClass(dropDrawer.classId)
            }
            setClasses(prev => prev.map(c =>
                c.id === dropDrawer.classId ? { ...c, status: 'dropped' } : c
            ))
            toast.success('Class dropped successfully.')
            setDropDrawer(null)
        } catch (err) {
            console.error('Error dropping class:', err)
            toast.error('Failed to drop class. Please try again.')
        } finally {
            setSubmittingDrop(false)
        }
    }

    const handleSubmitFeedback = async () => {
        if (!feedbackDrawer || feedbackRating === 0) return
        try {
            setSubmittingFeedback(true)
            await classesService.submitFeedback(feedbackDrawer.classId, {
                rating: feedbackRating,
                comment: feedbackComment,
            })
            setClasses(prev => prev.map(c =>
                c.id === feedbackDrawer.classId
                    ? { ...c, feedback: { rating: feedbackRating, comment: feedbackComment } }
                    : c
            ))
            setFeedbackDrawer(null)
            setFeedbackRating(0)
            setFeedbackComment('')
            toast.success('Feedback submitted.')
        } catch (err) {
            console.error('Error submitting feedback:', err)
            toast.error('Failed to submit feedback. Please try again.')
        } finally {
            setSubmittingFeedback(false)
        }
    }

    const handleViewDetails = (cls: any) => {
        setSelectedClassDetail(selectedClassDetail?.id === cls.id ? null : cls)
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            upcoming: 'bg-blue-100 text-blue-800',
            enrolled: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            dropped: 'bg-red-100 text-red-800',
            active: 'bg-emerald-100 text-emerald-800',
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const isActiveStatus = (s?: string) => {
        const v = (s || '').toLowerCase()
        return v === 'active' || v === 'upcoming' || v === 'enrolled'
    }

    const filters = [
        { key: 'all', label: 'All Classes', count: classes.length },
        { key: 'active', label: 'Active', count: classes.filter(c => isActiveStatus(c.status)).length },
        { key: 'completed', label: 'Completed', count: classes.filter(c => c.status === 'completed').length },
        { key: 'dropped', label: 'Dropped', count: classes.filter(c => c.status === 'dropped' || c.status === 'cancelled').length },
    ]

    const stats = {
        total: classes.length,
        upcoming: classes.filter(c => isActiveStatus(c.status)).length,
        completed: classes.filter(c => c.status === 'completed').length,
        cancelled: classes.filter(c => c.status === 'cancelled' || c.status === 'dropped').length,
    }

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        )
    }

    // Error state with retry
    if (loadError && classes.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
                        <p className="text-gray-600 mt-2">View and manage your class schedule</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="p-12 text-center">
                        <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Classes</h3>
                        <p className="text-gray-500 mb-6">{loadError}</p>
                        <Button onClick={handleRefresh} disabled={refreshing}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Retrying...' : 'Try Again'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const statCards = [
        { title: 'Total Classes', value: stats.total, icon: Calendar, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: 'enrolled' },
        { title: 'Active', value: stats.upcoming, icon: Clock, gradient: 'from-emerald-500 to-teal-600', bgGradient: 'from-emerald-50 to-teal-100', change: 'scheduled' },
        { title: 'Completed', value: stats.completed, icon: CheckCircle, gradient: 'from-green-500 to-green-600', bgGradient: 'from-green-50 to-green-100', change: 'finished' },
        { title: 'Dropped', value: stats.cancelled, icon: XCircle, gradient: 'from-red-500 to-rose-600', bgGradient: 'from-red-50 to-rose-100', change: 'total' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
                    <p className="text-gray-600 mt-2">View and manage your enrolled classes</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button id="btn-refresh-user-my-classes" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button id="user-my-classes-browse-btn" size="sm" onClick={() => router.push('/user/bookings')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Browse & Enroll
                    </Button>
                </div>
            </div>

            {/* AI Class Recommendations - hidden gracefully on failure */}
            {(aiLoading || aiRecommendations) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">AI Class Recommendations</h3>
                        <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">AI Powered</span>
                    </div>
                    {aiLoading ? (
                        <div className="flex items-center justify-center py-6 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">Loading AI suggestions...</p>
                        </div>
                    ) : aiRecommendations ? (
                        <div className="space-y-2">
                            {(
                                (Array.isArray(aiRecommendations?.recommendations) ? aiRecommendations.recommendations : null) ||
                                (Array.isArray(aiRecommendations?.insights) ? aiRecommendations.insights : null) ||
                                (Array.isArray(aiRecommendations?.data) ? aiRecommendations.data : null) ||
                                []
                            ).slice(0, 3).map((item: any, i: number) => (
                                <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">{item.suggestion || item.title || item.description || item}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Colorful Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 bg-white/60 px-2 py-1 rounded-full">
                                        {metric.change}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search classes, coaches, or locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                            />
                            {searchQuery && (
                                <button id="user-my-classes-clear-search-btn"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            {filters.map((filter) => (
                                <button id={`user-my-classes-filter-${filter.key}-btn`}
                                    key={filter.key}
                                    onClick={() => setActiveFilter(filter.key as any)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeFilter === filter.key
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {filter.label}
                                    <Badge className="ml-2" variant="outline">{filter.count}</Badge>
                                </button>
                            ))}
                        </div>
                        <select
                            id="user-my-classes-program-filter"
                            value={programFilter}
                            onChange={(e) => setProgramFilter(e.target.value)}
                            className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                        >
                            <option value="all">All Programs</option>
                            {programOptions.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Classes Grid */}
            <div className="grid gap-4">
                {filteredClasses.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchQuery ? 'No classes found' : activeFilter !== 'all' ? `No ${activeFilter} classes` : 'No classes yet'}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchQuery
                                    ? 'Try adjusting your search or filters'
                                    : activeFilter !== 'all'
                                        ? 'Try switching to a different filter'
                                        : 'Enroll in your first class to get started!'}
                            </p>
                            {!searchQuery && activeFilter === 'all' && (
                                <Button id="user-my-classes-browse-empty-btn" onClick={() => router.push('/user/bookings')}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Browse & Enroll
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredClasses.map((cls, index) => (
                        <motion.div
                            key={cls.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-all group">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                {cls.schedule?.date?.split('-')[2] || '?'}
                                            </div>
                                            <div>
                                                <CardTitle className="group-hover:text-emerald-600 transition-colors">
                                                    {cls.className}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {cls.schedule?.duration || '60'} minutes session
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(cls.status)}>
                                            {cls.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Coach</p>
                                                <p className="text-sm font-medium text-gray-900">{cls.coach || 'TBD'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Day</p>
                                                <p className="text-sm font-medium text-gray-900">{cls.schedule?.day || cls.schedule?.date || 'TBD'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Time</p>
                                                <p className="text-sm font-medium text-gray-900">{cls.schedule?.time || 'TBD'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Location</p>
                                                <p className="text-sm font-medium text-gray-900">{cls.location || 'TBD'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Dumbbell className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Program</p>
                                                <p className="text-sm font-medium text-gray-900">{cls.program || cls.programName || cls.type || 'General'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded detail section */}
                                    <AnimatePresence>
                                        {selectedClassDetail?.id === cls.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                                            >
                                                <h4 className="text-sm font-semibold text-gray-800 mb-2">Class Details</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    {cls.description && (
                                                        <div className="md:col-span-2">
                                                            <span className="text-gray-500">Description:</span>
                                                            <p className="text-gray-700 mt-1">{cls.description}</p>
                                                        </div>
                                                    )}
                                                    {cls.type && (
                                                        <div>
                                                            <span className="text-gray-500">Type:</span>
                                                            <span className="ml-2 text-gray-700">{cls.type}</span>
                                                        </div>
                                                    )}
                                                    {cls.level && (
                                                        <div>
                                                            <span className="text-gray-500">Level:</span>
                                                            <span className="ml-2 text-gray-700">{cls.level}</span>
                                                        </div>
                                                    )}
                                                    {cls.capacity && (
                                                        <div>
                                                            <span className="text-gray-500">Capacity:</span>
                                                            <span className="ml-2 text-gray-700">{cls.capacity} students</span>
                                                        </div>
                                                    )}
                                                    {cls.price && (
                                                        <div>
                                                            <span className="text-gray-500">Price:</span>
                                                            <span className="ml-2 text-gray-700">{cls.price}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <span className="text-gray-500">Status:</span>
                                                        <Badge className={`ml-2 ${getStatusColor(cls.status)}`}>{cls.status}</Badge>
                                                    </div>
                                                    {cls.bookedAt && (
                                                        <div>
                                                            <span className="text-gray-500">Booked:</span>
                                                            <span className="ml-2 text-gray-700">{new Date(cls.bookedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Feedback display if already given */}
                                    {cls.feedback && (
                                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} className={`w-4 h-4 ${s <= cls.feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-600">Your feedback</span>
                                            </div>
                                            {cls.feedback.comment && (
                                                <p className="text-sm text-gray-600 mt-1">{cls.feedback.comment}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button id={`user-my-classes-view-${cls.id}-btn`} size="sm" variant="outline" className="flex-1"
                                            onClick={() => handleViewDetails(cls)}>
                                            <Eye className="w-4 h-4 mr-2" />
                                            {selectedClassDetail?.id === cls.id ? 'Hide Details' : 'View Details'}
                                        </Button>
                                        {isActiveStatus(cls.status) && (
                                            <Button
                                                id={`user-my-classes-drop-${cls.id}-btn`}
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                onClick={() => openDropDrawer(cls)}
                                            >
                                                Drop
                                            </Button>
                                        )}
                                        {cls.status === 'completed' && !cls.feedback && (
                                            <Button id={`user-my-classes-feedback-${cls.id}-btn`} size="sm" variant="outline"
                                                onClick={() => { setFeedbackDrawer({ classId: cls.id, className: cls.className }); setFeedbackRating(0); setFeedbackComment('') }}>
                                                <MessageSquare className="w-4 h-4 mr-1" />
                                                Leave Feedback
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* AI Learning Insights */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-md">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">AI Learning Insights</CardTitle>
                                <p className="text-xs text-gray-500 mt-0.5">Powered by Digital Twin Analysis</p>
                            </div>
                            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full ml-1">AI</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {aiInsightsLoading ? (
                        <div className="flex items-center justify-center py-8 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">Analyzing your skill gaps...</p>
                        </div>
                    ) : skillGaps ? (
                        <div className="space-y-4">
                            {/* Skill Gap Analysis */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    Skill Gap Analysis
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(
                                        (Array.isArray(skillGaps?.skillGaps) ? skillGaps.skillGaps : null) ||
                                        (Array.isArray(skillGaps?.gaps) ? skillGaps.gaps : null) ||
                                        (Array.isArray(skillGaps?.data) ? skillGaps.data : null) ||
                                        (Array.isArray(skillGaps) ? skillGaps : [])
                                    ).map((gap: any, idx: number) => (
                                        <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-900">{gap.skillName || gap.skill || gap.name}</span>
                                                <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                                                    {gap.currentLevel || gap.current || 'N/A'} → {gap.targetLevel || gap.target || 'N/A'}
                                                </Badge>
                                            </div>
                                            {(gap.gapDescription || gap.description || gap.gap) && (
                                                <p className="text-xs text-gray-500">{gap.gapDescription || gap.description || gap.gap}</p>
                                            )}
                                            {(gap.currentLevel || gap.current) && (gap.targetLevel || gap.target) && (
                                                <div className="mt-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div
                                                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all"
                                                            style={{
                                                                width: `${Math.min(100, ((Number(gap.currentLevel || gap.current) || 0) / (Number(gap.targetLevel || gap.target) || 1)) * 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Learning Path Button & Results */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-purple-500" />
                                        Personalized Learning Path
                                    </h4>
                                    <Button
                                        size="sm"
                                        onClick={handleGenerateLearningPath}
                                        disabled={learningPathLoading}
                                        className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                                    >
                                        {learningPathLoading ? (
                                            <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Generating...</>
                                        ) : (
                                            <><Sparkles className="w-4 h-4 mr-1.5" /> Generate Learning Path</>
                                        )}
                                    </Button>
                                </div>

                                {learningPath && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-2"
                                    >
                                        {(
                                            (Array.isArray(learningPath?.phases) ? learningPath.phases : null) ||
                                            (Array.isArray(learningPath?.steps) ? learningPath.steps : null) ||
                                            (Array.isArray(learningPath?.path) ? learningPath.path : null) ||
                                            (Array.isArray(learningPath?.data) ? learningPath.data : null) ||
                                            (Array.isArray(learningPath) ? learningPath : [])
                                        ).map((step: any, idx: number) => (
                                            <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                                                <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{step.title || step.name || step.step || `Step ${idx + 1}`}</p>
                                                    {(step.description || step.details || step.goals?.join(', ')) && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{step.description || step.details || step.goals?.join(', ')}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <Brain className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">AI insights are currently unavailable. Your class data is still accessible above.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Drop Class Drawer */}
            <SlideInDrawer
                isOpen={!!dropDrawer}
                onClose={() => !submittingDrop && setDropDrawer(null)}
                title="Drop Class"
                description={dropDrawer?.className ? `Drop "${dropDrawer.className}"` : undefined}
                size="md"
                footer={
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setDropDrawer(null)} disabled={submittingDrop}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDrop}
                            disabled={submittingDrop}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {submittingDrop ? (
                                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Dropping...</>
                            ) : (
                                'Confirm Drop'
                            )}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={dropReason}
                            onChange={(e) => setDropReason(e.target.value)}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none text-sm ${dropErrors.reason ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'}`}
                        >
                            <option value="">Select a reason</option>
                            {DROP_REASONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        {dropErrors.reason && <p className="text-xs text-red-600 mt-1">{dropErrors.reason}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                        <textarea
                            value={dropNotes}
                            onChange={(e) => setDropNotes(e.target.value)}
                            maxLength={500}
                            rows={4}
                            placeholder="Share any additional context (max 500 chars)"
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none text-sm resize-none ${dropErrors.notes ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'}`}
                        />
                        <div className="flex justify-between mt-1">
                            {dropErrors.notes ? (
                                <p className="text-xs text-red-600">{dropErrors.notes}</p>
                            ) : <span />}
                            <span className="text-xs text-gray-400">{dropNotes.length}/500</span>
                        </div>
                    </div>
                </div>
            </SlideInDrawer>

            {/* Feedback Drawer */}
            <SlideInDrawer
                isOpen={!!feedbackDrawer}
                onClose={() => !submittingFeedback && setFeedbackDrawer(null)}
                title="Leave Feedback"
                description={feedbackDrawer?.className ? `How was your experience in ${feedbackDrawer.className}?` : undefined}
                size="md"
                footer={
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setFeedbackDrawer(null)} disabled={submittingFeedback}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitFeedback}
                            disabled={feedbackRating === 0 || submittingFeedback}
                        >
                            {submittingFeedback ? (
                                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                            ) : (
                                'Submit Feedback'
                            )}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} type="button" onClick={() => setFeedbackRating(star)} className="focus:outline-none">
                                    <Star className={`w-8 h-8 transition-colors ${star <= feedbackRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                        <textarea
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Share your thoughts about the class..."
                            rows={4}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm resize-none"
                        />
                    </div>
                </div>
            </SlideInDrawer>
        </div>
    )
}
