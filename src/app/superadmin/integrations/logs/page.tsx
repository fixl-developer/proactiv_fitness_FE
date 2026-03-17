'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import IntegrationGatewayService from '@/services/modules/integration-gateway.service'
import { motion } from 'framer-motion'
import { FileText, Filter, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function IntegrationLogsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [logs, setLogs] = useState<any[]>([])
    const [integrations, setIntegrations] = useState<any[]>([])
    const [selectedIntegration, setSelectedIntegration] = useState<string>('all')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadData()
    }, [isAuthenticated, router])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)
            const integrationsRes = await IntegrationGatewayService.getIntegrations()
            setIntegrations(integrationsRes)

            if (integrationsRes.length > 0) {
                const logsRes = await IntegrationGatewayService.getIntegrationLogs(integrationsRes[0].id)
                setLogs(logsRes)
            }
        } catch (err) {
            console.error('Error loading logs:', err)
            setError('Failed to load integration logs')
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = async (integrationId: string) => {
        setSelectedIntegration(integrationId)
        if (integrationId === 'all') {
            await loadData()
        } else {
            try {
                const logsRes = await IntegrationGatewayService.getIntegrationLogs(integrationId)
                setLogs(logsRes)
            } catch (err) {
                console.error('Error loading filtered logs:', err)
            }
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading integration logs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Integration Logs</h1>
                        <p className="text-gray-600">View integration activity and errors</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={selectedIntegration}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Integrations</option>
                            {integrations.map((integration) => (
                                <option key={integration.id} value={integration.id}>
                                    {integration.name}
                                </option>
                            ))}
                        </select>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
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
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Activity Logs ({logs.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {logs.map((log, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            {log.status === 'success' ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600 mt-1" />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <p className="font-medium text-gray-900">{log.action}</p>
                                                    <Badge className={`${log.status === 'success' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {log.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{log.message}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>Integration: {log.integrationName}</span>
                                                    <span>•</span>
                                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                    <span>•</span>
                                                    <span>Duration: {log.duration}ms</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {logs.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No logs found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
