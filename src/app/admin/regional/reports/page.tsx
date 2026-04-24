'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Download, Filter, Calendar, TrendingUp, Users, DollarSign,
    Building2, BarChart3, FileText, Clock, CheckCircle, AlertCircle, Plus, Loader2, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { RegionalAdminService } from '@/services/regionalAdminService'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { FormFieldHint } from '@/components/ui/FormFieldHint'

const REPORT_TYPES = [
    { id: 'revenue', label: 'Revenue', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50', description: 'Monthly revenue vs targets' },
    { id: 'students', label: 'Students', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Enrollment and churn analysis' },
    { id: 'locations', label: 'Locations', icon: Building2, color: 'text-purple-600', bgColor: 'bg-purple-50', description: 'Performance by location' },
    { id: 'staff', label: 'Staff', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'Staff metrics and KPIs' },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function RegionalReportsPage() {
    const [reportType, setReportType] = useState<'revenue' | 'students' | 'locations' | 'staff'>('revenue')
    const [dateRange, setDateRange] = useState('30d')
    const [searchTerm, setSearchTerm] = useState('')

    const [analyticsData, setAnalyticsData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    // Generate Report drawer state
    const [genOpen, setGenOpen] = useState(false)
    const [genForm, setGenForm] = useState({ type: 'REVENUE', name: '', dateRange: '30d', format: 'csv' as 'csv' | 'pdf' | 'xlsx' })
    const [genErrors, setGenErrors] = useState<Record<string, string>>({})
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        if (!toast) return
        const t = setTimeout(() => setToast(null), 4000)
        return () => clearTimeout(t)
    }, [toast])

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await RegionalAdminService.getAnalytics(dateRange)
            setAnalyticsData(data)
        } catch (err: any) {
            setError(err?.message || 'Failed to load analytics')
        } finally {
            setIsLoading(false)
        }
    }, [dateRange])

    useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

    const handleExport = async () => {
        try {
            const blob = await RegionalAdminService.exportReport(reportType, 'csv')
            const url = window.URL.createObjectURL(new Blob([blob]))
            const a = document.createElement('a')
            a.href = url
            a.download = `regional-${reportType}-${dateRange}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            setToast({ message: 'Report exported successfully', type: 'success' })
        } catch (err: any) {
            setToast({ message: err?.message || 'Failed to export', type: 'error' })
        }
    }

    const validateGenForm = () => {
        const errs: Record<string, string> = {}
        if (!genForm.type) errs.type = 'Type is required'
        if (!genForm.name.trim()) errs.name = 'Name is required'
        else if (genForm.name.trim().length < 3) errs.name = 'Name must be at least 3 characters'
        else if (genForm.name.length > 80) errs.name = 'Name must be less than 80 characters'
        if (!genForm.dateRange) errs.dateRange = 'Date range is required'
        if (!['csv', 'pdf', 'xlsx'].includes(genForm.format)) errs.format = 'Invalid format'
        setGenErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleGenerateReport = async () => {
        if (!validateGenForm()) return
        setGenerating(true)
        try {
            const report = await RegionalAdminService.generateReport(genForm.type, genForm.dateRange)
            setToast({ message: `Report "${genForm.name}" generated successfully`, type: 'success' })
            setGenOpen(false)
            setGenForm({ type: 'REVENUE', name: '', dateRange: '30d', format: 'csv' })
            setGenErrors({})

            // Auto-export the newly generated report
            if (report?.id) {
                try {
                    const blob = await RegionalAdminService.exportReport(report.id, genForm.format)
                    const url = window.URL.createObjectURL(new Blob([blob]))
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${genForm.name}.${genForm.format}`
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                    document.body.removeChild(a)
                } catch {}
            }
        } catch (err: any) {
            setToast({ message: err?.message || 'Failed to generate report', type: 'error' })
        } finally {
            setGenerating(false)
        }
    }

    // Derive chart data from analytics response
    const revenueReportData = (analyticsData?.revenue?.monthly || []).map((m: any) => ({
        month: m.month,
        revenue: m.revenue || 0,
        target: m.target || 0,
        variance: (m.revenue || 0) - (m.target || 0),
    }))

    const locationRevenueData = (analyticsData?.revenue?.byLocation || []).map((l: any) => ({
        name: l.location,
        value: l.amount || 0,
    }))

    const studentGrowthData = (analyticsData?.students?.growth || []).map((s: any) => ({
        month: s.month,
        students: s.students || 0,
        newEnrollments: s.newEnrollments || 0,
        churn: s.churn || 0,
    }))

    const staffPerformanceData = (analyticsData?.staff?.byRole || []).map((s: any) => ({
        name: s.role,
        utilization: s.utilization || 0,
        count: s.count || 0,
        satisfaction: 4.3,
        retention: 90,
    }))

    const totalRevenue = analyticsData?.totalRevenue || analyticsData?.revenue?.total || 0
    const totalStudents = analyticsData?.totalStudents || analyticsData?.students?.total || 0
    const totalForChart = locationRevenueData.reduce((s: number, l: any) => s + l.value, 0) || 1
    const locationRevenueWithPct = locationRevenueData.map((l: any) => ({ ...l, percentage: Math.round((l.value / totalForChart) * 100) }))

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Regional Reports</h1>
                    <p className="text-gray-600 mt-1">Comprehensive regional performance analytics</p>
                </div>
                <div className="flex gap-2">
                    <button
                        id="admin-regional-reports-btn-generate"
                        onClick={() => setGenOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Generate Report
                    </button>
                    <button
                        id="admin-regional-reports-btn-export"
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </div>

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <p className="text-sm text-yellow-900">{error}</p>
                            <button onClick={fetchAnalytics} className="ml-auto text-sm text-yellow-700 underline">Retry</button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {REPORT_TYPES.map((report) => (
                    <motion.button
                        id={`admin-regional-reports-type-${report.id}-btn`}
                        key={report.id}
                        onClick={() => setReportType(report.id as any)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border-2 transition-all ${reportType === report.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <div className={`${report.bgColor} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                            <report.icon className={`w-6 h-6 ${report.color}`} />
                        </div>
                        <p className="font-semibold text-gray-900 text-left">{report.label} Report</p>
                        <p className="text-xs text-gray-600 text-left">{report.description}</p>
                    </motion.button>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <select
                                id="select-admin-regional-reports-range"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                            </select>
                        </div>
                        <div className="flex-1 relative">
                            <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Revenue Report */}
            {reportType === 'revenue' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">${(totalRevenue / 1000).toFixed(0)}K</p>
                                        <p className="text-xs text-green-600 mt-2">Period: {dateRange}</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Target Achievement</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{analyticsData?.revenueGrowth ?? 0}%</p>
                                        <p className="text-xs text-orange-600 mt-2">Growth rate</p>
                                    </div>
                                    <div className="bg-orange-50 p-3 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Monthly Average</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            ${revenueReportData.length > 0 ? (revenueReportData.reduce((s: number, r: any) => s + r.revenue, 0) / revenueReportData.length / 1000).toFixed(0) : 0}K
                                        </p>
                                        <p className="text-xs text-blue-600 mt-2">Across period</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Revenue Trend vs Target</CardTitle></CardHeader>
                        <CardContent>
                            {revenueReportData.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No revenue data for this period</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={revenueReportData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => typeof value === 'number' ? `$${(value / 1000).toFixed(0)}K` : value} />
                                        <Legend />
                                        <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                                        <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {locationRevenueWithPct.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Revenue by Location</CardTitle></CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RechartsPie>
                                            <Pie data={locationRevenueWithPct} cx="50%" cy="50%" labelLine={false} label={({ name, percentage }) => `${name}: ${percentage}%`} outerRadius={80} dataKey="value">
                                                {locationRevenueWithPct.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPie>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Location Revenue Details</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {locationRevenueWithPct.map((location: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{location.name}</p>
                                                        <p className="text-xs text-gray-600">${(location.value / 1000).toFixed(0)}K</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">{location.percentage}%</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Students Report */}
            {reportType === 'students' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Students</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{totalStudents.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">New Enrollments</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {studentGrowthData.reduce((s: number, m: any) => s + m.newEnrollments, 0)}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600" /></div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Churn</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {studentGrowthData.reduce((s: number, m: any) => s + m.churn, 0)}
                                        </p>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg"><TrendingUp className="w-6 h-6 text-red-600" /></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Student Growth & Churn Trend</CardTitle></CardHeader>
                        <CardContent>
                            {studentGrowthData.length === 0 ? (
                                <div className="py-12 text-center text-gray-500">No student trend data available</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={studentGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="students" stroke="#3b82f6" name="Total Students" />
                                        <Line type="monotone" dataKey="newEnrollments" stroke="#10b981" name="New Enrollments" />
                                        <Line type="monotone" dataKey="churn" stroke="#ef4444" name="Churn" />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Locations Report */}
            {reportType === 'locations' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Location Performance Summary</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Enrollment</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Occupancy</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(analyticsData?.locations?.performance || []).map((loc: any, idx: number) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium text-gray-900">{loc.location}</td>
                                                <td className="py-3 px-4 text-gray-600">{loc.enrollment ?? 0}</td>
                                                <td className="py-3 px-4 text-gray-600">${((loc.revenue ?? 0) / 1000).toFixed(0)}K</td>
                                                <td className="py-3 px-4 text-gray-600">{loc.occupancy ?? 0}%</td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={(loc.occupancy ?? 0) >= 75 ? 'default' : 'secondary'}>
                                                        {(loc.occupancy ?? 0) >= 75 ? 'Excellent' : 'Good'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {(analyticsData?.locations?.performance || []).length === 0 && (
                                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">No location data available</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Staff Report */}
            {reportType === 'staff' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Staff Performance Metrics</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {staffPerformanceData.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No staff data available</p>
                                ) : staffPerformanceData.map((staff: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                                            <Badge variant="outline">Count: {staff.count}</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div><p className="text-xs text-gray-600 mb-1">Utilization</p><p className="text-lg font-bold text-gray-900">{staff.utilization}%</p></div>
                                            <div><p className="text-xs text-gray-600 mb-1">Satisfaction</p><p className="text-lg font-bold text-gray-900">{staff.satisfaction}/5.0</p></div>
                                            <div><p className="text-xs text-gray-600 mb-1">Retention</p><p className="text-lg font-bold text-gray-900">{staff.retention}%</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Live Data</p>
                            <p className="text-xs text-blue-700">Last updated: {new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${
                            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}
                    >
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Generate Report Drawer */}
            <SlideInDrawer
                isOpen={genOpen}
                onClose={() => { setGenOpen(false); setGenErrors({}) }}
                title="Generate New Report"
                description="Configure and generate a custom report"
                size="lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
                        <select
                            value={genForm.type}
                            onChange={(e) => setGenForm(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="REVENUE">Revenue Report</option>
                            <option value="STUDENTS">Student Analytics</option>
                            <option value="LOCATIONS">Location Performance</option>
                            <option value="STAFF">Staff Performance</option>
                        </select>
                        <FormFieldHint hint="Select the type of report to generate" error={genErrors.type} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Name *</label>
                        <Input
                            value={genForm.name}
                            onChange={(e) => setGenForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Q2 Revenue Analysis"
                            className={genErrors.name ? 'border-red-500' : ''}
                        />
                        <FormFieldHint hint="3-80 characters" error={genErrors.name} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range *</label>
                        <select
                            value={genForm.dateRange}
                            onChange={(e) => setGenForm(prev => ({ ...prev, dateRange: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Export Format *</label>
                        <div className="flex gap-2">
                            {(['csv', 'pdf', 'xlsx'] as const).map(f => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setGenForm(prev => ({ ...prev, format: f }))}
                                    className={`flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${genForm.format === f ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700'}`}
                                >
                                    {f.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <button
                            type="button"
                            onClick={() => setGenOpen(false)}
                            disabled={generating}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleGenerateReport}
                            disabled={generating}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                            Generate & Download
                        </button>
                    </div>
                </div>
            </SlideInDrawer>
        </div>
    )
}
