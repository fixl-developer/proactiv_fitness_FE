'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Bell, Lock, Mail, Globe, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { HQAdminService, SystemSettings } from '@/services/hqAdminService'

export default function SettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await HQAdminService.getSettings()
            setSettings(data)
        } catch (err: any) {
            console.error('Error fetching settings:', err)
            setError(err.message || 'Failed to fetch settings')
            // Use mock data for development
            setSettings({
                general: {
                    platformName: 'Proactiv Fitness',
                    supportEmail: 'support@proactiv.com',
                    supportPhone: '+1 (212) 555-0100',
                    timezone: 'America/New_York'
                },
                email: {
                    smtpServer: 'smtp.gmail.com',
                    smtpPort: 587,
                    senderEmail: 'noreply@proactiv.com',
                    senderName: 'Proactiv Fitness'
                },
                security: {
                    passwordMinLength: 8,
                    passwordRequireSpecialChar: true,
                    sessionTimeout: 30,
                    twoFactorEnabled: true
                }
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!settings) return
        try {
            setIsSaving(true)
            setError(null)
            await HQAdminService.updateSettings(settings)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err: any) {
            console.error('Error saving settings:', err)
            setError(err.message || 'Failed to save settings')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!settings) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-gray-600">Failed to load settings</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
            </div>

            {saved && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700">Settings saved successfully</span>
                </div>
            )}

            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        General Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                            <input
                                type="text"
                                value={settings.general.platformName}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    general: { ...settings.general, platformName: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                            <input
                                type="tel"
                                value={settings.general.supportPhone}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    general: { ...settings.general, supportPhone: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                <select
                                    value={settings.general.timezone}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        general: { ...settings.general, timezone: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>America/New_York</option>
                                    <option>America/Chicago</option>
                                    <option>America/Denver</option>
                                    <option>America/Los_Angeles</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                                <input
                                    type="email"
                                    value={settings.general.supportEmail}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        general: { ...settings.general, supportEmail: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Email Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-green-600" />
                        Email Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                            <input
                                type="text"
                                value={settings.email.smtpServer}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    email: { ...settings.email, smtpServer: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                                <input
                                    type="number"
                                    value={settings.email.smtpPort}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        email: { ...settings.email, smtpPort: parseInt(e.target.value) }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sender Email</label>
                                <input
                                    type="email"
                                    value={settings.email.senderEmail}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        email: { ...settings.email, senderEmail: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sender Name</label>
                            <input
                                type="text"
                                value={settings.email.senderName}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    email: { ...settings.email, senderName: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-red-600" />
                        Security Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Min Password Length</label>
                                <input
                                    type="number"
                                    value={settings.security.passwordMinLength}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (min)</label>
                                <input
                                    type="number"
                                    value={settings.security.sessionTimeout}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.security.passwordRequireSpecialChar}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    security: { ...settings.security, passwordRequireSpecialChar: e.target.checked }
                                })}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">Require Special Characters in Password</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.security.twoFactorEnabled}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    security: { ...settings.security, twoFactorEnabled: e.target.checked }
                                })}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication</span>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
                <button
                    onClick={() => fetchSettings()}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Reset
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ {error} - Using mock data for development
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
