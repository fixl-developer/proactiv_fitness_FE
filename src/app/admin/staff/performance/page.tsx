'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users, TrendingUp, Star, Award, BarChart3, Calendar,
    Target, Clock, DollarSign, Activity, Filter, Download,
    Eye, MessageSquare, Trophy, Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { responsiveClasses } from '@/lib/responsiveClasses'

const StaffPerformancePage = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')

    // Performance metrics data
    const performanceMetrics = [
        {
            id: 1,
            name: 'Sarah Chen',
            role: 'Senior Coach',
            location: 'Cyberport',
            avatar: 'SC',
            metrics: {
                studentRating: 4.9,
                classesCompleted: 128,
                studentRetention: 94,
                revenue: 45600,
                punctuality: 98,
                parentFeedback: 4.8,
                skillDevelopment: 92,
                safetyCompliance: 100
            },
            trends: {
                rating: '+0.2',
                retention: '+5%',
                revenue: '+12%'
            },
            achievements: ['Top Performer Q4', 'Safety Excellence', '100% Attendance']
        },
        {
            id: 2,
            name: 'Monica Liu',
            role: 'Coach',
            location: 'Wan Chai',
            avatar: 'ML',
            metrics: {
                studentRating: 4.7,
                classesCompleted: 96,
                studentRetention: 89,
                revenue: 34200,
                punctuality: 95,
                parentFeedback: 4.6,
                skillDevelopment: 88,
                safetyCompliance: 98
            },
            trends: {
                rating: '+0.1',
                retention: '+2%',
                revenue: '+8%'
            },
            achievements: ['Rising Star', 'Parent Favorite']
        },
        {
            id: 3,
            name: 'Juan Rodriguez',
            role: 'Coach',
            location: 'Cyberport',
            avatar: 'JR',
            metrics: {
                studentRating: 4.8,
                classesCompleted: 112,
                studentRetention: 91,
                revenue: 39800,
                punctuality: 97,
                parentFeedback: 4.7,
                skillDevelopment: 90,
                safetyCompliance: 99
            },
            trends: {
                rating: '+0.3',
                retention: '+7%',
                revenue: '+15%'
            },
            achievements: ['Most Improved', 'Student Champion']
        },
        {
            id: 4,
            name: 'Alex Wong',
            role: 'Assistant Coach',
            location: 'Sha Tin',
            avatar: 'AW',
            metrics: {
                studentRating: 4.5,
                classesCompleted: 72,
                studentRetention: 85,
                revenue: 25600,
                punctuality: 92,
                parentFeedback: 4.4,
                skillDevelopment: 84,
                safetyCompliance: 96
            },
            trends: {
                rating: '-0.1',
                retention: '-2%',
                revenue: '+3%'
            },
            achievements: ['New Talent']
        }
    ]

    // Performance categories
    const performanceCategories = [
        {
            title: 'Student Satisfaction',
            key: 'studentRating',
            icon: Star,
            color: 'text-yellow-600',
            format: (value: number) => `${value}/5.0`
        },
        {
            title: 'Classes Completed',
            key: 'classesCompleted',
            icon: Calendar,
            color: 'text-blue-600',
            format: (value: number) => value.toString()
        },
        {
            title: 'Student Retention',
            key: 'studentRetention',
            icon: Users,
            color: 'text-green-600',
            format: (value: number) => `${value}%`
        },
        {
            title: 'Revenue Generated',
            key: 'revenue',
            icon: DollarSign,
            color: 'text-purple-600',
            format: (value: number) => `HK$${(value / 1000).toFixed(0)}K`
        },
        {
            title: 'Punctuality',
            key: 'punctuality',
            icon: Clock,
            color: 'text-indigo-600',
            format: (value: number) => `${value}%`
        },
        {
            title: 'Safety Compliance',
            key: 'safetyCompliance',
            icon: Award,
            color: 'text-red-600',
            format: (value: number) => `${value}%`
        }
    ]

    const getPerformanceColor = (value: number, category: string) => {
        const thresholds = {
            studentRating: { excellent: 4.7, good: 4.3 },
            studentRetention: { excellent: 90, good: 80 },
            punctuality: { excellent: 95, good: 90 },
            safetyCompliance: { excellent: 98, good: 95 }
        }

        const threshold = thresholds[category as keyof typeof thresholds]
        if (!threshold) return 'text-gray-600'

        if (value >= threshold.excellent) return 'text-green-600'
        if (value >= threshold.good) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getTrendColor = (trend: string) => {
        if (trend.startsWith('+')) return 'text-green-600'
        if (trend.startsWith('-')) return 'text-red-600'
        return 'text-gray-600'
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Staff Performance</h1>
                    <p className="text-gray-600 mt-2">Monitor and analyze coach performance metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {['month', 'quarter', 'year'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period as any)}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedPeriod === period
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Top Performer</CardTitle>
                        <Trophy className="h-5 w-5 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">Sarah Chen</div>
                        <div className="text-sm text-yellow-600 font-medium">4.9/5.0 Rating</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg Performance</CardTitle>
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">4.7/5.0</div>
                        <div className="text-sm text-green-600 font-medium">+0.2 vs last month</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">HK$145K</div>
                        <div className="text-sm text-green-600 font-medium">+9% growth</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Retention Rate</CardTitle>
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">89.8%</div>
                        <div className="text-sm text-green-600 font-medium">+3% improvement</div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Individual Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {performanceMetrics.map((staff, index) => (
                            <motion.div
                                key={staff.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 bg-gray-50 rounded-lg hover:shadow-md transition-all"
                            >
                                {/* Staff Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {staff.avatar}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                                            <p className="text-sm text-gray-600">{staff.role} • {staff.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Feedback
                                        </Button>
                                    </div>
                                </div>

                                {/* Performance Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                                    {performanceCategories.map((category) => {
                                        const value = staff.metrics[category.key as keyof typeof staff.metrics] as number
                                        const trend = staff.trends[category.key as keyof typeof staff.trends]
                                        return (
                                            <div key={category.key} className="text-center">
                                                <div className="flex items-center justify-center mb-1">
                                                    <category.icon className={`w-4 h-4 ${category.color}`} />
                                                </div>
                                                <div className={`text-lg font-bold ${getPerformanceColor(value, category.key)}`}>
                                                    {category.format(value)}
                                                </div>
                                                <div className="text-xs text-gray-500">{category.title}</div>
                                                {trend && (
                                                    <div className={`text-xs font-medium ${getTrendColor(trend)}`}>
                                                        {trend}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Achievements */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Achievements:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {staff.achievements.map((achievement, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                <Award className="w-3 h-3 mr-1" />
                                                {achievement}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Performance Trends Chart Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Performance trends chart will be displayed here</p>
                            <p className="text-sm text-gray-400">Integration with analytics service required</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>)
}

export default StaffPerformancePage