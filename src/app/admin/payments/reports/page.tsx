'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign, TrendingUp, TrendingDown, Calendar, Download,
    Filter, BarChart3, PieChart, Users, CreditCard, RefreshCw,
    ArrowUp, ArrowDown, Eye, MapPin, Clock, Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const PaymentReportsPage = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
    const [selectedLocation, setSelectedLocation] = useState<string>('all')

    // Financial data
    const financialData = {
        totalRevenue: 245600,
        previousRevenue: 198400,
        totalTransactions: 1247,
        previousTransactions: 1089,
        averageTransaction: 197,
        previousAverage: 182,
        refundAmount: 12800,
        previousRefunds: 8900,
        outstandingAmount: 34500,
        previousOutstanding: 28900
    }

    // Revenue by location
    const revenueByLocation = [
        { location: 'Cyberport', revenue: 89400, transactions: 456, growth: 12.5, color: 'bg-blue-500' },
        { location: 'Wan Chai', revenue: 67800, transactions: 342, growth: 8.3, color: 'bg-green-500' },
        { location: 'Sha Tin', revenue: 54200, transactions: 278, growth: -2.1, color: 'bg-purple-500' },
        { location: 'Tsim Sha Tsui', revenue: 34200, transactions: 171, growth: 15.7, color: 'bg-orange-500' }
    ]

    // Revenue by program
    const revenueByProgram = [
        { program: 'GYMTOTS', revenue: 98400, percentage: 40.1, transactions: 492, color: 'bg-blue-500' },
        { program: 'Beginner Gymnastics', revenue: 73680, percentage: 30.0, transactions: 368, color: 'bg-green-500' },
        { program: 'Intermediate Gymnastics', revenue: 49120, percentage: 20.0, transactions: 246, color: 'bg-purple-500' },
        { program: 'Advanced Gymnastics', revenue: 24400, percentage: 9.9, transactions: 141, color: 'bg-orange-500' }
    ]

    // Payment methods breakdown
    const paymentMethods = [
        { method: 'Credit Card', amount: 147360, percentage: 60.0, transactions: 748, avgAmount: 197, color: 'bg-blue-500' },
        { method: 'PayPal', amount: 61400, percentage: 25.0, transactions: 312, avgAmount: 197, color: 'bg-yellow-500' },
        { method: 'Alipay HK', amount: 24560, percentage: 10.0, transactions: 125, avgAmount: 196, color: 'bg-green-500' },
        { method: 'Bank Transfer', amount: 12280, percentage: 5.0, transactions: 62, avgAmount: 198, color: 'bg-purple-500' }
    ]

    // Monthly trends (last 12 months)
    const monthlyTrends = [
        { month: 'Feb 2023', revenue: 156000, transactions: 780, refunds: 8900 },
        { month: 'Mar 2023', revenue: 167000, transactions: 835, refunds: 9200 },
        { month: 'Apr 2023', revenue: 178000, transactions: 890, refunds: 7800 },
        { month: 'May 2023', revenue: 189000, transactions: 945, refunds: 8500 },
        { month: 'Jun 2023', revenue: 201000, transactions: 1005, refunds: 9800 },
        { month: 'Jul 2023', revenue: 198000, transactions: 990, refunds: 11200 },
        { month: 'Aug 2023', revenue: 187000, transactions: 935, refunds: 8900 },
        { month: 'Sep 2023', revenue: 234000, transactions: 1170, refunds: 10500 },
        { month: 'Oct 2023', revenue: 245000, transactions: 1225, refunds: 9200 },
        { month: 'Nov 2023', revenue: 198400, transactions: 1089, refunds: 8900 },
        { month: 'Dec 2023', revenue: 223000, transactions: 1115, refunds: 12100 },
        { month: 'Jan 2024', revenue: 245600, transactions: 1247, refunds: 12800 }
    ]

    // Top customers by revenue
    const topCustomers = [
        { name: 'Mrs. Sarah Chen', revenue: 4800, transactions: 24, programs: ['GYMTOTS', 'Beginner'], location: 'Cyberport' },
        { name: 'Mr. David Wong', revenue: 3600, transactions: 18, programs: ['Beginner'], location: 'Wan Chai' },
        { name: 'Mrs. Lisa Li', revenue: 3200, transactions: 16, programs: ['Intermediate'], location: 'Sha Tin' },
        { name: 'Mr. James Kim', revenue: 2800, transactions: 14, programs: ['GYMTOTS'], location: 'Cyberport' },
        { name: 'Mrs. Amy Zhang', revenue: 2400, transactions: 12, programs: ['Beginner'], location: 'Cyberport' }
    ]

    const calculateGrowth = (current: number, previous: number) => {
        return ((current - previous) / previous * 100).toFixed(1)
    }

    const getGrowthColor = (growth: number) => {
        return growth >= 0 ? 'text-green-600' : 'text-red-600'
    }

    const getGrowthIcon = (growth: number) => {
        return growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
                    <p className="text-gray-600 mt-2">Comprehensive payment and revenue analytics</p>
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

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">HK${(financialData.totalRevenue / 1000).toFixed(0)}K</div>
                        <div className={`flex items-center text-sm font-medium ${getGrowthColor(parseFloat(calculateGrowth(financialData.totalRevenue, financialData.previousRevenue)))}`}>
                            {getGrowthIcon(parseFloat(calculateGrowth(financialData.totalRevenue, financialData.previousRevenue)))}
                            <span className="ml-1">{calculateGrowth(financialData.totalRevenue, financialData.previousRevenue)}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
                        <CreditCard className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{financialData.totalTransactions.toLocaleString()}</div>
                        <div className={`flex items-center text-sm font-medium ${getGrowthColor(parseFloat(calculateGrowth(financialData.totalTransactions, financialData.previousTransactions)))}`}>
                            {getGrowthIcon(parseFloat(calculateGrowth(financialData.totalTransactions, financialData.previousTransactions)))}
                            <span className="ml-1">{calculateGrowth(financialData.totalTransactions, financialData.previousTransactions)}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg Transaction</CardTitle>
                        <Target className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">HK${financialData.averageTransaction}</div>
                        <div className={`flex items-center text-sm font-medium ${getGrowthColor(parseFloat(calculateGrowth(financialData.averageTransaction, financialData.previousAverage)))}`}>
                            {getGrowthIcon(parseFloat(calculateGrowth(financialData.averageTransaction, financialData.previousAverage)))}
                            <span className="ml-1">{calculateGrowth(financialData.averageTransaction, financialData.previousAverage)}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Refunds</CardTitle>
                        <RefreshCw className="h-5 w-5 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">HK${(financialData.refundAmount / 1000).toFixed(0)}K</div>
                        <div className={`flex items-center text-sm font-medium ${getGrowthColor(parseFloat(calculateGrowth(financialData.refundAmount, financialData.previousRefunds)))}`}>
                            {getGrowthIcon(parseFloat(calculateGrowth(financialData.refundAmount, financialData.previousRefunds)))}
                            <span className="ml-1">{calculateGrowth(financialData.refundAmount, financialData.previousRefunds)}%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Outstanding</CardTitle>
                        <Clock className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">HK${(financialData.outstandingAmount / 1000).toFixed(0)}K</div>
                        <div className={`flex items-center text-sm font-medium ${getGrowthColor(parseFloat(calculateGrowth(financialData.outstandingAmount, financialData.previousOutstanding)))}`}>
                            {getGrowthIcon(parseFloat(calculateGrowth(financialData.outstandingAmount, financialData.previousOutstanding)))}
                            <span className="ml-1">{calculateGrowth(financialData.outstandingAmount, financialData.previousOutstanding)}%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Location */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Revenue by Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {revenueByLocation.map((location, index) => (
                                <motion.div
                                    key={location.location}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full ${location.color}`}></div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{location.location}</h4>
                                            <p className="text-sm text-gray-600">{location.transactions} transactions</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">HK${(location.revenue / 1000).toFixed(0)}K</div>
                                        <div className={`text-sm font-medium ${getGrowthColor(location.growth)}`}>
                                            {location.growth >= 0 ? '+' : ''}{location.growth}%
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue by Program */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-green-600" />
                            Revenue by Program
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {revenueByProgram.map((program, index) => (
                                <motion.div
                                    key={program.program}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-900">{program.program}</span>
                                        <span className="font-bold">HK${(program.revenue / 1000).toFixed(0)}K</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Progress value={program.percentage} className="flex-1 h-2" />
                                        <span className="text-sm text-gray-600 w-12">{program.percentage}%</span>
                                    </div>
                                    <div className="text-sm text-gray-600">{program.transactions} transactions</div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Methods & Top Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                            Payment Methods
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {paymentMethods.map((method, index) => (
                                <motion.div
                                    key={method.method}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full ${method.color}`}></div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{method.method}</h4>
                                            <p className="text-sm text-gray-600">{method.transactions} transactions</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">HK${(method.amount / 1000).toFixed(0)}K</div>
                                        <div className="text-sm text-gray-600">{method.percentage}%</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Customers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-orange-600" />
                            Top Customers
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
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {customer.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{customer.name}</h4>
                                            <p className="text-sm text-gray-600">{customer.location} • {customer.transactions} transactions</p>
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
            </div>

            {/* Monthly Trends Chart Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Revenue Trends (Last 12 Months)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Revenue trends chart will be displayed here</p>
                            <p className="text-sm text-gray-400">Integration with charting library required</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>)
}

export default PaymentReportsPage