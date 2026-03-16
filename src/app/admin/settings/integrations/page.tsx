'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Settings,
    Zap,
    Calendar,
    MessageSquare,
    Mail,
    Phone,
    CreditCard,
    BarChart3,
    Shield,
    Globe,
    Key,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Plus,
    Edit,
    Trash2,
    RefreshCw
} from 'lucide-react'

interface Integration {
    id: string
    name: string
    description: string
    category: 'payment' | 'communication' | 'analytics' | 'calendar' | 'security' | 'other'
    status: 'connected' | 'disconnected' | 'error'
    icon: any
    isEnabled: boolean
    lastSync?: string
    config?: Record<string, any>
}

const integrations: Integration[] = [
    {
        id: 'stripe',
        name: 'Stripe',
        description: 'Payment processing and subscription management',
        category: 'payment',
        status: 'connected',
        icon: CreditCard,
        isEnabled: true,
        lastSync: '2024-01-15 10:30 AM'
    },
    {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Sync classes and appointments with Google Calendar',
        category: 'calendar',
        status: 'connected',
        icon: Calendar,
        isEnabled: true,
        lastSync: '2024-01-15 09:45 AM'
    },
    {
        id: 'whatsapp-business',
        name: 'WhatsApp Business',
        description: 'Send notifications and reminders via WhatsApp',
        category: 'communication',
        status: 'disconnected',
        icon: MessageSquare,
        isEnabled: false
    },
    {
        id: 'sendgrid',
        name: 'SendGrid',
        description: 'Email delivery and marketing campaigns',
        category: 'communication',
        status: 'connected',
        icon: Mail,
        isEnabled: true,
        lastSync: '2024-01-15 08:20 AM'
    },
    {
        id: 'twilio',
        name: 'Twilio',
        description: 'SMS notifications and voice calls',
        category: 'communication',
        status: 'error',
        icon: Phone,
        isEnabled: false
    },
    {
        id: 'google-analytics',
        name: 'Google Analytics',
        description: 'Website and app analytics tracking',
        category: 'analytics',
        status: 'connected',
        icon: BarChart3,
        isEnabled: true,
        lastSync: '2024-01-15 11:15 AM'
    },
    {
        id: 'auth0',
        name: 'Auth0',
        description: 'Identity and access management',
        category: 'security',
        status: 'connected',
        icon: Shield,
        isEnabled: true,
        lastSync: '2024-01-15 07:30 AM'
    },
    {
        id: 'zapier',
        name: 'Zapier',
        description: 'Workflow automation and app integrations',
        category: 'other',
        status: 'disconnected',
        icon: Zap,
        isEnabled: false
    }
]

const categoryColors = {
    payment: 'bg-green-100 text-green-800',
    communication: 'bg-blue-100 text-blue-800',
    analytics: 'bg-purple-100 text-purple-800',
    calendar: 'bg-orange-100 text-orange-800',
    security: 'bg-red-100 text-red-800',
    other: 'bg-gray-100 text-gray-800'
}

const statusColors = {
    connected: 'text-green-600',
    disconnected: 'text-gray-500',
    error: 'text-red-600'
}

const statusIcons = {
    connected: CheckCircle,
    disconnected: Globe,
    error: AlertCircle
}

export default function IntegrationsPage() {
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
    const [isConfiguring, setIsConfiguring] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    const filteredIntegrations = integrations.filter(integration => {
        const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            integration.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const categories = ['all', 'payment', 'communication', 'analytics', 'calendar', 'security', 'other']

    const handleToggleIntegration = (integrationId: string) => {
        // Handle integration toggle logic
        console.log('Toggle integration:', integrationId)
    }

    const handleConfigureIntegration = (integration: Integration) => {
        setSelectedIntegration(integration)
        setIsConfiguring(true)
    }

    const handleSyncIntegration = (integrationId: string) => {
        // Handle sync logic
        console.log('Sync integration:', integrationId)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
                    <p className="text-gray-600 mt-2">
                        Connect and manage third-party services and APIs
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Integration
                </Button>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <div className="flex-1">
                    <Input
                        placeholder="Search integrations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className="capitalize"
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                                <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
                            </div>
                            <Settings className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Connected</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {integrations.filter(i => i.status === 'connected').length}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Disconnected</p>
                                <p className="text-2xl font-bold text-gray-500">
                                    {integrations.filter(i => i.status === 'disconnected').length}
                                </p>
                            </div>
                            <Globe className="w-8 h-8 text-gray-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Errors</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {integrations.filter(i => i.status === 'error').length}
                                </p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Integrations Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredIntegrations.map((integration, index) => {
                    const StatusIcon = statusIcons[integration.status]
                    return (
                        <motion.div
                            key={integration.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                                <integration.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Badge className={categoryColors[integration.category]}>
                                                        {integration.category}
                                                    </Badge>
                                                    <StatusIcon className={`w-4 h-4 ${statusColors[integration.status]}`} />
                                                </div>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={integration.isEnabled}
                                            onCheckedChange={() => handleToggleIntegration(integration.id)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="mb-4">
                                        {integration.description}
                                    </CardDescription>

                                    {integration.lastSync && (
                                        <p className="text-xs text-gray-500 mb-4">
                                            Last sync: {integration.lastSync}
                                        </p>
                                    )}

                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleConfigureIntegration(integration)}
                                            className="flex-1"
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configure
                                        </Button>
                                        {integration.status === 'connected' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSyncIntegration(integration.id)}
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Configuration Modal */}
            {isConfiguring && selectedIntegration && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsConfiguring(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <selectedIntegration.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Configure {selectedIntegration.name}</h2>
                                        <p className="text-gray-600">{selectedIntegration.description}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsConfiguring(false)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="api-key">API Key</Label>
                                    <Input
                                        id="api-key"
                                        type="password"
                                        placeholder="Enter your API key"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="webhook-url">Webhook URL</Label>
                                    <Input
                                        id="webhook-url"
                                        placeholder="https://your-domain.com/webhook"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="config-notes">Configuration Notes</Label>
                                    <Textarea
                                        id="config-notes"
                                        placeholder="Add any configuration notes or settings..."
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsConfiguring(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                                        Save Configuration
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}
