'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerAnalyticsService from '@/services/modules/partner-analytics.service'
import { AlertCircle, Download } from 'lucide-react'

export default function Financial() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [revenue, setRevenue] = useState<any>(null)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadFinancial = async () => {
            try {
                setLoading(true)
                setError(null)
                const partnerId = user?.id || 'partner-1'
                const revenueRes = await PartnerAnalyticsService.getRevenueAnalytics(partnerId)
                setRevenue(revenueRes)
            } catch (err) {
                console.error('Error loading financial data:', err)
                setError('Failed to load financial data')
            } finally {
                setLoading(false)
            }
        }

        loadFinancial()
    }, [isAuthenticated, router, user])

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Financial Reports</h1>
                    <button id="partner-financial-export-btn" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Export
                    </button>
                </div>

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
                            <p className="text-gray-600">Loading financial data...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">${revenue?.totalRevenue?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-600 text-sm font-medium">Avg Revenue/Student</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">${revenue?.averageRevenuePerStudent?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-gray-600 text-sm font-medium">Avg Revenue/Program</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">${revenue?.averageRevenuePerProgram?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
