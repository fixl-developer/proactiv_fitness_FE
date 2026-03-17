'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import StaffManagementService from '@/services/modules/staff-management.service'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function Quality() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [audits, setAudits] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadAudits = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await StaffManagementService.getQualityAudits({ limit: 20 })
                setAudits(data.audits || [])
            } catch (err) {
                console.error('Error loading audits:', err)
                setError('Failed to load quality audits')
            } finally {
                setLoading(false)
            }
        }

        loadAudits()
    }, [isAuthenticated, router])

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Quality Assurance</h1>

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
                            <p className="text-gray-600">Loading quality audits...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Ticket</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Score</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Reviewer</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {audits.map((audit) => (
                                    <tr key={audit.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-blue-600 font-medium">{audit.ticket}</td>
                                        <td className="py-3 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                    {audit.score}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${audit.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {audit.status === 'passed' && <CheckCircle className="w-4 h-4" />}
                                                {audit.status === 'passed' ? 'Passed' : 'Needs Improvement'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-gray-600">{audit.reviewer}</td>
                                        <td className="py-3 px-6 text-gray-600">{audit.date}</td>
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
