'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Megaphone, Plus, Edit2, Trash2, Eye, TrendingUp, Users,
    Calendar, Target, Search, Filter, BarChart3, CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function MarketingPromotionsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchCampaigns()
    }, [searchTerm, filterStatus])

    const fetchCampaigns = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Mock data
            setCampaigns([
                {
                    id: '1',
                    name: 'Summer Camp Promotion',
                    type: 'SEASONAL',
                    status: 'ACTIVE',
                    startDate: '2024-06-01',
                    endDate: '2024-08-31',
                    discount: 20,
                    budget: 5000,
                    spent: 3200,
                    reach: 2500,
                    conversions: 185,
                    roi: 145
                },
                {
                    id: '2',
                    name: 'New Student Referral',
                    type: 'REFERRAL',
                    status: 'ACTIVE',
                    startDate: '2024-03-01',
                    endDate: '2024-12-31',
                    discount: 15,
                    budget: 3000,
                    spent: 1800,
                    reach: 1200,
                    conversions: 95,
                    roi: 125
                },
                {
                    id: '3',
                    name: 'Birthday Party Special',
                    type: 'SEASONAL',
                    status: 'ACTIVE',
                    startDate: '2024-04-01',
                    endDate: '2024-05-31',
                    discount: 25,
                    budget: 2000,
                    spent: 1500,
                    reach: 800,
                    conversions: 72,
                    roi: 160
                },
                {
                    id: '4',
                    name: 'Spring Break Camp',
                    type: 'SEASONAL',
                    status: 'SCHEDULED',
                    startDate: '2024-04-15',
                    endDate: '2024-04-22',
                    discount: 30,
                    budget: 4000,
                    spent: 0,
                    reach: 0,
                    conversions: 0,
                    roi: 0
                },
                {
                    id: '5',
                    name: 'Corporate Team Building',
                    type: 'B2B',
                    status: 'COMPLETED',
                    startDate: '2024-02-01',
                    endDate: '2024-02-28',
                    discount: 10,
                    budget: 2500,
                    spent: 2500,
                    reach: 500,
                    conversions: 45,
                    roi: 180
                },
            ])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0)
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0)
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)

    // Campaign performance data
    const performanceData = campaigns.map(c => ({
        name: c.name.substring(0, 15),
        reach: c.reach,
        conversions: c.conversions,
        roi: c.roi
    }))

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
                    <h1 className="text-3xl font-bold text-gray-900">Marketing & Promotions</h1>
                    <p className="text-gray-600 mt-1">Manage campaigns and promotions</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    New Campaign
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Active Campaigns',
                        value: activeCampaigns.toString(),
                        icon: Megaphone,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Total Budget',
                        value: `$${(totalBudget / 1000).toFixed(1)}K`,
                        icon: Target,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Total Conversions',
                        value: totalConversions.toString(),
                        icon: CheckCircle,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50'
                    },
                    {
                        title: 'Budget Spent',
                        value: `${((totalSpent / totalBudget) * 100).toFixed(0)}%`,
                        icon: TrendingUp,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Campaign Performance Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Campaign Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="reach" fill="#3b82f6" name="Reach" />
                            <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search campaigns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select data-testid="select-admin-franchise-marketing-1"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Campaigns List */}
            <div className="space-y-4">
                {campaigns.map((campaign, idx) => (
                    <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                                            <Badge variant={campaign.status === 'ACTIVE' ? 'default' : campaign.status === 'SCHEDULED' ? 'secondary' : 'outline'}>
                                                {campaign.status}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Type</p>
                                                <p className="text-sm font-medium text-gray-900">{campaign.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Discount</p>
                                                <p className="text-sm font-medium text-gray-900">{campaign.discount}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Reach</p>
                                                <p className="text-sm font-medium text-gray-900">{campaign.reach}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Conversions</p>
                                                <p className="text-sm font-medium text-gray-900">{campaign.conversions}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">ROI</p>
                                                <p className="text-sm font-medium text-green-600">{campaign.roi}%</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-600">Budget</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600"
                                                            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700">
                                                        ${campaign.spent}/${campaign.budget}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Duration</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {campaign.startDate} to {campaign.endDate}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">⚠️ {error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
