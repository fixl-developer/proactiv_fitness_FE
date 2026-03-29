'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, Download, Calendar, Eye, Plus,
    BarChart3, PieChart, Users, DollarSign,
    FileCheck, Clock, X, Loader2, Trash2, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePartnerConfig } from '@/contexts/PartnerContext'

interface ReportSummary {
    totalReports: number
    completedReports: number
    pendingReports: number
    thisMonthReports: number
    period: string
    reportsByType: Record<string, number>
}

interface PartnerReport {
    reportId: string
    reportType: string
    reportName: string
    description: string
    format: string
    status: string
    businessUnitId: string
    config: { dateRange: { from: string; to: string } }
    createdBy: string
    createdAt: string
    updatedAt: string
    result?: {
        fileUrl: string
        fileSize: number
        recordCount: number
        generatedAt: string
    }
}

const REPORT_TYPES = [
    { value: 'performance', label: 'Performance Report' },
    { value: 'financial', label: 'Financial Report' },
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'operations', label: 'Operations Report' },
    { value: 'custom', label: 'Custom Report' },
]

const REPORT_FORMATS = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
]

const QUICK_TEMPLATES = [
    {
        name: 'Progress Report',
        reportType: 'performance',
        icon: Users,
        description: 'Individual progress and achievements',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
    },
    {
        name: 'Financial Summary',
        reportType: 'financial',
        icon: DollarSign,
        description: 'Revenue, commissions, and financial metrics',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
    },
    {
        name: 'Attendance Analytics',
        reportType: 'attendance',
        icon: BarChart3,
        description: 'Attendance patterns and engagement metrics',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
    },
    {
        name: 'Program Performance',
        reportType: 'operations',
        icon: PieChart,
        description: 'Program enrollment and success rates',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
    }
]

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    })
}

export default function PartnerReportsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const { config } = usePartnerConfig()
    const [selectedPeriod, setSelectedPeriod] = useState('monthly')
    const [reports, setReports] = useState<PartnerReport[]>([])
    const [summary, setSummary] = useState<ReportSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [generatingTemplate, setGeneratingTemplate] = useState<number | null>(null)
    const [showGenerateModal, setShowGenerateModal] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [deletingReportId, setDeletingReportId] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        reportName: '',
        reportType: 'performance',
        description: '',
        format: 'pdf',
        dateFrom: '',
        dateTo: '',
    })

    const partnerId = user?.id || 'partner-1'

    const fetchReports = useCallback(async (period: string) => {
        try {
            setIsLoading(true)
            setError(null)

            const [reportsRes, summaryRes] = await Promise.all([
                PartnerPortalService.getPartnerReports(partnerId, { period }),
                PartnerPortalService.getPartnerReportsSummary(partnerId, period)
            ])

            setReports(reportsRes?.reports || [])
            setSummary(summaryRes || null)
        } catch (err) {
            console.error('Error fetching reports:', err)
            setError('Failed to load reports. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [partnerId])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchReports(selectedPeriod)
    }, [isAuthenticated, router, selectedPeriod, fetchReports])

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period)
    }

    const openGenerateModal = (templateName?: string, templateType?: string) => {
        const now = new Date()
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        setFormData({
            reportName: templateName ? `${templateName} - ${now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : '',
            reportType: templateType || 'performance',
            description: '',
            format: 'pdf',
            dateFrom: firstOfMonth.toISOString().split('T')[0],
            dateTo: now.toISOString().split('T')[0],
        })
        setShowGenerateModal(true)
    }

    const handleGenerateReport = async () => {
        if (!formData.reportName.trim()) return

        try {
            setIsGenerating(true)
            const result = await PartnerPortalService.createPartnerReport(partnerId, {
                reportName: formData.reportName,
                reportType: formData.reportType,
                description: formData.description,
                format: formData.format,
                dateFrom: formData.dateFrom,
                dateTo: formData.dateTo,
            })

            setShowGenerateModal(false)
            // Refresh reports list
            await fetchReports(selectedPeriod)
        } catch (err) {
            console.error('Error generating report:', err)
            setError('Failed to generate report. Please try again.')
        } finally {
            setIsGenerating(false)
            setGeneratingTemplate(null)
        }
    }

    const handleGenerateFromTemplate = (templateName: string, templateType: string, idx: number) => {
        setGeneratingTemplate(idx)
        openGenerateModal(templateName, templateType)
    }

    const handleDeleteReport = async (reportId: string) => {
        try {
            setDeletingReportId(reportId)
            await PartnerPortalService.deletePartnerReport(partnerId, reportId)
            await fetchReports(selectedPeriod)
        } catch (err) {
            console.error('Error deleting report:', err)
            setError('Failed to delete report.')
        } finally {
            setDeletingReportId(null)
        }
    }

    const handleDownloadReport = async (report: PartnerReport) => {
        try {
            const result = await PartnerPortalService.downloadPartnerReport(partnerId, report.reportId)
            // Create download with report info
            const content = JSON.stringify({
                reportName: result.reportName || report.reportName,
                format: result.format || report.format,
                fileUrl: result.fileUrl,
                fileSize: result.fileSize,
                generatedAt: result.generatedAt,
                reportType: report.reportType,
                description: report.description,
                dateRange: report.config?.dateRange
            }, null, 2)

            const blob = new Blob([content], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${report.reportName.replace(/\s+/g, '_')}.${report.format || 'pdf'}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Error downloading report:', err)
            setError('Failed to download report.')
        }
    }

    const handleViewReport = async (report: PartnerReport) => {
        try {
            const result = await PartnerPortalService.getPartnerReportById(partnerId, report.reportId)
            const reportData = result || report
            const viewWindow = window.open('', '_blank')
            if (viewWindow) {
                viewWindow.document.write(`
                    <html><head><title>${reportData.reportName}</title>
                    <style>
                        body { font-family: 'Segoe UI', sans-serif; padding: 2rem; max-width: 900px; margin: 0 auto; background: #f9fafb; }
                        .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; }
                        h1 { margin: 0 0 0.5rem; font-size: 1.5rem; }
                        .subtitle { opacity: 0.8; font-size: 0.9rem; }
                        .card { background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
                        .stat { text-align: center; padding: 1rem; background: #f3f4f6; border-radius: 8px; }
                        .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e3a5f; }
                        .stat-label { font-size: 0.8rem; color: #6b7280; margin-top: 0.25rem; }
                        table { width: 100%; border-collapse: collapse; }
                        td, th { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; text-align: left; }
                        th { background: #f9fafb; font-weight: 600; color: #374151; }
                        .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
                        .badge-active { background: #dcfce7; color: #166534; }
                        .badge-draft { background: #fef9c3; color: #854d0e; }
                    </style>
                    </head><body>
                    <div class="header">
                        <h1>${reportData.reportName}</h1>
                        <div class="subtitle">${reportData.description || 'Partner Report'}</div>
                    </div>
                    <div class="grid">
                        <div class="stat"><div class="stat-value">${reportData.reportType?.toUpperCase()}</div><div class="stat-label">Report Type</div></div>
                        <div class="stat"><div class="stat-value">${reportData.format?.toUpperCase()}</div><div class="stat-label">Format</div></div>
                        <div class="stat"><div class="stat-value">${reportData.result?.recordCount || 'N/A'}</div><div class="stat-label">Records</div></div>
                        <div class="stat"><div class="stat-value">${reportData.result?.fileSize ? formatFileSize(reportData.result.fileSize) : 'N/A'}</div><div class="stat-label">File Size</div></div>
                    </div>
                    <div class="card">
                        <table>
                            <tr><th>Field</th><th>Value</th></tr>
                            <tr><td>Report ID</td><td>${reportData.reportId}</td></tr>
                            <tr><td>Status</td><td><span class="badge ${reportData.status === 'active' ? 'badge-active' : 'badge-draft'}">${reportData.status?.toUpperCase()}</span></td></tr>
                            <tr><td>Created</td><td>${formatDate(reportData.createdAt)}</td></tr>
                            <tr><td>Date Range</td><td>${reportData.config?.dateRange?.from ? formatDate(reportData.config.dateRange.from) + ' - ' + formatDate(reportData.config.dateRange.to) : 'N/A'}</td></tr>
                            <tr><td>Generated At</td><td>${reportData.result?.generatedAt ? formatDate(reportData.result.generatedAt) : 'Pending'}</td></tr>
                            <tr><td>Created By</td><td>${reportData.createdBy || 'System'}</td></tr>
                        </table>
                    </div>
                    </body></html>
                `)
                viewWindow.document.close()
            }
        } catch (err) {
            console.error('Error viewing report:', err)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'completed': return 'bg-green-100 text-green-800'
            case 'draft':
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'archived': return 'bg-gray-100 text-gray-500'
            case 'failed': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'COMPLETED'
            case 'draft': return 'PENDING'
            case 'archived': return 'ARCHIVED'
            default: return status.toUpperCase()
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'performance': return 'bg-blue-100 text-blue-800'
            case 'financial': return 'bg-green-100 text-green-800'
            case 'attendance': return 'bg-purple-100 text-purple-800'
            case 'operations': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getTypeLabel = (type: string) => {
        const found = REPORT_TYPES.find(t => t.value === type)
        return found ? found.label : type
    }

    if (isLoading && reports.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading reports...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Partner Reports</h1>
                    <p className="text-gray-600 mt-1">Generate and manage partner reports</p>
                </div>
                <button
                    id="partner-reports-generate-btn"
                    onClick={() => openGenerateModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Generate Report
                </button>
            </div>

            {/* Report Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { title: 'Total Reports', value: String(summary?.totalReports ?? reports.length), icon: FileText, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: `${summary?.totalReports ?? reports.length} total` },
                    { title: 'Generated', value: String(summary?.completedReports ?? 0), icon: FileCheck, gradient: 'from-green-500 to-green-600', bgGradient: 'from-green-50 to-green-100', change: `+${summary?.completedReports ?? 0} completed` },
                    { title: 'Pending', value: String(summary?.pendingReports ?? 0), icon: Clock, gradient: 'from-amber-500 to-amber-600', bgGradient: 'from-amber-50 to-amber-100', change: `${summary?.pendingReports ?? 0} awaiting` },
                    { title: 'This Month', value: String(summary?.thisMonthReports ?? 0), icon: Calendar, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', change: `${summary?.thisMonthReports ?? 0} recent` },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">{metric.change}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Period Selection */}
            <div className="flex gap-2 overflow-x-auto">
                {['weekly', 'monthly', 'quarterly', 'yearly'].map((period) => (
                    <button
                        id={`partner-reports-period-${period}-btn`}
                        key={period}
                        onClick={() => handlePeriodChange(period)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap capitalize ${selectedPeriod === period
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {period}
                        {isLoading && selectedPeriod === period && (
                            <Loader2 className="w-3 h-3 ml-2 inline animate-spin" />
                        )}
                    </button>
                ))}
            </div>

            {/* Quick Report Templates */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Report Templates</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {QUICK_TEMPLATES.map((template, idx) => (
                            <motion.div
                                key={idx}
                                id={`partner-reports-template-${idx}-btn`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer ${generatingTemplate === idx ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
                                onClick={() => handleGenerateFromTemplate(template.name, template.reportType, idx)}
                            >
                                <div className={`${template.bgColor} p-3 rounded-lg w-fit mb-3`}>
                                    <template.icon className={`w-6 h-6 ${template.color}`} />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                                <p className="text-sm text-gray-600">{template.description}</p>
                                {summary?.reportsByType?.[template.reportType] !== undefined && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        {summary.reportsByType[template.reportType]} reports generated
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Reports List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Generated Reports</CardTitle>
                        {isLoading && reports.length > 0 && (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reports.length > 0 ? (
                            reports.map((report, idx) => (
                                <motion.div
                                    key={report.reportId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">{report.reportName}</h3>
                                            <Badge className={getStatusColor(report.status)}>
                                                {getStatusLabel(report.status)}
                                            </Badge>
                                            <Badge className={getTypeColor(report.reportType)}>
                                                {getTypeLabel(report.reportType)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>Period: {report.config?.dateRange?.from ? `${formatDate(report.config.dateRange.from)} - ${formatDate(report.config.dateRange.to)}` : 'N/A'}</span>
                                            <span>Generated: {formatDate(report.createdAt)}</span>
                                            <span>Format: {report.format?.toUpperCase()}</span>
                                            <span>Size: {report.result?.fileSize ? formatFileSize(report.result.fileSize) : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            id={`partner-reports-view-${report.reportId}-btn`}
                                            onClick={() => handleViewReport(report)}
                                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                            title="View Report"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            id={`partner-reports-download-${report.reportId}-btn`}
                                            onClick={() => handleDownloadReport(report)}
                                            className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                            title="Download Report"
                                            disabled={report.status === 'draft'}
                                        >
                                            <Download className={`w-4 h-4 ${report.status === 'draft' ? 'opacity-40' : ''}`} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReport(report.reportId)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                            title="Delete Report"
                                            disabled={deletingReportId === report.reportId}
                                        >
                                            {deletingReportId === report.reportId ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="pt-8 pb-8 text-center">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">No reports found for this period</p>
                                <p className="text-sm text-gray-400">Try selecting a different period or generate a new report</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-800">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* Generate Report Modal */}
            <AnimatePresence>
                {showGenerateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowGenerateModal(false) }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Generate New Report</h2>
                                    <p className="text-sm text-gray-500 mt-1">Fill in the details to generate a report</p>
                                </div>
                                <button
                                    onClick={() => { setShowGenerateModal(false); setGeneratingTemplate(null) }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4">
                                {/* Report Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Report Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.reportName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reportName: e.target.value }))}
                                        placeholder="e.g., Monthly Performance Report"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                {/* Report Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                                    <select
                                        value={formData.reportType}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        {REPORT_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description of the report..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    />
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                                        <input
                                            type="date"
                                            value={formData.dateFrom}
                                            onChange={(e) => setFormData(prev => ({ ...prev, dateFrom: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                                        <input
                                            type="date"
                                            value={formData.dateTo}
                                            onChange={(e) => setFormData(prev => ({ ...prev, dateTo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Format */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
                                    <div className="flex gap-3">
                                        {REPORT_FORMATS.map(f => (
                                            <button
                                                key={f.value}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, format: f.value }))}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${formData.format === f.value
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
                                <button
                                    onClick={() => { setShowGenerateModal(false); setGeneratingTemplate(null) }}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={isGenerating}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerateReport}
                                    disabled={isGenerating || !formData.reportName.trim()}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Generate Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
