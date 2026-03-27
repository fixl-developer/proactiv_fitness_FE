'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Award, Trophy, Star, Target, Zap, Lock, RefreshCw, TrendingUp, Medal, Brain, Sparkles, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import UserAchievementsService from '@/services/modules/user-achievements.service'
import { apiClient } from '@/services/api/client'
import { gamificationEngineService } from '@/services/advancedAIServices'

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<any[]>([])
    const [filteredAchievements, setFilteredAchievements] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [claimingId, setClaimingId] = useState<string | null>(null)
    const [aiTips, setAiTips] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiChallenges, setAiChallenges] = useState<any>(null)
    const [aiChallengesLoading, setAiChallengesLoading] = useState(false)
    const [streakRisk, setStreakRisk] = useState<any>(null)
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()
    const achievementsService = new UserAchievementsService()

    const loadAiTips = useCallback(async () => {
        try {
            setAiLoading(true)
            const data = await apiClient.get('/advanced-analytics/insights')
            setAiTips(data)
        } catch (error) {
            console.error('Error loading AI tips:', error)
            setAiTips(null)
        } finally {
            setAiLoading(false)
        }
    }, [])

    const loadAiChallenges = useCallback(async () => {
        try {
            setAiChallengesLoading(true)
            const [challengesData, streakData] = await Promise.allSettled([
                gamificationEngineService.getChallenges(user?.id || ''),
                gamificationEngineService.getStreakRisk(user?.id || '')
            ])
            setAiChallenges(challengesData.status === 'fulfilled' ? challengesData.value : null)
            setStreakRisk(streakData.status === 'fulfilled' ? streakData.value : null)
        } catch (error) {
            console.error('Error loading AI challenges:', error)
            setAiChallenges(null)
            setStreakRisk(null)
        } finally {
            setAiChallengesLoading(false)
        }
    }, [user?.id])

    const loadAchievements = useCallback(async () => {
        try {
            const [achievementsData, statsData, leaderboardData] = await Promise.allSettled([
                achievementsService.getAchievements(),
                achievementsService.getStats(),
                achievementsService.getLeaderboard()
            ])

            const achList = achievementsData.status === 'fulfilled' ? achievementsData.value : []
            const statsResult = statsData.status === 'fulfilled' ? statsData.value : null
            const lbResult = leaderboardData.status === 'fulfilled' ? leaderboardData.value : []

            setAchievements(Array.isArray(achList) ? achList : [])
            setStats(statsResult)
            setLeaderboard(Array.isArray(lbResult) ? lbResult.slice(0, 5) : [])
        } catch (err) {
            console.error('Error loading achievements:', err)
            setAchievements([])
            setStats(null)
            setLeaderboard([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadAchievements()
        loadAiTips()
        loadAiChallenges()
    }, [isAuthenticated, router, loadAchievements, loadAiTips, loadAiChallenges])

    useEffect(() => {
        filterAchievements()
    }, [achievements, activeFilter, categoryFilter])

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadAchievements()
        setRefreshing(false)
    }

    const handleClaimReward = async (achievementId: string) => {
        try {
            setClaimingId(achievementId)
            await achievementsService.unlockAchievement(achievementId)
            // Refresh after claim
            await loadAchievements()
        } catch (err) {
            console.error('Error claiming reward:', err)
            alert('Failed to claim reward. Please try again.')
        } finally {
            setClaimingId(null)
        }
    }

    const filterAchievements = () => {
        let filtered = achievements

        if (activeFilter === 'unlocked') {
            filtered = filtered.filter(a => a.achieved || a.isCompleted)
        } else if (activeFilter === 'locked') {
            filtered = filtered.filter(a => !a.achieved && !a.isCompleted)
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(a => a.category === categoryFilter)
        }

        setFilteredAchievements(filtered)
    }

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            attendance: 'bg-blue-100 text-blue-800',
            skill: 'bg-purple-100 text-purple-800',
            milestone: 'bg-green-100 text-green-800',
            special: 'bg-yellow-100 text-yellow-800',
            performance: 'bg-orange-100 text-orange-800'
        }
        return colors[category] || 'bg-gray-100 text-gray-800'
    }

    const categories = [
        { key: 'all', label: 'All', count: achievements.length },
        { key: 'attendance', label: 'Attendance', count: achievements.filter(a => a.category === 'attendance').length },
        { key: 'skill', label: 'Skills', count: achievements.filter(a => a.category === 'skill').length },
        { key: 'milestone', label: 'Milestones', count: achievements.filter(a => a.category === 'milestone').length },
        { key: 'special', label: 'Special', count: achievements.filter(a => a.category === 'special').length }
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                </div>
            </div>
        )
    }

    const statCards = [
        { title: 'Total Points', value: stats?.totalPoints || 0, icon: Trophy, gradient: 'from-amber-500 to-yellow-600', bgGradient: 'from-amber-50 to-yellow-100', change: 'earned' },
        { title: 'Unlocked', value: `${stats?.unlockedAchievements || 0}/${stats?.totalAchievements || 0}`, icon: Award, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100', change: 'achievements' },
        { title: 'Badges', value: stats?.badges || 0, icon: Star, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: 'collected' },
        { title: 'Completion', value: `${Math.round(((stats?.unlockedAchievements || 0) / (stats?.totalAchievements || 1)) * 100)}%`, icon: Target, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', change: 'progress' }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Achievements</h1>
                    <p className="text-gray-600 mt-2">Track your accomplishments and earn rewards</p>
                </div>
                <Button id="user-achievements-refresh-btn" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
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

            {/* AI Achievement Tips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">AI Achievement Tips</h3>
                    <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">AI Powered</span>
                </div>
                {aiLoading ? (
                    <div className="flex items-center justify-center py-6 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                        <p className="text-sm text-gray-500">Loading AI suggestions...</p>
                    </div>
                ) : aiTips ? (
                    <div className="space-y-2">
                        {(aiTips.recommendations || aiTips.insights || []).slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-700">{item.suggestion || item.title || item.description || item}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">AI suggestions unavailable</p>
                )}
            </div>

            {/* AI Challenges */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <CardTitle>AI Challenges</CardTitle>
                        <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">AI Powered</span>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Streak Risk Warning */}
                    {streakRisk && (streakRisk.atRisk || streakRisk.riskLevel === 'high' || streakRisk.riskLevel === 'medium') && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                            <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-amber-800">Streak at Risk!</p>
                                <p className="text-xs text-amber-600 mt-0.5">
                                    {streakRisk.message || streakRisk.recommendation || 'Complete a challenge today to maintain your streak.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {aiChallengesLoading ? (
                        <div className="flex items-center justify-center py-6 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">Loading personalized challenges...</p>
                        </div>
                    ) : aiChallenges ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(aiChallenges.challenges || aiChallenges.data || []).slice(0, 4).map((challenge: any, i: number) => {
                                const difficultyColors: Record<string, string> = {
                                    easy: 'bg-green-100 text-green-700',
                                    medium: 'bg-yellow-100 text-yellow-700',
                                    hard: 'bg-red-100 text-red-700',
                                }
                                return (
                                    <div key={i} className="p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-sm font-semibold text-gray-900">{challenge.title || challenge.name || `Challenge ${i + 1}`}</h4>
                                            {challenge.difficulty && (
                                                <Badge className={difficultyColors[challenge.difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-700'}>
                                                    {challenge.difficulty}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 mb-3">{challenge.description || challenge.details || ''}</p>
                                        <div className="flex items-center justify-between">
                                            {challenge.xpReward != null && (
                                                <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-full flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> {challenge.xpReward} XP
                                                </span>
                                            )}
                                            {challenge.progress != null && (
                                                <span className="text-xs text-gray-500">{challenge.progress}% done</span>
                                            )}
                                        </div>
                                        {challenge.progress != null && (
                                            <Progress value={challenge.progress} className="mt-2 h-1.5" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">AI challenges unavailable</p>
                    )}
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            {['all', 'unlocked', 'locked'].map((filter) => (
                                <button id={`user-achievements-status-${filter}-btn`}
                                    key={filter}
                                    onClick={() => setActiveFilter(filter as any)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                                        activeFilter === filter
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {categories.map((cat) => (
                                <button id={`user-achievements-category-${cat.key}-btn`}
                                    key={cat.key}
                                    onClick={() => setCategoryFilter(cat.key)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                        categoryFilter === cat.key
                                            ? 'bg-emerald-100 text-emerald-800 shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat.label}
                                    <Badge className="ml-1.5" variant="outline">{cat.count}</Badge>
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Achievements Grid */}
            {filteredAchievements.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Medal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements found</h3>
                        <p className="text-gray-500 mb-4">
                            {achievements.length === 0
                                ? 'Start attending classes to unlock achievements!'
                                : 'Try adjusting your filters'}
                        </p>
                        {achievements.length === 0 && (
                            <Button onClick={() => router.push('/user/my-classes')}>Browse Classes</Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAchievements.map((achievement, index) => (
                        <motion.div
                            key={achievement.id || index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`hover:shadow-xl transition-all ${
                                (achievement.achieved || achievement.isCompleted)
                                    ? 'border-2 border-green-200 bg-gradient-to-br from-white to-green-50/30'
                                    : 'border-2 border-gray-200'
                            }`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <motion.div
                                            className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                                                (achievement.achieved || achievement.isCompleted)
                                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
                                                    : 'bg-gray-200 grayscale'
                                            }`}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                            {(achievement.achieved || achievement.isCompleted) ? (achievement.icon || '🏆') : <Lock className="w-8 h-8 text-gray-400" />}
                                        </motion.div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-900">{achievement.title || achievement.name}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                                                </div>
                                                {achievement.category && (
                                                    <Badge className={getCategoryColor(achievement.category)}>
                                                        {achievement.category}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-2">
                                                    <Trophy className="w-4 h-4 text-yellow-600" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {achievement.points} points
                                                    </span>
                                                </div>
                                                {(achievement.achieved || achievement.isCompleted) ? (
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-green-100 text-green-800">Unlocked</Badge>
                                                        {achievement.reward && !achievement.reward.claimed && (
                                                            <Button
                                                                size="sm"
                                                                className="bg-amber-500 hover:bg-amber-600 text-white"
                                                                onClick={() => handleClaimReward(achievement.id)}
                                                                disabled={claimingId === achievement.id}
                                                            >
                                                                {claimingId === achievement.id ? (
                                                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                                                ) : (
                                                                    'Claim Reward'
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : achievement.progress != null ? (
                                                    <span className="text-sm text-gray-600 font-medium">
                                                        {achievement.progress}% complete
                                                    </span>
                                                ) : (
                                                    <Badge variant="outline" className="text-gray-500">
                                                        <Lock className="w-3 h-3 mr-1" />
                                                        Locked
                                                    </Badge>
                                                )}
                                            </div>

                                            {!(achievement.achieved || achievement.isCompleted) && achievement.progress != null && (
                                                <Progress value={achievement.progress} className="mt-3 h-2" />
                                            )}

                                            {(achievement.achieved || achievement.isCompleted) && (achievement.achievedAt || achievement.earnedAt) && (
                                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                                    <Star className="w-3 h-3" />
                                                    Achieved on {new Date(achievement.achievedAt || achievement.earnedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                                <CardTitle>Leaderboard</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {leaderboard.map((entry, index) => (
                                <motion.div
                                    key={entry.userId || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center justify-between p-4 rounded-lg ${
                                        entry.userId === (user?.id || (user as any)?._id)
                                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200'
                                            : 'bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                            entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                                            entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                                            entry.rank === 3 ? 'bg-orange-400 text-orange-900' :
                                            'bg-gray-200 text-gray-600'
                                        }`}>
                                            {entry.rank}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {entry.userName}
                                                {entry.userId === (user?.id || (user as any)?._id) && (
                                                    <Badge className="ml-2 bg-emerald-100 text-emerald-800">You</Badge>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600">{entry.achievements} achievements</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-yellow-600">{entry.points}</p>
                                        <p className="text-xs text-gray-500">points</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
