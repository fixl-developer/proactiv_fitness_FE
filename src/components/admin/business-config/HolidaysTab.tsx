'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, CalendarDays, X } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { HolidayCalendarService, CountryService, type HolidayCalendarItem, type Country } from '@/services/businessConfigService'
import { getErrorMessage } from '@/utils/apiErrorHandler'
import { validateTitle, validateFutureOrToday, todayISODate } from '@/utils/validation'

const HOLIDAY_TYPES = [
    { value: 'PUBLIC', label: 'Public Holiday' },
    { value: 'RELIGIOUS', label: 'Religious' },
    { value: 'BANK', label: 'Bank Holiday' },
    { value: 'OBSERVED', label: 'Observed' },
    { value: 'OTHER', label: 'Other' },
]

interface HolidayDraft {
    name: string
    date: string
    type: string
    isRecurring: boolean
    affectsScheduling: boolean
}

const emptyHoliday = (): HolidayDraft => ({
    name: '',
    date: '',
    type: 'PUBLIC',
    isRecurring: true,
    affectsScheduling: true,
})

export default function HolidaysTab() {
    const [calendars, setCalendars] = useState<HolidayCalendarItem[]>([])
    const [countries, setCountries] = useState<Country[]>([])
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
        countryId: '',
        year: new Date().getFullYear(),
        holidays: [emptyHoliday()] as HolidayDraft[],
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const loadCalendars = async () => {
        try {
            setLoading(true)
            const response = await HolidayCalendarService.getAll({ page: currentPage, limit: 10, search: searchTerm })
            setCalendars(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Failed to load holiday calendars:', error)
            toast.error('Failed to load holiday calendars')
        } finally {
            setLoading(false)
        }
    }

    const loadCountries = async () => {
        try {
            const response = await CountryService.getAll({ limit: 500 })
            setCountries(response.data || [])
        } catch (error) {
            console.error('Failed to load countries:', error)
        }
    }

    useEffect(() => { loadCalendars() }, [currentPage, searchTerm])
    useEffect(() => { loadCountries() }, [])

    const validateFormData = () => {
        const next: Record<string, string> = {}
        // BUG_016: tighten Calendar Name validation
        const nameErr = validateTitle(formData.name, 'Calendar name', 60)
        if (nameErr) next.name = nameErr
        if (!formData.countryId) next.countryId = 'Country is required'
        // BUG_020: year must be >= current year (and within bounds)
        const currentYear = new Date().getFullYear()
        if (!formData.year || formData.year < currentYear) next.year = `Year must be ${currentYear} or later`
        else if (formData.year > 3000) next.year = 'Year must be between current year and 3000'
        if (!formData.holidays.length) next.holidays = 'At least one holiday is required'
        else {
            formData.holidays.forEach((h, i) => {
                // BUG_018: tighten Holiday Name validation
                const hNameErr = validateTitle(h.name, 'Holiday name', 60)
                if (hNameErr) next[`holiday_${i}_name`] = hNameErr
                // BUG_019: Holiday date must be today or future
                if (!h.date) next[`holiday_${i}_date`] = 'Date required'
                else {
                    const dateErr = validateFutureOrToday(h.date, 'Holiday date')
                    if (dateErr) next[`holiday_${i}_date`] = dateErr
                }
            })
        }
        setErrors(next)
        return Object.keys(next).length === 0
    }

    // BUG_014: client-side filter on calendar name
    const filteredCalendars = searchTerm.trim()
        ? calendars.filter((c) => c.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
        : calendars

    const resetForm = () => {
        setFormData({
            name: '',
            countryId: '',
            year: new Date().getFullYear(),
            holidays: [emptyHoliday()],
        })
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
                await HolidayCalendarService.update(editingId, formData)
                toast.success('Holiday calendar updated successfully')
            } else {
                await HolidayCalendarService.create(formData)
                toast.success('Holiday calendar created successfully')
            }
            setShowForm(false)
            resetForm()
            setCurrentPage(1)
            await loadCalendars()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (cal: HolidayCalendarItem) => {
        setFormData({
            name: cal.name,
            countryId: typeof cal.countryId === 'string' ? cal.countryId : (cal.countryId as any)?._id || '',
            year: cal.year,
            holidays: (cal.holidays || []).map(h => ({
                name: h.name,
                date: typeof h.date === 'string' ? h.date.slice(0, 10) : new Date(h.date).toISOString().slice(0, 10),
                type: h.type || 'PUBLIC',
                isRecurring: !!h.isRecurring,
                affectsScheduling: h.affectsScheduling !== undefined ? h.affectsScheduling : true,
            })),
        })
        setEditingId(cal.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await HolidayCalendarService.delete(id)
            toast.success('Holiday calendar deleted successfully')
            setDeleteConfirm(null)
            await loadCalendars()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const updateHoliday = (idx: number, patch: Partial<HolidayDraft>) => {
        setFormData(prev => ({
            ...prev,
            holidays: prev.holidays.map((h, i) => i === idx ? { ...h, ...patch } : h),
        }))
    }

    const addHoliday = () => {
        setFormData(prev => ({ ...prev, holidays: [...prev.holidays, emptyHoliday()] }))
    }

    const removeHoliday = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            holidays: prev.holidays.filter((_, i) => i !== idx),
        }))
    }

    const countryName = (countryId: any): string => {
        const id = typeof countryId === 'string' ? countryId : countryId?._id
        const c = countries.find(x => x.id === id)
        return c ? `${c.name} (${c.code})` : '—'
    }

    return (
        <div>
            {/* Controls */}
            <div className="mb-6 flex gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search holiday calendars..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true) }}
                    disabled={countries.length === 0}
                    title={countries.length === 0 ? 'Create at least one country first' : 'Add holiday calendar'}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                    Add Calendar
                </button>
            </div>

            {countries.length === 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm text-amber-900">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>No countries exist yet. Create one in <strong>Countries & Regions → Countries</strong> tab first.</span>
                </div>
            )}

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-slate-600">Loading holiday calendars...</p>
                    </div>
                ) : calendars.length === 0 ? (
                    <div className="p-8 text-center">
                        <CalendarDays className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No holiday calendars found</p>
                        <p className="text-sm text-slate-500 mt-1">Click "Add Calendar" to create one</p>
                    </div>
                ) : filteredCalendars.length === 0 && searchTerm ? (
                    // BUG_015: surface "no results" when client-side filter yields nothing
                    <div className="p-8 text-center">
                        <CalendarDays className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No results found for &quot;{searchTerm}&quot;</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Calendar</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Country</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Year</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Holidays</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredCalendars.map((cal) => (
                                        <tr key={cal.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{cal.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{countryName(cal.countryId)}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{cal.year}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">{cal.holidays?.length || 0} days</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(cal)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"><Pencil className="w-4 h-4" /></button>
                                                    <button onClick={() => setDeleteConfirm(cal.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
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
            <SlideInDrawer isOpen={showForm} onClose={() => { setShowForm(false); resetForm() }} title={editingId ? 'Edit Holiday Calendar' : 'Add Holiday Calendar'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Calendar Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onKeyDown={(e) => {
                                    // BUG_016: reject pure-symbol input like "@@@" by filtering at keystroke level
                                    if (e.key.length === 1 && !/^[A-Za-z0-9\s'.,&()\-/]$/.test(e.key)) e.preventDefault()
                                }}
                                onChange={(e) => {
                                    const v = e.target.value
                                    setFormData({ ...formData, name: v })
                                    // BUG_016: live-validate Calendar Name
                                    const err = validateTitle(v, 'Calendar name', 60)
                                    setErrors((prev) => ({ ...prev, name: err || '' }))
                                }}
                                placeholder="e.g., HK Public Holidays 2026"
                                maxLength={60}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Year <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                min={new Date().getFullYear()}
                                max={3000}
                                value={formData.year}
                                onChange={(e) => {
                                    const v = Number(e.target.value)
                                    setFormData({ ...formData, year: v })
                                    // BUG_020: year >= current year
                                    const currentYear = new Date().getFullYear()
                                    if (!v || v < currentYear) setErrors((prev) => ({ ...prev, year: `Year must be ${currentYear} or later` }))
                                    else if (v > 3000) setErrors((prev) => ({ ...prev, year: 'Year must be between current year and 3000' }))
                                    else setErrors((prev) => ({ ...prev, year: '' }))
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.year ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                            />
                            {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">Country <span className="text-red-500">*</span></label>
                        <select
                            value={formData.countryId}
                            onChange={(e) => { setFormData({ ...formData, countryId: e.target.value }); if (errors.countryId) setErrors({ ...errors, countryId: '' }) }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.countryId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                        >
                            <option value="">Select Country</option>
                            {countries.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                        </select>
                        {errors.countryId && <p className="mt-1 text-sm text-red-600">{errors.countryId}</p>}
                    </div>

                    {/* Holidays list */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-slate-900">Holidays <span className="text-red-500">*</span></label>
                            <button
                                type="button"
                                onClick={addHoliday}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Plus className="w-4 h-4" /> Add Holiday
                            </button>
                        </div>
                        {errors.holidays && <p className="mb-2 text-sm text-red-600">{errors.holidays}</p>}
                        <div className="space-y-3">
                            {formData.holidays.map((h, idx) => (
                                <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-sm font-medium text-slate-700">Holiday #{idx + 1}</span>
                                        {formData.holidays.length > 1 && (
                                            <button type="button" onClick={() => removeHoliday(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={h.name}
                                                maxLength={60}
                                                onKeyDown={(e) => {
                                                    // BUG_018: reject pure-symbol/digit-only at keystroke level
                                                    if (e.key.length === 1 && !/^[A-Za-z0-9\s'.,&()\-/]$/.test(e.key)) e.preventDefault()
                                                }}
                                                onChange={(e) => {
                                                    const v = e.target.value
                                                    updateHoliday(idx, { name: v })
                                                    // BUG_018: live-validate Holiday Name
                                                    const err = validateTitle(v, 'Holiday name', 60)
                                                    setErrors((prev) => ({ ...prev, [`holiday_${idx}_name`]: err || '' }))
                                                }}
                                                placeholder="e.g., New Year's Day"
                                                className={`w-full px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 ${errors[`holiday_${idx}_name`] ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            />
                                            {errors[`holiday_${idx}_name`] && <p className="mt-1 text-xs text-red-600">{errors[`holiday_${idx}_name`]}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={h.date}
                                                min={todayISODate()}
                                                onChange={(e) => {
                                                    const v = e.target.value
                                                    updateHoliday(idx, { date: v })
                                                    // BUG_019: live-validate future/today
                                                    const err = validateFutureOrToday(v, 'Holiday date')
                                                    setErrors((prev) => ({ ...prev, [`holiday_${idx}_date`]: err || '' }))
                                                }}
                                                className={`w-full px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 ${errors[`holiday_${idx}_date`] ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'}`}
                                            />
                                            {errors[`holiday_${idx}_date`] && <p className="mt-1 text-xs text-red-600">{errors[`holiday_${idx}_date`]}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                                            <select
                                                value={h.type}
                                                onChange={(e) => updateHoliday(idx, { type: e.target.value })}
                                                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {HOLIDAY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-end gap-4">
                                            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={h.isRecurring}
                                                    onChange={(e) => updateHoliday(idx, { isRecurring: e.target.checked })}
                                                    className="w-4 h-4"
                                                />
                                                Recurring
                                            </label>
                                            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={h.affectsScheduling}
                                                    onChange={(e) => updateHoliday(idx, { affectsScheduling: e.target.checked })}
                                                    className="w-4 h-4"
                                                />
                                                Affects Scheduling
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-200">
                        <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                            {submitting ? 'Saving...' : editingId ? 'Update Calendar' : 'Create Calendar'}
                        </button>
                    </div>
                </form>
            </SlideInDrawer>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Holiday Calendar?</h3>
                        <p className="text-slate-600 mb-6">This will delete the calendar and all its holidays. This action cannot be undone.</p>
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
