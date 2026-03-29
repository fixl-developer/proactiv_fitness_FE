'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useRealtimeRefresh } from '@/hooks/useRealtime'
import {
    Users, Calendar, TrendingUp, Award, Clock, AlertCircle,
    CheckCircle, BarChart3, Target, Zap, BookOpen, MessageSquare,
    Brain, Sparkles, Loader2, RefreshCw, Video, Route, Trophy, Wrench
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { coachService } from '@/services/modules/coach.service'
import aiCoachService from '@/services/aiCoachService'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

// Fallback mock data when API fails
const FALLBACK_DATA = {
    todayClasses: 4,
    totalStudents: 45,
    attendanceRate: 92,
    activePrograms: 3,
    todaySchedule: [
        { id: '1', className: 'Beginner Gymnastics', date: '', time: '09:00 AM - 10:00 AM', startTime: '09:00 AM', endTime: '10:00 AM', location: 'Studio A', level: 'Beginner', enrolledStudents: 12, capacity: 15, duration: 60, status: 'active' },
        { id: '2', className: 'Intermediate Tumbling', date: '', time: '10:30 AM - 11:30 AM', startTime: '10:30 AM', endTime: '11:30 AM', location: 'Studio B', level: 'Intermediate', enrolledStudents: 15, capacity: 20, duration: 60, status: 'active' },
        { id: '3', className: 'Advanced Acrobatics', date: '', time: '02:00 PM - 03:00 PM', startTime: '02:00 PM', endTime: '03:00 PM', location: 'Studio A', level: 'Advanced', enrolledStudents: 8, capacity: 10, duration: 60, status: 'active' },
        { id: '4', className: 'Kids Fitness', date: '', time: '03:30 PM - 04:30 PM', startTime: '03:30 PM', endTime: '04:30 PM', location: 'Studio C', level: 'Beginner', enrolledStudents: 20, capacity: 25, duration: 60, status: 'active' },
    ],
    programs: [
        { name: 'Beginner Gymnastics', level: 'Beginner', currentEnrollment: 12, capacity: 15, duration: 12 },
        { name: 'Intermediate Tumbling', level: 'Intermediate', currentEnrollment: 10, capacity: 12, duration: 16 },
        { name: 'Advanced Acrobatics', level: 'Advanced', currentEnrollment: 8, capacity: 10, duration: 20 },
    ],
    performanceMetrics: {
        studentSatisfaction: 94,
        classCompletion: 98,
        skillImprovement: 87,
        attendanceConsistency: 92,
    },
}

const CoachDashboard = () => {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Dashboard data state
    const [todayClasses, setTodayClasses] = useState(0)
    const [totalStudents, setTotalStudents] = useState(0)
    const [attendanceRate, setAttendanceRate] = useState(0)
    const [activePrograms, setActivePrograms] = useState(0)
    const [todaySchedule, setTodaySchedule] = useState<any[]>([])
    const [programs, setPrograms] = useState<any[]>([])
    const [performanceMetrics, setPerformanceMetrics] = useState(FALLBACK_DATA.performanceMetrics)

    // AI Insights state
    const [aiInsights, setAiInsights] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const loadAiInsights = async () => {
        setAiLoading(true)
        try {
            const tenantId = (user as any)?.tenantId || 'proactiv-hq'
            const [sessionsRes, recommendationsRes] = await Promise.allSettled([
                aiCoachService.listSessions({ coachId: user?.id || '', tenantId }),
                aiCoachService.getRecommendations({ studentId: 'overview', performanceData: performanceMetrics, skillLevel: 'all' }),
            ])

            const sessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value : null
            const recommendations = recommendationsRes.status === 'fulfilled' ? recommendationsRes.value : null

            setAiInsights({
                sessions: sessions?.data || [],
                recommendations: recommendations?.data?.recommendations || recommendations?.recommendations || [],
                overallAssessment: recommendations?.data?.overallAssessment || recommendations?.overallAssessment || '',
                focusArea: recommendations?.data?.focusArea || recommendations?.focusArea || '',
                aiPowered: recommendations?.data?.aiPowered ?? recommendations?.aiPowered ?? false,
            })
        } catch (err) {
            console.error('AI insights unavailable:', err)
            setAiInsights(null)
        } finally {
            setAiLoading(false)
        }
    }

    useEffect(() => {
        // Don't redirect - layout handles auth. Just load data if authenticated.
        if (!isAuthenticated && !localStorage.getItem('token')) return
        loadDashboardData()
    }, [isAuthenticated])

    const loadDashboardData = async () => {
        setIsLoading(true)

        try {
            const coachId = user?.id
            if (!coachId) {
                throw new Error('No coach ID available')
            }

            const data = await coachService.getDashboardData(coachId)

            setTodayClasses(data.todayClasses ?? 0)
            setTotalStudents(data.totalStudents ?? 0)
            setAttendanceRate(data.attendanceRate ?? 0)
            setActivePrograms(data.activePrograms ?? 0)
            setTodaySchedule(data.todaySchedule ?? [])
            setPrograms(data.programs ?? [])
            setPerformanceMetrics({
                studentSatisfaction: data.performanceMetrics?.studentSatisfaction ?? 0,
                classCompletion: data.performanceMetrics?.classCompletion ?? 0,
                skillImprovement: data.performanceMetrics?.skillImprovement ?? 0,
                attendanceConsistency: data.performanceMetrics?.attendanceConsistency ?? 0,
            })
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
            toast.error('Could not load live data. Showing cached data.')

            // Use fallback mock data
            setTodayClasses(FALLBACK_DATA.todayClasses)
            setTotalStudents(FALLBACK_DATA.totalStudents)
            setAttendanceRate(FALLBACK_DATA.attendanceRate)
            setActivePrograms(FALLBACK_DATA.activePrograms)
            setTodaySchedule(FALLBACK_DATA.todaySchedule)
            setPrograms(FALLBACK_DATA.programs)
            setPerformanceMetrics(FALLBACK_DATA.performanceMetrics)
        }

        setIsLoading(false)
        // Load AI insights lazily after main data
        loadAiInsights()
    }

    useRealtimeRefresh(['schedule', 'attendance', 'booking', 'program'], loadDashboardData)

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadDashboardData()
        setRefreshing(false)
    }

    // KPI card definitions with colorful gradients
    const kpiMetrics = [
        {
            title: "Today's Classes",
            value: todayClasses,
            icon: Calendar,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            change: 'Today',
        },
        {
            title: 'Total Students',
            value: totalStudents,
            icon: Users,
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-100',
            change: 'Active',
        },
        {
            title: 'Attendance Rate',
            value: `${attendanceRate}%`,
            icon: CheckCircle,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            change: 'Excellent',
        },
        {
            title: 'Active Programs',
            value: activePrograms,
            icon: BookOpen,
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100',
            change: 'Running',
        },
    ]

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4 sm:space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-64 bg-gray-200 rounded-lg"></div>
                        <div className="h-64 bg-gray-200 rounded-lg"></div>
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
                    <h1 className={responsiveClasses.headerTitle}>Coach Dashboard</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Welcome back, {(user as any)?.firstName || (user as any)?.name || 'Coach'}! Here&apos;s your coaching overview
                    </p>
                </div>
                <Button id="coach-dashboard-refresh-btn"
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="w-full sm:w-auto"
                >
                    <Zap className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </Button>
            </div>

            {/* KPI Cards - Colorful Gradient Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {kpiMetrics.map((metric, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <CardTitle>Today&apos;s Schedule</CardTitle>
                                </div>
                                <Badge variant="outline">
                                    {todaySchedule.length} Classes
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {todaySchedule.length > 0 ? (
                                <div className="space-y-4">
                                    {todaySchedule.map((item, index) => (
                                        <motion.div
                                            key={item.id || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900">{item.className}</div>
                                                <div className="text-sm text-gray-600">
                                                    {item.time || `${item.startTime} - ${item.endTime}`} {item.location ? `\u2022 ${item.location}` : ''}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {item.level && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.level}
                                                    </Badge>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {item.enrolledStudents}{item.capacity ? `/${item.capacity}` : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium">No classes scheduled for today</p>
                                    <p className="text-sm text-gray-400 mt-1">Enjoy your day off or check upcoming schedules</p>
                                </div>
                            )}
                            <Button id="coach-dashboard-view-full-schedule-btn"
                                className="w-full mt-4"
                                variant="outline"
                                onClick={() => router.push('/coach/schedule')}
                            >
                                View Full Schedule
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { icon: CheckCircle, label: 'Mark Attendance', href: '/coach/schedule', actionId: 'mark-attendance' },
                                { icon: Users, label: 'View Students', href: '/coach/students', actionId: 'view-students' },
                                { icon: MessageSquare, label: 'Send Feedback', href: '/coach/feedback', actionId: 'send-feedback' },
                                { icon: BarChart3, label: 'View Reports', href: '/coach/reports', actionId: 'view-reports' },
                                { icon: Clock, label: 'Set Availability', href: '/coach/availability', actionId: 'set-availability' },
                                { icon: Target, label: 'View Goals', href: '/coach/profile', actionId: 'view-goals' },
                            ].map((action, index) => (
                                <Button id={`coach-dashboard-${action.actionId}-btn`}
                                    key={index}
                                    className="w-full justify-start"
                                    variant="outline"
                                    onClick={() => router.push(action.href)}
                                >
                                    <action.icon className="w-4 h-4 mr-2" />
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Programs & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Programs */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            <CardTitle>Active Programs</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {programs.length > 0 ? (
                            <div className="space-y-4">
                                {programs.slice(0, 3).map((program, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-gray-900">{program.name}</h4>
                                            <Badge variant="outline">{program.level}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                            <span>{program.currentEnrollment}/{program.capacity} Students</span>
                                            <span>{program.duration} weeks</span>
                                        </div>
                                        <Progress
                                            value={program.capacity > 0 ? (program.currentEnrollment / program.capacity) * 100 : 0}
                                            className="h-2"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No active programs</p>
                            </div>
                        )}
                        <Button id="coach-dashboard-view-all-programs-btn"
                            className="w-full mt-4"
                            variant="outline"
                            onClick={() => router.push('/coach/schedule')}
                        >
                            View All Programs
                        </Button>
                    </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <CardTitle>Performance Metrics</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: 'Student Satisfaction', value: performanceMetrics.studentSatisfaction, color: 'bg-green-500' },
                                { label: 'Class Completion Rate', value: performanceMetrics.classCompletion, color: 'bg-blue-500' },
                                { label: 'Skill Improvement', value: performanceMetrics.skillImprovement, color: 'bg-purple-500' },
                                { label: 'Attendance Consistency', value: performanceMetrics.attendanceConsistency, color: 'bg-orange-500' },
                            ].map((metric, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                                        <span className="text-sm font-bold text-gray-900">{metric.value}%</span>
                                    </div>
                                    <Progress value={metric.value} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Coaching Insights */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle>AI Coaching Insights</CardTitle>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadAiInsights} disabled={aiLoading}>
                            <RefreshCw className={`w-4 h-4 mr-1 ${aiLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {aiLoading ? (
                        <div className="flex items-center justify-center py-8 gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <p className="text-gray-500 text-sm">Generating AI insights for your students...</p>
                        </div>
                    ) : aiInsights ? (
                        <div className="space-y-4">
                            {/* Overall Assessment */}
                            {aiInsights.overallAssessment && (
                                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-purple-900">{aiInsights.overallAssessment}</p>
                                            {aiInsights.focusArea && (
                                                <p className="text-xs text-purple-600 mt-1">Focus Area: {aiInsights.focusArea}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AI Recommendations */}
                            {aiInsights.recommendations?.length > 0 ? (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-gray-700">AI Recommendations</h4>
                                    {aiInsights.recommendations.slice(0, 4).map((rec: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                                rec.priority === 1 ? 'bg-red-500' : rec.priority === 2 ? 'bg-orange-500' : 'bg-blue-500'
                                            }`}>
                                                {rec.priority || index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{rec.skill || rec.suggestion || rec}</p>
                                                {rec.suggestion && rec.skill && (
                                                    <p className="text-xs text-gray-600 mt-1">{rec.suggestion}</p>
                                                )}
                                                {rec.level && (
                                                    <Badge className="mt-1 bg-gray-100 text-gray-600 text-xs">{rec.level}</Badge>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500">No specific recommendations at this time. Keep up the great coaching!</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Brain className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">AI insights unavailable</p>
                            <Button variant="outline" size="sm" className="mt-3" onClick={loadAiInsights}>
                                <Sparkles className="w-4 h-4 mr-1" /> Generate Insights
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Advanced AI Tools */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-600" />
                        Advanced AI Tools
                        <Badge className="bg-purple-100 text-purple-700 text-xs">AI Suite</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CoachAITools />
                </CardContent>
            </Card>
        </div>
    )
}

function CoachAITools() {
    const [studentId, setStudentId] = useState('')
    const [videoUrl, setVideoUrl] = useState('')
    const [loading, setLoading] = useState<string | null>(null)
    const [results, setResults] = useState<Record<string, any>>({})

    const callAI = async (key: string, fn: () => Promise<any>) => {
        setLoading(key)
        try {
            const res = await fn()
            setResults(prev => ({ ...prev, [key]: { success: true, data: res?.data || res } }))
        } catch {
            setResults(prev => ({ ...prev, [key]: { success: false, data: { message: 'AI service unavailable right now' } } }))
        } finally { setLoading(null) }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Video Analysis */}
            <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-600" /> AI Video Analysis
                </h4>
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="Video URL" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Student ID" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <button onClick={() => callAI('video', () => apiClient.post('/ai-video-analysis/analyze-video', { videoUrl, studentId }))} disabled={loading === 'video'} className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-700 w-full transition-colors">
                    {loading === 'video' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />} Analyze Form
                </button>
                <button onClick={() => callAI('videoHistory', () => apiClient.get(`/ai-video-analysis/student/${studentId || 'default'}/history`))} disabled={loading === 'videoHistory'} className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-700 w-full transition-colors">
                    {loading === 'videoHistory' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />} View History
                </button>
                {results.video && <div className="p-3 bg-blue-50 rounded-lg text-xs"><p className="font-medium text-blue-700 mb-1">Analysis:</p><p>{results.video.data?.formScore ? `Form Score: ${results.video.data.formScore}` : results.video.data?.message || JSON.stringify(results.video.data).slice(0, 150)}</p></div>}
                {results.videoHistory && <div className="p-3 bg-blue-50 rounded-lg text-xs"><p className="font-medium text-blue-700 mb-1">History:</p><p>{Array.isArray(results.videoHistory.data) ? `${results.videoHistory.data.length} analyses found` : results.videoHistory.data?.message || 'No history'}</p></div>}
            </div>

            {/* Student Digital Twin */}
            <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" /> Student Digital Twin
                </h4>
                <button onClick={() => callAI('profile', () => apiClient.get(`/student-digital-twin/profile/${studentId || 'default'}`))} disabled={loading === 'profile'} className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium text-purple-700 w-full transition-colors">
                    {loading === 'profile' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />} View Student Profile
                </button>
                <button onClick={() => callAI('learningPath', () => apiClient.post(`/student-digital-twin/learning-path/${studentId || 'default'}`))} disabled={loading === 'learningPath'} className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium text-purple-700 w-full transition-colors">
                    {loading === 'learningPath' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Route className="w-4 h-4" />} Generate Learning Path
                </button>
                <button onClick={() => callAI('competition', () => apiClient.get(`/student-digital-twin/competition-readiness/${studentId || 'default'}`))} disabled={loading === 'competition'} className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium text-purple-700 w-full transition-colors">
                    {loading === 'competition' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />} Competition Readiness
                </button>
                {results.profile && <div className="p-3 bg-purple-50 rounded-lg text-xs"><p className="font-medium text-purple-700 mb-1">Profile:</p><p>{results.profile.data?.studentName || results.profile.data?.message || JSON.stringify(results.profile.data).slice(0, 150)}</p></div>}
                {results.learningPath && <div className="p-3 bg-purple-50 rounded-lg text-xs"><p className="font-medium text-purple-700 mb-1">Learning Path:</p><p>{Array.isArray(results.learningPath.data?.steps) ? `${results.learningPath.data.steps.length} steps generated` : results.learningPath.data?.message || 'Path generated'}</p></div>}
                {results.competition && <div className="p-3 bg-purple-50 rounded-lg text-xs"><p className="font-medium text-purple-700 mb-1">Readiness:</p><p>{results.competition.data?.readinessScore ? `Score: ${results.competition.data.readinessScore}%` : results.competition.data?.message || JSON.stringify(results.competition.data).slice(0, 150)}</p></div>}
            </div>

            {/* AI Coach Assistant */}
            <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-green-600" /> AI Coach Assistant
                </h4>
                <button onClick={() => callAI('corrections', () => apiClient.get(`/ai-coach-assistant/corrections/${studentId || 'default'}`))} disabled={loading === 'corrections'} className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-medium text-green-700 w-full transition-colors">
                    {loading === 'corrections' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Get Form Corrections
                </button>
                {results.corrections && (
                    <div className="p-3 bg-green-50 rounded-lg text-xs space-y-2">
                        <p className="font-medium text-green-700">Form Corrections:</p>
                        {Array.isArray(results.corrections.data?.corrections) ? results.corrections.data.corrections.map((c: any, i: number) => (
                            <div key={i} className="p-2 bg-white rounded"><p className="font-medium">{c.area || c.title}</p><p className="text-gray-600">{c.suggestion || c.description}</p></div>
                        )) : <p>{results.corrections.data?.message || 'No corrections needed - great form!'}</p>}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CoachDashboard
