'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CampaignManagementService, { Campaign } from '@/services/modules/campaign-management.service'
import { AlertCircle, Edit, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function CampaignDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [campaign, setCampaign] = useState<Campaign | null>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        if (params.id) {
            loadCampaign(params.id as string)
        }
    }, [isAuthenticated, router, params.id])

    const loadCampaign = async (campaignId: string) => {
        try {
            setLoading(true)
            setError(null)
            const response = await CampaignManagementService.getCampaignById(campaignId)
            setCampaign(response)
        } catch (err) {
            console.error('Error loading campaign:', err)
            setError('Failed to load campaign')
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
                    <p className="text-gray-600">Loading campaign...</p>
                </div>
            </div>
        )
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">Campaign not found</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
                        <p className="text-gray-600">{campaign.description}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button id="marketing-campaigns-id-btn" variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button id="marketing-campaigns-id-btn-2" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-600">Status</p>
                            <Badge className={`${campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                    campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                        'bg-blue-100 text-blue-800'
                                }`}>
                                {campaign.status}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-600">Budget</p>
                            <p className="text-3xl font-bold mt-2">${campaign.budget}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-gray-600">Spent</p>
                            <p className="text-3xl font-bold mt-2">${campaign.spent}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Type</p>
                                <p className="text-gray-900 capitalize">{campaign.type}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Audience Size</p>
                                <p className="text-gray-900">{campaign.audience.totalSize.toLocaleString()} users</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Created</p>
                                <p className="text-gray-900">{new Date(campaign.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
