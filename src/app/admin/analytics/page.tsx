'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Calendar,
    MapPin,
    Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AnalyticsData {
    revenue: {
        current: number
        previous: number
        growth: number
    }
    students: {
        current: number
        previous: number
        growth: number
    }
    bookings: {
        current: number
        previous: number
        growth: number
    }
    satisfaction: {
        current: number
        previous: number
        growth: number
    }
}

const AnalyticsPage = () => {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setData({
                revenue: {
                    current: 125000,
                    previous: 112000,
                    growth: 11.6
                },
                students: {
                    current: 156,
                    previous: 142,
                    growth: 9.9
                },
                bookings: {
                    current: 342,
                    previous: 298,
                    growth: 14.8
                },
                satisfaction: {
                    current: 4.8,
                    previous: 4.6,
                    growth: 4.3
                }
            })
            setIsLoading(false)
        }, 1000)
    }, [timeRange])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatGrowth = (growth: number) => {
        const isPositive = growth >= 0
        return (
            <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(growth).toFixed(1)}%
            </span>
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-96 bg-gray-200 rounded"></div>
                        <div className="h-96 bg-gray-200 rounded"></div>
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
                    <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                    <p className="text-gray-600">Track performance and business metrics</p>
                </div>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    {['7d', '30d', '90d', '1y'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range as any)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${timeRange === range
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {range === '7d' ? '7 Days' :
                                range === '30d' ? '30 Days' :
                                    range === '90d' ? '90 Days' : '1 Year'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            {data && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(data.revenue.current)}</div>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">
                                        vs {formatCurrency(data.revenue.previous)} last period
                                    </p>
                                    {formatGrowth(data.revenue.growth)}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.students.current}</div>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">
                                        vs {data.students.previous} last period
                                    </p>
                                    {formatGrowth(data.students.growth)}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.bookings.current}</div>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">
                                        vs {data.bookings.previous} last period
                                    </p>
                                    {formatGrowth(data.bookings.growth)}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.satisfaction.current}/5.0</div>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">
                                        vs {data.satisfaction.previous}/5.0 last period
                                    </p>
                                    {formatGrowth(data.satisfaction.growth)}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Charts and Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">Revenue chart visualization</p>
                                <p className="text-sm text-gray-500">Chart component integration needed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Location Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: 'Cyberport', revenue: 72000, students: 89, utilization: 85 },
                                { name: 'Wan Chai', revenue: 53000, students: 67, utilization: 78 }
                            ].map((location) => (
                                <div key={location.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium">{location.name}</span>
                                        </div>
                                        <span className="text-sm text-gray-600">{location.utilization}% utilized</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Revenue: </span>
                                            <span className="font-medium">{formatCurrency(location.revenue)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Students: </span>
                                            <span className="font-medium">{location.students}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-red-600 h-2 rounded-full"
                                            style={{ width: `${location.utilization}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Program Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Program Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Beginner Gymnastics', students: 45, revenue: 31500, satisfaction: 4.9 },
                            { name: 'Intermediate Gymnastics', students: 38, revenue: 41800, satisfaction: 4.8 },
                            { name: 'Advanced Gymnastics', students: 22, revenue: 35200, satisfaction: 4.7 },
                        ].map((program) => (
                            <div key={program.name} className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium mb-3">{program.name}</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Students:</span>
                                        <span className="font-medium">{program.students}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Revenue:</span>
                                        <span className="font-medium">{formatCurrency(program.revenue)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Rating:</span>
                                        <span className="font-medium">{program.satisfaction}/5.0</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AnalyticsPage