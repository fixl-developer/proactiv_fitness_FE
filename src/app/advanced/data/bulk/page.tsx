'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DataManagementService, { BulkOperation } from '@/services/modules/data-management.service'
import { motion } from 'framer-motion'
import { Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function BulkOperationsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [operations, setOperations] = useState<BulkOperation[]>([])
    const [operation, setOperation] = useState('update')
    const [entity, setEntity] = useState('users')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadOperations()
    }, [isAuthenticated, router])

    const loadOperations = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await DataManagementService.getBulkOperations()
            setOperations(response)
        } catch (err) {
            console.error('Error loading operations:', err)
            setError('Failed to load bulk operations')
        } finally {
            setLoading(false)
        }
    }

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
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Bulk Operations</h1>
                    <p className="text-gray-600">Perform bulk data operations</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Operation Config</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Operation</label>
                                        <select data-testid="select-advanced-data-bulk-1"
                                            value={operation}
                                            onChange={(e) => setOperation(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="update">Update</option>
                                            <option value="delete">Delete</option>
                                            <option value="archive">Archive</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Entity</label>
                                        <select data-testid="select-advanced-data-bulk-2"
                                            value={entity}
                                            onChange={(e) => setEntity(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="users">Users</option>
                                            <option value="bookings">Bookings</option>
                                            <option value="classes">Classes</option>
                                        </select>
                                    </div>

                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        <Zap className="w-4 h-4 mr-2" />
                                        Execute
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Operation History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {operations.map((op, idx) => (
                                        <motion.div
                                            key={op.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-4 border border-gray-200 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {op.status === 'completed' ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium capitalize">{op.operation} {op.entity}</p>
                                                        <p className="text-sm text-gray-600">{op.processedRecords}/{op.totalRecords} records</p>
                                                    </div>
                                                </div>
                                                <Badge className={`${op.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        op.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {op.status}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
