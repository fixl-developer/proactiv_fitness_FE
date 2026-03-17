'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Globe, Edit2, Trash2, RefreshCw, CheckCircle, AlertCircle,
    Settings, Activity, Clock, AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { superAdminService } from '@/services/superAdminService'

export default function IntegrationApisPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [integrations, setIntegrations] = useState<any[]>([])
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchIntegrations()
    }, [])

    const fetchIntegrations = async () => {
        try {
            setIsLoading(true)
            const data = await superAdminService.getIntegrations()
            setIntegrations(data)
        } catch (error) {
            console.error('Error fetching integrations:', error)
            // Fallback mock data
            const mockIntegrations = [
                {
                    id: '1',
                    name: 'Stripe Payment Gateway',
                    provider: 'stripe',
                    status: 'active',
                    apiKey: 'sk_live_***',
                    webhookUrl: 'https://api.proactiv.com/webhooks/stripe',
                    lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    requestsPerDay: 1250,
                    errorRate: 0.02
                },
                {
                    id: '2',
                    name: 'SendGrid Email',
                    provider: 'sendgrid',
                    status: 'active',
                    apiKey: 'SG.***',
                    webhookUrl: 'https://api.proactiv.com/webhooks/sendgrid',
                    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                    requestsPerDay: 850,
                    errorRate: 0.01
                },
                {
                    id: '3',
                    name: 'Twilio SMS',
                    provider: 'twilio',
                    status: 'active',
                    apiKey: 'AC***',
                    webhookUrl: 'https://api.proactiv.com/webhooks/twilio',
                    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                    requestsPerDay: 420,
                    errorRate: 0.05
                },
                {
                    id: '4',
                    name: 'Google Analytics',
                    provider: 'google',
                    status: 'inactive',
                    apiKey: 'UA-***',
                    webhookUrl: 'https://api.proactiv.com/webhooks/google',
                    lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    requestsPerDay: 0,
                    errorRate: 0
                }
            ]
            setIntegrations(mockIntegrations)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 2000)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>
            case 'inactive': return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
            case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const activeIntegrations = integrations.filter(i => i.status === 'active').length
    const totalRequests = integrations.reduce((sum, i) => sum + i.requestsPerDay, 0)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Integrations...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Globe className="w-8 h-8 mr-3 text-blue-600" />
                        API Integrations
                    </h1>
                    <p className="text-gray-600 mt-1">Manage third-party API integrations</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        variant="outline"
                        className="flex items-center"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{activeIntegrations}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">of {integrations.length} total</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Daily Requests</CardTitle>
                            <Activity className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{totalRequests.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-blue-600">Last 24 hours</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Error Rate</CardTitle>
                            <AlertCircle className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">0.02%</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-purple-600">System-wide average</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="active" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="all">All Integrations</TabsTrigger>
                    <TabsTrigger value="logs">Activity Logs</TabsTrigger>
                </TabsList>

                {/* Active Integrations */}
                <TabsContent value="active">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                                    Active Integrations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Integration</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Last Sync</TableHead>
                                                <TableHead>Requests/Day</TableHead>
                                                <TableHead>Error Rate</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {integrations.filter(i => i.status === 'active').map((integration) => (
                                                <TableRow key={integration.id}>
                                                    <TableCell className="font-medium">{integration.name}</TableCell>
                                                    <TableCell>{getStatusBadge(integration.status)}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {formatDate(integration.lastSync)}
                                                    </TableCell>
                                                    <TableCell>{integration.requestsPerDay.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <span className={integration.errorRate > 0.05 ? 'text-red-600' : 'text-green-600'}>
                                                            {(integration.errorRate * 100).toFixed(2)}%
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Button variant="ghost" size="sm">
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Settings className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* All Integrations */}
                <TabsContent value="all">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Globe className="w-5 h-5 mr-2 text-blue-600" />
                                    All Integrations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Integration</TableHead>
                                                <TableHead>Provider</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Last Sync</TableHead>
                                                <TableHead>Requests/Day</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {integrations.map((integration) => (
                                                <TableRow key={integration.id}>
                                                    <TableCell className="font-medium">{integration.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{integration.provider}</Badge>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(integration.status)}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {formatDate(integration.lastSync)}
                                                    </TableCell>
                                                    <TableCell>{integration.requestsPerDay.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Button variant="ghost" size="sm">
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm">
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Activity Logs */}
                <TabsContent value="logs">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-gray-600" />
                                    Integration Activity Logs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { time: '2 minutes ago', action: 'Stripe webhook received', status: 'success' },
                                        { time: '5 minutes ago', action: 'SendGrid email sent', status: 'success' },
                                        { time: '12 minutes ago', action: 'Twilio SMS delivered', status: 'success' },
                                        { time: '1 hour ago', action: 'Google Analytics sync', status: 'warning' },
                                        { time: '2 hours ago', action: 'Stripe payment processed', status: 'success' }
                                    ].map((log, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                {log.status === 'success' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{log.action}</p>
                                                    <p className="text-sm text-gray-500">{log.time}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={log.status === 'success' ? 'text-green-600 border-green-200' : 'text-yellow-600 border-yellow-200'}>
                                                {log.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
