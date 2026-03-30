'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import {
    Megaphone, Target, TrendingUp, Users, Mail,
    Plus, Edit2, Eye, Play, Pause, BarChart3, Calendar,
    MousePointer, Award, ExternalLink, AlertCircle,
    Brain, Loader2, RefreshCw, Sparkles, Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { contentEngineService } from '@/services/advancedAIServices'
import { apiClient } from '@/services/api/client'

export default function PartnerMarketingPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [leads, setLeads] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('campaigns')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createSubmitting, setCreateSubmitting] = useState(false)
    const [createForm, setCreateForm] = useState({
        name: '',
        type: 'Email',
        status: 'ACTIVE',
        startDate: '',
        endDate: '',
        budget: '',
        targetAudience: '',
        description: '',
    })

    const [aiContent, setAiContent] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const loadAiMarketing = async () => {
        setAiLoading(true)
        try {
            const [socialRes, emailRes] = await Promise.allSettled([
                contentEngineService.generateSocialPost({ topic: 'partner program promotions', platform: 'instagram' }),
                contentEngineService.generateEmail({ type: 'promotional', audience: 'parents', subject: 'New programs available' }),
            ])
            setAiContent({
                social: socialRes.status === 'fulfilled' ? socialRes.value?.data || socialRes.value : null,
                email: emailRes.status === 'fulfilled' ? emailRes.value?.data || emailRes.value : null,
            })
        } catch (err) { console.error('AI marketing unavailable:', err) }
        finally { setAiLoading(false) }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        fetchMarketingData()
        loadAiMarketing()
    }, [isAuthenticated, router])

    const fetchMarketingData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const partnerId = user?.id || 'partner-1'
            const [campaignsRes, leadsRes] = await Promise.all([
                PartnerPortalService.getMarketingCampaigns(partnerId),
                PartnerPortalService.getMarketingLeads(partnerId)
            ])

            setCampaigns((campaignsRes?.campaigns || []).map((c: any) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                status: c.status?.toUpperCase() || 'ACTIVE',
                startDate: c.startDate,
                endDate: c.endDate,
                budget: c.budget || 0,
                spent: c.spent || 0,
                impressions: c.impressions || 0,
                clicks: c.clicks || 0,
                conversions: c.conversions || 0,
                ctr: c.clicks && c.impressions ? parseFloat(((c.clicks / c.impressions) * 100).toFixed(2)) : 0,
                conversionRate: c.clicks && c.conversions ? parseFloat(((c.conversions / c.clicks) * 100).toFixed(2)) : 0,
                roi: c.roi || 0
            })))

            setLeads((leadsRes?.leads || []).map((l: any) => ({
                id: l.id,
                name: l.name,
                email: l.email,
                phone: l.phone,
                source: l.source,
                status: l.interestLevel?.toUpperCase() === 'HIGH' ? 'HOT' : l.interestLevel?.toUpperCase() === 'MEDIUM' ? 'WARM' : 'COLD',
                score: l.interestLevel === 'high' ? 92 : l.interestLevel === 'medium' ? 65 : 30,
                interest: l.status,
                lastContact: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'N/A',
                nextFollowUp: l.createdAt ? new Date(new Date(l.createdAt).getTime() + 172800000).toLocaleDateString() : 'N/A'
            })))
        } catch (err) {
            console.error('Error fetching marketing data:', err)
            setError('Failed to load marketing data')
        } finally {
            setIsLoading(false)
        }
    }

    const campaignPerformance = campaigns.map(c => ({
        month: c.name?.substring(0, 6) || 'N/A',
        impressions: c.impressions,
        clicks: c.clicks,
        conversions: c.conversions
    }))

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

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!createForm.name.trim()) return

        setCreateSubmitting(true)
        try {
            const partnerId = user?.id || 'partner-1'
            await PartnerPortalService.createMarketingCampaign?.(partnerId, createForm)
        } catch {
            // API may not exist yet, continue with local add
        }

        const newCampaign = {
            id: `camp-${Date.now()}`,
            name: createForm.name,
            type: createForm.type,
            status: createForm.status,
            startDate: createForm.startDate,
            endDate: createForm.endDate,
            budget: Number(createForm.budget) || 0,
            spent: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            ctr: 0,
            conversionRate: 0,
            roi: 0,
        }
        setCampaigns(prev => [...prev, newCampaign])
        setShowCreateModal(false)
        setCreateForm({ name: '', type: 'Email', status: 'ACTIVE', startDate: '', endDate: '', budget: '', targetAudience: '', description: '' })
        setCreateSubmitting(false)
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
                <button id="partner-marketing-create-campaign-btn" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" />
                    Create Campaign
                </button>
            </div>

            {/* Marketing Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Active Campaigns',
                        value: String(campaigns.filter(c => c.status === 'ACTIVE').length),
                        icon: Megaphone,
                        gradient: 'from-blue-500 to-blue-600',
                        bgGradient: 'from-blue-50 to-blue-100',
                        badge: `${campaigns.length} total`
                    },
                    {
                        title: 'Total Leads',
                        value: String(leads.length),
                        icon: Users,
                        gradient: 'from-emerald-500 to-emerald-600',
                        bgGradient: 'from-emerald-50 to-emerald-100',
                        badge: leads.filter(l => l.status === 'HOT').length > 0 ? `${leads.filter(l => l.status === 'HOT').length} hot` : 'No hot leads'
                    },
                    {
                        title: 'Conversion Rate',
                        value: campaigns.length > 0
                            ? `${(campaigns.reduce((sum, c) => sum + (c.conversionRate || 0), 0) / campaigns.length).toFixed(1)}%`
                            : '0%',
                        icon: Target,
                        gradient: 'from-purple-500 to-purple-600',
                        bgGradient: 'from-purple-50 to-purple-100',
                        badge: 'Avg across campaigns'
                    },
                    {
                        title: 'Marketing ROI',
                        value: campaigns.length > 0
                            ? `${Math.round(campaigns.reduce((sum, c) => sum + (c.roi || 0), 0) / campaigns.length)}%`
                            : '0%',
                        icon: TrendingUp,
                        gradient: 'from-amber-500 to-orange-600',
                        bgGradient: 'from-amber-50 to-orange-100',
                        badge: 'Return on investment'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">{metric.badge}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* AI Marketing Assistant */}
            <Card className="border-purple-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <CardTitle className="text-base">AI Marketing Assistant</CardTitle>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                        </div>
                        <button onClick={loadAiMarketing} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                            <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {aiLoading ? (
                        <div className="flex items-center justify-center py-6 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            <p className="text-sm text-gray-500">AI generating marketing content...</p>
                        </div>
                    ) : aiContent ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiContent.social && (
                                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-4 h-4 text-indigo-600" />
                                        <span className="text-xs font-semibold text-indigo-700 uppercase">AI Social Post</span>
                                    </div>
                                    <p className="text-sm text-gray-800">{aiContent.social.content || aiContent.social.body || aiContent.social.post || JSON.stringify(aiContent.social).slice(0, 200)}</p>
                                    {aiContent.social.hashtags && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {(Array.isArray(aiContent.social.hashtags) ? aiContent.social.hashtags : []).map((tag: string, i: number) => (
                                                <span key={i} className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">#{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {aiContent.email && (
                                <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail className="w-4 h-4 text-rose-600" />
                                        <span className="text-xs font-semibold text-rose-700 uppercase">AI Email Draft</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-700 mb-1">Subject: {aiContent.email.subject || aiContent.email.title || 'Generated email'}</p>
                                    <p className="text-sm text-gray-800">{(aiContent.email.body || aiContent.email.content || '').substring(0, 200)}...</p>
                                    {aiContent.email.callToAction && (
                                        <Badge className="mt-2 bg-rose-100 text-rose-700 text-xs">CTA: {aiContent.email.callToAction}</Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <Brain className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">AI marketing tools unavailable</p>
                            <button onClick={loadAiMarketing} className="mt-1 text-xs text-purple-600 hover:underline">Generate Content</button>
                        </div>
                    )}
                </CardContent>
            </Card>

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
                    <button id={`partner-marketing-tab-${tab.id}-btn`}
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
                                            <button id={`partner-marketing-view-campaign-${campaign.id}-btn`}
                                                onClick={() => handleCampaignAction(campaign.id, 'view')}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button id={`partner-marketing-edit-campaign-${campaign.id}-btn`}
                                                onClick={() => handleCampaignAction(campaign.id, 'edit')}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button id={`partner-marketing-toggle-campaign-${campaign.id}-btn`}
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
                                            <button id={`partner-marketing-call-lead-${lead.id}-btn`}
                                                onClick={() => handleLeadAction(lead.id, 'call')}
                                                className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                            >
                                                <MousePointer className="w-4 h-4" />
                                            </button>
                                            <button id={`partner-marketing-email-lead-${lead.id}-btn`}
                                                onClick={() => handleLeadAction(lead.id, 'email')}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>
                                            <button id={`partner-marketing-schedule-lead-${lead.id}-btn`}
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

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Create New Campaign</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                                <AlertCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.name}
                                    onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Summer Fitness Promo"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={createForm.description}
                                    onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief description of the campaign"
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                                    <select
                                        value={createForm.type}
                                        onChange={e => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="Email">Email</option>
                                        <option value="Social Media">Social Media</option>
                                        <option value="PPC">PPC (Pay Per Click)</option>
                                        <option value="Content">Content Marketing</option>
                                        <option value="Referral">Referral</option>
                                        <option value="SMS">SMS</option>
                                        <option value="Display">Display Ads</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={createForm.status}
                                        onChange={e => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="SCHEDULED">Scheduled</option>
                                        <option value="PAUSED">Paused</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={createForm.startDate}
                                        onChange={e => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={createForm.endDate}
                                        onChange={e => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={createForm.budget}
                                        onChange={e => setCreateForm(prev => ({ ...prev, budget: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                    <input
                                        type="text"
                                        value={createForm.targetAudience}
                                        onChange={e => setCreateForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                                        placeholder="e.g., Parents, Athletes"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createSubmitting || !createForm.name.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {createSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Create Campaign
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
