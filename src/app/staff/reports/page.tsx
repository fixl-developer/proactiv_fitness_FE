'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService } from '@/services/supportStaffService'
import { FileText, CheckCircle, Clock, Calendar, Plus, Download, AlertCircle, X } from 'lucide-react'

const REPORT_TABS = ['All', 'Performance', 'Tickets', 'Customer', 'Financial'] as const

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

export default function Reports() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reports, setReports] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<string>('All')
    const [showModal, setShowModal] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        type: 'performance',
        startDate: '',
        endDate: '',
        format: 'PDF',
    })

    const loadReports = async () => {
        setLoading(true)
        try {
            const data = await supportStaffService.getReports('all')
            setReports(data?.reports || [])
            setError(null)
        } catch {
            setReports([])
            setError('Failed to load reports.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
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
    const thisWeekReports = reports.filter((r) => new Date(r.createdAt || r.generatedDate) >= oneWeekAgo).length

    const handleGenerateReport = async () => {
        if (!formData.name.trim()) return
        setGenerating(true)
        try {
            await supportStaffService.generateReport({
                name: formData.name,
                type: formData.type,
                startDate: formData.startDate,
                endDate: formData.endDate,
                format: formData.format,
            })
            setShowModal(false)
            setFormData({ name: '', type: 'performance', startDate: '', endDate: '', format: 'PDF' })
            await loadReports()
        } catch {
            setError('Failed to generate report.')
        } finally {
            setGenerating(false)
        }
    }

    const handleDownload = (report: any) => {
        alert(`Report "${report.name}" will be downloaded as ${report.format || 'PDF'}. (Download not available in demo mode)`)
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Reports</h1>
                    <button
                        id="staff-reports-generate-btn"
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Generate Report
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Total Reports */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-blue-50 to-blue-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Reports</p>
                        <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
                    </div>

                    {/* Completed */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-green-50 to-green-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{completedReports}</p>
                    </div>

                    {/* Pending */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-orange-50 to-orange-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">{pendingReports}</p>
                    </div>

                    {/* This Week */}
                    <div className="rounded-xl border-0 bg-gradient-to-br from-purple-50 to-purple-100 p-5 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">This Week</p>
                        <p className="text-2xl font-bold text-gray-900">{thisWeekReports}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {REPORT_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === tab
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading reports...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Report Name</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Type</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Generated Date</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-500">
                                            No reports found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-6 text-gray-900 font-medium">{report.name}</td>
                                            <td className="py-3 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${TYPE_STYLES[report.type?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                                                    {report.type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-gray-600">
                                                {new Date(report.createdAt || report.generatedDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[report.status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <button
                                                    id={`staff-reports-download-${report.id}-btn`}
                                                    onClick={() => handleDownload(report)}
                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Generate Report Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Generate Report</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter report name"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="performance">Performance</option>
                                    <option value="tickets">Tickets</option>
                                    <option value="customer">Customer</option>
                                    <option value="financial">Financial</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range - Start</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range - End</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                                <select
                                    value={formData.format}
                                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="PDF">PDF</option>
                                    <option value="CSV">CSV</option>
                                    <option value="Excel">Excel</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerateReport}
                                disabled={generating || !formData.name.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Report'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
