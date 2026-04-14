'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, MapPin, Clock, Users, DollarSign, Bell, Save,
    RefreshCw, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

const ManagerSettingsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'location' | 'operations' | 'notifications' | 'staff'>('location')

    const defaultSettings = {
        locationSettings: {
            name: 'Cyberport Center',
            address: 'Shop 315, Level 3, Cyberport 1, 100 Cyberport Road, Hong Kong',
            phone: '+852 2234 5678',
            email: 'cyberport@proactivsports.net',
            capacity: 120,
            currentStudents: 89,
            operatingHours: {
                weekdays: '9:00 AM - 8:00 PM',
                weekends: '9:00 AM - 6:00 PM'
            },
            facilities: ['Gymnastics Floor', 'Tumbling Area', 'Beam Section', 'Vault Area', 'Reception'],
            status: 'active'
        },
        operationalSettings: {
            classSize: { beginner: 12, intermediate: 10, advanced: 8, private: 1 },
            pricing: { beginner: 1800, intermediate: 2100, advanced: 2400, private: 800 },
            bookingSettings: { advanceBooking: 30, cancellationPolicy: 24, waitlistEnabled: true }
        },
        notificationSettings: {
            emailNotifications: true,
            smsNotifications: true,
            classReminders: true
        },
        staffSettings: {
            scheduleManagement: true,
            studentRecords: true,
            paymentProcessing: false
        }
    }

    const [settings, setSettings] = useState(defaultSettings)
    const originalSettingsRef = useRef<string>('')

    const loadSettings = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await apiClient.get('/settings/location')
            if (response.success && response.data) {
                const merged = {
                    locationSettings: { ...defaultSettings.locationSettings, ...response.data.locationSettings },
                    operationalSettings: { ...defaultSettings.operationalSettings, ...response.data.operationalSettings },
                    notificationSettings: { ...defaultSettings.notificationSettings, ...response.data.notificationSettings },
                    staffSettings: { ...defaultSettings.staffSettings, ...response.data.staffSettings },
                }
                setSettings(merged)
                originalSettingsRef.current = JSON.stringify(merged)
            } else {
                originalSettingsRef.current = JSON.stringify(defaultSettings)
            }
        } catch (error) {
            console.error('Error loading settings:', error)
            originalSettingsRef.current = JSON.stringify(defaultSettings)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadSettings()
    }, [loadSettings])

    const handleSave = async () => {
        try {
            setIsSaving(true)
            const response = await apiClient.put('/settings/location', settings)
            if (response.success) {
                originalSettingsRef.current = JSON.stringify(settings)
                toast.success('Settings saved successfully')
            } else {
                toast.error(response.message || 'Failed to save settings')
            }
        } catch (error: any) {
            console.error('Failed to save settings:', error)
            toast.error(error?.response?.data?.message || 'Failed to save settings')
        } finally {
            setIsSaving(false)
        }
    }

    const handleReset = () => {
        setSettings(defaultSettings)
        toast.info('Settings reset to defaults')
    }

    const { locationSettings, operationalSettings, notificationSettings, staffSettings } = settings

    const updateLocationField = (field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            locationSettings: { ...prev.locationSettings, [field]: value }
        }))
    }

    const updateOperatingHours = (field: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            locationSettings: {
                ...prev.locationSettings,
                operatingHours: { ...prev.locationSettings.operatingHours, [field]: value }
            }
        }))
    }

    const updateClassSize = (field: string, value: number) => {
        setSettings(prev => ({
            ...prev,
            operationalSettings: {
                ...prev.operationalSettings,
                classSize: { ...prev.operationalSettings.classSize, [field]: value }
            }
        }))
    }

    const updatePricing = (field: string, value: number) => {
        setSettings(prev => ({
            ...prev,
            operationalSettings: {
                ...prev.operationalSettings,
                pricing: { ...prev.operationalSettings.pricing, [field]: value }
            }
        }))
    }

    const updateNotification = (field: string, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            notificationSettings: { ...prev.notificationSettings, [field]: value }
        }))
    }

    const updateStaffSettings = (field: string, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            staffSettings: { ...prev.staffSettings, [field]: value }
        }))
    }

    const isDirty = originalSettingsRef.current !== '' && JSON.stringify(settings) !== originalSettingsRef.current

    const tabs = [
        { id: 'location', label: 'Location', fullLabel: 'Location Info', icon: MapPin },
        { id: 'operations', label: 'Ops', fullLabel: 'Operations', icon: Settings },
        { id: 'notifications', label: 'Notifs', fullLabel: 'Notifications', icon: Bell },
        { id: 'staff', label: 'Staff', fullLabel: 'Staff Settings', icon: Users }
    ]

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Location Settings</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">Manage location configuration and preferences</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button id="manager-settings-reset-btn" variant="outline" size="sm" onClick={handleReset}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Reset</span>
                    </Button>
                    <Button id="manager-settings-save-btn" size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button id={`manager-settings-tab-${tab.id}-btn`}
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">{tab.fullLabel}</span>
                                <span className="sm:hidden">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </CardHeader>
            </Card>

            {/* Location Info Tab */}
            {activeTab === 'location' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base sm:text-lg">Basic Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
                                    <input type="text" value={locationSettings.name}
                                        onChange={(e) => updateLocationField('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select value={locationSettings.status}
                                        onChange={(e) => updateLocationField('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                        <option value="active">Active</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <textarea value={locationSettings.address} rows={2}
                                    onChange={(e) => updateLocationField('address', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input type="tel" value={locationSettings.phone}
                                        onChange={(e) => updateLocationField('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input type="email" value={locationSettings.email}
                                        onChange={(e) => updateLocationField('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base sm:text-lg">Operating Hours</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekdays</label>
                                    <input type="text" value={locationSettings.operatingHours.weekdays}
                                        onChange={(e) => updateOperatingHours('weekdays', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekends</label>
                                    <input type="text" value={locationSettings.operatingHours.weekends}
                                        onChange={(e) => updateOperatingHours('weekends', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Operations Tab */}
            {activeTab === 'operations' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base sm:text-lg">Class Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Object.entries(operationalSettings.classSize).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 capitalize">{key} Size</label>
                                        <input type="number" value={value}
                                            onChange={(e) => updateClassSize(key, parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base sm:text-lg">Pricing Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Object.entries(operationalSettings.pricing).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 capitalize">{key} (HK$)</label>
                                        <input type="number" value={value}
                                            onChange={(e) => updatePricing(key, parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base sm:text-lg">Notification Preferences</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { key: 'emailNotifications', title: 'Email Notifications', desc: 'Receive updates via email' },
                                { key: 'smsNotifications', title: 'SMS Notifications', desc: 'Receive updates via SMS' },
                                { key: 'classReminders', title: 'Class Reminders', desc: 'Send reminders to students' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between p-3 sm:p-0">
                                    <div>
                                        <h4 className="font-medium text-sm sm:text-base">{item.title}</h4>
                                        <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                    <input type="checkbox"
                                        checked={(notificationSettings as any)[item.key]}
                                        onChange={(e) => updateNotification(item.key, e.target.checked)}
                                        className="w-4 h-4 flex-shrink-0" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Staff Tab */}
            {activeTab === 'staff' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base sm:text-lg">Staff Permissions</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { key: 'scheduleManagement', title: 'Schedule Management', desc: 'Allow staff to modify schedules' },
                                { key: 'studentRecords', title: 'Student Records', desc: 'Access to student information' },
                                { key: 'paymentProcessing', title: 'Payment Processing', desc: 'Handle payment transactions' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between p-3 sm:p-0">
                                    <div>
                                        <h4 className="font-medium text-sm sm:text-base">{item.title}</h4>
                                        <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                    <input type="checkbox"
                                        checked={(staffSettings as any)[item.key]}
                                        onChange={(e) => updateStaffSettings(item.key, e.target.checked)}
                                        className="w-4 h-4 flex-shrink-0" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}

export default ManagerSettingsPage
