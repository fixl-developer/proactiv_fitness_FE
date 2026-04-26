'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { coachService, type StudentProgressItem } from '@/services/modules/coach.service'

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const

const emptyForm = {
    studentId: '',
    studentName: '',
    skillName: '',
    level: 'beginner' as typeof LEVELS[number],
    masteryPercent: 0,
    notes: '',
    sessionDate: new Date().toISOString().slice(0, 10),
}

export default function StudentProgressPage() {
    const [items, setItems] = useState<StudentProgressItem[]>([])
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
            const r = await coachService.getProgressEntries({ search: searchTerm || undefined })
            setItems(r.data || [])
        } catch (e: any) {
            toast.error(e?.message || 'Failed to load')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [searchTerm])

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.studentId.trim()) e.studentId = 'Student ID is required'
        else if (!/^[a-f0-9]{24}$/i.test(form.studentId.trim())) e.studentId = 'Must be a valid 24-char Mongo ID'
        if (form.studentName && !/^[A-Za-z\s'-]+$/.test(form.studentName)) e.studentName = 'Name can only contain letters, spaces, hyphens, apostrophes'
        if (!form.skillName.trim()) e.skillName = 'Skill name is required'
        if (form.masteryPercent < 0 || form.masteryPercent > 100) e.masteryPercent = 'Mastery must be between 0 and 100'
        if (!form.sessionDate) e.sessionDate = 'Session date is required'
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
                studentId: form.studentId.trim(),
                studentName: form.studentName.trim(),
                skillName: form.skillName.trim(),
                level: form.level,
                masteryPercent: Number(form.masteryPercent),
                notes: form.notes.trim(),
                sessionDate: form.sessionDate,
            }
            if (editingId) {
                await coachService.updateProgressEntry(editingId, payload)
                toast.success('Progress updated')
            } else {
                await coachService.createProgressEntry(payload)
                toast.success('Progress recorded')
            }
            setDrawerOpen(false); reset()
            await load()
        } catch (e: any) {
            toast.error(e?.message || 'Save failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (it: StudentProgressItem) => {
        setForm({
            studentId: it.studentId,
            studentName: it.studentName,
            skillName: it.skillName,
            level: it.level,
            masteryPercent: it.masteryPercent,
            notes: it.notes || '',
            sessionDate: typeof it.sessionDate === 'string' ? it.sessionDate.slice(0, 10) : '',
        })
        setEditingId(it._id || it.id || null)
        setDrawerOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await coachService.deleteProgressEntry(id)
            toast.success('Entry deleted')
            setDeleteConfirm(null)
            await load()
        } catch (e: any) {
            toast.error(e?.message || 'Delete failed')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-8 h-8 text-emerald-600" />
                            <h1 className="text-3xl font-bold text-slate-900">Student Progress</h1>
                        </div>
                        <p className="text-slate-600 text-sm">Track skill mastery and progress for each student</p>
                    </div>
                    <button
                        onClick={() => { reset(); setDrawerOpen(true) }}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                    >
                        <Plus className="w-4 h-4" /> Record Progress
                    </button>
                </motion.div>

                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by student or skill..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
                            <p className="text-slate-600 text-sm">Loading...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-12 text-center">
                            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600">No progress entries yet</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Skill</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Level</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Mastery</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {items.map(it => {
                                    const id = it._id || it.id || ''
                                    return (
                                        <tr key={id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{it.studentName}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{it.skillName}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 capitalize">{it.level}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden max-w-[100px]">
                                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${it.masteryPercent}%` }} />
                                                    </div>
                                                    <span className="text-xs text-slate-700 font-medium">{it.masteryPercent}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{new Date(it.sessionDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex gap-1">
                                                    <button onClick={() => handleEdit(it)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition"><Pencil className="w-4 h-4" /></button>
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

                <SlideInDrawer
                    isOpen={drawerOpen}
                    onClose={() => { setDrawerOpen(false); reset() }}
                    title={editingId ? 'Edit Progress Entry' : 'New Progress Entry'}
                    size="md"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Student ID <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.studentId}
                                onChange={e => { setForm({ ...form, studentId: e.target.value }); if (errors.studentId) setErrors({ ...errors, studentId: '' }) }}
                                placeholder="24-char Mongo ID"
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.studentId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-emerald-500'}`}
                            />
                            {errors.studentId && <p className="mt-1 text-xs text-red-600">{errors.studentId}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Student Name (optional, auto-resolved)</label>
                            <input
                                type="text"
                                value={form.studentName}
                                onKeyDown={e => { if (e.key.length === 1 && !/^[A-Za-z\s'-]$/.test(e.key)) e.preventDefault() }}
                                onChange={e => { setForm({ ...form, studentName: e.target.value }); if (errors.studentName) setErrors({ ...errors, studentName: '' }) }}
                                placeholder="Leave blank to look up automatically"
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.studentName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-emerald-500'}`}
                            />
                            {errors.studentName && <p className="mt-1 text-xs text-red-600">{errors.studentName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Skill Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.skillName}
                                onChange={e => { setForm({ ...form, skillName: e.target.value }); if (errors.skillName) setErrors({ ...errors, skillName: '' }) }}
                                placeholder="e.g., Cartwheel, Round-off, Back handspring"
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.skillName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-emerald-500'}`}
                            />
                            {errors.skillName && <p className="mt-1 text-xs text-red-600">{errors.skillName}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Level</label>
                                <select
                                    value={form.level}
                                    onChange={e => setForm({ ...form, level: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Mastery %</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={form.masteryPercent}
                                    onChange={e => { setForm({ ...form, masteryPercent: Number(e.target.value) }); if (errors.masteryPercent) setErrors({ ...errors, masteryPercent: '' }) }}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.masteryPercent ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-emerald-500'}`}
                                />
                                {errors.masteryPercent && <p className="mt-1 text-xs text-red-600">{errors.masteryPercent}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Session Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={form.sessionDate}
                                onChange={e => { setForm({ ...form, sessionDate: e.target.value }); if (errors.sessionDate) setErrors({ ...errors, sessionDate: '' }) }}
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.sessionDate ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-emerald-500'}`}
                            />
                            {errors.sessionDate && <p className="mt-1 text-xs text-red-600">{errors.sessionDate}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                rows={3}
                                placeholder="Observations, what to work on next..."
                                className="w-full px-3 py-2 border border-slate-300 rounded text-sm resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <button type="button" onClick={() => { setDrawerOpen(false); reset() }} className="flex-1 px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Cancel</button>
                            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50">{submitting ? 'Saving...' : (editingId ? 'Update' : 'Record')}</button>
                        </div>
                    </form>
                </SlideInDrawer>

                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Delete entry?</h3>
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
