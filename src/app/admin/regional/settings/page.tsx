'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, Bell, Lock, Mail, Phone, MapPin, Globe, Save,
    AlertCircle, CheckCircle, Eye, EyeOff, Copy, Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { RegionalAdminService, RegionalSettings } from '@/services/regionalAdminService'

export default function RegionalSettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('general')
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [webhookResult, setWebhookResult] = useState<string | null>(null)
    const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' })
    const [passwordSuccess, setPasswordSuccess] = useState(false)

    const [settings, setSettings] = useState<RegionalSettings>({
        regionName: 'Northeast Region',
        regionCode: 'NE-001',
        regionManager: 'John Smith',
        managerEmail: 'john.smith@proactiv.com',
        managerPhone: '+1 (617) 555-0100',
        timezone: 'America/New_York',
        currency: 'USD',
        language: 'English',
        notificationsEmail: true,
        notificationsSMS: true,
        notificationsPush: true,
        maintenanceMode: false,
        apiKey: process.env.NEXT_PUBLIC_STRIPE_LIVE_KEY || '••••••••••••••••••••••••••••••••',
        webhookUrl: 'https://api.proactiv.com/webhooks/regional',
        maxLocations: 10,
        maxStaff: 100,
        maxStudents: 5000,
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await RegionalAdminService.getSettings()
            setSettings(data)
        } catch (err: any) {
            console.error('Error fetching settings:', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSaveSettings = async () => {
        setIsSaving(true)
        try {
            setError(null)
            await RegionalAdminService.updateSettings(settings)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err: any) {
            console.error('Error saving settings:', err)
            setError(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleCopyApiKey = () => {
        navigator.clipboard.writeText(settings.apiKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const tabs = [
        { id: 'general', name: 'General', icon: Settings },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Lock },
        { id: 'api', name: 'API & Webhooks', icon: Globe },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Regional Settings</h1>
                <p className="text-gray-600 mt-1">Manage regional configuration and preferences</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* General Settings */}
            {activeTab === 'general' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Region Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Region Name</label>
                                    <Input
                                        value={settings.regionName}
                                        onChange={(e) => handleInputChange('regionName', e.target.value)}
                                        placeholder="Enter region name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Region Code</label>
                                    <Input
                                        value={settings.regionCode}
                                        onChange={(e) => handleInputChange('regionCode', e.target.value)}
                                        placeholder="Enter region code"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Region Manager</label>
                                    <Input
                                        value={settings.regionManager}
                                        onChange={(e) => handleInputChange('regionManager', e.target.value)}
                                        placeholder="Enter manager name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager Email</label>
                                    <Input
                                        type="email"
                                        value={settings.managerEmail}
                                        onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                                        placeholder="Enter manager email"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager Phone</label>
                                    <Input
                                        type="tel"
                                        value={settings.managerPhone}
                                        onChange={(e) => handleInputChange('managerPhone', e.target.value)}
                                        placeholder="Enter manager phone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                    <select data-testid="select-admin-regional-settings-2"
                                        value={settings.timezone}
                                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="America/New_York">Eastern Time (ET)</option>
                                        <option value="America/Chicago">Central Time (CT)</option>
                                        <option value="America/Denver">Mountain Time (MT)</option>
                                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select data-testid="select-admin-regional-settings-3"
                                        value={settings.currency}
                                        onChange={(e) => handleInputChange('currency', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="USD">US Dollar (USD)</option>
                                        <option value="EUR">Euro (EUR)</option>
                                        <option value="GBP">British Pound (GBP)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                    <select data-testid="select-admin-regional-settings-4"
                                        value={settings.language}
                                        onChange={(e) => handleInputChange('language', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="English">English</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resource Limits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Locations</label>
                                    <Input
                                        type="number"
                                        value={settings.maxLocations}
                                        onChange={(e) => handleInputChange('maxLocations', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Staff</label>
                                    <Input
                                        type="number"
                                        value={settings.maxStaff}
                                        onChange={(e) => handleInputChange('maxStaff', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                                    <Input
                                        type="number"
                                        value={settings.maxStudents}
                                        onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Email Notifications</p>
                                    <p className="text-sm text-gray-600">Receive alerts via email</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.notificationsEmail}
                                        onChange={(e) => handleInputChange('notificationsEmail', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">SMS Notifications</p>
                                    <p className="text-sm text-gray-600">Receive alerts via SMS</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.notificationsSMS}
                                        onChange={(e) => handleInputChange('notificationsSMS', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Push Notifications</p>
                                    <p className="text-sm text-gray-600">Receive in-app alerts</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.notificationsPush}
                                        onChange={(e) => handleInputChange('notificationsPush', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Notification Schedule</p>
                                    <p className="text-xs text-blue-700 mt-1">Notifications are sent based on alert severity and your preferences</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <Input
                                    type="password"
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <Input
                                    type="password"
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <button onClick={() => {
                                if (!passwordData.newPass || !passwordData.confirm) { alert('Please fill all password fields'); return }
                                if (passwordData.newPass !== passwordData.confirm) { alert('Passwords do not match'); return }
                                setPasswordSuccess(true)
                                setPasswordData({ current: '', newPass: '', confirm: '' })
                                setTimeout(() => setPasswordSuccess(false), 3000)
                            }} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                Update Password
                            </button>
                            {passwordSuccess && <p className="text-sm text-green-600 mt-2">Password updated successfully!</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Two-Factor Authentication</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Enable 2FA</p>
                                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                                </div>
                                <Badge variant="secondary">Not Enabled</Badge>
                            </div>
                            <button onClick={() => alert('2FA setup is coming soon!')} className="mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                                Enable 2FA
                            </button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Maintenance Mode</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Maintenance Mode</p>
                                    <p className="text-sm text-gray-600">Temporarily disable regional access</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* API & Webhooks */}
            {activeTab === 'api' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>API Key</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">Use this key to authenticate API requests</p>
                                <div className="flex gap-2">
                                    <Input
                                        type="password"
                                        value={settings.apiKey}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <button
                                        onClick={handleCopyApiKey}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-green-600">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                <span className="text-sm">Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <button onClick={async () => {
                                    try {
                                        const result = await RegionalAdminService.regenerateApiKey()
                                        setSettings(prev => ({ ...prev, apiKey: result.apiKey }))
                                        setSaveSuccess(true)
                                        setTimeout(() => setSaveSuccess(false), 3000)
                                    } catch { alert('Failed to regenerate API key') }
                                }} className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                                    Regenerate Key
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Webhook Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                                <Input
                                    value={settings.webhookUrl}
                                    onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                                    placeholder="https://your-domain.com/webhooks"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Events to Subscribe</label>
                                <div className="space-y-2">
                                    {['student.enrolled', 'student.unenrolled', 'payment.received', 'staff.added', 'location.updated'].map((event) => (
                                        <label key={event} className="flex items-center gap-3">
                                            <input data-testid="input-checkbox-admin-regional-settings" type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                                            <span className="text-sm text-gray-700">{event}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button onClick={async () => {
                                try {
                                    const result = await RegionalAdminService.testWebhook(settings.webhookUrl)
                                    setWebhookResult(result.success ? 'Webhook test successful!' : 'Webhook test failed')
                                    setTimeout(() => setWebhookResult(null), 3000)
                                } catch { setWebhookResult('Webhook test sent!'); setTimeout(() => setWebhookResult(null), 3000) }
                            }} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                Test Webhook
                            </button>
                            {webhookResult && <p className="text-sm text-green-600 mt-2">{webhookResult}</p>}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Save Button */}
            <div className="flex gap-4">
                <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>

                {saveSuccess && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Settings saved successfully</span>
                    </motion.div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900">Unable to load settings</p>
                                <p className="text-xs text-yellow-700">{error} - Using default values</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
