'use client';

import { useState } from 'react';
import type { Notification } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { dashboardApi } from '@/lib/api/dashboard';

interface NotificationsPanelProps {
    notifications: Notification[];
    onUpdate: () => void;
}

export default function NotificationsPanel({ notifications, onUpdate }: NotificationsPanelProps) {
    const [loading, setLoading] = useState(false);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'info':
                return (
                    <div className="bg-blue-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="bg-yellow-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="bg-red-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'success':
                return (
                    <div className="bg-green-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await dashboardApi.markNotificationRead(notificationId);
            onUpdate();
        } catch (error) {
            toast.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);
            await dashboardApi.markAllNotificationsRead();
            onUpdate();
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        } finally {
            setLoading(false);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={loading}
                        className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No notifications
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${notification.read ? 'bg-white' : 'bg-blue-50'
                                } hover:bg-gray-50`}
                        >
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'
                                        }`}>
                                        {notification.title}
                                    </p>
                                    {!notification.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="ml-2 text-blue-600 hover:text-blue-700"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                </p>
                                <div className="flex items-center mt-2 space-x-2">
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                    </span>
                                    {notification.actionUrl && (
                                        <>
                                            <span className="text-xs text-gray-400">•</span>
                                            <a
                                                href={notification.actionUrl}
                                                className="text-xs text-blue-600 hover:text-blue-700"
                                            >
                                                View details
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
