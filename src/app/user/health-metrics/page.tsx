'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Heart, TrendingUp, Activity, Zap, Plus, AlertCircle, LineChart, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { apiClient } from '@/services/api/client'
import {
    validateSelect,
    validateNumber,
    validateTextArea,
    validateRequired,
    filterNumberInput,
} from '@/utils/validation'

interface HealthMetric {
    _id: string
    metricType: string
    value: number
    unit: string
    measuredAt: string
    notes?: string
    createdAt?: string
}

const METRIC_TYPES = [
    'Weight',
    'Height',
    'Blood Pressure',
    'Heart Rate',
    'BMI',
    'Body Fat %',
    'Waist',
    'Chest',
    'Arms',
    'Legs',
    'Other',
]

const UNIT_MAP: Record<string, string[]> = {
    Weight: ['kg', 'lbs'],
    Height: ['cm', 'ft'],
    'Blood Pressure': ['mmHg'],
    'Heart Rate': ['bpm'],
    BMI: ['index'],
    'Body Fat %': ['%'],
    Waist: ['cm', 'in'],
    Chest: ['cm', 'in'],
    Arms: ['cm', 'in'],
    Legs: ['cm', 'in'],
    Other: ['unit'],
}

interface FormState {
    metricType: string
    value: string
    unit: string
    measuredAt: string
    notes: string
}

const EMPTY_FORM: FormState = {
    metricType: '',
    value: '',
    unit: '',
    measuredAt: '',
    notes: '',
}

function toDatetimeLocalNow() {
    const now = new Date()
    const tzOffset = now.getTimezoneOffset() * 60000
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16)
}

function formatDate(dateStr?: string) {
    if (!dateStr) return '--'
    try {
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return dateStr
    }
}

export default function HealthMetricsPage() {
    const [metrics, setMetrics] = useState<HealthMetric[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const loadMetrics = useCallback(async () => {
        setIsLoading(true)
        setLoadError(null)
        try {
            const res = await apiClient.get<any>('/user/health-metrics')
            const list: HealthMetric[] =
                res?.data?.metrics ||
                res?.data?.data ||
                res?.data ||
                res?.metrics ||
                (Array.isArray(res) ? res : []) ||
                []
            const normalized = Array.isArray(list) ? list : []
            normalized.sort((a, b) => {
                const aT = new Date(a.measuredAt || a.createdAt || 0).getTime()
                const bT = new Date(b.measuredAt || b.createdAt || 0).getTime()
                return bT - aT
            })
            setMetrics(normalized)
        } catch (err: any) {
            console.warn('Failed to load health metrics:', err)
            setLoadError(err?.response?.data?.message || err?.message || 'Failed to load metrics')
            setMetrics([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadMetrics()
    }, [loadMetrics])

    const openDrawer = () => {
        setForm({ ...EMPTY_FORM, measuredAt: toDatetimeLocalNow() })
        setErrors({})
        setDrawerOpen(true)
    }

    const closeDrawer = () => {
        if (submitting) return
        setDrawerOpen(false)
        setErrors({})
    }

    const handleMetricTypeChange = (value: string) => {
        const units = UNIT_MAP[value] || []
        setForm(prev => ({ ...prev, metricType: value, unit: units[0] || '' }))
        setErrors(prev => ({ ...prev, metricType: '', unit: '' }))
    }

    const validate = (): boolean => {
        const next: Record<string, string> = {}

        const metricTypeErr = validateSelect(form.metricType, 'Metric Type')
        if (metricTypeErr) next.metricType = metricTypeErr

        const valueErr = validateNumber(form.value, 'Value', 0.0001)
        if (valueErr) next.value = valueErr

        const unitErr = validateSelect(form.unit, 'Unit')
        if (unitErr) next.unit = unitErr

        const measuredAtErr = validateRequired(form.measuredAt, 'Measured at')
        if (measuredAtErr) {
            next.measuredAt = measuredAtErr
        } else {
            const measured = new Date(form.measuredAt)
            if (isNaN(measured.getTime())) {
                next.measuredAt = 'Please enter a valid date and time'
            } else if (measured.getTime() > Date.now()) {
                next.measuredAt = 'Measured at cannot be in the future'
            }
        }

        const notesErr = validateTextArea(form.notes, 'Notes', 0, 500)
        if (notesErr) next.notes = notesErr

        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSubmitting(true)
        try {
            const payload = {
                metricType: form.metricType,
                value: parseFloat(form.value),
                unit: form.unit,
                measuredAt: new Date(form.measuredAt).toISOString(),
                notes: form.notes?.trim() || undefined,
            }
            const res = await apiClient.post<any>('/user/health-metrics', payload)
            const saved: HealthMetric = res?.data?.metric || res?.data || res || {
                _id: `local-${Date.now()}`,
                ...payload,
                notes: payload.notes,
            }
            setMetrics(prev => [saved, ...prev])
            setDrawerOpen(false)
            setForm(EMPTY_FORM)
            setErrors({})
        } catch (err: any) {
            console.warn('Failed to save metric:', err)
            setErrors(prev => ({
                ...prev,
                submit: err?.response?.data?.message || err?.message || 'Failed to save metric',
            }))
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!id || !confirm('Delete this metric?')) return
        setDeletingId(id)
        try {
            await apiClient.delete(`/user/health-metrics/${id}`)
            setMetrics(prev => prev.filter(m => m._id !== id))
        } catch (err: any) {
            console.warn('Failed to delete metric:', err)
            alert(err?.response?.data?.message || err?.message || 'Failed to delete metric')
        } finally {
            setDeletingId(null)
        }
    }

    const availableUnits = form.metricType ? UNIT_MAP[form.metricType] || [] : []

    // Derive summary tiles from latest entries per type
    const latestByType = (type: string) =>
        metrics.find(m => (m.metricType || '').toLowerCase() === type.toLowerCase())

    const latestWeight = latestByType('Weight')
    const latestBMI = latestByType('BMI')
    const latestHR = latestByType('Heart Rate')
    const latestBP = latestByType('Blood Pressure')

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Health Metrics</h1>
                    <p className="text-gray-600 mt-2 text-sm font-medium">Track your fitness and health data</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadMetrics} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={openDrawer}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Metric
                    </Button>
                </div>
            </div>

            {/* Error banner */}
            {loadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800 flex-1">{loadError}</p>
                    <Button size="sm" variant="outline" onClick={loadMetrics}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Retry
                    </Button>
                </div>
            )}

            {/* Current Summary Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <Card className="p-4 border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-semibold">Weight</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">
                                {latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : '--'}
                            </p>
                            <p className="text-xs text-blue-600 font-semibold mt-1">
                                {latestWeight ? formatDate(latestWeight.measuredAt) : 'No data'}
                            </p>
                        </div>
                        <Activity className="w-8 h-8 text-blue-400" />
                    </div>
                </Card>

                <Card className="p-4 border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-700 font-semibold">BMI</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                                {latestBMI ? latestBMI.value.toFixed(1) : '--'}
                            </p>
                            <p className="text-xs text-purple-600 font-semibold mt-1">
                                {latestBMI ? formatDate(latestBMI.measuredAt) : 'No data'}
                            </p>
                        </div>
                        <LineChart className="w-8 h-8 text-purple-400" />
                    </div>
                </Card>

                <Card className="p-4 border-red-200/50 bg-gradient-to-br from-red-50 to-red-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-700 font-semibold">Heart Rate</p>
                            <p className="text-2xl font-bold text-red-900 mt-1">
                                {latestHR ? `${latestHR.value} ${latestHR.unit}` : '--'}
                            </p>
                            <p className="text-xs text-red-600 font-semibold mt-1">
                                {latestHR ? formatDate(latestHR.measuredAt) : 'No data'}
                            </p>
                        </div>
                        <Heart className="w-8 h-8 text-red-400" />
                    </div>
                </Card>

                <Card className="p-4 border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-semibold">Blood Pressure</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                                {latestBP ? `${latestBP.value} ${latestBP.unit}` : '--'}
                            </p>
                            <p className="text-xs text-green-600 font-semibold mt-1">
                                {latestBP ? formatDate(latestBP.measuredAt) : 'No data'}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                </Card>
            </motion.div>

            {/* Metrics History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card className="p-6 border-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Metrics History</h2>

                    {isLoading ? (
                        <div className="py-12 text-center text-gray-500">
                            <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                            Loading metrics...
                        </div>
                    ) : metrics.length === 0 ? (
                        <div className="py-12 text-center">
                            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No metrics logged yet</p>
                            <Button size="sm" variant="outline" className="mt-3" onClick={openDrawer}>
                                <Plus className="w-4 h-4 mr-1" /> Log your first metric
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200/50">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Metric</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Value</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Notes</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.map((metric, index) => (
                                        <motion.tr
                                            key={metric._id || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.03 }}
                                            className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                                {formatDate(metric.measuredAt)}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900">{metric.metricType}</td>
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                                {metric.value} {metric.unit}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                                                {metric.notes || '--'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(metric._id)}
                                                    disabled={deletingId === metric._id}
                                                >
                                                    {deletingId === metric._id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    )}
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Health Tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="p-6 border-emerald-200/50 bg-emerald-50/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Health Tips</h2>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900">Stay Active</p>
                                <p className="text-sm text-gray-600">Aim for at least 10,000 steps daily</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Heart className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900">Monitor Heart Rate</p>
                                <p className="text-sm text-gray-600">Normal resting heart rate is 60-100 bpm</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900">Maintain Healthy Weight</p>
                                <p className="text-sm text-gray-600">BMI between 18.5-24.9 is considered normal</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Log Health Metric Drawer */}
            <SlideInDrawer
                isOpen={drawerOpen}
                onClose={closeDrawer}
                title="Log Health Metric"
                description="Record a new health or fitness measurement"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={closeDrawer} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" /> Save Metric
                                </>
                            )}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {/* Metric Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Metric Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.metricType}
                            onChange={(e) => handleMetricTypeChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Select metric type</option>
                            {METRIC_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        {errors.metricType && (
                            <p className="text-xs text-red-600 mt-1">{errors.metricType}</p>
                        )}
                    </div>

                    {/* Value + Unit */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Value <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={form.value}
                                onKeyDown={filterNumberInput}
                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                placeholder="e.g. 72.5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            {errors.value && <p className="text-xs text-red-600 mt-1">{errors.value}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Unit <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                disabled={!form.metricType}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-400"
                            >
                                <option value="">Select unit</option>
                                {availableUnits.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                            {errors.unit && <p className="text-xs text-red-600 mt-1">{errors.unit}</p>}
                        </div>
                    </div>

                    {/* Measured At */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Measured At <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={form.measuredAt}
                            max={toDatetimeLocalNow()}
                            onChange={(e) => setForm({ ...form, measuredAt: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.measuredAt && (
                            <p className="text-xs text-red-600 mt-1">{errors.measuredAt}</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notes <span className="text-gray-400 text-xs font-normal">(optional, max 500)</span>
                        </label>
                        <textarea
                            rows={3}
                            maxLength={500}
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Any additional context..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                        <div className="flex items-center justify-between mt-1">
                            {errors.notes ? (
                                <p className="text-xs text-red-600">{errors.notes}</p>
                            ) : (
                                <span />
                            )}
                            <span className="text-xs text-gray-400">{form.notes.length}/500</span>
                        </div>
                    </div>

                    {/* Submit error */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700">{errors.submit}</p>
                        </div>
                    )}
                </div>
            </SlideInDrawer>
        </div>
    )
}
