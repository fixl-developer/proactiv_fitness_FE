'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign, TrendingUp, AlertTriangle, CheckCircle,
    PieChart, Plus, Edit2, Trash2, Download, Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { RegionalAdminService } from '@/services/regionalAdminService'

interface BudgetItem {
    id: string; name: string; allocated: number; spent: number; percentage: number; category: string; period: string
}
interface LocationBudget {
    id: string; location: string; budget: number; spent: number; remaining: number; locationId: string
}

export default function RegionalBudgetPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPeriod, setSelectedPeriod] = useState('Q2-2024')
    const [budgetData, setBudgetData] = useState<BudgetItem[]>([])
    const [locationBudget, setLocationBudget] = useState<LocationBudget[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchBudgetData()
    }, [selectedPeriod])

    const fetchBudgetData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const budgetResp = await RegionalAdminService.getBudget(selectedPeriod)
            const items = (budgetResp?.items || []).map((i: any, idx: number) => ({
                id: i.id || `b${idx}`, name: i.category, allocated: i.allocated, spent: i.spent,
                percentage: i.allocated > 0 ? Math.round((i.spent / i.allocated) * 100) : 0,
                category: i.category, period: selectedPeriod
            }))
            const locs = (budgetResp?.locationBudgets || []).map((l: any, idx: number) => ({
                id: `lb${idx}`, location: l.locationName, budget: l.allocated, spent: l.spent,
                remaining: l.allocated - l.spent, locationId: l.locationId
            }))
            setBudgetData(items)
            setLocationBudget(locs)
        } catch (err: any) {
            console.error('Error fetching budget data:', err)
            setError(err.message || 'Failed to fetch budget data')
            // Set mock data as fallback
            setBudgetData([
                { id: '1', name: 'Staff Salaries', allocated: 150000, spent: 145000, percentage: 96.7, category: 'Personnel', period: selectedPeriod },
                { id: '2', name: 'Equipment & Maintenance', allocated: 50000, spent: 38000, percentage: 76, category: 'Operations', period: selectedPeriod },
                { id: '3', name: 'Facility Operations', allocated: 40000, spent: 35000, percentage: 87.5, category: 'Operations', period: selectedPeriod },
                { id: '4', name: 'Marketing & Promotions', allocated: 30000, spent: 22000, percentage: 73.3, category: 'Marketing', period: selectedPeriod },
                { id: '5', name: 'Training & Development', allocated: 20000, spent: 15000, percentage: 75, category: 'Personnel', period: selectedPeriod },
                { id: '6', name: 'Technology & Software', allocated: 15000, spent: 12000, percentage: 80, category: 'Technology', period: selectedPeriod },
            ])
            setLocationBudget([
                { id: '1', location: 'Boston Downtown', budget: 80000, spent: 75000, remaining: 5000, locationId: 'loc1' },
                { id: '2', location: 'Boston Suburbs', budget: 70000, spent: 65000, remaining: 5000, locationId: 'loc2' },
                { id: '3', location: 'Providence', budget: 50000, spent: 48000, remaining: 2000, locationId: 'loc3' },
                { id: '4', location: 'Hartford', budget: 55000, spent: 52000, remaining: 3000, locationId: 'loc4' },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    // Calculate totals
    const totalAllocated = budgetData.reduce((sum, item) => sum + item.allocated, 0)
    const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0)
    const totalRemaining = totalAllocated - totalSpent
    const spendingPercentage = Math.round((totalSpent / totalAllocated) * 100)

    // Chart data
    const chartData = budgetData.map(item => ({
        name: item.name,
        value: item.spent
    }))

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
                    <p className="text-gray-600 mt-1">Track and manage regional budget allocation</p>
                </div>
                <div className="flex gap-2">
                    <button id="admin-regional-budget-btn"
                        onClick={async () => {
                            try {
                                const blob = await RegionalAdminService.exportReport('budget', 'csv')
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `budget-report-${selectedPeriod}.pdf`
                                document.body.appendChild(a)
                                a.click()
                                window.URL.revokeObjectURL(url)
                                document.body.removeChild(a)
                            } catch (error) {
                                alert('Export functionality not available in development mode')
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Export
                    </button>
                    <button id="admin-regional-budget-btn-2" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-5 h-5" />
                        New Budget
                    </button>
                </div>
            </div>

            {/* Period Selection */}
            <div className="flex gap-2 overflow-x-auto">
                {['Q1-2024', 'Q2-2024', 'Q3-2024', 'Q4-2024'].map((period) => (
                    <button id="admin-regional-budget-btn-3"
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedPeriod === period
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {period}
                    </button>
                ))}
            </div>

            {/* Budget Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { title: 'Total Allocated', value: `$${(totalAllocated / 1000).toFixed(0)}K`, icon: DollarSign, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
                    { title: 'Total Spent', value: `$${(totalSpent / 1000).toFixed(0)}K`, icon: TrendingUp, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
                    { title: 'Remaining', value: `$${(totalRemaining / 1000).toFixed(0)}K`, icon: DollarSign, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
                    { title: 'Spending %', value: `${spendingPercentage}%`, icon: CheckCircle, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100' },
                ].map((stat, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${stat.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
            {/* Budget Breakdown Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-blue-600" />
                            Budget Spending Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie data={chartData} cx="50%" cy="50%" outerRadius={80}>
                                <Pie
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}K`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, 'Spent']} />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Budget Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {chartData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-600">${(item.value / 1000).toFixed(0)}K</p>
                                    </div>
                                    <Badge variant="outline">{Math.round((item.value / totalSpent) * 100)}%</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Budget Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Budget Details by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Allocated</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Spent</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Remaining</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Usage</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budgetData.map((item, idx) => (
                                    <motion.tr
                                        key={idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                                        <td className="py-3 px-4 text-gray-600">${(item.allocated / 1000).toFixed(0)}K</td>
                                        <td className="py-3 px-4 text-gray-600">${(item.spent / 1000).toFixed(0)}K</td>
                                        <td className="py-3 px-4 text-gray-600">${((item.allocated - item.spent) / 1000).toFixed(0)}K</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Progress value={item.percentage} className="h-2 w-20" />
                                                <span className="text-sm font-medium text-gray-700">{item.percentage}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={item.percentage > 95 ? 'destructive' : item.percentage > 80 ? 'secondary' : 'default'}>
                                                {item.percentage > 95 ? 'Critical' : item.percentage > 80 ? 'High' : 'Normal'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-1">
                                                <button id="admin-regional-budget-btn-4" className="p-1 hover:bg-blue-50 rounded text-blue-600">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button id="admin-regional-budget-btn-5" className="p-1 hover:bg-red-50 rounded text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            {/* Location Budget Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Budget by Location</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {locationBudget.map((location, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-gray-900">{location.location}</h3>
                                    <Badge variant="outline">
                                        {Math.round((location.spent / location.budget) * 100)}% Used
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Budget</p>
                                        <p className="font-medium">${(location.budget / 1000).toFixed(0)}K</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Spent</p>
                                        <p className="font-medium">${(location.spent / 1000).toFixed(0)}K</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Remaining</p>
                                        <p className="font-medium">${(location.remaining / 1000).toFixed(0)}K</p>
                                    </div>
                                </div>
                                <Progress
                                    value={(location.spent / location.budget) * 100}
                                    className="h-2 mt-3"
                                />
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            {/* Budget Alerts */}
            <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-900">
                        <AlertTriangle className="w-5 h-5" />
                        Budget Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-yellow-800">
                        <li>• Staff Salaries: 96.7% spent - approaching limit</li>
                        <li>• Facility Operations: 87.5% spent - monitor closely</li>
                        <li>• Technology & Software: 80% spent - within normal range</li>
                        <li>• Overall spending: {spendingPercentage}% of allocated budget</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button id="admin-regional-budget-btn-6" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Plus className="w-5 h-5 text-blue-600" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Add Budget Item</p>
                                <p className="text-sm text-gray-600">Create new budget category</p>
                            </div>
                        </button>
                        <button id="admin-regional-budget-btn-7" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Filter className="w-5 h-5 text-green-600" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Budget Review</p>
                                <p className="text-sm text-gray-600">Review quarterly budget</p>
                            </div>
                        </button>
                        <button id="admin-regional-budget-btn-8" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Download className="w-5 h-5 text-purple-600" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Export Report</p>
                                <p className="text-sm text-gray-600">Download budget report</p>
                            </div>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ {error} - Showing mock data for development
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
