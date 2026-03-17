'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import NotificationService from '@/services/modules/notification.service'
import { AlertCircle, Save } from 'lucide-react'

export default function Settings() {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [preferences, setPreferences] = useState<any[]>([])
    const [formData, setFormData] = useState({
        email: user?.email || '',
        phone: '',
        timezone: 'UTC',
        language: 'en'
    })

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadPreferences = async () => {
            setLoading(true)
            try {
                const prefs = await NotificationService.getNotificationPreferences()
                setPreferences(prefs || [])
            } catch {
                setPreferences([])
            } finally {
                setLoading(false)
            }
        }

        loadPreferences()
    }, [isAuthenticated, router])

    const handleSave = async () => {
        try {
            setError(null)
            setSuccess(null)
            await NotificationService.updateNotificationPreferences(preferences)
            setSuccess('Settings saved successfully!')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error('Error saving settings:', err)
            setError('Failed to save settings')
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">{success}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading settings...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Profile Settings */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                        <select
                                            value={formData.timezone}
                                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option>UTC</option>
                                            <option>EST</option>
                                            <option>CST</option>
                                            <option>PST</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                        <select
                                            value={formData.language}
                                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                            <div className="space-y-4">
                                {['email', 'sms', 'push', 'in-app'].map((channel) => (
                                    <div key={channel} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 capitalize">{channel} Notifications</p>
                                            <p className="text-sm text-gray-600">Receive {channel} notifications</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Save Settings
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
