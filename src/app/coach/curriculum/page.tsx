'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Pencil, Trash2, Search, AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { coachService, type LessonPlan } from '@/services/modules/coach.service'

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const
const STATUSES = ['draft', 'published', 'completed', 'archived'] as const

const emptyForm = {
    title: '',
    week: 1,
    programName: '',
    level: 'beginner' as typeof LEVELS[number],
    skills: '' as string,
    drills: '' as string,
    duration: 60,
    objectives: '',
    notes: '',
    status: 'draft' as typeof STATUSES[number],
}

export default function CurriculumPage() {
    const [items, setItems] = useState<LessonPlan[]>([])
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
            const r = await coachService.getLessonPlans({ search: searchTerm || undefined })
            setItems(r.data || [])
        } catch (e: any) {
            toast.error(e?.message || 'Failed to load curriculum')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [searchTerm])

    // Reusable: must contain letters and at least one alphabetic word; reject
    // pure-symbol or pure-numeric input. Used by Title/Program/Skills/Drills.
    const isWordy = (v: string): boolean => {
        const t = v.trim()
        if (!t) return false
        if (!/[A-Za-z]/.test(t)) return false
        if (!/^[A-Za-z0-9\s.,'&()\-/]+$/.test(t)) return false
        return true
    }
    // Comma list — every entry must be wordy (letters + safe punctuation only).
    const validateCommaList = (v: string, label: string): string | null => {
        if (!v.trim()) return null // empty is allowed (optional fields)
        const parts = v.split(',').map(s => s.trim()).filter(Boolean)
        if (parts.length === 0) return null
        for (const p of parts) {
            if (!isWordy(p)) return `${label} entry "${p}" is invalid — letters required`
        }
        return null
    }

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.title.trim()) e.title = 'Title is required'
        else if (form.title.trim().length < 3) e.title = 'Title must be at least 3 characters'
        else if (form.title.length > 120) e.title = 'Title must be 120 chars or fewer'
        else if (!isWordy(form.title)) e.title = 'Title must contain letters — no symbol/number-only input'
        if (!form.week || form.week < 1 || form.week > 52) e.week = 'Week must be between 1 and 52'
        if (!form.duration || form.duration < 15) e.duration = 'Duration must be at least 15 minutes'
        if (form.programName.trim() && !isWordy(form.programName)) {
            e.programName = 'Program name must contain letters — no symbol/number-only input'
        }
        const skillsErr = validateCommaList(form.skills, 'Skills')
        if (skillsErr) e.skills = skillsErr
        const drillsErr = validateCommaList(form.drills, 'Drills')
        if (drillsErr) e.drills = drillsErr
        if (form.objectives && form.objectives.length > 1000) e.objectives = 'Objectives too long (max 1000)'
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
                week: Number(form.week),
                programName: form.programName.trim(),
                level: form.level,
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
                drills: form.drills.split(',').map(s => s.trim()).filter(Boolean),
                duration: Number(form.duration),
                objectives: form.objectives.trim(),
                notes: form.notes.trim(),
                status: form.status,
            }
            if (editingId) {
                await coachService.updateLessonPlan(editingId, payload)
                toast.success('Lesson plan updated')
            } else {
                await coachService.createLessonPlan(payload)
                toast.success('Lesson plan created')
            }
            setDrawerOpen(false); reset()
            await load()
        } catch (e: any) {
            toast.error(e?.message || 'Save failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (it: LessonPlan) => {
        setForm({
            title: it.title,
            week: it.week,
            programName: it.programName || '',
            level: it.level,
            skills: (it.skills || []).join(', '),
            drills: (it.drills || []).join(', '),
            duration: it.duration,
            objectives: it.objectives || '',
            notes: it.notes || '',
            status: it.status,
        })
        setEditingId(it._id || it.id || null)
        setDrawerOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await coachService.deleteLessonPlan(id)
            toast.success('Lesson plan deleted')
            setDeleteConfirm(null)
            await load()
        } catch (e: any) {
            toast.error(e?.message || 'Delete failed')
        }
    }

    const statusColor = (s: string) => ({
        draft: 'bg-gray-100 text-gray-800',
        published: 'bg-green-100 text-green-800',
        completed: 'bg-blue-100 text-blue-800',
        archived: 'bg-slate-100 text-slate-500',
    } as any)[s] || 'bg-gray-100 text-gray-800'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-8 h-8 text-indigo-600" />
                            <h1 className="text-3xl font-bold text-slate-900">Curriculum</h1>
                        </div>
                        <p className="text-slate-600 text-sm">Plan and track lesson plans for your programs</p>
                    </div>
                    <button
                        onClick={() => { reset(); setDrawerOpen(true) }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                    >
                        <Plus className="w-4 h-4" /> Add Lesson Plan
                    </button>
                </motion.div>

                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search lesson plans..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
                            <p className="text-slate-600 text-sm">Loading...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-12 text-center">
                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600">No lesson plans yet</p>
                            <p className="text-xs text-slate-500 mt-1">Click "Add Lesson Plan" to create one</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Week</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Level</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Skills</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {items.map(it => {
                                    const id = it._id || it.id || ''
                                    return (
                                        <tr key={id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{it.title}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">Week {it.week}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 capitalize">{it.level}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {it.skills?.length || 0} skills, {it.drills?.length || 0} drills
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(it.status)}`}>{it.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex gap-1">
                                                    <button onClick={() => handleEdit(it)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition"><Pencil className="w-4 h-4" /></button>
                                                    <button onClick={() => setDeleteConfirm(id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Drawer */}
                <SlideInDrawer
                    isOpen={drawerOpen}
                    onClose={() => { setDrawerOpen(false); reset() }}
                    title={editingId ? 'Edit Lesson Plan' : 'New Lesson Plan'}
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-900 mb-1">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => { setForm({ ...form, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }) }}
                                    placeholder="e.g., Forward Roll Progression"
                                    maxLength={120}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Week <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min={1}
                                    max={52}
                                    value={form.week}
                                    onChange={e => { setForm({ ...form, week: Number(e.target.value) }); if (errors.week) setErrors({ ...errors, week: '' }) }}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.week ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                />
                                {errors.week && <p className="mt-1 text-xs text-red-600">{errors.week}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Duration (min) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min={15}
                                    value={form.duration}
                                    onChange={e => { setForm({ ...form, duration: Number(e.target.value) }); if (errors.duration) setErrors({ ...errors, duration: '' }) }}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.duration ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                />
                                {errors.duration && <p className="mt-1 text-xs text-red-600">{errors.duration}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Level</label>
                                <select
                                    value={form.level}
                                    onChange={e => setForm({ ...form, level: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Status</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-900 mb-1">Program (optional)</label>
                                <input
                                    type="text"
                                    value={form.programName}
                                    onChange={e => { setForm({ ...form, programName: e.target.value }); if (errors.programName) setErrors({ ...errors, programName: '' }) }}
                                    placeholder="e.g., Tumbling Level 1"
                                    maxLength={120}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.programName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                />
                                {errors.programName && <p className="mt-1 text-xs text-red-600">{errors.programName}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-900 mb-1">Skills (comma-separated)</label>
                                <input
                                    type="text"
                                    value={form.skills}
                                    onChange={e => { setForm({ ...form, skills: e.target.value }); if (errors.skills) setErrors({ ...errors, skills: '' }) }}
                                    placeholder="e.g., balance, agility, flexibility"
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.skills ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                />
                                {errors.skills && <p className="mt-1 text-xs text-red-600">{errors.skills}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-900 mb-1">Drills (comma-separated)</label>
                                <input
                                    type="text"
                                    value={form.drills}
                                    onChange={e => { setForm({ ...form, drills: e.target.value }); if (errors.drills) setErrors({ ...errors, drills: '' }) }}
                                    placeholder="e.g., warm-up jog, mat rolls, cool-down stretch"
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.drills ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                />
                                {errors.drills && <p className="mt-1 text-xs text-red-600">{errors.drills}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-900 mb-1">Objectives</label>
                                <textarea
                                    value={form.objectives}
                                    onChange={e => { setForm({ ...form, objectives: e.target.value }); if (errors.objectives) setErrors({ ...errors, objectives: '' }) }}
                                    rows={3}
                                    maxLength={1000}
                                    placeholder="Learning objectives for this lesson"
                                    className={`w-full px-3 py-2 border rounded text-sm resize-y focus:outline-none focus:ring-2 ${errors.objectives ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                                />
                                {errors.objectives && <p className="mt-1 text-xs text-red-600">{errors.objectives}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-900 mb-1">Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    rows={2}
                                    placeholder="Any additional notes"
                                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => { setDrawerOpen(false); reset() }}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                            >Cancel</button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                            >{submitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}</button>
                        </div>
                    </form>
                </SlideInDrawer>

                {/* Delete confirm */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Delete Lesson Plan?</h3>
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
