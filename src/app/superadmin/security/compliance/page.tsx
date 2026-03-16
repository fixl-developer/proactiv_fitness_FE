'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuditVaultService, { ComplianceReport } from '@/services/modules/audit-vault.service'
import { motion } from 'framer-motion'
import { Shield, FileCheck, Plus, Download, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function CompliancePage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [reports, setReports] = useState<ComplianceReport[]>([])

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
            const response = await AuditVaultService.getComplianceReports()
            setReports(response)
        } catch (err) {
            console.error('Error loading compliance reports:', err)
            setError('Failed to load compliance reports')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateReport = async () => {
        try {
            await AuditVaultService.generateComplianceReport('full', 'monthly')
            await loadReports()
        } catch (err) {
            console.error('Error generating report:', err)
            alert('Failed to generate compliance report')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading compliance reports...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Compliance</h1>
                        <p className="text-gray-600">Compliance reports and audits</p>
                    </div>
                    <Button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Report
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report, idx) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileCheck className="w-5 h-5 text-blue-600" />
                                        {report.type}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600">Period</p>
                                            <p className="font-medium">{report.period}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Status</p>
                                            <Badge className={`${report.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {report.status}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-sm text-gray-600">Findings</p>
                                                <p className="text-2xl font-bold">{report.findings}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Issues</p>
                                                <p className="text-2xl font-bold text-red-600">{report.issues}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Generated</p>
                                            <p className="text-sm">{new Date(report.generatedAt).toLocaleString()}</p>
                                        </div>
                                        <Button variant="outline" className="w-full">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {reports.length === 0 && (
                    <div className="text-center py-12">
                        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No compliance reports available</p>
                        <Button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Generate First Report
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
