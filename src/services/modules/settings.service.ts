import { apiClient } from '@/services/api/client'

interface SettingsData {
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
}

interface NotificationPreferences {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    classReminders: boolean
    paymentAlerts: boolean
    promotionalEmails: boolean
}

interface PrivacySettings {
    profileVisibility: 'public' | 'private' | 'friends'
    showAchievements: boolean
    showProgress: boolean
    allowMessaging: boolean
}

const settingsService = {
    async getSettings(): Promise<any> {
        try {
            const response = await apiClient.get('/user/settings')
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to fetch settings:', error)
            return {}
        }
    },

    async updateSettings(data: SettingsData): Promise<any> {
        try {
            const response = await apiClient.put('/user/settings', data)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to update settings:', error)
            throw error
        }
    },

    async updateNotificationPreferences(preferences: NotificationPreferences): Promise<any> {
        try {
            const response = await apiClient.put('/user/settings/notifications', preferences)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to update notification preferences:', error)
            throw error
        }
    },

    async updatePrivacySettings(settings: PrivacySettings): Promise<any> {
        try {
            const response = await apiClient.put('/user/settings/privacy', settings)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to update privacy settings:', error)
            throw error
        }
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<any> {
        try {
            const response = await apiClient.post('/user/settings/change-password', {
                currentPassword,
                newPassword
            })
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to change password:', error)
            throw error
        }
    }
}

export default settingsService
