'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Database, Upload, Download, Trash2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DataManagementPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)

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
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Data Management</h1>
                    <p className="text-gray-600">Import, export, and manage data</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Records</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">125,432</p>
                                    </div>
                                    <Database className="w-12 h-12 text-blue-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Imports</p>
                                        <p className="text-3xl font-bold text-green-600 mt-2">24</p>
                                    </div>
                                    <Upload className="w-12 h-12 text-green-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Exports</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-2">18</p>
                                    </div>
                                    <Download className="w-12 h-12 text-purple-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Archived</p>
                                        <p className="text-3xl font-bold text-orange-600 mt-2">5</p>
                                    </div>
                                    <Trash2 className="w-12 h-12 text-orange-500 opacity-20" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card id="data-import-nav-card" className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/advanced/data/import')}>
                        <CardContent className="pt-6">
                            <Upload className="w-12 h-12 text-blue-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Import Data</h3>
                            <p className="text-sm text-gray-600">Upload data from files</p>
                        </CardContent>
                    </Card>

                    <Card id="data-export-nav-card" className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/advanced/data/export')}>
                        <CardContent className="pt-6">
                            <Download className="w-12 h-12 text-green-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Export Data</h3>
                            <p className="text-sm text-gray-600">Download data in various formats</p>
                        </CardContent>
                    </Card>

                    <Card id="data-bulk-nav-card" className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/advanced/data/bulk')}>
                        <CardContent className="pt-6">
                            <Database className="w-12 h-12 text-purple-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Bulk Operations</h3>
                            <p className="text-sm text-gray-600">Perform bulk data operations</p>
                        </CardContent>
                    </Card>

                    <Card id="data-archive-nav-card" className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/advanced/data/archive')}>
                        <CardContent className="pt-6">
                            <Trash2 className="w-12 h-12 text-orange-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Archive Data</h3>
                            <p className="text-sm text-gray-600">Archive old data</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
