'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ObservabilityService from '@/services/modules/observability.service'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AlertsPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [alerts, setAlerts] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadAlerts()
    }, [isAuthenticated, router])

    const loadAlerts = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await ObservabilityService.getAlerts()
            setAlerts(response || [])
        } catch (err) {
            console.error('Error loading alerts:', err)
            setError('Failed to load alerts')
        } finally {
            setLoading(false)
        }
    }

    const handleAcknowledge = async (alertId: string) => {
        try {
            await ObservabilityService.acknowledgeAlert(alertId)
            loadAlerts()
        } catch (err) {
            console.error('Error acknowledging alert:', err)
        }
    }

    if (!isAuthenticated) return null
    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">System Alerts</h1>
                {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><p className="text-red-800">{error}</p></div>}
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Active Alerts ({alerts.length})</CardTitle></CardHeader><CardContent><div className="space-y-3">{alerts.map((alert: any) => (<div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div><h3 className="font-semibold text-gray-900">{alert.title}</h3><p className="text-sm text-gray-600">{alert.message}</p></div><div className="flex gap-2"><Badge className={alert.type === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>{alert.type}</Badge><button onClick={() => handleAcknowledge(alert.id)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Acknowledge</button></div></div>))}</div></CardContent></Card>
            </div>
        </div>
    )
}
