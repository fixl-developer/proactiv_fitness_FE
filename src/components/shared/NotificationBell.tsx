'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, CheckCheck, X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import { useNotificationStore, InAppNotification } from '@/store/notificationStore'
import { useSocket } from '@/hooks/useSocket'
import { formatDistanceToNow } from 'date-fns'

const typeIcons: Record<string, any> = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
}

const typeColors: Record<string, string> = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
}

export default function NotificationBell() {
    const {
        notifications,
        unreadCount,
        isDropdownOpen,
        toggleDropdown,
        closeDropdown,
        markAsRead,
        markAllAsRead,
        removeNotification,
    } = useNotificationStore()
    const { socket, isConnected } = useSocket()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [initialLoaded, setInitialLoaded] = useState(false)

    // Load initial notifications from API on mount
    useEffect(() => {
        if (initialLoaded) return
        const loadNotifications = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
                const res = await fetch(`${baseUrl}/notifications/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (res.ok) {
                    const json = await res.json()
                    if (json.success && json.data) {
                        const mapped: InAppNotification[] = json.data.map((n: any) => ({
                            id: n._id || n.id,
                            title: n.title || 'Notification',
                            message: n.message || '',
                            type: n.category === 'alert' ? 'warning' : 'info',
                            module: n.entityType || n.category || 'system',
                            isRead: n.status === 'read',
                            createdAt: new Date(n.createdAt).getTime(),
                            eventType: n.eventType,
                            entityId: n.entityId,
                        }))
                        useNotificationStore.getState().setNotifications(mapped)
                    }
                }
            } catch {
                // Silently fail — notifications are non-critical
            }
            setInitialLoaded(true)
        }
        loadNotifications()
    }, [initialLoaded])

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [closeDropdown])

    const handleMarkAsRead = (id: string) => {
        markAsRead(id)
        // Also notify backend via socket
        if (socket && isConnected) {
            socket.emit('notification:read', id)
        }
    }

    const handleMarkAllAsRead = () => {
        markAllAsRead()
        if (socket && isConnected) {
            socket.emit('notifications:read-all')
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                {/* Connection indicator */}
                <span
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                        isConnected ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[480px] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400">
                                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                                    <p className="text-sm">No notifications yet</p>
                                    <p className="text-xs mt-1">You&apos;ll see updates here when changes happen</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        onRemove={removeNotification}
                                    />
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-gray-100 px-4 py-2">
                                <p className="text-xs text-gray-400 text-center">
                                    {isConnected ? 'Live updates active' : 'Reconnecting...'}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function NotificationItem({
    notification,
    onMarkAsRead,
    onRemove,
}: {
    notification: InAppNotification
    onMarkAsRead: (id: string) => void
    onRemove: (id: string) => void
}) {
    const Icon = typeIcons[notification.type] || Info
    const colorClass = typeColors[notification.type] || 'text-blue-500'

    let timeAgo = ''
    try {
        timeAgo = formatDistanceToNow(notification.createdAt, { addSuffix: true })
    } catch {
        timeAgo = 'just now'
    }

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-b-0 ${
                !notification.isRead ? 'bg-blue-50/40' : ''
            }`}
            onClick={() => {
                if (!notification.isRead) onMarkAsRead(notification.id)
            }}
        >
            {/* Icon */}
            <div className={`flex-shrink-0 mt-0.5 ${colorClass}`}>
                <Icon className="h-4.5 w-4.5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-tight ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notification.title}
                    </p>
                    {!notification.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400">{timeAgo}</span>
                    <span className="text-[10px] text-gray-300">|</span>
                    <span className="text-[10px] text-gray-400 capitalize">{notification.module}</span>
                </div>
            </div>

            {/* Remove button */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onRemove(notification.id)
                }}
                className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
            >
                <X className="h-3 w-3 text-gray-400" />
            </button>
        </div>
    )
}
