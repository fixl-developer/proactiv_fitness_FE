'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ReportBuilderService, { Report } from '@/services/modules/report-builder.service'
import { motion } from 'framer-motion'
import { FileText, Plus, Download, Trash2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ReportsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reports, setReports] = useState<Report[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadReports()
    }, [isAuthenticated, router])

    const loadReports = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await ReportBuilderService.getReports()
            setReports(response)
        } catch (err) {
            console.error('Error loading reports:', err)
            setError('Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (reportId: string) => {
        if (!confirm('Are you sure?')) return
        try {
            await ReportBuilderService.deleteReport(reportId)
            await loadReports()
        } catch (err) {
            console.error('Error deleting report:', err)
            alert('Failed to delete report')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading reports...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports</h1>
                        <p className="text-gray-600">Manage and view reports</p>
                    </div>
                    <Button onClick={() => router.push('/advanced/reports/builder')} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Report
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {reports.map((report, idx) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <FileText className="w-10 h-10 text-blue-600" />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{report.name}</h3>
                                                <p className="text-sm text-gray-600">{report.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">Created: {new Date(report.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-blue-100 text-blue-800">{report.type}</Badge>
                                            <Button size="sm" variant="outline">
                                                <Download className="w-4 h-4 mr-2" />
                                                Export
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(report.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {reports.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No reports yet</p>
                        <Button onClick={() => router.push('/advanced/reports/builder')} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Report
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
