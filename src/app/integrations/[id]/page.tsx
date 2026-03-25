'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import IntegrationManagementService, { Integration, IntegrationAnalytics } from '@/services/modules/integration-management.service'
import { motion } from 'framer-motion'
import { Plug, AlertCircle, Settings, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function IntegrationDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [integration, setIntegration] = useState<Integration | null>(null)
    const [analytics, setAnalytics] = useState<IntegrationAnalytics | null>(null)
    const [logs, setLogs] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadIntegrationDetails()
    }, [isAuthenticated, router, params])

    const loadIntegrationDetails = async () => {
        try {
            setLoading(true)
            setError(null)
            const integrationId = params.id as string
            const [integrationData, analyticsData, logsData] = await Promise.all([
                IntegrationManagementService.getIntegrationById(integrationId),
                IntegrationManagementService.getIntegrationAnalytics(integrationId),
                IntegrationManagementService.getIntegrationLogs(integrationId, 10)
            ])
            setIntegration(integrationData)
            setAnalytics(analyticsData)
            setLogs(logsData)
        } catch (err) {
            console.error('Error loading integration details:', err)
            setError('Failed to load integration details')
        } finally {
            setLoading(false)
        }
    }

    const handleRetry = async () => {
        try {
            const integrationId = params.id as string
            await IntegrationManagementService.retryIntegration(integrationId)
            await loadIntegrationDetails()
        } catch (err) {
            console.error('Error retrying integration:', err)
            alert('Failed to retry integration')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading integration details...</p>
                </div>
            </div>
        )
    }

    if (!integration) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Integration not found</p>
                        <Button id="integration-detail-back-btn" onClick={() => router.push('/integrations')} variant="outline">
                            Back to Integrations
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Plug className="w-10 h-10 text-blue-600" />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">{integration.name}</h1>
                            <p className="text-gray-600">{integration.description}</p>
                        </div>
                    </div>
                    <Badge className={`${integration.status === 'active' ? 'bg-green-100 text-green-800' :
                        integration.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {integration.status}
                    </Badge>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{analytics?.totalRequests || 0}</div>
                            <p className="text-xs text-gray-600 mt-2">Last 30 days</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{analytics?.successRate || 0}%</div>
                            <p className="text-xs text-gray-600 mt-2">Successful requests</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{analytics?.avgResponseTime || 0}ms</div>
                            <p className="text-xs text-gray-600 mt-2">Average latency</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-600" />
                                Integration Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Version</p>
                                    <p className="font-semibold text-gray-900">v{integration.version}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Category</p>
                                    <p className="font-semibold text-gray-900">{integration.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Sync</p>
                                    <p className="font-semibold text-gray-900">{new Date(integration.lastSync).toLocaleString()}</p>
                                </div>
                                <Button id="integration-detail-webhooks-btn" onClick={() => router.push(`/integrations/${integration.id}/webhooks`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    Manage Webhooks
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Button id="integration-detail-analytics-btn" onClick={() => router.push(`/integrations/${integration.id}/analytics`)} className="w-full justify-start bg-blue-50 text-blue-600 hover:bg-blue-100">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    View Analytics
                                </Button>
                                {integration.status === 'error' && (
                                    <Button id="btn-retry-integrations-id" onClick={handleRetry} className="w-full justify-start bg-orange-50 text-orange-600 hover:bg-orange-100">
                                        Retry Integration
                                    </Button>
                                )}
                                <Button id="integration-detail-back-list-btn" onClick={() => router.push('/integrations')} variant="outline" className="w-full">
                                    Back to Integrations
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {logs.map((log, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{log.action}</p>
                                            <p className="text-xs text-gray-600">{log.timestamp}</p>
                                        </div>
                                        <Badge className={log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {log.status}
                                        </Badge>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
