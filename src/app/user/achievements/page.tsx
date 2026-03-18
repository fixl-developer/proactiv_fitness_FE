'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, Trophy, Star, Target, Zap, Lock, RefreshCw, Filter, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import UserAchievementsService from '@/services/modules/user-achievements.service'

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<any[]>([])
    const [filteredAchievements, setFilteredAchievements] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadAchievements()
    }, [isAuthenticated, router])

    useEffect(() => {
        filterAchievements()
    }, [achievements, activeFilter, categoryFilter])

    const loadAchievements = async () => {
        try {
            const service = new UserAchievementsService()
            const [achievementsData, statsData, leaderboardData] = await Promise.all([
                service.getAchievements(),
                service.getStats(),
                service.getLeaderboard().catch(() => [])
            ])
            setAchievements(achievementsData)
            setStats(statsData)
            setLeaderboard(leaderboardData.slice(0, 5))
        } catch (err) {
            // Mock data
            setAchievements([
                {
                    id: '1',
                    title: 'First Class',
                    description: 'Completed your first gymnastics class',
                    icon: '🎯',
                    category: 'milestone',
                    points: 50,
                    achieved: true,
                    achievedAt: '2026-01-15'
                },
                {
                    id: '2',
                    title: 'Perfect Attendance',
                    description: 'Attended 10 classes in a row',
                    icon: '⭐',
                    category: 'attendance',
                    points: 100,
                    achieved: true,
                    achievedAt: '2026-02-20'
                },
                {
                    id: '3',
                    title: 'Skill Master',
                    description: 'Master 5 different skills',
                    icon: '🏆',
                    category: 'skill',
                    points: 150,
                    achieved: false,
                    progress: 60
                },
                {
                    id: '4',
                    title: 'Early Bird',
                    description: 'Book 5 classes in advance',
                    icon: '🌅',
                    category: 'special',
                    points: 75,
                    achieved: true,
                    achievedAt: '2026-03-01'
                },
                {
                    id: '5',
                    title: 'Consistency Champion',
                    description: 'Maintain a 30-day streak',
                    icon: '🔥',
                    category: 'attendance',
                    points: 200,
                    achieved: false,
                    progress: 40
                },
                {
                    id: '6',
                    title: 'Team Player',
                    description: 'Participate in 5 group classes',
                    icon: '👥',
                    category: 'special',
                    points: 80,
                    achieved: true,
                    achievedAt: '2026-02-10'
                }
            ])
            setStats({
                totalAchievements: 20,
                unlockedAchievements: 12,
                totalPoints: 850,
                badges: 8
            })
            setLeaderboard([
                { rank: 1, userId: 'u1', userName: 'Sarah Chen', points: 1250, achievements: 18 },
                { rank: 2, userId: 'u2', userName: 'Mike Wong', points: 1100, achievements: 16 },
                { rank: 3, userId: user?.id || 'u3', userName: user?.name || 'You', points: 850, achievements: 12 },
                { rank: 4, userId: 'u4', userName: 'Lisa Zhang', points: 720, achievements: 11 },
                { rank: 5, userId: 'u5', userName: 'John Smith', points: 650, achievements: 10 }
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadAchievements()
        setRefreshing(false)
    }

    const filterAchievements = () => {
        let filtered = achievements

        // Apply status filter
        if (activeFilter === 'unlocked') {
            filtered = filtered.filter(a => a.achieved)
        } else if (activeFilter === 'locked') {
            filtered = filtered.filter(a => !a.achieved)
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(a => a.category === categoryFilter)
        }

        setFilteredAchievements(filtered)
    }

    const getCategoryColor = (category: string) => {
        const colors = {
            attendance: 'bg-blue-100 text-blue-800',
            skill: 'bg-purple-100 text-purple-800',
            milestone: 'bg-green-100 text-green-800',
            special: 'bg-yellow-100 text-yellow-800'
        }
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const getCategoryIcon = (category: string) => {
        const icons = {
            attendance: <Star className="w-5 h-5" />,
            skill: <Zap className="w-5 h-5" />,
            milestone: <Target className="w-5 h-5" />,
            special: <Trophy className="w-5 h-5" />
        }
        return icons[category as keyof typeof icons] || <Award className="w-5 h-5" />
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
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>)}
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
                    <h1 className="text-3xl font-bold text-gray-900">My Achievements</h1>
                    <p className="text-gray-600 mt-2">Track your accomplishments and earn rewards</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Points</CardTitle>
                            <Trophy className="h-5 w-5 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats?.totalPoints || 0}</div>
                            <p className="text-xs text-yellow-600 font-medium mt-1">Keep earning!</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Unlocked</CardTitle>
                            <Award className="h-5 w-5 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {stats?.unlockedAchievements || 0}/{stats?.totalAchievements || 0}
                            </div>
                            <Progress 
                                value={((stats?.unlockedAchievements || 0) / (stats?.totalAchievements || 1)) * 100} 
                                className="mt-3 h-2" 
                            />
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Badges</CardTitle>
                            <Star className="h-5 w-5 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{stats?.badges || 0}</div>
                            <p className="text-xs text-blue-600 font-medium mt-1">Collected</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full -mr-16 -mt-16"></div>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
                            <Target className="h-5 w-5 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {Math.round(((stats?.unlockedAchievements || 0) / (stats?.totalAchievements || 1)) * 100)}%
                            </div>
                            <p className="text-xs text-purple-600 font-medium mt-1">Complete</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            {['all', 'unlocked', 'locked'].map((filter) => (
                                <button
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

                        {/* Category Filter */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {categories.map((cat) => (
                                <button
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAchievements.map((achievement, index) => (
                    <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className={`hover:shadow-xl transition-all ${
                            achievement.achieved 
                                ? 'border-2 border-green-200 bg-gradient-to-br from-white to-green-50/30' 
                                : 'border-2 border-gray-200'
                        }`}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <motion.div 
                                        className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                                            achievement.achieved 
                                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' 
                                                : 'bg-gray-200 grayscale'
                                        }`}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        {achievement.achieved ? achievement.icon : <Lock className="w-8 h-8 text-gray-400" />}
                                    </motion.div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900">{achievement.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                                            </div>
                                            <Badge className={getCategoryColor(achievement.category)}>
                                                {achievement.category}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-4 h-4 text-yellow-600" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {achievement.points} points
                                                </span>
                                            </div>
                                            {achievement.achieved ? (
                                                <Badge className="bg-green-100 text-green-800">
                                                    ✓ Unlocked
                                                </Badge>
                                            ) : achievement.progress ? (
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

                                        {!achievement.achieved && achievement.progress && (
                                            <Progress value={achievement.progress} className="mt-3 h-2" />
                                        )}

                                        {achievement.achieved && achievement.achievedAt && (
                                            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                                <Star className="w-3 h-3" />
                                                Achieved on {achievement.achievedAt}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                                <CardTitle>Leaderboard</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {leaderboard.map((entry, index) => (
                                <motion.div
                                    key={entry.userId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex items-center justify-between p-4 rounded-lg ${
                                        entry.userId === user?.id 
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
                                                {entry.userId === user?.id && (
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
