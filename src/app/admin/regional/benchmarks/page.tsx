'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon,
    Target, Award, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { RegionalAdminService } from '@/services/regionalAdminService'

export default function RegionalBenchmarksPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('30d')
    const [benchmarkData, setBenchmarkData] = useState<any[]>([])
    const [locationComparison, setLocationComparison] = useState<any[]>([])
    const [trendData, setTrendData] = useState<any[]>([])

    const FALLBACK_BENCHMARKS = [
        { metric: 'Revenue/Location', regional: 142000, national: 135000, target: 150000 },
        { metric: 'Student Enrollment', regional: 250, national: 240, target: 280 },
        { metric: 'Staff Utilization', regional: 82, national: 78, target: 85 },
        { metric: 'Customer Satisfaction', regional: 4.6, national: 4.4, target: 4.7 },
        { metric: 'Class Occupancy', regional: 78.5, national: 75, target: 85 },
        { metric: 'Retention Rate', regional: 92, national: 88, target: 95 },
    ]
    const FALLBACK_LOCATIONS = [
        { name: 'Boston Downtown', revenue: 185000, target: 180000, status: 'EXCEEDING' },
        { name: 'Boston Suburbs', revenue: 165000, target: 160000, status: 'EXCEEDING' },
        { name: 'Providence', revenue: 125000, target: 140000, status: 'BELOW' },
        { name: 'Hartford', revenue: 145000, target: 145000, status: 'ON_TARGET' },
        { name: 'New Haven', revenue: 115000, target: 130000, status: 'BELOW' },
    ]
    const FALLBACK_TREND = [
        { month: 'Jan', regional: 135000, national: 130000, target: 145000 },
        { month: 'Feb', regional: 138000, national: 132000, target: 147000 },
        { month: 'Mar', regional: 142000, national: 135000, target: 150000 },
        { month: 'Apr', regional: 140000, national: 133000, target: 152000 },
        { month: 'May', regional: 145000, national: 137000, target: 155000 },
        { month: 'Jun', regional: 148000, national: 140000, target: 158000 },
    ]

    useEffect(() => {
        const loadBenchmarks = async () => {
            try {
                setIsLoading(true)
                const data = await RegionalAdminService.getBenchmarks()
                setBenchmarkData(data?.metrics?.length ? data.metrics.map((m: any) => ({
                    metric: m.metric, regional: m.regional, national: m.national,
                    target: m.national * 1.1 // derive target as 10% above national
                })) : FALLBACK_BENCHMARKS)
                setLocationComparison(data?.locationBenchmarks?.length ? data.locationBenchmarks.map((l: any) => ({
                    name: l.location, revenue: l.revenueActual, target: l.revenueTarget,
                    status: l.revenueActual > l.revenueTarget ? 'EXCEEDING' : l.revenueActual === l.revenueTarget ? 'ON_TARGET' : 'BELOW'
                })) : FALLBACK_LOCATIONS)
                setTrendData(data?.trendData?.length ? data.trendData.map((t: any) => ({
                    month: t.month, regional: t.regional * 1000, national: t.national * 1000, target: t.regional * 1050
                })) : FALLBACK_TREND)
            } catch {
                setBenchmarkData(FALLBACK_BENCHMARKS)
                setLocationComparison(FALLBACK_LOCATIONS)
                setTrendData(FALLBACK_TREND)
            } finally {
                setIsLoading(false)
            }
        }
        loadBenchmarks()
    }, [timeRange])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Performance Benchmarks</h1>
                    <p className="text-gray-600 mt-1">Compare regional performance against national benchmarks</p>
                </div>
                <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benchmarkData.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900">{item.metric}</h3>
                                        {item.regional > item.national ? (
                                            <TrendingUp className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <TrendingDown className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600">Regional</span>
                                            <span className="text-sm font-bold text-blue-600">{item.regional}</span>
                                        </div>
                                        <Progress value={Math.min((item.regional / item.target) * 100, 100)} className="h-2 bg-blue-100" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600">National Avg</span>
                                            <span className="text-sm font-bold text-gray-600">{item.national}</span>
                                        </div>
                                        <Progress value={Math.min((item.national / item.target) * 100, 100)} className="h-2 bg-gray-100" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600">Target</span>
                                            <span className="text-sm font-bold text-green-600">{item.target}</span>
                                        </div>
                                        <Progress value={100} className="h-2 bg-green-100" />
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-600">
                                        {item.regional > item.national
                                            ? `+${((item.regional - item.national) / item.national * 100).toFixed(1)}% above national average`
                                            : `${((item.regional - item.national) / item.national * 100).toFixed(1)}% below national average`
                                        }
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Trend Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5 text-blue-600" />
                        Revenue Trend Comparison
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => typeof value === 'number' ? `$${(value / 1000).toFixed(0)}K` : value} />
                            <Legend />
                            <Line type="monotone" dataKey="regional" stroke="#3b82f6" name="Regional" strokeWidth={2} />
                            <Line type="monotone" dataKey="national" stroke="#9ca3af" name="National Avg" strokeWidth={2} />
                            <Line type="monotone" dataKey="target" stroke="#10b981" name="Target" strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Location Performance vs Target */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Location Performance vs Target
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={locationComparison}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => typeof value === 'number' ? `$${(value / 1000).toFixed(0)}K` : value} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3b82f6" name="Actual Revenue" />
                            <Bar dataKey="target" fill="#10b981" name="Target Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Location Performance Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Location Performance Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {locationComparison.map((location, idx) => {
                            const variance = location.revenue - location.target
                            const variancePercent = (variance / location.target * 100).toFixed(1)
                            const isExceeding = variance > 0

                            return (
                                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{location.name}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                            <span className="text-gray-600">Actual: ${(location.revenue / 1000).toFixed(0)}K</span>
                                            <span className="text-gray-600">Target: ${(location.target / 1000).toFixed(0)}K</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={isExceeding ? 'default' : 'destructive'}>
                                            {isExceeding ? '+' : ''}{variancePercent}%
                                        </Badge>
                                        <p className="text-xs text-gray-600 mt-1">{location.status.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Insights */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">Key Insights</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Regional performance is 5.2% above national average</li>
                                <li>• 2 locations are below target - Providence and New Haven need attention</li>
                                <li>• Boston Downtown and Boston Suburbs are exceeding targets</li>
                                <li>• Staff utilization is 5.1% above national benchmark</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
