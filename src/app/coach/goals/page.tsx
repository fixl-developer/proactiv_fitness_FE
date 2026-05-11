'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Plus, Pencil, Trash2, Search, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { coachService, type CoachGoalItem } from '@/services/modules/coach.service'

const PRIORITIES = ['low', 'medium', 'high'] as const
const STATUSES = ['active', 'achieved', 'missed', 'archived'] as const

const today = () => new Date().toISOString().slice(0, 10)
const monthFromNow = () => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().slice(0, 10)
}

const emptyForm = {
    title: '',
    description: '',
    metric: '',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    deadline: monthFromNow(),
    priority: 'medium' as typeof PRIORITIES[number],
    status: 'active' as typeof STATUSES[number],
}

export default function GoalsPage() {
    const [items, setItems] = useState<CoachGoalItem[]>([])
    const [loading, setLoading] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const load = async () => {
        try {
            setLoading(true)
            const r = await coachService.getGoals({ search: searchTerm || undefined })
            setItems(r.data || [])
        } catch (e: any) {
            toast.error(e?.message || 'Failed to load goals')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [searchTerm])

    // Reusable: must contain letters, basic punctuation. Used for Title/Metric/Unit.
    const isAlphaText = (v: string): boolean => {
        const t = v.trim()
        if (!t) return false
        if (!/[A-Za-z]/.test(t)) return false
        if (!/^[A-Za-z0-9\s.,'%/+\-]+$/.test(t)) return false
        return true
    }

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.title.trim()) e.title = 'Title is required'
        else if (form.title.trim().length < 3) e.title = 'Title must be at least 3 characters'
        else if (form.title.length > 120) e.title = 'Title too long (max 120)'
        else if (!isAlphaText(form.title)) e.title = 'Title must contain letters — no symbol-only input'
        if (!form.metric.trim()) e.metric = 'Metric is required (e.g. classes, students, satisfaction)'
        else if (!isAlphaText(form.metric)) e.metric = 'Metric must contain letters — no symbol/number-only input'
        if (form.targetValue <= 0) e.targetValue = 'Target value must be greater than 0'
        else if (form.targetValue <= form.currentValue) e.targetValue = 'Target must be greater than current value'
        if (form.currentValue < 0) e.currentValue = 'Current value cannot be negative'
        if (form.unit.trim() && !/^[A-Za-z%/.0-9\s-]+$/.test(form.unit.trim())) {
            e.unit = 'Unit can only contain letters, digits, %, /, and basic punctuation'
        }
        if (!form.deadline) e.deadline = 'Deadline is required'
        else if (form.deadline < today()) e.deadline = 'Deadline must be today or later'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const reset = () => { setForm(emptyForm); setEditingId(null); setErrors({}) }

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault()
        if (!validate()) { toast.error('Please fix the highlighted fields'); return }
        try {
            setSubmitting(true)
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                metric: form.metric.trim(),
                targetValue: Number(form.targetValue),
                currentValue: Number(form.currentValue),
                unit: form.unit.trim(),
                deadline: form.deadline,
                priority: form.priority,
                status: form.status,
            }
            if (editingId) {
                await coachService.updateGoal(editingId, payload)
                toast.success('Goal updated')
            } else {
                await coachService.createGoal(payload)
                toast.success('Goal created')
            }
            setDrawerOpen(false); reset()
            await load()
        } catch (e: any) {
            toast.error(e?.message || 'Save failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (it: CoachGoalItem) => {
        setForm({
            title: it.title,
            description: it.description || '',
            metric: it.metric,
            targetValue: it.targetValue,
            currentValue: it.currentValue,
            unit: it.unit || '',
            deadline: typeof it.deadline === 'string' ? it.deadline.slice(0, 10) : '',
            priority: it.priority,
            status: it.status,
        })
        setEditingId(it._id || it.id || null)
        setDrawerOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await coachService.deleteGoal(id)
            toast.success('Goal deleted')
            setDeleteConfirm(null)
            await load()
        } catch (e: any) {
            toast.error(e?.message || 'Delete failed')
        }
    }

    const priorityColor = (p: string) => ({
        low: 'bg-slate-100 text-slate-700',
        medium: 'bg-blue-100 text-blue-800',
        high: 'bg-red-100 text-red-800',
    } as any)[p] || 'bg-gray-100 text-gray-700'

    const statusColor = (s: string) => ({
        active: 'bg-amber-100 text-amber-800',
        achieved: 'bg-green-100 text-green-800',
        missed: 'bg-red-100 text-red-800',
        archived: 'bg-slate-100 text-slate-500',
    } as any)[s] || 'bg-gray-100 text-gray-700'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-8 h-8 text-pink-600" />
                            <h1 className="text-3xl font-bold text-slate-900">Goals & Targets</h1>
                        </div>
                        <p className="text-slate-600 text-sm">Set and track your personal coaching goals</p>
                    </div>
                    <button
                        onClick={() => { reset(); setDrawerOpen(true) }}
                        className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition"
                    >
                        <Plus className="w-4 h-4" /> Set Goal
                    </button>
                </motion.div>

                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search goals..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                </div>

                {loading ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-3" />
                        <p className="text-slate-600 text-sm">Loading...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600">No goals set yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map(it => {
                            const id = it._id || it.id || ''
                            const pct = it.targetValue > 0 ? Math.min(100, Math.round((it.currentValue / it.targetValue) * 100)) : 0
                            return (
                                <motion.div
                                    key={id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg shadow p-5 hover:shadow-md transition"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-semibold text-slate-900 text-base flex-1">{it.title}</h3>
                                        {it.status === 'achieved' && <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0 ml-2" />}
                                    </div>
                                    {it.description && <p className="text-xs text-slate-600 mb-3">{it.description}</p>}
                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600">{it.metric}</span>
                                            <span className="font-medium text-slate-900">{it.currentValue} / {it.targetValue} {it.unit}</span>
                                        </div>
                                        <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                                            <div className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : 'bg-pink-500'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span>{pct}% complete</span>
                                            <span>Due {new Date(it.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex gap-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor(it.priority)}`}>{it.priority}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(it.status)}`}>{it.status}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(it)} className="p-1.5 text-pink-600 hover:bg-pink-50 rounded transition"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => setDeleteConfirm(id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                <SlideInDrawer
                    isOpen={drawerOpen}
                    onClose={() => { setDrawerOpen(false); reset() }}
                    title={editingId ? 'Edit Goal' : 'Set New Goal'}
                    size="md"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => { setForm({ ...form, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }) }}
                                placeholder="e.g., Reach 50 students this month"
                                maxLength={120}
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-pink-500'}`}
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                rows={2}
                                placeholder="Why is this goal important?"
                                className="w-full px-3 py-2 border border-slate-300 rounded text-sm resize-y focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Metric <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.metric}
                                onChange={e => { setForm({ ...form, metric: e.target.value }); if (errors.metric) setErrors({ ...errors, metric: '' }) }}
                                placeholder="e.g., Students enrolled, Classes taught, Avg satisfaction"
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.metric ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-pink-500'}`}
                            />
                            {errors.metric && <p className="mt-1 text-xs text-red-600">{errors.metric}</p>}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Current</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.currentValue}
                                    onChange={e => { setForm({ ...form, currentValue: Number(e.target.value) }); if (errors.currentValue) setErrors({ ...errors, currentValue: '' }) }}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.currentValue ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-pink-500'}`}
                                />
                                {errors.currentValue && <p className="mt-1 text-xs text-red-600">{errors.currentValue}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Target <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.targetValue}
                                    onChange={e => { setForm({ ...form, targetValue: Number(e.target.value) }); if (errors.targetValue) setErrors({ ...errors, targetValue: '' }) }}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.targetValue ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-pink-500'}`}
                                />
                                {errors.targetValue && <p className="mt-1 text-xs text-red-600">{errors.targetValue}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Unit</label>
                                <input
                                    type="text"
                                    value={form.unit}
                                    onChange={e => { setForm({ ...form, unit: e.target.value }); if (errors.unit) setErrors({ ...errors, unit: '' }) }}
                                    placeholder="e.g., %, /5"
                                    maxLength={20}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.unit ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-pink-500'}`}
                                />
                                {errors.unit && <p className="mt-1 text-xs text-red-600">{errors.unit}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Deadline <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={form.deadline}
                                    min={today()}
                                    onChange={e => { setForm({ ...form, deadline: e.target.value }); if (errors.deadline) setErrors({ ...errors, deadline: '' }) }}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.deadline ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-pink-500'}`}
                                />
                                {errors.deadline && <p className="mt-1 text-xs text-red-600">{errors.deadline}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Priority</label>
                                <select
                                    value={form.priority}
                                    onChange={e => setForm({ ...form, priority: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                </select>
                            </div>
                        </div>
                        {editingId && (
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Status</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <button type="button" onClick={() => { setDrawerOpen(false); reset() }} className="flex-1 px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Cancel</button>
                            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-pink-600 text-white rounded text-sm font-medium hover:bg-pink-700 transition disabled:opacity-50">{submitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
                        </div>
                    </form>
                </SlideInDrawer>

                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Delete goal?</h3>
                            <p className="text-sm text-slate-600 mb-5">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}
