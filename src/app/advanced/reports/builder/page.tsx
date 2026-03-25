'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ReportBuilderService from '@/services/modules/report-builder.service'
import { motion } from 'framer-motion'
import { BarChart3, AlertCircle, Save, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ReportBuilderPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [reportName, setReportName] = useState('')
    const [reportType, setReportType] = useState('table')
    const [dataSource, setDataSource] = useState('bookings')
    const [metrics, setMetrics] = useState<string[]>(['count'])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, router])

    const handleSave = async () => {
        try {
            setLoading(true)
            setError(null)
            await ReportBuilderService.createReport({
                name: reportName,
                type: reportType,
                dataSource,
                metrics
            })
            router.push('/advanced/reports')
        } catch (err) {
            console.error('Error saving report:', err)
            setError('Failed to save report')
        } finally {
            setLoading(false)
        }
    }

    const handlePreview = async () => {
        try {
            setLoading(true)
            setError(null)
            await ReportBuilderService.previewReport({
                name: reportName,
                type: reportType,
                dataSource,
                metrics
            })
        } catch (err) {
            console.error('Error previewing:', err)
            setError('Failed to preview report')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Report Builder</h1>
                    <p className="text-gray-600">Create custom reports</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    Report Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                                        <input
                                            id="report-builder-name-input"
                                            type="text"
                                            value={reportName}
                                            onChange={(e) => setReportName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="My Report"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                                        <select id="report-builder-type-select"
                                            value={reportType}
                                            onChange={(e) => setReportType(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="table">Table</option>
                                            <option value="chart">Chart</option>
                                            <option value="summary">Summary</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                                        <select id="report-builder-source-select"
                                            value={dataSource}
                                            onChange={(e) => setDataSource(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="bookings">Bookings</option>
                                            <option value="users">Users</option>
                                            <option value="revenue">Revenue</option>
                                            <option value="attendance">Attendance</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button id="report-builder-preview-btn" onClick={handlePreview} disabled={loading} variant="outline" className="flex-1">
                                            <Play className="w-4 h-4 mr-2" />
                                            Preview
                                        </Button>
                                        <Button id="report-builder-save-btn" onClick={handleSave} disabled={loading || !reportName} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                            <Save className="w-4 h-4 mr-2" />
                                            {loading ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center h-64 text-gray-400">
                                    <div className="text-center">
                                        <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Configure your report and click Preview to see results</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
