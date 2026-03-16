'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign, TrendingUp, TrendingDown, Calendar, Download,
    BarChart3, LineChart as LineChartIcon, PieChart, Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function FranchiseRevenueePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 1000)
    }, [])

    // Revenue data
    const revenueData = [
        { month: 'January', revenue: 45000, target: 50000, expenses: 28000 },
        { month: 'February', revenue: 48000, target: 50000, expenses: 29000 },
        { month: 'March', revenue: 52000, target: 50000, expenses: 30000 },
        { month: 'April', revenue: 55000, target: 55000, expenses: 31000 },
        { month: 'May', revenue: 58000, target: 55000, expenses: 32000 },
        { month: 'June', revenue: 62000, target: 60000, expenses: 33000 },
    ]

    // Revenue by program
    const programRevenueData = [
        { name: 'Classes', value: 180000, percentage: 45 },
        { name: 'Birthday Parties', value: 120000, percentage: 30 },
        { name: 'Private Coaching', value: 80000, percentage: 20 },
        { name: 'Camps', value: 20000, percentage: 5 },
    ]

    // Payment methods
    const paymentMethodsData = [
        { method: 'Credit Card', amount: 220000, percentage: 55 },
        { method: 'Bank Transfer', amount: 120000, percentage: 30 },
        { method: 'Cash', amount: 60000, percentage: 15 },
    ]

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Revenue Management</h1>
                    <p className="text-gray-600 mt-1">Track and analyze franchise revenue</p>
                </div>
                <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Total Revenue',
                        value: '$320K',
                        icon: DollarSign,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50',
                        change: '+12.5% vs last month'
                    },
                    {
                        title: 'Monthly Average',
                        value: '$53.3K',
                        icon: BarChart3,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50',
                        change: 'Consistent growth'
                    },
                    {
                        title: 'Total Expenses',
                        value: '$183K',
                        icon: TrendingDown,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50',
                        change: '57% of revenue'
                    },
                    {
                        title: 'Net Profit',
                        value: '$137K',
                        icon: TrendingUp,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50',
                        change: '+15.2% YoY'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                        <p className="text-xs text-gray-500 mt-2">{metric.change}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5 text-blue-600" />
                        Revenue Trend vs Target
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => typeof value === 'number' ? `$${(value / 1000).toFixed(0)}K` : value} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                            <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Program */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-600" />
                            Revenue by Program
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie data={programRevenueData} cx="50%" cy="50%" labelLine={false} label={({ name, percentage }) => `${name}: ${percentage}%`} outerRadius={80}>
                                {programRevenueData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </RechartsPie>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {paymentMethodsData.map((method, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <div>
                                            <p className="font-medium text-gray-900">{method.method}</p>
                                            <p className="text-xs text-gray-600">${(method.amount / 1000).toFixed(0)}K</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{method.percentage}%</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Profit & Loss Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Profit & Loss Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                            <div>
                                <p className="text-sm font-medium text-green-900">Total Revenue</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">$320,000</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div>
                                <p className="text-sm font-medium text-orange-900">Total Expenses</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">$183,000</p>
                            </div>
                            <TrendingDown className="w-8 h-8 text-orange-600" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div>
                                <p className="text-sm font-medium text-blue-900">Net Profit</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">$137,000</p>
                                <p className="text-xs text-blue-700 mt-1">42.8% profit margin</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Export Button */}
            <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    <Download className="w-5 h-5" />
                    Export Revenue Report
                </button>
            </div>
        </div>
    )
}
