'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, DollarSign, TrendingUp, TrendingDown, Download,
    Calendar, Filter, PieChart, LineChart as LineChartIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function FinancialReportsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('monthly')
    const [reportType, setReportType] = useState('overview')

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 1000)
    }, [])

    // Monthly financial data
    const monthlyData = [
        { month: 'January', revenue: 45000, expenses: 28000, profit: 17000 },
        { month: 'February', revenue: 48000, expenses: 29000, profit: 19000 },
        { month: 'March', revenue: 52000, expenses: 30000, profit: 22000 },
        { month: 'April', revenue: 55000, expenses: 31000, profit: 24000 },
        { month: 'May', revenue: 58000, expenses: 32000, profit: 26000 },
        { month: 'June', revenue: 62000, expenses: 33000, profit: 29000 },
    ]

    // Revenue breakdown by program
    const revenueByProgram = [
        { name: 'Classes', value: 180000, percentage: 45 },
        { name: 'Birthday Parties', value: 120000, percentage: 30 },
        { name: 'Private Coaching', value: 80000, percentage: 20 },
        { name: 'Camps', value: 20000, percentage: 5 },
    ]

    // Expense breakdown
    const expenseBreakdown = [
        { name: 'Staff Salaries', value: 120000, percentage: 55 },
        { name: 'Facility Rent', value: 40000, percentage: 18 },
        { name: 'Equipment', value: 25000, percentage: 11 },
        { name: 'Utilities', value: 15000, percentage: 7 },
        { name: 'Marketing', value: 18000, percentage: 8 },
    ]

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    // Financial metrics
    const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0)
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0)
    const totalProfit = totalRevenue - totalExpenses
    const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)

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
                    <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
                    <p className="text-gray-600 mt-1">Detailed financial analysis and insights</p>
                </div>
                <div className="flex gap-2">
                    <select data-testid="select-admin-franchise-financial-reports-1"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </div>

            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Total Revenue',
                        value: `$${(totalRevenue / 1000).toFixed(0)}K`,
                        icon: DollarSign,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50',
                        change: '+12.5% vs last period'
                    },
                    {
                        title: 'Total Expenses',
                        value: `$${(totalExpenses / 1000).toFixed(0)}K`,
                        icon: TrendingDown,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50',
                        change: '+8.2% vs last period'
                    },
                    {
                        title: 'Net Profit',
                        value: `$${(totalProfit / 1000).toFixed(0)}K`,
                        icon: TrendingUp,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50',
                        change: `${profitMargin}% margin`
                    },
                    {
                        title: 'Avg Monthly',
                        value: `$${(totalProfit / 6 / 1000).toFixed(0)}K`,
                        icon: BarChart3,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50',
                        change: 'Net profit/month'
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

            {/* Revenue vs Expenses Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5 text-blue-600" />
                        Revenue vs Expenses Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => typeof value === 'number' ? `$${(value / 1000).toFixed(0)}K` : value} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                            <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Revenue & Expense Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Program */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-green-600" />
                            Revenue by Program
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie data={revenueByProgram} cx="50%" cy="50%" labelLine={false} label={({ name, percentage }) => `${name}: ${percentage}%`} outerRadius={80}>
                                {revenueByProgram.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </RechartsPie>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Expense Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-orange-600" />
                            Expense Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie data={expenseBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, percentage }) => `${name}: ${percentage}%`} outerRadius={80}>
                                {expenseBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </RechartsPie>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Breakdown Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {revenueByProgram.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-600">${(item.value / 1000).toFixed(0)}K</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{item.percentage}%</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Expense Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expense Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {expenseBreakdown.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-600">${(item.value / 1000).toFixed(0)}K</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{item.percentage}%</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Summary Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Expenses</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Profit</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyData.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{item.month}</td>
                                        <td className="py-3 px-4 text-green-600 font-medium">${(item.revenue / 1000).toFixed(0)}K</td>
                                        <td className="py-3 px-4 text-orange-600 font-medium">${(item.expenses / 1000).toFixed(0)}K</td>
                                        <td className="py-3 px-4 text-blue-600 font-medium">${(item.profit / 1000).toFixed(0)}K</td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline">
                                                {((item.profit / item.revenue) * 100).toFixed(1)}%
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
