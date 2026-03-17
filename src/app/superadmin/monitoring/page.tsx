'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ObservabilityService from '@/services/modules/observability.service'
import { motion } from 'framer-motion'
import { Activity, Server, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function MonitoringPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<any[]>([])
    const [systemHealth, setSystemHealth] = useState<any>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        loadMonitoringData()
    }, [isAuthenticated, router])

    const loadMonitoringData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [metricsRes, healthRes] = await Promise.all([
                ObservabilityService.getPerformanceMetrics(),
                ObservabilityService.getSystemHealth()
            ])

            setMetrics(metricsRes || [])
            setSystemHealth(healthRes)
        } catch (err) {
            console.error('Error loading monitoring data:', err)
            setError('Failed to load monitoring data')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">System Monitoring</h1>
                    <p className="text-gray-600">Real-time system performance monitoring</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { title: 'CPU Usage', value: `${systemHealth?.cpu || 0}%`, icon: Server, color: 'text-blue-600' },
                        { title: 'Memory', value: `${systemHealth?.memory || 0}%`, icon: Activity, color: 'text-purple-600' },
                        { title: 'Disk', value: `${systemHealth?.disk || 0}%`, icon: TrendingUp, color: 'text-green-600' },
                        { title: 'Status', value: systemHealth?.status || 'Unknown', icon: AlertTriangle, color: 'text-orange-600' }
                    ].map((metric, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">{metric.title}</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                        </div>
                                        <metric.icon className={`w-8 h-8 ${metric.color} opacity-20`} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={metrics}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timestamp" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="cpu" stroke="#3b82f6" />
                                <Line type="monotone" dataKey="memory" stroke="#8b5cf6" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
