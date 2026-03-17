'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import FeatureFlagsService, { FeatureFlag } from '@/services/modules/feature-flags.service'
import { motion } from 'framer-motion'
import { Flag, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function FeatureFlagsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [flags, setFlags] = useState<FeatureFlag[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadFlags()
    }, [isAuthenticated, router])

    const loadFlags = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await FeatureFlagsService.getFeatureFlags()
            setFlags(response)
        } catch (err) {
            console.error('Error loading feature flags:', err)
            setError('Failed to load feature flags')
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (flagId: string, enabled: boolean) => {
        try {
            await FeatureFlagsService.toggleFeatureFlag(flagId, enabled)
            await loadFlags()
        } catch (err) {
            console.error('Error toggling flag:', err)
            alert('Failed to toggle feature flag')
        }
    }

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading feature flags...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Feature Flags</h1>
                        <p className="text-gray-600">Manage feature toggles and rollouts</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Flag
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    {flags.map((flag, idx) => (
                        <motion.div
                            key={flag.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <Flag className="w-8 h-8 text-blue-600" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">{flag.name}</h3>
                                                    <Badge className={`${flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {flag.enabled ? 'Enabled' : 'Disabled'}
                                                    </Badge>
                                                    <Badge className="bg-blue-100 text-blue-800">
                                                        {flag.rolloutPercentage}% Rollout
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                                                <p className="text-xs text-gray-500">Key: {flag.key}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={flag.enabled}
                                                    onChange={(e) => handleToggle(flag.id, e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                            <Button size="sm" variant="outline">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {flags.length === 0 && (
                    <div className="text-center py-12">
                        <Flag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No feature flags configured</p>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Flag
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
