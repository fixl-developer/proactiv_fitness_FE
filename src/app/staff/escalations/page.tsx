'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SupportService from '@/services/modules/support.service'
import { AlertCircle } from 'lucide-react'

export default function Escalations() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [escalations, setEscalations] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadEscalations = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await SupportService.getEscalations({ limit: 20 })
                setEscalations(data?.escalations || [])
            } catch {
                // API not available yet — show empty state
                setEscalations([])
            } finally {
                setLoading(false)
            }
        }

        loadEscalations()
    }, [isAuthenticated, router])

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Escalations</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading escalations...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Ticket ID</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Reason</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Level</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">From</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">To</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {escalations.map((escalation) => (
                                    <tr key={escalation.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-blue-600 font-medium">{escalation.ticketId}</td>
                                        <td className="py-3 px-6 text-gray-900">{escalation.reason}</td>
                                        <td className="py-3 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${escalation.escalationLevel === 3 ? 'bg-red-100 text-red-800' :
                                                    escalation.escalationLevel === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                Level {escalation.escalationLevel}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${escalation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    escalation.status === 'acknowledged' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {escalation.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-gray-600">{escalation.escalatedFrom}</td>
                                        <td className="py-3 px-6 text-gray-600">{escalation.escalatedTo}</td>
                                        <td className="py-3 px-6 text-gray-600">{new Date(escalation.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
