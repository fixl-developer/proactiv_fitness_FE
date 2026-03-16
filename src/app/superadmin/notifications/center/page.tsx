'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bell, Trash2, Check, AlertCircle, Info, CheckCircle, Clock, Filter, Search, Settings } from 'lucide-react'
import { superAdminService } from '@/services/superAdminService'

interface Notification {
    id: string
    type: 'alert' | 'warning' | 'info' | 'success'
    title: string
    message: string
    timestamp: Date
    read: boolean
    actionUrl?: string
}

export default function NotificationCenterPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'unread' | 'alert' | 'warning' | 'info' | 'success'>('all')
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

    useEffect(() => {
        fetchNotifications()
    }, [])

    useEffect(() => {
        filterNotifications()
    }, [notifications, searchTerm, filterType])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const data = await superAdminService.getNotifications()
            setNotifications(data)
        } catch (error) {
            console.error('Error fetching notifications:', error)
            // Fallback mock data
            const mockNotifications: Notification[] = [
                {
                    id: '1',
                    type: 'alert',
                    title: 'Critical System Alert',
                    message: 'High CPU usage detected on production server',
                    timestamp: new Date(Date.now() - 5 * 60 * 1000),
                    read: false,
                    actionUrl: '/superadmin/monitoring/realtime'
                },
                {
                    id: '2',
                    type: 'warning',
                    title: 'Database Warning',
                    message: 'Database connection pool at 85% capacity',
                    timestamp: new Date(Date.now() - 15 * 60 * 1000),
                    read: false,
                    actionUrl: '/superadmin/database/overview'
                },
                {
                    id: '3',
                    type: 'info',
                    title: 'Backup Completed',
                    message: 'Daily backup completed successfully',
                    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                    read: true,
                    actionUrl: '/superadmin/backups/status'
                },
                {
                    id: '4',
                    type: 'success',
                    title: 'System Update',
                    message: 'Security patches applied successfully',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    read: true,
                    actionUrl: '/superadmin/security/dashboard'
                },
                {
                    id: '5',
                    type: 'warning',
                    title: 'API Rate Limit',
                    message: 'API rate limit approaching for external service',
                    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
                    read: false,
                    actionUrl: '/superadmin/platform/rate-limiting'
                }
            ]
            setNotifications(mockNotifications)
        } finally {
            setLoading(false)
        }
    }

    const filterNotifications = () => {
        let filtered = notifications

        // Filter by type
        if (filterType !== 'all' && filterType !== 'unread') {
            filtered = filtered.filter(n => n.type === filterType)
        } else if (filterType === 'unread') {
            filtered = filtered.filter(n => !n.read)
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.message.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredNotifications(filtered)
    }

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ))
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id))
        setSelectedNotifications(selectedNotifications.filter(s => s !== id))
    }

    const deleteSelected = () => {
        setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)))
        setSelectedNotifications([])
    }

    const toggleNotificationSelection = (id: string) => {
        setSelectedNotifications(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'alert':
                return <AlertCircle className="w-5 h-5 text-red-500" />
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />
            case 'info':
                return <Info className="w-5 h-5 text-blue-500" />
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            default:
                return <Bell className="w-5 h-5 text-gray-500" />
        }
    }

    const getNotificationBgColor = (type: string) => {
        switch (type) {
            case 'alert':
                return 'bg-red-50 border-red-200'
            case 'warning':
                return 'bg-yellow-50 border-yellow-200'
            case 'info':
                return 'bg-blue-50 border-blue-200'
            case 'success':
                return 'bg-green-50 border-green-200'
            default:
                return 'bg-gray-50 border-gray-200'
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Bell className="w-8 h-8 mr-3 text-purple-600" />
                        Notification Center
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage all system notifications and alerts
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            {unreadCount} unread
                        </span>
                    )}
                </div>
            </motion.div>

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {/* Filter */}
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="all">All Notifications</option>
                    <option value="unread">Unread Only</option>
                    <option value="alert">Alerts</option>
                    <option value="warning">Warnings</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                </select>

                {/* Actions */}
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        className="flex-1"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Mark All Read
                    </Button>
                    {selectedNotifications.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={deleteSelected}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete ({selectedNotifications.length})
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Notifications List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
            >
                {loading ? (
                    <Card className="p-8 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                        <p className="mt-4 text-gray-600">Loading notifications...</p>
                    </Card>
                ) : filteredNotifications.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No notifications found</p>
                    </Card>
                ) : (
                    filteredNotifications.map((notification, index) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className={`p-4 border-l-4 cursor-pointer transition-all hover:shadow-md ${getNotificationBgColor(notification.type)} ${!notification.read ? 'border-l-purple-600' : 'border-l-gray-300'}`}
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedNotifications.includes(notification.id)}
                                        onChange={() => toggleNotificationSelection(notification.id)}
                                        className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />

                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2"></div>
                                            )}
                                        </div>

                                        {/* Timestamp */}
                                        <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                                            <span className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {notification.timestamp.toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => markAsRead(notification.id)}
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteNotification(notification.id)}
                                            className="text-red-600 hover:text-red-700"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Alerts</p>
                            <p className="text-2xl font-bold text-red-600">
                                {notifications.filter(n => n.type === 'alert').length}
                            </p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Warnings</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {notifications.filter(n => n.type === 'warning').length}
                            </p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-yellow-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Info</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {notifications.filter(n => n.type === 'info').length}
                            </p>
                        </div>
                        <Info className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Success</p>
                            <p className="text-2xl font-bold text-green-600">
                                {notifications.filter(n => n.type === 'success').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
