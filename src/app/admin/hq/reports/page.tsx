'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Download, Filter, Calendar, FileText, TrendingUp, Users, DollarSign } from 'lucide-react'
import { HQAdminService } from '@/services/hqAdminService'

export default function ReportsPage() {
    const [reportType, setReportType] = useState('revenue')
    const [dateRange, setDateRange] = useState('30d')
    const [reports, setReports] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchReports()
    }, [reportType, dateRange])

    const fetchReports = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Will call backend when available
            const data = await HQAdminService.getReports?.(reportType, dateRange)
            setReports(data || getMockReports())
        } catch (err: any) {
            console.error('Error fetching reports:', err)
            setError(err.message)
            setReports(getMockReports())
        } finally {
            setIsLoading(false)
        }
    }

    const getMockReports = () => {
        const mockData: any = {
            revenue: [
                { id: 1, name: 'Total Revenue Report', date: '2026-03-14', period: 'March 2026', value: '$3,450,000', status: 'completed' },
                { id: 2, name: 'Revenue by Location', date: '2026-03-13', period: 'March 2026', value: '5 locations', status: 'completed' },
                { id: 3, name: 'Revenue Forecast', date: '2026-03-12', period: 'Q2 2026', value: '$4,200,000', status: 'completed' },
            ],
            users: [
                { id: 1, name: 'User Growth Report', date: '2026-03-14', period: 'March 2026', value: '2,650 users', status: 'completed' },
                { id: 2, name: 'User Activity Report', date: '2026-03-13', period: 'March 2026', value: '1,850 active', status: 'completed' },
                { id: 3, name: 'User Demographics', date: '2026-03-12', period: 'March 2026', value: '6 roles', status: 'completed' },
            ],
            programs: [
                { id: 1, name: 'Program Enrollment Report', date: '2026-03-14', period: 'March 2026', value: '2,280 enrolled', status: 'completed' },
                { id: 2, name: 'Program Performance', date: '2026-03-13', period: 'March 2026', value: '4 programs', status: 'completed' },
                { id: 3, name: 'Program Capacity Analysis', date: '2026-03-12', period: 'March 2026', value: '85% capacity', status: 'completed' },
            ],
            locations: [
                { id: 1, name: 'Location Performance Report', date: '2026-03-14', period: 'March 2026', value: '5 locations', status: 'completed' },
                { id: 2, name: 'Location Revenue Breakdown', date: '2026-03-13', period: 'March 2026', value: '$3.2M total', status: 'completed' },
                { id: 3, name: 'Location Capacity Report', date: '2026-03-12', period: 'March 2026', value: '2,310 capacity', status: 'completed' },
            ],
        }
        return mockData[reportType] || []
    }

    const reportTypeOptions = [
        { value: 'revenue', label: 'Revenue Reports', icon: DollarSign },
        { value: 'users', label: 'User Reports', icon: Users },
        { value: 'programs', label: 'Program Reports', icon: BarChart3 },
        { value: 'locations', label: 'Location Reports', icon: TrendingUp },
    ]

    const handleExport = (format: 'pdf' | 'csv') => {
        alert(`Exporting ${reportType} report as ${format.toUpperCase()}...`)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Export</h1>
                    <p className="text-gray-600 mt-1">Generate and export system reports</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        PDF
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        CSV
                    </button>
                </div>
            </div>

            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {reportTypeOptions.map((option) => (
                    <motion.button
                        key={option.value}
                        onClick={() => setReportType(option.value)}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-lg border-2 transition-all ${reportType === option.value
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                    >
                        <option.icon className={`w-6 h-6 mb-2 ${reportType === option.value ? 'text-blue-600' : 'text-gray-600'}`} />
                        <p className={`text-sm font-medium ${reportType === option.value ? 'text-blue-600' : 'text-gray-700'}`}>
                            {option.label}
                        </p>
                    </motion.button>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="1y">Last Year</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Reports List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report, idx) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-6 h-6 text-blue-600 mt-1" />
                                        <div>
                                            <CardTitle className="text-lg">{report.name}</CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">{report.period}</p>
                                        </div>
                                    </div>
                                    <Badge variant="default">{report.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Report Value</p>
                                        <p className="text-xl font-bold text-gray-900 mt-1">{report.value}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                            View
                                        </button>
                                        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                            Download
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">Generated: {report.date}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ {error} - Showing mock data for development
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
