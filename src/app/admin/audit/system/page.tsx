'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Database, Server, HardDrive, Cpu, MemoryStick, Network,
    AlertTriangle, CheckCircle, Clock, Activity, RefreshCw,
    Download, Filter, Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { responsiveClasses } from '@/lib/responsiveClasses'

const SystemLogsPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedService, setSelectedService] = useState('all')

    // System services
    const systemServices = [
        { id: 'all', name: 'All Services', status: 'mixed', count: 156 },
        { id: 'database', name: 'Database', status: 'healthy', count: 45 },
        { id: 'api', name: 'API Server', status: 'healthy', count: 67 },
        { id: 'auth', name: 'Authentication', status: 'warning', count: 23 },
        { id: 'payment', name: 'Payment Gateway', status: 'healthy', count: 21 }
    ]

    // System metrics
    const systemMetrics = [
        {
            title: 'System Uptime',
            value: '99.98%',
            status: 'healthy',
            icon: Server,
            description: 'Last 30 days'
        },
        {
            title: 'Database Performance',
            value: '1.2ms',
            status: 'healthy',
            icon: Database,
            description: 'Avg query time'
        },
        {
            title: 'Memory Usage',
            value: '67%',
            status: 'warning',
            icon: MemoryStick,
            description: '8.2GB / 12GB'
        },
        {
            title: 'CPU Usage',
            value: '34%',
            status: 'healthy',
            icon: Cpu,
            description: 'Average load'
        }
    ]

    // System logs
    const systemLogs = [
        {
            id: 1,
            timestamp: '2024-01-25 15:30:22',
            service: 'database',
            level: 'info',
            message: 'Database backup completed successfully',
            details: 'Backup size: 2.3GB, Duration: 45 seconds',
            source: 'backup-service'
        },
        {
            id: 2,
            timestamp: '2024-01-25 15:28:15',
            service: 'api',
            level: 'info',
            message: 'API server restarted',
            details: 'Graceful restart completed, all connections maintained',
            source: 'api-server'
        },
        {
            id: 3,
            timestamp: '2024-01-25 15:25:08',
            service: 'auth',
            level: 'warning',
            message: 'High authentication failure rate detected',
            details: '15 failed attempts in last 5 minutes from IP range 203.104.x.x',
            source: 'auth-monitor'
        },
        {
            id: 4,
            timestamp: '2024-01-25 15:20:33',
            service: 'payment',
            level: 'info',
            message: 'Payment gateway health check passed',
            details: 'All payment processors responding normally',
            source: 'payment-monitor'
        },
        {
            id: 5,
            timestamp: '2024-01-25 15:15:44',
            service: 'database',
            level: 'warning',
            message: 'Slow query detected',
            details: 'Query execution time: 5.2s, Table: customer_bookings',
            source: 'query-monitor'
        }
    ]

    const getStatusColor = (status: string) => {
        const colors = {
            healthy: 'text-green-600 bg-green-100',
            warning: 'text-yellow-600 bg-yellow-100',
            error: 'text-red-600 bg-red-100',
            mixed: 'text-gray-600 bg-gray-100'
        }
        return colors[status as keyof typeof colors] || colors.mixed
    }

    const getLevelBadge = (level: string) => {
        const colors = {
            info: 'bg-blue-100 text-blue-700',
            warning: 'bg-yellow-100 text-yellow-700',
            error: 'bg-red-100 text-red-700',
            debug: 'bg-gray-100 text-gray-700'
        }
        return colors[level as keyof typeof colors] || colors.info
    }

    const getServiceIcon = (service: string) => {
        const icons = {
            database: Database,
            api: Server,
            auth: CheckCircle,
            payment: Network
        }
        return icons[service as keyof typeof icons] || Activity
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>System Logs</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Monitor system performance and service health
                    </p>
                </div>
                <div className={responsiveClasses.buttonGroup}>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Logs
                    </Button>
                    <Button>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* System Metrics */}
            <div className={responsiveClasses.metricsGrid}>
                {systemMetrics.map((metric, index) => {
                    const IconComponent = metric.icon
                    return (
                        <motion.div
                            key={metric.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={responsiveClasses.card}>
                                <CardContent className={responsiveClasses.cardContent}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                {metric.title}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                                {metric.value}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {metric.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`p-3 rounded-full ${getStatusColor(metric.status)}`}>
                                                <IconComponent className="w-6 h-6" />
                                            </div>
                                            <Badge className={getStatusColor(metric.status)}>
                                                {metric.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* Filters */}
            <Card className={responsiveClasses.card}>
                <CardContent className={responsiveClasses.cardContent}>
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search system logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Service Filter */}
                        <div className="flex flex-wrap gap-2">
                            {systemServices.map((service) => (
                                <button
                                    key={service.id}
                                    onClick={() => setSelectedService(service.id)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedService === service.id
                                            ? 'bg-blue-600 text-white'
                                            : `${getStatusColor(service.status)} hover:opacity-80`
                                        }`}
                                >
                                    {service.name} ({service.count})
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* System Logs Table */}
            <Card className={responsiveClasses.card}>
                <CardHeader className={responsiveClasses.cardHeader}>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="w-5 h-5" />
                        System Events
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-4 font-medium text-gray-900">Timestamp</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Service</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Level</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Message</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Source</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {systemLogs.map((log) => {
                                    const ServiceIcon = getServiceIcon(log.service)
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {log.timestamp}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <ServiceIcon className="w-4 h-4 text-gray-600" />
                                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                                        {log.service}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getLevelBadge(log.level)}>
                                                    {log.level}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {log.message}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-600">
                                                    {log.source}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-600 max-w-xs truncate">
                                                    {log.details}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SystemLogsPage