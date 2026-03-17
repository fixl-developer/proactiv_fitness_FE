'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import {
    FileText, Download, Calendar, Filter, Eye, Plus,
    BarChart3, PieChart, TrendingUp, Users, DollarSign, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PartnerReportsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [selectedPeriod, setSelectedPeriod] = useState('monthly')
    const [reports, setReports] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        fetchReports()
    }, [isAuthenticated, router])

    const fetchReports = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const partnerId = user?.id || 'partner-1'
            const response = await PartnerPortalService.getPartnerDocuments(partnerId)

            setReports((response || []).map((doc: any) => ({
                id: doc.id,
                name: doc.name,
                type: 'Report',
                period: new Date(doc.uploadedAt).toLocaleDateString(),
                generatedDate: doc.uploadedAt,
                status: doc.status === 'active' ? 'COMPLETED' : 'PENDING',
                format: doc.type,
                size: '2.4 MB',
                description: `Report: ${doc.name}`
            })))
        } catch (err) {
            console.error('Error fetching reports:', err)
            setError('Failed to load reports')
        } finally {
            setIsLoading(false)
        }
    }
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-800'
            case 'PENDING': return 'bg-yellow-100 text-yellow-800'
            case 'FAILED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Progress Report': return 'bg-blue-100 text-blue-800'
            case 'Financial Report': return 'bg-green-100 text-green-800'
            case 'Analytics Report': return 'bg-purple-100 text-purple-800'
            case 'Compliance Report': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const handleDownloadReport = (reportId: string) => {
        // Mock download functionality
        alert(`Downloading report ${reportId}...`)
    }

    const handleGenerateReport = () => {
        alert('Generate new report functionality would be implemented here')
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
                    <h1 className="text-3xl font-bold text-gray-900">Partner Reports</h1>
                    <p className="text-gray-600 mt-1">Generate and manage partner reports</p>
                </div>
                <button
                    onClick={handleGenerateReport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Generate Report
                </button>
            </div>

            {/* Report Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Total Reports',
                        value: '4',
                        icon: FileText,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Completed',
                        value: '3',
                        icon: TrendingUp,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Pending',
                        value: '1',
                        icon: Calendar,
                        color: 'text-yellow-600',
                        bgColor: 'bg-yellow-50'
                    },
                    {
                        title: 'This Month',
                        value: '2',
                        icon: BarChart3,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                    </div>
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
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap capitalize ${selectedPeriod === period
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {period}
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
                        {[
                            {
                                name: 'Student Progress',
                                icon: Users,
                                description: 'Individual student progress and achievements',
                                color: 'text-blue-600',
                                bgColor: 'bg-blue-50'
                            },
                            {
                                name: 'Financial Summary',
                                icon: DollarSign,
                                description: 'Revenue, commissions, and financial metrics',
                                color: 'text-green-600',
                                bgColor: 'bg-green-50'
                            },
                            {
                                name: 'Attendance Analytics',
                                icon: BarChart3,
                                description: 'Attendance patterns and engagement metrics',
                                color: 'text-purple-600',
                                bgColor: 'bg-purple-50'
                            },
                            {
                                name: 'Program Performance',
                                icon: PieChart,
                                description: 'Program enrollment and success rates',
                                color: 'text-orange-600',
                                bgColor: 'bg-orange-50'
                            }
                        ].map((template, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                                onClick={handleGenerateReport}
                            >
                                <div className={`${template.bgColor} p-3 rounded-lg w-fit mb-3`}>
                                    <template.icon className={`w-6 h-6 ${template.color}`} />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                                <p className="text-sm text-gray-600">{template.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Reports List */}
            <Card>
                <CardHeader>
                    <CardTitle>Generated Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {reports.map((report, idx) => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-gray-900">{report.name}</h3>
                                        <Badge className={getStatusColor(report.status)}>
                                            {report.status}
                                        </Badge>
                                        <Badge className={getTypeColor(report.type)}>
                                            {report.type}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>Period: {report.period}</span>
                                        <span>Generated: {report.generatedDate}</span>
                                        <span>Format: {report.format}</span>
                                        <span>Size: {report.size}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDownloadReport(report.id)}
                                        className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {reports.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No reports found</p>
                    </CardContent>
                </Card>
            )}

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
