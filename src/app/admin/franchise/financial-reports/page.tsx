'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, DollarSign, TrendingUp, TrendingDown, Download,
    PieChart, LineChart as LineChartIcon, Plus, Edit2, Trash2,
    Loader2, AlertCircle, Receipt
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import {
    LineChart, Line, PieChart as RechartsPie, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { FranchiseOwnerService } from '@/services/franchiseOwnerService'
import { validateNotes, validateAlphaText } from '@/utils/validation'

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
    hasRealExpenseData?: boolean
}

interface ExpenseItem {
    id: string
    category: string
    categoryLabel: string
    amount: number
    date: string
    description?: string
    vendor?: string
    paymentMethod?: string
    referenceNumber?: string
    status: string
    notes?: string
}

interface ExpenseCategory {
    value: string
    label: string
}

const EMPTY_EXPENSE_FORM = {
    category: 'OTHER',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: '',
    vendor: '',
    paymentMethod: '',
    status: 'PENDING',
    notes: '',
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#a855f7']

export default function FinancialReportsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeRange, setTimeRange] = useState('monthly')
    const [exporting, setExporting] = useState(false)
    const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('csv')
    const [financialData, setFinancialData] = useState<FinancialData | null>(null)

    // Expenses state
    const [expenses, setExpenses] = useState<ExpenseItem[]>([])
    const [expensesTotal, setExpensesTotal] = useState(0)
    const [expensesTotalAmount, setExpensesTotalAmount] = useState(0)
    const [expensesLoading, setExpensesLoading] = useState(false)
    const [expensesPage, setExpensesPage] = useState(1)
    const [categoryFilter, setCategoryFilter] = useState('')
    const [categories, setCategories] = useState<ExpenseCategory[]>([])

    // Expense drawer state
    const [expenseMode, setExpenseMode] = useState<'add' | 'edit' | 'delete' | null>(null)
    const [selectedExpense, setSelectedExpense] = useState<ExpenseItem | null>(null)
    const [expenseForm, setExpenseForm] = useState<any>({ ...EMPTY_EXPENSE_FORM })
    const [expenseSubmitting, setExpenseSubmitting] = useState(false)
    const [expenseFormError, setExpenseFormError] = useState<string | null>(null)
    const [expenseFieldErrors, setExpenseFieldErrors] = useState<Record<string, string>>({})

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

    const fetchExpenses = useCallback(async (page = 1, category = '') => {
        setExpensesLoading(true)
        try {
            const result = await FranchiseOwnerService.getExpenses(page, 10, { category: category || undefined })
            setExpenses(result.data || [])
            setExpensesTotal(result.total || 0)
            setExpensesTotalAmount(result.totalAmount || 0)
        } catch (err: any) {
            console.error('Failed to load expenses:', err)
        } finally {
            setExpensesLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData(timeRange)
    }, [timeRange, fetchData])

    useEffect(() => {
        fetchExpenses(expensesPage, categoryFilter)
    }, [expensesPage, categoryFilter, fetchExpenses])

    useEffect(() => {
        FranchiseOwnerService.getExpenseCategories().then(setCategories).catch(() => setCategories([]))
    }, [])

    const handleExport = async () => {
        setExporting(true)
        try {
            const blob = await FranchiseOwnerService.exportFinancialReport(exportFormat)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `financial-report-${timeRange}.${exportFormat}`
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

    // ─── Expense form helpers ────────────────────────────────────────────────
    const openAddExpense = () => {
        setSelectedExpense(null)
        setExpenseForm({ ...EMPTY_EXPENSE_FORM })
        setExpenseFormError(null)
        setExpenseFieldErrors({})
        setExpenseMode('add')
    }

    const openEditExpense = (e: ExpenseItem) => {
        setSelectedExpense(e)
        setExpenseForm({
            category: e.category,
            amount: e.amount,
            date: e.date ? new Date(e.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            description: e.description || '',
            vendor: e.vendor || '',
            paymentMethod: e.paymentMethod || '',
            status: e.status || 'PENDING',
            notes: e.notes || '',
        })
        setExpenseFormError(null)
        setExpenseFieldErrors({})
        setExpenseMode('edit')
    }

    const openDeleteExpense = (e: ExpenseItem) => {
        setSelectedExpense(e)
        setExpenseFormError(null)
        setExpenseMode('delete')
    }

    const closeExpenseDrawer = () => {
        setExpenseMode(null)
        setSelectedExpense(null)
        setExpenseForm({ ...EMPTY_EXPENSE_FORM })
        setExpenseFormError(null)
        setExpenseFieldErrors({})
    }

    const validateExpenseForm = (): boolean => {
        const errs: Record<string, string> = {}
        if (!expenseForm.category) errs.category = 'Category is required'
        if (!expenseForm.amount || Number(expenseForm.amount) < 0) errs.amount = 'Amount must be 0 or greater'
        if (!expenseForm.date) errs.date = 'Date is required'
        const descErr = validateNotes(String(expenseForm.description || ''), 'Description', false, 500)
        if (descErr) errs.description = descErr
        if (expenseForm.vendor) {
            const vendErr = validateAlphaText(String(expenseForm.vendor), 'Vendor name', 100)
            if (vendErr) errs.vendor = vendErr
        }
        setExpenseFieldErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleExpenseFormChange = (field: string, value: any) => {
        setExpenseForm((prev: any) => ({ ...prev, [field]: value }))
        let fieldErr: string | null = null
        const v = String(value || '')
        if (field === 'description') fieldErr = validateNotes(v, 'Description', false, 500)
        else if (field === 'vendor' && v.trim()) fieldErr = validateAlphaText(v, 'Vendor name', 100)
        setExpenseFieldErrors((prev) => {
            const n = { ...prev }
            if (fieldErr) n[field] = fieldErr
            else delete n[field]
            return n
        })
    }

    const handleSaveExpense = async () => {
        if (!validateExpenseForm()) return
        setExpenseSubmitting(true)
        setExpenseFormError(null)
        try {
            const payload = { ...expenseForm, amount: Number(expenseForm.amount) }
            if (expenseMode === 'edit' && selectedExpense) {
                await FranchiseOwnerService.updateExpense(selectedExpense.id, payload)
            } else {
                await FranchiseOwnerService.createExpense(payload)
            }
            closeExpenseDrawer()
            await Promise.all([fetchExpenses(expensesPage, categoryFilter), fetchData(timeRange)])
        } catch (err: any) {
            setExpenseFormError(err.message || 'Failed to save expense')
        } finally {
            setExpenseSubmitting(false)
        }
    }

    const handleDeleteExpense = async () => {
        if (!selectedExpense) return
        setExpenseSubmitting(true)
        setExpenseFormError(null)
        try {
            await FranchiseOwnerService.deleteExpense(selectedExpense.id)
            closeExpenseDrawer()
            await Promise.all([fetchExpenses(expensesPage, categoryFilter), fetchData(timeRange)])
        } catch (err: any) {
            setExpenseFormError(err.message || 'Failed to delete expense')
        } finally {
            setExpenseSubmitting(false)
        }
    }

    const expensesTotalPages = Math.max(1, Math.ceil(expensesTotal / 10))

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
                <div className="flex flex-wrap gap-2">
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
                    <select
                        id="select-admin-franchise-financial-reports-format"
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx' | 'pdf')}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Export format"
                    >
                        <option value="csv">CSV</option>
                        <option value="xlsx">Excel (XLSX)</option>
                        <option value="pdf">PDF</option>
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

            {/* ─── Expense Tracking ─────────────────────────────────────────── */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-orange-600" />
                            Expense Tracking
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            Total tracked: <span className="font-semibold text-gray-900">${expensesTotalAmount.toLocaleString()}</span>
                            {' '}across <span className="font-semibold text-gray-900">{expensesTotal}</span> entries
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); setExpensesPage(1) }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <Button onClick={openAddExpense} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-1" />
                            Add Expense
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {expensesLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                                {categoryFilter ? 'No expenses in this category.' : 'No expenses tracked yet. Click "Add Expense" to start.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">Date</th>
                                        <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">Category</th>
                                        <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">Description</th>
                                        <th className="text-left py-3 px-3 font-semibold text-gray-700 text-sm">Vendor</th>
                                        <th className="text-right py-3 px-3 font-semibold text-gray-700 text-sm">Amount</th>
                                        <th className="text-center py-3 px-3 font-semibold text-gray-700 text-sm">Status</th>
                                        <th className="text-right py-3 px-3 font-semibold text-gray-700 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((e) => (
                                        <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-3 text-sm text-gray-700">
                                                {new Date(e.date).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-3 text-sm">
                                                <Badge variant="outline" className="font-normal">{e.categoryLabel}</Badge>
                                            </td>
                                            <td className="py-3 px-3 text-sm text-gray-700">{e.description || '-'}</td>
                                            <td className="py-3 px-3 text-sm text-gray-600">{e.vendor || '-'}</td>
                                            <td className="py-3 px-3 text-sm font-semibold text-gray-900 text-right">
                                                ${e.amount.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-3 text-sm text-center">
                                                <Badge
                                                    variant={e.status === 'PAID' ? 'default' : e.status === 'REJECTED' ? 'destructive' : 'secondary'}
                                                    className="text-xs"
                                                >
                                                    {e.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => openEditExpense(e)}
                                                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteExpense(e)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {expensesTotalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                            <p className="text-sm text-gray-600">
                                Page {expensesPage} of {expensesTotalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExpensesPage((p) => Math.max(1, p - 1))}
                                    disabled={expensesPage <= 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExpensesPage((p) => Math.min(expensesTotalPages, p + 1))}
                                    disabled={expensesPage >= expensesTotalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

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

            {/* ─── Expense Drawers ──────────────────────────────────────────── */}
            <SlideInDrawer
                isOpen={expenseMode === 'add' || expenseMode === 'edit'}
                onClose={closeExpenseDrawer}
                title={expenseMode === 'add' ? 'Add Expense' : 'Edit Expense'}
                description={expenseMode === 'add' ? 'Track a new expense' : `Update ${selectedExpense?.categoryLabel || ''}`}
                size="lg"
                footer={
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={closeExpenseDrawer} disabled={expenseSubmitting} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveExpense}
                            disabled={expenseSubmitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {expenseSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {expenseMode === 'add' ? 'Create Expense' : 'Save Changes'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {expenseFormError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {expenseFormError}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select
                            value={expenseForm.category}
                            onChange={(e) => handleExpenseFormChange('category', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${expenseFieldErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            {categories.length > 0 ? (
                                categories.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))
                            ) : (
                                <option value="OTHER">Other</option>
                            )}
                        </select>
                        {expenseFieldErrors.category && (
                            <p className="text-xs text-red-600 mt-1">{expenseFieldErrors.category}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD) *</label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={expenseForm.amount || ''}
                                onChange={(e) => handleExpenseFormChange('amount', e.target.value)}
                                placeholder="0.00"
                                className={expenseFieldErrors.amount ? 'border-red-500' : ''}
                            />
                            {expenseFieldErrors.amount && (
                                <p className="text-xs text-red-600 mt-1">{expenseFieldErrors.amount}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                            <Input
                                type="date"
                                value={expenseForm.date}
                                onChange={(e) => handleExpenseFormChange('date', e.target.value)}
                                className={expenseFieldErrors.date ? 'border-red-500' : ''}
                            />
                            {expenseFieldErrors.date && (
                                <p className="text-xs text-red-600 mt-1">{expenseFieldErrors.date}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <Input
                            value={expenseForm.description}
                            onChange={(e) => handleExpenseFormChange('description', e.target.value)}
                            placeholder="e.g. April studio rent"
                            className={expenseFieldErrors.description ? 'border-red-500' : ''}
                        />
                        {expenseFieldErrors.description && (
                            <p className="text-xs text-red-600 mt-1">{expenseFieldErrors.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                            <Input
                                value={expenseForm.vendor}
                                onChange={(e) => handleExpenseFormChange('vendor', e.target.value)}
                                placeholder="Vendor name"
                                className={expenseFieldErrors.vendor ? 'border-red-500' : ''}
                            />
                            {expenseFieldErrors.vendor && (
                                <p className="text-xs text-red-600 mt-1">{expenseFieldErrors.vendor}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select
                                value={expenseForm.paymentMethod}
                                onChange={(e) => handleExpenseFormChange('paymentMethod', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Select --</option>
                                <option value="CASH">Cash</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="CREDIT_CARD">Credit Card</option>
                                <option value="DEBIT_CARD">Debit Card</option>
                                <option value="CHECK">Check</option>
                                <option value="ONLINE">Online</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={expenseForm.status}
                            onChange={(e) => handleExpenseFormChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="PAID">Paid</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={expenseForm.notes}
                            onChange={(e) => handleExpenseFormChange('notes', e.target.value)}
                            placeholder="Additional context..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </div>
            </SlideInDrawer>

            {/* Delete Expense Drawer */}
            <SlideInDrawer
                isOpen={expenseMode === 'delete'}
                onClose={closeExpenseDrawer}
                title="Delete Expense"
                description={selectedExpense ? `${selectedExpense.categoryLabel} • $${selectedExpense.amount.toLocaleString()}` : ''}
                size="sm"
                footer={
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={closeExpenseDrawer} disabled={expenseSubmitting} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteExpense}
                            disabled={expenseSubmitting}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                            {expenseSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete Expense
                        </Button>
                    </div>
                }
            >
                {selectedExpense && (
                    <div className="space-y-4">
                        {expenseFormError && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {expenseFormError}
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-100 rounded-full">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    Delete this expense?
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedExpense.description || selectedExpense.categoryLabel}
                                    {' '}— ${selectedExpense.amount.toLocaleString()} on{' '}
                                    {new Date(selectedExpense.date).toLocaleDateString()}.
                                    This will affect financial reports and cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </SlideInDrawer>
        </div>
    )
}
