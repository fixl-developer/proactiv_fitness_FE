'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Trash2, Settings, Check, AlertCircle, Info, CheckCircle2, CheckCheck, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { apiClient } from '@/services/api/client'

interface Notification {
    _id: string
    title: string
    message: string
    time?: string
    createdAt?: string
    read: boolean
    type: 'reminder' | 'payment' | 'achievement' | 'alert' | 'info' | string
}

interface Preferences {
    emailEnabled: boolean
    pushEnabled: boolean
    smsEnabled: boolean
    bookings: boolean
    payments: boolean
    achievements: boolean
    social: boolean
    marketing: boolean
    quietStart: string
    quietEnd: string
}

const DEFAULT_PREFERENCES: Preferences = {
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    bookings: true,
    payments: true,
    achievements: true,
    social: true,
    marketing: false,
    quietStart: '22:00',
    quietEnd: '07:00',
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
    const [showPreferences, setShowPreferences] = useState(false)
    const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
    const [savingPrefs, setSavingPrefs] = useState(false)
    const [prefsErrors, setPrefsErrors] = useState<Record<string, string>>({})
    const [detailNotif, setDetailNotif] = useState<Notification | null>(null)

    useEffect(() => {
        fetchNotifications()
        fetchPreferences()
    }, [])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            setError(null)
            const res: any = await apiClient.get('/user/notifications')
            const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
            setNotifications(list)
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to fetch notifications')
            setNotifications([])
        } finally {
            setLoading(false)
        }
    }

    const fetchPreferences = async () => {
        try {
            const res: any = await apiClient.get('/user/notifications/preferences')
            const data = res?.data || res
            if (data && typeof data === 'object') {
                setPreferences({ ...DEFAULT_PREFERENCES, ...data })
            }
        } catch (err) {
            // Keep defaults if preferences endpoint not available
        }
    }

    const handleMarkAsRead = async (id: string) => {
        try {
            await apiClient.put(`/user/notifications/${id}/read`, {})
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to mark as read')
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await apiClient.put('/user/notifications/read-all', {})
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to mark all as read')
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this notification? This cannot be undone.')) return
        try {
            await apiClient.delete(`/user/notifications/${id}`)
            setNotifications(prev => prev.filter(n => n._id !== id))
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to delete notification')
        }
    }

    const validatePreferences = (): boolean => {
        const errs: Record<string, string> = {}
        if (!preferences.quietStart) errs.quietStart = 'Quiet hours start is required'
        if (!preferences.quietEnd) errs.quietEnd = 'Quiet hours end is required'
        setPrefsErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleUpdatePreferences = async () => {
        if (!validatePreferences()) return
        try {
            setSavingPrefs(true)
            await apiClient.put('/user/notifications/preferences', preferences)
            setShowPreferences(false)
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to update preferences')
        } finally {
            setSavingPrefs(false)
        }
    }

    const handleRowClick = (notif: Notification) => {
        if (!notif.read) {
            handleMarkAsRead(notif._id)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'reminder':
                return <Bell className="w-5 h-5 text-blue-600" />
            case 'payment':
                return <CheckCircle2 className="w-5 h-5 text-green-600" />
            case 'achievement':
                return <CheckCircle2 className="w-5 h-5 text-purple-600" />
            case 'alert':
                return <AlertCircle className="w-5 h-5 text-red-600" />
            default:
                return <Info className="w-5 h-5 text-gray-600" />
        }
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'reminder':
                return 'border-l-blue-500 bg-blue-50'
            case 'payment':
                return 'border-l-green-500 bg-green-50'
            case 'achievement':
                return 'border-l-purple-500 bg-purple-50'
            case 'alert':
                return 'border-l-red-500 bg-red-50'
            default:
                return 'border-l-gray-500 bg-gray-50'
        }
    }

    const filteredNotifications = notifications.filter(n => {
        if (filterType === 'unread') return !n.read
        if (filterType === 'read') return n.read
        return true
    })

    const unreadCount = notifications.filter(n => !n.read).length

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading notifications...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-2 text-sm font-medium">Stay updated with your activities</p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button
                            onClick={handleMarkAllRead}
                            variant="outline"
                            className="border-gray-200 hover:bg-gray-50"
                        >
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Mark all read
                        </Button>
                    )}
                    <Button
                        onClick={() => setShowPreferences(true)}
                        variant="outline"
                        className="border-gray-200 hover:bg-gray-50"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Preferences
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-semibold text-sm">Error</p>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* Filter Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
            >
                <Button
                    onClick={() => setFilterType('all')}
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    className={filterType === 'all' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-gray-200 hover:bg-gray-50'}
                >
                    All ({notifications.length})
                </Button>
                <Button
                    onClick={() => setFilterType('unread')}
                    variant={filterType === 'unread' ? 'default' : 'outline'}
                    className={filterType === 'unread' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-gray-200 hover:bg-gray-50'}
                >
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                </Button>
                <Button
                    onClick={() => setFilterType('read')}
                    variant={filterType === 'read' ? 'default' : 'outline'}
                    className={filterType === 'read' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-gray-200 hover:bg-gray-50'}
                >
                    Read ({notifications.length - unreadCount})
                </Button>
            </motion.div>

            {/* Notifications List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {filteredNotifications.length > 0 ? (
                    <div className="space-y-3">
                        {filteredNotifications.map((notif, index) => (
                            <motion.div
                                key={notif._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Card
                                    onClick={() => handleRowClick(notif)}
                                    className={`p-4 border-l-4 cursor-pointer ${getNotificationColor(notif.type)} ${notif.read ? 'opacity-75' : ''}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="mt-1">
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                                                <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {notif.time || (notif.createdAt ? new Date(notif.createdAt).toLocaleString() : '')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => {
                                                    setDetailNotif(notif)
                                                    if (!notif.read) handleMarkAsRead(notif._id)
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {!notif.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif._id)}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notif._id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 border-gray-200/50 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No notifications</p>
                    </Card>
                )}
            </motion.div>

            {/* Preferences Drawer */}
            <SlideInDrawer
                isOpen={showPreferences}
                onClose={() => setShowPreferences(false)}
                title="Notification Preferences"
                description="Control how and when you receive notifications"
                size="md"
                footer={
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreferences(false)}
                            disabled={savingPrefs}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdatePreferences}
                            disabled={savingPrefs}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {savingPrefs ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* Channels */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Channels</h4>
                        <div className="space-y-3">
                            {([
                                { key: 'emailEnabled', label: 'Email Notifications' },
                                { key: 'pushEnabled', label: 'Push Notifications' },
                                { key: 'smsEnabled', label: 'SMS Notifications' },
                            ] as const).map(pref => (
                                <label key={pref.key} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences[pref.key]}
                                        onChange={(e) => setPreferences({ ...preferences, [pref.key]: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-gray-700 font-medium">{pref.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Categories</h4>
                        <div className="space-y-3">
                            {([
                                { key: 'bookings', label: 'Class Bookings & Reminders' },
                                { key: 'payments', label: 'Payments & Billing' },
                                { key: 'achievements', label: 'Achievements & Milestones' },
                                { key: 'social', label: 'Social Activity' },
                                { key: 'marketing', label: 'Marketing & Promotions' },
                            ] as const).map(pref => (
                                <label key={pref.key} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences[pref.key]}
                                        onChange={(e) => setPreferences({ ...preferences, [pref.key]: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-gray-700 font-medium">{pref.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Quiet hours */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Quiet Hours</h4>
                        <p className="text-xs text-gray-500 mb-3">No notifications will be sent during these hours.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Start</label>
                                <input
                                    type="time"
                                    value={preferences.quietStart}
                                    onChange={(e) => setPreferences({ ...preferences, quietStart: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                                {prefsErrors.quietStart && (
                                    <p className="text-xs text-red-600 mt-1">{prefsErrors.quietStart}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">End</label>
                                <input
                                    type="time"
                                    value={preferences.quietEnd}
                                    onChange={(e) => setPreferences({ ...preferences, quietEnd: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                                {prefsErrors.quietEnd && (
                                    <p className="text-xs text-red-600 mt-1">{prefsErrors.quietEnd}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </SlideInDrawer>

            {/* Notification Details Drawer */}
            <SlideInDrawer
                isOpen={!!detailNotif}
                onClose={() => setDetailNotif(null)}
                title={detailNotif?.title || 'Notification'}
                description={
                    detailNotif?.createdAt
                        ? new Date(detailNotif.createdAt).toLocaleString()
                        : detailNotif?.time
                }
                size="md"
                footer={
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setDetailNotif(null)}>
                            Close
                        </Button>
                        {detailNotif && (
                            <Button
                                onClick={() => {
                                    handleDelete(detailNotif._id)
                                    setDetailNotif(null)
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                }
            >
                {detailNotif && (
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center gap-2">
                            {getNotificationIcon(detailNotif.type)}
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                                {detailNotif.type}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${detailNotif.read ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                                {detailNotif.read ? 'Read' : 'Unread'}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Message</p>
                            <p className="text-gray-900 whitespace-pre-line">{detailNotif.message}</p>
                        </div>
                        {detailNotif.createdAt && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Received</p>
                                <p className="text-gray-700">{new Date(detailNotif.createdAt).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                )}
            </SlideInDrawer>
        </div>
    )
}
