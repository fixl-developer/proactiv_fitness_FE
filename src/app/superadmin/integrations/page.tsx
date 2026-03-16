'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import IntegrationGatewayService, { Integration } from '@/services/modules/integration-gateway.service'
import { motion } from 'framer-motion'
import { Link2, Plus, RefreshCw, Settings, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function IntegrationsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [integrations, setIntegrations] = useState<Integration[]>([])
    const [testingId, setTestingId] = useState<string | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadIntegrations()
    }, [isAuthenticated, router])

    const loadIntegrations = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await IntegrationGatewayService.getIntegrations()
            setIntegrations(response)
        } catch (err) {
            console.error('Error loading integrations:', err)
            setError('Failed to load integrations')
        } finally {
            setLoading(false)
        }
    }

    const handleTestIntegration = async (integrationId: string) => {
        try {
            setTestingId(integrationId)
            const result = await IntegrationGatewayService.testIntegration(integrationId)
            alert(result.message)
            await loadIntegrations()
        } catch (err) {
            console.error('Error testing integration:', err)
            alert('Failed to test integration')
        } finally {
            setTestingId(null)
        }
    }

    const handleSyncIntegration = async (integrationId: string) => {
        try {
            const result = await IntegrationGatewayService.syncIntegration(integrationId)
            alert(result.message)
            await loadIntegrations()
        } catch (err) {
            console.error('Error syncing integration:', err)
            alert('Failed to sync integration')
        }
    }

    const handleDeleteIntegration = async (integrationId: string) => {
        if (!confirm('Are you sure you want to delete this integration?')) return
        try {
            await IntegrationGatewayService.deleteIntegration(integrationId)
            await loadIntegrations()
        } catch (err) {
            console.error('Error deleting integration:', err)
            alert('Failed to delete integration')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading integrations...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Integrations</h1>
                        <p className="text-gray-600">Manage third-party integrations</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Integration
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map((integration, idx) => (
                        <motion.div
                            key={integration.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Link2 className="w-5 h-5 text-blue-600" />
                                            {integration.name}
                                        </CardTitle>
                                        <Badge className={`${integration.status === 'active' ? 'bg-green-100 text-green-800' :
                                                integration.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {integration.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600">Type</p>
                                            <p className="font-medium">{integration.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Endpoint</p>
                                            <p className="text-sm font-mono truncate">{integration.endpoint}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Last Sync</p>
                                            <p className="text-sm">{new Date(integration.lastSync).toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-2 pt-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleTestIntegration(integration.id)}
                                                disabled={testingId === integration.id}
                                            >
                                                {testingId === integration.id ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleSyncIntegration(integration.id)}
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => router.push(`/superadmin/integrations/${integration.id}`)}
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:bg-red-50"
                                                onClick={() => handleDeleteIntegration(integration.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {integrations.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Link2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No integrations configured</p>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Integration
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
