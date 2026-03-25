'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, MapPin, Clock, Users, DollarSign, Bell, Shield, Save,
    Edit, RefreshCw, Camera, Mail, Phone, Globe, Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LocationManagerService } from '@/services/locationManagerService'
import { useTrackUnsavedChanges } from '@/hooks/useTrackUnsavedChanges'

const ManagerSettingsPage = () => {
    const [isLoading, setIsLoading] = useState(true)
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
            classSize: {
                beginner: 12,
                intermediate: 10,
                advanced: 8,
                private: 1
            },
            pricing: {
                beginner: 1800,
                intermediate: 2100,
                advanced: 2400,
                private: 800
            },
            bookingSettings: {
                advanceBooking: 30,
                cancellationPolicy: 24,
                waitlistEnabled: true
            }
        }
    }

    const [settings, setSettings] = useState(defaultSettings)
    const originalSettingsRef = useRef<string>('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isAuthenticated = localStorage.getItem('isAuthenticated')
            const userRole = localStorage.getItem('userRole')
            if (!isAuthenticated || userRole !== 'MANAGER') {
                window.location.href = '/login'
                return
            }
        }
        // Initialize with default settings and record original state
        originalSettingsRef.current = JSON.stringify(defaultSettings)
        setTimeout(() => setIsLoading(false), 1000)
    }, [])

    const { locationSettings, operationalSettings } = settings

    const isDirty = originalSettingsRef.current !== '' && JSON.stringify(settings) !== originalSettingsRef.current

    const saveForLogout = useCallback(async () => {
        await LocationManagerService.updateSettings(settings as any)
        originalSettingsRef.current = JSON.stringify(settings)
    }, [settings])

    useTrackUnsavedChanges('manager-settings', 'Manager Settings', isDirty, saveForLogout)

    const tabs = [
        { id: 'location', label: 'Location Info', icon: MapPin },
        { id: 'operations', label: 'Operations', icon: Settings },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'staff', label: 'Staff Settings', icon: Users }
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Location Settings</h1>
                    <p className="text-gray-600 mt-2">Manage location configuration and preferences</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button id="manager-settings-reset-btn" variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    <Button id="manager-settings-save-btn" size="sm" onClick={async () => {
                        try {
                            await LocationManagerService.updateSettings(settings as any)
                            originalSettingsRef.current = JSON.stringify(settings)
                        } catch (error) {
                            console.error('Failed to save settings:', error)
                        }
                    }}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        {tabs.map((tab) => (
                            <button id={`manager-settings-tab-${tab.id}-btn`}
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </CardHeader>
            </Card>

            {/* Location Info Tab */}
            {activeTab === 'location' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
                                    <input
                                        type="text"
                                        value={locationSettings.name}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select id="select-manager-settings-7" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                                        <option value="active">Active</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <textarea
                                    value={locationSettings.address}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={locationSettings.phone}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={locationSettings.email}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Operating Hours</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekdays</label>
                                    <input
                                        type="text"
                                        value={locationSettings.operatingHours.weekdays}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekends</label>
                                    <input
                                        type="text"
                                        value={locationSettings.operatingHours.weekends}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Operations Tab */}
            {activeTab === 'operations' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Beginner Class Size</label>
                                    <input
                                        type="number"
                                        value={operationalSettings.classSize.beginner}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Intermediate Class Size</label>
                                    <input
                                        type="number"
                                        value={operationalSettings.classSize.intermediate}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Advanced Class Size</label>
                                    <input
                                        type="number"
                                        value={operationalSettings.classSize.advanced}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Private Sessions</label>
                                    <input
                                        type="number"
                                        value={operationalSettings.classSize.private}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Beginner (HK$)</label>
                                    <input
                                        type="number"
                                        value={operationalSettings.pricing.beginner}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Intermediate (HK$)</label>
                                    <input
                                        type="number"
                                        value={operationalSettings.pricing.intermediate}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Advanced (HK$)</label>
                                    <input
                                        type="number"
                                        value={operationalSettings.pricing.advanced}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Private (HK$)</label>
                                    <input
                                        type="number"
                                        value={operationalSettings.pricing.private}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Email Notifications</h4>
                                        <p className="text-sm text-gray-600">Receive updates via email</p>
                                    </div>
                                    <input id="manager-settings-email-notifications-checkbox" type="checkbox" className="w-4 h-4" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">SMS Notifications</h4>
                                        <p className="text-sm text-gray-600">Receive updates via SMS</p>
                                    </div>
                                    <input id="manager-settings-sms-notifications-checkbox" type="checkbox" className="w-4 h-4" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Class Reminders</h4>
                                        <p className="text-sm text-gray-600">Send reminders to students</p>
                                    </div>
                                    <input id="manager-settings-class-reminders-checkbox" type="checkbox" className="w-4 h-4" defaultChecked />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Staff Tab */}
            {activeTab === 'staff' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Permissions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Schedule Management</h4>
                                        <p className="text-sm text-gray-600">Allow staff to modify schedules</p>
                                    </div>
                                    <input id="manager-settings-schedule-management-checkbox" type="checkbox" className="w-4 h-4" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Student Records</h4>
                                        <p className="text-sm text-gray-600">Access to student information</p>
                                    </div>
                                    <input id="manager-settings-student-records-checkbox" type="checkbox" className="w-4 h-4" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Payment Processing</h4>
                                        <p className="text-sm text-gray-600">Handle payment transactions</p>
                                    </div>
                                    <input id="manager-settings-payment-processing-checkbox" type="checkbox" className="w-4 h-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    )
}

export default ManagerSettingsPage
