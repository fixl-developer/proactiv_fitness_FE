'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CommissionService from '@/services/modules/commission.service'
import { AlertCircle, Plus } from 'lucide-react'

export default function Commissions() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [commissions, setCommissions] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadCommissions = async () => {
            try {
                setLoading(true)
                setError(null)
                const partnerId = user?.id || 'partner-1'
                const [commissionsRes, statsRes] = await Promise.all([
                    CommissionService.getCommissions(partnerId, { limit: 20 }),
                    CommissionService.getCommissionStats(partnerId)
                ])
                setCommissions(commissionsRes.commissions || [])
                setStats(statsRes)
            } catch (err) {
                console.error('Error loading commissions:', err)
                setError('Failed to load commissions')
            } finally {
                setLoading(false)
            }
        }

        loadCommissions()
    }, [isAuthenticated, router, user])

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Commission Management</h1>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Request Payout
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-600 text-sm font-medium">Total Commissions</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">${stats?.totalCommissions?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-600 text-sm font-medium">Total Paid</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">${stats?.totalPaid?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-600 text-sm font-medium">Pending</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">${stats?.totalPending?.toLocaleString() || '0'}</p>
                    </div>
                </div>

                {/* Commissions Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading commissions...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Period</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Amount</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Rate</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissions.map((commission) => (
                                    <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-gray-900">{commission.period}</td>
                                        <td className="py-3 px-6 text-gray-900 font-medium">${commission.amount?.toLocaleString() || '0'}</td>
                                        <td className="py-3 px-6 text-gray-600">{commission.rate}%</td>
                                        <td className="py-3 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {commission.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-gray-600">{new Date(commission.calculatedAt).toLocaleDateString()}</td>
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
