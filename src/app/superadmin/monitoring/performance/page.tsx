'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ObservabilityService from '@/services/modules/observability.service'
import { TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PerformancePage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadPerformanceData()
    }, [isAuthenticated, router])

    const loadPerformanceData = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await ObservabilityService.getPerformanceMetrics()
            setMetrics(response || [])
        } catch (err) {
            console.error('Error loading performance data:', err)
            setError('Failed to load performance data')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null
    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Performance Metrics</h1>
                {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><p className="text-red-800">{error}</p></div>}
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Response Time Trends</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><LineChart data={metrics}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="timestamp" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="responseTime" stroke="#3b82f6" /></LineChart></ResponsiveContainer></CardContent></Card>
            </div>
        </div>
    )
}
