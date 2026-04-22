import { apiClient } from '@/services/api/client'

export const notificationService = {
    async getNotifications() {
        try {
            const response = await apiClient.get('/notifications')
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch notifications',
                data: []
            }
        }
    },

    async getNotification(id: string) {
        try {
            const response = await apiClient.get(`/notifications/${id}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch notification'
            }
        }
    },

    async markAsRead(id: string) {
        try {
            const response = await apiClient.put(`/notifications/${id}/read`, {})
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to mark as read'
            }
        }
    },

    async deleteNotification(id: string) {
        try {
            const response = await apiClient.delete(`/notifications/${id}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to delete notification'
            }
        }
    },

    async getPreferences() {
        try {
            const response = await apiClient.get('/notifications/preferences')
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch preferences',
                data: {
                    emailNotifications: true,
                    pushNotifications: true,
                    smsNotifications: false,
                    classReminders: true,
                    paymentAlerts: true,
                    achievementNotifications: true
                }
            }
        }
    },

    async updatePreferences(preferences: any) {
        try {
            const response = await apiClient.put('/notifications/preferences', preferences)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to update preferences'
            }
        }
    }
}
