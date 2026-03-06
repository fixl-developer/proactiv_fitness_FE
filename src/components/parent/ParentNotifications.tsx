'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, DollarSign, Award, AlertCircle, CheckCircle } from 'lucide-react';
import type { ParentNotification } from '@/types/parent';

interface ParentNotificationsProps {
    notifications: ParentNotification[];
    onMarkAsRead: (notificationId: string) => void;
    onMarkAllAsRead: () => void;
}

export default function ParentNotifications({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
}: ParentNotificationsProps) {
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'class_reminder':
                return <Calendar className="h-5 w-5 text-blue-500" />;
            case 'payment_due':
                return <DollarSign className="h-5 w-5 text-orange-500" />;
            case 'achievement':
                return <Award className="h-5 w-5 text-purple-500" />;
            case 'announcement':
                return <Bell className="h-5 w-5 text-green-500" />;
            case 'alert':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Bell className="h-5 w-5" />;
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                        {unreadCount > 0 && (
                            <Badge variant="destructive">{unreadCount}</Badge>
                        )}
                    </CardTitle>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark all as read
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${notification.isRead
                                    ? 'bg-background'
                                    : 'bg-blue-50 border-blue-200'
                                }`}
                            onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                        >
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="font-semibold">{notification.title}</h3>
                                    {!notification.isRead && (
                                        <Badge variant="secondary" className="ml-2">
                                            New
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    {notification.message}
                                </p>
                                {notification.childName && (
                                    <Badge variant="outline" className="text-xs">
                                        {notification.childName}
                                    </Badge>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
