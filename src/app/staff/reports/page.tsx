'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ReportingService from '@/services/modules/reporting.service'
import { Plus, Download, AlertCircle } from 'lucide-react'

export default function Reports() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reports, setReports] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadReports = async () => {
            setLoading(true)
            try {
                const data = await ReportingService.getReports({})
                setReports(data || [])
            } catch {
                setReports([])
            } finally {
                setLoading(false)
            }
        }

        loadReports()
    }, [isAuthenticated, router])

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Reports</h1>
                    <button id="staff-reports-generate-btn" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Generate Report
                    </button>
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
                            <p className="text-gray-600">Loading reports...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Report Name</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Type</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Generated</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-gray-900 font-medium">{report.name}</td>
                                        <td className="py-3 px-6 text-gray-600">{report.type}</td>
                                        <td className="py-3 px-6 text-gray-600">{new Date(report.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-6">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                Completed
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <button id={`staff-reports-download-${report.id}-btn`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
