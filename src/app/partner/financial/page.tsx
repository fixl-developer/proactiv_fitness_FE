'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerAnalyticsService from '@/services/modules/partner-analytics.service'
import CommissionService from '@/services/modules/commission.service'
import { motion } from 'framer-motion'
import {
    AlertCircle, Download, DollarSign, TrendingUp, Users, BookOpen,
    ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, BarChart3,
    Wallet, CreditCard, FileText, Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Financial() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [revenue, setRevenue] = useState<any>(null)
    const [commissionStats, setCommissionStats] = useState<any>(null)
    const [commissionBreakdown, setCommissionBreakdown] = useState<any>(null)
    const [payoutHistory, setPayoutHistory] = useState<any[]>([])
    const [selectedPeriod, setSelectedPeriod] = useState('monthly')
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        loadFinancialData()
    }, [isAuthenticated, router, user])

    const loadFinancialData = async () => {
        try {
            setLoading(true)
            setError(null)
            const partnerId = user?.id || 'partner-1'

            const [revenueRes, statsRes, breakdownRes, payoutsRes] = await Promise.allSettled([
                PartnerAnalyticsService.getRevenueAnalytics(partnerId),
                CommissionService.getCommissionStats(partnerId),
                CommissionService.getCommissionBreakdown(partnerId, 'monthly'),
                CommissionService.getPayoutHistory(partnerId, { limit: 10 })
            ])

            setRevenue(revenueRes.status === 'fulfilled' ? revenueRes.value : null)
            setCommissionStats(statsRes.status === 'fulfilled' ? statsRes.value : null)
            setCommissionBreakdown(breakdownRes.status === 'fulfilled' ? breakdownRes.value : null)
            setPayoutHistory(payoutsRes.status === 'fulfilled' ? (payoutsRes.value?.payouts || []) : [])
        } catch (err) {
            console.error('Error loading financial data:', err)
            setError('Failed to load financial data')
        } finally {
            setLoading(false)
        }
    }

    const handleExport = useCallback(() => {
        setExporting(true)
        try {
            const headers = ['Metric', 'Value']
            const rows = [
                ['Total Revenue', `$${revenue?.totalRevenue?.toLocaleString() || '0'}`],
                ['Revenue Growth', `${revenue?.revenueGrowth || 0}%`],
                ['Avg Revenue/Student', `$${revenue?.averageRevenuePerStudent?.toLocaleString() || '0'}`],
                ['Avg Revenue/Program', `$${revenue?.averageRevenuePerProgram?.toLocaleString() || '0'}`],
                ['Total Commissions', `$${commissionStats?.totalCommissions?.toLocaleString() || '0'}`],
                ['Commissions Paid', `$${commissionStats?.totalPaid?.toLocaleString() || '0'}`],
                ['Commissions Pending', `$${commissionStats?.totalPending?.toLocaleString() || '0'}`],
            ]
            if (revenue?.revenueByProgram) {
                rows.push(['', ''])
                rows.push(['Program', 'Revenue'])
                revenue.revenueByProgram.forEach((p: any) => rows.push([p.program, `$${p.revenue?.toLocaleString()}`]))
            }
            if (revenue?.revenueByMonth) {
                rows.push(['', ''])
                rows.push(['Month', 'Revenue'])
                revenue.revenueByMonth.forEach((m: any) => rows.push([m.month, `$${m.revenue?.toLocaleString()}`]))
            }
            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export failed:', err)
        } finally {
            setExporting(false)
        }
    }, [revenue, commissionStats])

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading financial data...</p>
                </div>
            </div>
        )
    }

    const totalRevenue = revenue?.totalRevenue || 0
    const revenueGrowth = revenue?.revenueGrowth || 0
    const avgPerStudent = revenue?.averageRevenuePerStudent || 0
    const avgPerProgram = revenue?.averageRevenuePerProgram || 0
    const revenueByProgram = revenue?.revenueByProgram || []
    const revenueByMonth = revenue?.revenueByMonth || []
    const totalCommissions = commissionStats?.totalCommissions || 0
    const totalPaid = commissionStats?.totalPaid || 0
    const totalPending = commissionStats?.totalPending || 0
    const commissionRate = commissionBreakdown?.commissionRate || 15

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
                    <p className="text-gray-600 mt-1">Revenue analytics, commissions, and financial overview</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {['monthly', 'quarterly', 'yearly'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    selectedPeriod === period
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                    <button
                        id="partner-financial-export-btn"
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        {exporting ? 'Exporting...' : 'Export'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* KPI Cards - Colorful Gradient */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        title: 'Total Revenue',
                        value: `$${totalRevenue.toLocaleString()}`,
                        icon: DollarSign,
                        gradient: 'from-blue-500 to-blue-600',
                        bgGradient: 'from-blue-50 to-blue-100',
                        change: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%`,
                        changePositive: revenueGrowth >= 0
                    },
                    {
                        title: 'Avg Revenue/Student',
                        value: `$${avgPerStudent.toLocaleString()}`,
                        icon: Users,
                        gradient: 'from-green-500 to-emerald-600',
                        bgGradient: 'from-green-50 to-emerald-100',
                        change: `${revenueByProgram.length} programs`,
                        changePositive: true
                    },
                    {
                        title: 'Total Commissions',
                        value: `$${totalCommissions.toLocaleString()}`,
                        icon: Wallet,
                        gradient: 'from-purple-500 to-purple-600',
                        bgGradient: 'from-purple-50 to-purple-100',
                        change: `${commissionRate}% rate`,
                        changePositive: true
                    },
                    {
                        title: 'Pending Payout',
                        value: `$${totalPending.toLocaleString()}`,
                        icon: CreditCard,
                        gradient: 'from-amber-500 to-orange-600',
                        bgGradient: 'from-amber-50 to-orange-100',
                        change: `$${totalPaid.toLocaleString()} paid`,
                        changePositive: true
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                                        metric.changePositive
                                            ? 'text-green-600 bg-green-100'
                                            : 'text-red-600 bg-red-100'
                                    }`}>
                                        {metric.changePositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {metric.change}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue Trend */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Monthly Revenue Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {revenueByMonth.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={revenueByMonth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                                        <Bar dataKey="revenue" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} />
                                        <defs>
                                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#1d4ed8" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-gray-400">
                                    <p>No monthly data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Revenue by Program (Pie Chart) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChartIcon className="w-5 h-5 text-purple-600" />
                                Revenue by Program
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {revenueByProgram.length > 0 ? (
                                <div className="flex flex-col lg:flex-row items-center gap-4">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={revenueByProgram}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={3}
                                                dataKey="revenue"
                                                nameKey="program"
                                            >
                                                {revenueByProgram.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2 w-full lg:w-auto">
                                        {revenueByProgram.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                                                />
                                                <span className="text-gray-700 truncate">{item.program}</span>
                                                <span className="font-semibold text-gray-900 ml-auto">${item.revenue.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-[250px] text-gray-400">
                                    <p>No program data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Revenue by Program Breakdown (Table) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-green-600" />
                            Program Revenue Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {revenueByProgram.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Program</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Revenue</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Share</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenueByProgram.map((program: any, idx: number) => {
                                            const share = totalRevenue > 0 ? ((program.revenue / totalRevenue) * 100) : 0
                                            return (
                                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                                                            />
                                                            <span className="font-medium text-gray-900">{program.program}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6 font-semibold text-gray-900">${program.revenue.toLocaleString()}</td>
                                                    <td className="py-3 px-6">
                                                        <Badge variant="outline" className="font-medium">
                                                            {share.toFixed(1)}%
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-6 w-48">
                                                        <Progress value={share} className="h-2" />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-400">
                                <FileText className="w-12 h-12 mx-auto mb-4" />
                                <p>No program revenue data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Commission Breakdown + Payout History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Commission Breakdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-purple-600" />
                                Commission Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                                    <span className="font-bold text-gray-900">${(commissionBreakdown?.totalRevenue || totalRevenue).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Commission Rate</span>
                                    <Badge className="bg-purple-100 text-purple-800">{commissionRate}%</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Gross Commission</span>
                                    <span className="font-bold text-green-700">${(commissionBreakdown?.commissionAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Deductions</span>
                                    <span className="font-bold text-red-700">-${(commissionBreakdown?.deductions || 0).toLocaleString()}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                        <span className="text-sm font-bold text-gray-900">Net Commission</span>
                                        <span className="text-xl font-bold text-green-700">${(commissionBreakdown?.netCommission || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            {commissionBreakdown?.breakdown && commissionBreakdown.breakdown.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">By Category</p>
                                    <div className="space-y-2">
                                        {commissionBreakdown.breakdown.map((item: any, idx: number) => {
                                            const total = commissionBreakdown.breakdown.reduce((s: number, i: any) => s + i.amount, 0)
                                            const pct = total > 0 ? (item.amount / total) * 100 : 0
                                            return (
                                                <div key={idx}>
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="text-gray-600">{item.category}</span>
                                                        <span className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                                                    </div>
                                                    <Progress value={pct} className="h-1.5" />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Payout History */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-amber-600" />
                                Payout History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {payoutHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {payoutHistory.map((payout: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    payout.status === 'completed'
                                                        ? 'bg-green-100'
                                                        : payout.status === 'pending'
                                                        ? 'bg-yellow-100'
                                                        : 'bg-gray-100'
                                                }`}>
                                                    <DollarSign className={`w-4 h-4 ${
                                                        payout.status === 'completed'
                                                            ? 'text-green-600'
                                                            : payout.status === 'pending'
                                                            ? 'text-yellow-600'
                                                            : 'text-gray-600'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">${payout.amount?.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {payout.method?.replace('_', ' ')} {payout.reference ? `- ${payout.reference}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={`${
                                                    payout.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : payout.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : payout.status === 'processing'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {payout.status}
                                                </Badge>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {payout.processedAt
                                                        ? new Date(payout.processedAt).toLocaleDateString()
                                                        : payout.requestedAt
                                                        ? new Date(payout.requestedAt).toLocaleDateString()
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-4" />
                                    <p>No payout history yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Revenue Growth Line Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Revenue Growth Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {revenueByMonth.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, strokeWidth: 2 }}
                                    />
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-400">
                                <p>No trend data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quick Financial Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                            Financial Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                                    <p className={`text-sm font-bold ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%
                                    </p>
                                </div>
                                <Progress value={Math.min(Math.abs(revenueGrowth), 100)} className="h-2" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-600">Commission Payout Rate</p>
                                    <p className="text-sm font-bold text-blue-600">
                                        {totalCommissions > 0 ? ((totalPaid / totalCommissions) * 100).toFixed(1) : '0'}%
                                    </p>
                                </div>
                                <Progress
                                    value={totalCommissions > 0 ? (totalPaid / totalCommissions) * 100 : 0}
                                    className="h-2"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-gray-600">Avg Revenue/Program</p>
                                    <p className="text-sm font-bold text-purple-600">${avgPerProgram.toLocaleString()}</p>
                                </div>
                                <Progress
                                    value={Math.min((avgPerProgram / 5000) * 100, 100)}
                                    className="h-2"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
