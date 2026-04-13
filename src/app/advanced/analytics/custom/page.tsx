'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AdvancedAnalyticsService, { AnalyticsQuery } from '@/services/modules/advanced-analytics.service'
import { motion } from 'framer-motion'
import { Play, Save, Code, AlertCircle, Table, List, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatAnalyticsResults } from '@/utils/formatAIResponse'

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
                                    <Button id="custom-analytics-execute-btn"
                                        onClick={handleExecute}
                                        disabled={executing || !query.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        {executing ? 'Executing...' : 'Execute'}
                                    </Button>
                                    <Button id="custom-analytics-save-btn" onClick={handleSave} variant="outline" disabled={!query.trim()}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Query
                                    </Button>
                                </div>

                                {results && (() => {
                                    const formatted = formatAnalyticsResults(results)
                                    return (
                                        <div className="mt-6">
                                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                {formatted.type === 'table' ? <Table className="w-4 h-4 text-blue-600" /> : formatted.type === 'list' ? <List className="w-4 h-4 text-blue-600" /> : <BarChart3 className="w-4 h-4 text-blue-600" />}
                                                Results
                                            </h3>
                                            <div className="bg-gray-50 rounded-lg overflow-auto max-h-96">
                                                {formatted.type === 'table' && formatted.headers && formatted.rows ? (
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gray-100 sticky top-0">
                                                            <tr>
                                                                {formatted.headers.map((h, i) => (
                                                                    <th key={i} className="px-4 py-2 text-left font-medium text-gray-700 border-b">{h}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {formatted.rows.map((row, i) => (
                                                                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                    {row.map((cell, j) => (
                                                                        <td key={j} className="px-4 py-2 text-gray-600 border-b border-gray-100">{cell}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : formatted.type === 'list' && formatted.items ? (
                                                    <ul className="p-4 space-y-1">
                                                        {formatted.items.map((item, i) => (
                                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                                <span className="text-blue-500 mt-1">•</span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : formatted.summary ? (
                                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {formatted.summary.map((item, i) => (
                                                            <div key={i} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                                                                <span className="text-sm font-medium text-gray-600">{item.label}</span>
                                                                <span className="text-sm text-gray-900 font-semibold">{item.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    )
                                })()}
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
                                        <div id={`custom-analytics-saved-query-${sq.id}-item`}
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
