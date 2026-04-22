'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Lock,
    Mail,
    Phone,
    MapPin,
    Bell,
    Eye,
    EyeOff,
    Save,
    AlertCircle,
    CheckCircle2,
    Loader
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import settingsService from '@/services/modules/settings.service'

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

export default function SettingsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy' | 'password'>('account')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [settings, setSettings] = useState<SettingsData>({
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        notifications: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            classReminders: true,
            paymentAlerts: true,
            promotionalEmails: false,
        },
        privacy: {
            profileVisibility: 'private',
            showAchievements: true,
            showProgress: true,
            allowMessaging: true,
        },
    })

    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            setLoading(true)
            const data = await settingsService.getSettings()
            if (data) {
                setSettings(prev => ({ ...prev, ...data }))
            }
        } catch (error) {
            console.error('Failed to load settings:', error)
            setMessage({ type: 'error', text: 'Failed to load settings' })
        } finally {
            setLoading(false)
        }
    }

    const handleAccountChange = (field: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleNotificationChange = (field: string, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [field]: value
            }
        }))
    }

    const handlePrivacyChange = (field: string, value: string | boolean) => {
        setSettings(prev => ({
            ...prev,
            privacy: {
                ...prev.privacy,
                [field]: value
            }
        }))
    }

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const saveAccountSettings = async () => {
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
            setMessage({ type: 'success', text: 'Account settings updated successfully' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update account settings' })
        } finally {
            setSaving(false)
        }
    }

    const saveNotificationSettings = async () => {
        try {
            setSaving(true)
            await settingsService.updateNotificationPreferences(settings.notifications)
            setMessage({ type: 'success', text: 'Notification preferences updated' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update notification preferences' })
        } finally {
            setSaving(false)
        }
    }

    const savePrivacySettings = async () => {
        try {
            setSaving(true)
            await settingsService.updatePrivacySettings(settings.privacy)
            setMessage({ type: 'success', text: 'Privacy settings updated' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update privacy settings' })
        } finally {
            setSaving(false)
        }
    }

    const changePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' })
            return
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
            return
        }

        try {
            setSaving(true)
            await settingsService.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            )
            setMessage({ type: 'success', text: 'Password changed successfully' })
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to change password' })
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
                            {/* Email */}
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
                            </div>

                            {/* Phone */}
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
                            </div>

                            {/* Address */}
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

                            {/* City, State, Zip */}
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

                            {/* Country */}
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
                            {/* Profile Visibility */}
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

                            {/* Show Achievements */}
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

                            {/* Show Progress */}
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

                            {/* Allow Messaging */}
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

            {/* Password Tab */}
            {activeTab === 'password' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>

                        <div className="space-y-4">
                            {/* Current Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    Current Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                        className="w-full pr-10"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    New Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                        className="w-full pr-10"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                        className="w-full pr-10"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={changePassword}
                            disabled={saving}
                            className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            {saving ? 'Changing...' : 'Change Password'}
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
