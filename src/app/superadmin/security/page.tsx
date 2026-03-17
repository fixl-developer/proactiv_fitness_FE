'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuditVaultService from '@/services/modules/audit-vault.service'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Lock, Eye, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function SecurityOverviewPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [securityEvents, setSecurityEvents] = useState<any[]>([])
    const [statistics, setStatistics] = useState<any>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadSecurityData()
    }, [isAuthenticated, router])

    const loadSecurityData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [eventsRes, statsRes] = await Promise.all([
                AuditVaultService.getSecurityEvents({ severity: 'high' }),
                AuditVaultService.getAuditStatistics()
            ])
            setSecurityEvents(eventsRes)
            setStatistics(statsRes)
        } catch (err) {
            console.error('Error loading security data:', err)
            setError('Failed to load security data')
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
                    <p className="text-gray-600">Loading security overview...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Security Overview</h1>
                    <p className="text-gray-600">Monitor system security and threats</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Security Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Security Score</p>
                                        <p className="text-3xl font-bold text-green-600 mt-2">{statistics?.securityScore || 95}%</p>
                                    </div>
                                    <Shield className="w-12 h-12 text-green-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Active Threats</p>
                                        <p className="text-3xl font-bold text-red-600 mt-2">{statistics?.activeThreats || 3}</p>
                                    </div>
                                    <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Failed Logins</p>
                                        <p className="text-3xl font-bold text-yellow-600 mt-2">{statistics?.failedLogins || 12}</p>
                                    </div>
                                    <Lock className="w-12 h-12 text-yellow-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Audit Logs</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-2">{statistics?.totalLogs?.toLocaleString() || '0'}</p>
                                    </div>
                                    <FileText className="w-12 h-12 text-blue-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Recent Security Events */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                Recent Security Events ({securityEvents.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {securityEvents.slice(0, 10).map((event, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <AlertTriangle className={`w-5 h-5 mt-1 ${event.severity === 'critical' ? 'text-red-600' :
                                                        event.severity === 'high' ? 'text-orange-600' :
                                                            event.severity === 'medium' ? 'text-yellow-600' :
                                                                'text-blue-600'
                                                    }`} />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <p className="font-medium text-gray-900">{event.type}</p>
                                                        <Badge className={`${event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                                event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                    event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {event.severity}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span>IP: {event.ipAddress}</span>
                                                        <span>•</span>
                                                        <span>{new Date(event.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {securityEvents.length === 0 && (
                                <div className="text-center py-12">
                                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No security events detected</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/superadmin/security/audit')}>
                        <CardContent className="pt-6">
                            <FileText className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Audit Logs</h3>
                            <p className="text-sm text-gray-600">View detailed audit trail</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/superadmin/security/compliance')}>
                        <CardContent className="pt-6">
                            <Shield className="w-12 h-12 text-green-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Compliance</h3>
                            <p className="text-sm text-gray-600">Check compliance status</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="pt-6">
                            <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Security Trends</h3>
                            <p className="text-sm text-gray-600">Analyze security patterns</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
