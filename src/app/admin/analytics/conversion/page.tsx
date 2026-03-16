'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, TrendingDown, Users, Target, Phone, Mail,
    Calendar, MapPin, Filter, Download, Eye, ArrowUp, ArrowDown,
    CheckCircle, XCircle, Clock, AlertTriangle, BarChart3, PieChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const ConversionReportsPage = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')

    // Conversion funnel data
    const conversionFunnel = [
        { stage: 'Website Visitors', count: 12450, percentage: 100, color: 'bg-blue-500' },
        { stage: 'Inquiry Submitted', count: 3735, percentage: 30.0, color: 'bg-green-500' },
        { stage: 'Assessment Booked', count: 2241, percentage: 18.0, color: 'bg-yellow-500' },
        { stage: 'Assessment Completed', count: 1869, percentage: 15.0, color: 'bg-orange-500' },
        { stage: 'Trial Class Booked', count: 1245, percentage: 10.0, color: 'bg-purple-500' },
        { stage: 'Trial Completed', count: 1058, percentage: 8.5, color: 'bg-pink-500' },
        { stage: 'Enrolled', count: 747, percentage: 6.0, color: 'bg-red-500' }
    ]

    // Conversion by location
    const locationConversion = [
        {
            location: 'Cyberport',
            visitors: 3890,
            inquiries: 1167,
            assessments: 700,
            trials: 420,
            enrollments: 294,
            conversionRate: 7.6,
            trend: '+0.8%'
        },
        {
            location: 'Wan Chai',
            visitors: 3245,
            inquiries: 974,
            assessments: 584,
            trials: 351,
            enrollments: 227,
            conversionRate: 7.0,
            trend: '+0.3%'
        },
        {
            location: 'Sha Tin',
            visitors: 2890,
            inquiries: 867,
            assessments: 520,
            trials: 312,
            enrollments: 156,
            conversionRate: 5.4,
            trend: '-0.2%'
        },
        {
            location: 'Tsim Sha Tsui',
            visitors: 2425,
            inquiries: 727,
            assessments: 437,
            trials: 162,
            enrollments: 70,
            conversionRate: 2.9,
            trend: '-0.5%'
        }
    ]

    // Conversion by program
    const programConversion = [
        {
            program: 'GYMTOTS (3-4 years)',
            inquiries: 1456,
            assessments: 1165,
            trials: 932,
            enrollments: 342,
            conversionRate: 23.5,
            assessmentRate: 80.0,
            trialRate: 80.0,
            enrollmentRate: 36.7
        },
        {
            program: 'Beginner Gymnastics (5-7 years)',
            inquiries: 1234,
            assessments: 926,
            trials: 648,
            enrollments: 245,
            conversionRate: 19.9,
            assessmentRate: 75.0,
            trialRate: 70.0,
            enrollmentRate: 37.8
        },
        {
            program: 'Intermediate Gymnastics (8-10 years)',
            inquiries: 789,
            assessments: 552,
            trials: 331,
            enrollments: 112,
            conversionRate: 14.2,
            assessmentRate: 70.0,
            trialRate: 60.0,
            enrollmentRate: 33.8
        },
        {
            program: 'Advanced Gymnastics (11+ years)',
            inquiries: 256,
            assessments: 128,
            trials: 64,
            enrollments: 48,
            conversionRate: 18.8,
            assessmentRate: 50.0,
            trialRate: 50.0,
            enrollmentRate: 75.0
        }
    ]

    // Drop-off analysis
    const dropOffReasons = [
        { reason: 'Pricing Concerns', count: 234, percentage: 28.5 },
        { reason: 'Schedule Conflicts', count: 189, percentage: 23.0 },
        { reason: 'Location Distance', count: 156, percentage: 19.0 },
        { reason: 'Child Not Ready', count: 123, percentage: 15.0 },
        { reason: 'Found Alternative', count: 89, percentage: 10.8 },
        { reason: 'Other', count: 31, percentage: 3.7 }
    ]

    // Monthly trends
    const monthlyTrends = [
        { month: 'Aug 2023', visitors: 9800, enrollments: 580, rate: 5.9 },
        { month: 'Sep 2023', visitors: 11200, enrollments: 728, rate: 6.5 },
        { month: 'Oct 2023', visitors: 10800, visitors: 10800, enrollments: 702, rate: 6.5 },
        { month: 'Nov 2023', visitors: 9600, enrollments: 576, rate: 6.0 },
        { month: 'Dec 2023', visitors: 8900, enrollments: 534, rate: 6.0 },
        { month: 'Jan 2024', visitors: 12450, enrollments: 747, rate: 6.0 }
    ]

    // Conversion statistics
    const conversionStats = {
        overallRate: 6.0,
        previousRate: 5.7,
        bestPerforming: 'Cyberport',
        worstPerforming: 'Tsim Sha Tsui',
        avgTimeToConvert: 14, // days
        totalEnrollments: 747,
        totalRevenue: 1494000 // HKD
    }

    const getConversionColor = (rate: number) => {
        if (rate >= 7) return 'text-green-600'
        if (rate >= 5) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getTrendColor = (trend: string) => {
        return trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
    }

    const getTrendIcon = (trend: string) => {
        return trend.startsWith('+') ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Conversion Reports</h1>
                    <p className="text-gray-600 mt-2">Analyze customer journey and conversion performance</p>
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

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Overall Conversion</CardTitle>
                        <Target className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{conversionStats.overallRate}%</div>
                        <div className="flex items-center text-sm font-medium text-green-600">
                            <ArrowUp className="w-4 h-4 mr-1" />
                            +{((conversionStats.overallRate - conversionStats.previousRate) / conversionStats.previousRate * 100).toFixed(1)}%
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Enrollments</CardTitle>
                        <Users className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{conversionStats.totalEnrollments}</div>
                        <div className="text-sm text-green-600 font-medium">This month</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Revenue Generated</CardTitle>
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">HK${(conversionStats.totalRevenue / 1000000).toFixed(1)}M</div>
                        <div className="text-sm text-purple-600 font-medium">From conversions</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg Time to Convert</CardTitle>
                        <Clock className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{conversionStats.avgTimeToConvert}</div>
                        <div className="text-sm text-orange-600 font-medium">days</div>
                    </CardContent>
                </Card>
            </div>

            {/* Conversion Funnel */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Conversion Funnel
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {conversionFunnel.map((stage, index) => (
                            <motion.div
                                key={stage.stage}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4"
                            >
                                <div className="w-32 text-sm font-medium text-gray-900">{stage.stage}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-600">{stage.count.toLocaleString()}</span>
                                        <span className="text-sm font-medium">{stage.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${stage.color}`}
                                            style={{ width: `${stage.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {index < conversionFunnel.length - 1 && (
                                    <div className="text-sm text-gray-500">
                                        {((conversionFunnel[index + 1].count / stage.count) * 100).toFixed(1)}%
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Location & Program Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location Conversion */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-green-600" />
                            Conversion by Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {locationConversion.map((location, index) => (
                                <motion.div
                                    key={location.location}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-gray-900">{location.location}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${getConversionColor(location.conversionRate)}`}>
                                                {location.conversionRate}%
                                            </span>
                                            <div className={`flex items-center text-sm ${getTrendColor(location.trend)}`}>
                                                {getTrendIcon(location.trend)}
                                                <span className="ml-1">{location.trend}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Visitors:</span>
                                            <span className="ml-2 font-medium">{location.visitors.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Inquiries:</span>
                                            <span className="ml-2 font-medium">{location.inquiries.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Assessments:</span>
                                            <span className="ml-2 font-medium">{location.assessments.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Enrollments:</span>
                                            <span className="ml-2 font-medium">{location.enrollments.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Program Conversion */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            Conversion by Program
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {programConversion.map((program, index) => (
                                <motion.div
                                    key={program.program}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-gray-900">{program.program}</h4>
                                        <span className={`font-bold ${getConversionColor(program.conversionRate)}`}>
                                            {program.conversionRate}%
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Assessment Rate:</span>
                                            <span className="font-medium">{program.assessmentRate}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Trial Rate:</span>
                                            <span className="font-medium">{program.trialRate}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Enrollment Rate:</span>
                                            <span className="font-medium">{program.enrollmentRate}%</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Drop-off Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-red-600" />
                        Drop-off Reasons Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dropOffReasons.map((reason, index) => (
                            <motion.div
                                key={reason.reason}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-gray-50 rounded-lg text-center"
                            >
                                <h4 className="font-medium text-gray-900 mb-2">{reason.reason}</h4>
                                <div className="text-2xl font-bold text-red-600 mb-1">{reason.count}</div>
                                <div className="text-sm text-gray-600">{reason.percentage}%</div>
                                <Progress value={reason.percentage} className="mt-2 h-2" />
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>)
}

export default ConversionReportsPage
