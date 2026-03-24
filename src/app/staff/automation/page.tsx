'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import StaffManagementService from '@/services/modules/staff-management.service'
import { Plus, AlertCircle, ToggleRight } from 'lucide-react'

export default function Automation() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [rules, setRules] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadRules = async () => {
            setLoading(true)
            try {
                const data = await StaffManagementService.getAutomationRules({ limit: 20 })
                setRules(data?.rules || [])
            } catch {
                setRules([])
            } finally {
                setLoading(false)
            }
        }

        loadRules()
    }, [isAuthenticated, router])

    const handleToggle = async (id: string) => {
        try {
            await StaffManagementService.toggleAutomationRule(id)
            const data = await StaffManagementService.getAutomationRules({ limit: 20 })
            setRules(data.rules || [])
        } catch (err) {
            console.error('Error toggling rule:', err)
            setError('Failed to toggle rule')
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Automation Rules</h1>
                    <button id="staff-automation-new-rule-btn" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Rule
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
                            <p className="text-gray-600">Loading automation rules...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rules.map((rule) => (
                            <div key={rule.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{rule.name}</h3>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <p><span className="font-medium">Trigger:</span> {rule.trigger}</p>
                                            <p><span className="font-medium">Action:</span> {rule.action}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button id={`staff-automation-status-${rule.id}-btn`} className={`px-4 py-2 rounded-lg font-medium ${rule.isActive
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}>
                                            {rule.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                        <button id={`staff-automation-toggle-${rule.id}-btn`} onClick={() => handleToggle(rule.id)} className="text-gray-400 hover:text-gray-600">
                                            <ToggleRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
