'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, Download, Calendar, User, AlertCircle, Eye, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { apiClient } from '@/services/api/client'

interface Certificate {
    _id: string
    title: string
    issueDate: string
    expiryDate?: string
    issuer: string
    certificateNumber: string
    status: 'active' | 'expired'
    downloadUrl?: string
    previewUrl?: string
}

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        loadCertificates()
    }, [])

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 3500)
    }

    const loadCertificates = async () => {
        try {
            setLoading(true)
            const res: any = await apiClient.get('/user/certificates')
            const list: Certificate[] = res?.data || res?.certificates || (Array.isArray(res) ? res : [])
            setCertificates(Array.isArray(list) ? list : [])
        } catch (error) {
            console.error('Failed to load certificates:', error)
            setCertificates([])
            showMessage('error', 'Failed to load certificates')
        } finally {
            setLoading(false)
        }
    }

    const handleView = (cert: Certificate) => {
        const url = cert.previewUrl || cert.downloadUrl
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer')
        } else {
            showMessage('error', 'Preview not available for this certificate')
        }
    }

    const handleDownload = async (cert: Certificate) => {
        // If a direct URL is available, use anchor-based download
        if (cert.downloadUrl) {
            const link = document.createElement('a')
            link.href = cert.downloadUrl
            link.download = `certificate-${cert.certificateNumber || cert._id}.pdf`
            link.target = '_blank'
            link.rel = 'noopener noreferrer'
            document.body.appendChild(link)
            link.click()
            link.remove()
            showMessage('success', 'Download started')
            return
        }

        // Fallback: fetch blob from API
        try {
            const res: any = await apiClient.get(`/user/certificates/${cert._id}/download`, {
                responseType: 'blob'
            })
            const blob = res instanceof Blob ? res : new Blob([res])
            const blobUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `certificate-${cert.certificateNumber || cert._id}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(blobUrl)
            showMessage('success', 'Download started')
        } catch (error) {
            console.error('Download failed:', error)
            showMessage('error', 'Failed to download certificate')
        }
    }

    const activeCertificates = certificates.filter(c => c.status === 'active').length
    const expiredCertificates = certificates.filter(c => c.status === 'expired').length

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Certificates & Badges</h1>
                <p className="text-gray-600 mt-2 text-sm font-medium">View and manage your earned certificates</p>
            </div>

            {/* Message Alert */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg p-4 flex items-start gap-3 ${message.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-red-50 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
                        {message.text}
                    </p>
                </motion.div>
            )}

            {/* Statistics Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <Card className="p-4 border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-semibold">Total Certificates</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{certificates.length}</p>
                        </div>
                        <Award className="w-8 h-8 text-blue-400" />
                    </div>
                </Card>

                <Card className="p-4 border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-semibold">Active</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{activeCertificates}</p>
                        </div>
                        <Award className="w-8 h-8 text-green-400" />
                    </div>
                </Card>

                <Card className="p-4 border-red-200/50 bg-gradient-to-br from-red-50 to-red-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-700 font-semibold">Expired</p>
                            <p className="text-2xl font-bold text-red-900 mt-1">{expiredCertificates}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                </Card>
            </motion.div>

            {/* Certificates List */}
            {certificates.length === 0 ? (
                <Card className="p-12 border-gray-200 text-center">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No certificates yet</h3>
                    <p className="text-gray-500">
                        Complete programs and milestones to earn certificates. They will appear here once issued.
                    </p>
                </Card>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <div className="grid gap-4">
                        {certificates.map((cert, index) => (
                            <motion.div
                                key={cert._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Card className={`p-6 border-l-4 ${cert.status === 'active' ? 'border-l-emerald-500 bg-emerald-50/50' : 'border-l-red-500 bg-red-50/50'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Award className={`w-6 h-6 ${cert.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`} />
                                                <h3 className="text-lg font-bold text-gray-900">{cert.title}</h3>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cert.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {cert.status === 'active' ? 'Active' : 'Expired'}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm text-gray-600">
                                                {cert.issuer && (
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        <span className="font-medium">{cert.issuer}</span>
                                                    </div>
                                                )}
                                                {cert.issueDate && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="font-medium">Issued: {cert.issueDate}</span>
                                                    </div>
                                                )}
                                                {cert.expiryDate && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="font-medium">Expires: {cert.expiryDate}</span>
                                                    </div>
                                                )}
                                                {cert.certificateNumber && (
                                                    <div className="text-xs text-gray-500 font-mono">
                                                        Certificate #: {cert.certificateNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                onClick={() => handleView(cert)}
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-200 hover:bg-gray-50"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                            <Button
                                                onClick={() => handleDownload(cert)}
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    )
}
