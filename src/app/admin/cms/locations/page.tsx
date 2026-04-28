'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, MapPin, Loader2, Trash2, AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { CMSAdminService, LocationDetailData } from '@/services/cmsService'
import LocationDetailFullEditor from '@/components/admin/cms/LocationDetailFullEditor'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function toSlug(s: string): string {
    return String(s || '')
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export default function LocationDetailsPage() {
    const [locations, setLocations] = useState<LocationDetailData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [creating, setCreating] = useState(false)
    const [createDraft, setCreateDraft] = useState({ name: '', slug: '', address: '' })
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    const refresh = async () => {
        try {
            setLoading(true)
            const all = await CMSAdminService.locationDetails.getAll()
            const items: LocationDetailData[] = Array.isArray(all)
                ? all.map((d: any) => ({ ...d, id: d.id || d._id }))
                : []
            setLocations(items)
            // Auto-select first if no selection or selection no longer exists
            if (items.length > 0 && (!selectedId || !items.find(i => i.id === selectedId))) {
                setSelectedId(items[0].id)
            } else if (items.length === 0) {
                setSelectedId(null)
            }
        } catch (e: any) {
            toast.error('Failed to load locations: ' + (e?.response?.data?.message || e?.message || ''))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { refresh() }, [])

    const selected = locations.find(l => l.id === selectedId) || null

    const handleCreate = async () => {
        const errs: Record<string, string> = {}
        if (!createDraft.name.trim()) errs.name = 'Name is required'
        if (!createDraft.slug.trim()) errs.slug = 'Slug is required'
        else if (!SLUG_REGEX.test(createDraft.slug)) errs.slug = 'Slug must be lowercase letters/numbers/hyphens'
        if (!createDraft.address.trim()) errs.address = 'Address is required'
        if (locations.some(l => l.slug === createDraft.slug)) errs.slug = 'This slug is already used'
        setCreateErrors(errs)
        if (Object.keys(errs).length > 0) return

        try {
            setSubmitting(true)
            const created: any = await CMSAdminService.locationDetails.create({
                name: createDraft.name.trim(),
                slug: createDraft.slug.trim(),
                address: createDraft.address.trim(),
                phone: '',
                email: '',
                mapUrl: '',
                images: [],
                hours: [],
                facilities: [],
                schedule: [],
                team: [],
                isActive: true,
            })
            toast.success(`${createDraft.name} created`)
            setCreating(false)
            setCreateDraft({ name: '', slug: '', address: '' })
            setCreateErrors({})
            await refresh()
            const newId = created?.id || created?._id
            if (newId) setSelectedId(newId)
        } catch (e: any) {
            toast.error('Failed to create: ' + (e?.response?.data?.message || e?.message || ''))
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (loc: LocationDetailData) => {
        if (!confirm(`Delete "${loc.name}"? This cannot be undone.`)) return
        try {
            await CMSAdminService.locationDetails.delete(loc.id)
            toast.success(`${loc.name} deleted`)
            await refresh()
        } catch (e: any) {
            toast.error('Failed to delete: ' + (e?.response?.data?.message || e?.message || ''))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-blue-600 mb-1">Content Management</div>
                    <h1 className="text-3xl font-bold text-gray-900">Location Details</h1>
                    <p className="text-gray-500 text-sm mt-2 max-w-2xl">
                        Manage every location's basic info, opening hours, facilities, weekly class schedule, and on-site team.
                        Changes appear instantly on the public location pages (e.g. <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/locations/cyberport</code>).
                    </p>
                </div>
                <button
                    onClick={() => { setCreating(true); setCreateDraft({ name: '', slug: '', address: '' }); setCreateErrors({}) }}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg text-sm flex-shrink-0"
                >
                    <Plus className="w-4 h-4" /> New Location
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                    {/* Sidebar: list of locations */}
                    <aside className="bg-white border border-gray-200 rounded-xl overflow-hidden h-fit lg:sticky lg:top-4">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-semibold text-gray-900 text-sm">Locations ({locations.length})</h2>
                        </div>
                        {locations.length === 0 ? (
                            <div className="p-6 text-center">
                                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No locations yet.</p>
                                <p className="text-xs text-gray-400 mt-1">Click <strong>New Location</strong> to create one.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {locations.map(loc => {
                                    const active = selectedId === loc.id
                                    return (
                                        <li key={loc.id}>
                                            <div className={`flex items-stretch ${active ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                <button
                                                    onClick={() => setSelectedId(loc.id)}
                                                    className="flex-1 text-left px-4 py-3"
                                                >
                                                    <div className={`text-sm font-semibold ${active ? 'text-blue-700' : 'text-gray-900'}`}>
                                                        {loc.name || 'Untitled'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        /{loc.slug}
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(loc)}
                                                    title="Delete location"
                                                    className="px-3 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </aside>

                    {/* Main: full editor */}
                    <main>
                        {selected ? (
                            <LocationDetailFullEditor
                                key={selected.id}
                                location={selected}
                                onSaved={(updated) => {
                                    setLocations(prev => prev.map(l => (l.id === updated.id ? { ...updated, id: updated.id || (updated as any)._id } : l)))
                                }}
                                publicHref={`/locations/${selected.slug}`}
                            />
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Select a location from the sidebar to edit it.</p>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {/* Create modal */}
            {creating && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">New Location</h2>
                            <button onClick={() => setCreating(false)} className="p-1 text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={createDraft.name}
                                    onChange={e => setCreateDraft(d => ({ ...d, name: e.target.value, slug: d.slug || toSlug(e.target.value) }))}
                                    placeholder="e.g. Cyberport"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${createErrors.name ? 'border-red-400 focus:ring-red-500 bg-red-50/40' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                                {createErrors.name && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{createErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={createDraft.slug}
                                    onChange={e => setCreateDraft(d => ({ ...d, slug: e.target.value }))}
                                    placeholder="cyberport"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${createErrors.slug ? 'border-red-400 focus:ring-red-500 bg-red-50/40' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                                {createErrors.slug && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{createErrors.slug}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                                <textarea
                                    value={createDraft.address}
                                    onChange={e => setCreateDraft(d => ({ ...d, address: e.target.value }))}
                                    rows={2}
                                    placeholder="Street, building, city"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm resize-y ${createErrors.address ? 'border-red-400 focus:ring-red-500 bg-red-50/40' : 'border-gray-300 focus:ring-blue-500'}`}
                                />
                                {createErrors.address && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{createErrors.address}</p>}
                            </div>
                            <p className="text-xs text-gray-500">After creating, you can fill in opening hours, facilities, schedule, and team in the editor.</p>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                            <button onClick={() => setCreating(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancel</button>
                            <button
                                onClick={handleCreate}
                                disabled={submitting}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Create Location
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
