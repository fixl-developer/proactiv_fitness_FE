'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Trash2, Settings, Check, AlertCircle, Info, CheckCircle2, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { notificationService } from '@/services/modules/notification.service'

interface Notification {
    _id: string
    title: string
    message: string
    time: string
    read: boolean
    type: 'reminder' | 'payment' | 'achievement' | 'alert' | 'info'
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
    const [showPreferences, setShowPreferences] = useState(false)
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        classReminders: true,
        paymentAlerts: true,
        achievementNotifications: true
    })

    useEffect(() => {
        fetchNotifications()
        fetchPreferences()
    }, [])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const res = await notificationService.getNotifications()
            if (res.success) {
                setNotifications(res.data || [])
            } else {
                setError(res.error || 'Failed to fetch notifications')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch notifications')
        } finally {
            setLoading(false)
        }
    }

    const fetchPreferences = async () => {
        try {
            const res = await notificationService.getPreferences()
            if (res.success) {
                setPreferences(res.data || preferences)
            }
        } catch (err: any) {
            console.error('Failed to fetch preferences:', err)
        }
    }

    const handleMarkAsRead = async (id: string) => {
        try {
            const res = await notificationService.markAsRead(id)
            if (res.success) {
                setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n))
            } else {
                setError(res.error || 'Failed to mark as read')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to mark as read')
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await notificationService.deleteNotification(id)
            if (res.success) {
                setNotifications(notifications.filter(n => n._id !== id))
            } else {
                setError(res.error || 'Failed to delete notification')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to delete notification')
        }
    }

    const handleUpdatePreferences = async () => {
        try {
            const res = await notificationService.updatePreferences(preferences)
            if (res.success) {
                setShowPreferences(false)
            } else {
                setError(res.error || 'Failed to update preferences')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update preferences')
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-2 text-sm font-medium">Stay updated with your activities</p>
                </div>
                <Button
                    onClick={() => setShowPreferences(!showPreferences)}
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                >
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                </Button>
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

            {/* Preferences Panel */}
            {showPreferences && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-6 border-emerald-200/50 bg-emerald-50/50">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
                        <div className="space-y-4">
                            {[
                                { key: 'emailNotifications', label: 'Email Notifications' },
                                { key: 'pushNotifications', label: 'Push Notifications' },
                                { key: 'smsNotifications', label: 'SMS Notifications' },
                                { key: 'classReminders', label: 'Class Reminders' },
                                { key: 'paymentAlerts', label: 'Payment Alerts' },
                                { key: 'achievementNotifications', label: 'Achievement Notifications' }
                            ].map(pref => (
                                <label key={pref.key} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences[pref.key as keyof typeof preferences]}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            [pref.key]: e.target.checked
                                        })}
                                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-gray-700 font-medium">{pref.label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={handleUpdatePreferences}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                                Save Preferences
                            </Button>
                            <Button
                                onClick={() => setShowPreferences(false)}
                                variant="outline"
                                className="flex-1 border-gray-200 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>
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
                    All
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
                    Read
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
                                <Card className={`p-4 border-l-4 ${getNotificationColor(notif.type)} ${notif.read ? 'opacity-75' : ''}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="mt-1">
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                                                <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                                                <p className="text-xs text-gray-500 mt-2">{notif.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
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
        </div>
    )
}
