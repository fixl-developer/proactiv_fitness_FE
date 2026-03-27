'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, Globe, Bell, Shield, Database, Mail,
    Smartphone, CreditCard, Users, Building2, Clock,
    Save, RefreshCw, Eye, EyeOff, Plus, Edit, Trash2,
    CheckCircle, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { HQAdminService, SystemSettings } from '@/services/hqAdminService'
import { useTrackUnsavedChanges } from '@/hooks/useTrackUnsavedChanges'

const defaultSettings: SystemSettings = {
    general: {
        platformName: 'ProActive Sports',
        supportEmail: 'info@progym.hk',
        supportPhone: '+852 2234 5678',
        timezone: 'Asia/Hong_Kong',
    },
    email: {
        smtpServer: 'smtp.gmail.com',
        smtpPort: 587,
        senderEmail: 'noreply@proactiv.com',
        senderName: 'ProActiv Fitness',
    },
    security: {
        passwordMinLength: 8,
        passwordRequireSpecialChar: true,
        sessionTimeout: 30,
        twoFactorEnabled: false,
    }
}

// Notification preferences (managed locally as they are UI-level settings)
interface NotificationPrefs {
    emailNotifications: boolean
    smsNotifications: boolean
    bookingConfirmations: boolean
    paymentReceipts: boolean
    classReminders: boolean
}

const defaultNotifications: NotificationPrefs = {
    emailNotifications: true,
    smsNotifications: false,
    bookingConfirmations: true,
    paymentReceipts: true,
    classReminders: true,
}

// Integration settings (read-only display)
const integrationSettings = [
    { id: 'google_calendar', name: 'Google Calendar', status: 'connected', description: 'Sync classes with Google Calendar', lastSync: '2024-01-25 14:30' },
    { id: 'stripe', name: 'Stripe', status: 'connected', description: 'Payment processing integration', lastSync: '2024-01-25 15:45' },
    { id: 'mailchimp', name: 'Mailchimp', status: 'disconnected', description: 'Email marketing integration', lastSync: 'Never' },
    { id: 'zoom', name: 'Zoom', status: 'connected', description: 'Video conferencing for online classes', lastSync: '2024-01-24 10:20' },
]

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

const AdminSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
    const [notifications, setNotifications] = useState<NotificationPrefs>(defaultNotifications)
    const originalSettingsRef = useRef<string>('')
    const originalNotificationsRef = useRef<string>('')

    // Load settings from API
    useEffect(() => {
        const loadSettings = async () => {
            try {
                setIsLoading(true)
                const data = await HQAdminService.getSettings()
                setSettings(data)
                originalSettingsRef.current = JSON.stringify(data)
            } catch (err) {
                console.error('Error loading admin settings:', err)
                setSettings(defaultSettings)
                originalSettingsRef.current = JSON.stringify(defaultSettings)
            } finally {
                setIsLoading(false)
            }
        }

        // Load notification prefs from localStorage
        try {
            const savedNotifs = localStorage.getItem('admin-notification-prefs')
            if (savedNotifs) {
                const parsed = JSON.parse(savedNotifs)
                setNotifications(parsed)
                originalNotificationsRef.current = JSON.stringify(parsed)
            } else {
                originalNotificationsRef.current = JSON.stringify(defaultNotifications)
            }
        } catch {
            originalNotificationsRef.current = JSON.stringify(defaultNotifications)
        }

        loadSettings()
    }, [])

    // Dirty tracking
    const isDirty = !isLoading && (
        (originalSettingsRef.current !== '' && JSON.stringify(settings) !== originalSettingsRef.current) ||
        (originalNotificationsRef.current !== '' && JSON.stringify(notifications) !== originalNotificationsRef.current)
    )

    const saveForLogout = useCallback(async () => {
        await HQAdminService.updateSettings(settings)
        originalSettingsRef.current = JSON.stringify(settings)
        localStorage.setItem('admin-notification-prefs', JSON.stringify(notifications))
        originalNotificationsRef.current = JSON.stringify(notifications)
    }, [settings, notifications])

    useTrackUnsavedChanges('admin-settings', 'Admin Settings', isDirty, saveForLogout)

    // Update settings fields
    const updateGeneral = (field: string, value: string) => {
        setSettings(prev => ({ ...prev, general: { ...prev.general, [field]: value } }))
    }

    const updateEmail = (field: string, value: string | number) => {
        setSettings(prev => ({ ...prev, email: { ...prev.email, [field]: value } }))
    }

    const updateSecurity = (field: string, value: boolean | number) => {
        setSettings(prev => ({ ...prev, security: { ...prev.security, [field]: value } }))
    }

    const updateNotification = (field: keyof NotificationPrefs, value: boolean) => {
        setNotifications(prev => ({ ...prev, [field]: value }))
    }

    // Save handler
    const handleSave = async () => {
        try {
            setIsSaving(true)
            setSaveError(null)
            await HQAdminService.updateSettings(settings)
            localStorage.setItem('admin-notification-prefs', JSON.stringify(notifications))
            originalSettingsRef.current = JSON.stringify(settings)
            originalNotificationsRef.current = JSON.stringify(notifications)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err: any) {
            setSaveError(err.message || 'Failed to save settings')
            setTimeout(() => setSaveError(null), 4000)
        } finally {
            setIsSaving(false)
        }
    }

    // Reset to defaults
    const handleReset = () => {
        setSettings(defaultSettings)
        setNotifications(defaultNotifications)
    }

    // Settings categories
    const settingsCategories = [
        { id: 'general', name: 'General Settings', icon: Settings, description: 'Basic system configuration' },
        { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Email and SMS notifications' },
        { id: 'security', name: 'Security', icon: Shield, description: 'Authentication and access control' },
        { id: 'integrations', name: 'Integrations', icon: Globe, description: 'Third-party services and APIs' },
        { id: 'payments', name: 'Payment Settings', icon: CreditCard, description: 'Payment gateway configuration' },
        { id: 'system', name: 'System', icon: Database, description: 'System maintenance and backups' },
    ]

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                        <Input
                            type="text"
                            value={settings.general.platformName}
                            onChange={(e) => updateGeneral('platformName', e.target.value)}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Your organization name</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                        <Input
                            type="email"
                            value={settings.general.supportEmail}
                            onChange={(e) => updateGeneral('supportEmail', e.target.value)}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Main contact email address</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                        <Input
                            type="tel"
                            value={settings.general.supportPhone}
                            onChange={(e) => updateGeneral('supportPhone', e.target.value)}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Main contact phone number</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                            id="select-admin-settings-1"
                            value={settings.general.timezone}
                            onChange={(e) => updateGeneral('timezone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {['Asia/Hong_Kong', 'UTC', 'Asia/Shanghai', 'America/New_York', 'Europe/London', 'Asia/Kolkata'].map((tz) => (
                                <option key={tz} value={tz}>{tz}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Default timezone for the system</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                        <Input
                            type="text"
                            value={settings.email.smtpServer}
                            onChange={(e) => updateEmail('smtpServer', e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                        <Input
                            type="number"
                            value={settings.email.smtpPort}
                            onChange={(e) => updateEmail('smtpPort', parseInt(e.target.value) || 0)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sender Email</label>
                        <Input
                            type="email"
                            value={settings.email.senderEmail}
                            onChange={(e) => updateEmail('senderEmail', e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sender Name</label>
                        <Input
                            type="text"
                            value={settings.email.senderName}
                            onChange={(e) => updateEmail('senderName', e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    const renderNotificationSettings = () => {
        const notifItems = [
            { id: 'emailNotifications' as const, label: 'Email Notifications', description: 'Send email notifications for important events' },
            { id: 'smsNotifications' as const, label: 'SMS Notifications', description: 'Send SMS notifications for urgent alerts' },
            { id: 'bookingConfirmations' as const, label: 'Booking Confirmations', description: 'Automatically send booking confirmation emails' },
            { id: 'paymentReceipts' as const, label: 'Payment Receipts', description: 'Send payment receipts via email' },
            { id: 'classReminders' as const, label: 'Class Reminders', description: 'Send class reminder notifications' },
        ]

        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                        {notifItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                                <Toggle
                                    enabled={notifications[item.id]}
                                    onChange={(val) => updateNotification(item.id, val)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderSecuritySettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-600">Require 2FA for all admin users</p>
                        </div>
                        <Toggle
                            enabled={settings.security.twoFactorEnabled}
                            onChange={(val) => updateSecurity('twoFactorEnabled', val)}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">Require Special Characters</h4>
                            <p className="text-sm text-gray-600">Passwords must contain special characters</p>
                        </div>
                        <Toggle
                            enabled={settings.security.passwordRequireSpecialChar}
                            onChange={(val) => updateSecurity('passwordRequireSpecialChar', val)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
                            <Input
                                type="number"
                                value={settings.security.passwordMinLength}
                                onChange={(e) => updateSecurity('passwordMinLength', parseInt(e.target.value) || 8)}
                                min={6}
                                max={32}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                            <Input
                                type="number"
                                value={settings.security.sessionTimeout}
                                onChange={(e) => updateSecurity('sessionTimeout', parseInt(e.target.value) || 30)}
                                min={5}
                                max={120}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderIntegrationSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrationSettings.map((integration) => (
                        <Card key={integration.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                                    <Badge className={
                                        integration.status === 'connected'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }>
                                        {integration.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Last sync: {integration.lastSync}</span>
                                    <Button id="admin-settings-btn" variant="outline" size="sm">
                                        {integration.status === 'connected' ? 'Configure' : 'Connect'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return renderGeneralSettings()
            case 'notifications':
                return renderNotificationSettings()
            case 'security':
                return renderSecuritySettings()
            case 'integrations':
                return renderIntegrationSettings()
            default:
                return (
                    <div className="text-center py-12">
                        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                        <p className="text-gray-600">This settings section is under development.</p>
                    </div>
                )
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
                </div>
                <div className="flex gap-3 items-center">
                    {saveSuccess && (
                        <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Saved!
                        </span>
                    )}
                    {saveError && (
                        <span className="text-sm text-red-600 font-medium">{saveError}</span>
                    )}
                    <Button id="admin-settings-btn-2" variant="outline" onClick={handleReset}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset to Defaults
                    </Button>
                    <Button id="admin-settings-btn-3" onClick={handleSave} disabled={isSaving || !isDirty}>
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Settings Navigation */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                        {settingsCategories.map((category) => {
                            const IconComponent = category.icon
                            return (
                                <button id="admin-settings-btn-4"
                                    key={category.id}
                                    onClick={() => setActiveTab(category.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === category.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    <span className="hidden sm:inline">{category.name}</span>
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Settings Content */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {(() => {
                            const category = settingsCategories.find(c => c.id === activeTab)
                            const IconComponent = category?.icon || Settings
                            return (
                                <>
                                    <IconComponent className="w-5 h-5" />
                                    {category?.name || 'Settings'}
                                </>
                            )
                        })()}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderTabContent()}
                    </motion.div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminSettingsPage
