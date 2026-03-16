'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield, AlertTriangle, Lock, Unlock, Key, UserX, Eye,
    Clock, Activity, Search, Filter, Download, RefreshCw,
    MapPin, Monitor, Smartphone, Globe, Ban
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { responsiveClasses } from '@/lib/responsiveClasses'

const SecurityEventsPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSeverity, setSelectedSeverity] = useState('all')
    const [selectedEventType, setSelectedEventType] = useState('all')

    // Security event types
    const eventTypes = [
        { id: 'all', name: 'All Events', count: 234, color: 'bg-gray-100 text-gray-700' },
        { id: 'failed_login', name: 'Failed Logins', count: 89, color: 'bg-red-100 text-red-700' },
        { id: 'suspicious_activity', name: 'Suspicious Activity', count: 45, color: 'bg-orange-100 text-orange-700' },
        { id: 'permission_denied', name: 'Permission Denied', count: 67, color: 'bg-yellow-100 text-yellow-700' },
        { id: 'account_locked', name: 'Account Locked', count: 23, color: 'bg-purple-100 text-purple-700' },
        { id: 'password_reset', name: 'Password Resets', count: 10, color: 'bg-blue-100 text-blue-700' }
    ]

    // Severity levels
    const severityLevels = [
        { id: 'all', name: 'All Severities', count: 234 },
        { id: 'critical', name: 'Critical', count: 12 },
        { id: 'high', name: 'High', count: 34 },
        { id: 'medium', name: 'Medium', count: 89 },
        { id: 'low', name: 'Low', count: 99 }
    ]

    // Security statistics
    const securityStats = [
        {
            title: 'Security Alerts Today',
            value: '23',
            change: '-15%',
            changeType: 'decrease',
            icon: AlertTriangle,
            color: 'text-red-600'
        },
        {
            title: 'Failed Login Attempts',
            value: '89',
            change: '+25%',
            changeType: 'increase',
            icon: Lock,
            color: 'text-orange-600'
        },
        {
            title: 'Blocked IP Addresses',
            value: '12',
            change: '+3',
            changeType: 'increase',
            icon: Ban,
            color: 'text-purple-600'
        },
        {
            title: 'Active Sessions',
            value: '156',
            change: 'Normal',
            changeType: 'stable',
            icon: Shield,
            color: 'text-green-600'
        }
    ]

    // Security events
    const securityEvents = [
        {
            id: 1,
            timestamp: '2024-01-25 15:30:22',
            eventType: 'failed_login',
            severity: 'high',
            title: 'Multiple Failed Login Attempts',
            description: 'User attempted to login 5 times with incorrect credentials',
            user: 'unknown@example.com',
            ipAddress: '203.104.45.67',
            location: 'Unknown Location',
            device: 'Chrome on Windows',
            action: 'Account temporarily locked',
            riskScore: 85
        },
        {
            id: 2,
            timestamp: '2024-01-25 15:25:15',
            eventType: 'suspicious_activity',
            severity: 'critical',
            title: 'Unusual Access Pattern Detected',
            description: 'User accessing system from multiple countries within 1 hour',
            user: 'john.doe@progym.hk',
            ipAddress: '45.123.67.89',
            location: 'Russia',
            device: 'Unknown Browser',
            action: 'Session terminated, user notified',
            riskScore: 95
        },
        {
            id: 3,
            timestamp: '2024-01-25 15:20:08',
            eventType: 'permission_denied',
            severity: 'medium',
            title: 'Unauthorized Access Attempt',
            description: 'User tried to access admin panel without proper permissions',
            user: 'coach@progym.hk',
            ipAddress: '192.168.1.105',
            location: 'Hong Kong, HK',
            device: 'Safari on macOS',
            action: 'Access denied, event logged',
            riskScore: 45
        },
        {
            id: 4,
            timestamp: '2024-01-25 15:15:33',
            eventType: 'account_locked',
            severity: 'medium',
            title: 'Account Automatically Locked',
            description: 'Account locked due to multiple failed login attempts',
            user: 'parent@example.com',
            ipAddress: '178.45.23.67',
            location: 'United Kingdom',
            device: 'Mobile App on Android',
            action: 'Account locked for 30 minutes',
            riskScore: 60
        },
        {
            id: 5,
            timestamp: '2024-01-25 15:10:44',
            eventType: 'password_reset',
            severity: 'low',
            title: 'Password Reset Requested',
            description: 'User requested password reset via email',
            user: 'lisa.park@progym.hk',
            ipAddress: '192.168.1.120',
            location: 'Hong Kong, HK',
            device: 'Chrome on Windows',
            action: 'Reset email sent',
            riskScore: 15
        }
    ]

    const getSeverityColor = (severity: string) => {
        const colors = {
            critical: 'bg-red-100 text-red-700 border-red-200',
            high: 'bg-orange-100 text-orange-700 border-orange-200',
            medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            low: 'bg-green-100 text-green-700 border-green-200'
        }
        return colors[severity as keyof typeof colors] || colors.low
    }

    const getEventIcon = (eventType: string) => {
        const icons = {
            failed_login: Lock,
            suspicious_activity: AlertTriangle,
            permission_denied: UserX,
            account_locked: Ban,
            password_reset: Key
        }
        return icons[eventType as keyof typeof icons] || Shield
    }

    const getRiskScoreColor = (score: number) => {
        if (score >= 80) return 'text-red-600 bg-red-100'
        if (score >= 60) return 'text-orange-600 bg-orange-100'
        if (score >= 40) return 'text-yellow-600 bg-yellow-100'
        return 'text-green-600 bg-green-100'
    }

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Security Events</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Monitor security threats and suspicious activities
                    </p>
                </div>
                <div className={responsiveClasses.buttonGroup}>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                    <Button>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Security Statistics */}
            <div className={responsiveClasses.metricsGrid}>
                {securityStats.map((stat, index) => {
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
                                            <p className={`text-sm mt-1 ${stat.changeType === 'increase' ? 'text-red-600' :
                                                    stat.changeType === 'decrease' ? 'text-green-600' :
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

            {/* Filters */}
            <Card className={responsiveClasses.card}>
                <CardContent className={responsiveClasses.cardContent}>
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by user, IP address, or event..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Event Type Filter */}
                        <select
                            value={selectedEventType}
                            onChange={(e) => setSelectedEventType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {eventTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name} ({type.count})
                                </option>
                            ))}
                        </select>

                        {/* Severity Filter */}
                        <select
                            value={selectedSeverity}
                            onChange={(e) => setSelectedSeverity(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {severityLevels.map((level) => (
                                <option key={level.id} value={level.id}>
                                    {level.name} ({level.count})
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Security Events Table */}
            <Card className={responsiveClasses.card}>
                <CardHeader className={responsiveClasses.cardHeader}>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Recent Security Events
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-4 font-medium text-gray-900">Event</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Severity</th>
                                    <th className="text-left p-4 font-medium text-gray-900">User</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Location</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Device</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Risk Score</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Action Taken</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Time</th>
                                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {securityEvents.map((event) => {
                                    const EventIcon = getEventIcon(event.eventType)
                                    return (
                                        <tr key={event.id} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <EventIcon className="w-5 h-5 text-red-600 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {event.title}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {event.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getSeverityColor(event.severity)}>
                                                    {event.severity}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-900">
                                                    {event.user}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-900">
                                                            {event.location}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {event.ipAddress}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Monitor className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        {event.device}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={getRiskScoreColor(event.riskScore)}>
                                                    {event.riskScore}%
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-600">
                                                    {event.action}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {event.timestamp}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Ban className="w-4 h-4" />
                                                    </Button>
                                                </div>
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

export default SecurityEventsPage