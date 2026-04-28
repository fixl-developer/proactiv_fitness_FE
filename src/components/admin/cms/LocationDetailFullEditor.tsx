'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Save, Loader2, Eye, MapPin, Plus, Trash2, ChevronDown, ChevronUp,
    Building2, Clock, Users, CalendarDays, AlertCircle, ArrowUp, ArrowDown,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { CMSAdminService, LocationDetailData } from '@/services/cmsService'
import ImageUploader from '@/components/admin/cms/ImageUploader'
import ImageArrayUploader from '@/components/admin/cms/ImageArrayUploader'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function toSlug(input: string): string {
    return String(input || '')
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
}

interface Props {
    location: LocationDetailData
    onSaved: (updated: LocationDetailData) => void
    publicHref?: string
}

export default function LocationDetailFullEditor({ location, onSaved, publicHref }: Props) {
    const [data, setData] = useState<LocationDetailData>(() => ({
        ...location,
        hours: location.hours || [],
        facilities: location.facilities || [],
        schedule: location.schedule || [],
        team: location.team || [],
        images: location.images || [],
    }))
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [openTab, setOpenTab] = useState<'basic' | 'hours' | 'facilities' | 'schedule' | 'team'>('basic')

    const update = (patch: Partial<LocationDetailData>) => {
        setData(d => ({ ...d, ...patch }))
        const keys = Object.keys(patch)
        setErrors(prev => {
            const next = { ...prev }
            keys.forEach(k => delete next[k])
            return next
        })
    }

    const validate = (): boolean => {
        const next: Record<string, string> = {}
        if (!data.name?.trim()) next.name = 'Name is required'
        if (!data.slug?.trim()) next.slug = 'Slug is required'
        else if (!SLUG_REGEX.test(data.slug)) next.slug = 'Slug must be lowercase letters, numbers and hyphens only'
        if (!data.address?.trim()) next.address = 'Address is required'
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = 'Email is invalid'
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSave = async () => {
        if (!validate()) {
            toast.error('Please fix the highlighted fields')
            return
        }
        try {
            setSaving(true)
            const updated = await CMSAdminService.locationDetails.update((data as any).id || (data as any)._id, data)
            if (updated) {
                setData(updated)
                onSaved(updated)
            }
            toast.success(`${data.name} saved`)
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Failed to save location')
        } finally {
            setSaving(false)
        }
    }

    // ---------- Hours helpers ----------
    const addHour = () => update({ hours: [...data.hours, { day: '', time: '' }] })
    const removeHour = (i: number) => update({ hours: data.hours.filter((_, idx) => idx !== i) })
    const updateHour = (i: number, patch: Partial<{ day: string; time: string }>) =>
        update({ hours: data.hours.map((h, idx) => (idx === i ? { ...h, ...patch } : h)) })

    // ---------- Facilities helpers ----------
    const addFacility = () => update({ facilities: [...data.facilities, { name: '', description: '', features: [] }] })
    const removeFacility = (i: number) => update({ facilities: data.facilities.filter((_, idx) => idx !== i) })
    const updateFacility = (i: number, patch: Partial<{ name: string; description: string; features: string[] }>) =>
        update({ facilities: data.facilities.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) })
    const addFacilityFeature = (i: number) => updateFacility(i, { features: [...(data.facilities[i]?.features || []), ''] })
    const removeFacilityFeature = (i: number, fIdx: number) =>
        updateFacility(i, { features: (data.facilities[i]?.features || []).filter((_, idx) => idx !== fIdx) })
    const updateFacilityFeature = (i: number, fIdx: number, value: string) =>
        updateFacility(i, { features: (data.facilities[i]?.features || []).map((feat, idx) => (idx === fIdx ? value : feat)) })

    // ---------- Schedule helpers ----------
    const addScheduleDay = () => update({ schedule: [...data.schedule, { day: '', slots: [] }] })
    const removeScheduleDay = (i: number) => update({ schedule: data.schedule.filter((_, idx) => idx !== i) })
    const updateScheduleDay = (i: number, patch: Partial<{ day: string }>) =>
        update({ schedule: data.schedule.map((d, idx) => (idx === i ? { ...d, ...patch } : d)) })
    const addSlot = (i: number) => {
        const day = data.schedule[i]
        const slots = [...(day.slots || []), { time: '', program: '', ageGroup: '', level: '', spots: 'Available' }]
        update({ schedule: data.schedule.map((d, idx) => (idx === i ? { ...d, slots } : d)) })
    }
    const removeSlot = (i: number, sIdx: number) => {
        const day = data.schedule[i]
        const slots = (day.slots || []).filter((_, idx) => idx !== sIdx)
        update({ schedule: data.schedule.map((d, idx) => (idx === i ? { ...d, slots } : d)) })
    }
    const updateSlot = (i: number, sIdx: number, patch: Partial<{ time: string; program: string; ageGroup: string; level: string; spots: string }>) => {
        const day = data.schedule[i]
        const slots = (day.slots || []).map((s, idx) => (idx === sIdx ? { ...s, ...patch } : s))
        update({ schedule: data.schedule.map((d, idx) => (idx === i ? { ...d, slots } : d)) })
    }
    const moveScheduleDay = (i: number, dir: 'up' | 'down') => {
        const target = dir === 'up' ? i - 1 : i + 1
        if (target < 0 || target >= data.schedule.length) return
        const sched = [...data.schedule]
        const tmp = sched[i]
        sched[i] = sched[target]
        sched[target] = tmp
        update({ schedule: sched })
    }

    // ---------- Team helpers ----------
    const addTeamMember = () => update({ team: [...data.team, { name: '', role: '', specialization: '', experience: '', image: '' }] })
    const removeTeamMember = (i: number) => update({ team: data.team.filter((_, idx) => idx !== i) })
    const updateTeamMember = (i: number, patch: Partial<{ name: string; role: string; specialization: string; experience: string; image: string }>) =>
        update({ team: data.team.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) })

    const tabs: { id: typeof openTab; label: string; icon: any; count?: number }[] = [
        { id: 'basic', label: 'Basic Info', icon: MapPin },
        { id: 'hours', label: 'Hours', icon: Clock, count: data.hours.length },
        { id: 'facilities', label: 'Facilities', icon: Building2, count: data.facilities.length },
        { id: 'schedule', label: 'Schedule', icon: CalendarDays, count: data.schedule.length },
        { id: 'team', label: 'Team', icon: Users, count: data.team.length },
    ]

    return (
        <div className="space-y-5">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-blue-600 mb-1">Editing Location</div>
                    <h2 className="text-2xl font-bold text-gray-900">{data.name || 'Untitled Location'}</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{data.slug || '—'}</code>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {publicHref && (
                        <Link
                            href={publicHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg font-medium hover:bg-gray-50 text-sm"
                        >
                            <Eye className="w-4 h-4" /> Preview
                        </Link>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-gray-200">
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const isActive = openTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setOpenTab(tab.id)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${isActive
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                            {typeof tab.count === 'number' && (
                                <span className={`ml-1 inline-flex items-center justify-center text-xs rounded-full px-1.5 min-w-[20px] ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
                {openTab === 'basic' && (
                    <motion.div
                        key="basic"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => update({ name: e.target.value, slug: data.slug || toSlug(e.target.value) })}
                                    placeholder="e.g. Cyberport"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${errors.name ? 'border-red-400 focus:ring-red-500 bg-red-50/40' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Slug <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={e => update({ slug: e.target.value })}
                                    placeholder="cyberport"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${errors.slug ? 'border-red-400 focus:ring-red-500 bg-red-50/40' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                />
                                {errors.slug && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.slug}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.address}
                                    onChange={e => update({ address: e.target.value })}
                                    rows={2}
                                    placeholder="Street, building, city"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm resize-y ${errors.address ? 'border-red-400 focus:ring-red-500 bg-red-50/40' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                />
                                {errors.address && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={e => update({ phone: e.target.value })}
                                    placeholder="+852 1234 5678"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => update({ email: e.target.value })}
                                    placeholder="location@example.com"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${errors.email ? 'border-red-400 focus:ring-red-500 bg-red-50/40' : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Map URL</label>
                                <input
                                    type="url"
                                    value={data.mapUrl}
                                    onChange={e => update({ mapUrl: e.target.value })}
                                    placeholder="https://maps.google.com/..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Images</label>
                                <ImageArrayUploader
                                    value={data.images}
                                    onChange={(imgs) => update({ images: imgs })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Photos shown on the location detail page.</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {openTab === 'hours' && (
                    <motion.div
                        key="hours"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">Opening Hours</h3>
                                <p className="text-xs text-gray-500">Day label + time range. Each row appears on the public Contact section.</p>
                            </div>
                            <button onClick={addHour} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                                <Plus className="w-4 h-4" /> Add Hours Row
                            </button>
                        </div>
                        {data.hours.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500">
                                No hours yet. Click <strong>Add Hours Row</strong> to start.
                            </div>
                        )}
                        <div className="space-y-2">
                            {data.hours.map((h, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-start p-3 border border-gray-200 rounded-lg bg-gray-50/60">
                                    <input
                                        type="text"
                                        value={h.day}
                                        onChange={e => updateHour(i, { day: e.target.value })}
                                        placeholder="Mon-Fri"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={h.time}
                                        onChange={e => updateHour(i, { time: e.target.value })}
                                        placeholder="3:30PM-8:30PM"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                    <button onClick={() => removeHour(i)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {openTab === 'facilities' && (
                    <motion.div
                        key="facilities"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">Facilities</h3>
                                <p className="text-xs text-gray-500">Each facility shows on the public page as a card with a feature list.</p>
                            </div>
                            <button onClick={addFacility} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                                <Plus className="w-4 h-4" /> Add Facility
                            </button>
                        </div>
                        {data.facilities.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 bg-white">
                                No facilities yet.
                            </div>
                        )}
                        {data.facilities.map((f, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 grid grid-cols-1 gap-3">
                                        <input
                                            type="text"
                                            value={f.name}
                                            onChange={e => updateFacility(i, { name: e.target.value })}
                                            placeholder="Facility name (e.g. Main Gymnasium)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                                        />
                                        <textarea
                                            value={f.description}
                                            onChange={e => updateFacility(i, { description: e.target.value })}
                                            rows={2}
                                            placeholder="Short description"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-y"
                                        />
                                    </div>
                                    <button onClick={() => removeFacility(i)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded flex-shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-700">Features</span>
                                        <button onClick={() => addFacilityFeature(i)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                                            <Plus className="w-3 h-3" /> Add feature
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(f.features || []).map((feat, fIdx) => (
                                            <div key={fIdx} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={feat}
                                                    onChange={e => updateFacilityFeature(i, fIdx, e.target.value)}
                                                    placeholder="Feature description"
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                />
                                                <button onClick={() => removeFacilityFeature(i, fIdx)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        {(!f.features || f.features.length === 0) && (
                                            <p className="text-xs text-gray-400 italic">No features yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {openTab === 'schedule' && (
                    <motion.div
                        key="schedule"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">Weekly Schedule</h3>
                                <p className="text-xs text-gray-500">One day per row, with class time slots inside each.</p>
                            </div>
                            <button onClick={addScheduleDay} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                                <Plus className="w-4 h-4" /> Add Day
                            </button>
                        </div>
                        {data.schedule.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 bg-white">
                                No schedule yet.
                            </div>
                        )}
                        {data.schedule.map((d, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <input
                                        type="text"
                                        value={d.day}
                                        onChange={e => updateScheduleDay(i, { day: e.target.value })}
                                        placeholder="Day label (e.g. Monday)"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-semibold"
                                    />
                                    <button onClick={() => moveScheduleDay(i, 'up')} disabled={i === 0} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30">
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => moveScheduleDay(i, 'down')} disabled={i === data.schedule.length - 1} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30">
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => removeScheduleDay(i)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-700">Class Slots</span>
                                        <button onClick={() => addSlot(i)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                                            <Plus className="w-3 h-3" /> Add slot
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(d.slots || []).map((s, sIdx) => (
                                            <div key={sIdx} className="grid grid-cols-1 md:grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_auto] gap-2 items-center p-2 bg-gray-50 rounded-lg">
                                                <input value={s.time} onChange={e => updateSlot(i, sIdx, { time: e.target.value })} placeholder="4:00 PM - 4:45 PM" className="px-2 py-1.5 border border-gray-300 rounded text-xs" />
                                                <input value={s.program} onChange={e => updateSlot(i, sIdx, { program: e.target.value })} placeholder="Beginner Class" className="px-2 py-1.5 border border-gray-300 rounded text-xs" />
                                                <input value={s.ageGroup} onChange={e => updateSlot(i, sIdx, { ageGroup: e.target.value })} placeholder="3-5 years" className="px-2 py-1.5 border border-gray-300 rounded text-xs" />
                                                <input value={s.level} onChange={e => updateSlot(i, sIdx, { level: e.target.value })} placeholder="Beginner" className="px-2 py-1.5 border border-gray-300 rounded text-xs" />
                                                <select value={s.spots} onChange={e => updateSlot(i, sIdx, { spots: e.target.value })} className="px-2 py-1.5 border border-gray-300 rounded text-xs bg-white">
                                                    <option value="Available">Available</option>
                                                    <option value="Limited">Limited</option>
                                                    <option value="Full">Full</option>
                                                </select>
                                                <button onClick={() => removeSlot(i, sIdx)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        {(!d.slots || d.slots.length === 0) && (
                                            <p className="text-xs text-gray-400 italic">No slots yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {openTab === 'team' && (
                    <motion.div
                        key="team"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">Team Members at this Location</h3>
                                <p className="text-xs text-gray-500">Quick-reference team for the location page. Manage the full team list at <Link href="/admin/cms/team" className="text-blue-600 underline">CMS → Team</Link>.</p>
                            </div>
                            <button onClick={addTeamMember} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                                <Plus className="w-4 h-4" /> Add Member
                            </button>
                        </div>
                        {data.team.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 bg-white">
                                No team members yet.
                            </div>
                        )}
                        {data.team.map((t, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-24">
                                        <ImageUploader
                                            value={t.image}
                                            onChange={url => updateTeamMember(i, { image: url })}
                                            label="Photo"
                                        />
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input value={t.name} onChange={e => updateTeamMember(i, { name: e.target.value })} placeholder="Full name" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                        <input value={t.role} onChange={e => updateTeamMember(i, { role: e.target.value })} placeholder="Role / title" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                        <input value={t.specialization} onChange={e => updateTeamMember(i, { specialization: e.target.value })} placeholder="Specialization" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                        <input value={t.experience} onChange={e => updateTeamMember(i, { experience: e.target.value })} placeholder="Experience (e.g. 10 years)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                    </div>
                                    <button onClick={() => removeTeamMember(i)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
