'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Mail, AlertCircle, CheckCircle, Trash2, Settings, ToggleLeft } from 'lucide-react'
import { HQAdminService } from '@/services/hqAdminService'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [settings, setSettings] = useState({
        emailNotifications: true,
        systemAlerts: true,
        userActivityAlerts: true,
        performanceAlerts: true,
        securityAlerts: true,
        dailyDigest: true,
    })

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            setIsLoading(true)
            setError(null)
            // Will call backend when available
            const data = await HQAdminService.getNotifications?.()
            setNotifications(data || getMockNotifications())
        } catch (err: any) {
            console.error('Error fetching notifications:', err)
            setError(err.message)
            setNotifications(getMockNotifications())
        } finally {
            setIsLoading(false)
        }
    }

    const getMockNotifications = () => [
        {
            id: 1,
            type: 'alert',
            title: 'High Memory Usage',
            message: 'System memory usage exceeded 80%',
            timestamp: '2 hours ago',
            read: false,
            icon: AlertCircle,
        },
        {
            id: 2,
            type: 'success',
            title: 'Backup Completed',
            message: 'Database backup completed successfully',
            timestamp: '4 hours ago',
            read: false,
            icon: CheckCircle,
        },
        {
            id: 3,
            type: 'info',
            title: 'New User Registration',
            message: '5 new users registered today',
            timestamp: '6 hours ago',
            read: true,
            icon: Bell,
        },
        {
            id: 4,
            type: 'warning',
            title: 'Failed Login Attempts',
            message: '10 failed login attempts detected',
            timestamp: '8 hours ago',
            read: true,
            icon: AlertCircle,
        },
        {
            id: 5,
            type: 'success',
            title: 'System Update',
            message: 'System updated to version 2.1.0',
            timestamp: '1 day ago',
            read: true,
            icon: CheckCircle,
        },
    ]

    const handleDeleteNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id))
    }

    const handleMarkAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const handleSaveSettings = async () => {
        try {
            await HQAdminService.updateNotificationSettings?.(settings)
            alert('Notification settings saved successfully!')
        } catch (err: any) {
            alert('Failed to save settings: ' + err.message)
        }
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'alert':
                return 'bg-red-50 border-red-200'
            case 'warning':
                return 'bg-yellow-50 border-yellow-200'
            case 'success':
                return 'bg-green-50 border-green-200'
            case 'info':
                return 'bg-blue-50 border-blue-200'
            default:
                return 'bg-gray-50 border-gray-200'
        }
    }

    const getNotificationBadgeColor = (type: string) => {
        switch (type) {
            case 'alert':
                return 'bg-red-100 text-red-800'
            case 'warning':
                return 'bg-yellow-100 text-yellow-800'
            case 'success':
                return 'bg-green-100 text-green-800'
            case 'info':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications & Alerts</h1>
                    <p className="text-gray-600 mt-1">Manage system notifications and alerts</p>
                </div>
                {unreadCount > 0 && (
                    <Badge className="bg-red-600 text-white text-lg px-3 py-1">
                        {unreadCount} Unread
                    </Badge>
                )}
            </div>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-600" />
                        Notification Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(settings).map(([key, value]) => (
                            <label key={key} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <input
                                    type="checkbox"
                                    checked={value as boolean}
                                    onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </span>
                            </label>
                        ))}
                        <button
                            onClick={handleSaveSettings}
                            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Save Settings
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                {notifications.map((notification, idx) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`border-2 rounded-lg p-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'ring-2 ring-blue-400' : ''}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <notification.icon className="w-6 h-6 mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                        <Badge className={getNotificationBadgeColor(notification.type)}>
                                            {notification.type}
                                        </Badge>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-600 mt-2">{notification.timestamp}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                {!notification.read && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="Mark as read"
                                    >
                                        <CheckCircle className="w-5 h-5 text-gray-600" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    className="p-2 hover:bg-red-200 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {notifications.length === 0 && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No notifications</p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ {error} - Showing mock data for development
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
