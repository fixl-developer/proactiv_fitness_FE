'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import {
    Megaphone, Target, TrendingUp, Users, Mail,
    Plus, Edit2, Eye, Play, Pause, BarChart3, Calendar,
    MousePointer, Award, ExternalLink, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PartnerMarketingPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [leads, setLeads] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('campaigns')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        fetchMarketingData()
    }, [isAuthenticated, router])

    const fetchMarketingData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const partnerId = user?.id || 'partner-1'
            const response = await PartnerPortalService.getPartnerProfile(partnerId)

            setCampaigns([
                {
                    id: '1',
                    name: 'Spring Enrollment Drive',
                    type: 'Email Campaign',
                    status: 'ACTIVE',
                    startDate: '2024-03-01',
                    endDate: '2024-04-30',
                    budget: 2500,
                    spent: 1850,
                    impressions: 45000,
                    clicks: 1200,
                    conversions: 85,
                    ctr: 2.67,
                    conversionRate: 7.08,
                    roi: 340
                }
            ])

            setLeads([
                {
                    id: '1',
                    name: 'Sarah Johnson',
                    email: 'sarah.johnson@email.com',
                    phone: '+1 555-0123',
                    source: 'Spring Enrollment Drive',
                    status: 'HOT',
                    score: 92,
                    interest: 'Elementary Gymnastics',
                    lastContact: '2024-03-14',
                    nextFollowUp: '2024-03-16'
                }
            ])
        } catch (err) {
            console.error('Error fetching marketing data:', err)
            setError('Failed to load marketing data')
        } finally {
            setIsLoading(false)
        }
    }
    const campaignPerformance = [
        { month: 'Jan', impressions: 32000, clicks: 960, conversions: 48 },
        { month: 'Feb', impressions: 28000, clicks: 850, conversions: 42 },
        { month: 'Mar', impressions: 45000, clicks: 1200, conversions: 85 },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800'
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
            case 'COMPLETED': return 'bg-gray-100 text-gray-800'
            case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
            case 'HOT': return 'bg-red-100 text-red-800'
            case 'WARM': return 'bg-yellow-100 text-yellow-800'
            case 'COLD': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const handleCampaignAction = (campaignId: string, action: string) => {
        alert(`${action} campaign ${campaignId}`)
    }

    const handleLeadAction = (leadId: string, action: string) => {
        alert(`${action} lead ${leadId}`)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Marketing Tools</h1>
                    <p className="text-gray-600 mt-1">Manage campaigns and track lead generation</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Create Campaign
                </button>
            </div>

            {/* Marketing Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Active Campaigns',
                        value: '1',
                        icon: Megaphone,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Total Leads',
                        value: '127',
                        icon: Users,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Conversion Rate',
                        value: '6.2%',
                        icon: Target,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50'
                    },
                    {
                        title: 'Marketing ROI',
                        value: '320%',
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
                        <Card className="hover:shadow-lg transition-shadow">
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
                        Campaign Performance Trends
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={campaignPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" />
                            <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
                            <Bar dataKey="conversions" fill="#f59e0b" name="Conversions" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            {/* Tabs Navigation */}
            <div className="flex gap-2 border-b border-gray-200">
                {[
                    { id: 'campaigns', name: 'Campaigns', icon: Megaphone },
                    { id: 'leads', name: 'Lead Management', icon: Users },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === tab.id
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
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
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                                                <Badge className={getStatusColor(campaign.status)}>
                                                    {campaign.status}
                                                </Badge>
                                                <Badge variant="outline">{campaign.type}</Badge>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-600">Budget</p>
                                                    <p className="text-sm font-medium text-gray-900">${campaign.budget}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Spent</p>
                                                    <p className="text-sm font-medium text-gray-900">${campaign.spent}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Impressions</p>
                                                    <p className="text-sm font-medium text-gray-900">{campaign.impressions.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Clicks</p>
                                                    <p className="text-sm font-medium text-gray-900">{campaign.clicks.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-600">CTR</p>
                                                    <p className="text-sm font-medium text-gray-900">{campaign.ctr}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Conversions</p>
                                                    <p className="text-sm font-medium text-gray-900">{campaign.conversions}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Conv. Rate</p>
                                                    <p className="text-sm font-medium text-gray-900">{campaign.conversionRate}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">ROI</p>
                                                    <p className="text-sm font-medium text-green-600">{campaign.roi}%</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>Start: {campaign.startDate}</span>
                                                <span>End: {campaign.endDate}</span>
                                                {campaign.budget > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <span>Budget Usage:</span>
                                                        <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2 w-20" />
                                                        <span>{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleCampaignAction(campaign.id, 'view')}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCampaignAction(campaign.id, 'edit')}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCampaignAction(campaign.id, campaign.status === 'ACTIVE' ? 'pause' : 'play')}
                                                className={`p-2 rounded-lg transition-colors ${campaign.status === 'ACTIVE'
                                                    ? 'hover:bg-yellow-50 text-yellow-600'
                                                    : 'hover:bg-green-50 text-green-600'
                                                    }`}
                                            >
                                                {campaign.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Leads Tab */}
            {activeTab === 'leads' && (
                <div className="space-y-4">
                    {leads.map((lead, idx) => (
                        <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                                                <Badge className={getStatusColor(lead.status)}>
                                                    {lead.status}
                                                </Badge>
                                                <div className="flex items-center gap-1">
                                                    <Award className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-sm font-medium text-gray-700">{lead.score}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-600">Email</p>
                                                    <p className="text-sm font-medium text-gray-900">{lead.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Phone</p>
                                                    <p className="text-sm font-medium text-gray-900">{lead.phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Source</p>
                                                    <p className="text-sm font-medium text-gray-900">{lead.source}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600">Interest</p>
                                                    <p className="text-sm font-medium text-gray-900">{lead.interest}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>Last Contact: {lead.lastContact}</span>
                                                <span>Next Follow-up: {lead.nextFollowUp}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleLeadAction(lead.id, 'call')}
                                                className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                            >
                                                <MousePointer className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleLeadAction(lead.id, 'email')}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleLeadAction(lead.id, 'schedule')}
                                                className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors"
                                            >
                                                <Calendar className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
