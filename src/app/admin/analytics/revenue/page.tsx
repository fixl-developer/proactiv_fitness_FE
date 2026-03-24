'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart,
    Calendar, MapPin, Users, CreditCard, ArrowUp, ArrowDown,
    Filter, Download, Eye, Target, Clock, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const RevenueAnalysisPage = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
    const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'growth' | 'profit'>('revenue')

    // Revenue data
    const revenueData = {
        totalRevenue: 2456000,
        previousRevenue: 2198000,
        monthlyGrowth: 11.7,
        yearlyGrowth: 23.4,
        averageRevenuePerCustomer: 3280,
        totalCustomers: 749,
        revenuePerLocation: 614000,
        profitMargin: 34.2
    }

    // Revenue by location
    const locationRevenue = [
        {
            location: 'Cyberport',
            revenue: 894000,
            previousRevenue: 756000,
            growth: 18.3,
            customers: 289,
            avgRevenue: 3094,
            programs: {
                'GYMTOTS': 358000,
                'Beginner': 268000,
                'Intermediate': 179000,
                'Advanced': 89000
            }
        },
        {
            location: 'Wan Chai',
            revenue: 678000,
            previousRevenue: 623000,
            growth: 8.8,
            customers: 234,
            avgRevenue: 2897,
            programs: {
                'GYMTOTS': 271000,
                'Beginner': 203000,
                'Intermediate': 135000,
                'Advanced': 69000
            }
        },
        {
            location: 'Sha Tin',
            revenue: 542000,
            previousRevenue: 498000,
            growth: 8.8,
            customers: 156,
            avgRevenue: 3474,
            programs: {
                'GYMTOTS': 217000,
                'Beginner': 162000,
                'Intermediate': 108000,
                'Advanced': 55000
            }
        },
        {
            location: 'Tsim Sha Tsui',
            revenue: 342000,
            previousRevenue: 321000,
            growth: 6.5,
            customers: 70,
            avgRevenue: 4886,
            programs: {
                'GYMTOTS': 137000,
                'Beginner': 103000,
                'Intermediate': 68000,
                'Advanced': 34000
            }
        }
    ]

    // Revenue by program
    const programRevenue = [
        {
            program: 'GYMTOTS (3-4 years)',
            revenue: 983000,
            percentage: 40.0,
            customers: 342,
            avgPrice: 2875,
            growth: 15.2,
            sessions: 2736
        },
        {
            program: 'Beginner Gymnastics (5-7 years)',
            revenue: 736000,
            percentage: 30.0,
            customers: 245,
            avgPrice: 3004,
            growth: 12.8,
            sessions: 1960
        },
        {
            program: 'Intermediate Gymnastics (8-10 years)',
            revenue: 490000,
            percentage: 20.0,
            customers: 112,
            avgPrice: 4375,
            growth: 8.9,
            sessions: 1120
        },
        {
            program: 'Advanced Gymnastics (11+ years)',
            revenue: 247000,
            percentage: 10.0,
            customers: 48,
            avgPrice: 5146,
            growth: 22.1,
            sessions: 480
        }
    ]

    // Monthly revenue trends
    const monthlyTrends = [
        { month: 'Jul 2023', revenue: 1980000, customers: 623, avgRevenue: 3178 },
        { month: 'Aug 2023', revenue: 2100000, customers: 656, avgRevenue: 3201 },
        { month: 'Sep 2023', revenue: 2340000, customers: 734, avgRevenue: 3189 },
        { month: 'Oct 2023', revenue: 2450000, customers: 768, avgRevenue: 3190 },
        { month: 'Nov 2023', revenue: 2198000, customers: 689, avgRevenue: 3190 },
        { month: 'Dec 2023', revenue: 2234000, customers: 701, avgRevenue: 3187 },
        { month: 'Jan 2024', revenue: 2456000, customers: 749, avgRevenue: 3280 }
    ]

    // Revenue breakdown by payment method
    const paymentMethodRevenue = [
        { method: 'Credit Card', revenue: 1473600, percentage: 60.0, transactions: 1498 },
        { method: 'PayPal', revenue: 614000, percentage: 25.0, transactions: 374 },
        { method: 'Alipay HK', revenue: 245600, percentage: 10.0, transactions: 187 },
        { method: 'Bank Transfer', revenue: 122800, percentage: 5.0, transactions: 62 }
    ]

    // Top revenue customers
    const topCustomers = [
        { name: 'Mrs. Sarah Chen', revenue: 14400, programs: ['GYMTOTS', 'Beginner'], location: 'Cyberport', months: 6 },
        { name: 'Mr. David Wong', revenue: 12600, programs: ['Beginner', 'Intermediate'], location: 'Wan Chai', months: 8 },
        { name: 'Mrs. Lisa Li', revenue: 11800, programs: ['Intermediate', 'Advanced'], location: 'Sha Tin', months: 7 },
        { name: 'Mr. James Kim', revenue: 9600, programs: ['GYMTOTS'], location: 'Cyberport', months: 4 },
        { name: 'Mrs. Amy Zhang', revenue: 8400, programs: ['Beginner'], location: 'Cyberport', months: 5 }
    ]

    // Revenue forecasting
    const revenueForecast = {
        nextMonth: 2580000,
        nextQuarter: 7740000,
        confidence: 87.5,
        factors: [
            'Seasonal enrollment increase',
            'New program launches',
            'Location expansion impact'
        ]
    }

    const getGrowthColor = (growth: number) => {
        return growth >= 0 ? 'text-green-600' : 'text-red-600'
    }

    const getGrowthIcon = (growth: number) => {
        return growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
    }

    const formatCurrency = (amount: number) => {
        return `HK$${(amount / 1000).toFixed(0)}K`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Revenue Analysis</h1>
                    <p className="text-gray-600 mt-2">Comprehensive revenue analytics and financial insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {['week', 'month', 'quarter', 'year'].map((period) => (
                            <button id={`admin-analytics-revenue-period-${period}-btn`}
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
                    <Button id="admin-analytics-revenue-export-btn" variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Key Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.totalRevenue)}</div>
                        <div className={`flex items-center text-sm font-medium ${getGrowthColor(revenueData.monthlyGrowth)}`}>
                            {getGrowthIcon(revenueData.monthlyGrowth)}
                            <span className="ml-1">+{revenueData.monthlyGrowth}% vs last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg Revenue/Customer</CardTitle>
                        <Users className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">HK${revenueData.averageRevenuePerCustomer.toLocaleString()}</div>
                        <div className="text-sm text-blue-600 font-medium">{revenueData.totalCustomers} customers</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Yearly Growth</CardTitle>
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">+{revenueData.yearlyGrowth}%</div>
                        <div className="text-sm text-purple-600 font-medium">Year over year</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Profit Margin</CardTitle>
                        <Target className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{revenueData.profitMargin}%</div>
                        <div className="text-sm text-orange-600 font-medium">Above industry avg</div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue by Location */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Revenue by Location
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {locationRevenue.map((location, index) => (
                            <motion.div
                                key={location.location}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{location.location}</h4>
                                        <p className="text-sm text-gray-600">{location.customers} customers</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-gray-900">{formatCurrency(location.revenue)}</div>
                                        <div className={`flex items-center text-sm font-medium ${getGrowthColor(location.growth)}`}>
                                            {getGrowthIcon(location.growth)}
                                            <span className="ml-1">+{location.growth}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {Object.entries(location.programs).map(([program, revenue]) => (
                                        <div key={program} className="text-center p-2 bg-white rounded">
                                            <div className="text-sm font-medium text-gray-900">{program}</div>
                                            <div className="text-lg font-bold text-blue-600">{formatCurrency(revenue as number)}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Avg Revenue per Customer: HK${location.avgRevenue.toLocaleString()}</span>
                                    <span>Growth: {location.growth >= 0 ? '+' : ''}{location.growth}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Revenue by Program & Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Program Revenue */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                            Revenue by Program
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {programRevenue.map((program, index) => (
                                <motion.div
                                    key={program.program}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">{program.program}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{formatCurrency(program.revenue)}</span>
                                            <div className={`flex items-center text-sm ${getGrowthColor(program.growth)}`}>
                                                {getGrowthIcon(program.growth)}
                                                <span className="ml-1">{program.growth}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={program.percentage} className="flex-1 h-2" />
                                        <span className="text-sm text-gray-600 w-12">{program.percentage}%</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                                        <span>{program.customers} customers</span>
                                        <span>HK${program.avgPrice} avg</span>
                                        <span>{program.sessions} sessions</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Method Revenue */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                            Revenue by Payment Method
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {paymentMethodRevenue.map((method, index) => (
                                <motion.div
                                    key={method.method}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-900">{method.method}</h4>
                                        <p className="text-sm text-gray-600">{method.transactions} transactions</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">{formatCurrency(method.revenue)}</div>
                                        <div className="text-sm text-gray-600">{method.percentage}%</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Customers & Revenue Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Revenue Customers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-600" />
                            Top Revenue Customers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topCustomers.map((customer, index) => (
                                <motion.div
                                    key={customer.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {customer.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{customer.name}</h4>
                                            <p className="text-sm text-gray-600">{customer.location} • {customer.months} months</p>
                                            <div className="flex gap-1 mt-1">
                                                {customer.programs.map((program, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {program}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">HK${customer.revenue.toLocaleString()}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Forecast */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Revenue Forecast
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Next Month Projection</h4>
                                <div className="text-2xl font-bold text-blue-600">{formatCurrency(revenueForecast.nextMonth)}</div>
                                <div className="text-sm text-blue-700">
                                    +{((revenueForecast.nextMonth - revenueData.totalRevenue) / revenueData.totalRevenue * 100).toFixed(1)}% growth expected
                                </div>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">Next Quarter Projection</h4>
                                <div className="text-2xl font-bold text-green-600">{formatCurrency(revenueForecast.nextQuarter)}</div>
                                <div className="text-sm text-green-700">
                                    {revenueForecast.confidence}% confidence level
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Key Growth Factors</h4>
                                <div className="space-y-2">
                                    {revenueForecast.factors.map((factor, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-gray-700">{factor}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>)
}

export default RevenueAnalysisPage
