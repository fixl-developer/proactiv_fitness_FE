'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SupportService from '@/services/modules/support.service'
import { AlertCircle, Plus } from 'lucide-react'

export default function CustomerInquiries() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [inquiries, setInquiries] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadInquiries = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await SupportService.getTickets({ limit: 20 })
                setInquiries(data?.tickets || [])
            } catch {
                // API not available yet — show empty state
                setInquiries([])
            } finally {
                setLoading(false)
            }
        }

        loadInquiries()
    }, [isAuthenticated, router])

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Customer Inquiries</h1>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Inquiry
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
                            <p className="text-gray-600">Loading inquiries...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inquiries.map((inquiry) => (
                            <div key={inquiry.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-semibold text-gray-900 flex-1">{inquiry.subject}</h3>
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                        {inquiry.category}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{inquiry.description}</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">{inquiry.customerName}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${inquiry.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                            inquiry.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {inquiry.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
