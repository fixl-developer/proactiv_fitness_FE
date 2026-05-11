'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon,
    AlertCircle, Plus, Edit2, Trash2, X, Loader2, Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { RegionalAdminService } from '@/services/regionalAdminService'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { validateRequired, validateNumber, validateTitle, filterNumberInput } from '@/utils/validation'

interface BenchmarkMetric {
    id: string
    metric: string
    regional: number
    national: number
    target: number
    unit?: string
    status: string
}

export default function RegionalBenchmarksPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('30d')
    const [benchmarkData, setBenchmarkData] = useState<BenchmarkMetric[]>([])
    const [locationComparison, setLocationComparison] = useState<any[]>([])
    const [trendData, setTrendData] = useState<any[]>([])
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    // Form drawer
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<BenchmarkMetric | null>(null)
    const [form, setForm] = useState({ metric: '', target: '', unit: '', notes: '' })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<BenchmarkMetric | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 4000)
        return () => clearTimeout(t)
    }, [toast])

    const loadBenchmarks = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await RegionalAdminService.getBenchmarks(timeRange)
            const metrics: BenchmarkMetric[] = (data?.metrics || []).map((m: any) => ({
                id: m.id || m.metric,
                metric: m.metric,
                regional: Number(m.regional) || 0,
                national: Number(m.national) || 0,
                target: Number(m.target) || Number(m.national) || 0,
                unit: m.unit || '',
                status: m.status || 'ON_TARGET',
            }))
            setBenchmarkData(metrics)

            setLocationComparison((data?.locationBenchmarks || []).map((l: any) => ({
                name: l.location,
                revenue: l.revenueActual || 0,
                target: l.revenueTarget || 0,
                status: (l.revenueActual || 0) > (l.revenueTarget || 0) ? 'EXCEEDING' : (l.revenueActual || 0) === (l.revenueTarget || 0) ? 'ON_TARGET' : 'BELOW'
            })))

            setTrendData((data?.trendData || []).map((t: any) => ({
                month: t.month,
                regional: (t.regional || 0) * 1000,
                national: (t.national || 0) * 1000,
                target: (t.regional || 0) * 1050
            })))
        } catch (err: any) {
            console.error('Error loading benchmarks:', err)
            setToast({ message: err.message || 'Failed to load benchmarks', type: 'error' })
            setBenchmarkData([]); setLocationComparison([]); setTrendData([])
        } finally {
            setIsLoading(false)
        }
    }, [timeRange])

    useEffect(() => { loadBenchmarks() }, [loadBenchmarks])

    const openAdd = () => {
        setEditing(null)
        setForm({ metric: '', target: '', unit: '', notes: '' })
        setFormErrors({})
        setFormOpen(true)
    }

    const openEdit = (item: BenchmarkMetric) => {
        setEditing(item)
        setForm({ metric: item.metric, target: String(item.target), unit: item.unit || '', notes: '' })
        setFormErrors({})
        setFormOpen(true)
    }

    const validateForm = (): boolean => {
        const errs: Record<string, string> = {}
        // Metric name — reject "@@@###"-style input (must start with a letter).
        const metricErr = validateTitle(form.metric, 'Metric name', 120); if (metricErr) errs.metric = metricErr
        const targetErr = validateNumber(form.target, 'Target value', 0, 100000000); if (targetErr) errs.target = targetErr
        if (form.unit && form.unit.length > 20) errs.unit = 'Unit must be less than 20 characters'
        if (form.notes && form.notes.length > 500) errs.notes = 'Notes must be less than 500 characters'
        setFormErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return
        setSubmitting(true)
        try {
            const payload = {
                metric: form.metric.trim(),
                target: Number(form.target),
                unit: form.unit.trim() || undefined,
                notes: form.notes.trim() || undefined,
            }
            if (editing) {
                await RegionalAdminService.updateBenchmarkTarget(editing.id, payload)
                setToast({ message: 'Benchmark updated', type: 'success' })
            } else {
                await RegionalAdminService.createBenchmarkTarget(payload)
                setToast({ message: 'Benchmark created', type: 'success' })
            }
            setFormOpen(false)
            loadBenchmarks()
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
            await RegionalAdminService.deleteBenchmarkTarget(deleteTarget.id)
            setToast({ message: 'Benchmark deleted', type: 'success' })
            setDeleteTarget(null)
            loadBenchmarks()
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to delete', type: 'error' })
        } finally {
            setDeleting(false)
        }
    }

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
                    <h1 className="text-3xl font-bold text-gray-900">Performance Benchmarks</h1>
                    <p className="text-gray-600 mt-1">Compare regional performance against targets & national averages</p>
                </div>
                <div className="flex gap-2">
                    <button
                        id="admin-regional-benchmarks-btn-add"
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Target
                    </button>
                    {['7d', '30d', '90d'].map((range) => (
                        <button
                            id={`admin-regional-benchmarks-range-${range}`}
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

            {/* Key Metrics */}
            {benchmarkData.length === 0 ? (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600 mb-3">No benchmark targets configured</p>
                        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add First Target</button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {benchmarkData.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{item.metric}</h3>
                                            {item.regional > item.national ? (
                                                <TrendingUp className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Badge variant={item.status === 'EXCEEDING' ? 'default' : item.status === 'ON_TARGET' ? 'secondary' : 'destructive'}>
                                                {item.status.replace('_', ' ')}
                                            </Badge>
                                            <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setDeleteTarget(item)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">Regional</span>
                                                <span className="text-sm font-bold text-blue-600">{item.regional}{item.unit}</span>
                                            </div>
                                            <Progress value={item.target > 0 ? Math.min((item.regional / item.target) * 100, 100) : 0} className="h-2 bg-blue-100" />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">National Avg</span>
                                                <span className="text-sm font-bold text-gray-600">{item.national}{item.unit}</span>
                                            </div>
                                            <Progress value={item.target > 0 ? Math.min((item.national / item.target) * 100, 100) : 0} className="h-2 bg-gray-100" />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">Target</span>
                                                <span className="text-sm font-bold text-green-600">{item.target}{item.unit}</span>
                                            </div>
                                            <Progress value={100} className="h-2 bg-green-100" />
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-600">
                                            {item.national > 0 && (
                                                item.regional > item.national
                                                    ? `+${((item.regional - item.national) / item.national * 100).toFixed(1)}% above national average`
                                                    : `${((item.regional - item.national) / item.national * 100).toFixed(1)}% below national average`
                                            )}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Trend */}
            {trendData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChartIcon className="w-5 h-5 text-blue-600" />
                            Revenue Trend Comparison
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => typeof value === 'number' ? `$${(value / 1000).toFixed(0)}K` : value} />
                                <Legend />
                                <Line type="monotone" dataKey="regional" stroke="#3b82f6" name="Regional" strokeWidth={2} />
                                <Line type="monotone" dataKey="national" stroke="#9ca3af" name="National Avg" strokeWidth={2} />
                                <Line type="monotone" dataKey="target" stroke="#10b981" name="Target" strokeWidth={2} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Location vs target */}
            {locationComparison.length > 0 && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Location Performance vs Target
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={locationComparison}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => typeof value === 'number' ? `$${(value / 1000).toFixed(0)}K` : value} />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                                    <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Location Performance Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {locationComparison.map((location: any, idx: number) => {
                                    const variance = location.revenue - location.target
                                    const variancePercent = location.target > 0 ? (variance / location.target * 100).toFixed(1) : '0.0'
                                    const isExceeding = variance > 0

                                    return (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{location.name}</p>
                                                <div className="flex items-center gap-4 mt-2 text-sm">
                                                    <span className="text-gray-600">Actual: ${(location.revenue / 1000).toFixed(0)}K</span>
                                                    <span className="text-gray-600">Target: ${(location.target / 1000).toFixed(0)}K</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={isExceeding ? 'default' : 'destructive'}>
                                                    {isExceeding ? '+' : ''}{variancePercent}%
                                                </Badge>
                                                <p className="text-xs text-gray-600 mt-1">{location.status.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </>
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
                title={editing ? 'Edit Benchmark Target' : 'New Benchmark Target'}
                description="Define a metric and its target value"
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Metric Name *</label>
                        <Input
                            value={form.metric}
                            onChange={(e) => {
                                setForm(prev => ({ ...prev, metric: e.target.value }))
                                if (formErrors.metric) setFormErrors(prev => { const n = { ...prev }; delete n.metric; return n })
                            }}
                            placeholder="e.g. Revenue/Location"
                            maxLength={120}
                            className={formErrors.metric ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="Must start with a letter — no symbol-only input" error={formErrors.metric} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Value *</label>
                        <Input
                            type="number"
                            value={form.target}
                            onChange={(e) => setForm(prev => ({ ...prev, target: e.target.value }))}
                            onKeyDown={filterNumberInput}
                            placeholder="150000"
                            className={formErrors.target ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="Positive number" error={formErrors.target} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <Input
                            value={form.unit}
                            onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
                            placeholder="e.g. %, USD, students"
                            className={formErrors.unit ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="Optional — up to 20 characters" error={formErrors.unit} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            placeholder="Optional notes"
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
                                <h2 className="text-xl font-bold text-gray-900">Delete Benchmark</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <span className="font-semibold">{deleteTarget.metric}</span>?
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
