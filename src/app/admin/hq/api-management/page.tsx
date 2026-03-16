'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Copy, Eye, EyeOff, Trash2, Plus, Key, Zap, TrendingUp } from 'lucide-react'
import { HQAdminService } from '@/services/hqAdminService'

export default function APIManagementPage() {
    const [apiKeys, setApiKeys] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showNewKeyForm, setShowNewKeyForm] = useState(false)
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
    const [newKeyName, setNewKeyName] = useState('')

    useEffect(() => {
        fetchAPIKeys()
    }, [])

    const fetchAPIKeys = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Will call backend when available
            const data = await HQAdminService.getAPIKeys?.()
            setApiKeys(data || getMockAPIKeys())
        } catch (err: any) {
            console.error('Error fetching API keys:', err)
            setError(err.message)
            setApiKeys(getMockAPIKeys())
        } finally {
            setIsLoading(false)
        }
    }

    const getMockAPIKeys = () => [
        {
            id: 1,
            name: 'Production API Key',
            key: 'process.env.NEXT_PUBLIC_STRIPE_LIVE_KEY',
            status: 'active',
            created: '2026-01-15',
            lastUsed: '2 hours ago',
            requests: 125430,
            rateLimit: '10000/hour',
        },
        {
            id: 2,
            name: 'Development API Key',
            key: 'process.env.NEXT_PUBLIC_STRIPE_TEST_KEY',
            status: 'active',
            created: '2026-02-01',
            lastUsed: '30 min ago',
            requests: 45230,
            rateLimit: '1000/hour',
        },
        {
            id: 3,
            name: 'Testing API Key',
            key: 'process.env.NEXT_PUBLIC_STRIPE_TEST_KEY_2',
            status: 'inactive',
            created: '2026-01-01',
            lastUsed: '1 month ago',
            requests: 5420,
            rateLimit: '100/hour',
        },
    ]

    const handleCreateKey = async () => {
        if (!newKeyName.trim()) {
            alert('Please enter a key name')
            return
        }
        try {
            await HQAdminService.createAPIKey?.(newKeyName)
            setNewKeyName('')
            setShowNewKeyForm(false)
            fetchAPIKeys()
        } catch (err: any) {
            alert('Failed to create API key: ' + err.message)
        }
    }

    const handleDeleteKey = async (id: number) => {
        if (confirm('Are you sure you want to delete this API key?')) {
            try {
                await HQAdminService.deleteAPIKey?.(id)
                setApiKeys(apiKeys.filter(k => k.id !== id))
            } catch (err: any) {
                alert('Failed to delete API key: ' + err.message)
            }
        }
    }

    const toggleKeyVisibility = (id: number) => {
        const newVisible = new Set(visibleKeys)
        if (newVisible.has(id.toString())) {
            newVisible.delete(id.toString())
        } else {
            newVisible.add(id.toString())
        }
        setVisibleKeys(newVisible)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
    }

    const maskKey = (key: string) => {
        return key.substring(0, 10) + '...' + key.substring(key.length - 10)
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
                    <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
                    <p className="text-gray-600 mt-1">Manage API keys and rate limiting</p>
                </div>
                <button
                    onClick={() => setShowNewKeyForm(!showNewKeyForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create API Key
                </button>
            </div>

            {/* Create New Key Form */}
            {showNewKeyForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Name</label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="e.g., Production API Key"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateKey}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Create Key
                                    </button>
                                    <button
                                        onClick={() => setShowNewKeyForm(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* API Keys List */}
            <div className="space-y-4">
                {apiKeys.map((apiKey, idx) => (
                    <motion.div
                        key={apiKey.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <Key className="w-6 h-6 text-blue-600 mt-1" />
                                        <div>
                                            <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">Created: {apiKey.created}</p>
                                        </div>
                                    </div>
                                    <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                                        {apiKey.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* API Key Display */}
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-2">API Key</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-sm font-mono text-gray-900 break-all">
                                                {visibleKeys.has(apiKey.id.toString()) ? apiKey.key : maskKey(apiKey.key)}
                                            </code>
                                            <button
                                                onClick={() => toggleKeyVisibility(apiKey.id)}
                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                {visibleKeys.has(apiKey.id.toString()) ? (
                                                    <EyeOff className="w-4 h-4 text-gray-600" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-gray-600" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(apiKey.key)}
                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                <Copy className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="text-xs text-gray-600">Requests</p>
                                            <p className="text-lg font-bold text-gray-900 mt-1">{(apiKey.requests / 1000).toFixed(1)}K</p>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="text-xs text-gray-600">Rate Limit</p>
                                            <p className="text-sm font-bold text-gray-900 mt-1">{apiKey.rateLimit}</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <p className="text-xs text-gray-600">Last Used</p>
                                            <p className="text-sm font-bold text-gray-900 mt-1">{apiKey.lastUsed}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                            View Usage
                                        </button>
                                        <button
                                            onClick={() => handleDeleteKey(apiKey.id)}
                                            className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {apiKeys.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No API keys created yet</p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ {error} - Showing mock data for development
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
