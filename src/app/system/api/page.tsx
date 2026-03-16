'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SystemOptimizationService from '@/services/modules/system-optimization.service'
import { motion } from 'framer-motion'
import { Zap, AlertCircle, TrendingUp, Gauge } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function APIPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [performance, setPerformance] = useState<any>(null)
    const [endpoints, setEndpoints] = useState<any[]>([])
    const [optimizing, setOptimizing] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadAPIData()
    }, [isAuthenticated, router])

    const loadAPIData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [performanceData, endpointsData] = await Promise.all([
                SystemOptimizationService.getAPIPerformance('30d'),
                SystemOptimizationService.getAPIEndpoints()
            ])
            setPerformance(performanceData)
            setEndpoints(endpointsData)
        } catch (err) {
            console.error('Error loading API data:', err)
            setError('Failed to load API data')
        } finally {
            setLoading(false)
        }
    }

    const handleOptimize = async () => {
        try {
            setOptimizing(true)
            await SystemOptimizationService.optimizeAPI()
            await loadAPIData()
            alert('API optimized successfully')
        } catch (err) {
            console.error('Error optimizing API:', err)
            alert('Failed to optimize API')
        } finally {
            setOptimizing(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading API data...</p>
                </div>
            </div>
        )
    }

    const slowEndpoints = endpoints.filter((ep: any) => ep.avgResponseTime > 500)
    const errorEndpoints = endpoints.filter((ep: any) => ep.errorRate > 5)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">API Optimization</h1>
                        <p className="text-gray-600">Monitor and optimize API performance</p>
                    </div>
                    <Button onClick={handleOptimize} disabled={optimizing} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Zap className="w-4 h-4 mr-2" />
                        {optimizing ? 'Optimizing...' : 'Optimize API'}
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {performance && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{performance.totalRequests?.toLocaleString() || 0}</div>
                                <p className="text-xs text-gray-600 mt-2">Last 30 days</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{performance.avgResponseTime || 0}ms</div>
                                <p className="text-xs text-gray-600 mt-2">Average latency</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{performance.successRate || 0}%</div>
                                <p className="text-xs text-gray-600 mt-2">Successful requests</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600">Error Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">{performance.errorRate || 0}%</div>
                                <p className="text-xs text-gray-600 mt-2">Failed requests</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                Slow Endpoints ({slowEndpoints.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {slowEndpoints.length > 0 ? (
                                    slowEndpoints.map((endpoint: any, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-3 bg-red-50 border border-red-200 rounded-lg"
                                        >
                                            <p className="font-medium text-red-900">{endpoint.path}</p>
                                            <p className="text-sm text-red-800 mt-1">Response time: {endpoint.avgResponseTime}ms</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p className="text-gray-600 text-center py-4">No slow endpoints</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Top Endpoints
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {endpoints.slice(0, 5).map((endpoint: any, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-blue-900">{endpoint.path}</p>
                                                <p className="text-xs text-blue-800 mt-1">{endpoint.method}</p>
                                            </div>
                                            <span className="text-sm font-bold text-blue-600">{endpoint.calls} calls</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gauge className="w-5 h-5 text-blue-600" />
                            All Endpoints
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Endpoint</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Calls</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Response</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Error Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {endpoints.map((endpoint: any, idx: number) => (
                                        <motion.tr
                                            key={idx}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4 text-gray-900">{endpoint.path}</td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                                    {endpoint.method}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">{endpoint.calls}</td>
                                            <td className="py-3 px-4 text-gray-700">{endpoint.avgResponseTime}ms</td>
                                            <td className="py-3 px-4">
                                                <span className={`${endpoint.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {endpoint.errorRate}%
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
