'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { coachService, type CoachEquipmentItem } from '@/services/modules/coach.service'

const STATUSES = ['available', 'in_use', 'maintenance', 'broken', 'lost'] as const

const emptyForm = {
    name: '',
    category: 'general',
    quantity: 1,
    status: 'available' as typeof STATUSES[number],
    location: '',
    purchaseDate: '',
    lastMaintenanceDate: '',
    notes: '',
}

export default function EquipmentPage() {
    const [items, setItems] = useState<CoachEquipmentItem[]>([])
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
            const r = await coachService.getEquipment({ search: searchTerm || undefined })
            setItems(r.data || [])
        } catch (e: any) {
            toast.error(e?.message || 'Failed to load equipment')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [searchTerm])

    const todayISO = () => {
        const d = new Date()
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        return d.toISOString().slice(0, 10)
    }

    const validate = () => {
        const e: Record<string, string> = {}
        // Name — required, length, must contain letters, no all-symbol input.
        if (!form.name.trim()) e.name = 'Equipment name is required'
        else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
        else if (form.name.length > 100) e.name = 'Name must be 100 chars or fewer'
        else if (!/[A-Za-z]/.test(form.name)) e.name = 'Name must contain letters'
        else if (!/^[A-Za-z0-9\s.,'&()\-/]+$/.test(form.name.trim())) {
            e.name = 'Name has invalid characters (letters, digits, spaces, .,&\'()- only)'
        }
        // Quantity — must be ≥ 1 (zero is meaningless for inventory).
        if (form.quantity === undefined || form.quantity === null || isNaN(Number(form.quantity))) {
            e.quantity = 'Quantity is required'
        } else if (form.quantity < 1) {
            e.quantity = 'Quantity must be at least 1'
        } else if (form.quantity > 10000) {
            e.quantity = 'Quantity is unrealistically large'
        }
        // Status — required (always defaults to "available", but be explicit)
        if (!form.status) e.status = 'Status is required'
        // Location — must contain letters when provided
        if (form.location.trim() && !/[A-Za-z]/.test(form.location)) {
            e.location = 'Location must contain letters'
        }
        // Purchase Date — cannot be in the future.
        if (form.purchaseDate && form.purchaseDate > todayISO()) {
            e.purchaseDate = 'Purchase date cannot be in the future'
        }
        // Maintenance vs purchase
        if (form.purchaseDate && form.lastMaintenanceDate && form.lastMaintenanceDate < form.purchaseDate) {
            e.lastMaintenanceDate = 'Maintenance date cannot be before purchase date'
        }
        if (form.lastMaintenanceDate && form.lastMaintenanceDate > todayISO()) {
            e.lastMaintenanceDate = 'Maintenance date cannot be in the future'
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const reset = () => { setForm(emptyForm); setEditingId(null); setErrors({}) }

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault()
        if (!validate()) { toast.error('Please fix the highlighted fields'); return }
        try {
            setSubmitting(true)
            const payload: any = {
                name: form.name.trim(),
                category: form.category.trim() || 'general',
                quantity: Number(form.quantity),
                status: form.status,
                location: form.location.trim(),
                notes: form.notes.trim(),
            }
            if (form.purchaseDate) payload.purchaseDate = form.purchaseDate
            if (form.lastMaintenanceDate) payload.lastMaintenanceDate = form.lastMaintenanceDate

            if (editingId) {
                await coachService.updateEquipment(editingId, payload)
                toast.success('Equipment updated')
            } else {
                await coachService.createEquipment(payload)
                toast.success('Equipment added')
            }
            setDrawerOpen(false); reset()
            await load()
        } catch (e: any) {
            toast.error(e?.message || 'Save failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (it: CoachEquipmentItem) => {
        setForm({
            name: it.name,
            category: it.category || 'general',
            quantity: it.quantity || 1,
            status: it.status,
            location: it.location || '',
            purchaseDate: it.purchaseDate ? String(it.purchaseDate).slice(0, 10) : '',
            lastMaintenanceDate: it.lastMaintenanceDate ? String(it.lastMaintenanceDate).slice(0, 10) : '',
            notes: it.notes || '',
        })
        setEditingId(it._id || it.id || null)
        setDrawerOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await coachService.deleteEquipment(id)
            toast.success('Equipment deleted')
            setDeleteConfirm(null)
            await load()
        } catch (e: any) {
            toast.error(e?.message || 'Delete failed')
        }
    }

    const statusColor = (s: string) => ({
        available: 'bg-green-100 text-green-800',
        in_use: 'bg-blue-100 text-blue-800',
        maintenance: 'bg-amber-100 text-amber-800',
        broken: 'bg-red-100 text-red-800',
        lost: 'bg-slate-100 text-slate-700',
    } as any)[s] || 'bg-gray-100 text-gray-700'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="w-8 h-8 text-orange-600" />
                            <h1 className="text-3xl font-bold text-slate-900">Equipment</h1>
                        </div>
                        <p className="text-slate-600 text-sm">Track your equipment inventory and maintenance status</p>
                    </div>
                    <button
                        onClick={() => { reset(); setDrawerOpen(true) }}
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition"
                    >
                        <Plus className="w-4 h-4" /> Add Equipment
                    </button>
                </motion.div>

                <div className="mb-4 relative">
                    <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search equipment..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-3" />
                            <p className="text-slate-600 text-sm">Loading...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600">No equipment yet</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Qty</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {items.map(it => {
                                    const id = it._id || it.id || ''
                                    return (
                                        <tr key={id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{it.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 capitalize">{it.category}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{it.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{it.location || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(it.status)}`}>{it.status.replace('_', ' ')}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex gap-1">
                                                    <button onClick={() => handleEdit(it)} className="p-2 text-orange-600 hover:bg-orange-50 rounded transition"><Pencil className="w-4 h-4" /></button>
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
                    title={editingId ? 'Edit Equipment' : 'Add Equipment'}
                    size="md"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }) }}
                                placeholder="e.g., Yoga Mat, Balance Beam"
                                maxLength={100}
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-orange-500'}`}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    placeholder="e.g., mats, balls"
                                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Quantity <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10000}
                                    value={form.quantity}
                                    onChange={e => { setForm({ ...form, quantity: Number(e.target.value) }); if (errors.quantity) setErrors({ ...errors, quantity: '' }) }}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-orange-500'}`}
                                />
                                {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value as any })}
                                className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Location</label>
                            <input
                                type="text"
                                value={form.location}
                                onChange={e => { setForm({ ...form, location: e.target.value }); if (errors.location) setErrors({ ...errors, location: '' }) }}
                                placeholder="e.g., Storage Room A"
                                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.location ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-orange-500'}`}
                            />
                            {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Purchase Date</label>
                                <input
                                    type="date"
                                    value={form.purchaseDate}
                                    max={todayISO()}
                                    onChange={e => { setForm({ ...form, purchaseDate: e.target.value }); if (errors.purchaseDate) setErrors({ ...errors, purchaseDate: '' }) }}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.purchaseDate ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-orange-500'}`}
                                />
                                {errors.purchaseDate && <p className="mt-1 text-xs text-red-600">{errors.purchaseDate}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">Last Maintenance</label>
                                <input
                                    type="date"
                                    value={form.lastMaintenanceDate}
                                    max={todayISO()}
                                    min={form.purchaseDate || undefined}
                                    onChange={e => { setForm({ ...form, lastMaintenanceDate: e.target.value }); if (errors.lastMaintenanceDate) setErrors({ ...errors, lastMaintenanceDate: '' }) }}
                                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.lastMaintenanceDate ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-orange-500'}`}
                                />
                                {errors.lastMaintenanceDate && <p className="mt-1 text-xs text-red-600">{errors.lastMaintenanceDate}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                                rows={2}
                                placeholder="Anything special to note..."
                                className="w-full px-3 py-2 border border-slate-300 rounded text-sm resize-y focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <button type="button" onClick={() => { setDrawerOpen(false); reset() }} className="flex-1 px-4 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Cancel</button>
                            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 transition disabled:opacity-50">{submitting ? 'Saving...' : (editingId ? 'Update' : 'Add')}</button>
                        </div>
                    </form>
                </SlideInDrawer>

                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Delete equipment?</h3>
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
