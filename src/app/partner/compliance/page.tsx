'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import PartnerAnalyticsService from '@/services/modules/partner-analytics.service'
import { motion } from 'framer-motion'
import {
    Shield, CheckCircle, AlertTriangle, XCircle, FileText,
    Calendar, Download, Eye, Clock, Award, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function PartnerCompliancePage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [complianceData, setComplianceData] = useState<any>({})

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        fetchComplianceData()
    }, [isAuthenticated, router])

    const fetchComplianceData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const partnerId = user?.id || 'partner-1'

            const [agreementsRes, documentsRes, complianceRes] = await Promise.allSettled([
                PartnerPortalService.getPartnerAgreements(partnerId),
                PartnerPortalService.getPartnerDocuments(partnerId),
                PartnerAnalyticsService.getComplianceMetrics(partnerId)
            ])

            const agreements = agreementsRes.status === 'fulfilled' ? agreementsRes.value : []
            const documents = documentsRes.status === 'fulfilled' ? documentsRes.value : []
            const complianceMetrics = complianceRes.status === 'fulfilled' ? complianceRes.value : null

            setComplianceData({
                overallScore: complianceMetrics?.complianceScore || 0,
                status: complianceMetrics?.status || 'pending',
                documentsSubmitted: complianceMetrics?.documentsSubmitted || 0,
                documentsExpiring: complianceMetrics?.documentsExpiring || 0,
                auditsPassed: complianceMetrics?.auditsPassed || 0,
                auditsFailed: complianceMetrics?.auditsFailed || 0,
                certifications: (documents || []).map((doc: any) => ({
                    id: doc.id,
                    name: doc.name,
                    status: doc.status === 'active' ? 'VALID' : doc.status === 'expired' ? 'EXPIRED' : 'EXPIRING',
                    expiryDate: doc.expiresAt || 'N/A',
                    issuer: 'Proactiv Fitness',
                    score: 95
                })),
                agreements: (agreements || []).map((a: any) => ({
                    id: a.id,
                    type: a.type,
                    status: a.status?.toUpperCase() || 'ACTIVE',
                    startDate: a.startDate,
                    endDate: a.endDate,
                    signedAt: a.signedAt
                })),
                auditLogs: [],
                safetyRecords: []
            })
        } catch (err) {
            console.error('Error fetching compliance data:', err)
            setError('Failed to load compliance data')
        } finally {
            setIsLoading(false)
        }
    }
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VALID': return 'bg-green-100 text-green-800'
            case 'EXPIRING': return 'bg-yellow-100 text-yellow-800'
            case 'EXPIRED': return 'bg-red-100 text-red-800'
            case 'PASSED': return 'bg-green-100 text-green-800'
            case 'WARNING': return 'bg-yellow-100 text-yellow-800'
            case 'FAILED': return 'bg-red-100 text-red-800'
            case 'RESOLVED': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'VALID':
            case 'PASSED':
            case 'RESOLVED':
                return CheckCircle
            case 'EXPIRING':
            case 'WARNING':
                return AlertTriangle
            case 'EXPIRED':
            case 'FAILED':
                return XCircle
            default:
                return Clock
        }
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
                    <h1 className="text-3xl font-bold text-gray-900">Partner Compliance</h1>
                    <p className="text-gray-600 mt-1">Monitor compliance status and safety records</p>
                </div>
                <button id="partner-compliance-export-btn" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-5 h-5" />
                    Export Report
                </button>
            </div>

            {/* Compliance Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        Compliance Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Overall Compliance Score</span>
                                <span className="text-2xl font-bold text-green-600">{complianceData.overallScore}%</span>
                            </div>
                            <Progress value={complianceData.overallScore} className="h-3" />
                        </div>
                        <div className="text-center">
                            <Award className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                            <Badge variant="outline" className="text-green-600 border-green-600">
                                Compliant
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Certifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Certifications & Licenses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {complianceData.certifications?.map((cert: any, idx: number) => {
                            const StatusIcon = getStatusIcon(cert.status)
                            return (
                                <motion.div
                                    key={cert.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <StatusIcon className={`w-5 h-5 ${cert.status === 'VALID' ? 'text-green-500' : cert.status === 'EXPIRING' ? 'text-yellow-500' : 'text-red-500'}`} />
                                        <div>
                                            <p className="font-medium text-gray-900">{cert.name}</p>
                                            <p className="text-sm text-gray-600">Issued by {cert.issuer}</p>
                                            <p className="text-xs text-gray-500">Expires: {cert.expiryDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={getStatusColor(cert.status)}>
                                            {cert.status}
                                        </Badge>
                                        <button id={`partner-compliance-view-cert-${cert.id}-btn`} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        Recent Audit Logs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {complianceData.auditLogs?.map((log: any, idx: number) => {
                            const StatusIcon = getStatusIcon(log.result)
                            return (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                                >
                                    <StatusIcon className={`w-5 h-5 mt-1 ${log.result === 'PASSED' ? 'text-green-500' : log.result === 'WARNING' ? 'text-yellow-500' : 'text-red-500'}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium text-gray-900">{log.type}</p>
                                            <Badge className={getStatusColor(log.result)}>
                                                {log.result}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">{log.notes}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>Date: {log.date}</span>
                                            <span>Inspector: {log.inspector}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Safety Records */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-600" />
                        Safety Records
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {complianceData.safetyRecords?.map((record: any, idx: number) => (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-gray-900">{record.type}</p>
                                    <Badge className={getStatusColor(record.status)}>
                                        {record.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                                <p className="text-sm text-gray-700 mb-2"><strong>Action Taken:</strong> {record.action}</p>
                                <p className="text-xs text-gray-500">Date: {record.date}</p>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
