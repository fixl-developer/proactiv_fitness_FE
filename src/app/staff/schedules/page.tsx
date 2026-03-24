'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import StaffManagementService from '@/services/modules/staff-management.service'
import { AlertCircle, Plus } from 'lucide-react'

export default function Schedules() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [schedules, setSchedules] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadSchedules = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await StaffManagementService.getStaffSchedules({ limit: 20 })
                setSchedules(data?.schedules || [])
            } catch {
                setSchedules([])
            } finally {
                setLoading(false)
            }
        }

        loadSchedules()
    }, [isAuthenticated, router])

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Staff Schedules</h1>
                    <button id="staff-schedules-new-btn" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Schedule
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
                            <p className="text-gray-600">Loading schedules...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Staff Member</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Shift</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Start Time</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">End Time</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Days</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.map((schedule) => (
                                    <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-gray-900 font-medium">{schedule.staff}</td>
                                        <td className="py-3 px-6 text-gray-600">{schedule.shift}</td>
                                        <td className="py-3 px-6 text-gray-600">{schedule.start}</td>
                                        <td className="py-3 px-6 text-gray-600">{schedule.end}</td>
                                        <td className="py-3 px-6 text-gray-600">{schedule.days}</td>
                                        <td className="py-3 px-6">
                                            <button id={`staff-schedules-edit-${schedule.id}-btn`} className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                                        </td>
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
