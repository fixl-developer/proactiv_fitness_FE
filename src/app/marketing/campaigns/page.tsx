'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CampaignManagementService, { Campaign } from '@/services/modules/campaign-management.service'
import { motion } from 'framer-motion'
import { Megaphone, Plus, Play, Pause, Trash2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function CampaignsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [campaigns, setCampaigns] = useState<Campaign[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadCampaigns()
    }, [isAuthenticated, router])

    const loadCampaigns = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await CampaignManagementService.getCampaigns()
            setCampaigns(response)
        } catch (err) {
            console.error('Error loading campaigns:', err)
            setError('Failed to load campaigns')
        } finally {
            setLoading(false)
        }
    }

    const handleLaunch = async (campaignId: string) => {
        try {
            await CampaignManagementService.launchCampaign(campaignId)
            await loadCampaigns()
        } catch (err) {
            console.error('Error launching campaign:', err)
            alert('Failed to launch campaign')
        }
    }

    const handlePause = async (campaignId: string) => {
        try {
            await CampaignManagementService.pauseCampaign(campaignId)
            await loadCampaigns()
        } catch (err) {
            console.error('Error pausing campaign:', err)
            alert('Failed to pause campaign')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading campaigns...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Campaigns</h1>
                        <p className="text-gray-600">Manage marketing campaigns</p>
                    </div>
                    <Button id="campaigns-create-campaign-btn" onClick={() => router.push('/marketing/campaigns/builder')} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Campaign
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {campaigns.map((campaign, idx) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <Megaphone className="w-10 h-10 text-blue-600" />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{campaign.name}</h3>
                                                <p className="text-sm text-gray-600">{campaign.description}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span>Budget: ${campaign.budget}</span>
                                                    <span>•</span>
                                                    <span>Spent: ${campaign.spent}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={`${campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {campaign.status}
                                            </Badge>
                                            {campaign.status === 'draft' && (
                                                <Button id={`campaigns-launch-${campaign.id}-btn`} size="sm" variant="outline" onClick={() => handleLaunch(campaign.id)}>
                                                    <Play className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {campaign.status === 'active' && (
                                                <Button id={`campaigns-pause-${campaign.id}-btn`} size="sm" variant="outline" onClick={() => handlePause(campaign.id)}>
                                                    <Pause className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button id={`campaigns-delete-${campaign.id}-btn`} size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {campaigns.length === 0 && (
                    <div className="text-center py-12">
                        <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No campaigns yet</p>
                        <Button id="campaigns-create-first-campaign-btn" onClick={() => router.push('/marketing/campaigns/builder')} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Campaign
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
