'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Download, Share2, Calendar, User, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Certificate {
    _id: string
    title: string
    issueDate: string
    expiryDate?: string
    issuer: string
    certificateNumber: string
    status: 'active' | 'expired'
}

export default function CertificatesPage() {
    const [certificates] = useState<Certificate[]>([
        {
            _id: '1',
            title: 'Advanced Fitness Training',
            issueDate: 'Mar 15, 2026',
            expiryDate: 'Mar 15, 2027',
            issuer: 'ProActiv Fitness Academy',
            certificateNumber: 'CERT-2026-001',
            status: 'active'
        },
        {
            _id: '2',
            title: 'Yoga Instructor Certification',
            issueDate: 'Feb 10, 2026',
            expiryDate: 'Feb 10, 2028',
            issuer: 'International Yoga Federation',
            certificateNumber: 'CERT-2026-002',
            status: 'active'
        },
        {
            _id: '3',
            title: 'Nutrition Basics',
            issueDate: 'Jan 20, 2026',
            expiryDate: 'Jan 20, 2027',
            issuer: 'Health & Wellness Institute',
            certificateNumber: 'CERT-2026-003',
            status: 'active'
        }
    ])

    const activeCertificates = certificates.filter(c => c.status === 'active').length
    const expiredCertificates = certificates.filter(c => c.status === 'expired').length

    const handleDownload = (certificateId: string) => {
        const link = document.createElement('a')
        link.href = `/certificates/${certificateId}.pdf`
        link.download = `certificate-${certificateId}.pdf`
        link.click()
    }

    const handleShare = (certificateId: string) => {
        const shareText = `Check out my certificate from ProActiv Fitness! Certificate #${certificateId}`
        if (navigator.share) {
            navigator.share({
                title: 'My Certificate',
                text: shareText,
                url: window.location.href
            })
        } else {
            navigator.clipboard.writeText(shareText)
            alert('Certificate link copied to clipboard!')
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Certificates & Badges</h1>
                <p className="text-gray-600 mt-2 text-sm font-medium">View and manage your earned certificates</p>
            </div>

            {/* Statistics Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                {/* Total Certificates */}
                <Card className="p-4 border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-semibold">Total Certificates</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{certificates.length}</p>
                        </div>
                        <Award className="w-8 h-8 text-blue-400" />
                    </div>
                </Card>

                {/* Active Certificates */}
                <Card className="p-4 border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-semibold">Active</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{activeCertificates}</p>
                        </div>
                        <Award className="w-8 h-8 text-green-400" />
                    </div>
                </Card>

                {/* Expired Certificates */}
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
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span className="font-medium">{cert.issuer}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-medium">Issued: {cert.issueDate}</span>
                                            </div>
                                            {cert.expiryDate && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="font-medium">Expires: {cert.expiryDate}</span>
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500 font-mono">
                                                Certificate #: {cert.certificateNumber}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            onClick={() => handleDownload(cert._id)}
                                            variant="outline"
                                            size="sm"
                                            className="border-gray-200 hover:bg-gray-50"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button
                                            onClick={() => handleShare(cert._id)}
                                            variant="outline"
                                            size="sm"
                                            className="border-gray-200 hover:bg-gray-50"
                                        >
                                            <Share2 className="w-4 h-4 mr-2" />
                                            Share
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Badges Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="p-6 border-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Earned Badges</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: 'Consistent Trainer', icon: '🏆' },
                            { name: 'Fitness Master', icon: '💪' },
                            { name: 'Wellness Champion', icon: '⭐' },
                            { name: 'Goal Achiever', icon: '🎯' }
                        ].map((badge, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200/50 hover:shadow-md transition-shadow"
                            >
                                <div className="text-4xl mb-2">{badge.icon}</div>
                                <p className="text-sm font-semibold text-gray-900 text-center">{badge.name}</p>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
