'use client';

import React, { useEffect, useState } from 'react';
import ParentDashboardStats from '@/components/parent/ParentDashboardStats';
import ChildrenOverview from '@/components/parent/ChildrenOverview';
import UpcomingClassesList from '@/components/parent/UpcomingClassesList';
import ParentNotifications from '@/components/parent/ParentNotifications';
import RecentActivity from '@/components/parent/RecentActivity';
import {
    getParentProfile,
    getUpcomingClasses,
    getParentNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from '@/lib/api/parent';
import type { ParentProfile, UpcomingClass, ParentNotification } from '@/types/parent';
import { useToast } from '@/hooks/use-toast';

export default function ParentDashboardPage() {
    const { toast } = useToast();
    const [profile, setProfile] = useState<ParentProfile | null>(null);
    const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
    const [notifications, setNotifications] = useState<ParentNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const userId = 'current-user-id'; // Get from auth context

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileData, classesData, notificationsData] = await Promise.all([
                getParentProfile(userId),
                getUpcomingClasses(userId),
                getParentNotifications(userId),
            ]);

            setProfile(profileData);
            setUpcomingClasses(classesData);
            setNotifications(notificationsData);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load dashboard data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to mark notification as read',
                variant: 'destructive',
            });
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead(userId);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to mark all notifications as read',
                variant: 'destructive',
            });
        }
    };

    if (loading || !profile) {
        return <div className="p-8">Loading...</div>;
    }

    const totalAchievements = profile.children.reduce(
        (sum, child) => sum + (child.upcomingClasses || 0),
        0
    );

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Parent Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {profile.name}! Track your children's progress
                </p>
            </div>

            <ParentDashboardStats
                totalChildren={profile.children.length}
                upcomingClasses={upcomingClasses.length}
                pendingPayments={0}
                totalAchievements={totalAchievements}
            />

            <div>
                <h2 className="text-2xl font-bold mb-4">My Children</h2>
                <ChildrenOverview children={profile.children} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <UpcomingClassesList classes={upcomingClasses.slice(0, 5)} />
                <ParentNotifications
                    notifications={notifications.slice(0, 5)}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                />
            </div>
        </div>
    );
}
