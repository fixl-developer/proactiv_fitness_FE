'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerAnalyticsService from '@/services/modules/partner-analytics.service'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertCircle, DollarSign, TrendingUp, BarChart3, Star, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

export default function Analytics() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [trends, setTrends] = useState<any[]>([])
    const [exporting, setExporting] = useState<string | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadAnalytics = async () => {
            try {
                setLoading(true)
                setError(null)
                const partnerId = user?.id || 'partner-1'
                const [metricsRes, trendsRes] = await Promise.all([
                    PartnerAnalyticsService.getPerformanceMetrics(partnerId),
                    PartnerAnalyticsService.getPerformanceTrends(partnerId)
                ])
                setMetrics(metricsRes)
                setTrends(trendsRes || [])
            } catch (err) {
                console.error('Error loading analytics:', err)
                setError('Failed to load analytics')
            } finally {
                setLoading(false)
            }
        }

        loadAnalytics()
    }, [isAuthenticated, router, user])

    const handleExportCSV = useCallback(() => {
        if (!trends.length) return
        setExporting('csv')
        try {
            const headers = Object.keys(trends[0]).join(',')
            const rows = trends.map(row => Object.values(row).join(','))
            const csv = [headers, ...rows].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } finally {
            setExporting(null)
        }
    }, [trends])

    const handleExportPDF = useCallback(() => {
        setExporting('pdf')
        try {
            const printContent = document.getElementById('analytics-content')
            if (printContent) {
                const printWindow = window.open('', '_blank')
                if (printWindow) {
                    printWindow.document.write(`
                        <html><head><title>Analytics Report</title>
                        <style>body { font-family: sans-serif; padding: 20px; }</style>
                        </head><body>
                        <h1>Analytics Report - ${new Date().toLocaleDateString()}</h1>
                        <p>Total Revenue: $${metrics?.totalRevenue?.toLocaleString() || '0'}</p>
                        <p>Growth Rate: ${metrics?.growthRate?.toFixed(1) || '0'}%</p>
                        <p>Conversion Rate: ${metrics?.conversionRate?.toFixed(1) || '0'}%</p>
                        <p>Satisfaction: ${metrics?.customerSatisfaction?.toFixed(1) || '0'}%</p>
                        </body></html>
                    `)
                    printWindow.document.close()
                    printWindow.print()
                }
            }
        } finally {
            setExporting(null)
        }
    }, [metrics])

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto" id="analytics-content">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
                    <div className="flex gap-2">
                        <button
                            id="partner-analytics-export-csv-btn"
                            onClick={handleExportCSV}
                            disabled={exporting === 'csv' || loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
                        </button>
                        <button
                            id="partner-analytics-export-pdf-btn"
                            onClick={handleExportPDF}
                            disabled={exporting === 'pdf' || loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading analytics...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Colorful KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {[
                                {
                                    title: 'Total Revenue',
                                    value: `$${metrics?.totalRevenue?.toLocaleString() || '0'}`,
                                    icon: DollarSign,
                                    gradient: 'from-blue-500 to-blue-600',
                                    bgGradient: 'from-blue-50 to-blue-100',
                                    change: '+12.5%'
                                },
                                {
                                    title: 'Growth Rate',
                                    value: `${metrics?.growthRate?.toFixed(1) || '0'}%`,
                                    icon: TrendingUp,
                                    gradient: 'from-emerald-500 to-emerald-600',
                                    bgGradient: 'from-emerald-50 to-emerald-100',
                                    change: '+8.2%'
                                },
                                {
                                    title: 'Conversion Rate',
                                    value: `${metrics?.conversionRate?.toFixed(1) || '0'}%`,
                                    icon: BarChart3,
                                    gradient: 'from-purple-500 to-purple-600',
                                    bgGradient: 'from-purple-50 to-purple-100',
                                    change: '+3.1%'
                                },
                                {
                                    title: 'Satisfaction',
                                    value: `${metrics?.customerSatisfaction?.toFixed(1) || '0'}%`,
                                    icon: Star,
                                    gradient: 'from-amber-500 to-amber-600',
                                    bgGradient: 'from-amber-50 to-amber-100',
                                    change: '+5.4%'
                                },
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

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Metrics Comparison</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="students" fill="#10b981" />
                                        <Bar dataKey="bookings" fill="#f59e0b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
