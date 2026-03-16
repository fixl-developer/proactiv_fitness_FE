'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ObservabilityService from '@/services/modules/observability.service'
import { AlertTriangle, Plus, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function IncidentsPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [incidents, setIncidents] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadIncidents()
    }, [isAuthenticated, router])

    const loadIncidents = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await ObservabilityService.getIncidents()
            setIncidents(response || [])
        } catch (err) {
            console.error('Error loading incidents:', err)
            setError('Failed to load incidents')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) return null
    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8"><h1 className="text-4xl font-bold text-gray-900">Incidents</h1><button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-5 h-5" />Create Incident</button></div>
                {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><p className="text-red-800">{error}</p></div>}
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" />All Incidents ({incidents.length})</CardTitle></CardHeader><CardContent><div className="space-y-3">{incidents.map((incident: any) => (<div key={incident.id} className="p-4 bg-gray-50 rounded-lg"><div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-gray-900">{incident.title}</h3><Badge className={incident.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>{incident.severity}</Badge></div><p className="text-sm text-gray-600">{incident.description}</p><p className="text-xs text-gray-500 mt-2">Created: {incident.createdAt}</p></div>))}</div></CardContent></Card>
            </div>
        </div>
    )
}
