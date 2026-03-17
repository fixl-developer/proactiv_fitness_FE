'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, Globe, Bell, Shield, Database, Mail,
    Smartphone, CreditCard, Users, Building2, Clock,
    Save, RefreshCw, Eye, EyeOff, Plus, Edit, Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

const AdminSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general')
    const [showApiKeys, setShowApiKeys] = useState(false)

    // Settings categories
    const settingsCategories = [
        {
            id: 'general',
            name: 'General Settings',
            icon: Settings,
            description: 'Basic system configuration'
        },
        {
            id: 'notifications',
            name: 'Notifications',
            icon: Bell,
            description: 'Email and SMS notifications'
        },
        {
            id: 'security',
            name: 'Security',
            icon: Shield,
            description: 'Authentication and access control'
        },
        {
            id: 'integrations',
            name: 'Integrations',
            icon: Globe,
            description: 'Third-party services and APIs'
        },
        {
            id: 'payments',
            name: 'Payment Settings',
            icon: CreditCard,
            description: 'Payment gateway configuration'
        },
        {
            id: 'system',
            name: 'System',
            icon: Database,
            description: 'System maintenance and backups'
        }
    ]

    // General settings
    const generalSettings = [
        {
            id: 'company_name',
            label: 'Company Name',
            value: 'ProActive Sports',
            type: 'text',
            description: 'Your organization name'
        },
        {
            id: 'company_email',
            label: 'Company Email',
            value: 'info@progym.hk',
            type: 'email',
            description: 'Main contact email address'
        },
        {
            id: 'company_phone',
            label: 'Company Phone',
            value: '+852 2234 5678',
            type: 'tel',
            description: 'Main contact phone number'
        },
        {
            id: 'timezone',
            label: 'Timezone',
            value: 'Asia/Hong_Kong',
            type: 'select',
            options: ['Asia/Hong_Kong', 'UTC', 'Asia/Shanghai'],
            description: 'Default timezone for the system'
        },
        {
            id: 'currency',
            label: 'Default Currency',
            value: 'HKD',
            type: 'select',
            options: ['HKD', 'USD', 'EUR', 'GBP'],
            description: 'Default currency for payments'
        }
    ]

    // Notification settings
    const notificationSettings = [
        {
            id: 'email_notifications',
            label: 'Email Notifications',
            enabled: true,
            description: 'Send email notifications for important events'
        },
        {
            id: 'sms_notifications',
            label: 'SMS Notifications',
            enabled: false,
            description: 'Send SMS notifications for urgent alerts'
        },
        {
            id: 'booking_confirmations',
            label: 'Booking Confirmations',
            enabled: true,
            description: 'Automatically send booking confirmation emails'
        },
        {
            id: 'payment_receipts',
            label: 'Payment Receipts',
            enabled: true,
            description: 'Send payment receipts via email'
        },
        {
            id: 'class_reminders',
            label: 'Class Reminders',
            enabled: true,
            description: 'Send class reminder notifications'
        }
    ]

    // Integration settings
    const integrationSettings = [
        {
            id: 'google_calendar',
            name: 'Google Calendar',
            status: 'connected',
            description: 'Sync classes with Google Calendar',
            lastSync: '2024-01-25 14:30'
        },
        {
            id: 'stripe',
            name: 'Stripe',
            status: 'connected',
            description: 'Payment processing integration',
            lastSync: '2024-01-25 15:45'
        },
        {
            id: 'mailchimp',
            name: 'Mailchimp',
            status: 'disconnected',
            description: 'Email marketing integration',
            lastSync: 'Never'
        },
        {
            id: 'zoom',
            name: 'Zoom',
            status: 'connected',
            description: 'Video conferencing for online classes',
            lastSync: '2024-01-24 10:20'
        }
    ]

    const renderGeneralSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generalSettings.map((setting) => (
                        <div key={setting.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {setting.label}
                            </label>
                            {setting.type === 'select' ? (
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {setting.options?.map((option) => (
                                        <option key={option} value={option} selected={option === setting.value}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    type={setting.type}
                                    defaultValue={setting.value}
                                    className="w-full"
                                />
                            )}
                            <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderNotificationSettings = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                    {notificationSettings.map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{setting.label}</h4>
                                <p className="text-sm text-gray-600">{setting.description}</p>
                            </div>
                            <Switch checked={setting.enabled} />
                        </div>
                    ))}
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
                                    <Button variant="outline" size="sm">
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset to Defaults
                    </Button>
                    <Button>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
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
                                <button
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
