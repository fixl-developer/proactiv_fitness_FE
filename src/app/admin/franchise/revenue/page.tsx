'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign, TrendingUp, TrendingDown, Calendar, Download,
    BarChart3, LineChart as LineChartIcon, PieChart, Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { FranchiseOwnerService } from '@/services/franchiseOwnerService'

interface MonthlyData {
    month: string
    revenue: number
    target: number
    expenses: number
}

interface ProgramData {
    program: string
    amount: number
    percentage: number
}

interface PaymentMethodData {
    method: string
    amount: number
    percentage: number
}

interface RevenueState {
    total: number
    monthlyAverage: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
    monthly: MonthlyData[]
    byProgram: ProgramData[]
    byPaymentMethod: PaymentMethodData[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

function formatCurrency(value: number): string {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(0)}`
}

export default function FranchiseRevenuePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeRange, setTimeRange] = useState('30d')
    const [exporting, setExporting] = useState(false)
    const [revenueData, setRevenueData] = useState<RevenueState>({
        total: 0,
        monthlyAverage: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        monthly: [],
        byProgram: [],
        byPaymentMethod: [],
    })

    const fetchRevenue = useCallback(async (range: string) => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await FranchiseOwnerService.getRevenue(range)
            setRevenueData({
                total: data.total ?? 0,
                monthlyAverage: data.monthlyAverage ?? 0,
                totalExpenses: data.totalExpenses ?? 0,
                netProfit: data.netProfit ?? 0,
                profitMargin: data.profitMargin ?? 0,
                monthly: data.monthly ?? [],
                byProgram: data.byProgram ?? [],
                byPaymentMethod: data.byPaymentMethod ?? [],
            })
        } catch (err) {
            console.error('Failed to fetch revenue data:', err)
            setError('Failed to load revenue data. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchRevenue(timeRange)
    }, [timeRange, fetchRevenue])

    const handleTimeRangeChange = (range: string) => {
        setTimeRange(range)
    }

    const handleExport = async () => {
        try {
            setExporting(true)
            const blob = await FranchiseOwnerService.exportRevenueReport('csv')
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `revenue-report-${timeRange}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Failed to export revenue report:', err)
        } finally {
            setExporting(false)
        }
    }

    const summaryCards = [
        {
            title: 'Total Revenue',
            value: formatCurrency(revenueData.total),
            icon: DollarSign,
            gradientCard: 'bg-gradient-to-br from-green-50 to-green-100',
            gradientIcon: 'bg-gradient-to-br from-green-500 to-green-600',
        },
        {
            title: 'Monthly Average',
            value: formatCurrency(revenueData.monthlyAverage),
            icon: BarChart3,
            gradientCard: 'bg-gradient-to-br from-blue-50 to-blue-100',
            gradientIcon: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        {
            title: 'Total Expenses',
            value: formatCurrency(revenueData.totalExpenses),
            icon: TrendingDown,
            gradientCard: 'bg-gradient-to-br from-orange-50 to-orange-100',
            gradientIcon: 'bg-gradient-to-br from-orange-500 to-orange-600',
        },
        {
            title: 'Net Profit',
            value: formatCurrency(revenueData.netProfit),
            icon: TrendingUp,
            gradientCard: 'bg-gradient-to-br from-purple-50 to-purple-100',
            gradientIcon: 'bg-gradient-to-br from-purple-500 to-purple-600',
        },
    ]

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
                <button id="admin-franchise-revenue-btn"
                    onClick={() => fetchRevenue(timeRange)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Retry
                </button>
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
                        <button id="admin-franchise-revenue-btn-2"
                            key={range}
                            onClick={() => handleTimeRangeChange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                timeRange === range
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
                {summaryCards.map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`${metric.gradientCard} border-0 hover:shadow-lg transition-shadow`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`${metric.gradientIcon} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Trend Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChartIcon className="w-5 h-5 text-blue-600" />
                            Revenue Trend vs Target
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {revenueData.monthly.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={revenueData.monthly}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number) =>
                                            `$${(value / 1000).toFixed(0)}K`
                                        }
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                                    <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-400">
                                No revenue trend data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Program */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-blue-600" />
                                Revenue by Program
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {revenueData.byProgram.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPie>
                                        <Pie
                                            data={revenueData.byProgram.map((item) => ({
                                                name: item.program,
                                                value: item.amount,
                                                percentage: item.percentage,
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percentage }) =>
                                                `${name}: ${percentage}%`
                                            }
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            {revenueData.byProgram.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                        />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-gray-400">
                                    No program revenue data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Payment Methods */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {revenueData.byPaymentMethod.length > 0 ? (
                                <div className="space-y-4">
                                    {revenueData.byPaymentMethod.map((method, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            COLORS[idx % COLORS.length],
                                                    }}
                                                ></div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {method.method}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {formatCurrency(method.amount)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline">{method.percentage}%</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-[200px] text-gray-400">
                                    No payment method data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Profit & Loss Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Profit & Loss Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                <div>
                                    <p className="text-sm font-medium text-green-900">
                                        Total Revenue
                                    </p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        {formatCurrency(revenueData.total)}
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-600" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div>
                                    <p className="text-sm font-medium text-orange-900">
                                        Total Expenses
                                    </p>
                                    <p className="text-2xl font-bold text-orange-600 mt-1">
                                        {formatCurrency(revenueData.totalExpenses)}
                                    </p>
                                </div>
                                <TrendingDown className="w-8 h-8 text-orange-600" />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Net Profit</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">
                                        {formatCurrency(revenueData.netProfit)}
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        {revenueData.profitMargin.toFixed(1)}% profit margin
                                    </p>
                                </div>
                                <DollarSign className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Export Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4"
            >
                <button id="admin-franchise-revenue-btn-3"
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-5 h-5" />
                    {exporting ? 'Exporting...' : 'Export Revenue Report'}
                </button>
            </motion.div>
        </div>
    )
}
