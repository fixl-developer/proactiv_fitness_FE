'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    FileText, Download, RefreshCw, AlertCircle, Loader2,
    CalendarCheck, DollarSign, UserCheck, BarChart3,
} from 'lucide-react'
import { LocationManagerService } from '@/services/locationManagerService'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { validateRequired, validateSelect } from '@/utils/validation'
import { toast } from 'sonner'

interface ReportSummary {
    totalBookings: number
    confirmed: number
    cancelled: number
    revenue: number
    currency: string
    attendanceTotal: number
    attendancePresent: number
    attendanceRate: number
}

interface ReportRow {
    id: string
    bookingId: string
    customer: string
    program: string
    date: string
    status: string
    amount: number
    paid: boolean
}

const RANGE_OPTIONS = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
]

const TYPE_OPTIONS = [
    { value: 'overview', label: 'Operations overview' },
    { value: 'revenue', label: 'Revenue report' },
    { value: 'attendance', label: 'Attendance report' },
]

const FORMAT_OPTIONS = [
    { value: 'csv', label: 'CSV (spreadsheet)' },
    { value: 'json', label: 'JSON (raw data)' },
]

export default function LocationReportsPage() {
    const [dateRange, setDateRange] = useState('30d')
    const [reportType, setReportType] = useState('overview')
    const [summary, setSummary] = useState<ReportSummary | null>(null)
    const [rows, setRows] = useState<ReportRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [generatedAt, setGeneratedAt] = useState<string>('')

    // Generate-export drawer
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [form, setForm] = useState({ type: 'overview', range: '30d', format: 'csv', name: '' })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [exporting, setExporting] = useState(false)

    const fetchReport = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await LocationManagerService.getReport({ type: reportType, dateRange })
            setSummary(data?.summary || null)
            setRows(data?.rows || [])
            setGeneratedAt(data?.generatedAt || '')
        } catch (err: any) {
            setError(err?.message || 'Failed to load report')
            setSummary(null)
            setRows([])
        } finally {
            setLoading(false)
        }
    }, [dateRange, reportType])

    useEffect(() => { fetchReport() }, [fetchReport])

    const validateForm = (): Record<string, string> => {
        const errs: Record<string, string> = {}
        const tErr = validateSelect(form.type, 'Type'); if (tErr) errs.type = tErr
        const rErr = validateSelect(form.range, 'Range'); if (rErr) errs.range = rErr
        const fErr = validateSelect(form.format, 'Format'); if (fErr) errs.format = fErr
        const nErr = validateRequired(form.name, 'File name'); if (nErr) errs.name = nErr
        return errs
    }

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validateForm()
        setFormErrors(errs)
        if (Object.keys(errs).length > 0) return
        setExporting(true)
        try {
            if (form.format === 'csv') {
                const blob = await LocationManagerService.exportReportCsv(form.range)
                const url = window.URL.createObjectURL(blob as any)
                const a = document.createElement('a')
                a.href = url
                a.download = `${form.name.trim().replace(/\s+/g, '-')}.csv`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                // JSON path: assemble client-side from the current report payload.
                const payload = {
                    type: form.type,
                    range: form.range,
                    generatedAt,
                    summary,
                    rows,
                }
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${form.name.trim().replace(/\s+/g, '-')}.json`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }
            toast.success('Report exported')
            setDrawerOpen(false)
        } catch (err: any) {
            toast.error(err?.message || 'Failed to export report')
        } finally {
            setExporting(false)
        }
    }

    const kpis = summary
        ? [
            { label: 'Total Bookings', value: summary.totalBookings, icon: CalendarCheck, bg: 'bg-blue-50', text: 'text-blue-600' },
            { label: `Revenue (${summary.currency})`, value: summary.revenue.toLocaleString(), icon: DollarSign, bg: 'bg-emerald-50', text: 'text-emerald-600' },
            { label: 'Attendance', value: `${summary.attendancePresent}/${summary.attendanceTotal}`, icon: UserCheck, bg: 'bg-violet-50', text: 'text-violet-600' },
            { label: 'Attendance Rate', value: `${summary.attendanceRate}%`, icon: BarChart3, bg: 'bg-orange-50', text: 'text-orange-600' },
        ]
        : []

    return (
        <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h1>
                    <p className="text-sm text-gray-500 mt-1 font-normal">Generate and download operations + revenue reports for this location</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button
                        onClick={() => {
                            setForm({ type: reportType, range: dateRange, format: 'csv', name: `location-report-${dateRange}-${new Date().toISOString().slice(0, 10)}` })
                            setFormErrors({})
                            setDrawerOpen(true)
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                        <Download className="w-4 h-4" /> Generate & Export
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1 tracking-wide">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white font-normal capitalize focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1 tracking-wide">Date Range</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white font-normal focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>
                {generatedAt && (
                    <p className="text-xs text-gray-400 mt-3 font-normal">Generated {new Date(generatedAt).toLocaleString()}</p>
                )}
            </div>

            {/* KPI cards */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map((k, i) => (
                        <motion.div
                            key={k.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-5 shadow-sm border border-gray-200"
                            style={{ borderRadius: 0 }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2.5 ${k.bg}`} style={{ borderRadius: 0 }}>
                                    <k.icon className={`w-5 h-5 ${k.text}`} />
                                </div>
                            </div>
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{k.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{k.value}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700 font-normal">{error}</p>
                </div>
            )}

            {/* Bookings table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Booking Rows ({rows.length})</h2>
                    <p className="text-xs text-gray-500 mt-1 font-normal">Showing up to 100 rows in the selected date range.</p>
                </div>
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-normal">Loading report data…</p>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-gray-700">No data for this range</h3>
                        <p className="text-sm text-gray-500 mt-1 font-normal">Try a different date range or report type.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Booking</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Program</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Paid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-700 font-normal">{r.bookingId}</td>
                                        <td className="px-4 py-3 text-gray-900 font-medium">{r.customer || '—'}</td>
                                        <td className="px-4 py-3 text-gray-700 font-normal">{r.program || '—'}</td>
                                        <td className="px-4 py-3 text-gray-700 font-normal">{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                                        <td className="px-4 py-3 text-gray-700 capitalize font-normal">{r.status}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{Number(r.amount || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {r.paid ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Generate & Export drawer */}
            <SlideInDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setFormErrors({}) }}
                title="Generate & Export Report"
                description="Pick the type, range, and format — download starts immediately."
                size="md"
            >
                <form onSubmit={handleExport} className="space-y-4 font-sans">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type <span className="text-red-500">*</span></label>
                        <select
                            value={form.type}
                            onChange={(e) => { setForm(p => ({ ...p, type: e.target.value })); if (formErrors.type) setFormErrors(p => { const n = { ...p }; delete n.type; return n }) }}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.type ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <FormFieldHint error={formErrors.type} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range <span className="text-red-500">*</span></label>
                        <select
                            value={form.range}
                            onChange={(e) => { setForm(p => ({ ...p, range: e.target.value })); if (formErrors.range) setFormErrors(p => { const n = { ...p }; delete n.range; return n }) }}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.range ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            {RANGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <FormFieldHint error={formErrors.range} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Format <span className="text-red-500">*</span></label>
                        <select
                            value={form.format}
                            onChange={(e) => { setForm(p => ({ ...p, format: e.target.value })); if (formErrors.format) setFormErrors(p => { const n = { ...p }; delete n.format; return n }) }}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.format ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            {FORMAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <FormFieldHint error={formErrors.format} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => { setForm(p => ({ ...p, name: e.target.value })); if (formErrors.name) setFormErrors(p => { const n = { ...p }; delete n.name; return n }) }}
                            placeholder="e.g. monthly-report-2026-05"
                            maxLength={80}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-normal ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FormFieldHint hint="Used as the downloaded file name (without extension)" error={formErrors.name} />
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button type="button" onClick={() => setDrawerOpen(false)} className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={exporting} className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 inline-flex items-center gap-2">
                            {exporting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {exporting ? 'Exporting…' : 'Generate & Download'}
                        </button>
                    </div>
                </form>
            </SlideInDrawer>
        </div>
    )
}
