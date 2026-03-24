'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { AlertCircle, Plus } from 'lucide-react'

export default function Programs() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [programs, setPrograms] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadPrograms = async () => {
            try {
                setLoading(true)
                setError(null)
                const partnerId = user?.id || 'partner-1'
                const data = await PartnerPortalService.getPartnerPrograms(partnerId, { limit: 20 })
                setPrograms(data.programs || [])
            } catch (err) {
                console.error('Error loading programs:', err)
                setError('Failed to load programs')
            } finally {
                setLoading(false)
            }
        }

        loadPrograms()
    }, [isAuthenticated, router, user])

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Program Management</h1>
                    <button id="partner-programs-new-btn" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Program
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
                            <p className="text-gray-600">Loading programs...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map((program) => (
                            <div key={program.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{program.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{program.description}</p>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600"><span className="font-medium">Category:</span> {program.category}</p>
                                    <p className="text-gray-600"><span className="font-medium">Students:</span> {program.enrolledStudents}</p>
                                    <p className="text-gray-600"><span className="font-medium">Revenue:</span> ${program.revenue?.toLocaleString()}</p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button id={`partner-programs-edit-${program.id}-btn`} className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium">
                                        Edit
                                    </button>
                                    <button id={`partner-programs-view-${program.id}-btn`} className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 text-sm font-medium">
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
