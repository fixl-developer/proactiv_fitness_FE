'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, TrendingDown, Clock, Users, DollarSign,
    Calendar, AlertTriangle, CheckCircle, Filter, Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { responsiveClasses } from '@/lib/responsiveClasses'

const UtilizationPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPeriod, setSelectedPeriod] = useState('week')
    const [selectedLocation, setSelectedLocation] = useState('all')

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    // Mock utilization data
    const utilizationData = [
        {
            id: 1,
            coachName: 'Sarah Chen',
            location: 'Cyberport',
            currentHours: 32,
            maxHours: 40,
            utilization: 80,
            trend: 'up',
            trendValue: 5,
            classesThisWeek: 16,
            studentsPerClass: 5.6,
            revenue: 3200,
            efficiency: 92,
            status: 'optimal'
        },
        {
            id: 2,
            coachName: 'Monica Liu',
            location: 'Cyberport',
            currentHours: 28,
            maxHours: 35,
            utilization: 80,
            trend: 'stable',
            trendValue: 0,
            classesThisWeek: 14,
            studentsPerClass: 6.2,
            revenue: 2800,
            efficiency: 88,
            status: 'optimal'
        },
        {
            id: 3,
            coachName: 'Juan Rodriguez',
            location: 'Wan Chai',
            currentHours: 35,
            maxHours: 40,
            utilization: 87.5,
            trend: 'up',
            trendValue: 8,
            classesThisWeek: 18,
            studentsPerClass: 4.8,
            revenue: 3500,
            efficiency: 85,
            status: 'optimal'
        },
        {
            id: 4,
            coachName: 'Alex Kim',
            location: 'Sha Tin',
            currentHours: 0,
            maxHours: 30,
            utilization: 0,
            trend: 'down',
            trendValue: -100,
            classesThisWeek: 0,
            studentsPerClass: 0,
            revenue: 0,
            efficiency: 0,
            status: 'on_leave'
        },
        {
            id: 5,
            coachName: 'Lisa Zhang',
            location: 'Cyberport',
            currentHours: 38,
            maxHours: 40,
            utilization: 95,
            trend: 'up',
            trendValue: 12,
            classesThisWeek: 20,
            studentsPerClass: 7.1,
            revenue: 4200,
            efficiency: 96,
            status: 'overutilized'
        },
        {
            id: 6,
            coachName: 'David Wong',
            location: 'School Programs',
            currentHours: 25,
            maxHours: 30,
            utilization: 83.3,
            trend: 'stable',
            trendValue: 2,
            classesThisWeek: 10,
            studentsPerClass: 18.5,
            revenue: 2500,
            efficiency: 94,
            status: 'optimal'
        },
        {
            id: 7,
            coachName: 'Emma Wilson',
            location: 'Wan Chai',
            currentHours: 18,
            maxHours: 35,
            utilization: 51.4,
            trend: 'down',
            trendValue: -15,
            classesThisWeek: 9,
            studentsPerClass: 4.2,
            revenue: 1800,
            efficiency: 72,
            status: 'underutilized'
        }
    ]

    const locations = ['all', 'Cyberport', 'Wan Chai', 'Sha Tin', 'School Programs']
    const periods = ['week', 'month', 'quarter']

    const filteredData = utilizationData.filter(coach =>
        selectedLocation === 'all' || coach.location === selectedLocation
    )

    // Calculate summary metrics
    const totalCoaches = filteredData.length
    const activeCoaches = filteredData.filter(c => c.status !== 'on_leave').length
    const avgUtilization = filteredData.reduce((sum, c) => sum + c.utilization, 0) / totalCoaches
    const overutilizedCoaches = filteredData.filter(c => c.utilization > 90).length
    const underutilizedCoaches = filteredData.filter(c => c.utilization < 70 && c.status !== 'on_leave').length

    const getStatusColor = (status: string) => {
        const colors = {
            optimal: 'bg-green-100 text-green-700',
            overutilized: 'bg-red-100 text-red-700',
            underutilized: 'bg-yellow-100 text-yellow-700',
            on_leave: 'bg-gray-100 text-gray-700'
        }
        return colors[status as keyof typeof colors] || colors.optimal
    }

    const getUtilizationColor = (utilization: number) => {
        if (utilization >= 95) return 'text-red-600'
        if (utilization >= 85) return 'text-green-600'
        if (utilization >= 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getTrendIcon = (trend: string, value: number) => {
        if (trend === 'up' || value > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
        if (trend === 'down' || value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
        return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
    }

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                    <div className="animate-pulse space-y-4 sm:space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>)
    }

    return (
        <div className={responsiveClasses.pageContainer}>
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Coach Utilization</h1>
                        <p className="text-gray-600 mt-2">Monitor coach workload and optimize resource allocation</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export Report
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Period:</label>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {periods.map(period => (
                                        <option key={period} value={period}>
                                            {period.charAt(0).toUpperCase() + period.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Location:</label>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {locations.map(location => (
                                        <option key={location} value={location}>
                                            {location === 'all' ? 'All Locations' : location}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Coaches</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalCoaches}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Coaches</p>
                                    <p className="text-2xl font-bold text-gray-900">{activeCoaches}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                                    <p className="text-2xl font-bold text-gray-900">{avgUtilization.toFixed(1)}%</p>
                                </div>
                                <BarChart3 className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Overutilized</p>
                                    <p className="text-2xl font-bold text-gray-900">{overutilizedCoaches}</p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Underutilized</p>
                                    <p className="text-2xl font-bold text-gray-900">{underutilizedCoaches}</p>
                                </div>
                                <TrendingDown className="w-8 h-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Utilization Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Coach Utilization Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Coach</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Hours</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Utilization</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Classes</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Students</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Efficiency</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((coach, index) => (
                                        <motion.tr
                                            key={coach.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-900">{coach.coachName}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge variant="outline">{coach.location}</Badge>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm">
                                                    <span className="font-medium">{coach.currentHours}</span>
                                                    <span className="text-gray-500">/{coach.maxHours}h</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium ${getUtilizationColor(coach.utilization)}`}>
                                                            {coach.utilization.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <Progress value={coach.utilization} className="h-2 w-20" />
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-medium">{coach.classesThisWeek}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-medium">{coach.studentsPerClass.toFixed(1)}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-medium">HK${coach.revenue.toLocaleString()}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-medium">{coach.efficiency}%</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge className={getStatusColor(coach.status)}>
                                                    {coach.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-1">
                                                    {getTrendIcon(coach.trend, coach.trendValue)}
                                                    <span className={`text-sm font-medium ${coach.trendValue > 0 ? 'text-green-600' :
                                                        coach.trendValue < 0 ? 'text-red-600' : 'text-gray-600'
                                                        }`}>
                                                        {coach.trendValue > 0 ? '+' : ''}{coach.trendValue}%
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Optimization Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {overutilizedCoaches > 0 && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-red-900">Overutilized Coaches</h4>
                                            <p className="text-sm text-red-700 mt-1">
                                                {overutilizedCoaches} coach(es) are working over 90% capacity. Consider redistributing classes or hiring additional staff.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {underutilizedCoaches > 0 && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <TrendingDown className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-yellow-900">Underutilized Coaches</h4>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                {underutilizedCoaches} coach(es) are working under 70% capacity. Consider assigning more classes or cross-training.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-blue-900">Optimization Opportunities</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Average utilization is {avgUtilization.toFixed(1)}%. Target range is 75-85% for optimal performance.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>)
}

export default UtilizationPage
