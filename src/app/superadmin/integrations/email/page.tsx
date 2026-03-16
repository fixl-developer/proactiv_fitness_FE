'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, RefreshCw, Download, CheckCircle, AlertCircle, Settings, TrendingUp, Activity, BarChart3 } from 'lucide-react'
import { superAdminService } from '@/services/superAdminService'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface EmailService {
    id: string
    name: string
    provider: string
    status: 'active' | 'inactive' | 'error'
    successRate: number
    emailsSent: number
    bounceRate: number
    lastSync: Date
    dailyLimit: number
    dailyUsage: number
}

export default function EmailServicesPage() {
    const [services, setServices] = useState<EmailService[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            setLoading(true)
            const data = await superAdminService.getEmailServices()
            setServices(data)
        } catch (error) {
            console.error('Error fetching services:', error)
            // Fallback mock data
            const mockServices: EmailService[] = [
                {
                    id: '1',
                    name: 'SendGrid',
                    provider: 'SendGrid Inc.',
                    status: 'active',
                    successRate: 99.8,
                    emailsSent: 125430,
                    bounceRate: 0.2,
                    lastSync: new Date(Date.now() - 5 * 60 * 1000),
                    dailyLimit: 100000,
                    dailyUsage: 8450
                },
                {
                    id: '2',
                    name: 'AWS SES',
                    provider: 'Amazon Web Services',
                    status: 'active',
                    successRate: 99.5,
                    emailsSent: 85230,
                    bounceRate: 0.3,
                    lastSync: new Date(Date.now() - 10 * 60 * 1000),
                    dailyLimit: 50000,
                    dailyUsage: 5230
                },
                {
                    id: '3',
                    name: 'Mailgun',
                    provider: 'Mailgun Technologies',
                    status: 'active',
                    successRate: 99.2,
                    emailsSent: 45120,
                    bounceRate: 0.4,
                    lastSync: new Date(Date.now() - 15 * 60 * 1000),
                    dailyLimit: 50000,
                    dailyUsage: 3120
                }
            ]
            setServices(mockServices)
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
            case 'error':
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
            case 'error':
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
            case 'error':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const activeServices = services.filter(s => s.status === 'active').length
    const totalEmailsSent = services.reduce((sum, s) => sum + s.emailsSent, 0)
    const avgSuccessRate = (services.filter(s => s.status === 'active').reduce((sum, s) => sum + s.successRate, 0) / activeServices).toFixed(1)
    const avgBounceRate = (services.reduce((sum, s) => sum + s.bounceRate, 0) / services.length).toFixed(2)

    const emailTrendData = [
        { date: '2024-03-01', sent: 5200, bounced: 12 },
        { date: '2024-03-05', sent: 6800, bounced: 18 },
        { date: '2024-03-10', sent: 8450, bounced: 22 },
        { date: '2024-03-15', sent: 9200, bounced: 25 },
        { date: '2024-03-20', sent: 10500, bounced: 28 }
    ]

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
                        <Mail className="w-8 h-8 mr-3 text-purple-600" />
                        Email Services
                    </h1>
                    <p className="text-gray-600 mt-1">Manage email delivery integrations</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={fetchServices}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
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
                            <p className="text-sm text-gray-600">Active Services</p>
                            <p className="text-3xl font-bold text-blue-600">{activeServices}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Emails Sent</p>
                            <p className="text-3xl font-bold text-green-600">{(totalEmailsSent / 1000).toFixed(0)}K</p>
                        </div>
                        <Activity className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Success Rate</p>
                            <p className="text-3xl font-bold text-purple-600">{avgSuccessRate}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Bounce Rate</p>
                            <p className="text-3xl font-bold text-yellow-600">{avgBounceRate}%</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-yellow-500 opacity-50" />
                    </div>
                </Card>
            </motion.div>

            {/* Email Trend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Delivery Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={emailTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} name="Sent" />
                            <Line yAxisId="right" type="monotone" dataKey="bounced" stroke="#EF4444" strokeWidth={2} name="Bounced" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </motion.div>

            {/* Services List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
            >
                {loading ? (
                    <Card className="p-8 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                    </Card>
                ) : (
                    services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`p-6 border-l-4 ${getStatusColor(service.status)}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        {getStatusIcon(service.status)}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{service.provider}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(service.status)}`}>
                                        {service.status.toUpperCase()}
                                    </span>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-gray-600">Success Rate</p>
                                        <p className="text-lg font-bold text-gray-900">{service.successRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Emails Sent</p>
                                        <p className="text-lg font-bold text-gray-900">{service.emailsSent.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Bounce Rate</p>
                                        <p className="text-lg font-bold text-gray-900">{service.bounceRate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600">Daily Usage</p>
                                        <p className="text-lg font-bold text-gray-900">{service.dailyUsage.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Daily Limit Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Daily Limit</span>
                                        <span className="font-medium">{service.dailyUsage} / {service.dailyLimit}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${(service.dailyUsage / service.dailyLimit) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Last Sync */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Last synced: {service.lastSync.toLocaleTimeString()}
                                    </p>
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="sm">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configure
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Sync
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    )
}
