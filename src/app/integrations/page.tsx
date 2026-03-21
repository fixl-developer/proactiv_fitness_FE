'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import IntegrationManagementService, { Integration } from '@/services/modules/integration-management.service'
import { motion } from 'framer-motion'
import { Plug, Plus, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function IntegrationsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [integrations, setIntegrations] = useState<Integration[]>([])

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
            const response = await IntegrationManagementService.getIntegrations()
            setIntegrations(response)
        } catch (err) {
            console.error('Error loading integrations:', err)
            setError('Failed to load integrations')
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async (integrationId: string) => {
        try {
            await IntegrationManagementService.syncIntegration(integrationId)
            await loadIntegrations()
        } catch (err) {
            console.error('Error syncing integration:', err)
            alert('Failed to sync integration')
        }
    }

    const handleDelete = async (integrationId: string) => {
        if (confirm('Are you sure you want to delete this integration?')) {
            try {
                await IntegrationManagementService.deleteIntegration(integrationId)
                await loadIntegrations()
            } catch (err) {
                console.error('Error deleting integration:', err)
                alert('Failed to delete integration')
            }
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
                        <p className="text-gray-600">Manage your third-party integrations</p>
                    </div>
                    <Button data-testid="btn-router-integrations" onClick={() => router.push('/integrations/marketplace')} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow h-full">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Plug className="w-8 h-8 text-blue-600" />
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                                                <p className="text-xs text-gray-600">{integration.category}</p>
                                            </div>
                                        </div>
                                        <Badge className={`${integration.status === 'active' ? 'bg-green-100 text-green-800' :
                                            integration.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {integration.status}
                                        </Badge>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <span>v{integration.version}</span>
                                        <span>Last sync: {new Date(integration.lastSync).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => router.push(`/integrations/${integration.id}`)}
                                            className="flex-1"
                                        >
                                            Details
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSync(integration.id)}
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(integration.id)}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {integrations.length === 0 && (
                    <div className="text-center py-12">
                        <Plug className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No integrations yet</p>
                        <Button data-testid="btn-router-integrations" onClick={() => router.push('/integrations/marketplace')} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Browse Marketplace
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
