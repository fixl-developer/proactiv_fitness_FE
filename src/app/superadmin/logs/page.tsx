'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { FileText, Search, Filter, Download, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function SystemLogsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [logs] = useState([
        { id: '1', level: 'info', message: 'User login successful', service: 'auth', timestamp: new Date().toISOString() },
        { id: '2', level: 'warning', message: 'High memory usage detected', service: 'system', timestamp: new Date().toISOString() },
        { id: '3', level: 'error', message: 'Database connection timeout', service: 'database', timestamp: new Date().toISOString() },
        { id: '4', level: 'info', message: 'Backup completed successfully', service: 'backup', timestamp: new Date().toISOString() }
    ])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        setLoading(false)
    }, [isAuthenticated, router])

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading system logs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">System Logs</h1>
                        <p className="text-gray-600">View system activity logs</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.push('/superadmin/logs/search')}>
                            <Search className="w-4 h-4 mr-2" />
                            Advanced Search
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Recent Logs ({logs.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {logs.map((log, idx) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        {log.level === 'info' && <Info className="w-5 h-5 text-blue-600 mt-1" />}
                                        {log.level === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 mt-1" />}
                                        {log.level === 'error' && <XCircle className="w-5 h-5 text-red-600 mt-1" />}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge className={`${log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                                                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {log.level.toUpperCase()}
                                                </Badge>
                                                <span className="text-sm text-gray-600">{log.service}</span>
                                            </div>
                                            <p className="text-gray-900 mb-2">{log.message}</p>
                                            <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
