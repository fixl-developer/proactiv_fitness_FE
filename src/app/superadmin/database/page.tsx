'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SystemAnalyticsService from '@/services/modules/system-analytics.service'
import { Database, Activity, HardDrive, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DatabasePage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dbAnalytics, setDbAnalytics] = useState<any>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadDatabaseData()
    }, [isAuthenticated, router])

    const loadDatabaseData = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await SystemAnalyticsService.getDatabaseAnalytics()
            setDbAnalytics(response)
        } catch (err) {
            console.error('Error loading database data:', err)
            setError('Failed to load database data')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null
    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Database Management</h1>
                {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><p className="text-red-800">{error}</p></div>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Collections</p><p className="text-3xl font-bold text-gray-900 mt-2">{dbAnalytics?.collections || 0}</p></div><Database className="w-12 h-12 text-blue-500 opacity-20" /></div></CardContent></Card><Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Documents</p><p className="text-3xl font-bold text-gray-900 mt-2">{dbAnalytics?.documents?.toLocaleString() || '0'}</p></div><Activity className="w-12 h-12 text-green-500 opacity-20" /></div></CardContent></Card><Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Storage Used</p><p className="text-3xl font-bold text-gray-900 mt-2">{dbAnalytics?.storage || '0 GB'}</p></div><HardDrive className="w-12 h-12 text-purple-500 opacity-20" /></div></CardContent></Card></div>
            </div>
        </div>
    )
}
