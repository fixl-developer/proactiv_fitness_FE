'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import {
    Lock,
    Mail,
    Phone,
    MapPin,
    Save,
    AlertCircle,
    CheckCircle2,
    Loader,
    Eye,
    EyeOff,
    KeyRound
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import settingsService from '@/services/modules/settings.service'
import {
    validateEmail,
    validatePhone,
    validatePassword,
    validateConfirmPassword,
    validateRequired
} from '@/utils/validation'

interface SettingsData {
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    notifications: {
        emailNotifications: boolean
        smsNotifications: boolean
        pushNotifications: boolean
        classReminders: boolean
        paymentAlerts: boolean
        promotionalEmails: boolean
    }
    privacy: {
        profileVisibility: 'public' | 'private' | 'friends'
        showAchievements: boolean
        showProgress: boolean
        allowMessaging: boolean
    }
}

interface PasswordData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

const EMPTY_SETTINGS: SettingsData = {
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    notifications: {
        emailNotifications: false,
        smsNotifications: false,
        pushNotifications: false,
        classReminders: false,
        paymentAlerts: false,
        promotionalEmails: false,
    },
    privacy: {
        profileVisibility: 'private',
        showAchievements: false,
        showProgress: false,
        allowMessaging: false,
    },
}

export default function SettingsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy' | 'password'>('account')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [passwordDrawerOpen, setPasswordDrawerOpen] = useState(false)
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const [settings, setSettings] = useState<SettingsData>({
        ...EMPTY_SETTINGS,
        email: user?.email || '',
    })
    const [accountErrors, setAccountErrors] = useState<Record<string, string>>({})

    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        loadSettings()
    }, [])

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 3500)
    }

    const loadSettings = async () => {
        try {
            setLoading(true)
            const data = await settingsService.getSettings()
            if (data && typeof data === 'object') {
                setSettings(prev => ({
                    ...prev,
                    ...data,
                    email: data.email || user?.email || '',
                    notifications: { ...prev.notifications, ...(data.notifications || {}) },
                    privacy: { ...prev.privacy, ...(data.privacy || {}) },
                }))
            }
        } catch (error) {
            console.error('Failed to load settings:', error)
            showMessage('error', 'Failed to load settings')
        } finally {
            setLoading(false)
        }
    }

    const handleAccountChange = (field: string, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }))
        if (accountErrors[field]) {
            setAccountErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleNotificationChange = (field: string, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            notifications: { ...prev.notifications, [field]: value }
        }))
    }

    const handlePrivacyChange = (field: string, value: string | boolean) => {
        setSettings(prev => ({
            ...prev,
            privacy: { ...prev.privacy, [field]: value }
        }))
    }

    const handlePasswordFieldChange = (field: keyof PasswordData, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }))
        if (passwordErrors[field]) {
            setPasswordErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const validateAccount = (): boolean => {
        const errors: Record<string, string> = {}
        const emailErr = validateEmail(settings.email)
        if (emailErr) errors.email = emailErr
        if (settings.phone) {
            const phoneErr = validatePhone(settings.phone, false)
            if (phoneErr) errors.phone = phoneErr
        }
        setAccountErrors(errors)
        return Object.keys(errors).length === 0
    }

    const saveAccountSettings = async () => {
        if (!validateAccount()) return
        try {
            setSaving(true)
            await settingsService.updateSettings({
                email: settings.email,
                phone: settings.phone,
                address: settings.address,
                city: settings.city,
                state: settings.state,
                zipCode: settings.zipCode,
                country: settings.country,
            })
            showMessage('success', 'Account settings updated successfully')
        } catch (error) {
            showMessage('error', 'Failed to update account settings')
        } finally {
            setSaving(false)
        }
    }

    const saveNotificationSettings = async () => {
        try {
            setSaving(true)
            await settingsService.updateNotificationPreferences(settings.notifications)
            showMessage('success', 'Notification preferences updated')
        } catch (error) {
            showMessage('error', 'Failed to update notification preferences')
        } finally {
            setSaving(false)
        }
    }

    const savePrivacySettings = async () => {
        try {
            setSaving(true)
            await settingsService.updatePrivacySettings(settings.privacy)
            showMessage('success', 'Privacy settings updated')
        } catch (error) {
            showMessage('error', 'Failed to update privacy settings')
        } finally {
            setSaving(false)
        }
    }

    const validatePasswordForm = (): boolean => {
        const errors: Record<string, string> = {}
        const curErr = validateRequired(passwordData.currentPassword, 'Current password')
        if (curErr) errors.currentPassword = curErr
        const newErr = validatePassword(passwordData.newPassword)
        if (newErr) errors.newPassword = newErr
        const confirmErr = validateConfirmPassword(passwordData.newPassword, passwordData.confirmPassword)
        if (confirmErr) errors.confirmPassword = confirmErr
        setPasswordErrors(errors)
        return Object.keys(errors).length === 0
    }

    const changePassword = async () => {
        if (!validatePasswordForm()) return
        try {
            setSaving(true)
            await settingsService.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            )
            showMessage('success', 'Password changed successfully')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setPasswordErrors({})
            setPasswordDrawerOpen(false)
        } catch (error) {
            showMessage('error', 'Failed to change password')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account preferences and security</p>
            </motion.div>

            {/* Message Alert */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-red-50 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className={message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}>
                        {message.text}
                    </span>
                </motion.div>
            )}

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-gray-200">
                {(['account', 'notifications', 'privacy', 'password'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === tab
                            ? 'border-emerald-600 text-emerald-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Account Settings Tab */}
            {activeTab === 'account' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    value={settings.email}
                                    onChange={(e) => handleAccountChange('email', e.target.value)}
                                    className="w-full"
                                    placeholder="your@email.com"
                                />
                                {accountErrors.email && <p className="text-xs text-red-600 mt-1">{accountErrors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Phone Number
                                </label>
                                <Input
                                    type="tel"
                                    value={settings.phone}
                                    onChange={(e) => handleAccountChange('phone', e.target.value)}
                                    className="w-full"
                                    placeholder="+1 (555) 000-0000"
                                />
                                {accountErrors.phone && <p className="text-xs text-red-600 mt-1">{accountErrors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Address
                                </label>
                                <Input
                                    type="text"
                                    value={settings.address}
                                    onChange={(e) => handleAccountChange('address', e.target.value)}
                                    className="w-full"
                                    placeholder="Street address"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <Input
                                    type="text"
                                    value={settings.city}
                                    onChange={(e) => handleAccountChange('city', e.target.value)}
                                    placeholder="City"
                                />
                                <Input
                                    type="text"
                                    value={settings.state}
                                    onChange={(e) => handleAccountChange('state', e.target.value)}
                                    placeholder="State"
                                />
                                <Input
                                    type="text"
                                    value={settings.zipCode}
                                    onChange={(e) => handleAccountChange('zipCode', e.target.value)}
                                    placeholder="Zip Code"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                <Input
                                    type="text"
                                    value={settings.country}
                                    onChange={(e) => handleAccountChange('country', e.target.value)}
                                    className="w-full"
                                    placeholder="Country"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={saveAccountSettings}
                            disabled={saving}
                            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>

                        <div className="space-y-4">
                            {[
                                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
                                { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive updates via SMS' },
                                { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser notifications' },
                                { key: 'classReminders', label: 'Class Reminders', description: 'Get reminded about upcoming classes' },
                                { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Get notified about payments' },
                                { key: 'promotionalEmails', label: 'Promotional Emails', description: 'Receive special offers and promotions' },
                            ].map(({ key, label, description }) => (
                                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{label}</p>
                                        <p className="text-sm text-gray-600">{description}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={(settings.notifications as any)[key]}
                                            onChange={(e) => handleNotificationChange(key, e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={saveNotificationSettings}
                            disabled={saving}
                            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                                <select
                                    value={settings.privacy.profileVisibility}
                                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    <option value="public">Public - Everyone can see your profile</option>
                                    <option value="friends">Friends Only - Only friends can see</option>
                                    <option value="private">Private - Only you can see</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Show Achievements</p>
                                    <p className="text-sm text-gray-600">Let others see your achievements</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.privacy.showAchievements}
                                        onChange={(e) => handlePrivacyChange('showAchievements', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Show Progress</p>
                                    <p className="text-sm text-gray-600">Let others see your progress</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.privacy.showProgress}
                                        onChange={(e) => handlePrivacyChange('showProgress', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Allow Messaging</p>
                                    <p className="text-sm text-gray-600">Allow others to send you messages</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.privacy.allowMessaging}
                                        onChange={(e) => handlePrivacyChange('allowMessaging', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        </div>

                        <Button
                            onClick={savePrivacySettings}
                            disabled={saving}
                            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Password Tab - opens drawer */}
            {activeTab === 'password' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Password & Security</h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Keep your account secure by using a strong password and changing it regularly.
                        </p>

                        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="bg-emerald-100 p-3 rounded-lg">
                                <Lock className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Change your password</p>
                                <p className="text-sm text-gray-600">
                                    Minimum 8 characters with uppercase, lowercase, number and special character.
                                </p>
                            </div>
                            <Button
                                onClick={() => setPasswordDrawerOpen(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <KeyRound className="w-4 h-4 mr-2" />
                                Change Password
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Password Change Drawer */}
            <SlideInDrawer
                isOpen={passwordDrawerOpen}
                onClose={() => {
                    setPasswordDrawerOpen(false)
                    setPasswordErrors({})
                }}
                title="Change Password"
                description="Set a new password for your account"
                size="md"
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPasswordDrawerOpen(false)
                                setPasswordErrors({})
                            }}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={changePassword}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            {saving ? 'Changing...' : 'Change Password'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showCurrent ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                                className="w-full pr-10"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                            >
                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {passwordErrors.currentPassword && (
                            <p className="text-xs text-red-600 mt-1">{passwordErrors.currentPassword}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showNew ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                                className="w-full pr-10"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                            >
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {passwordErrors.newPassword ? (
                            <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword}</p>
                        ) : (
                            <p className="text-xs text-gray-500 mt-1">
                                Min 8 chars: 1 uppercase, 1 lowercase, 1 number, 1 special character
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showConfirm ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                                className="w-full pr-10"
                                placeholder="Re-enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {passwordErrors.confirmPassword && (
                            <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
                        )}
                    </div>
                </div>
            </SlideInDrawer>
        </div>
    )
}
