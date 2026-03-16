'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Database, Plus, Download, RotateCcw, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function BackupsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [backups] = useState([
        { id: '1', name: 'Full Backup', size: '2.4 GB', status: 'completed', createdAt: new Date().toISOString() },
        { id: '2', name: 'Incremental Backup', size: '450 MB', status: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', name: 'Database Backup', size: '1.2 GB', status: 'completed', createdAt: new Date(Date.now() - 172800000).toISOString() }
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
                    <p className="text-gray-600">Loading backups...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Backup Management</h1>
                        <p className="text-gray-600">Manage system backups and restores</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Backup
                    </Button>
                </div>

                <div className="space-y-4">
                    {backups.map((backup, idx) => (
                        <motion.div
                            key={backup.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <Database className="w-10 h-10 text-blue-600" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">{backup.name}</h3>
                                                    <Badge className="bg-green-100 text-green-800">
                                                        {backup.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>Size: {backup.size}</span>
                                                    <span>•</span>
                                                    <span>Created: {new Date(backup.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline">
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => router.push('/superadmin/backups/restore')}>
                                                <RotateCcw className="w-4 h-4 mr-2" />
                                                Restore
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
