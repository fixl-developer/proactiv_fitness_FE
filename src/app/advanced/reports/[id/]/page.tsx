'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ReportBuilderService, { Report } from '@/services/modules/report-builder.service'
import { AlertCircle, Download, Share2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ReportViewerPage() {
    const router = useRouter()
    const params = useParams()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [report, setReport] = useState<Report | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        if (params.id) {
            loadReport(params.id as string)
        }
    }, [isAuthenticated, router, params.id])

    const loadReport = async (reportId: string) => {
        try {
            setLoading(true)
            setError(null)
            const response = await ReportBuilderService.getReportById(reportId)
            setReport(response)
        } catch (err) {
            console.error('Error loading report:', err)
            setError('Failed to load report')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading report...</p>
                </div>
            </div>
        )
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">Report not found</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{report.name}</h1>
                        <p className="text-gray-600">{report.description}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button id="advanced-reports-id-btn" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button id="advanced-reports-id-btn-2" variant="outline">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Report Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 p-8 rounded-lg min-h-96">
                            <p className="text-gray-600 text-center">Report content will be displayed here</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
