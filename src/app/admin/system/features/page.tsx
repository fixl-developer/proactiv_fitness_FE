'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flag, Plus, Search, ToggleLeft, ToggleRight, Clock, FlaskConical, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface FeatureFlag {
    id: number
    name: string
    description: string
    environment: string
    envColor: string
    enabled: boolean
    rollout: number
    status: string
    statusColor: string
    updated: string
}

const initialFlags: FeatureFlag[] = [
    { id: 1, name: 'AI Coach Recommendations', description: 'AI-powered personalized coach recommendations for students', environment: 'Staging', envColor: 'bg-amber-100 text-amber-700', enabled: true, rollout: 50, status: 'Testing', statusColor: 'bg-purple-100 text-purple-700', updated: 'Mar 18, 2026' },
    { id: 2, name: 'New Booking Flow', description: 'Redesigned booking flow with multi-step wizard', environment: 'Production', envColor: 'bg-green-100 text-green-700', enabled: true, rollout: 100, status: 'Enabled', statusColor: 'bg-green-100 text-green-700', updated: 'Mar 15, 2026' },
    { id: 3, name: 'Payment Retry Logic', description: 'Automatic retry for failed payment transactions', environment: 'Production', envColor: 'bg-green-100 text-green-700', enabled: true, rollout: 100, status: 'Enabled', statusColor: 'bg-green-100 text-green-700', updated: 'Mar 12, 2026' },
    { id: 4, name: 'Virtual Training Module', description: 'Live and on-demand virtual training sessions', environment: 'Dev', envColor: 'bg-blue-100 text-blue-700', enabled: false, rollout: 0, status: 'Disabled', statusColor: 'bg-gray-100 text-gray-600', updated: 'Mar 10, 2026' },
    { id: 5, name: 'Gamification Badges', description: 'Achievement badges and rewards for student milestones', environment: 'Staging', envColor: 'bg-amber-100 text-amber-700', enabled: true, rollout: 25, status: 'Testing', statusColor: 'bg-purple-100 text-purple-700', updated: 'Mar 17, 2026' },
    { id: 6, name: 'Multi-Language Support', description: 'Support for Chinese, English, and Japanese interfaces', environment: 'Staging', envColor: 'bg-amber-100 text-amber-700', enabled: true, rollout: 75, status: 'Testing', statusColor: 'bg-purple-100 text-purple-700', updated: 'Mar 19, 2026' },
]

export default function FeatureFlagsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [flags, setFlags] = useState(initialFlags)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

    const toggleFlag = (id: number) => {
        setFlags(prev => prev.map(f => {
            if (f.id === id) {
                const newEnabled = !f.enabled
                return {
                    ...f,
                    enabled: newEnabled,
                    status: newEnabled ? (f.rollout === 100 ? 'Enabled' : 'Testing') : 'Disabled',
                    statusColor: newEnabled ? (f.rollout === 100 ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700') : 'bg-gray-100 text-gray-600',
                    rollout: newEnabled ? (f.rollout === 0 ? 25 : f.rollout) : 0,
                }
            }
            return f
        }))
    }

    const updateRollout = (id: number, value: number) => {
        setFlags(prev => prev.map(f => {
            if (f.id === id) {
                return {
                    ...f,
                    rollout: value,
                    status: value === 100 ? 'Enabled' : value === 0 ? 'Disabled' : 'Testing',
                    statusColor: value === 100 ? 'bg-green-100 text-green-700' : value === 0 ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700',
                    enabled: value > 0,
                }
            }
            return f
        }))
    }

    const filtered = flags.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const enabledCount = flags.filter(f => f.enabled && f.rollout === 100).length
    const disabledCount = flags.filter(f => !f.enabled).length
    const testingCount = flags.filter(f => f.enabled && f.rollout < 100).length

    const stats = [
        { label: 'Total Flags', value: flags.length.toString(), icon: Flag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Enabled', value: enabledCount.toString(), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Disabled', value: disabledCount.toString(), icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100' },
        { label: 'In Testing', value: testingCount.toString(), icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50' },
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">Feature Flags</h1>
                    <p className="text-gray-600 mt-1">Control feature rollouts, A/B tests, and environment toggles</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Flag
                    </Button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search feature flags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {filtered.map((flag, i) => (
                    <motion.div
                        key={flag.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.07 }}
                    >
                        <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${flag.enabled ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                            <CardContent className="p-5">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-semibold text-gray-900 text-lg">{flag.name}</h3>
                                            <Badge className={flag.envColor}>{flag.environment}</Badge>
                                            <Badge className={flag.statusColor}>{flag.status}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-500">{flag.description}</p>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            Updated: {flag.updated}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 lg:gap-8">
                                        {/* Rollout Slider */}
                                        <div className="w-48">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Rollout</span>
                                                <span className="font-medium">{flag.rollout}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                value={flag.rollout}
                                                onChange={(e) => updateRollout(flag.id, Number(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                            <Progress value={flag.rollout} className="h-1.5 mt-1" />
                                        </div>

                                        {/* Toggle */}
                                        <button
                                            onClick={() => toggleFlag(flag.id)}
                                            className="flex items-center gap-2 shrink-0"
                                        >
                                            {flag.enabled ? (
                                                <ToggleRight className="w-10 h-10 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="w-10 h-10 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
