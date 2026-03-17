'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuditVaultService, { AuditLog } from '@/services/modules/audit-vault.service'
import { motion } from 'framer-motion'
import { FileText, Search, Download, Filter, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AuditLogsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [total, setTotal] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadAuditLogs()
    }, [isAuthenticated, router, page])

    const loadAuditLogs = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await AuditVaultService.getAuditLogs({ page, limit: 20 })
            setLogs(response.logs)
            setTotal(response.total)
        } catch (err) {
            console.error('Error loading audit logs:', err)
            setError('Failed to load audit logs')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            await loadAuditLogs()
            return
        }
        try {
            setLoading(true)
            const results = await AuditVaultService.searchAuditLogs(searchQuery)
            setLogs(results)
            setTotal(results.length)
        } catch (err) {
            console.error('Error searching logs:', err)
            setError('Failed to search audit logs')
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            const blob = await AuditVaultService.exportAuditLogs()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `audit-logs-${new Date().toISOString()}.csv`
            a.click()
        } catch (err) {
            console.error('Error exporting logs:', err)
            alert('Failed to export audit logs')
        }
    }

    if (!isAuthenticated) return null

    if (loading && logs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading audit logs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Audit Logs</h1>
                        <p className="text-gray-600">Complete audit trail of system activities</p>
                    </div>
                    <Button onClick={handleExport} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search audit logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Search
                        </Button>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Audit Logs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Audit Trail ({total.toLocaleString()} entries)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {logs.map((log, idx) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            {log.status === 'success' ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600 mt-1" />
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <p className="font-medium text-gray-900">{log.action}</p>
                                                    <Badge className={`${log.status === 'success' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {log.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {log.resource} • {log.resourceId}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>User: {log.userName}</span>
                                                    <span>•</span>
                                                    <span>IP: {log.ipAddress}</span>
                                                    <span>•</span>
                                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {logs.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">No audit logs found</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {total > 20 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                <p className="text-sm text-gray-600">
                                    Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} entries
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page * 20 >= total}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
