'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SystemOptimizationService, { CacheStatus } from '@/services/modules/system-optimization.service'
import { motion } from 'framer-motion'
import { Database, AlertCircle, Trash2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CachePage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [cacheStatus, setCacheStatus] = useState<CacheStatus[]>([])
    const [analytics, setAnalytics] = useState<any>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadCacheData()
    }, [isAuthenticated, router])

    const loadCacheData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [statusData, analyticsData] = await Promise.all([
                SystemOptimizationService.getCacheStatus(),
                SystemOptimizationService.getCacheAnalytics('30d')
            ])
            setCacheStatus(statusData)
            setAnalytics(analyticsData)
        } catch (err) {
            console.error('Error loading cache data:', err)
            setError('Failed to load cache data')
        } finally {
            setLoading(false)
        }
    }

    const handleClearCache = async (cacheType?: string) => {
        try {
            await SystemOptimizationService.clearCache(cacheType)
            await loadCacheData()
            alert('Cache cleared successfully')
        } catch (err) {
            console.error('Error clearing cache:', err)
            alert('Failed to clear cache')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading cache data...</p>
                </div>
            </div>
        )
    }

    const totalSize = cacheStatus.reduce((sum, cache) => sum + cache.size, 0)
    const avgHitRate = cacheStatus.length > 0 ? (cacheStatus.reduce((sum, cache) => sum + cache.hitRate, 0) / cacheStatus.length).toFixed(1) : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Cache Management</h1>
                        <p className="text-gray-600">Monitor and manage system cache</p>
                    </div>
                    <Button id="btn-clear-cache-system-cache" onClick={() => handleClearCache()} className="bg-red-600 hover:bg-red-700 text-white">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Cache
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Cache Size</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{(totalSize / 1024 / 1024).toFixed(2)}MB</div>
                            <p className="text-xs text-gray-600 mt-2">All caches combined</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Avg Hit Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{avgHitRate}%</div>
                            <p className="text-xs text-gray-600 mt-2">Cache effectiveness</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Active Caches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{cacheStatus.length}</div>
                            <p className="text-xs text-gray-600 mt-2">Cache instances</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-600" />
                            Cache Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {cacheStatus.map((cache, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 border border-gray-200 rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{cache.name}</h3>
                                            <p className="text-sm text-gray-600">Size: {(cache.size / 1024 / 1024).toFixed(2)}MB</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${cache.status === 'healthy' ? 'bg-green-100 text-green-800' :
                                                cache.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {cache.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Hit Rate</p>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-full rounded-full"
                                                    style={{ width: `${cache.hitRate}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-700 mt-1">{cache.hitRate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Miss Rate</p>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-red-600 h-full rounded-full"
                                                    style={{ width: `${cache.missRate}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-700 mt-1">{cache.missRate}%</p>
                                        </div>
                                    </div>

                                    <Button id={`system-cache-clear-${cache.name}-btn`}
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleClearCache(cache.name)}
                                        className="w-full text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear This Cache
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
