'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, Bell, Lock, Mail, Save, AlertCircle, CheckCircle, Eye, EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FranchiseOwnerService, FranchiseSettings } from '@/services/franchiseOwnerService'

interface Toast {
    type: 'success' | 'error'
    message: string
}

interface ValidationErrors {
    franchiseName?: string
    ownerEmail?: string
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
}

const defaultSettings: FranchiseSettings = {
    franchiseName: '',
    franchiseCode: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    businessPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    timezone: 'America/New_York',
    currency: 'USD',
    notificationsEmail: true,
    notificationsSMS: true,
    notificationsPush: true,
    maintenanceMode: false,
}

export default function FranchiseSettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('general')
    const [isSaving, setIsSaving] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [toast, setToast] = useState<Toast | null>(null)
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

    const [settings, setSettings] = useState<FranchiseSettings>(defaultSettings)

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const showToast = useCallback((type: 'success' | 'error', message: string) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 4000)
    }, [])

    // Fetch settings from API on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoading(true)
                setLoadError(null)
                const response = await FranchiseOwnerService.getSettings()
                const data = (response as any)?.data ?? response
                setSettings({
                    franchiseName: data.franchiseName ?? '',
                    franchiseCode: data.franchiseCode ?? '',
                    ownerName: data.ownerName ?? '',
                    ownerEmail: data.ownerEmail ?? '',
                    ownerPhone: data.ownerPhone ?? '',
                    businessPhone: data.businessPhone ?? '',
                    address: data.address ?? '',
                    city: data.city ?? '',
                    state: data.state ?? '',
                    zipCode: data.zipCode ?? '',
                    timezone: data.timezone ?? 'America/New_York',
                    currency: data.currency ?? 'USD',
                    notificationsEmail: data.notificationsEmail ?? true,
                    notificationsSMS: data.notificationsSMS ?? true,
                    notificationsPush: data.notificationsPush ?? true,
                    maintenanceMode: data.maintenanceMode ?? false,
                })
            } catch (error: any) {
                console.error('Failed to load settings:', error)
                setLoadError(error.message || 'Failed to load settings')
            } finally {
                setIsLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleInputChange = (field: keyof FranchiseSettings, value: string | boolean) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }))
        // Clear validation error for this field when user types
        if (field in validationErrors) {
            setValidationErrors(prev => {
                const next = { ...prev }
                delete next[field as keyof ValidationErrors]
                return next
            })
        }
    }

    const validateSettings = (): boolean => {
        const errors: ValidationErrors = {}
        if (!settings.franchiseName.trim()) {
            errors.franchiseName = 'Franchise name is required'
        }
        if (!settings.ownerEmail.trim()) {
            errors.ownerEmail = 'Owner email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.ownerEmail)) {
            errors.ownerEmail = 'Please enter a valid email address'
        }
        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const validatePassword = (): boolean => {
        const errors: ValidationErrors = {}
        if (!currentPassword) {
            errors.currentPassword = 'Current password is required'
        }
        if (!newPassword) {
            errors.newPassword = 'New password is required'
        } else if (newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters'
        }
        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password'
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match'
        }
        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSaveSettings = async () => {
        if (!validateSettings()) return

        setIsSaving(true)
        try {
            await FranchiseOwnerService.updateSettings(settings)
            showToast('success', 'Settings saved successfully')
        } catch (error: any) {
            console.error('Failed to save settings:', error)
            showToast('error', error.message || 'Failed to save settings')
        } finally {
            setIsSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (!validatePassword()) return

        setIsChangingPassword(true)
        try {
            await FranchiseOwnerService.changePassword(currentPassword, newPassword)
            showToast('success', 'Password updated successfully')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setValidationErrors({})
        } catch (error: any) {
            console.error('Failed to change password:', error)
            showToast('error', error.message || 'Failed to change password')
        } finally {
            setIsChangingPassword(false)
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

    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-lg text-gray-700">{loadError}</p>
                <button id="admin-franchise-settings-btn"
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Toast notification */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
                        toast.type === 'success'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                    }`}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                        toast.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                        {toast.message}
                    </span>
                </motion.div>
            )}

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Franchise Settings</h1>
                <p className="text-gray-600 mt-1">Manage your franchise configuration</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                    <button id="admin-franchise-settings-btn-2"
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id)
                            setValidationErrors({})
                        }}
                        className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab.id
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
                            <CardTitle>Franchise Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Franchise Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={settings.franchiseName}
                                        onChange={(e) => handleInputChange('franchiseName', e.target.value)}
                                        placeholder="Enter franchise name"
                                        className={validationErrors.franchiseName ? 'border-red-500' : ''}
                                    />
                                    {validationErrors.franchiseName && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {validationErrors.franchiseName}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Franchise Code</label>
                                    <Input
                                        value={settings.franchiseCode}
                                        placeholder="Franchise code"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                                    <Input
                                        value={settings.ownerName}
                                        onChange={(e) => handleInputChange('ownerName', e.target.value)}
                                        placeholder="Enter owner name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Owner Email <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="email"
                                        value={settings.ownerEmail}
                                        onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                                        placeholder="Enter owner email"
                                        className={validationErrors.ownerEmail ? 'border-red-500' : ''}
                                    />
                                    {validationErrors.ownerEmail && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {validationErrors.ownerEmail}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner Phone</label>
                                    <Input
                                        type="tel"
                                        value={settings.ownerPhone}
                                        onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                                        placeholder="Enter owner phone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                                    <Input
                                        type="tel"
                                        value={settings.businessPhone}
                                        onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                                        placeholder="Enter business phone"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Location Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <Input
                                    value={settings.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="Enter street address"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <Input
                                        value={settings.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        placeholder="Enter city"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                    <Input
                                        value={settings.state}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                        placeholder="Enter state"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                                    <Input
                                        value={settings.zipCode}
                                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                        placeholder="Enter ZIP code"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                    <select
                                        id="select-admin-franchise-settings-1"
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select
                                        id="select-admin-franchise-settings-2"
                                        value={settings.currency}
                                        onChange={(e) => handleInputChange('currency', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="USD">US Dollar (USD)</option>
                                        <option value="EUR">Euro (EUR)</option>
                                        <option value="GBP">British Pound (GBP)</option>
                                    </select>
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
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">Email Notifications</p>
                                        <p className="text-sm text-gray-600">Receive alerts via email</p>
                                    </div>
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
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">SMS Notifications</p>
                                        <p className="text-sm text-gray-600">Receive alerts via SMS</p>
                                    </div>
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
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">Push Notifications</p>
                                        <p className="text-sm text-gray-600">Receive in-app alerts</p>
                                    </div>
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
                            <CardTitle>Change Password</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => {
                                            setCurrentPassword(e.target.value)
                                            if (validationErrors.currentPassword) {
                                                setValidationErrors(prev => {
                                                    const next = { ...prev }
                                                    delete next.currentPassword
                                                    return next
                                                })
                                            }
                                        }}
                                        placeholder="Enter current password"
                                        className={validationErrors.currentPassword ? 'border-red-500' : ''}
                                    />
                                    <button id="admin-franchise-settings-btn-3"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {validationErrors.currentPassword && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {validationErrors.currentPassword}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value)
                                        if (validationErrors.newPassword) {
                                            setValidationErrors(prev => {
                                                const next = { ...prev }
                                                delete next.newPassword
                                                return next
                                            })
                                        }
                                    }}
                                    placeholder="Enter new password (min 8 characters)"
                                    className={validationErrors.newPassword ? 'border-red-500' : ''}
                                />
                                {validationErrors.newPassword && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {validationErrors.newPassword}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value)
                                        if (validationErrors.confirmPassword) {
                                            setValidationErrors(prev => {
                                                const next = { ...prev }
                                                delete next.confirmPassword
                                                return next
                                            })
                                        }
                                    }}
                                    placeholder="Confirm new password"
                                    className={validationErrors.confirmPassword ? 'border-red-500' : ''}
                                />
                                {validationErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {validationErrors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <button id="admin-franchise-settings-btn-4"
                                onClick={handleChangePassword}
                                disabled={isChangingPassword}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isChangingPassword ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Update Password
                                    </>
                                )}
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
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">Maintenance Mode</p>
                                        {settings.maintenanceMode && (
                                            <Badge variant="destructive">Active</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">Temporarily disable franchise access</p>
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

            {/* Save Button */}
            <div className="flex gap-4">
                <button id="admin-franchise-settings-btn-5"
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
            </div>
        </div>
    )
}
