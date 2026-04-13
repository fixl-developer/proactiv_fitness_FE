'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, DollarSign, Users, Calendar, Download, RefreshCw,
    FileText, PieChart, Activity, Target, ArrowUp, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface ReportData {
    totalRevenue: number
    totalStudents: number
    classesCompleted: number
    averageAttendance: number
    revenueGrowth: number
    studentGrowth: number
    attendanceRate: number
    programPerformance: { program: string; students: number; revenue: number; growth: number }[]
    coachPerformance: { name: string; students: number; rating: number; revenue: number }[]
}

const DEFAULT_REPORT: ReportData = {
    totalRevenue: 485000,
    totalStudents: 89,
    classesCompleted: 156,
    averageAttendance: 87.5,
    revenueGrowth: 12.5,
    studentGrowth: 8.3,
    attendanceRate: 92.1,
    programPerformance: [
        { program: 'Beginner Gymnastics', students: 35, revenue: 168000, growth: 15.2 },
        { program: 'Intermediate Gymnastics', students: 28, revenue: 201600, growth: 8.7 },
        { program: 'Advanced Gymnastics', students: 18, revenue: 172800, growth: 12.1 },
        { program: 'Private Coaching', students: 8, revenue: 128000, growth: 22.5 },
    ],
    coachPerformance: [
        { name: 'Sarah Johnson', students: 24, rating: 4.9, revenue: 115200 },
        { name: 'Mike Chen', students: 18, rating: 4.7, revenue: 86400 },
        { name: 'Lisa Zhang', students: 12, rating: 4.8, revenue: 76800 },
        { name: 'Tom Wilson', students: 15, rating: 4.5, revenue: 72000 },
    ],
}

const ManagerReportsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')
    const [reportData, setReportData] = useState<ReportData>(DEFAULT_REPORT)
    const [isExporting, setIsExporting] = useState(false)

    const loadReports = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true)
            else setIsLoading(true)

            const response = await apiClient.get(`/reports/location?period=${selectedPeriod}`)
            if (response.success && response.data) {
                setReportData({
                    totalRevenue: response.data.totalRevenue ?? DEFAULT_REPORT.totalRevenue,
                    totalStudents: response.data.totalStudents ?? DEFAULT_REPORT.totalStudents,
                    classesCompleted: response.data.classesCompleted ?? DEFAULT_REPORT.classesCompleted,
                    averageAttendance: response.data.averageAttendance ?? DEFAULT_REPORT.averageAttendance,
                    revenueGrowth: response.data.revenueGrowth ?? DEFAULT_REPORT.revenueGrowth,
                    studentGrowth: response.data.studentGrowth ?? DEFAULT_REPORT.studentGrowth,
                    attendanceRate: response.data.attendanceRate ?? DEFAULT_REPORT.attendanceRate,
                    programPerformance: response.data.programPerformance ?? DEFAULT_REPORT.programPerformance,
                    coachPerformance: response.data.coachPerformance ?? DEFAULT_REPORT.coachPerformance,
                })
            } else {
                setReportData(DEFAULT_REPORT)
            }
        } catch (error) {
            console.error('Error loading reports:', error)
            setReportData(DEFAULT_REPORT)
        } finally {
            setIsLoading(false)
            setRefreshing(false)
        }
    }, [selectedPeriod])

    useEffect(() => {
        loadReports()
    }, [loadReports])

    const handleExport = async (format: string) => {
        try {
            setIsExporting(true)
            const response = await apiClient.get(`/reports/export?period=${selectedPeriod}&format=${format}`, {
                responseType: 'blob' as any
            })
            // If API returns a file, download it
            if (response instanceof Blob) {
                const url = URL.createObjectURL(response)
                const link = document.createElement('a')
                link.href = url
                link.download = `report-${selectedPeriod}.${format}`
                link.click()
                URL.revokeObjectURL(url)
            }
            toast.success(`Report exported as ${format.toUpperCase()}`)
        } catch (error) {
            console.error('Export failed:', error)
            // Fallback: generate CSV locally
            const csv = [
                'Metric,Value',
                `Total Revenue,HK$${reportData.totalRevenue}`,
                `Total Students,${reportData.totalStudents}`,
                `Classes Completed,${reportData.classesCompleted}`,
                `Attendance Rate,${reportData.attendanceRate}%`,
            ].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `report-${selectedPeriod}.csv`
            link.click()
            URL.revokeObjectURL(url)
            toast.success('Report exported locally')
        } finally {
            setIsExporting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Location performance insights and metrics</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <Button id="manager-reports-refresh-btn" variant="outline" size="sm" onClick={() => loadReports(true)} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button id="manager-reports-export-btn" size="sm" onClick={() => handleExport('csv')} disabled={isExporting}>
                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Export
                    </Button>
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {['week', 'month', 'quarter'].map((period) => (
                            <button id={`manager-reports-period-${period}-btn`}
                                key={period}
                                onClick={() => setSelectedPeriod(period as any)}
                                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${selectedPeriod === period
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { title: 'Total Revenue', value: `HK$${reportData.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', growth: `+${reportData.revenueGrowth}%` },
                    { title: 'Total Students', value: reportData.totalStudents, icon: Users, color: 'text-blue-600', growth: `+${reportData.studentGrowth}%` },
                    { title: 'Classes Completed', value: reportData.classesCompleted, icon: Activity, color: 'text-purple-600', growth: 'This month' },
                    { title: 'Attendance Rate', value: `${reportData.attendanceRate}%`, icon: Target, color: 'text-orange-600', growth: 'Excellent' },
                ].map((metric, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">{metric.title}</CardTitle>
                                <metric.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${metric.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl sm:text-2xl font-bold text-gray-900">{metric.value}</div>
                                <div className="flex items-center mt-1">
                                    <ArrowUp className={`w-3 h-3 sm:w-4 sm:h-4 ${metric.color} mr-1`} />
                                    <span className={`text-xs sm:text-sm font-medium ${metric.color}`}>{metric.growth}</span>
                                </div>
                                <Progress value={85} className="mt-3 h-1.5 sm:h-2" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Program Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Program Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="space-y-4 min-w-0">
                            {reportData.programPerformance.map((program, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-lg gap-3"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{program.program}</h4>
                                            <p className="text-xs sm:text-sm text-gray-600">{program.students} students enrolled</p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right flex-shrink-0">
                                        <p className="text-base sm:text-lg font-bold text-purple-600">HK${program.revenue.toLocaleString()}</p>
                                        <div className="flex items-center sm:justify-end">
                                            <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1" />
                                            <span className="text-xs sm:text-sm text-green-600 font-medium">+{program.growth}%</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Coach Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Coach Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="space-y-4 min-w-0">
                            {reportData.coachPerformance.map((coach, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg gap-3"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {coach.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{coach.name}</h4>
                                            <p className="text-xs sm:text-sm text-gray-600">{coach.students} students - Rating: {coach.rating}</p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right flex-shrink-0">
                                        <p className="text-base sm:text-lg font-bold text-blue-600">HK${coach.revenue.toLocaleString()}</p>
                                        <p className="text-xs sm:text-sm text-gray-600">Revenue generated</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Reports */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Quick Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <Button id="manager-reports-monthly-btn" className="h-16 sm:h-20 flex-col gap-2 text-xs sm:text-sm" variant="outline"
                            onClick={() => handleExport('csv')}>
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Monthly Report</span>
                        </Button>
                        <Button id="manager-reports-revenue-btn" className="h-16 sm:h-20 flex-col gap-2 text-xs sm:text-sm" variant="outline"
                            onClick={() => handleExport('csv')}>
                            <PieChart className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Revenue Analysis</span>
                        </Button>
                        <Button id="manager-reports-student-btn" className="h-16 sm:h-20 flex-col gap-2 text-xs sm:text-sm" variant="outline"
                            onClick={() => handleExport('csv')}>
                            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Student Report</span>
                        </Button>
                        <Button id="manager-reports-export-data-btn" className="h-16 sm:h-20 flex-col gap-2 text-xs sm:text-sm" variant="outline"
                            onClick={() => handleExport('csv')}>
                            <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Export Data</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ManagerReportsPage
