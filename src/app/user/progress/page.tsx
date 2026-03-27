'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Award, Calendar, RefreshCw, ArrowUp, CheckCircle, Clock, Flame, BarChart3, Brain, Sparkles, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import UserProgressService from '@/services/modules/user-progress.service'
import aiCoachService from '@/services/aiCoachService'

export default function ProgressPage() {
    const [progress, setProgress] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [aiData, setAiData] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    const loadProgress = useCallback(async () => {
        try {
            const service = new UserProgressService()
            const [progressData, timelineData, skillsData] = await Promise.allSettled([
                service.getProgress(),
                service.getTimeline(),
                service.getSkills()
            ])

            const mainProgress = progressData.status === 'fulfilled' ? progressData.value : null
            const timeline = timelineData.status === 'fulfilled' ? timelineData.value : []
            const skills = skillsData.status === 'fulfilled' ? skillsData.value : []

            if (mainProgress) {
                setProgress({
                    ...mainProgress,
                    timeline: mainProgress.timeline || (Array.isArray(timeline) ? timeline : []),
                    skillsProgress: mainProgress.skillsProgress || (Array.isArray(skills) ? skills : [])
                })
            } else {
                setProgress(null)
            }
        } catch (err) {
            console.error('Error loading progress:', err)
            setProgress(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const loadAiInsights = useCallback(async () => {
        try {
            setAiLoading(true)
            const userId = user?.id || ''
            const tenantId = user?.tenantId || user?.tenant_id || 'default'
            if (userId) {
                const result = await aiCoachService.predictProgress(userId, tenantId)
                setAiData(result)
            }
        } catch (err) {
            console.error('Failed to load AI progress insights:', err)
        } finally {
            setAiLoading(false)
        }
    }, [user?.id, user?.tenantId, user?.tenant_id])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadProgress()
        loadAiInsights()
    }, [isAuthenticated, router, loadProgress, loadAiInsights])

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadProgress()
        setRefreshing(false)
    }

    const getSkillColor = (progress: number) => {
        if (progress >= 80) return 'text-green-600'
        if (progress >= 60) return 'text-blue-600'
        if (progress >= 40) return 'text-yellow-600'
        return 'text-gray-600'
    }

    const getSkillBgColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-100'
        if (progress >= 60) return 'bg-blue-100'
        if (progress >= 40) return 'bg-yellow-100'
        return 'bg-gray-100'
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
                </div>
            </div>
        )
    }

    // Stats for colorful cards
    const skillsMastered = progress?.skillsProgress?.filter((s: any) => s.progress >= 80).length || 0
    const milestonesReached = progress?.milestones?.filter((m: any) => m.achieved).length || 0
    const totalSkills = progress?.skillsProgress?.length || 0

    const statCards = [
        { title: 'Overall Progress', value: `${progress?.overallProgress || 0}%`, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600', bgGradient: 'from-emerald-50 to-teal-100', change: 'level' },
        { title: 'Skills Mastered', value: skillsMastered, icon: Target, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: `of ${totalSkills}` },
        { title: 'Milestones', value: milestonesReached, icon: Award, gradient: 'from-amber-500 to-orange-600', bgGradient: 'from-amber-50 to-orange-100', change: 'reached' },
        { title: 'Current Streak', value: progress?.currentStreak || 0, icon: Flame, gradient: 'from-red-500 to-rose-600', bgGradient: 'from-red-50 to-rose-100', change: 'days' }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
                    <p className="text-gray-600 mt-2">Track your gymnastics journey</p>
                </div>
                <Button id="btn-refresh-user-progress" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

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

            {/* AI Progress Insights */}
            <Card className="relative overflow-hidden border-purple-200">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full -mr-24 -mt-24"></div>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle>AI Progress Insights</CardTitle>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Powered
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
                                    <p className="text-xs text-purple-700">{aiData.predictedTrajectory.description || aiData.predictedTrajectory.summary || 'Based on your current pace, you are on track.'}</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {(aiData.recommendations || aiData.insights || []).slice(0, 3).map((item: any, idx: number) => (
                                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                                        <div className="p-3 rounded-lg bg-white border border-purple-100 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Target className="w-3.5 h-3.5 text-purple-500" />
                                                <span className="text-xs font-semibold text-purple-800">{item.title || item.category || 'Insight'}</span>
                                            </div>
                                            <p className="text-xs text-gray-600">{typeof item === 'string' ? item : item.description || item.message || item.text || ''}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            {aiData.confidence != null && (
                                <p className="text-[10px] text-purple-400 text-right">AI confidence: {Math.round(aiData.confidence * 100)}%</p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-300" />
                            <p className="text-sm">AI insights will appear as you track more progress.</p>
                            <Button variant="outline" size="sm" className="mt-2" onClick={loadAiInsights}>
                                <RefreshCw className="w-3 h-3 mr-1" /> Retry
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {progress ? (
                <>
                    {/* Overall Progress Bar */}
                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full -mr-32 -mt-32"></div>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    <CardTitle>Overall Progress</CardTitle>
                                </div>
                                <Badge className="bg-emerald-100 text-emerald-800 text-lg px-4 py-1">
                                    {progress?.overallProgress || 0}%
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Progress value={progress?.overallProgress || 0} className="h-4" />
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
                    {progress?.skillsProgress?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-blue-600" />
                                    <CardTitle>Skills Progress</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {progress.skillsProgress.map((skill: any, index: number) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative"
                                        >
                                            <div className={`p-6 rounded-xl border-2 ${skill.progress >= 80 ? 'border-green-200 bg-green-50/30' :
                                                    skill.progress >= 60 ? 'border-blue-200 bg-blue-50/30' :
                                                        'border-gray-200 bg-gray-50/30'
                                                } hover:shadow-lg transition-all`}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg text-gray-900">{skill.skillName}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                Level {skill.level}
                                                            </Badge>
                                                            {skill.improvement && (
                                                                <div className="flex items-center gap-1 text-xs text-green-600">
                                                                    <ArrowUp className="w-3 h-3" />
                                                                    <span>+{skill.improvement}%</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getSkillBgColor(skill.progress)}`}>
                                                        <span className={`text-xl font-bold ${getSkillColor(skill.progress)}`}>
                                                            {skill.progress}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <Progress value={skill.progress} className="h-3" />
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
                    )}

                    {/* Milestones */}
                    {progress?.milestones?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-600" />
                                    <CardTitle>Milestones</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {progress.milestones.map((milestone: any, index: number) => (
                                        <motion.div
                                            key={milestone.id || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`p-5 rounded-lg border-2 ${milestone.achieved
                                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${milestone.achieved
                                                            ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                                            : 'bg-gray-300'
                                                        }`}>
                                                        {milestone.achieved ? (
                                                            <CheckCircle className="w-6 h-6 text-white" />
                                                        ) : (
                                                            <Target className="w-6 h-6 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 text-lg">{milestone.title || milestone.name}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                                        {milestone.achieved && milestone.achievedAt && (
                                                            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>Achieved on {new Date(milestone.achievedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                        {!milestone.achieved && milestone.progress != null && (
                                                            <div className="mt-3">
                                                                <div className="flex items-center justify-between text-sm mb-1">
                                                                    <span className="text-gray-600">Progress</span>
                                                                    <span className="font-medium text-gray-900">{milestone.progress}%</span>
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
                    {progress?.timeline?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    <CardTitle>Recent Activity</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                    <div className="space-y-6">
                                        {progress.timeline.map((item: any, index: number) => (
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
                                                <div className="flex-1 bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-purple-200 hover:shadow-md transition-all">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <Badge className="mb-2" variant="outline">{item.event || item.type}</Badge>
                                                            <p className="font-semibold text-gray-900">{item.description}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                                                        </div>
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
                <Card>
                    <CardContent className="p-12 text-center">
                        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No progress data yet</h3>
                        <p className="text-gray-500 mb-4">Start attending classes to track your progress!</p>
                        <Button onClick={() => router.push('/user/my-classes')}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Browse Classes
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
