'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, Bell, Lock, Mail, Save, AlertCircle, CheckCircle, Eye, EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LocationManagerService } from '@/services/locationManagerService'
import { useTrackUnsavedChanges } from '@/hooks/useTrackUnsavedChanges'

export default function LocationSettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('general')
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [passwordSuccess, setPasswordSuccess] = useState(false)

    const [settings, setSettings] = useState({
        locationName: '',
        locationCode: '',
        managerName: '',
        managerEmail: '',
        managerPhone: '',
        businessPhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        timezone: 'America/New_York',
        currency: 'USD',
        operatingHours: '',
        notificationsEmail: true,
        notificationsSMS: true,
        notificationsPush: true,
        maintenanceMode: false,
    })

    const originalSettingsRef = useRef<string>('')

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const data = await LocationManagerService.getSettings()
                if (data) {
                    const merged = {
                        ...settings,
                        locationName: data.locationName || settings.locationName,
                        locationCode: data.locationCode || settings.locationCode,
                        managerName: data.managerName || settings.managerName,
                        managerEmail: data.managerEmail || settings.managerEmail,
                        managerPhone: data.managerPhone || settings.managerPhone,
                        businessPhone: data.businessPhone || settings.businessPhone,
                        address: data.address || settings.address,
                        city: data.city || settings.city,
                        state: data.state || settings.state,
                        zipCode: data.zipCode || settings.zipCode,
                        timezone: data.timezone || settings.timezone,
                        currency: data.currency || settings.currency,
                        operatingHours: data.operatingHours || settings.operatingHours,
                        notificationsEmail: data.notificationsEmail ?? settings.notificationsEmail,
                        notificationsSMS: data.notificationsSMS ?? settings.notificationsSMS,
                        notificationsPush: data.notificationsPush ?? settings.notificationsPush,
                        maintenanceMode: data.maintenanceMode ?? settings.maintenanceMode,
                    }
                    setSettings(merged)
                    originalSettingsRef.current = JSON.stringify(merged)
                } else {
                    originalSettingsRef.current = JSON.stringify(settings)
                }
            } catch (err: any) {
                console.error('Error loading settings:', err)
                setError(err.message || 'Failed to load settings')
                originalSettingsRef.current = JSON.stringify(settings)
            } finally {
                setIsLoading(false)
            }
        }
        loadSettings()
    }, [])

    const isDirty = !isLoading && originalSettingsRef.current !== '' && JSON.stringify(settings) !== originalSettingsRef.current

    const saveForLogout = useCallback(async () => {
        await LocationManagerService.updateSettings(settings)
        originalSettingsRef.current = JSON.stringify(settings)
    }, [settings])

    useTrackUnsavedChanges('location-settings', 'Location Settings', isDirty, saveForLogout)

    const handleInputChange = (field: string, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }))
    }

    const handleSaveSettings = async () => {
        try {
            setIsSaving(true)
            setSaveSuccess(false)
            await LocationManagerService.updateSettings(settings)
            originalSettingsRef.current = JSON.stringify(settings)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err: any) {
            alert('Failed to save settings: ' + err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleChangePassword = async () => {
        setPasswordError(null)
        setPasswordSuccess(false)

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters')
            return
        }

        try {
            await LocationManagerService.changePassword(passwordData.currentPassword, passwordData.newPassword)
            setPasswordSuccess(true)
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setTimeout(() => setPasswordSuccess(false), 3000)
        } catch (err: any) {
            setPasswordError(err.message || 'Failed to change password')
        }
    }

    const tabs = [
        { id: 'general', name: 'General', icon: Settings },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'security', name: 'Security', icon: Lock },
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
                <h1 className="text-3xl font-bold text-gray-900">Location Settings</h1>
                <p className="text-gray-600 mt-1">Manage your location configuration</p>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                    <button id="admin-location-settings-btn"
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Location Information</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location Name</label>
                                    <Input value={settings.locationName} onChange={(e) => handleInputChange('locationName', e.target.value)} placeholder="Enter location name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location Code</label>
                                    <Input value={settings.locationCode} onChange={(e) => handleInputChange('locationCode', e.target.value)} placeholder="Enter location code" disabled />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager Name</label>
                                    <Input value={settings.managerName} onChange={(e) => handleInputChange('managerName', e.target.value)} placeholder="Enter manager name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager Email</label>
                                    <Input type="email" value={settings.managerEmail} onChange={(e) => handleInputChange('managerEmail', e.target.value)} placeholder="Enter manager email" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager Phone</label>
                                    <Input type="tel" value={settings.managerPhone} onChange={(e) => handleInputChange('managerPhone', e.target.value)} placeholder="Enter manager phone" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                                    <Input type="tel" value={settings.businessPhone} onChange={(e) => handleInputChange('businessPhone', e.target.value)} placeholder="Enter business phone" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Location Address</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <Input value={settings.address} onChange={(e) => handleInputChange('address', e.target.value)} placeholder="Enter street address" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <Input value={settings.city} onChange={(e) => handleInputChange('city', e.target.value)} placeholder="Enter city" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                    <Input value={settings.state} onChange={(e) => handleInputChange('state', e.target.value)} placeholder="Enter state" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                                    <Input value={settings.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} placeholder="Enter ZIP code" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                    <select id="select-admin-location-settings-1" value={settings.timezone} onChange={(e) => handleInputChange('timezone', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="America/New_York">Eastern Time (ET)</option>
                                        <option value="America/Chicago">Central Time (CT)</option>
                                        <option value="America/Denver">Mountain Time (MT)</option>
                                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select id="select-admin-location-settings-2" value={settings.currency} onChange={(e) => handleInputChange('currency', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="USD">US Dollar (USD)</option>
                                        <option value="EUR">Euro (EUR)</option>
                                        <option value="GBP">British Pound (GBP)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours</label>
                                    <Input value={settings.operatingHours} onChange={(e) => handleInputChange('operatingHours', e.target.value)} placeholder="e.g., 9:00 AM - 8:00 PM" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { field: 'notificationsEmail', label: 'Email Notifications', desc: 'Receive alerts via email' },
                                { field: 'notificationsSMS', label: 'SMS Notifications', desc: 'Receive alerts via SMS' },
                                { field: 'notificationsPush', label: 'Push Notifications', desc: 'Receive in-app alerts' },
                            ].map((item) => (
                                <div key={item.field} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.label}</p>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={(settings as any)[item.field]}
                                            onChange={(e) => handleInputChange(item.field, e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            {passwordError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-700">{passwordError}</p>
                                </div>
                            )}
                            {passwordSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <p className="text-sm text-green-700">Password changed successfully</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                <div className="relative">
                                    <Input type={showPassword ? 'text' : 'password'} value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} placeholder="Enter current password" />
                                    <button id="admin-location-settings-btn-2" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <Input type="password" value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="Enter new password" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <Input type="password" value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} placeholder="Confirm new password" />
                            </div>
                            <button id="admin-location-settings-btn-update-password" onClick={handleChangePassword}
                                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                Update Password
                            </button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Maintenance Mode</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Maintenance Mode</p>
                                    <p className="text-sm text-gray-600">Temporarily disable location access</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={settings.maintenanceMode}
                                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Save Button */}
            <div className="flex gap-4">
                <button id="admin-location-settings-btn-saving" onClick={handleSaveSettings} disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>Saving...</>
                    ) : (
                        <><Save className="w-5 h-5" />Save Changes</>
                    )}
                </button>
                {saveSuccess && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Settings saved successfully</span>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
