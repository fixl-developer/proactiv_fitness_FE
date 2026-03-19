'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plug, Plus, Settings, Play, FileText, CreditCard, MessageSquare, Mail, Calendar, Hash, CheckCircle, XCircle, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const integrations = [
    {
        id: 1, name: 'Stripe', category: 'Payment', icon: CreditCard, iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
        status: 'Connected', statusColor: 'bg-green-100 text-green-700', healthColor: 'bg-green-500',
        lastSync: '2 min ago', dataPoints: '12.5K transactions', description: 'Payment processing and subscription management'
    },
    {
        id: 2, name: 'Twilio', category: 'SMS', icon: MessageSquare, iconBg: 'bg-red-100', iconColor: 'text-red-600',
        status: 'Connected', statusColor: 'bg-green-100 text-green-700', healthColor: 'bg-green-500',
        lastSync: '5 min ago', dataPoints: '3.2K messages', description: 'SMS notifications and two-factor authentication'
    },
    {
        id: 3, name: 'SendGrid', category: 'Email', icon: Mail, iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
        status: 'Connected', statusColor: 'bg-green-100 text-green-700', healthColor: 'bg-green-500',
        lastSync: '1 min ago', dataPoints: '8.9K emails', description: 'Transactional and marketing email delivery'
    },
    {
        id: 4, name: 'Google Calendar', category: 'Scheduling', icon: Calendar, iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
        status: 'Disconnected', statusColor: 'bg-gray-100 text-gray-600', healthColor: 'bg-gray-400',
        lastSync: 'Never', dataPoints: '0', description: 'Calendar sync for class schedules and bookings'
    },
    {
        id: 5, name: 'Slack', category: 'Notifications', icon: Hash, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',
        status: 'Error', statusColor: 'bg-red-100 text-red-700', healthColor: 'bg-red-500',
        lastSync: '2 hours ago', dataPoints: '450 messages', description: 'Team notifications and alerts'
    },
]

export default function IntegrationsPage() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

    const connected = integrations.filter(i => i.status === 'Connected').length
    const errors = integrations.filter(i => i.status === 'Error').length

    const stats = [
        { label: 'Total Integrations', value: integrations.length.toString(), icon: Plug, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Connected', value: connected.toString(), icon: Wifi, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Errors (24h)', value: errors.toString(), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Data Synced', value: '24.6K', icon: RefreshCw, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">Integration Gateway</h1>
                    <p className="text-gray-600 mt-1">Connect, configure, and monitor third-party services</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Integration
                    </Button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {integrations.map((integration, i) => (
                    <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                    >
                        <Card className={`hover:shadow-xl transition-all duration-300 h-full ${integration.status === 'Error' ? 'border-red-200' : integration.status === 'Disconnected' ? 'border-gray-200' : 'border-green-100'}`}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 ${integration.iconBg} rounded-xl flex items-center justify-center`}>
                                            <integration.icon className={`w-7 h-7 ${integration.iconColor}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900 text-lg">{integration.name}</h3>
                                                <Badge className={integration.statusColor}>{integration.status}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">{integration.category}</p>
                                        </div>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${integration.healthColor} ${integration.status === 'Connected' ? 'animate-pulse' : ''}`}></div>
                                </div>

                                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                                <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 rounded-lg p-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Last Sync</p>
                                        <p className="text-sm font-medium text-gray-900">{integration.lastSync}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Data Points</p>
                                        <p className="text-sm font-medium text-gray-900">{integration.dataPoints}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Settings className="w-3.5 h-3.5 mr-1" />
                                        Configure
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Play className="w-3.5 h-3.5 mr-1" />
                                        Test
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <FileText className="w-3.5 h-3.5 mr-1" />
                                        Logs
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
