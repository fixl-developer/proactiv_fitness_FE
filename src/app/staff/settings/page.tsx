'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supportStaffService, StaffSettings } from '@/services/supportStaffService'
import { useTrackUnsavedChanges } from '@/hooks/useTrackUnsavedChanges'
import { User, Bell, Shield, Settings, Save, CheckCircle, XCircle } from 'lucide-react'

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                enabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    )
}

const defaultSettings: StaffSettings = {
    profile: { firstName: '', lastName: '', email: '', phone: '', department: '', role: '', timezone: 'UTC', language: 'en' },
    notifications: { emailNotifications: true, pushNotifications: true, smsNotifications: false, ticketAssignments: true, escalations: true, systemUpdates: true, weeklyReports: false, soundEnabled: true, desktopNotifications: true },
    security: { twoFactorEnabled: false, sessionTimeout: 30, passwordLastChanged: '', loginHistory: true, ipRestriction: false },
    preferences: { theme: 'system', ticketsPerPage: 20, defaultPriority: 'medium', autoRefresh: true, refreshInterval: 30, showClosedTickets: false, compactView: false }
}

export default function StaffSettingsPage() {
    const router = useRouter()
    const { isAuthenticated, user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<StaffSettings>(defaultSettings)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const originalSettingsRef = useRef<string>('')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadSettings = async () => {
            setLoading(true)
            try {
                const data = await supportStaffService.getSettings()
                setSettings(data)
                originalSettingsRef.current = JSON.stringify(data)
            } catch {
                setSettings(defaultSettings)
                originalSettingsRef.current = JSON.stringify(defaultSettings)
            } finally {
                setLoading(false)
            }
        }

        loadSettings()
    }, [isAuthenticated, router])

    const isDirty = !loading && originalSettingsRef.current !== '' && JSON.stringify(settings) !== originalSettingsRef.current

    const saveSettings = useCallback(async () => {
        await supportStaffService.updateSettings(settings)
        originalSettingsRef.current = JSON.stringify(settings)
    }, [settings])

    useTrackUnsavedChanges('staff-settings', 'Staff Settings', isDirty, saveSettings)

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 4000)
    }

    const updateProfile = (field: string, value: string) => {
        setSettings(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }))
    }

    const updateNotifications = (field: string, value: boolean) => {
        setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [field]: value } }))
    }

    const updateSecurity = (field: string, value: boolean | number) => {
        setSettings(prev => ({ ...prev, security: { ...prev.security, [field]: value } }))
    }

    const updatePreferences = (field: string, value: string | boolean | number) => {
        setSettings(prev => ({ ...prev, preferences: { ...prev.preferences, [field]: value } }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await supportStaffService.updateSettings(settings)
            originalSettingsRef.current = JSON.stringify(settings)
            showToast('success', 'Settings saved successfully!')
        } catch {
            showToast('error', 'Failed to save settings. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
                        toast.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                        {toast.type === 'success'
                            ? <CheckCircle className="w-5 h-5 text-green-600" />
                            : <XCircle className="w-5 h-5 text-red-600" />
                        }
                        <span className="font-medium">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Gradient Top Section */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-8 py-10">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-blue-100 mt-2">Manage your profile, notifications, security, and display preferences</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading settings...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">

                        {/* Profile Settings */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                                        <input
                                            type="text"
                                            value={settings.profile.firstName}
                                            onChange={e => updateProfile('firstName', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                                        <input
                                            type="text"
                                            value={settings.profile.lastName}
                                            onChange={e => updateProfile('lastName', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            value={settings.profile.email}
                                            onChange={e => updateProfile('email', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                                        <input
                                            type="tel"
                                            value={settings.profile.phone}
                                            onChange={e => updateProfile('phone', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                                        <input
                                            type="text"
                                            value={settings.profile.department}
                                            onChange={e => updateProfile('department', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                                        <input
                                            type="text"
                                            value={settings.profile.role}
                                            readOnly
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                                        <select
                                            value={settings.profile.timezone}
                                            onChange={e => updateProfile('timezone', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="UTC">UTC</option>
                                            <option value="EST">EST</option>
                                            <option value="CST">CST</option>
                                            <option value="PST">PST</option>
                                            <option value="IST">IST</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                                        <select
                                            value={settings.profile.language}
                                            onChange={e => updateProfile('language', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                    <Bell className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                            </div>
                            <div className="space-y-1">
                                {([
                                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive ticket updates and alerts via email' },
                                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get real-time push notifications in your browser' },
                                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive critical alerts via text message' },
                                    { key: 'ticketAssignments', label: 'Ticket Assignments', desc: 'Notify when a new ticket is assigned to you' },
                                    { key: 'escalations', label: 'Escalations', desc: 'Alert when a ticket is escalated to your level' },
                                    { key: 'systemUpdates', label: 'System Updates', desc: 'Notifications about system maintenance and updates' },
                                    { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive a weekly summary of your performance' },
                                    { key: 'soundEnabled', label: 'Sound Alerts', desc: 'Play a sound for new notifications' },
                                    { key: 'desktopNotifications', label: 'Desktop Notifications', desc: 'Show native desktop notification popups' },
                                ] as { key: keyof StaffSettings['notifications']; label: string; desc: string }[]).map(item => (
                                    <div key={item.key} className="flex items-center justify-between py-3.5 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                        <Toggle
                                            enabled={settings.notifications[item.key]}
                                            onChange={val => updateNotifications(item.key, val)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Settings */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-lg shadow-md">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                            </div>
                            <div className="space-y-5">
                                <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                    </div>
                                    <Toggle
                                        enabled={settings.security.twoFactorEnabled}
                                        onChange={val => updateSecurity('twoFactorEnabled', val)}
                                    />
                                </div>
                                <div className="px-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Session Timeout (minutes)</label>
                                    <input
                                        type="number"
                                        min={5}
                                        max={480}
                                        value={settings.security.sessionTimeout}
                                        onChange={e => updateSecurity('sessionTimeout', parseInt(e.target.value) || 30)}
                                        className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="px-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Last Changed</label>
                                    <p className="text-gray-600 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">
                                        {settings.security.passwordLastChanged
                                            ? new Date(settings.security.passwordLastChanged).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                            : 'Not available'}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">Login History</p>
                                        <p className="text-sm text-gray-500">Keep a log of all login attempts</p>
                                    </div>
                                    <Toggle
                                        enabled={settings.security.loginHistory}
                                        onChange={val => updateSecurity('loginHistory', val)}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">IP Restriction</p>
                                        <p className="text-sm text-gray-500">Restrict account access to specific IP addresses</p>
                                    </div>
                                    <Toggle
                                        enabled={settings.security.ipRestriction}
                                        onChange={val => updateSecurity('ipRestriction', val)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Display Preferences */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                    <Settings className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">Display Preferences</h2>
                            </div>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Theme</label>
                                        <select
                                            value={settings.preferences.theme}
                                            onChange={e => updatePreferences('theme', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="system">System</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Priority</label>
                                        <select
                                            value={settings.preferences.defaultPriority}
                                            onChange={e => updatePreferences('defaultPriority', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="px-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tickets Per Page</label>
                                    <input
                                        type="number"
                                        min={5}
                                        max={100}
                                        value={settings.preferences.ticketsPerPage}
                                        onChange={e => updatePreferences('ticketsPerPage', parseInt(e.target.value) || 20)}
                                        className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">Auto Refresh</p>
                                        <p className="text-sm text-gray-500">Automatically refresh ticket lists</p>
                                    </div>
                                    <Toggle
                                        enabled={settings.preferences.autoRefresh}
                                        onChange={val => updatePreferences('autoRefresh', val)}
                                    />
                                </div>
                                {settings.preferences.autoRefresh && (
                                    <div className="px-4 ml-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Refresh Interval (seconds)</label>
                                        <input
                                            type="number"
                                            min={5}
                                            max={300}
                                            value={settings.preferences.refreshInterval}
                                            onChange={e => updatePreferences('refreshInterval', parseInt(e.target.value) || 30)}
                                            className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">Show Closed Tickets</p>
                                        <p className="text-sm text-gray-500">Include closed tickets in your default ticket view</p>
                                    </div>
                                    <Toggle
                                        enabled={settings.preferences.showClosedTickets}
                                        onChange={val => updatePreferences('showClosedTickets', val)}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">Compact View</p>
                                        <p className="text-sm text-gray-500">Use a more condensed layout for ticket lists</p>
                                    </div>
                                    <Toggle
                                        enabled={settings.preferences.compactView}
                                        onChange={val => updatePreferences('compactView', val)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-2 pb-8">
                            <button
                                id="staff-settings-btn"
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 font-medium shadow-lg shadow-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
