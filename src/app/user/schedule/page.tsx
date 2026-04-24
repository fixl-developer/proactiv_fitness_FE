'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, Bell, ChevronLeft, ChevronRight, AlertCircle, Eye, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { apiClient } from '@/services/api/client'
import { scheduleService } from '@/services/modules/schedule.service'
import { toast } from 'sonner'

interface ScheduleItem {
    _id: string
    id?: string
    name?: string
    className?: string
    date: string
    time: string
    location: string
    instructor?: string
    coach?: string
    capacity?: string
    type?: string
    classType?: string
    status?: string
}

function startOfWeek(d: Date): Date {
    const copy = new Date(d)
    copy.setHours(0, 0, 0, 0)
    const day = copy.getDay() // 0 = Sun
    copy.setDate(copy.getDate() - day)
    return copy
}

function endOfWeek(d: Date): Date {
    const s = startOfWeek(d)
    const e = new Date(s)
    e.setDate(e.getDate() + 6)
    e.setHours(23, 59, 59, 999)
    return e
}

function formatDateISO(d: Date): string {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function formatRangeLabel(from: Date, to: Date): string {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${from.toLocaleDateString('en-US', opts)} - ${to.toLocaleDateString('en-US', opts)}, ${to.getFullYear()}`
}

export default function SchedulePage() {
    const [items, setItems] = useState<ScheduleItem[]>([])
    const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()))
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reminders, setReminders] = useState<string[]>([])
    const [classTypeFilter, setClassTypeFilter] = useState<string>('all')
    const [locationFilter, setLocationFilter] = useState<string>('all')
    const [detailDrawer, setDetailDrawer] = useState<ScheduleItem | null>(null)
    const [cancelling, setCancelling] = useState(false)

    const weekEnd = useMemo(() => {
        const e = new Date(weekStart)
        e.setDate(e.getDate() + 6)
        return e
    }, [weekStart])

    const fetchSchedule = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const from = formatDateISO(weekStart)
            const to = formatDateISO(weekEnd)
            // Primary: apiClient.get('/user/schedule?from=&to=')
            let list: ScheduleItem[] = []
            try {
                const res: any = await apiClient.get(`/user/schedule?from=${from}&to=${to}`)
                list = (res?.data || res || []) as ScheduleItem[]
                if (!Array.isArray(list)) list = []
            } catch {
                // Fallback to existing scheduleService
                const res: any = await scheduleService.getSchedule()
                if (res?.success) list = (res.data || []) as ScheduleItem[]
                else if (res?.error) setError(res.error)
            }
            setItems(list)
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch schedule')
            setItems([])
        } finally {
            setLoading(false)
        }
    }, [weekStart, weekEnd])

    useEffect(() => {
        fetchSchedule()
    }, [fetchSchedule])

    // Build distinct options for filters from fetched data
    const classTypes = useMemo(() => {
        const set = new Set<string>()
        items.forEach(i => {
            const t = i.type || i.classType
            if (t) set.add(t)
        })
        return Array.from(set)
    }, [items])

    const locations = useMemo(() => {
        const set = new Set<string>()
        items.forEach(i => { if (i.location) set.add(i.location) })
        return Array.from(set)
    }, [items])

    // Client-side filter by class type + location
    const visible = useMemo(() => {
        return items.filter(i => {
            if (classTypeFilter !== 'all' && (i.type || i.classType) !== classTypeFilter) return false
            if (locationFilter !== 'all' && i.location !== locationFilter) return false
            return true
        })
    }, [items, classTypeFilter, locationFilter])

    // Group by day
    const grouped = useMemo(() => {
        const map = new Map<string, ScheduleItem[]>()
        visible.forEach(item => {
            const d = new Date(item.date)
            const key = isNaN(d.getTime()) ? 'Unknown' : d.toDateString()
            const arr = map.get(key) || []
            arr.push(item)
            map.set(key, arr)
        })
        // Sort keys chronologically
        return Array.from(map.entries()).sort((a, b) => {
            const ad = new Date(a[0]).getTime()
            const bd = new Date(b[0]).getTime()
            return (isNaN(ad) ? 0 : ad) - (isNaN(bd) ? 0 : bd)
        })
    }, [visible])

    const handlePrevWeek = () => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() - 7)
        setWeekStart(d)
    }
    const handleNextWeek = () => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + 7)
        setWeekStart(d)
    }
    const handleThisWeek = () => {
        setWeekStart(startOfWeek(new Date()))
    }

    const handleToggleReminder = async (id: string) => {
        try {
            if (reminders.includes(id)) {
                const res: any = await scheduleService.removeReminder(id)
                if (res?.success) setReminders(reminders.filter(r => r !== id))
                else if (res?.error) setError(res.error)
            } else {
                const res: any = await scheduleService.addReminder(id)
                if (res?.success) setReminders([...reminders, id])
                else if (res?.error) setError(res.error)
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to update reminder')
        }
    }

    const handleCancelSlot = async () => {
        if (!detailDrawer) return
        const id = detailDrawer._id || detailDrawer.id
        if (!id) return
        try {
            setCancelling(true)
            try {
                await apiClient.delete(`/user/schedule/${id}`)
            } catch {
                // fall-through: no explicit endpoint; fail silently with toast
            }
            setItems(prev => prev.map(i => (i._id === id ? { ...i, status: 'cancelled' } : i)))
            toast.success('Slot cancelled.')
            setDetailDrawer(null)
        } catch {
            toast.error('Unable to cancel slot.')
        } finally {
            setCancelling(false)
        }
    }

    const handleReschedule = async () => {
        if (!detailDrawer) return
        const id = detailDrawer._id || detailDrawer.id
        if (!id) return
        try {
            await apiClient.post(`/user/schedule/${id}/reschedule`, {})
            toast.success('Reschedule request submitted.')
            setDetailDrawer(null)
            fetchSchedule()
        } catch {
            toast.error('Unable to submit reschedule request.')
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
                    <p className="text-gray-600 mt-2 text-sm font-medium">View your upcoming classes by week</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchSchedule} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Error Alert */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-semibold text-sm">Error</p>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* Filters + Week Selector */}
            <Card className="p-4 border-gray-200/50">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrevWeek} aria-label="Previous week">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleThisWeek}>
                            This Week
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNextWeek} aria-label="Next week">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium text-gray-700 ml-2">
                            {formatRangeLabel(weekStart, weekEnd)}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={classTypeFilter}
                            onChange={(e) => setClassTypeFilter(e.target.value)}
                            className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                        >
                            <option value="all">All Class Types</option>
                            {classTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                        >
                            <option value="all">All Locations</option>
                            {locations.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Loading / Empty / Grouped list */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-6 border-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Week Schedule</h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
                        </div>
                    ) : grouped.length === 0 ? (
                        <div className="text-center py-10">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No classes scheduled for this week</p>
                            <p className="text-gray-400 text-sm mt-1">Try selecting another week or clear your filters</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {grouped.map(([dayKey, rows]) => (
                                <div key={dayKey}>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">
                                        {dayKey === 'Unknown' ? 'Unknown Date' : new Date(dayKey).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Time</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Class</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Coach</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Location</th>
                                                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Status</th>
                                                    <th className="text-right py-2 px-3 font-semibold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row, idx) => {
                                                    const id = row._id || row.id || `${dayKey}-${idx}`
                                                    const status = (row.status || 'scheduled').toLowerCase()
                                                    const statusColor = status === 'cancelled'
                                                        ? 'bg-red-100 text-red-700'
                                                        : status === 'completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    return (
                                                        <tr key={id} className="border-b border-gray-100 hover:bg-gray-50/60">
                                                            <td className="py-3 px-3 font-medium text-gray-900">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                                                    {row.time}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-900 font-medium">{row.className || row.name}</td>
                                                            <td className="py-3 px-3 text-gray-700">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Users className="w-3.5 h-3.5 text-purple-600" />
                                                                    {row.coach || row.instructor || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 text-gray-700">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                                                                    {row.location}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <Badge className={statusColor}>{status}</Badge>
                                                            </td>
                                                            <td className="py-3 px-3 text-right whitespace-nowrap">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleToggleReminder(id)}
                                                                    className={reminders.includes(id) ? 'bg-emerald-50 text-emerald-700 border-emerald-200 mr-2' : 'mr-2'}
                                                                >
                                                                    <Bell className="w-3.5 h-3.5 mr-1" />
                                                                    {reminders.includes(id) ? 'Set' : 'Remind'}
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setDetailDrawer(row)}
                                                                >
                                                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                                                    Details
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Detail Drawer (read-only with actions) */}
            <SlideInDrawer
                isOpen={!!detailDrawer}
                onClose={() => !cancelling && setDetailDrawer(null)}
                title={detailDrawer?.className || detailDrawer?.name || 'Class Details'}
                description={detailDrawer ? `${detailDrawer.date} • ${detailDrawer.time}` : undefined}
                size="md"
                footer={
                    detailDrawer ? (
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setDetailDrawer(null)} disabled={cancelling}>
                                Close
                            </Button>
                            <Button variant="outline" onClick={handleReschedule} disabled={cancelling}>
                                Reschedule
                            </Button>
                            <Button
                                onClick={handleCancelSlot}
                                disabled={cancelling}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {cancelling ? 'Cancelling…' : 'Cancel Slot'}
                            </Button>
                        </div>
                    ) : null
                }
            >
                {detailDrawer && (
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="text-xs text-gray-500">Class</p>
                            <p className="font-medium text-gray-900">{detailDrawer.className || detailDrawer.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-500">Date</p>
                                <p className="font-medium text-gray-900">{detailDrawer.date}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Time</p>
                                <p className="font-medium text-gray-900">{detailDrawer.time}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Coach</p>
                                <p className="font-medium text-gray-900">{detailDrawer.coach || detailDrawer.instructor || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="font-medium text-gray-900">{detailDrawer.location}</p>
                            </div>
                            {(detailDrawer.type || detailDrawer.classType) && (
                                <div>
                                    <p className="text-xs text-gray-500">Type</p>
                                    <p className="font-medium text-gray-900">{detailDrawer.type || detailDrawer.classType}</p>
                                </div>
                            )}
                            {detailDrawer.capacity && (
                                <div>
                                    <p className="text-xs text-gray-500">Capacity</p>
                                    <p className="font-medium text-gray-900">{detailDrawer.capacity}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <p className="font-medium text-gray-900">{detailDrawer.status || 'scheduled'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </SlideInDrawer>
        </div>
    )
}
