'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Eye, Database, Clock, User, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { HQAdminService, AuditLog } from '@/services/hqAdminService'

export default function AuditLogsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterAction, setFilterAction] = useState('all')
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchLogs()
    }, [page, searchTerm, filterAction])

    const fetchLogs = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await HQAdminService.getAuditLogs(
                page,
                10,
                searchTerm || undefined,
                filterAction !== 'all' ? filterAction : undefined
            )
            setLogs(response.data)
            setTotalPages(response.totalPages)
        } catch (err: any) {
            console.error('Error fetching audit logs:', err)
            setError(err.message || 'Failed to fetch audit logs')
            // Use mock data for development
            setLogs([
                {
                    id: '1',
                    timestamp: '2026-03-14 14:32:15',
                    user: 'admin@proactiv.com',
                    action: 'LOGIN',
                    resource: 'User Authentication',
                    resourceId: 'auth-001',
                    status: 'SUCCESS',
                    ipAddress: '192.168.1.100',
                    details: 'User logged in successfully'
                },
                {
                    id: '2',
                    timestamp: '2026-03-14 14:25:42',
                    user: 'manager@nyc.proactiv.com',
                    action: 'UPDATE',
                    resource: 'Location Settings',
                    resourceId: 'loc-001',
                    status: 'SUCCESS',
                    ipAddress: '192.168.1.101',
                    details: 'Updated location operating hours'
                },
                {
                    id: '3',
                    timestamp: '2026-03-14 14:15:30',
                    user: 'admin@proactiv.com',
                    action: 'DELETE',
                    resource: 'User Account',
                    resourceId: 'user-001',
                    status: 'SUCCESS',
                    ipAddress: '192.168.1.100',
                    details: 'Deleted inactive user account'
                },
                {
                    id: '4',
                    timestamp: '2026-03-14 14:05:18',
                    user: 'coach@boston.proactiv.com',
                    action: 'CREATE',
                    resource: 'Class Schedule',
                    resourceId: 'class-001',
                    status: 'SUCCESS',
                    ipAddress: '192.168.1.102',
                    details: 'Created new class schedule'
                },
                {
                    id: '5',
                    timestamp: '2026-03-14 13:55:45',
                    user: 'unknown',
                    action: 'LOGIN',
                    resource: 'User Authentication',
                    resourceId: 'auth-002',
                    status: 'FAILED',
                    ipAddress: '203.0.113.45',
                    details: 'Failed login attempt - invalid credentials'
                },
                {
                    id: '6',
                    timestamp: '2026-03-14 13:45:22',
                    user: 'admin@proactiv.com',
                    action: 'UPDATE',
                    resource: 'System Settings',
                    resourceId: 'sys-001',
                    status: 'SUCCESS',
                    ipAddress: '192.168.1.100',
                    details: 'Updated system configuration'
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const actions = ['all', ...new Set(logs.map(l => l.action))]

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-50 text-green-700'
            case 'UPDATE': return 'bg-blue-50 text-blue-700'
            case 'DELETE': return 'bg-red-50 text-red-700'
            case 'LOGIN': return 'bg-purple-50 text-purple-700'
            default: return 'bg-gray-50 text-gray-700'
        }
    }

    const getStatusIcon = (status: string) => {
        return status === 'success' ? '✓' : '✗'
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-600 mt-1">System activity and user action logs</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-5 h-5" />
                    Export Logs
                </button>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {actions.map(action => (
                                <option key={action} value={action}>
                                    {action === 'all' ? 'All Actions' : action}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card>
                <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Resource</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, idx) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                {log.timestamp}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">{log.user}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge className={getActionColor(log.action)}>
                                                {log.action}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">{log.resource}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                {log.status === 'SUCCESS' ? (
                                                    <span className="text-green-600 font-bold">✓</span>
                                                ) : (
                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                )}
                                                <Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'}>
                                                    {log.status}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm text-gray-600">{log.ipAddress}</p>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {logs.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No audit logs found</p>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ {error} - Showing mock data for development
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
