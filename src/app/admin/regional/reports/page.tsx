'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Download, Filter, Calendar, TrendingUp, Users, DollarSign,
    Building2, BarChart3, PieChart, FileText, Clock, CheckCircle, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { RegionalAdminService } from '@/services/regionalAdminService'

export default function RegionalReportsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [reportType, setReportType] = useState('revenue')
    const [dateRange, setDateRange] = useState('30d')
    const [searchTerm, setSearchTerm] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAnalytics()
    }, [dateRange])

    const [analyticsData, setAnalyticsData] = useState<any>(null)

    const fetchAnalytics = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await RegionalAdminService.getAnalytics(dateRange)
            setAnalyticsData(data)
        } catch {
            setError('API not available - showing sample data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            const blob = await RegionalAdminService.exportReport('current', 'csv')
            const url = window.URL.createObjectURL(new Blob([blob]))
            const a = document.createElement('a')
            a.href = url
            a.download = `regional-report-${dateRange}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch {
            alert('Export not available yet')
        }
    }

    // Revenue Report Data
    const revenueReportData = [
        { month: 'January', revenue: 120000, target: 130000, variance: -10000 },
        { month: 'February', revenue: 128000, target: 135000, variance: -7000 },
        { month: 'March', revenue: 135000, target: 140000, variance: -5000 },
        { month: 'April', revenue: 138000, target: 142000, variance: -4000 },
        { month: 'May', revenue: 140000, target: 145000, variance: -5000 },
        { month: 'June', revenue: 142000, target: 150000, variance: -8000 },
    ]

    // Location Revenue Breakdown
    const locationRevenueData = [
        { name: 'Boston Downtown', value: 185000, percentage: 21.8 },
        { name: 'Boston Suburbs', value: 165000, percentage: 19.4 },
        { name: 'Providence', value: 125000, percentage: 14.7 },
        { name: 'Hartford', value: 145000, percentage: 17.1 },
        { name: 'New Haven', value: 115000, percentage: 13.5 },
        { name: 'Other', value: 115000, percentage: 13.5 },
    ]

    // Student Growth Data
    const studentGrowthData = [
        { month: 'Jan', students: 1050, newEnrollments: 45, churn: 12 },
        { month: 'Feb', students: 1095, newEnrollments: 52, churn: 7 },
        { month: 'Mar', students: 1155, newEnrollments: 68, churn: 8 },
        { month: 'Apr', students: 1210, newEnrollments: 72, churn: 17 },
        { month: 'May', students: 1235, newEnrollments: 45, churn: 20 },
        { month: 'Jun', students: 1250, newEnrollments: 38, churn: 23 },
    ]

    // Staff Performance Data
    const staffPerformanceData = [
        { name: 'Coaches', utilization: 85, satisfaction: 4.5, retention: 92 },
        { name: 'Managers', utilization: 90, satisfaction: 4.3, retention: 95 },
        { name: 'Support Staff', utilization: 75, satisfaction: 4.1, retention: 88 },
    ]

    // Available Reports
    const availableReports = [
        {
            id: 'revenue',
            name: 'Revenue Report',
            description: 'Monthly revenue vs targets',
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            id: 'students',
            name: 'Student Analytics',
            description: 'Enrollment and churn analysis',
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            id: 'locations',
            name: 'Location Performance',
            description: 'Performance by location',
            icon: Building2,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            id: 'staff',
            name: 'Staff Performance',
            description: 'Staff metrics and KPIs',
            icon: Users,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
    ]

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

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
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-5 h-5" />
                    Export Report
                </button>
            </div>

            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableReports.map((report) => (
                    <motion.button
                        key={report.id}
                        onClick={() => setReportType(report.id)}
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
                        <p className="font-semibold text-gray-900 text-left">{report.name}</p>
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
                            <select data-testid="select-admin-regional-reports-1"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="ytd">Year to Date</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                        <div className="flex-1 relative">
                            <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search locations..."
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
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    {/* Revenue Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">$850K</p>
                                        <p className="text-xs text-green-600 mt-2">+12.3% vs last period</p>
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
                                        <p className="text-2xl font-bold text-gray-900 mt-2">94.7%</p>
                                        <p className="text-xs text-orange-600 mt-2">-5.3% below target</p>
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
                                        <p className="text-2xl font-bold text-gray-900 mt-2">$141.7K</p>
                                        <p className="text-xs text-blue-600 mt-2">Consistent growth</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Revenue Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trend vs Target</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>

                    {/* Location Revenue Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue by Location</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPie data={locationRevenueData} cx="50%" cy="50%" labelLine={false} label={({ name, percentage }) => `${name}: ${percentage}%`} outerRadius={80}>
                                        {locationRevenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Location Revenue Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {locationRevenueData.map((location, idx) => (
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
                </motion.div>
            )}

            {/* Student Analytics Report */}
            {reportType === 'students' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Students</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">1,250</p>
                                        <p className="text-xs text-green-600 mt-2">+19% YoY growth</p>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">New Enrollments</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">275</p>
                                        <p className="text-xs text-green-600 mt-2">+8% vs last period</p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Churn Rate</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">1.8%</p>
                                        <p className="text-xs text-red-600 mt-2">+0.3% vs last period</p>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Student Growth & Churn Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Location Performance Report */}
            {reportType === 'locations' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Location Performance Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Students</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Occupancy</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {locationRevenueData.map((location, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium text-gray-900">{location.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{Math.floor(location.value / 500)}</td>
                                                <td className="py-3 px-4 text-gray-600">${(location.value / 1000).toFixed(0)}K</td>
                                                <td className="py-3 px-4 text-gray-600">{75 + Math.random() * 15}%</td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={idx < 2 ? 'default' : 'secondary'}>
                                                        {idx < 2 ? 'Excellent' : 'Good'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Staff Performance Report */}
            {reportType === 'staff' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {staffPerformanceData.map((staff, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                                            <Badge variant="outline">Active</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Utilization</p>
                                                <p className="text-lg font-bold text-gray-900">{staff.utilization}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Satisfaction</p>
                                                <p className="text-lg font-bold text-gray-900">{staff.satisfaction}/5.0</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Retention</p>
                                                <p className="text-lg font-bold text-gray-900">{staff.retention}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Report Generation Info */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Report Generated</p>
                            <p className="text-xs text-blue-700">Last updated: {new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900">Live data unavailable</p>
                                <p className="text-xs text-yellow-700">Showing sample data for development</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
