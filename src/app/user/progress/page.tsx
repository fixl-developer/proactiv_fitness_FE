'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Award, Calendar, RefreshCw, ArrowUp, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import UserProgressService from '@/services/modules/user-progress.service'

export default function ProgressPage() {
    const [progress, setProgress] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadProgress()
    }, [isAuthenticated, router])

    const loadProgress = async () => {
        try {
            const service = new UserProgressService()
            const data = await service.getProgress()
            setProgress(data)
        } catch (err) {
            console.error('Error loading progress:', err)
            // Mock data
            setProgress({
                overallProgress: 75,
                skillsProgress: [
                    { skillName: 'Balance', level: 3, progress: 85, improvement: 15 },
                    { skillName: 'Flexibility', level: 2, progress: 70, improvement: 10 },
                    { skillName: 'Strength', level: 2, progress: 65, improvement: 8 },
                    { skillName: 'Coordination', level: 3, progress: 90, improvement: 20 },
                    { skillName: 'Endurance', level: 2, progress: 60, improvement: 12 },
                    { skillName: 'Agility', level: 3, progress: 80, improvement: 18 }
                ],
                milestones: [
                    { id: '1', title: 'First Class', description: 'Completed your first class', achieved: true, achievedAt: '2026-01-15' },
                    { id: '2', title: '10 Classes', description: 'Attended 10 classes', achieved: true, achievedAt: '2026-02-20' },
                    { id: '3', title: '25 Classes', description: 'Attended 25 classes', achieved: false, progress: 60 },
                    { id: '4', title: '50 Classes', description: 'Attended 50 classes', achieved: false, progress: 30 }
                ],
                timeline: [
                    { date: '2026-03-15', event: 'Level Up', description: 'Balance skill reached Level 3' },
                    { date: '2026-03-10', event: 'Milestone', description: 'Completed 20 classes' },
                    { date: '2026-03-05', event: 'Achievement', description: 'Earned Perfect Attendance badge' },
                    { date: '2026-02-28', event: 'Progress', description: 'Flexibility improved by 15%' }
                ]
            })
        } finally {
            setIsLoading(false)
        }
    }

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
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
                </div>
            </div>
        )
    }

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

            {/* Overall Progress */}
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
                                <p className="text-2xl font-bold text-blue-600">
                                    {progress?.skillsProgress?.filter((s: any) => s.progress >= 80).length || 0}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Skills Mastered</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">
                                    {progress?.milestones?.filter((m: any) => m.achieved).length || 0}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Milestones Reached</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">
                                    {progress?.skillsProgress?.length || 0}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Skills Tracked</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skills Progress */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <CardTitle>Skills Progress</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {progress?.skillsProgress?.map((skill: any, index: number) => (
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

            {/* Milestones */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <CardTitle>Milestones</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {progress?.milestones?.map((milestone: any, index: number) => (
                            <motion.div
                                key={milestone.id}
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
                                            <h4 className="font-semibold text-gray-900 text-lg">{milestone.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                            {milestone.achieved && milestone.achievedAt && (
                                                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Achieved on {milestone.achievedAt}</span>
                                                </div>
                                            )}
                                            {!milestone.achieved && milestone.progress && (
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
                                        <Badge className="bg-green-100 text-green-800">
                                            ✓ Completed
                                        </Badge>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <CardTitle>Recent Activity</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                        <div className="space-y-6">
                            {progress?.timeline?.map((item: any, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative flex items-start gap-4"
                                >
                                    {/* Timeline Dot */}
                                    <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                                        {item.date.split('-')[2]}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-purple-200 hover:shadow-md transition-all">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <Badge className="mb-2" variant="outline">{item.event}</Badge>
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
        </div>
    )
}
