'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, TrendingDown, BarChart3, Users, Target,
    Calendar, MapPin, Filter, Download, ArrowUp, ArrowDown,
    Activity, Award, Clock, CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const PerformanceAnalyticsPage = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')

    // Performance metrics
    const performanceMetrics = {
        overallScore: 87,
        memberRetention: 92,
        classAttendance: 78,
        staffProductivity: 85,
        memberSatisfaction: 4.6,
        goalCompletionRate: 73,
    }

    // Location performance
    const locationPerformance = [
        { name: 'Downtown', score: 92, members: 1250, retention: 94, attendance: 82, trend: 'up' as const },
        { name: 'Westside', score: 88, members: 980, retention: 91, attendance: 79, trend: 'up' as const },
        { name: 'North Campus', score: 85, members: 750, retention: 89, attendance: 76, trend: 'down' as const },
        { name: 'East Branch', score: 81, members: 620, retention: 87, attendance: 74, trend: 'up' as const },
    ]

    // Staff performance
    const staffPerformance = [
        { name: 'Sarah Johnson', role: 'Trainer', rating: 4.9, sessions: 142, retention: 96 },
        { name: 'Mike Chen', role: 'Trainer', rating: 4.8, sessions: 128, retention: 94 },
        { name: 'Emma Williams', role: 'Manager', rating: 4.7, sessions: 0, retention: 93 },
        { name: 'David Brown', role: 'Trainer', rating: 4.6, sessions: 115, retention: 91 },
    ]

    // Program performance
    const programPerformance = [
        { name: 'HIIT Training', enrolled: 320, completion: 85, satisfaction: 4.7, revenue: 48000 },
        { name: 'Yoga Flow', enrolled: 280, completion: 91, satisfaction: 4.8, revenue: 36400 },
        { name: 'Strength Basics', enrolled: 245, completion: 78, satisfaction: 4.5, revenue: 42350 },
        { name: 'Swimming', enrolled: 190, completion: 82, satisfaction: 4.6, revenue: 30400 },
    ]

    const periods = ['week', 'month', 'quarter', 'year'] as const

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
                    <p className="text-gray-600 mt-1">Track and analyze performance across your organization</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {periods.map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                                    selectedPeriod === period
                                        ? 'bg-white shadow text-blue-600 font-medium'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                    <Button id="btn-export-performance" variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Overall Score', value: `${performanceMetrics.overallScore}%`, icon: Activity, color: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-blue-100' },
                    { label: 'Retention', value: `${performanceMetrics.memberRetention}%`, icon: Users, color: 'from-green-500 to-green-600', bg: 'from-green-50 to-green-100' },
                    { label: 'Attendance', value: `${performanceMetrics.classAttendance}%`, icon: CheckCircle, color: 'from-purple-500 to-purple-600', bg: 'from-purple-50 to-purple-100' },
                    { label: 'Productivity', value: `${performanceMetrics.staffProductivity}%`, icon: TrendingUp, color: 'from-orange-500 to-orange-600', bg: 'from-orange-50 to-orange-100' },
                    { label: 'Satisfaction', value: `${performanceMetrics.memberSatisfaction}/5`, icon: Award, color: 'from-pink-500 to-pink-600', bg: 'from-pink-50 to-pink-100' },
                    { label: 'Goal Rate', value: `${performanceMetrics.goalCompletionRate}%`, icon: Target, color: 'from-teal-500 to-teal-600', bg: 'from-teal-50 to-teal-100' },
                ].map((metric) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-lg bg-gradient-to-br ${metric.bg} p-4`}
                    >
                        <div className={`bg-gradient-to-br ${metric.color} p-2 rounded-lg shadow-md w-fit`}>
                            <metric.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mt-2">{metric.label}</p>
                        <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Location Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Location Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="pb-3 font-medium text-gray-500">Location</th>
                                    <th className="pb-3 font-medium text-gray-500">Score</th>
                                    <th className="pb-3 font-medium text-gray-500">Members</th>
                                    <th className="pb-3 font-medium text-gray-500">Retention</th>
                                    <th className="pb-3 font-medium text-gray-500">Attendance</th>
                                    <th className="pb-3 font-medium text-gray-500">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locationPerformance.map((loc) => (
                                    <tr key={loc.name} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 font-medium">{loc.name}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{loc.score}%</span>
                                                <Progress value={loc.score} className="w-16 h-2" />
                                            </div>
                                        </td>
                                        <td className="py-3">{loc.members.toLocaleString()}</td>
                                        <td className="py-3">{loc.retention}%</td>
                                        <td className="py-3">{loc.attendance}%</td>
                                        <td className="py-3">
                                            {loc.trend === 'up' ? (
                                                <Badge className="bg-green-100 text-green-700"><ArrowUp className="w-3 h-3 mr-1" /> Up</Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-700"><ArrowDown className="w-3 h-3 mr-1" /> Down</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Staff Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-600" />
                            Top Staff Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {staffPerformance.map((staff) => (
                                <div key={staff.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{staff.name}</p>
                                        <p className="text-xs text-gray-500">{staff.role} • {staff.sessions > 0 ? `${staff.sessions} sessions` : 'Management'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">{staff.rating}/5.0</p>
                                        <p className="text-xs text-gray-500">{staff.retention}% retention</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Program Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                            Program Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {programPerformance.map((program) => (
                                <div key={program.name} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium text-gray-900">{program.name}</p>
                                        <Badge className="bg-blue-100 text-blue-700">{program.enrolled} enrolled</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Completion: {program.completion}%</span>
                                        <span>Rating: {program.satisfaction}/5</span>
                                        <span>${program.revenue.toLocaleString()}</span>
                                    </div>
                                    <Progress value={program.completion} className="mt-2 h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default PerformanceAnalyticsPage
