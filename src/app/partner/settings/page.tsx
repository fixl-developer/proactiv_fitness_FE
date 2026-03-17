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
            const response = await PartnerPortalService.getPartnerProfile(partnerId)
            
            setSettings({
                profile: {
                    organizationName: response?.businessName || 'Elite School Partners',
                    contactPerson: response?.name || 'John Smith',
                    email: response?.email || 'john.smith@eliteschool.com',
                    phone: response?.phone || '+1 555-0123',
                    website: 'https://eliteschool.com',
                    address: response?.location || '123 Education Street, New York, NY 10001'
                },
                billing: {
                    billingEmail: response?.email || 'billing@eliteschool.com',
                    paymentMethod: 'Credit Card ending in 4567',
                    billingAddress: response?.location || '123 Education Street, New York, NY 10001',
                    taxId: 'TAX123456789'
                },
                api: {
                    apiKey: 'pk_live_1234567890abcdef',
                    webhookUrl: 'https://eliteschool.com/webhooks/proactive',
                    environment: 'production'
                },
                notifications: {
                    emailNotifications: true,
                    smsNotifications: false,
                    webhookNotifications: true,
                    dailyDigest: true,
                    weeklyReport: true
                }
            })
        } catch (err) {
            console.error('Error fetching settings:', err)
            setError('Failed to load settings')
        } finally {
            setIsLoading(false)
        }
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

            {/* Tabs Navigation */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                {[
                    { id: 'profile', name: 'Profile', icon: User },
                    { id: 'billing', name: 'Billing', icon: CreditCard },
                    { id: 'api', name: 'API & Webhooks', icon: Key },
                    { id: 'notifications', name: 'Notifications', icon: Bell },
                ].map((tab) => (
                    <button
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
                                        value={settings.profile?.organizationName}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                                    <Input
                                        type="text"
                                        value={settings.profile?.contactPerson}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <Input
                                        type="email"
                                        value={settings.profile?.email}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <Input
                                        type="tel"
                                        value={settings.profile?.phone}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                    <Input
                                        type="url"
                                        value={settings.profile?.website}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                    <Input
                                        type="text"
                                        value={settings.profile?.address}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profile
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
                                        value={settings.billing?.billingEmail}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                    <Input
                                        type="text"
                                        value={settings.billing?.paymentMethod}
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                                <Input value={settings.api?.webhookUrl} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                                <Badge variant={settings.api?.environment === 'production' ? 'default' : 'secondary'}>
                                    {settings.api?.environment}
                                </Badge>
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
                                { key: 'reportNotifications', label: 'Report Notifications', description: 'Receive report generation updates' },
                            ].map((notification) => (
                                <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{notification.label}</p>
                                        <p className="text-sm text-gray-600">{notification.description}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications?.[notification.key]}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}
