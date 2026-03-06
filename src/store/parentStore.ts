import { create } from 'zustand';
import type {
    ParentProfile,
    UpcomingClass,
    ParentNotification,
    FamilyCalendarEvent,
} from '@/types/parent';

interface ParentStore {
    profile: ParentProfile | null;
    upcomingClasses: UpcomingClass[];
    notifications: ParentNotification[];
    calendarEvents: FamilyCalendarEvent[];
    loading: boolean;

    setProfile: (profile: ParentProfile) => void;
    setUpcomingClasses: (classes: UpcomingClass[]) => void;
    setNotifications: (notifications: ParentNotification[]) => void;
    setCalendarEvents: (events: FamilyCalendarEvent[]) => void;
    setLoading: (loading: boolean) => void;

    markNotificationAsRead: (notificationId: string) => void;
    markAllNotificationsAsRead: () => void;
}

export const useParentStore = create<ParentStore>((set) => ({
    profile: null,
    upcomingClasses: [],
    notifications: [],
    calendarEvents: [],
    loading: false,

    setProfile: (profile) => set({ profile }),
    setUpcomingClasses: (upcomingClasses) => set({ upcomingClasses }),
    setNotifications: (notifications) => set({ notifications }),
    setCalendarEvents: (calendarEvents) => set({ calendarEvents }),
    setLoading: (loading) => set({ loading }),

    markNotificationAsRead: (notificationId) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === notificationId ? { ...n, isRead: true } : n
            ),
        })),

    markAllNotificationsAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
}));
