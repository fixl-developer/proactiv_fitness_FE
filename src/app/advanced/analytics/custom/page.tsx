'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AdvancedAnalyticsService, { AnalyticsQuery } from '@/services/modules/advanced-analytics.service'
import { motion } from 'framer-motion'
import { Play, Save, Code, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CustomAnalyticsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any>(null)
    const [savedQueries, setSavedQueries] = useState<AnalyticsQuery[]>([])
    const [executing, setExecuting] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadSavedQueries()
    }, [isAuthenticated, router])

    const loadSavedQueries = async () => {
        try {
            setLoading(true)
            const response = await AdvancedAnalyticsService.getSavedQueries()
            setSavedQueries(response)
        } catch (err) {
            console.error('Error loading queries:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleExecute = async () => {
        if (!query.trim()) return
        try {
            setExecuting(true)
            setError(null)
            const response = await AdvancedAnalyticsService.executeQuery(query)
            setResults(response)
        } catch (err) {
            console.error('Error executing query:', err)
            setError('Failed to execute query')
        } finally {
            setExecuting(false)
        }
    }

    const handleSave = async () => {
        if (!query.trim()) return
        try {
            await AdvancedAnalyticsService.saveQuery({ name: 'Custom Query', query })
            await loadSavedQueries()
            alert('Query saved successfully')
        } catch (err) {
            console.error('Error saving query:', err)
            alert('Failed to save query')
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
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Custom Analytics</h1>
                    <p className="text-gray-600">Build and execute custom analytics queries</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Code className="w-5 h-5 text-blue-600" />
                                    Query Builder
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <textarea
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Enter your analytics query..."
                                    className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                />
                                <div className="flex gap-3 mt-4">
                                    <Button
                                        onClick={handleExecute}
                                        disabled={executing || !query.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        {executing ? 'Executing...' : 'Execute'}
                                    </Button>
                                    <Button data-testid="btn-save-advanced-analytics-custom" onClick={handleSave} variant="outline" disabled={!query.trim()}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Query
                                    </Button>
                                </div>

                                {results && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold mb-3">Results</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                                            <pre className="text-sm">{JSON.stringify(results, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Saved Queries</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {savedQueries.map((sq) => (
                                        <div
                                            key={sq.id}
                                            onClick={() => setQuery(sq.query)}
                                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <p className="font-medium text-sm">{sq.name}</p>
                                            <p className="text-xs text-gray-600 mt-1">{new Date(sq.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                    {savedQueries.length === 0 && (
                                        <p className="text-sm text-gray-600 text-center py-4">No saved queries</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
