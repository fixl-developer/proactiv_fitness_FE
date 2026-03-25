import { create } from 'zustand'

export interface InAppNotification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    module: string
    isRead: boolean
    createdAt: number
    actionUrl?: string
    eventType?: string
    entityId?: string
}

interface NotificationState {
    notifications: InAppNotification[]
    unreadCount: number
    isDropdownOpen: boolean

    addNotification: (notification: InAppNotification) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    removeNotification: (id: string) => void
    setNotifications: (notifications: InAppNotification[]) => void
    toggleDropdown: () => void
    closeDropdown: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isDropdownOpen: false,

    addNotification: (notification) =>
        set((state) => {
            // Prevent duplicates
            if (state.notifications.some((n) => n.id === notification.id)) return state
            const notifications = [notification, ...state.notifications].slice(0, 50)
            return {
                notifications,
                unreadCount: notifications.filter((n) => !n.isRead).length,
            }
        }),

    markAsRead: (id) =>
        set((state) => {
            const notifications = state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            )
            return {
                notifications,
                unreadCount: notifications.filter((n) => !n.isRead).length,
            }
        }),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
        })),

    removeNotification: (id) =>
        set((state) => {
            const notifications = state.notifications.filter((n) => n.id !== id)
            return {
                notifications,
                unreadCount: notifications.filter((n) => !n.isRead).length,
            }
        }),

    setNotifications: (notifications) =>
        set({
            notifications,
            unreadCount: notifications.filter((n) => !n.isRead).length,
        }),

    toggleDropdown: () => set((state) => ({ isDropdownOpen: !state.isDropdownOpen })),
    closeDropdown: () => set({ isDropdownOpen: false }),
}))
