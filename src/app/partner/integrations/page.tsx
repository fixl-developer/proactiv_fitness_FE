'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import {
    Zap, CheckCircle, XCircle, AlertTriangle, Settings,
    Plus, Play, Pause, RefreshCw, ExternalLink, Code,
    Database, Globe, Smartphone, Mail, Calendar, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function PartnerIntegrationsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [integrations, setIntegrations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        fetchIntegrations()
    }, [isAuthenticated, router])

    const fetchIntegrations = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const partnerId = user?.id || 'partner-1'
            const response = await PartnerPortalService.getPartnerProfile(partnerId)

            setIntegrations([
                {
                    id: '1',
                    name: 'Google Calendar',
                    description: 'Sync class schedules and events with Google Calendar',
                    category: 'Scheduling',
                    status: 'CONNECTED',
                    icon: Calendar,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    lastSync: '2024-03-15 10:30 AM',
                    syncFrequency: 'Real-time',
                    dataPoints: 1250,
                    health: 98
                },
                {
                    id: '2',
                    name: 'Mailchimp',
                    description: 'Email marketing and newsletter management',
                    category: 'Marketing',
                    status: 'CONNECTED',
                    icon: Mail,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    lastSync: '2024-03-15 09:15 AM',
                    syncFrequency: 'Hourly',
                    dataPoints: 850,
                    health: 95
                },
                {
                    id: '3',
                    name: 'Stripe',
                    description: 'Payment processing and financial transactions',
                    category: 'Payments',
                    status: 'CONNECTED',
                    icon: Database,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50',
                    lastSync: '2024-03-15 11:45 AM',
                    syncFrequency: 'Real-time',
                    dataPoints: 2100,
                    health: 100
                }
            ])
        } catch (err) {
            console.error('Error fetching integrations:', err)
            setError('Failed to load integrations')
        } finally {
            setIsLoading(false)
        }
    }
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONNECTED': return 'bg-green-100 text-green-800'
            case 'ERROR': return 'bg-red-100 text-red-800'
            case 'DISCONNECTED': return 'bg-gray-100 text-gray-800'
            case 'PENDING': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONNECTED': return CheckCircle
            case 'ERROR': return XCircle
            case 'DISCONNECTED': return AlertTriangle
            case 'PENDING': return RefreshCw
            default: return AlertTriangle
        }
    }

    const handleToggleIntegration = async (integrationId: string, currentStatus: string) => {
        try {
            // API call would go here
            alert(`${currentStatus === 'CONNECTED' ? 'Disconnecting' : 'Connecting'} integration...`)
            fetchIntegrations()
        } catch (err: any) {
            alert('Failed to toggle integration: ' + err.message)
        }
    }

    const handleTestIntegration = async (integrationId: string) => {
        try {
            // API call would go here
            alert('Testing integration connection...')
        } catch (err: any) {
            alert('Failed to test integration: ' + err.message)
        }
    }

    const handleConfigureIntegration = (integrationId: string) => {
        alert(`Opening configuration for integration ${integrationId}`)
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
                    <h1 className="text-3xl font-bold text-gray-900">Integrations Hub</h1>
                    <p className="text-gray-600 mt-1">Manage third-party integrations and data sync</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Add Integration
                </button>
            </div>

            {/* Integration Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Total Integrations',
                        value: '6',
                        icon: Zap,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Active Connections',
                        value: '3',
                        icon: CheckCircle,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Data Points Synced',
                        value: '4.5K',
                        icon: Database,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50'
                    },
                    {
                        title: 'Avg Health Score',
                        value: '89%',
                        icon: RefreshCw,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
            {/* Integrations List */}
            <div className="space-y-4">
                {integrations.map((integration, idx) => {
                    const StatusIcon = getStatusIcon(integration.status)
                    return (
                        <motion.div
                            key={integration.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`${integration.bgColor} p-3 rounded-lg`}>
                                                <integration.icon className={`w-6 h-6 ${integration.color}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                                                    <Badge className={getStatusColor(integration.status)}>
                                                        {integration.status}
                                                    </Badge>
                                                    <Badge variant="outline">{integration.category}</Badge>
                                                </div>
                                                <p className="text-gray-600 mb-3">{integration.description}</p>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-600">Last Sync</p>
                                                        <p className="text-sm font-medium text-gray-900">{integration.lastSync}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600">Frequency</p>
                                                        <p className="text-sm font-medium text-gray-900">{integration.syncFrequency}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600">Data Points</p>
                                                        <p className="text-sm font-medium text-gray-900">{integration.dataPoints.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Health Score</p>
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={integration.health} className="h-2 flex-1" />
                                                            <span className="text-sm font-medium text-gray-700">{integration.health}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleTestIntegration(integration.id)}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                                title="Test Connection"
                                            >
                                                <Play className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleConfigureIntegration(integration.id)}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                                                title="Configure"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleIntegration(integration.id, integration.status)}
                                                className={`p-2 rounded-lg transition-colors ${integration.status === 'CONNECTED'
                                                    ? 'hover:bg-red-50 text-red-600'
                                                    : 'hover:bg-green-50 text-green-600'
                                                    }`}
                                                title={integration.status === 'CONNECTED' ? 'Disconnect' : 'Connect'}
                                            >
                                                {integration.status === 'CONNECTED' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            </button>
                                            <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* API Documentation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-purple-600" />
                        API Documentation & Webhooks
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">API Endpoints</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Base URL:</span>
                                    <code className="bg-gray-200 px-2 py-1 rounded text-xs">https://api.proactive.com/v1</code>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Authentication:</span>
                                    <span className="text-gray-900">Bearer Token</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rate Limit:</span>
                                    <span className="text-gray-900">1000 req/hour</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">Webhook Configuration</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Webhook URL:</span>
                                    <code className="bg-gray-200 px-2 py-1 rounded text-xs">https://partner.com/webhook</code>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Events:</span>
                                    <span className="text-gray-900">12 subscribed</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Last Delivery:</span>
                                    <span className="text-gray-900">2 mins ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ {error} - Showing mock data for development
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
