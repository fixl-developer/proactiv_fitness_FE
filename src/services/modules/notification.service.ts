import { apiClient } from '../api/client'

export interface Notification {
    id: string
    userId: string
    type: 'ticket' | 'message' | 'alert' | 'reminder' | 'system' | 'update'
    title: string
    message: string
    description?: string
    icon?: string
    actionUrl?: string
    actionLabel?: string
    isRead: boolean
    isPinned: boolean
    priority: 'low' | 'medium' | 'high' | 'urgent'
    channels: ('email' | 'sms' | 'push' | 'in-app')[]
    createdAt: string
    readAt?: string
    expiresAt?: string
    metadata?: Record<string, any>
}

export interface EmailTemplate {
    id: string
    name: string
    subject: string
    body: string
    variables: string[]
    category: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface SMSTemplate {
    id: string
    name: string
    content: string
    variables: string[]
    category: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface PushTemplate {
    id: string
    name: string
    title: string
    body: string
    icon?: string
    actionUrl?: string
    variables: string[]
    category: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface NotificationStats {
    totalNotifications: number
    unreadNotifications: number
    readNotifications: number
    emailsSent: number
    smsSent: number
    pushSent: number
    deliveryRate: number
    openRate: number
}

export interface NotificationChannel {
    type: 'email' | 'sms' | 'push' | 'in-app'
    isEnabled: boolean
    preferences?: Record<string, any>
}

export class NotificationService {
    /**
     * Get notifications with pagination and filters
     */
    static async getNotifications(filters?: {
        type?: string
        isRead?: boolean
        page?: number
        limit?: number
    }): Promise<{ notifications: Notification[]; total: number }> {
        try {
            const response = await apiClient.get('/notifications', { params: filters })
            return (response as any)?.data || { notifications: [], total: 0 }
        } catch (error) {
            console.error('Error fetching notifications:', error)
            throw error
        }
    }

    /**
     * Get notification by ID
     */
    static async getNotificationById(id: string): Promise<Notification> {
        try {
            const response = await apiClient.get(`/notifications/${id}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching notification:', error)
            throw error
        }
    }

    /**
     * Create notification
     */
    static async createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'readAt'>): Promise<Notification> {
        try {
            const response = await apiClient.post('/notifications', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating notification:', error)
            throw error
        }
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(id: string): Promise<Notification> {
        try {
            const response = await apiClient.patch(`/notifications/${id}/read`, {})
            return (response as any)?.data
        } catch (error) {
            console.error('Error marking notification as read:', error)
            throw error
        }
    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(): Promise<{ updated: number }> {
        try {
            const response = await apiClient.patch('/notifications/read-all', {})
            return (response as any)?.data
        } catch (error) {
            console.error('Error marking all as read:', error)
            throw error
        }
    }

    /**
     * Delete notification
     */
    static async deleteNotification(id: string): Promise<void> {
        try {
            await apiClient.delete(`/notifications/${id}`)
        } catch (error) {
            console.error('Error deleting notification:', error)
            throw error
        }
    }

    /**
     * Send email notification
     */
    static async sendEmail(data: {
        to: string
        templateId?: string
        subject?: string
        body?: string
        variables?: Record<string, any>
    }): Promise<{ messageId: string; status: string }> {
        try {
            const response = await apiClient.post('/notifications/email', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error sending email:', error)
            throw error
        }
    }

    /**
     * Send SMS notification
     */
    static async sendSMS(data: {
        to: string
        templateId?: string
        message?: string
        variables?: Record<string, any>
    }): Promise<{ messageId: string; status: string }> {
        try {
            const response = await apiClient.post('/notifications/sms', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error sending SMS:', error)
            throw error
        }
    }

    /**
     * Send push notification
     */
    static async sendPush(data: {
        userId: string
        templateId?: string
        title?: string
        body?: string
        actionUrl?: string
        variables?: Record<string, any>
    }): Promise<{ messageId: string; status: string }> {
        try {
            const response = await apiClient.post('/notifications/push', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error sending push notification:', error)
            throw error
        }
    }

    /**
     * Get notification statistics
     */
    static async getNotificationStats(): Promise<NotificationStats> {
        try {
            const response = await apiClient.get('/notifications/stats')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching notification stats:', error)
            throw error
        }
    }

    /**
     * Get unread notification count
     */
    static async getUnreadCount(): Promise<number> {
        try {
            const response = await apiClient.get('/notifications/unread-count')
            return (response as any)?.data?.count || 0
        } catch (error) {
            console.error('Error fetching unread count:', error)
            throw error
        }
    }

    /**
     * Subscribe to notification channel
     */
    static async subscribeToNotifications(channel: 'email' | 'sms' | 'push' | 'in-app'): Promise<{ subscribed: boolean }> {
        try {
            const response = await apiClient.post(`/notifications/subscribe/${channel}`, {})
            return (response as any)?.data
        } catch (error) {
            console.error('Error subscribing to notifications:', error)
            throw error
        }
    }

    /**
     * Unsubscribe from notification channel
     */
    static async unsubscribeFromNotifications(channel: 'email' | 'sms' | 'push' | 'in-app'): Promise<{ unsubscribed: boolean }> {
        try {
            const response = await apiClient.post(`/notifications/unsubscribe/${channel}`, {})
            return (response as any)?.data
        } catch (error) {
            console.error('Error unsubscribing from notifications:', error)
            throw error
        }
    }

    /**
     * Get email templates
     */
    static async getEmailTemplates(): Promise<EmailTemplate[]> {
        try {
            const response = await apiClient.get('/notifications/templates/email')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching email templates:', error)
            throw error
        }
    }

    /**
     * Get SMS templates
     */
    static async getSMSTemplates(): Promise<SMSTemplate[]> {
        try {
            const response = await apiClient.get('/notifications/templates/sms')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching SMS templates:', error)
            throw error
        }
    }

    /**
     * Get push templates
     */
    static async getPushTemplates(): Promise<PushTemplate[]> {
        try {
            const response = await apiClient.get('/notifications/templates/push')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching push templates:', error)
            throw error
        }
    }

    /**
     * Create email template
     */
    static async createEmailTemplate(data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
        try {
            const response = await apiClient.post('/notifications/templates/email', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating email template:', error)
            throw error
        }
    }

    /**
     * Update email template
     */
    static async updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        try {
            const response = await apiClient.patch(`/notifications/templates/email/${id}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating email template:', error)
            throw error
        }
    }

    /**
     * Get notification preferences
     */
    static async getNotificationPreferences(): Promise<NotificationChannel[]> {
        try {
            const response = await apiClient.get('/notifications/preferences')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching preferences:', error)
            throw error
        }
    }

    /**
     * Update notification preferences
     */
    static async updateNotificationPreferences(preferences: NotificationChannel[]): Promise<NotificationChannel[]> {
        try {
            const response = await apiClient.patch('/notifications/preferences', { preferences })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error updating preferences:', error)
            throw error
        }
    }
}


export default NotificationService
