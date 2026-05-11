'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DollarSign, TrendingUp, AlertTriangle, CheckCircle,
    PieChart, Plus, Edit2, Trash2, Download, X, Loader2, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { RegionalAdminService } from '@/services/regionalAdminService'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { validateRequired, validateNumber, validateAlphaText, filterNumberInput } from '@/utils/validation'

interface BudgetItem {
    id: string
    category: string
    allocated: number
    spent: number
    remaining?: number
    notes?: string
}

interface LocationBudget {
    id: string
    location: string
    budget: number
    spent: number
    remaining: number
    locationId: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function RegionalBudgetPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPeriod, setSelectedPeriod] = useState('Q2-2026')
    const [budgetData, setBudgetData] = useState<BudgetItem[]>([])
    const [locationBudget, setLocationBudget] = useState<LocationBudget[]>([])
    const [error, setError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    // Form drawer
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<BudgetItem | null>(null)
    const [form, setForm] = useState({ category: '', allocated: '', spent: '', notes: '' })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<BudgetItem | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 4000)
        return () => clearTimeout(t)
    }, [toast])

    const fetchBudgetData = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const budgetResp = await RegionalAdminService.getBudget(selectedPeriod)
            const items: BudgetItem[] = (budgetResp?.items || []).map((i: any) => ({
                id: i.id,
                category: i.category,
                allocated: Number(i.allocated) || 0,
                spent: Number(i.spent) || 0,
                remaining: (Number(i.allocated) || 0) - (Number(i.spent) || 0),
                notes: i.notes || ''
            }))
            const locs: LocationBudget[] = (budgetResp?.locationBudgets || []).map((l: any, idx: number) => ({
                id: `lb${idx}`,
                location: l.locationName,
                budget: l.allocated,
                spent: l.spent,
                remaining: l.allocated - l.spent,
                locationId: l.locationId
            }))
            setBudgetData(items)
            setLocationBudget(locs)
        } catch (err: any) {
            console.error('Error fetching budget data:', err)
            setError(err.message || 'Failed to fetch budget data')
        } finally {
            setIsLoading(false)
        }
    }, [selectedPeriod])

    useEffect(() => { fetchBudgetData() }, [fetchBudgetData])

    const openAdd = () => {
        setEditing(null)
        setForm({ category: '', allocated: '', spent: '', notes: '' })
        setFormErrors({})
        setFormOpen(true)
    }

    const openEdit = (item: BudgetItem) => {
        setEditing(item)
        setForm({
            category: item.category,
            allocated: String(item.allocated),
            spent: String(item.spent),
            notes: item.notes || ''
        })
        setFormErrors({})
        setFormOpen(true)
    }

    const validateForm = (): boolean => {
        const errs: Record<string, string> = {}
        // Category — alphabetic only (rejects "@@12" style input from QA bugs).
        const catErr = validateAlphaText(form.category, 'Category', 60); if (catErr) errs.category = catErr
        const allocErr = validateNumber(form.allocated, 'Allocated amount', 0, 100000000); if (allocErr) errs.allocated = allocErr
        if (form.spent) {
            const spentErr = validateNumber(form.spent, 'Spent amount', 0, 100000000); if (spentErr) errs.spent = spentErr
            else if (Number(form.spent) > Number(form.allocated)) errs.spent = 'Spent cannot exceed allocated'
        }
        if (form.notes && form.notes.length > 500) errs.notes = 'Notes must be less than 500 characters'
        setFormErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return
        setSubmitting(true)
        try {
            const payload = {
                category: form.category.trim(),
                allocated: Number(form.allocated),
                spent: Number(form.spent) || 0,
                notes: form.notes.trim() || undefined,
            }
            if (editing) {
                await RegionalAdminService.updateBudgetItem(editing.id, payload)
                setToast({ message: 'Budget item updated successfully', type: 'success' })
            } else {
                await RegionalAdminService.createBudgetItem(payload)
                setToast({ message: 'Budget item created successfully', type: 'success' })
            }
            setFormOpen(false)
            fetchBudgetData()
        } catch (err: any) {
            setToast({ message: err.message || 'Operation failed', type: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            await RegionalAdminService.deleteBudgetItem(deleteTarget.id)
            setToast({ message: 'Budget item deleted', type: 'success' })
            setDeleteTarget(null)
            fetchBudgetData()
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to delete', type: 'error' })
        } finally {
            setDeleting(false)
        }
    }

    const totalAllocated = budgetData.reduce((sum, item) => sum + item.allocated, 0)
    const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0)
    const totalRemaining = totalAllocated - totalSpent
    const spendingPercentage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0

    const chartData = budgetData.map(item => ({ name: item.category, value: item.spent }))

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
                    <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
                    <p className="text-gray-600 mt-1">Track and manage regional budget allocation</p>
                </div>
                <button
                    id="admin-regional-budget-btn-add"
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Budget Item
                </button>
            </div>

            {/* Period Selection */}
            <div className="flex gap-2 overflow-x-auto">
                {['Q1-2026', 'Q2-2026', 'Q3-2026', 'Q4-2026'].map((period) => (
                    <button
                        id={`admin-regional-budget-period-${period}`}
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

            {/* Summary Cards */}
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

            {/* Chart + Categories */}
            {chartData.length > 0 && (
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
                                <RechartsPie>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        cx="50%" cy="50%"
                                        outerRadius={80}
                                        label={({ name, value }) => `${name}: $${(Number(value) / 1000).toFixed(0)}K`}
                                    >
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, 'Spent']} />
                                </RechartsPie>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Budget Categories</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {chartData.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-600">${(item.value / 1000).toFixed(0)}K</p>
                                        </div>
                                        <Badge variant="outline">
                                            {totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0}%
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Budget Table */}
            <Card>
                <CardHeader><CardTitle>Budget Details by Category</CardTitle></CardHeader>
                <CardContent>
                    {budgetData.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="mb-3">No budget items yet</p>
                            <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add First Item</button>
                        </div>
                    ) : (
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
                                    {budgetData.map((item, idx) => {
                                        const pct = item.allocated > 0 ? Math.round((item.spent / item.allocated) * 100) : 0
                                        return (
                                            <motion.tr
                                                key={item.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-3 px-4 font-medium text-gray-900">{item.category}</td>
                                                <td className="py-3 px-4 text-gray-600">${(item.allocated / 1000).toFixed(0)}K</td>
                                                <td className="py-3 px-4 text-gray-600">${(item.spent / 1000).toFixed(0)}K</td>
                                                <td className="py-3 px-4 text-gray-600">${((item.remaining || 0) / 1000).toFixed(0)}K</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={pct} className="h-2 w-20" />
                                                        <span className="text-sm font-medium text-gray-700">{pct}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={pct > 95 ? 'destructive' : pct > 80 ? 'secondary' : 'default'}>
                                                        {pct > 95 ? 'Critical' : pct > 80 ? 'High' : 'Normal'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => openEdit(item)}
                                                            className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(item)}
                                                            className="p-1.5 hover:bg-red-50 rounded text-red-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Location Budget Breakdown */}
            {locationBudget.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Budget by Location</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {locationBudget.map((location, idx) => (
                                <motion.div
                                    key={location.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-gray-900">{location.location}</h3>
                                        <Badge variant="outline">{location.budget > 0 ? Math.round((location.spent / location.budget) * 100) : 0}% Used</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div><p className="text-gray-600">Budget</p><p className="font-medium">${(location.budget / 1000).toFixed(0)}K</p></div>
                                        <div><p className="text-gray-600">Spent</p><p className="font-medium">${(location.spent / 1000).toFixed(0)}K</p></div>
                                        <div><p className="text-gray-600">Remaining</p><p className="font-medium">${(location.remaining / 1000).toFixed(0)}K</p></div>
                                    </div>
                                    <Progress value={location.budget > 0 ? (location.spent / location.budget) * 100 : 0} className="h-2 mt-3" />
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4"><p className="text-sm text-yellow-800">{error}</p></CardContent>
                </Card>
            )}

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                    >
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form Drawer */}
            <SlideInDrawer
                isOpen={formOpen}
                onClose={() => { setFormOpen(false); setEditing(null) }}
                title={editing ? 'Edit Budget Item' : 'New Budget Item'}
                description="Track your spending by category"
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <Input
                            value={form.category}
                            onChange={(e) => {
                                setForm(prev => ({ ...prev, category: e.target.value }))
                                if (formErrors.category) setFormErrors(prev => { const n = { ...prev }; delete n.category; return n })
                            }}
                            placeholder="e.g. Personnel, Operations, Marketing"
                            maxLength={60}
                            className={formErrors.category ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="Letters only (no digits or special characters)" error={formErrors.category} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Allocated Amount ($) *</label>
                        <Input
                            type="number"
                            value={form.allocated}
                            onChange={(e) => setForm(prev => ({ ...prev, allocated: e.target.value }))}
                            onKeyDown={filterNumberInput}
                            placeholder="50000"
                            className={formErrors.allocated ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="Positive number (USD)" error={formErrors.allocated} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Spent Amount ($)</label>
                        <Input
                            type="number"
                            value={form.spent}
                            onChange={(e) => setForm(prev => ({ ...prev, spent: e.target.value }))}
                            onKeyDown={filterNumberInput}
                            placeholder="0"
                            className={formErrors.spent ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="Cannot exceed allocated" error={formErrors.spent} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            placeholder="Optional notes about this budget item"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.notes ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint="Max 500 characters" error={formErrors.notes} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button
                            type="button"
                            onClick={() => { setFormOpen(false); setEditing(null) }}
                            disabled={submitting}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editing ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </SlideInDrawer>

            {/* Delete confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-50 rounded-full"><AlertCircle className="w-6 h-6 text-red-600" /></div>
                                <h2 className="text-xl font-bold text-gray-900">Delete Budget Item</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <span className="font-semibold">{deleteTarget.category}</span>?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
