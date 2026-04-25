'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, DoorOpen } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { RoomService, LocationService, type Room, type Location } from '@/services/businessConfigService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

const ROOM_TYPES = [
    { value: 'GYM_FLOOR', label: 'Gym Floor' },
    { value: 'STUDIO', label: 'Studio' },
    { value: 'CLASSROOM', label: 'Classroom' },
    { value: 'PARTY_ROOM', label: 'Party Room' },
    { value: 'OFFICE', label: 'Office' },
    { value: 'STORAGE', label: 'Storage' },
    { value: 'OTHER', label: 'Other' },
]

export default function RoomsTab() {
    const [rooms, setRooms] = useState<Room[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        locationId: '',
        type: '',
        capacity: 1,
        area: 0,
        floor: 0,
        isActive: true,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const loadRooms = async () => {
        try {
            setLoading(true)
            const response = await RoomService.getAll({ page: currentPage, limit: 10, search: searchTerm })
            setRooms(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Failed to load rooms:', error)
            toast.error('Failed to load rooms')
        } finally {
            setLoading(false)
        }
    }

    const loadLocations = async () => {
        try {
            const response = await LocationService.getAll({ limit: 500 })
            setLocations(response.data || [])
        } catch (error) {
            console.error('Failed to load locations:', error)
        }
    }

    useEffect(() => { loadRooms() }, [currentPage, searchTerm])
    useEffect(() => { loadLocations() }, [])

    const validateFormData = () => {
        const next: Record<string, string> = {}
        if (!formData.name?.trim()) next.name = 'Room name is required'
        else if (formData.name.length < 2) next.name = 'Room name must be at least 2 characters'
        if (!formData.code?.trim()) next.code = 'Room code is required'
        else if (!/^[A-Z0-9-]{2,15}$/.test(formData.code)) next.code = '2-15 uppercase letters/digits/hyphens'
        if (!formData.locationId) next.locationId = 'Location is required'
        if (!formData.type) next.type = 'Room type is required'
        if (formData.capacity < 1) next.capacity = 'Capacity must be at least 1'
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const resetForm = () => {
        setFormData({ name: '', code: '', locationId: '', type: '', capacity: 1, area: 0, floor: 0, isActive: true })
        setErrors({})
        setEditingId(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateFormData()) {
            toast.error('Please fix the highlighted fields')
            return
        }
        try {
            setSubmitting(true)
            if (editingId) {
                await RoomService.update(editingId, formData)
                toast.success('Room updated successfully')
            } else {
                await RoomService.create(formData)
                toast.success('Room created successfully')
            }
            setShowForm(false)
            resetForm()
            setCurrentPage(1)
            await loadRooms()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (r: Room) => {
        setFormData({
            name: r.name,
            code: r.code,
            locationId: typeof r.locationId === 'string' ? r.locationId : (r.locationId as any)?._id || '',
            type: r.type,
            capacity: r.capacity || 1,
            area: r.area || 0,
            floor: r.floor || 0,
            isActive: r.isActive,
        })
        setEditingId(r.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await RoomService.delete(id)
            toast.success('Room deleted successfully')
            setDeleteConfirm(null)
            await loadRooms()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const locationName = (locationId: any): string => {
        const id = typeof locationId === 'string' ? locationId : locationId?._id
        const l = locations.find(x => x.id === id)
        return l?.name || '—'
    }

    return (
        <div>
            {/* Controls */}
            <div className="mb-6 flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true) }}
                    disabled={locations.length === 0}
                    title={locations.length === 0 ? 'Create at least one location first' : 'Add room'}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                    Add Room
                </button>
            </div>

            {locations.length === 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm text-amber-900">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>No locations exist yet. Create one in the <strong>Locations</strong> tab before adding rooms.</span>
                </div>
            )}

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-slate-600">Loading rooms...</p>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="p-8 text-center">
                        <DoorOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No rooms found</p>
                        <p className="text-sm text-slate-500 mt-1">Click "Add Room" to create one</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Room</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Code</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Location</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Capacity</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {rooms.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{r.name}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{r.code}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{locationName(r.locationId)}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{ROOM_TYPES.find(t => t.value === r.type)?.label || r.type}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{r.capacity}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {r.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"><Pencil className="w-4 h-4" /></button>
                                                    <button onClick={() => setDeleteConfirm(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-sm text-slate-600">Page {currentPage} of {totalPages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"><ChevronLeft className="w-5 h-5" /></button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"><ChevronRight className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Form Drawer */}
            <SlideInDrawer isOpen={showForm} onClose={() => { setShowForm(false); resetForm() }} title={editingId ? 'Edit Room' : 'Add New Room'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">Room Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }) }}
                            placeholder="e.g., Studio A"
                            maxLength={80}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">Room Code <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => { setFormData({ ...formData, code: e.target.value.toUpperCase() }); if (errors.code) setErrors({ ...errors, code: '' }) }}
                            placeholder="e.g., STUDIO-A"
                            maxLength={15}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.code ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                        />
                        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">Location <span className="text-red-500">*</span></label>
                        <select
                            value={formData.locationId}
                            onChange={(e) => { setFormData({ ...formData, locationId: e.target.value }); if (errors.locationId) setErrors({ ...errors, locationId: '' }) }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.locationId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                        >
                            <option value="">Select Location</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        {errors.locationId && <p className="mt-1 text-sm text-red-600">{errors.locationId}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">Room Type <span className="text-red-500">*</span></label>
                        <select
                            value={formData.type}
                            onChange={(e) => { setFormData({ ...formData, type: e.target.value }); if (errors.type) setErrors({ ...errors, type: '' }) }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                        >
                            <option value="">Select Type</option>
                            {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Capacity <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                min={1}
                                value={formData.capacity}
                                onChange={(e) => { setFormData({ ...formData, capacity: Number(e.target.value) }); if (errors.capacity) setErrors({ ...errors, capacity: '' }) }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.capacity ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                            />
                            {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Area (sqm)</label>
                            <input
                                type="number"
                                min={0}
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Floor</label>
                            <input
                                type="number"
                                value={formData.floor}
                                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="sr-only" />
                                <div className={`w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${formData.isActive ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-0.5'}`} />
                                </div>
                            </div>
                            <span className="text-sm font-medium text-slate-900">Active</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-200">
                        <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                            {submitting ? 'Saving...' : editingId ? 'Update Room' : 'Create Room'}
                        </button>
                    </div>
                </form>
            </SlideInDrawer>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Room?</h3>
                        <p className="text-slate-600 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
