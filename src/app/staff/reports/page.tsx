'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import { FileText, CheckCircle, Clock, Calendar, Plus, Download, AlertCircle, Trash2, RefreshCw } from 'lucide-react'
import { validateRequired } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { toast } from 'sonner'

const REPORT_TABS = ['All', 'Performance', 'Tickets', 'Customer', 'Financial'] as const
const TYPES = ['performance', 'tickets', 'customer', 'financial'] as const
const FORMATS = ['PDF', 'CSV', 'Excel'] as const

const STATUS_STYLES: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
}
const TYPE_STYLES: Record<string, string> = {
    performance: 'bg-blue-100 text-blue-800',
    tickets: 'bg-purple-100 text-purple-800',
    customer: 'bg-teal-100 text-teal-800',
    financial: 'bg-orange-100 text-orange-800',
}

const emptyForm = { name: '', type: 'performance' as typeof TYPES[number], startDate: '', endDate: '', format: 'PDF' as typeof FORMATS[number] }

export default function Reports() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reports, setReports] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<string>('All')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const loadReports = async () => {
        setLoading(true)
        try {
            const data = await supportStaffService.getReports('all')
            setReports(data?.reports || [])
            setError(null)
        } catch (err: any) {
            setReports([])
            setError(err?.response?.data?.message || 'Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return }
        loadReports()
    }, [isAuthenticated, router])

    const filteredReports = activeTab === 'All'
        ? reports
        : reports.filter((r) => r.type?.toLowerCase() === activeTab.toLowerCase())

    const totalReports = reports.length
    const completedReports = reports.filter((r) => r.status === 'completed').length
    const pendingReports = reports.filter((r) => r.status === 'pending').length
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisWeekReports = reports.filter((r) => new Date(r.createdAt || r.generatedAt) >= oneWeekAgo).length

    const validateForm = (): Record<string, string> => {
        const errs: Record<string, string> = {}
        const n = validateRequired(form.name, 'Report Name'); if (n) errs.name = n
        if (!form.startDate) errs.startDate = 'Start date is required'
        if (!form.endDate) errs.endDate = 'End date is required'
        if (form.startDate && form.endDate && form.startDate > form.endDate) errs.endDate = 'End date must be after start date'
        return errs
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validateForm()
        setFormErrors(errs)
        if (Object.keys(errs).length > 0) return
        setGenerating(true)
        try {
            await supportStaffService.generateReport(form)
            setDrawerOpen(false)
            setForm(emptyForm)
            toast.success('Report generated')
            await loadReports()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to generate report')
        } finally {
            setGenerating(false)
        }
    }

    const handleDelete = async (report: any) => {
        if (!confirm(`Delete report "${report.name}"?`)) return
        try {
            const id = report.reportId || report.id
            await (supportStaffService as any).deleteReport(id)
            toast.success('Report deleted')
            await loadReports()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to delete report')
        }
    }

    const handleDownload = (report: any) => {
        const summaryStr = JSON.stringify(report.summary || { note: 'No summary' }, null, 2)
        const blob = new Blob([`Report: ${report.name}\nType: ${report.type}\nPeriod: ${report.startDate} to ${report.endDate}\nFormat: ${report.format}\n\n--- Summary ---\n${summaryStr}`], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${report.name.replace(/[^a-z0-9]+/gi, '_')}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (!isAuthenticated) return null

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports</h1>
                        <p className="text-sm text-gray-500 mt-1">Generate and download support reports</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={loadReports}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            id="staff-reports-btn-create"
                            onClick={() => { setForm(emptyForm); setFormErrors({}); setDrawerOpen(true) }}
                            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 inline-flex items-center gap-2 text-sm font-medium shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Generate Report
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Reports</p>
                        <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{completedReports}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">{pendingReports}</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md inline-flex mb-3">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">This Week</p>
                        <p className="text-2xl font-bold text-gray-900">{thisWeekReports}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm p-1.5 mb-6 inline-flex gap-1">
                    {REPORT_TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                activeTab === tab ? 'bg-cyan-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >{tab}</button>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Name</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Type</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Period</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Format</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Status</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Generated</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                                            No reports found. Click &quot;Generate Report&quot; to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report.id || report.reportId} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-6 text-gray-900 font-medium text-sm">{report.name}</td>
                                            <td className="py-3 px-6">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${TYPE_STYLES[report.type] || 'bg-gray-100 text-gray-700'}`}>
                                                    {report.type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-gray-600 text-sm">{report.startDate} → {report.endDate}</td>
                                            <td className="py-3 px-6 text-gray-600 text-sm">{report.format}</td>
                                            <td className="py-3 px-6">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[report.status] || 'bg-gray-100 text-gray-700'}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-gray-600 text-sm">
                                                {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : '-'}
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDownload(report)}
                                                        disabled={report.status !== 'completed'}
                                                        className="text-cyan-600 hover:text-cyan-800 inline-flex items-center gap-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        <Download className="w-4 h-4" /> Download
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(report)}
                                                        className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* GENERATE DRAWER (right side) */}
            <SlideInDrawer
                isOpen={drawerOpen}
                onClose={() => { setDrawerOpen(false); setForm(emptyForm); setFormErrors({}) }}
                title="Generate Report"
                description="Generate a new support report"
                size="md"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setDrawerOpen(false); setForm(emptyForm) }}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                        >Cancel</button>
                        <button
                            type="submit"
                            form="report-form"
                            disabled={generating}
                            className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 inline-flex items-center gap-2 text-sm font-medium"
                        >
                            {generating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                            {generating ? 'Generating…' : 'Generate Report'}
                        </button>
                    </div>
                }
            >
                <form id="report-form" onSubmit={handleGenerate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => {
                                setForm({ ...form, name: e.target.value })
                                const err = validateRequired(e.target.value, 'Report Name')
                                setFormErrors(p => { const n = { ...p }; if (err) n.name = err; else delete n.name; return n })
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g. Weekly Performance Report"
                        />
                        <FormFieldHint hint="" error={formErrors.name} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
                        >
                            {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => {
                                    setForm({ ...form, startDate: e.target.value })
                                    setFormErrors(p => { const n = { ...p }; delete n.startDate; return n })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint="" error={formErrors.startDate} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => {
                                    setForm({ ...form, endDate: e.target.value })
                                    setFormErrors(p => { const n = { ...p }; delete n.endDate; return n })
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${formErrors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint="" error={formErrors.endDate} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Format <span className="text-red-500">*</span></label>
                        <select
                            value={form.format}
                            onChange={(e) => setForm({ ...form, format: e.target.value as any })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>
                </form>
            </SlideInDrawer>
        </div>
    )
}
