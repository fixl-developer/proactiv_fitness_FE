'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, Target, Award, Calendar, RefreshCw, ArrowUp,
    CheckCircle, Clock, Flame, BarChart3, Brain, Sparkles,
    Loader2, AlertCircle, Star, Zap, Trophy, Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api/client'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { validateRequired, validateSelect, validateTextArea, validateNumber } from '@/utils/validation'
import aiCoachService from '@/services/aiCoachService'

const FALLBACK_AI_TIPS = [
    {
        title: 'Stay Consistent',
        description: 'Attending classes regularly is the fastest way to improve. Try to maintain your weekly schedule.',
    },
    {
        title: 'Set Small Goals',
        description: 'Break big skills into smaller milestones. Celebrate each one to stay motivated on your journey.',
    },
    {
        title: 'Rest & Recover',
        description: 'Recovery is just as important as training. Make sure you get enough sleep and stretch after sessions.',
    },
]

type RangePreset = 'today' | 'week' | 'month' | 'last30' | 'last90' | 'custom'

function formatDate(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function getPresetRange(preset: RangePreset): { from: string; to: string } {
    const today = new Date()
    const to = formatDate(today)
    const from = new Date(today)

    switch (preset) {
        case 'today':
            return { from: to, to }
        case 'week': {
            const day = today.getDay() // 0 Sun
            const diff = day === 0 ? 6 : day - 1
            from.setDate(today.getDate() - diff)
            return { from: formatDate(from), to }
        }
        case 'month':
            from.setDate(1)
            return { from: formatDate(from), to }
        case 'last30':
            from.setDate(today.getDate() - 29)
            return { from: formatDate(from), to }
        case 'last90':
            from.setDate(today.getDate() - 89)
            return { from: formatDate(from), to }
        default:
            from.setDate(1)
            return { from: formatDate(from), to }
    }
}

interface GoalForm {
    goalType: string
    target: string
    deadline: string
    notes: string
}

export default function ProgressPage() {
    const [progress, setProgress] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)
    const [aiData, setAiData] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState(false)
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    // Date range filter state
    const [preset, setPreset] = useState<RangePreset>('month')
    const initialRange = useMemo(() => getPresetRange('month'), [])
    const [fromDate, setFromDate] = useState<string>(initialRange.from)
    const [toDate, setToDate] = useState<string>(initialRange.to)

    // Goal drawer
    const [showGoalDrawer, setShowGoalDrawer] = useState(false)
    const [goalForm, setGoalForm] = useState<GoalForm>({
        goalType: '',
        target: '',
        deadline: '',
        notes: '',
    })
    const [goalErrors, setGoalErrors] = useState<Record<string, string>>({})
    const [savingGoal, setSavingGoal] = useState(false)

    const loadProgress = useCallback(async (from: string, to: string) => {
        setError(null)
        try {
            const res: any = await apiClient.get('/user/progress', { params: { from, to } })
            const data = res?.data || res || null
            setProgress(data)
        } catch (err) {
            console.error('Error loading progress:', err)
            setError('Unable to load progress data. Please try again.')
            setProgress(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const loadAiInsights = useCallback(async () => {
        setAiError(false)
        try {
            setAiLoading(true)
            const userId = user?.id || ''
            const tenantId = (user as any)?.tenantId || (user as any)?.tenant_id || 'default'
            if (userId) {
                const result = await aiCoachService.predictProgress(userId, tenantId)
                setAiData(result)
            } else {
                setAiData(null)
            }
        } catch (err) {
            console.error('Failed to load AI progress insights:', err)
            setAiError(true)
            setAiData(null)
        } finally {
            setAiLoading(false)
        }
    }, [user?.id, (user as any)?.tenantId, (user as any)?.tenant_id])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadAiInsights()
    }, [isAuthenticated, router, loadAiInsights])

    // Refetch whenever the date range changes
    useEffect(() => {
        if (!isAuthenticated) return
        if (!fromDate || !toDate) return
        setIsLoading(true)
        loadProgress(fromDate, toDate)
    }, [isAuthenticated, fromDate, toDate, loadProgress])

    const handlePresetChange = (newPreset: RangePreset) => {
        setPreset(newPreset)
        if (newPreset !== 'custom') {
            const range = getPresetRange(newPreset)
            setFromDate(range.from)
            setToDate(range.to)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await Promise.all([loadProgress(fromDate, toDate), loadAiInsights()])
        setRefreshing(false)
    }

    const getSkillColor = (p: number) => {
        if (p >= 80) return 'text-green-600'
        if (p >= 60) return 'text-blue-600'
        if (p >= 40) return 'text-yellow-600'
        return 'text-gray-600'
    }

    const getSkillBgColor = (p: number) => {
        if (p >= 80) return 'bg-green-100'
        if (p >= 60) return 'bg-blue-100'
        if (p >= 40) return 'bg-yellow-100'
        return 'bg-gray-100'
    }

    const validateGoal = (): boolean => {
        const errs: Record<string, string> = {}
        const typeErr = validateSelect(goalForm.goalType, 'Goal Type')
        if (typeErr) errs.goalType = typeErr

        const targetErr = goalForm.goalType === 'weight' || goalForm.goalType === 'attendance' || goalForm.goalType === 'performance'
            ? validateNumber(goalForm.target, 'Target', 0)
            : validateRequired(goalForm.target, 'Target')
        if (targetErr) errs.target = targetErr

        if (!goalForm.deadline) {
            errs.deadline = 'Deadline is required'
        } else {
            const d = new Date(goalForm.deadline)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (isNaN(d.getTime())) {
                errs.deadline = 'Please enter a valid date'
            } else if (d <= today) {
                errs.deadline = 'Deadline must be in the future'
            }
        }

        const notesErr = validateTextArea(goalForm.notes, 'Notes', 0, 1000)
        if (notesErr) errs.notes = notesErr

        setGoalErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSaveGoal = async () => {
        if (!validateGoal()) return
        try {
            setSavingGoal(true)
            const payload: any = {
                goalType: goalForm.goalType,
                target: goalForm.target,
                deadline: goalForm.deadline,
                notes: goalForm.notes || undefined,
            }
            await apiClient.post('/user/progress/goals', payload)
            setShowGoalDrawer(false)
            setGoalForm({ goalType: '', target: '', deadline: '', notes: '' })
            setGoalErrors({})
            // Refresh progress so new goal reflects
            loadProgress(fromDate, toDate)
        } catch (err: any) {
            setGoalErrors({
                _form: err?.response?.data?.message || err?.message || 'Failed to save goal',
            })
        } finally {
            setSavingGoal(false)
        }
    }

    // ---------- Date Range Filter UI ----------
    const DateRangeFilter = (
        <Card className="p-4">
            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
                    <select
                        value={preset}
                        onChange={(e) => handlePresetChange(e.target.value as RangePreset)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="last30">Last 30 Days</option>
                        <option value="last90">Last 90 Days</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                {preset === 'custom' && (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                            <input
                                type="date"
                                value={fromDate}
                                max={toDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                            <input
                                type="date"
                                value={toDate}
                                min={fromDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </>
                )}
                <div className="ml-auto flex gap-2">
                    <Button onClick={() => setShowGoalDrawer(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Set Goal
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing || isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing || isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>
            {isLoading && (
                <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Updating data for selected range...</span>
                </div>
            )}
        </Card>
    )

    // ---------- Loading Skeleton ----------
    if (isLoading && !progress) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse" />
                    </div>
                    <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                {DateRangeFilter}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl overflow-hidden">
                            <div className="p-4 space-y-3 animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 bg-gray-200 rounded-lg" />
                                    <div className="h-5 w-14 bg-gray-200 rounded-full" />
                                </div>
                                <div className="h-3 w-24 bg-gray-200 rounded" />
                                <div className="h-7 w-16 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    // ---------- Error State ----------
    if (error && !progress) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
                    <p className="text-gray-600 mt-2">Track your gymnastics journey</p>
                </div>
                {DateRangeFilter}
                <Card className="border-red-200">
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <Button onClick={handleRefresh} disabled={refreshing}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // ---------- Computed stats (all from API) ----------
    const skillsProgress = progress?.skillsProgress || []
    const milestones = progress?.milestones || []
    const timeline = progress?.timeline || []
    const skillsMastered = skillsProgress.filter((s: any) => (s.progress || 0) >= 80).length
    const milestonesReached = milestones.filter((m: any) => m.achieved).length
    const totalSkills = skillsProgress.length
    const overallPercent = progress?.overallProgress || 0
    const currentStreak = progress?.currentStreak || 0
    const longestStreak = progress?.longestStreak || 0
    const classesAttended = progress?.classesAttended || 0

    const hasAnyData =
        overallPercent > 0 ||
        skillsProgress.length > 0 ||
        milestones.length > 0 ||
        timeline.length > 0 ||
        classesAttended > 0 ||
        currentStreak > 0

    const statCards = [
        {
            title: 'Overall Progress',
            value: `${overallPercent}%`,
            icon: TrendingUp,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            badge: overallPercent >= 50 ? 'On Track' : 'Getting Started',
            badgeColor: overallPercent >= 50 ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100',
        },
        {
            title: 'Classes Attended',
            value: classesAttended,
            icon: Calendar,
            gradient: 'from-green-500 to-green-600',
            bgGradient: 'from-green-50 to-green-100',
            badge: 'this range',
            badgeColor: 'text-green-600 bg-green-100',
        },
        {
            title: 'Current Streak',
            value: currentStreak,
            icon: Flame,
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100',
            badge: currentStreak === 1 ? 'day' : 'days',
            badgeColor: currentStreak >= 7 ? 'text-orange-600 bg-orange-100' : 'text-gray-600 bg-gray-100',
        },
        {
            title: 'Longest Streak',
            value: longestStreak,
            icon: Trophy,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            badge: longestStreak === 1 ? 'day' : 'days',
            badgeColor: 'text-purple-600 bg-purple-100',
        },
    ]

    const aiTips = aiData?.recommendations || aiData?.insights || (aiError ? FALLBACK_AI_TIPS : [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
                    <p className="text-gray-600 mt-2">Track your gymnastics journey</p>
                </div>
            </div>

            {/* Date Range Filter */}
            {DateRangeFilter}

            {/* Error Alert (non-blocking) */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${metric.badgeColor}`}>
                                        {metric.badge}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* AI Progress Insights */}
            <Card className="relative overflow-hidden border-purple-200">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full -mr-24 -mt-24" />
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle>AI Progress Insights</CardTitle>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {aiError ? 'Tips' : 'AI Powered'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {aiLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
                            <span className="text-gray-600">Analyzing your progress trajectory...</span>
                        </div>
                    ) : aiData ? (
                        <div className="space-y-4">
                            {aiData.predictedTrajectory && (
                                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
                                    <p className="text-sm font-semibold text-purple-900 mb-1">Predicted Trajectory</p>
                                    <p className="text-xs text-purple-700">
                                        {aiData.predictedTrajectory.description ||
                                            aiData.predictedTrajectory.summary ||
                                            'Based on your current pace, you are on track.'}
                                    </p>
                                    {aiData.predictedTrajectory.projectedProgress != null && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs text-purple-600 mb-1">
                                                <span>Projected progress</span>
                                                <span className="font-bold">{aiData.predictedTrajectory.projectedProgress}%</span>
                                            </div>
                                            <Progress value={aiData.predictedTrajectory.projectedProgress} className="h-2" />
                                        </div>
                                    )}
                                </div>
                            )}
                            {aiTips.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {aiTips.slice(0, 3).map((item: any, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <div className="p-3 rounded-lg bg-white border border-purple-100 hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Target className="w-3.5 h-3.5 text-purple-500" />
                                                    <span className="text-xs font-semibold text-purple-800">
                                                        {item.title || item.category || 'Insight'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600">
                                                    {typeof item === 'string'
                                                        ? item
                                                        : item.description || item.message || item.text || ''}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                            {aiData.confidence != null && (
                                <p className="text-[10px] text-purple-400 text-right">
                                    AI confidence: {Math.round(aiData.confidence * 100)}%
                                </p>
                            )}
                        </div>
                    ) : aiError ? (
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
                                <p className="text-xs text-purple-700">
                                    AI insights are temporarily unavailable. Here are some general tips to keep you going.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {FALLBACK_AI_TIPS.map((tip, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-lg bg-white border border-purple-100 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Zap className="w-3.5 h-3.5 text-purple-500" />
                                            <span className="text-xs font-semibold text-purple-800">{tip.title}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">{tip.description}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="text-right">
                                <Button variant="ghost" size="sm" onClick={loadAiInsights} className="text-purple-600">
                                    <RefreshCw className="w-3 h-3 mr-1" /> Retry AI Insights
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-300" />
                            <p className="text-sm">AI insights will appear as you track more progress.</p>
                            <Button variant="outline" size="sm" className="mt-2" onClick={loadAiInsights}>
                                <RefreshCw className="w-3 h-3 mr-1" /> Load Insights
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {hasAnyData ? (
                <>
                    {/* Overall Progress Bar */}
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full -mr-32 -mt-32" />
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    <CardTitle>Overall Progress</CardTitle>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-1">
                                    {overallPercent}%
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Progress value={overallPercent} className="h-4" />
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{skillsMastered}</p>
                                        <p className="text-sm text-gray-600 mt-1">Skills Mastered</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{milestonesReached}</p>
                                        <p className="text-sm text-gray-600 mt-1">Milestones Reached</p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">{totalSkills}</p>
                                        <p className="text-sm text-gray-600 mt-1">Skills Tracked</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills Progress */}
                    {skillsProgress.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-blue-600" />
                                    <CardTitle>Skills Progress</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {skillsProgress.map((skill: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative"
                                        >
                                            <div
                                                className={`p-6 rounded-xl border-2 ${
                                                    (skill.progress || 0) >= 80
                                                        ? 'border-green-200 bg-green-50/30'
                                                        : (skill.progress || 0) >= 60
                                                          ? 'border-blue-200 bg-blue-50/30'
                                                          : 'border-gray-200 bg-gray-50/30'
                                                } hover:shadow-lg transition-all`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg text-gray-900">
                                                            {skill.skillName || skill.name || 'Unknown Skill'}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                Level {skill.level || 1}
                                                            </Badge>
                                                            {skill.improvement && (
                                                                <div className="flex items-center gap-1 text-xs text-green-600">
                                                                    <ArrowUp className="w-3 h-3" />
                                                                    <span>+{skill.improvement}%</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`w-16 h-16 rounded-full flex items-center justify-center ${getSkillBgColor(
                                                            skill.progress || 0,
                                                        )}`}
                                                    >
                                                        <span
                                                            className={`text-xl font-bold ${getSkillColor(skill.progress || 0)}`}
                                                        >
                                                            {skill.progress || 0}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <Progress value={skill.progress || 0} className="h-3" />
                                                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                                    <span>Beginner</span>
                                                    <span>Expert</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-blue-600" />
                                    <CardTitle>Skills Progress</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Star className="w-12 h-12 text-blue-200 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">No skills tracked in this range.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Milestones */}
                    {milestones.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-600" />
                                    <CardTitle>Milestones</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {milestones.map((milestone: any, index: number) => (
                                        <motion.div
                                            key={milestone.id || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`p-5 rounded-lg border-2 ${
                                                milestone.achieved
                                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                            milestone.achieved
                                                                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                                                : 'bg-gray-300'
                                                        }`}
                                                    >
                                                        {milestone.achieved ? (
                                                            <CheckCircle className="w-6 h-6 text-white" />
                                                        ) : (
                                                            <Target className="w-6 h-6 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 text-lg">
                                                            {milestone.title || milestone.name || 'Milestone'}
                                                        </h4>
                                                        {milestone.description && (
                                                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                                        )}
                                                        {milestone.achieved && milestone.achievedAt && (
                                                            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>
                                                                    Achieved on{' '}
                                                                    {new Date(milestone.achievedAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {!milestone.achieved && milestone.progress != null && (
                                                            <div className="mt-3">
                                                                <div className="flex items-center justify-between text-sm mb-1">
                                                                    <span className="text-gray-600">Progress</span>
                                                                    <span className="font-medium text-gray-900">
                                                                        {milestone.progress}%
                                                                    </span>
                                                                </div>
                                                                <Progress value={milestone.progress} className="h-2" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {milestone.achieved && (
                                                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Timeline */}
                    {timeline.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    <CardTitle>Recent Activity</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                                    <div className="space-y-6">
                                        {timeline.map((item: any, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="relative flex items-start gap-4"
                                            >
                                                <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                                                    {(item.date || '').split('-')[2] || '?'}
                                                </div>
                                                <div
                                                    className="flex-1 bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer"
                                                    onClick={() => {
                                                        if (item.link) router.push(item.link)
                                                    }}
                                                    role={item.link ? 'link' : undefined}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <Badge className="mb-2" variant="outline">
                                                                {item.event || item.type || 'Activity'}
                                                            </Badge>
                                                            <p className="font-semibold text-gray-900">
                                                                {item.description || 'Activity recorded'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {item.date
                                                                    ? new Date(item.date).toLocaleDateString(undefined, {
                                                                          year: 'numeric',
                                                                          month: 'short',
                                                                          day: 'numeric',
                                                                      })
                                                                    : ''}
                                                            </p>
                                                        </div>
                                                        {item.link && (
                                                            <ArrowUp className="w-4 h-4 text-purple-400 rotate-45" />
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : (
                <Card className="border-dashed border-2 border-blue-200">
                    <CardContent className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6">
                            <BarChart3 className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No progress data for this range</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Try a wider date range, or attend a class to start tracking your progress.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <Button onClick={() => router.push('/user/my-classes')}>
                                <Calendar className="w-4 h-4 mr-2" />
                                Browse Classes
                            </Button>
                            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Set Goal Drawer */}
            <SlideInDrawer
                isOpen={showGoalDrawer}
                onClose={() => setShowGoalDrawer(false)}
                title="Set New Goal"
                description="Define a measurable goal and track your progress toward it"
                size="md"
                footer={
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setShowGoalDrawer(false)}
                            disabled={savingGoal}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveGoal}
                            disabled={savingGoal}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {savingGoal ? 'Saving...' : 'Save Goal'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {goalErrors._form && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-xs text-red-600">{goalErrors._form}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Goal Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={goalForm.goalType}
                            onChange={(e) => setGoalForm({ ...goalForm, goalType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a goal type</option>
                            <option value="skill">Skill</option>
                            <option value="attendance">Attendance</option>
                            <option value="performance">Performance</option>
                            <option value="nutrition">Nutrition</option>
                            <option value="weight">Weight</option>
                        </select>
                        {goalErrors.goalType && (
                            <p className="text-xs text-red-600 mt-1">{goalErrors.goalType}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target <span className="text-red-500">*</span>
                        </label>
                        {goalForm.goalType === 'weight' || goalForm.goalType === 'attendance' || goalForm.goalType === 'performance' ? (
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={goalForm.target}
                                onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                                placeholder={
                                    goalForm.goalType === 'weight'
                                        ? 'e.g. 70 (kg)'
                                        : goalForm.goalType === 'attendance'
                                            ? 'e.g. 20 (classes)'
                                            : 'e.g. 85 (%)'
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        ) : (
                            <input
                                type="text"
                                value={goalForm.target}
                                onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
                                placeholder={
                                    goalForm.goalType === 'skill'
                                        ? 'e.g. Master back handspring'
                                        : goalForm.goalType === 'nutrition'
                                            ? 'e.g. 2000 calories/day'
                                            : 'Describe the target'
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        )}
                        {goalErrors.target && (
                            <p className="text-xs text-red-600 mt-1">{goalErrors.target}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deadline <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={goalForm.deadline}
                            min={formatDate(new Date())}
                            onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {goalErrors.deadline && (
                            <p className="text-xs text-red-600 mt-1">{goalErrors.deadline}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={goalForm.notes}
                            onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })}
                            rows={4}
                            placeholder="Add any notes or context for this goal (optional)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {goalErrors.notes && (
                            <p className="text-xs text-red-600 mt-1">{goalErrors.notes}</p>
                        )}
                    </div>
                </div>
            </SlideInDrawer>
        </div>
    )
}
