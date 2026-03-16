'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import IntegrationManagementService, { Integration } from '@/services/modules/integration-management.service'
import { motion } from 'framer-motion'
import { Store, AlertCircle, Download, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function MarketplacePage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [marketplace, setMarketplace] = useState<Integration[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadMarketplace()
    }, [isAuthenticated, router])

    const loadMarketplace = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await IntegrationManagementService.getMarketplace()
            setMarketplace(response)
        } catch (err) {
            console.error('Error loading marketplace:', err)
            setError('Failed to load marketplace')
        } finally {
            setLoading(false)
        }
    }

    const handleInstall = async (integrationId: string) => {
        try {
            await IntegrationManagementService.installIntegration(integrationId)
            alert('Integration installed successfully')
            router.push('/integrations')
        } catch (err) {
            console.error('Error installing integration:', err)
            alert('Failed to install integration')
        }
    }

    const filteredMarketplace = marketplace.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading marketplace...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Integration Marketplace</h1>
                        <p className="text-gray-600">Discover and install integrations</p>
                    </div>
                    <Button onClick={() => router.push('/integrations')} variant="outline">
                        Back to Integrations
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Search integrations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMarketplace.map((integration, idx) => (
                        <motion.div
                            key={integration.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                                <CardContent className="pt-6 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Store className="w-8 h-8 text-blue-600" />
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                                                <p className="text-xs text-gray-600">{integration.category}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-600">(4.8)</span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <span>v{integration.version}</span>
                                        <span>1.2K installs</span>
                                    </div>
                                </CardContent>

                                <div className="border-t pt-4">
                                    <Button
                                        onClick={() => handleInstall(integration.id)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Install
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredMarketplace.length === 0 && (
                    <div className="text-center py-12">
                        <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No integrations found</p>
                    </div>
                )}
            </div>
        </div>
    )
}
