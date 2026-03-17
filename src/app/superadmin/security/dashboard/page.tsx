'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Shield, AlertTriangle, Eye, Lock, Key, UserX, Activity,
    TrendingUp, TrendingDown, Clock, Globe, Wifi, Server,
    FileText, Bell, CheckCircle, XCircle, RefreshCw, Filter,
    Search, Download, Settings, Zap, Target, Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { superAdminService, SecurityEvent } from '@/services/superAdminService'

export default function SecurityDashboardPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [securityData, setSecurityData] = useState<any>(null)
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
    const [filteredEvents, setFilteredEvents] = useState<SecurityEvent[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [eventTypeFilter, setEventTypeFilter] = useState('all')
    const [riskLevelFilter, setRiskLevelFilter] = useState('all')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        const fetchSecurityData = async () => {
            try {
                const [dashboard, events] = await Promise.all([
                    superAdminService.getSecurityDashboard(),
                    superAdminService.getSecurityEvents()
                ])
                setSecurityData(dashboard)
                setSecurityEvents(events.events)
                setFilteredEvents(events.events)
            } catch (error) {
                console.error('Error fetching security data:', error)
                // Fallback data
                const mockEvents: SecurityEvent[] = [
                    {
                        id: '1',
                        type: 'failed_login',
                        userId: 'user123',
                        userEmail: 'suspicious@example.com',
                        ipAddress: '192.168.1.100',
                        userAgent: 'Mozilla/5.0...',
                        timestamp: '2024-03-15T10:30:00Z',
                        details: { attempts: 5, reason: 'Invalid password' },
                        riskLevel: 'high'
                    },
                    {
                        id: '2',
                        type: 'permission_denied',
                        userId: 'user456',
                        userEmail: 'user@example.com',
                        ipAddress: '10.0.0.50',
                        userAgent: 'Mozilla/5.0...',
                        timestamp: '2024-03-15T09:15:00Z',
                        details: { resource: '/admin/users', action: 'DELETE' },
                        riskLevel: 'medium'
                    },
                    {
                        id: '3',
                        type: 'system_change',
                        userId: 'admin789',
                        userEmail: 'admin@proactiv.com',
                        ipAddress: '172.16.0.10',
                        userAgent: 'Mozilla/5.0...',
                        timestamp: '2024-03-15T08:45:00Z',
                        details: { setting: 'security_policy', oldValue: 'medium', newValue: 'high' },
                        riskLevel: 'low'
                    }
                ]
                setSecurityEvents(mockEvents)
                setFilteredEvents(mockEvents)
                setSecurityData({
                    totalEvents: 1247,
                    criticalAlerts: 3,
                    highRiskEvents: 15,
                    mediumRiskEvents: 89,
                    lowRiskEvents: 1140,
                    failedLogins: 45,
                    suspiciousActivity: 8,
                    blockedIPs: 12,
                    activeThreats: 2
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchSecurityData()
    }, [])

    // Filter events
    useEffect(() => {
        let filtered = securityEvents

        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.ipAddress.includes(searchTerm) ||
                event.type.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (eventTypeFilter !== 'all') {
            filtered = filtered.filter(event => event.type === eventTypeFilter)
        }

        if (riskLevelFilter !== 'all') {
            filtered = filtered.filter(event => event.riskLevel === riskLevelFilter)
        }

        setFilteredEvents(filtered)
    }, [securityEvents, searchTerm, eventTypeFilter, riskLevelFilter])

    const handleRefresh = async () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 2000)
    }

    const getRiskBadge = (riskLevel: string) => {
        switch (riskLevel) {
            case 'critical':
                return <Badge className="bg-red-100 text-red-800">Critical</Badge>
            case 'high':
                return <Badge className="bg-orange-100 text-orange-800">High</Badge>
            case 'medium':
                return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
            case 'low':
                return <Badge className="bg-green-100 text-green-800">Low</Badge>
            default:
                return <Badge variant="outline">{riskLevel}</Badge>
        }
    }

    const getEventTypeBadge = (type: string) => {
        const typeColors: { [key: string]: string } = {
            'login': 'bg-blue-100 text-blue-800',
            'logout': 'bg-gray-100 text-gray-800',
            'failed_login': 'bg-red-100 text-red-800',
            'permission_denied': 'bg-orange-100 text-orange-800',
            'data_access': 'bg-purple-100 text-purple-800',
            'system_change': 'bg-indigo-100 text-indigo-800'
        }
        return <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>{type.replace('_', ' ')}</Badge>
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Sample chart data
    const securityTrendsData = [
        { date: '2024-03-01', critical: 2, high: 8, medium: 25, low: 145 },
        { date: '2024-03-02', critical: 1, high: 12, medium: 32, low: 167 },
        { date: '2024-03-03', critical: 3, high: 15, medium: 28, low: 189 },
        { date: '2024-03-04', critical: 0, high: 9, medium: 35, low: 201 },
        { date: '2024-03-05', critical: 2, high: 18, medium: 41, low: 178 },
        { date: '2024-03-06', critical: 1, high: 14, medium: 38, low: 195 },
        { date: '2024-03-07', critical: 3, high: 16, medium: 29, low: 203 }
    ]

    const threatDistribution = [
        { name: 'Failed Logins', value: 35, color: '#EF4444' },
        { name: 'Permission Denied', value: 25, color: '#F97316' },
        { name: 'Suspicious Activity', value: 20, color: '#EAB308' },
        { name: 'System Changes', value: 15, color: '#8B5CF6' },
        { name: 'Data Access', value: 5, color: '#06B6D4' }
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Shield className="w-12 h-12 text-red-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Security Dashboard...</p>
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
                        <Shield className="w-8 h-8 mr-3 text-red-600" />
                        Security & Audit Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">Monitor security events, threats, and system integrity</p>
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
                    <Badge variant="outline" className="text-red-600 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {securityData?.criticalAlerts} Critical Alerts
                    </Badge>
                </div>
            </div>

            {/* Security Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{securityData?.criticalAlerts}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-red-600">Requires immediate attention</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                            <UserX className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{securityData?.failedLogins}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-orange-600">Last 24 hours</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
                            <Eye className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{securityData?.suspiciousActivity}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-yellow-600">Under investigation</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
                            <Globe className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{securityData?.blockedIPs}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-blue-600">Automatically blocked</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Security Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                                Security Events Trend (7 days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={securityTrendsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="critical" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.8} />
                                    <Area type="monotone" dataKey="high" stackId="1" stroke="#F97316" fill="#F97316" fillOpacity={0.8} />
                                    <Area type="monotone" dataKey="medium" stackId="1" stroke="#EAB308" fill="#EAB308" fillOpacity={0.8} />
                                    <Area type="monotone" dataKey="low" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.8} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Target className="w-5 h-5 mr-2 text-purple-600" />
                                Threat Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={threatDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {threatDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Security Events */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-gray-600" />
                            Recent Security Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search events by user, IP, or type..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="login">Login</SelectItem>
                                    <SelectItem value="logout">Logout</SelectItem>
                                    <SelectItem value="failed_login">Failed Login</SelectItem>
                                    <SelectItem value="permission_denied">Permission Denied</SelectItem>
                                    <SelectItem value="data_access">Data Access</SelectItem>
                                    <SelectItem value="system_change">System Change</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filter by risk" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Risk Levels</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Events Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Event Type</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Risk Level</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEvents.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {formatDate(event.timestamp)}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getEventTypeBadge(event.type)}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{event.userEmail}</div>
                                                    <div className="text-sm text-gray-500">{event.userId}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                    {event.ipAddress}
                                                </code>
                                            </TableCell>
                                            <TableCell>{getRiskBadge(event.riskLevel)}</TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-600">
                                                    {JSON.stringify(event.details)}
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

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Settings className="w-5 h-5 mr-2 text-gray-600" />
                            Security Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Lock className="w-6 h-6 mb-2 text-red-600" />
                                <span className="text-sm">Block IP</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <UserX className="w-6 h-6 mb-2 text-orange-600" />
                                <span className="text-sm">Suspend User</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Key className="w-6 h-6 mb-2 text-blue-600" />
                                <span className="text-sm">Reset Password</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Bell className="w-6 h-6 mb-2 text-purple-600" />
                                <span className="text-sm">Create Alert</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Download className="w-6 h-6 mb-2 text-green-600" />
                                <span className="text-sm">Export Logs</span>
                            </Button>
                            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                                <Activity className="w-6 h-6 mb-2 text-gray-600" />
                                <span className="text-sm">Security Scan</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
