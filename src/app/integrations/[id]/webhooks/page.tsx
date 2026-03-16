'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import IntegrationManagementService, { Webhook } from '@/services/modules/integration-management.service'
import { motion } from 'framer-motion'
import { Webhook as WebhookIcon, AlertCircle, Plus, Trash2, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function WebhooksPage() {
    const router = useRouter()
    const params = useParams()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [webhooks, setWebhooks] = useState<Webhook[]>([])
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ url: '', events: [] })

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadWebhooks()
    }, [isAuthenticated, router, params])

    const loadWebhooks = async () => {
        try {
            setLoading(true)
            setError(null)
            const integrationId = params.id as string
            const response = await IntegrationManagementService.getWebhooks(integrationId)
            setWebhooks(response)
        } catch (err) {
            console.error('Error loading webhooks:', err)
            setError('Failed to load webhooks')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateWebhook = async () => {
        try {
            const integrationId = params.id as string
            await IntegrationManagementService.createWebhook(integrationId, formData)
            setFormData({ url: '', events: [] })
            setShowForm(false)
            await loadWebhooks()
        } catch (err) {
            console.error('Error creating webhook:', err)
            alert('Failed to create webhook')
        }
    }

    const handleDeleteWebhook = async (webhookId: string) => {
        if (confirm('Are you sure you want to delete this webhook?')) {
            try {
                const integrationId = params.id as string
                await IntegrationManagementService.deleteWebhook(integrationId, webhookId)
                await loadWebhooks()
            } catch (err) {
                console.error('Error deleting webhook:', err)
                alert('Failed to delete webhook')
            }
        }
    }

    const handleTestWebhook = async (webhookId: string) => {
        try {
            const integrationId = params.id as string
            await IntegrationManagementService.testWebhook(integrationId, webhookId)
            alert('Webhook test sent successfully')
        } catch (err) {
            console.error('Error testing webhook:', err)
            alert('Failed to test webhook')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading webhooks...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Webhooks</h1>
                        <p className="text-gray-600">Manage integration webhooks</p>
                    </div>
                    <Button onClick={() => router.push(`/integrations/${params.id}`)} variant="outline">
                        Back to Integration
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {showForm && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Create New Webhook</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                                    <input
                                        type="url"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        placeholder="https://example.com/webhook"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
                                    <div className="space-y-2">
                                        {['create', 'update', 'delete', 'sync'].map((event) => (
                                            <label key={event} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.events.includes(event)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({ ...formData, events: [...formData.events, event] })
                                                        } else {
                                                            setFormData({ ...formData, events: formData.events.filter(ev => ev !== event) })
                                                        }
                                                    }}
                                                    className="rounded"
                                                />
                                                <span className="text-sm text-gray-700">{event}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateWebhook} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        Create Webhook
                                    </Button>
                                    <Button onClick={() => setShowForm(false)} variant="outline">
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="mb-6">
                    <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Webhook
                    </Button>
                </div>

                <div className="space-y-4">
                    {webhooks.map((webhook, idx) => (
                        <motion.div
                            key={webhook.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <WebhookIcon className="w-5 h-5 text-blue-600 mt-1" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 break-all">{webhook.url}</p>
                                                <p className="text-sm text-gray-600 mt-1">Events: {webhook.events.join(', ')}</p>
                                                <p className="text-xs text-gray-500 mt-2">Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <Badge className={webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {webhook.status}
                                        </Badge>
                                    </div>

                                    {webhook.failureCount > 0 && (
                                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800">Failed attempts: {webhook.failureCount}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleTestWebhook(webhook.id)}
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Test
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteWebhook(webhook.id)}
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

                {webhooks.length === 0 && !showForm && (
                    <div className="text-center py-12">
                        <WebhookIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No webhooks configured</p>
                        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Webhook
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
