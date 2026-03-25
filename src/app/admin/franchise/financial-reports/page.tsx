'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, DollarSign, TrendingUp, TrendingDown, Download,
    PieChart, LineChart as LineChartIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    LineChart, Line, PieChart as RechartsPie, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { FranchiseOwnerService } from '@/services/franchiseOwnerService'

interface MonthlyDataItem {
    month: string
    revenue: number
    expenses: number
    profit: number
}

interface BreakdownItem {
    name: string
    value: number
    percentage: number
}

interface FinancialData {
    totalRevenue: number
    totalExpenses: number
    totalProfit: number
    profitMargin: number
    avgMonthlyProfit: number
    monthlyData: MonthlyDataItem[]
    revenueByProgram: BreakdownItem[]
    expenseBreakdown: BreakdownItem[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function FinancialReportsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeRange, setTimeRange] = useState('monthly')
    const [exporting, setExporting] = useState(false)
    const [financialData, setFinancialData] = useState<FinancialData | null>(null)

    const fetchData = useCallback(async (range: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await FranchiseOwnerService.getFinancialReports(range)
            // Handle both { totalRevenue, ... } and { success, data: { totalRevenue, ... } } shapes
            const data = result?.totalRevenue !== undefined ? result : result?.data ?? result
            setFinancialData(data)
        } catch (err: any) {
            setError(err.message || 'Failed to load financial reports')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData(timeRange)
    }, [timeRange, fetchData])

    const handleExport = async () => {
        setExporting(true)
        try {
            const blob = await FranchiseOwnerService.exportFinancialReport('csv')
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `financial-report-${timeRange}.csv`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
        } catch (err: any) {
            console.error('Export failed:', err)
        } finally {
            setExporting(false)
        }
    }

    const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeRange(e.target.value)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-red-600 text-lg font-medium">{error}</p>
                <button id="admin-franchise-financial-reports-btn-retry"
                    onClick={() => fetchData(timeRange)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        )
    }

    if (!financialData) return null

    const totalRevenue = financialData.totalRevenue ?? 0
    const totalExpenses = financialData.totalExpenses ?? 0
    const totalProfit = financialData.totalProfit ?? 0
    const profitMargin = financialData.profitMargin ?? 0
    const avgMonthlyProfit = financialData.avgMonthlyProfit ?? 0
    const monthlyData = financialData.monthlyData ?? []
    const revenueByProgram = financialData.revenueByProgram ?? []
    const expenseBreakdown = financialData.expenseBreakdown ?? []

    const metrics = [
        {
            title: 'Total Revenue',
            value: `$${(totalRevenue / 1000).toFixed(0)}K`,
            icon: DollarSign,
            cardGradient: 'bg-gradient-to-br from-green-50 to-green-100',
            iconGradient: 'bg-gradient-to-br from-green-500 to-green-600',
            change: `+${profitMargin.toFixed(1)}% margin`,
        },
        {
            title: 'Total Expenses',
            value: `$${(totalExpenses / 1000).toFixed(0)}K`,
            icon: TrendingDown,
            cardGradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
            iconGradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
            change: `${totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0.0'}% of revenue`,
        },
        {
            title: 'Net Profit',
            value: `$${(totalProfit / 1000).toFixed(0)}K`,
            icon: TrendingUp,
            cardGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
            iconGradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
            change: `${profitMargin.toFixed(1)}% margin`,
        },
        {
            title: 'Avg Monthly Profit',
            value: `$${(avgMonthlyProfit / 1000).toFixed(0)}K`,
            icon: BarChart3,
            cardGradient: 'bg-gradient-to-br from-purple-50 to-purple-100',
            iconGradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
            change: 'Net profit/month',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
                    <p className="text-gray-600 mt-1">Detailed financial analysis and insights</p>
                </div>
                <div className="flex gap-2">
                    <select
                        id="select-admin-franchise-financial-reports-1"
                        value={timeRange}
                        onChange={handleTimeRangeChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <button id="admin-franchise-financial-reports-btn"
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Download className="w-5 h-5" />
                        {exporting ? 'Exporting...' : 'Export'}
                    </button>
                </div>
            </div>

            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {metrics.map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`${metric.cardGradient} border-0 hover:shadow-lg transition-shadow`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                        <p className="text-xs text-gray-500 mt-2">{metric.change}</p>
                                    </div>
                                    <div className={`${metric.iconGradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-6 h-6 text-white" />
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
                            <RechartsPie>
                                <Pie
                                    data={revenueByProgram}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {revenueByProgram.map((_, index) => (
                                        <Cell key={`rev-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => typeof value === 'number' ? `$${(value / 1000).toFixed(0)}K` : value} />
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
                            <RechartsPie>
                                <Pie
                                    data={expenseBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {expenseBreakdown.map((_, index) => (
                                        <Cell key={`exp-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => typeof value === 'number' ? `$${(value / 1000).toFixed(0)}K` : value} />
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
                                                {item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(1) : '0.0'}%
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
