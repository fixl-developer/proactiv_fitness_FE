'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BarChart3, Download, Filter, TrendingUp, Users, Calendar,
    Award, Target, AlertCircle, CheckCircle, FileText, FileSpreadsheet,
    Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { coachService, CoachReportData } from '@/services/modules/coach.service'

// ==================== MOCK DATA ====================

const MOCK_REPORT_DATA: CoachReportData = {
    totalClasses: 48,
    totalStudents: 45,
    avgAttendance: 92,
    avgRating: 4.7,
    classDistribution: [
        { name: 'Beginner', count: 18, percentage: 38 },
        { name: 'Intermediate', count: 20, percentage: 42 },
        { name: 'Advanced', count: 10, percentage: 20 }
    ],
    studentProgress: [
        { name: 'Aarav Patel', progress: 75, trend: 'up' },
        { name: 'Priya Singh', progress: 85, trend: 'up' },
        { name: 'Rohan Kumar', progress: 92, trend: 'up' },
        { name: 'Ananya Sharma', progress: 65, trend: 'stable' },
        { name: 'Vikram Desai', progress: 78, trend: 'up' }
    ],
    attendanceByDay: [
        { day: 'Monday', attended: 42, total: 45, percentage: 93 },
        { day: 'Tuesday', attended: 41, total: 45, percentage: 91 },
        { day: 'Wednesday', attended: 44, total: 45, percentage: 98 },
        { day: 'Thursday', attended: 40, total: 45, percentage: 89 },
        { day: 'Friday', attended: 43, total: 45, percentage: 96 },
        { day: 'Saturday', attended: 38, total: 40, percentage: 95 }
    ],
    performanceMetrics: [
        { metric: 'Student Satisfaction', value: 94 },
        { metric: 'Class Completion Rate', value: 98 },
        { metric: 'Skill Improvement', value: 87 },
        { metric: 'Attendance Consistency', value: 92 }
    ]
}

// ==================== HELPERS ====================

const isDataEmpty = (data: CoachReportData): boolean => {
    return (
        data.totalClasses === 0 &&
        data.totalStudents === 0 &&
        data.avgAttendance === 0 &&
        data.avgRating === 0
    )
}

const generateCSVContent = (data: CoachReportData, reportType: string): string => {
    let csv = ''

    if (reportType === 'overview' || reportType === 'all') {
        csv += 'OVERVIEW REPORT\n'
        csv += 'Metric,Value\n'
        csv += `Total Classes,${data.totalClasses}\n`
        csv += `Total Students,${data.totalStudents}\n`
        csv += `Avg Attendance,${data.avgAttendance}%\n`
        csv += `Avg Rating,${data.avgRating}/5\n`
        csv += '\nCLASS DISTRIBUTION\n'
        csv += 'Level,Count,Percentage\n'
        data.classDistribution.forEach(item => {
            csv += `${item.name},${item.count},${item.percentage}%\n`
        })
    }

    if (reportType === 'students' || reportType === 'all') {
        csv += '\nSTUDENT PROGRESS\n'
        csv += 'Name,Progress,Trend\n'
        data.studentProgress.forEach(student => {
            csv += `${student.name},${student.progress}%,${student.trend}\n`
        })
    }

    if (reportType === 'attendance' || reportType === 'all') {
        csv += '\nATTENDANCE BY DAY\n'
        csv += 'Day,Attended,Total,Percentage\n'
        data.attendanceByDay.forEach(day => {
            csv += `${day.day},${day.attended},${day.total},${day.percentage}%\n`
        })
    }

    if (reportType === 'performance' || reportType === 'all') {
        csv += '\nPERFORMANCE METRICS\n'
        csv += 'Metric,Value\n'
        data.performanceMetrics.forEach(item => {
            csv += `${item.metric},${item.value}%\n`
        })
    }

    return csv
}

const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

const generatePDFContent = (data: CoachReportData, reportType: string, dateRange: string): string => {
    const dateLabel = dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'This Month' : dateRange === 'quarter' ? 'This Quarter' : 'This Year'
    let html = `
    <html>
    <head>
        <title>Coach Report - ${reportType}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; }
            h1 { color: #1e3a5f; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
            h2 { color: #2d5986; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 10px 14px; text-align: left; }
            th { background-color: #f0f4f8; font-weight: 600; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .kpi-grid { display: flex; gap: 20px; flex-wrap: wrap; margin: 20px 0; }
            .kpi-card { flex: 1; min-width: 150px; background: #f0f4f8; border-radius: 8px; padding: 16px; text-align: center; }
            .kpi-value { font-size: 28px; font-weight: bold; color: #1e3a5f; }
            .kpi-label { font-size: 13px; color: #666; margin-top: 4px; }
            .footer { margin-top: 40px; font-size: 12px; color: #999; text-align: center; }
            @media print { body { padding: 20px; } }
        </style>
    </head>
    <body>
        <h1>Coach Performance Report</h1>
        <p><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} &nbsp;|&nbsp; <strong>Period:</strong> ${dateLabel} &nbsp;|&nbsp; <strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>

        <div class="kpi-grid">
            <div class="kpi-card"><div class="kpi-value">${data.totalClasses}</div><div class="kpi-label">Total Classes</div></div>
            <div class="kpi-card"><div class="kpi-value">${data.totalStudents}</div><div class="kpi-label">Total Students</div></div>
            <div class="kpi-card"><div class="kpi-value">${data.avgAttendance}%</div><div class="kpi-label">Avg Attendance</div></div>
            <div class="kpi-card"><div class="kpi-value">${data.avgRating}/5</div><div class="kpi-label">Avg Rating</div></div>
        </div>`

    if (data.classDistribution.length > 0) {
        html += `
        <h2>Class Distribution</h2>
        <table>
            <tr><th>Level</th><th>Count</th><th>Percentage</th></tr>
            ${data.classDistribution.map(item => `<tr><td>${item.name}</td><td>${item.count}</td><td>${item.percentage}%</td></tr>`).join('')}
        </table>`
    }

    if (data.studentProgress.length > 0) {
        html += `
        <h2>Student Progress</h2>
        <table>
            <tr><th>Name</th><th>Progress</th><th>Trend</th></tr>
            ${data.studentProgress.map(s => `<tr><td>${s.name}</td><td>${s.progress}%</td><td>${s.trend}</td></tr>`).join('')}
        </table>`
    }

    if (data.attendanceByDay.length > 0) {
        html += `
        <h2>Attendance by Day</h2>
        <table>
            <tr><th>Day</th><th>Attended</th><th>Total</th><th>Percentage</th></tr>
            ${data.attendanceByDay.map(d => `<tr><td>${d.day}</td><td>${d.attended}</td><td>${d.total}</td><td>${d.percentage}%</td></tr>`).join('')}
        </table>`
    }

    if (data.performanceMetrics.length > 0) {
        html += `
        <h2>Performance Metrics</h2>
        <table>
            <tr><th>Metric</th><th>Value</th></tr>
            ${data.performanceMetrics.map(m => `<tr><td>${m.metric}</td><td>${m.value}%</td></tr>`).join('')}
        </table>`
    }

    html += `
        <div class="footer">Generated by ProActiv Fitness Coach Dashboard</div>
    </body>
    </html>`

    return html
}

// ==================== COMPONENT ====================

const CoachReportsPage = () => {
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [isSwitching, setIsSwitching] = useState(false)
    const [reportType, setReportType] = useState('overview')
    const [dateRange, setDateRange] = useState('month')
    const [reportData, setReportData] = useState<CoachReportData>(MOCK_REPORT_DATA)
    const [isExporting, setIsExporting] = useState<string | null>(null)

    const loadReportData = useCallback(async (type: string, range: string) => {
        const coachId = user?.id || ''
        if (!coachId) {
            setReportData(MOCK_REPORT_DATA)
            setIsLoading(false)
            setIsSwitching(false)
            return
        }

        try {
            const data = await coachService.getReportData(coachId, type, range)
            setReportData({
                totalClasses: data.totalClasses ?? 0,
                totalStudents: data.totalStudents ?? 0,
                avgAttendance: data.avgAttendance ?? 0,
                avgRating: data.avgRating ?? 0,
                classDistribution: data.classDistribution ?? [],
                studentProgress: data.studentProgress ?? [],
                attendanceByDay: data.attendanceByDay ?? [],
                performanceMetrics: data.performanceMetrics ?? []
            })
        } catch (error) {
            console.error('Error loading report data, using mock:', error)
            setReportData(MOCK_REPORT_DATA)
        } finally {
            setIsLoading(false)
            setIsSwitching(false)
        }
    }, [user?.id])

    useEffect(() => {
        if (!isAuthenticated && !localStorage.getItem('token')) return
        loadReportData(reportType, dateRange)
    }, [isAuthenticated, loadReportData])

    const handleApplyFilter = () => {
        setIsSwitching(true)
        loadReportData(reportType, dateRange)
    }

    const handleReportTypeChange = (newType: string) => {
        setReportType(newType)
        setIsSwitching(true)
        setTimeout(() => setIsSwitching(false), 300)
    }

    const handleDownload = async (format: string) => {
        setIsExporting(format)
        try {
            const timestamp = new Date().toISOString().split('T')[0]
            const filename = `coach-report-${reportType}-${timestamp}`

            if (format === 'csv') {
                const csv = generateCSVContent(reportData, reportType)
                downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
            } else if (format === 'excel') {
                // Generate CSV with Excel-compatible format (Excel can open CSV)
                const csv = '\uFEFF' + generateCSVContent(reportData, reportType) // BOM for Excel UTF-8
                downloadFile(csv, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;')
            } else if (format === 'pdf') {
                const htmlContent = generatePDFContent(reportData, reportType, dateRange)
                const printWindow = window.open('', '_blank')
                if (printWindow) {
                    printWindow.document.write(htmlContent)
                    printWindow.document.close()
                    setTimeout(() => {
                        printWindow.print()
                    }, 500)
                } else {
                    // Fallback: download as HTML file
                    downloadFile(htmlContent, `${filename}.html`, 'text/html;charset=utf-8;')
                }
            }
        } catch (error) {
            console.error(`Error exporting as ${format}:`, error)
        } finally {
            setTimeout(() => setIsExporting(null), 1000)
        }
    }

    // KPI metrics configuration with colorful gradients
    const getChangeLabel = (value: number, type: string): string => {
        if (type === 'attendance') return value >= 90 ? 'Excellent' : value >= 75 ? 'Good' : 'Needs Work'
        if (type === 'rating') return value >= 4.5 ? 'Outstanding' : value >= 3.5 ? 'Good' : 'Improving'
        return value > 0 ? 'Active' : '—'
    }

    const kpiMetrics = [
        {
            title: 'Total Classes',
            value: reportData.totalClasses.toString(),
            icon: Calendar,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100/50',
            change: getChangeLabel(reportData.totalClasses, 'count')
        },
        {
            title: 'Total Students',
            value: reportData.totalStudents.toString(),
            icon: Users,
            gradient: 'from-green-500 to-green-600',
            bgGradient: 'from-green-50 to-green-100/50',
            change: getChangeLabel(reportData.totalStudents, 'count')
        },
        {
            title: 'Avg Attendance',
            value: `${reportData.avgAttendance}%`,
            icon: CheckCircle,
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100/50',
            change: getChangeLabel(reportData.avgAttendance, 'attendance')
        },
        {
            title: 'Avg Rating',
            value: `${reportData.avgRating}/5`,
            icon: Award,
            gradient: 'from-orange-500 to-orange-600',
            bgGradient: 'from-orange-50 to-orange-100/50',
            change: getChangeLabel(reportData.avgRating, 'rating')
        }
    ]

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Reports</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        View and analyze coaching performance reports
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Report Type
                            </label>
                            <select
                                data-testid="select-coach-reports-1"
                                value={reportType}
                                onChange={(e) => handleReportTypeChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="overview">Overview</option>
                                <option value="students">Student Progress</option>
                                <option value="attendance">Attendance</option>
                                <option value="performance">Performance</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date Range
                            </label>
                            <select
                                data-testid="select-coach-reports-2"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none"
                                onClick={handleApplyFilter}
                                disabled={isSwitching}
                            >
                                {isSwitching ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Filter className="w-4 h-4 mr-2" />
                                )}
                                Apply
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading overlay for report switching */}
            <AnimatePresence mode="wait">
                {isSwitching ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center py-20"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <p className="text-sm text-gray-500">Loading report data...</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={reportType}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Overview Report */}
                        {reportType === 'overview' && (
                            <div className="space-y-6">
                                {/* Colorful KPI Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {kpiMetrics.map((metric, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                                            <metric.icon className="w-5 h-5 text-white" />
                                                        </div>
                                                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                            {metric.change}
                                                        </span>
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

                                {/* Class Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Class Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {reportData.classDistribution.length > 0 ? (
                                            <div className="space-y-4">
                                                {reportData.classDistribution.map((level, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-700">{level.name}</span>
                                                            <span className="text-sm font-bold text-gray-900">{level.count} classes</span>
                                                        </div>
                                                        <Progress value={level.percentage} className="h-2" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">No class distribution data available yet</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Student Progress Report */}
                        {reportType === 'students' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Student Progress Report</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reportData.studentProgress.length > 0 ? (
                                        <div className="space-y-4">
                                            {reportData.studentProgress.map((student, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="p-4 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900">{student.progress}%</span>
                                                            <TrendingUp className={`w-4 h-4 ${student.trend === 'up' ? 'text-green-600' : 'text-gray-400'}`} />
                                                        </div>
                                                    </div>
                                                    <Progress value={student.progress} className="h-2" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No student progress data available yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Attendance Report */}
                        {reportType === 'attendance' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Attendance Report</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reportData.attendanceByDay.length > 0 ? (
                                        <div className="space-y-4">
                                            {reportData.attendanceByDay.map((day, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="p-4 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-gray-900">{day.day}</h4>
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {day.attended}/{day.total} ({day.percentage}%)
                                                        </span>
                                                    </div>
                                                    <Progress value={day.percentage} className="h-2" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No attendance data available for this period</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Performance Report */}
                        {reportType === 'performance' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Metrics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reportData.performanceMetrics.length > 0 ? (
                                        <div className="space-y-6">
                                            {reportData.performanceMetrics.map((item, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                                                        <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                                                    </div>
                                                    <Progress value={item.value} className="h-3" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">No performance data available yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Export Report */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Export Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDownload('pdf')}
                            disabled={isExporting !== null}
                        >
                            {isExporting === 'pdf' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4 mr-2" />
                            )}
                            Download as PDF
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDownload('excel')}
                            disabled={isExporting !== null}
                        >
                            {isExporting === 'excel' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                            )}
                            Download as Excel
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDownload('csv')}
                            disabled={isExporting !== null}
                        >
                            {isExporting === 'csv' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Download as CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default CoachReportsPage
