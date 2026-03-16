'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, Target, Users, Clock, Star,
    Award, Activity, CheckCircle, AlertTriangle, ArrowUp,
    ArrowDown, Filter, Download, Eye, Calendar, MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const PerformanceMetricsPage = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
    const [selectedCategory, setSelectedCategory] = useState<'overall' | 'locations' | 'programs' | 'staff'>('overall')

    // Overall performance metrics
    const overallMetrics = {
        customerSatisfaction: 4.7,
        retentionRate: 89.3,
        attendanceRate: 87.5,
        conversionRate: 6.2,
        revenueGrowth: 11.7,
        staffUtilization: 82.4,
        classCapacityUtilization: 78.9,
        averageClassSize: 7.2
    }

    // Performance by location
    const locationPerformance = [
        {
            location: 'Cyberport',
            metrics: {
                satisfaction: 4.8,
                retention: 92.1,
                attendance: 89.2,
                conversion: 7.6,
                revenue: 894000,
                growth: 18.3,
                utilization: 85.2,
                capacity: 82.1
            },
            ranking: 1,
            strengths: ['High conversion', 'Excellent satisfaction', 'Strong retention'],
            improvements: ['Increase class capacity']
        },
        {
            location: 'Wan Chai',
            metrics: {
                satisfaction: 4.6,
                retention: 88.7,
                attendance: 86.8,
                conversion: 7.0,
                revenue: 678000,
                growth: 8.8,
                utilization: 81.3,
                capacity: 77.5
            },
            ranking: 2,
            strengths: ['Consistent performance', 'Good attendance'],
            improvements: ['Improve satisfaction scores', 'Boost retention']
        },
        {
            location: 'Sha Tin',
            metrics: {
                satisfaction: 4.7,
                retention: 87.9,
                attendance: 88.1,
                conversion: 5.4,
                revenue: 542000,
                growth: 8.8,
                utilization: 79.8,
                capacity: 75.3
            },
            ranking: 3,
            strengths: ['High satisfaction', 'Good attendance'],
            improvements: ['Increase conversion rate', 'Optimize capacity']
        },
        {
            location: 'Tsim Sha Tsui',
            metrics: {
                satisfaction: 4.5,
                retention: 84.2,
                attendance: 85.7,
                conversion: 2.9,
                revenue: 342000,
                growth: 6.5,
                utilization: 76.1,
                capacity: 71.8
            },
            ranking: 4,
            strengths: ['Stable operations'],
            improvements: ['Major conversion improvement needed', 'Enhance satisfaction', 'Increase retention']
        }
    ]

    // Performance by program
    const programPerformance = [
        {
            program: 'GYMTOTS (3-4 years)',
            metrics: {
                satisfaction: 4.9,
                retention: 94.2,
                attendance: 91.3,
                enrollment: 342,
                revenue: 983000,
                growth: 15.2,
                capacity: 85.7,
                waitlist: 45
            },
            performance: 'excellent'
        },
        {
            program: 'Beginner Gymnastics (5-7 years)',
            metrics: {
                satisfaction: 4.7,
                retention: 88.9,
                attendance: 87.2,
                enrollment: 245,
                revenue: 736000,
                growth: 12.8,
                capacity: 78.3,
                waitlist: 23
            },
            performance: 'good'
        },
        {
            program: 'Intermediate Gymnastics (8-10 years)',
            metrics: {
                satisfaction: 4.6,
                retention: 85.4,
                attendance: 84.7,
                enrollment: 112,
                revenue: 490000,
                growth: 8.9,
                capacity: 74.2,
                waitlist: 8
            },
            performance: 'average'
        },
        {
            program: 'Advanced Gymnastics (11+ years)',
            metrics: {
                satisfaction: 4.8,
                retention: 91.7,
                attendance: 89.6,
                enrollment: 48,
                revenue: 247000,
                growth: 22.1,
                capacity: 80.0,
                waitlist: 12
            },
            performance: 'excellent'
        }
    ]

    // Staff performance summary
    const staffPerformance = {
        totalStaff: 24,
        topPerformers: 6,
        averageRating: 4.6,
        utilizationRate: 82.4,
        retentionRate: 95.8,
        trainingCompliance: 98.3,
        performanceDistribution: {
            excellent: 25,
            good: 50,
            average: 20,
            needsImprovement: 5
        }
    }

    // Key performance indicators trends
    const kpiTrends = [
        {
            metric: 'Customer Satisfaction',
            current: 4.7,
            previous: 4.5,
            target: 4.8,
            trend: 'up',
            status: 'on-track'
        },
        {
            metric: 'Retention Rate',
            current: 89.3,
            previous: 87.1,
            target: 90.0,
            trend: 'up',
            status: 'on-track'
        },
        {
            metric: 'Attendance Rate',
            current: 87.5,
            previous: 86.2,
            target: 90.0,
            trend: 'up',
            status: 'behind'
        },
        {
            metric: 'Conversion Rate',
            current: 6.2,
            previous: 5.8,
            target: 7.0,
            trend: 'up',
            status: 'behind'
        },
        {
            metric: 'Revenue Growth',
            current: 11.7,
            previous: 8.9,
            target: 12.0,
            trend: 'up',
            status: 'on-track'
        },
        {
            metric: 'Staff Utilization',
            current: 82.4,
            previous: 79.8,
            target: 85.0,
            trend: 'up',
            status: 'on-track'
        }
    ]

    const getPerformanceColor = (performance: string) => {
        const colors = {
            excellent: 'text-green-600 bg-green-50',
            good: 'text-blue-600 bg-blue-50',
            average: 'text-yellow-600 bg-yellow-50',
            poor: 'text-red-600 bg-red-50'
        }
        return colors[performance as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const getStatusColor = (status: string) => {
        const colors = {
            'on-track': 'text-green-600 bg-green-50',
            'behind': 'text-red-600 bg-red-50',
            'ahead': 'text-blue-600 bg-blue-50'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const getTrendIcon = (trend: string) => {
        return trend === 'up' ? <ArrowUp className="w-4 h-4 text-green-600" /> : <ArrowDown className="w-4 h-4 text-red-600" />
    }

    const getRankingColor = (ranking: number) => {
        if (ranking === 1) return 'text-yellow-600 bg-yellow-50'
        if (ranking === 2) return 'text-gray-600 bg-gray-50'
        if (ranking === 3) return 'text-orange-600 bg-orange-50'
        return 'text-red-600 bg-red-50'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Performance Metrics</h1>
                    <p className="text-gray-600 mt-2">Comprehensive performance analytics across all business areas</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {['week', 'month', 'quarter', 'year'].map((period) => (
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
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Overall Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Customer Satisfaction</CardTitle>
                        <Star className="h-5 w-5 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{overallMetrics.customerSatisfaction}/5.0</div>
                        <div className="flex items-center text-sm font-medium text-green-600">
                            <ArrowUp className="w-4 h-4 mr-1" />
                            +0.2 vs last month
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Retention Rate</CardTitle>
                        <Users className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{overallMetrics.retentionRate}%</div>
                        <div className="flex items-center text-sm font-medium text-green-600">
                            <ArrowUp className="w-4 h-4 mr-1" />
                            +2.2% improvement
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{overallMetrics.attendanceRate}%</div>
                        <div className="flex items-center text-sm font-medium text-green-600">
                            <ArrowUp className="w-4 h-4 mr-1" />
                            +1.3% increase
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Staff Utilization</CardTitle>
                        <Activity className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{overallMetrics.staffUtilization}%</div>
                        <div className="flex items-center text-sm font-medium text-green-600">
                            <ArrowUp className="w-4 h-4 mr-1" />
                            +2.6% efficiency
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* KPI Trends */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Key Performance Indicators
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {kpiTrends.map((kpi, index) => (
                            <motion.div
                                key={kpi.metric}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900">{kpi.metric}</h4>
                                    <Badge className={getStatusColor(kpi.status)}>
                                        {kpi.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {kpi.metric.includes('Rate') || kpi.metric.includes('Growth') || kpi.metric.includes('Utilization')
                                            ? `${kpi.current}%`
                                            : kpi.current}
                                    </div>
                                    <div className="flex items-center">
                                        {getTrendIcon(kpi.trend)}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Target:</span>
                                        <span className="font-medium">
                                            {kpi.metric.includes('Rate') || kpi.metric.includes('Growth') || kpi.metric.includes('Utilization')
                                                ? `${kpi.target}%`
                                                : kpi.target}
                                        </span>
                                    </div>
                                    <Progress
                                        value={(kpi.current / kpi.target) * 100}
                                        className="h-2"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Location Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        Performance by Location
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {locationPerformance.map((location, index) => (
                            <motion.div
                                key={location.location}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Badge className={getRankingColor(location.ranking)}>
                                            #{location.ranking}
                                        </Badge>
                                        <h4 className="font-semibold text-gray-900">{location.location}</h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">
                                            HK${(location.metrics.revenue / 1000).toFixed(0)}K
                                        </div>
                                        <div className="text-sm text-green-600">+{location.metrics.growth}%</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="text-center p-2 bg-white rounded">
                                        <div className="text-sm text-gray-600">Satisfaction</div>
                                        <div className="text-lg font-bold text-yellow-600">{location.metrics.satisfaction}/5</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                        <div className="text-sm text-gray-600">Retention</div>
                                        <div className="text-lg font-bold text-blue-600">{location.metrics.retention}%</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                        <div className="text-sm text-gray-600">Attendance</div>
                                        <div className="text-lg font-bold text-green-600">{location.metrics.attendance}%</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                        <div className="text-sm text-gray-600">Conversion</div>
                                        <div className="text-lg font-bold text-purple-600">{location.metrics.conversion}%</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="font-medium text-green-900 mb-2">Strengths</h5>
                                        <div className="space-y-1">
                                            {location.strengths.map((strength, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm text-gray-700">{strength}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-orange-900 mb-2">Areas for Improvement</h5>
                                        <div className="space-y-1">
                                            {location.improvements.map((improvement, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                                                    <span className="text-sm text-gray-700">{improvement}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Program Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Performance by Program
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {programPerformance.map((program, index) => (
                            <motion.div
                                key={program.program}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900">{program.program}</h4>
                                    <Badge className={getPerformanceColor(program.performance)}>
                                        {program.performance}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <div className="text-sm text-gray-600">Satisfaction</div>
                                        <div className="text-lg font-bold text-yellow-600">{program.metrics.satisfaction}/5</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Retention</div>
                                        <div className="text-lg font-bold text-blue-600">{program.metrics.retention}%</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Enrollment</div>
                                        <div className="text-lg font-bold text-green-600">{program.metrics.enrollment}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Capacity</div>
                                        <div className="text-lg font-bold text-purple-600">{program.metrics.capacity}%</div>
                                    </div>
                                </div>

                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Revenue: HK${(program.metrics.revenue / 1000).toFixed(0)}K</span>
                                    <span>Growth: +{program.metrics.growth}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Staff Performance Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-600" />
                        Staff Performance Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{staffPerformance.totalStaff}</div>
                            <div className="text-sm text-gray-600">Total Staff</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{staffPerformance.topPerformers}</div>
                            <div className="text-sm text-gray-600">Top Performers</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{staffPerformance.averageRating}/5</div>
                            <div className="text-sm text-gray-600">Avg Rating</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{staffPerformance.utilizationRate}%</div>
                            <div className="text-sm text-gray-600">Utilization</div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-3">Performance Distribution</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(staffPerformance.performanceDistribution).map(([level, percentage]) => (
                                <div key={level} className="text-center">
                                    <div className="text-lg font-bold text-gray-900">{percentage}%</div>
                                    <div className="text-sm text-gray-600 capitalize">{level.replace(/([A-Z])/g, ' $1')}</div>
                                    <Progress value={percentage} className="mt-1 h-2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>)
}

export default PerformanceMetricsPage
