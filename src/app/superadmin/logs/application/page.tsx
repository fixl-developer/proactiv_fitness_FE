'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FileText, Search, Filter, Download, RefreshCw, AlertTriangle,
    CheckCircle, AlertCircle, Bug, Zap, Clock, User, Code
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { superAdminService, SystemLog } from '@/services/superAdminService'

export default function ApplicationLogsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [logs, setLogs] = useState<SystemLog[]>([])
    const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [levelFilter, setLevelFilter] = useState('all')
    const [sourceFilter, setSourceFilter] = useState('all')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const result = await superAdminService.getSystemLogs({})
                setLogs(result.logs)
                setFilteredLogs(result.logs)
            } catch (error) {
                console.error('Error fetching logs:', error)
                // Fallback data
                const mockLogs: SystemLog[] = [
                    {
                        id: '1',
                        level: 'info',
                        message: 'User login successful',
                        timestamp: new Date().toISOString(),
                        source: 'auth',
                        userId: 'user123',
                        metadata: { email: 'user@example.com' }
                    },
                    {
                        id: '2',
                        level: 'warn',
                        message: 'High memory usage detected',
                        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                        source: 'system',
                        metadata: { usage: '85%' }
                    },
                    {
                        id: '3',
                        level: 'error',
                        message: 'Database connection timeout',
                        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                        source: 'database',
                        stackTrace: 'Error: Connection timeout at line 45'
                    },
                    {
                        id: '4',
                        level: 'debug',
                        message: 'API request processed',
                        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                        source: 'api',
                        metadata: { endpoint: '/api/users', duration: '125ms' }
                    }
                ]
                setLogs(mockLogs)
                setFilteredLogs(mockLogs)
            } finally {
                setIsLoading(false)
            }
        }

        fetchLogs()
    }, [])

    // Filter logs
    useEffect(() => {
        let filtered = logs

        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.source.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (levelFilter !== 'all') {
            filtered = filtered.filter(log => log.level === levelFilter)
        }

        if (sourceFilter !== 'all') {
            filtered = filtered.filter(log => log.source === sourceFilter)
        }

        setFilteredLogs(filtered)
    }, [logs, searchTerm, levelFilter, sourceFilter])

    const handleRefresh = async () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 2000)
    }

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'debug': return <Bug className="w-4 h-4 text-gray-600" />
            case 'info': return <CheckCircle className="w-4 h-4 text-blue-600" />
            case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
            case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />
            case 'fatal': return <Zap className="w-4 h-4 text-red-700" />
            default: return <FileText className="w-4 h-4 text-gray-600" />
        }
    }

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'debug': return <Badge className="bg-gray-100 text-gray-800">Debug</Badge>
            case 'info': return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
            case 'warn': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
            case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>
            case 'fatal': return <Badge className="bg-red-200 text-red-900">Fatal</Badge>
            default: return <Badge variant="outline">{level}</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    const logStats = {
        total: logs.length,
        debug: logs.filter(l => l.level === 'debug').length,
        info: logs.filter(l => l.level === 'info').length,
        warn: logs.filter(l => l.level === 'warn').length,
        error: logs.filter(l => l.level === 'error').length,
        fatal: logs.filter(l => l.level === 'fatal').length
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Application Logs...</p>
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
                        <FileText className="w-8 h-8 mr-3 text-gray-600" />
                        Application Logs
                    </h1>
                    <p className="text-gray-600 mt-1">Monitor and analyze system logs</p>
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
                    <Button variant="outline" className="flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Log Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{logStats.total}</p>
                                <p className="text-xs text-gray-600">Total Logs</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{logStats.info}</p>
                                <p className="text-xs text-gray-600">Info</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{logStats.warn}</p>
                                <p className="text-xs text-gray-600">Warnings</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{logStats.error}</p>
                                <p className="text-xs text-gray-600">Errors</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-700">{logStats.fatal}</p>
                                <p className="text-xs text-gray-600">Fatal</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-600">{logStats.debug}</p>
                                <p className="text-xs text-gray-600">Debug</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="w-5 h-5 mr-2 text-gray-600" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search logs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={levelFilter} onValueChange={setLevelFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filter by level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="debug">Debug</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="warn">Warning</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                    <SelectItem value="fatal">Fatal</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sourceFilter} onValueChange={setSourceFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filter by source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sources</SelectItem>
                                    <SelectItem value="auth">Auth</SelectItem>
                                    <SelectItem value="api">API</SelectItem>
                                    <SelectItem value="database">Database</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Logs Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Log Entries ({filteredLogs.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>User</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <div className="text-sm flex items-center">
                                                    <Clock className="w-3 h-3 mr-2 text-gray-400" />
                                                    {formatDate(log.timestamp)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    {getLevelIcon(log.level)}
                                                    {getLevelBadge(log.level)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{log.source}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {log.message}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {log.userId ? (
                                                    <div className="text-sm flex items-center">
                                                        <User className="w-3 h-3 mr-1 text-gray-400" />
                                                        {log.userId}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
