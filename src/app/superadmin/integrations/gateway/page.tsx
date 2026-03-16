'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import IntegrationGatewayService, { APIKey, RateLimit } from '@/services/modules/integration-gateway.service'
import { motion } from 'framer-motion'
import { Key, Plus, Trash2, AlertCircle, Shield, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function APIGatewayPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [apiKeys, setApiKeys] = useState<APIKey[]>([])
    const [rateLimits, setRateLimits] = useState<RateLimit[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadGatewayData()
    }, [isAuthenticated, router])

    const loadGatewayData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [keysRes, limitsRes] = await Promise.all([
                IntegrationGatewayService.getAPIKeys(),
                IntegrationGatewayService.getRateLimits()
            ])
            setApiKeys(keysRes)
            setRateLimits(limitsRes)
        } catch (err) {
            console.error('Error loading gateway data:', err)
            setError('Failed to load API gateway data')
        } finally {
            setLoading(false)
        }
    }

    const handleRevokeKey = async (keyId: string) => {
        if (!confirm('Are you sure you want to revoke this API key?')) return
        try {
            await IntegrationGatewayService.revokeAPIKey(keyId)
            await loadGatewayData()
        } catch (err) {
            console.error('Error revoking API key:', err)
            alert('Failed to revoke API key')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading API gateway...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">API Gateway</h1>
                    <p className="text-gray-600">Manage API keys and rate limits</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* API Keys Section */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="w-5 h-5 text-blue-600" />
                                    API Keys ({apiKeys.length})
                                </CardTitle>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create API Key
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {apiKeys.map((key) => (
                                    <div key={key.id} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{key.name}</p>
                                                <p className="text-sm font-mono text-gray-600">{key.key.substring(0, 20)}...</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:bg-red-50"
                                                onClick={() => handleRevokeKey(key.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Rate Limit</p>
                                                <p className="font-medium">{key.rateLimit}/min</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Last Used</p>
                                                <p className="font-medium">{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Expires</p>
                                                <p className="font-medium">{key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Rate Limits Section */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-600" />
                                Rate Limits ({rateLimits.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {rateLimits.map((limit) => (
                                    <div key={limit.id} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{limit.endpoint}</p>
                                                <p className="text-sm text-gray-600">{limit.limit} requests per {limit.window}</p>
                                            </div>
                                            <Badge className={`${limit.currentUsage / limit.limit < 0.7 ? 'bg-green-100 text-green-800' :
                                                    limit.currentUsage / limit.limit < 0.9 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {Math.round((limit.currentUsage / limit.limit) * 100)}% Used
                                            </Badge>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${limit.currentUsage / limit.limit < 0.7 ? 'bg-green-600' :
                                                        limit.currentUsage / limit.limit < 0.9 ? 'bg-yellow-600' :
                                                            'bg-red-600'
                                                    }`}
                                                style={{ width: `${(limit.currentUsage / limit.limit) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
