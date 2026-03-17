'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon,
    RefreshCw, Download, AlertTriangle, CheckCircle, Server
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { superAdminService } from '@/services/superAdminService'

export default function CostAnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [costData, setCostData] = useState<any>(null)
    const [period, setPeriod] = useState('month')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchCostData()
    }, [period])

    const fetchCostData = async () => {
        try {
            setIsLoading(true)
            const data = await superAdminService.getCostAnalytics(period)
            setCostData(data)
        } catch (error) {
            console.error('Error fetching cost data:', error)
            // Fallback mock data
            const mockData = {
                totalCost: 12500,
                monthlyTrend: [
                    { month: 'Jan', cost: 9800, forecast: 10200 },
                    { month: 'Feb', cost: 10500, forecast: 10800 },
                    { month: 'Mar', cost: 11200, forecast: 11500 },
                    { month: 'Apr', cost: 12000, forecast: 12300 },
                    { month: 'May', cost: 12500, forecast: 12800 }
                ],
                costBreakdown: [
                    { name: 'Compute', value: 4500, color: '#3B82F6' },
                    { name: 'Storage', value: 3200, color: '#10B981' },
                    { name: 'Network', value: 2100, color: '#F59E0B' },
                    { name: 'Database', value: 1800, color: '#8B5CF6' },
                    { name: 'Other', value: 900, color: '#6B7280' }
                ],
                resourceCosts: [
                    { resource: 'API Servers', cost: 4500, usage: 85 },
                    { resource: 'Database', cost: 1800, usage: 72 },
                    { resource: 'Storage', cost: 3200, usage: 65 },
                    { resource: 'CDN', cost: 1200, usage: 45 },
                    { resource: 'Monitoring', cost: 800, usage: 30 }
                ]
            }
            setCostData(mockData)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchCostData()
        setTimeout(() => setRefreshing(false), 2000)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Cost Analytics...</p>
                </div>
            </div>
        )
    }

    const costTrend = costData?.monthlyTrend?.[costData.monthlyTrend.length - 1]?.cost || 0
    const previousCost = costData?.monthlyTrend?.[costData.monthlyTrend.length - 2]?.cost || 0
    const costChange = parseFloat(((costTrend - previousCost) / previousCost * 100).toFixed(1))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <DollarSign className="w-8 h-8 mr-3 text-green-600" />
                        Cost Analytics
                    </h1>
                    <p className="text-gray-600 mt-1">Infrastructure cost tracking and optimization</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                            <SelectItem value="quarter">Last 90 Days</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        variant="outline"
                        className="flex items-center"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" className="flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Cost Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">${costData?.totalCost.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                <span className={costChange > 0 ? 'text-red-600' : 'text-green-600'}>
                                    {costChange > 0 ? '↑' : '↓'} {Math.abs(costChange)}% from last period
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Daily Cost</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">${(costData?.totalCost / 30).toFixed(0)}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                <span className="text-blue-600">Per day average</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Projected Cost</CardTitle>
                            <TrendingDown className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">${(costData?.totalCost * 1.08).toFixed(0)}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                <span className="text-purple-600">Next month estimate</span>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="trend" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="trend">Cost Trend</TabsTrigger>
                    <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
                    <TabsTrigger value="resources">Resource Costs</TabsTrigger>
                </TabsList>

                {/* Cost Trend */}
                <TabsContent value="trend">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                                    Cost Trend & Forecast
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={costData?.monthlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `$${value}`} />
                                        <Legend />
                                        <Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} name="Actual Cost" />
                                        <Line type="monotone" dataKey="forecast" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Cost Breakdown */}
                <TabsContent value="breakdown">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PieChartIcon className="w-5 h-5 mr-2 text-green-600" />
                                    Cost Breakdown by Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={400}>
                                    <PieChart>
                                        <Pie
                                            data={costData?.costBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name} $${value}`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {costData?.costBreakdown.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `$${value}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Resource Costs */}
                <TabsContent value="resources">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Server className="w-5 h-5 mr-2 text-purple-600" />
                                    Cost by Resource
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {costData?.resourceCosts.map((resource: any, index: number) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-gray-900">{resource.resource}</p>
                                                <p className="text-lg font-bold text-green-600">${resource.cost}</p>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${resource.usage}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{resource.usage}% utilization</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>

            {/* Cost Optimization Recommendations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                            Cost Optimization Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-900">Reduce Compute Costs</p>
                                <p className="text-sm text-yellow-700">Consider using reserved instances for API servers to save 30-40%</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-900">Optimize Storage</p>
                                <p className="text-sm text-blue-700">Archive old logs to reduce storage costs by 20%</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-green-900">Network Optimization</p>
                                <p className="text-sm text-green-700">Implement CDN caching to reduce bandwidth costs</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
