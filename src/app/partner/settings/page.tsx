'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import {
    Settings, User, Building, CreditCard, Key, Bell,
    Save, Edit2, Eye, EyeOff, Shield, Globe, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function PartnerSettingsPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('profile')
    const [showApiKey, setShowApiKey] = useState(false)
    const [settings, setSettings] = useState<any>({})
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        fetchSettings()
    }, [isAuthenticated, router])

    const fetchSettings = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const partnerId = user?.id || 'partner-1'
            const response = await PartnerPortalService.getPartnerSettings(partnerId)

            setSettings(response || {})
        } catch (err) {
            console.error('Error fetching settings:', err)
            setError('Failed to load settings')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveSettings = async () => {
        try {
            setSaving(true)
            setError(null)
            const partnerId = user?.id || 'partner-1'
            const updated = await PartnerPortalService.updatePartnerSettings(partnerId, settings)
            setSettings(updated)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err) {
            console.error('Error saving settings:', err)
            setError('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const updateSettingsField = (section: string, field: string, value: any) => {
        setSettings((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
    }

    if (!isAuthenticated) return null

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your partner account settings and preferences</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {saveSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <Save className="w-5 h-5 text-green-600" />
                    <p className="text-green-800">Settings saved successfully!</p>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                {[
                    { id: 'profile', name: 'Profile', icon: User },
                    { id: 'billing', name: 'Billing', icon: CreditCard },
                    { id: 'api', name: 'API & Webhooks', icon: Key },
                    { id: 'notifications', name: 'Notifications', icon: Bell },
                ].map((tab) => (
                    <button id={`partner-settings-tab-${tab.id}-btn`}
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Profile Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                                    <Input
                                        type="text"
                                        value={settings.profile?.organizationName || ''}
                                        onChange={(e) => updateSettingsField('profile', 'organizationName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                                    <Input
                                        type="text"
                                        value={settings.profile?.contactPerson || ''}
                                        onChange={(e) => updateSettingsField('profile', 'contactPerson', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <Input
                                        type="email"
                                        value={settings.profile?.email || ''}
                                        onChange={(e) => updateSettingsField('profile', 'email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <Input
                                        type="tel"
                                        value={settings.profile?.phone || ''}
                                        onChange={(e) => updateSettingsField('profile', 'phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                    <Input
                                        type="url"
                                        value={settings.profile?.website || ''}
                                        onChange={(e) => updateSettingsField('profile', 'website', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <Input
                                        type="text"
                                        value={settings.profile?.address || ''}
                                        onChange={(e) => updateSettingsField('profile', 'address', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    id="partner-settings-save-profile-btn"
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-green-600" />
                                Billing Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Billing Email</label>
                                    <Input
                                        type="email"
                                        value={settings.billing?.billingEmail || ''}
                                        onChange={(e) => updateSettingsField('billing', 'billingEmail', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                    <Input
                                        type="text"
                                        value={settings.billing?.paymentMethod || ''}
                                        onChange={(e) => updateSettingsField('billing', 'paymentMethod', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                                    <Input
                                        type="text"
                                        value={settings.billing?.billingAddress || ''}
                                        onChange={(e) => updateSettingsField('billing', 'billingAddress', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                                    <Input
                                        type="text"
                                        value={settings.billing?.taxId || ''}
                                        onChange={(e) => updateSettingsField('billing', 'taxId', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    id="partner-settings-save-billing-btn"
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Billing'}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* API & Webhooks Tab */}
            {activeTab === 'api' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="w-5 h-5 text-purple-600" />
                                API & Webhooks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={settings.api?.apiKey || ''}
                                            readOnly
                                            className="bg-gray-50"
                                        />
                                        <button
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                                    <Input
                                        type="url"
                                        value={settings.api?.webhookUrl || ''}
                                        onChange={(e) => updateSettingsField('api', 'webhookUrl', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                                    <Badge variant={settings.api?.environment === 'production' ? 'default' : 'secondary'}>
                                        {settings.api?.environment || 'production'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    id="partner-settings-save-api-btn"
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save API Settings'}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-orange-600" />
                                Notification Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
                                { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive updates via SMS' },
                                { key: 'webhookNotifications', label: 'Webhook Notifications', description: 'Receive updates via webhook' },
                                { key: 'dailyDigest', label: 'Daily Digest', description: 'Receive daily summary of activities' },
                                { key: 'weeklyReport', label: 'Weekly Report', description: 'Receive weekly performance report' },
                            ].map((notification) => (
                                <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{notification.label}</p>
                                        <p className="text-sm text-gray-600">{notification.description}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications?.[notification.key] || false}
                                            onChange={(e) => updateSettingsField('notifications', notification.key, e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                            <div className="flex justify-end pt-4">
                                <button
                                    id="partner-settings-save-notifications-btn"
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Notifications'}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}
