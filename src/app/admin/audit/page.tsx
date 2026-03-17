'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield, Activity, Database, AlertTriangle, User, Clock,
    Search, Filter, Download, RefreshCw, Eye, Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { responsiveClasses } from '@/lib/responsiveClasses'

const AuditLogsPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [dateRange, setDateRange] = useState('7days')

    // Audit categories
    const auditCategories = [
        { id: 'all', name: 'All Logs', count: 1247, color: 'bg-gray-100 text-gray-700' },
        { id: 'system', name: 'System Events', count: 342, color: 'bg-blue-100 text-blue-700' },
        { id: 'user', name: 'User Activity', count: 589, color: 'bg-green-100 text-green-700' },
        { id: 'data', name: 'Data Changes', count: 203, color: 'bg-yellow-100 text-yellow-700' },
        { id: 'security', name: 'Security Events', count: 113, color: 'bg-red-100 text-red-700' }
    ]

    // Recent audit logs
    const auditLogs = [
        {
            id: 1,
            timestamp: '2024-01-25 15:30:22',
            category: 'user',
            action: 'User Login',
            user: 'john.doe@progym.hk',
            details: 'Successful login from IP 192.168.1.100',
            severity: 'info',
            resource: 'Authentication System'
        },
        {
            id: 2,
            timestamp: '2024-01-25 15:28:15',
            category: 'data',
            action: 'Customer Updated',
            user: 'admin@progym.hk',
            details: 'Modified customer profile for ID: 12345',
            severity: 'info',
            resource: 'Customer Database'
        },
        {
            id: 3,
            timestamp: '2024-01-25 15:25:08',
            category: 'security',
            action: 'Failed Login Attempt',
            user: 'unknown@example.com',
            details: 'Multiple failed login attempts from IP 203.104.45.67',
            severity: 'warning',
            resource: 'Authentication System'
        },
        {
            id: 4,
            timestamp: '2024-01-25 15:20:33',
            category: 'system',
            action: 'Database Backup',
            user: 'system',
            details: 'Automated daily backup completed successfully',
            severity: 'info',
            resource: 'Database System'
        },
        {
            id: 5,
            timestamp: '2024-01-25 15:15:44',
            category: 'data',
            action: 'Payment Processed',
            user: 'payment.gateway',
            details: 'Payment of $150 processed for booking #BK-2024-001',
            severity: 'info',
            resource: 'Payment System'
        }
    ]

    // Summary statistics
    const auditStats = [
        {
            title: 'Total Events Today',
            value: '1,247',
            change: '+12%',
            changeType: 'increase',
            icon: Activity,
            color: 'text-blue-600'
        },
        {
            title: 'Security Alerts',
            value: '3',
            change: '-25%',
            changeType: 'decrease',
            icon: Shield,
            color: 'text-red-600'
        },
        {
            title: 'Active Users',
            value: '89',
            change: '+5%',
            changeType: 'increase',
            icon: User,
            color: 'text-green-600'
        },
        {
            title: 'System Uptime',
            value: '99.9%',
            change: 'Stable',
            changeType: 'stable',
            icon: Database,
            color: 'text-purple-600'
        }
    ]

    const getSeverityBadge = (severity: string) => {
        const colors = {
            info: 'bg-blue-100 text-blue-700',
            warning: 'bg-yellow-100 text-yellow-700',
            error: 'bg-red-100 text-red-700',
            success: 'bg-green-100 text-green-700'
        }
        return colors[severity as keyof typeof colors] || colors.info
    }

    const getCategoryIcon = (category: string) => {
        const icons = {
            system: Database,
            user: User,
            data: Activity,
            security: Shield
        }
        return icons[category as keyof typeof icons] || Activity
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Audit Logs</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Monitor system activities and security events
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

            {/* Statistics Cards */}
            <div className={responsiveClasses.metricsGrid}>
                {auditStats.map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={responsiveClasses.card}>
                                <CardContent className={responsiveClasses.cardContent}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                {stat.title}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                                {stat.value}
                                            </p>
                                            <p className={`text-sm mt-1 ${stat.changeType === 'increase' ? 'text-green-600' :
                                                    stat.changeType === 'decrease' ? 'text-red-600' :
                                                        'text-gray-600'
                                                }`}>
                                                {stat.change}
                                            </p>
                                        </div>
                                        <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {/* Filters and Search */}
            <Card className={responsiveClasses.card}>
                <CardContent className={responsiveClasses.cardContent}>
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search audit logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Date Range Filter */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="1day">Last 24 hours</option>
                            <option value="7days">Last 7 days</option>
                            <option value="30days">Last 30 days</option>
                            <option value="90days">Last 90 days</option>
                        </select>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {auditCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                                            ? 'bg-blue-600 text-white'
                                            : category.color
                                        }`}
                                >
                                    {category.name} ({category.count})
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card className={responsiveClasses.card}>
                <CardHeader className={responsiveClasses.cardHeader}>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-4 font-medium text-gray-900">Timestamp</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Category</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Action</th>
                                    <th className="text-left p-4 font-medium text-gray-900">User</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Details</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Severity</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {auditLogs.map((log) => {
                                    const CategoryIcon = getCategoryIcon(log.category)
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
                                                    <CategoryIcon className="w-4 h-4 text-gray-600" />
                                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                                        {log.category}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-600">
                                                    {log.user}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-600 max-w-xs truncate">
                                                    {log.details}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getSeverityBadge(log.severity)}>
                                                    {log.severity}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
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

export default AuditLogsPage
