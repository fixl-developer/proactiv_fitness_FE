'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CampaignManagementService from '@/services/modules/campaign-management.service'
import { AlertCircle, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CampaignBuilderPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [campaignName, setCampaignName] = useState('')
    const [campaignType, setCampaignType] = useState('email')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        setLoading(false)
    }, [isAuthenticated, router])

    const handleSave = async () => {
        if (!campaignName.trim()) {
            alert('Please enter a campaign name')
            return
        }
        try {
            setSaving(true)
            await CampaignManagementService.createCampaign({
                name: campaignName,
                type: campaignType as any,
                description: `${campaignType} campaign`,
                status: 'draft',
                budget: 0,
                spent: 0,
                audience: { totalSize: 0, segments: [], filters: {} }
            })
            alert('Campaign created successfully')
            router.push('/marketing/campaigns')
        } catch (err) {
            console.error('Error saving campaign:', err)
            setError('Failed to save campaign')
        } finally {
            setSaving(false)
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Campaign Builder</h1>
                    <p className="text-gray-600">Create a new marketing campaign</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                                <input
                                    type="text"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    placeholder="Enter campaign name..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
                                <select data-testid="select-marketing-campaigns-builder-3"
                                    value={campaignType}
                                    onChange={(e) => setCampaignType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="email">Email</option>
                                    <option value="sms">SMS</option>
                                    <option value="social">Social Media</option>
                                    <option value="push">Push Notification</option>
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <Button data-testid="btn-save-marketing-campaigns-builder" onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Campaign'}
                                </Button>
                                <Button data-testid="btn-router-marketing-campaigns-builder" variant="outline" onClick={() => router.push('/marketing/campaigns')}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
