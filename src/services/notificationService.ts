/**
 * Notifications Service
 * Handles all notification and communication operations
 * Module 3.6 - Phase 3: Customer & Money
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum NotificationType {
    EMAIL = 'email',
    SMS = 'sms',
    PUSH = 'push',
    IN_APP = 'in_app'
}

export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
    FAILED = 'failed'
}

export enum NotificationCategory {
    BOOKING_CONFIRMATION = 'booking_confirmation',
    BOOKING_REMINDER = 'booking_reminder',
    BOOKING_CANCELLATION = 'booking_cancellation',
    PAYMENT_CONFIRMATION = 'payment_confirmation',
    PAYMENT_REMINDER = 'payment_reminder',
    SCHEDULE_CHANGE = 'schedule_change',
    PROMOTIONAL = 'promotional',
    SYSTEM_ALERT = 'system_alert'
}

export interface Notification {
    _id: string;
    notificationId: string;
    type: NotificationType;
    category: NotificationCategory;
    familyId: string;
    userId?: string;
    subject?: string;
    content: string;
    templateId?: string;
    templateData?: Record<string, any>;
    status: NotificationStatus;
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    failureReason?: string;
    scheduledFor?: Date;
    priority: number;
    businessUnitId: string;
    createdBy: string;
    createdAt: Date;
}

export interface NotificationTemplate {
    _id: string;
    templateId: string;
    name: string;
    category: NotificationCategory;
    type: NotificationType;
    subject?: string;
    content: string;
    variables: string[];
    isActive: boolean;
    businessUnitId?: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface NotificationFilter {
    familyId?: string;
    userId?: string;
    type?: NotificationType;
    category?: NotificationCategory;
    status?: NotificationStatus;
    businessUnitId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}

export interface SendNotificationDto {
    type: NotificationType;
    category: NotificationCategory;
    familyId: string;
    userId?: string;
    subject?: string;
    content?: string;
    templateId?: string;
    templateData?: Record<string, any>;
    scheduledFor?: Date;
    priority?: number;
}

export interface BulkNotificationDto {
    type: NotificationType;
    category: NotificationCategory;
    recipientIds: string[];
    subject?: string;
    content?: string;
    templateId?: string;
    templateData?: Record<string, any>;
    scheduledFor?: Date;
}

export interface NotificationPreferences {
    familyId: string;
    email: {
        enabled: boolean;
        bookingConfirmations: boolean;
        bookingReminders: boolean;
        paymentReminders: boolean;
        scheduleChanges: boolean;
        promotional: boolean;
    };
    sms: {
        enabled: boolean;
        bookingConfirmations: boolean;
        bookingReminders: boolean;
        paymentReminders: boolean;
        scheduleChanges: boolean;
    };
    push: {
        enabled: boolean;
        bookingConfirmations: boolean;
        bookingReminders: boolean;
        paymentReminders: boolean;
        scheduleChanges: boolean;
    };
    inApp: {
        enabled: boolean;
    };
}

export interface NotificationStatistics {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalFailed: number;
    deliveryRate: number;
    readRate: number;
    notificationsByType: Record<NotificationType, number>;
    notificationsByCategory: Record<NotificationCategory, number>;
    notificationsByStatus: Record<NotificationStatus, number>;
}

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

class NotificationService {
    private readonly baseUrl = '/notifications';

    /**
     * Get all notifications
     */
    async getNotifications(filters?: NotificationFilter): Promise<{ data: Notification[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.familyId) params.append('familyId', filters.familyId);
            if (filters.userId) params.append('userId', filters.userId);
            if (filters.type) params.append('type', filters.type);
            if (filters.category) params.append('category', filters.category);
            if (filters.status) params.append('status', filters.status);
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    /**
     * Get notification by ID
     */
    async getNotificationById(notificationId: string): Promise<Notification> {
        const response = await apiClient.get(`${this.baseUrl}/${notificationId}`);
        return response.data.data;
    }

    /**
     * Send notification
     */
    async sendNotification(data: SendNotificationDto): Promise<Notification> {
        const response = await apiClient.post(`${this.baseUrl}/send`, data);
        return response.data.data;
    }

    /**
     * Send bulk notifications
     */
    async sendBulkNotifications(data: BulkNotificationDto): Promise<{ sent: number; failed: number }> {
        const response = await apiClient.post(`${this.baseUrl}/send-bulk`, data);
        return response.data.data;
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<Notification> {
        const response = await apiClient.patch(`${this.baseUrl}/${notificationId}/read`);
        return response.data.data;
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(familyId: string): Promise<void> {
        await apiClient.patch(`${this.baseUrl}/read-all`, { familyId });
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${notificationId}`);
    }

    /**
     * Get unread notifications
     */
    async getUnreadNotifications(familyId: string): Promise<Notification[]> {
        const response = await this.getNotifications({
            familyId,
            status: NotificationStatus.DELIVERED
        });
        return response.data;
    }

    /**
     * Get unread count
     */
    async getUnreadCount(familyId: string): Promise<number> {
        const response = await apiClient.get(`${this.baseUrl}/unread-count?familyId=${familyId}`);
        return response.data.data;
    }

    /**
     * Get notification preferences
     */
    async getNotificationPreferences(familyId: string): Promise<NotificationPreferences> {
        const response = await apiClient.get(`${this.baseUrl}/preferences/${familyId}`);
        return response.data.data;
    }

    /**
     * Update notification preferences
     */
    async updateNotificationPreferences(
        familyId: string,
        preferences: Partial<NotificationPreferences>
    ): Promise<NotificationPreferences> {
        const response = await apiClient.put(`${this.baseUrl}/preferences/${familyId}`, preferences);
        return response.data.data;
    }

    /**
     * Get notification templates
     */
    async getNotificationTemplates(filters?: {
        category?: NotificationCategory;
        type?: NotificationType;
        businessUnitId?: string;
        isActive?: boolean;
    }): Promise<NotificationTemplate[]> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.category) params.append('category', filters.category);
            if (filters.type) params.append('type', filters.type);
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}/templates?${params.toString()}`);
        return response.data.data;
    }

    /**
     * Get template by ID
     */
    async getTemplateById(templateId: string): Promise<NotificationTemplate> {
        const response = await apiClient.get(`${this.baseUrl}/templates/${templateId}`);
        return response.data.data;
    }

    /**
     * Create notification template
     */
    async createTemplate(data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
        const response = await apiClient.post(`${this.baseUrl}/templates`, data);
        return response.data.data;
    }

    /**
     * Update notification template
     */
    async updateTemplate(templateId: string, data: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
        const response = await apiClient.put(`${this.baseUrl}/templates/${templateId}`, data);
        return response.data.data;
    }

    /**
     * Delete notification template
     */
    async deleteTemplate(templateId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/templates/${templateId}`);
    }

    /**
     * Get notification statistics
     */
    async getNotificationStatistics(
        businessUnitId?: string,
        dateRange?: { startDate: Date; endDate: Date }
    ): Promise<NotificationStatistics> {
        const params = new URLSearchParams();
        if (businessUnitId) params.append('businessUnitId', businessUnitId);
        if (dateRange) {
            params.append('startDate', dateRange.startDate.toISOString());
            params.append('endDate', dateRange.endDate.toISOString());
        }

        const response = await apiClient.get(`${this.baseUrl}/statistics?${params.toString()}`);
        return response.data.data;
    }

    /**
     * Resend failed notification
     */
    async resendNotification(notificationId: string): Promise<Notification> {
        const response = await apiClient.post(`${this.baseUrl}/${notificationId}/resend`);
        return response.data.data;
    }

    /**
     * Schedule notification
     */
    async scheduleNotification(data: SendNotificationDto & { scheduledFor: Date }): Promise<Notification> {
        const response = await apiClient.post(`${this.baseUrl}/schedule`, data);
        return response.data.data;
    }

    /**
     * Cancel scheduled notification
     */
    async cancelScheduledNotification(notificationId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${notificationId}/schedule`);
    }

    /**
     * Test notification
     */
    async testNotification(data: SendNotificationDto): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post(`${this.baseUrl}/test`, data);
        return response.data.data;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const notificationService = new NotificationService();
export default notificationService;
