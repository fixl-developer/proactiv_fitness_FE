'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Webhook, Plus, Edit2, Trash2, RefreshCw, Download, CheckCircle, AlertCircle, Clock, Activity, Copy, Eye } from 'lucide-react'
import { superAdminService } from '@/services/superAdminService'

interface WebhookConfig {
    id: string
    name: string
    url: string
    events: string[]
    status: 'active' | 'inactive' | 'failed'
    lastTriggered: Date
    successRate: number
    totalCalls: number
}

export default function WebhooksPage() {
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        fetchWebhooks()
    }, [])

    const fetchWebhooks = async () => {
        try {
            setLoading(true)
            const data = await superAdminService.getWebhooks()
            setWebhooks(data)
        } catch (error) {
            console.error('Error fetching webhooks:', error)
            // Fallback mock data
            const mockWebhooks: WebhookConfig[] = [
                {
                    id: '1',
                    name: 'Payment Processor',
                    url: 'https://payment.example.com/webhook',
                    events: ['payment.completed', 'payment.failed', 'payment.refunded'],
                    status: 'active',
                    lastTriggered: new Date(Date.now() - 5 * 60 * 1000),
                    successRate: 99.8,
                    totalCalls: 15420
                },
                {
                    id: '2',
                    name: 'Analytics Service',
                    url: 'https://analytics.example.com/events',
                    events: ['user.created', 'user.updated', 'booking.created'],
                    status: 'active',
                    lastTriggered: new Date(Date.now() - 2 * 60 * 1000),
                    successRate: 99.5,
                    totalCalls: 28950
                },
                {
                    id: '3',
                    name: 'Email Service',
                    url: 'https://email.example.com/webhook',
                    events: ['email.sent', 'email.bounced', 'email.opened'],
                    status: 'failed',
                    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    successRate: 85.2,
                    totalCalls: 8750
                },
                {
                    id: '4',
                    name: 'Slack Notifications',
                    url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
                    events: ['alert.critical', 'alert.warning'],
                    status: 'active',
                    lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
                    successRate: 100,
                    totalCalls: 1250
                }
            ]
            setWebhooks(mockWebhooks)
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'inactive':
                return <AlertCircle className="w-5 h-5 text-gray-600" />
            case 'failed':
                return <AlertCircle className="w-5 h-5 text-red-600" />
            default:
                return <CheckCircle className="w-5 h-5 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-50 border-green-200'
            case 'inactive':
                return 'bg-gray-50 border-gray-200'
            case 'failed':
                return 'bg-red-50 border-red-200'
            default:
                return 'bg-gray-50 border-gray-200'
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'inactive':
                return 'bg-gray-100 text-gray-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const activeCount = webhooks.filter(w => w.status === 'active').length
    const failedCount = webhooks.filter(w => w.status === 'failed').length
    const avgSuccessRate = (webhooks.reduce((sum, w) => sum + w.successRate, 0) / webhooks.length).toFixed(1)

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Webhook className="w-8 h-8 mr-3 text-purple-600" />
                        Webhooks
                    </h1>
                    <p className="text-gray-600 mt-1">Manage webhook integrations and event subscriptions</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={fetchWebhooks}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Webhook
                    </Button>
                </div>
            </motion.div>

            {/* Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Webhooks</p>
                            <p className="text-3xl font-bold text-blue-600">{webhooks.length}</p>
                        </div>
                        <Webhook className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active</p>
                            <p className="text-3xl font-bold text-green-600">{activeCount}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Failed</p>
                            <p className="text-3xl font-bold text-red-600">{failedCount}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Success Rate</p>
                            <p className="text-3xl font-bold text-purple-600">{avgSuccessRate}%</p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-500 opacity-50" />
                    </div>
                </Card>
            </motion.div>

            {/* Webhooks List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                {loading ? (
                    <Card className="p-8 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                    </Card>
                ) : (
                    webhooks.map((webhook, index) => (
                        <motion.div
                            key={webhook.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`p-6 border-l-4 ${getStatusColor(webhook.status)}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        {getStatusIcon(webhook.status)}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{webhook.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1 break-all">{webhook.url}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(webhook.status)}`}>
                                        {webhook.status.toUpperCase()}
                                    </span>
                                </div>

                                {/* Events */}
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-900 mb-2">Subscribed Events:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {webhook.events.map((event, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                {event}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-600">Success Rate</p>
                                        <p className="text-lg font-bold text-gray-900">{webhook.successRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Total Calls</p>
                                        <p className="text-lg font-bold text-gray-900">{webhook.totalCalls.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Last Triggered</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {Math.round((Date.now() - webhook.lastTriggered.getTime()) / 60000)}m ago
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                                    <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Logs
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy URL
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    )
}
