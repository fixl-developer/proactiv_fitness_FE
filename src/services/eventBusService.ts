/**
 * Event Bus Service
 * Handles all event-driven architecture operations
 * Module 4.2 - Phase 4: Automation
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum EventType {
    // User Events
    USER_REGISTERED = 'user.registered',
    USER_UPDATED = 'user.updated',
    USER_DELETED = 'user.deleted',
    USER_LOGIN = 'user.login',
    USER_LOGOUT = 'user.logout',
    // Family Events
    FAMILY_CREATED = 'family.created',
    FAMILY_UPDATED = 'family.updated',
    FAMILY_MEMBER_ADDED = 'family.member_added',
    CHILD_CREATED = 'child.created',
    CHILD_UPDATED = 'child.updated',
    // Booking Events
    BOOKING_CREATED = 'booking.created',
    BOOKING_CONFIRMED = 'booking.confirmed',
    BOOKING_CANCELLED = 'booking.cancelled',
    BOOKING_RESCHEDULED = 'booking.rescheduled',
    BOOKING_COMPLETED = 'booking.completed',
    BOOKING_NO_SHOW = 'booking.no_show',
    WAITLIST_JOINED = 'waitlist.joined',
    WAITLIST_OFFERED = 'waitlist.offered',
    WAITLIST_ACCEPTED = 'waitlist.accepted',
    // Payment Events
    PAYMENT_INITIATED = 'payment.initiated',
    PAYMENT_COMPLETED = 'payment.completed',
    PAYMENT_FAILED = 'payment.failed',
    PAYMENT_REFUNDED = 'payment.refunded',
    INVOICE_GENERATED = 'invoice.generated',
    INVOICE_SENT = 'invoice.sent',
    INVOICE_PAID = 'invoice.paid',
    INVOICE_OVERDUE = 'invoice.overdue',
    // Program Events
    PROGRAM_CREATED = 'program.created',
    PROGRAM_UPDATED = 'program.updated',
    PROGRAM_PUBLISHED = 'program.published',
    PROGRAM_CANCELLED = 'program.cancelled',
    // Schedule Events
    SCHEDULE_GENERATED = 'schedule.generated',
    SCHEDULE_PUBLISHED = 'schedule.published',
    SESSION_CREATED = 'session.created',
    SESSION_UPDATED = 'session.updated',
    SESSION_CANCELLED = 'session.cancelled',
    COACH_ASSIGNED = 'coach.assigned',
    COACH_UNAVAILABLE = 'coach.unavailable',
    // System Events
    SYSTEM_MAINTENANCE = 'system.maintenance',
    SYSTEM_ERROR = 'system.error',
    SYSTEM_ALERT = 'system.alert',
    DATA_BACKUP = 'data.backup',
    DATA_RESTORE = 'data.restore',
    CUSTOM_EVENT = 'custom.event'
}

export enum EventPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum EventStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    RETRYING = 'retrying',
    DEAD_LETTER = 'dead_letter'
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    PAUSED = 'paused',
    DISABLED = 'disabled',
    ERROR = 'error'
}

export interface EventPayload {
    [key: string]: any;
}

export interface EventMetadata {
    source: string;
    version: string;
    correlationId?: string;
    causationId?: string;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    businessUnitId?: string;
    locationId?: string;
    tags?: string[];
    customData?: Record<string, any>;
}

export interface Event {
    _id: string;
    eventId: string;
    eventType: EventType;
    eventName: string;
    payload: EventPayload;
    metadata: EventMetadata;
    priority: EventPriority;
    status: EventStatus;
    occurredAt: Date;
    scheduledFor?: Date;
    processedAt?: Date;
    completedAt?: Date;
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: Date;
    lastError?: string;
    routingKey: string;
    exchange?: string;
    schemaVersion: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface EventSubscription {
    _id: string;
    subscriptionId: string;
    name: string;
    description?: string;
    eventTypes: EventType[];
    eventPatterns: string[];
    filters: {
        field: string;
        operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in';
        value: any;
    }[];
    handlerType: 'webhook' | 'function' | 'queue' | 'email' | 'sms';
    handlerConfig: {
        url?: string;
        method?: string;
        headers?: Record<string, string>;
        functionName?: string;
        queueName?: string;
        emailTemplate?: string;
        smsTemplate?: string;
        retryPolicy?: {
            maxRetries: number;
            backoffStrategy: 'linear' | 'exponential';
            initialDelay: number;
            maxDelay: number;
        };
    };
    status: SubscriptionStatus;
    isActive: boolean;
    statistics: {
        totalEvents: number;
        successfulEvents: number;
        failedEvents: number;
        lastProcessedAt?: Date;
        averageProcessingTime: number;
    };
    businessUnitId?: string;
    locationIds: string[];
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PublishEventDto {
    eventType: EventType;
    payload: EventPayload;
    metadata?: Partial<EventMetadata>;
    priority?: EventPriority;
    scheduledFor?: Date;
    routingKey?: string;
}

export interface CreateSubscriptionDto {
    name: string;
    description?: string;
    eventTypes: EventType[];
    eventPatterns?: string[];
    filters?: {
        field: string;
        operator: string;
        value: any;
    }[];
    handlerType: 'webhook' | 'function' | 'queue' | 'email' | 'sms';
    handlerConfig: any;
    businessUnitId?: string;
    locationIds?: string[];
}

export interface EventFilter {
    eventTypes?: EventType[];
    status?: EventStatus;
    priority?: EventPriority;
    startDate?: Date;
    endDate?: Date;
    businessUnitId?: string;
    locationId?: string;
    correlationId?: string;
    userId?: string;
    page?: number;
    limit?: number;
}

export interface EventStatistics {
    totalEvents: number;
    eventsByType: Record<EventType, number>;
    eventsByStatus: Record<EventStatus, number>;
    eventsByPriority: Record<EventPriority, number>;
    averageProcessingTime: number;
    successRate: number;
    failureRate: number;
    retryRate: number;
    deadLetterRate: number;
    throughputPerHour: number;
    peakHours: {
        hour: number;
        eventCount: number;
    }[];
}

// ============================================================================
// EVENT BUS SERVICE
// ============================================================================

class EventBusService {
    private readonly baseUrl = '/event-bus';

    /**
     * Publish event
     */
    async publishEvent(data: PublishEventDto): Promise<Event> {
        const response = await apiClient.post(`${this.baseUrl}/events/publish`, data);
        return response.data;
    }

    /**
     * Get all events
     */
    async getEvents(filters?: EventFilter): Promise<{ data: Event[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.eventTypes) filters.eventTypes.forEach(t => params.append('eventTypes', t));
            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.correlationId) params.append('correlationId', filters.correlationId);
            if (filters.userId) params.append('userId', filters.userId);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}/events?${params.toString()}`);
        return response.data;
    }

    /**
     * Get event by ID
     */
    async getEventById(eventId: string): Promise<Event> {
        const response = await apiClient.get(`${this.baseUrl}/events/${eventId}`);
        return response.data;
    }

    /**
     * Retry event
     */
    async retryEvent(eventId: string): Promise<Event> {
        const response = await apiClient.post(`${this.baseUrl}/events/${eventId}/retry`);
        return response.data;
    }

    /**
     * Get event statistics
     */
    async getEventStatistics(
        businessUnitId?: string,
        dateRange?: { startDate: Date; endDate: Date }
    ): Promise<EventStatistics> {
        const params = new URLSearchParams();
        if (businessUnitId) params.append('businessUnitId', businessUnitId);
        if (dateRange) {
            params.append('startDate', dateRange.startDate.toISOString());
            params.append('endDate', dateRange.endDate.toISOString());
        }

        const response = await apiClient.get(`${this.baseUrl}/statistics?${params.toString()}`);
        return response.data;
    }

    /**
     * Get all subscriptions
     */
    async getSubscriptions(filters?: {
        eventTypes?: EventType[];
        status?: SubscriptionStatus;
        handlerType?: string;
        businessUnitId?: string;
        isActive?: boolean;
    }): Promise<EventSubscription[]> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.eventTypes) filters.eventTypes.forEach(t => params.append('eventTypes', t));
            if (filters.status) params.append('status', filters.status);
            if (filters.handlerType) params.append('handlerType', filters.handlerType);
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}/subscriptions?${params.toString()}`);
        return response.data;
    }

    /**
     * Get subscription by ID
     */
    async getSubscriptionById(subscriptionId: string): Promise<EventSubscription> {
        const response = await apiClient.get(`${this.baseUrl}/subscriptions/${subscriptionId}`);
        return response.data;
    }

    /**
     * Create subscription
     */
    async createSubscription(data: CreateSubscriptionDto): Promise<EventSubscription> {
        const response = await apiClient.post(`${this.baseUrl}/subscriptions`, data);
        return response.data;
    }

    /**
     * Update subscription
     */
    async updateSubscription(subscriptionId: string, data: Partial<EventSubscription>): Promise<EventSubscription> {
        const response = await apiClient.put(`${this.baseUrl}/subscriptions/${subscriptionId}`, data);
        return response.data;
    }

    /**
     * Delete subscription
     */
    async deleteSubscription(subscriptionId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/subscriptions/${subscriptionId}`);
    }

    /**
     * Activate subscription
     */
    async activateSubscription(subscriptionId: string): Promise<EventSubscription> {
        const response = await apiClient.post(`${this.baseUrl}/subscriptions/${subscriptionId}/activate`);
        return response.data;
    }

    /**
     * Deactivate subscription
     */
    async deactivateSubscription(subscriptionId: string): Promise<EventSubscription> {
        const response = await apiClient.post(`${this.baseUrl}/subscriptions/${subscriptionId}/deactivate`);
        return response.data;
    }

    /**
     * Test subscription
     */
    async testSubscription(subscriptionId: string, testPayload: any): Promise<{ success: boolean; response: any }> {
        const response = await apiClient.post(`${this.baseUrl}/subscriptions/${subscriptionId}/test`, { testPayload });
        return response.data;
    }

    /**
     * Get dead letter events
     */
    async getDeadLetterEvents(): Promise<Event[]> {
        const response = await this.getEvents({ status: EventStatus.DEAD_LETTER });
        return response.data;
    }

    /**
     * Reprocess dead letter event
     */
    async reprocessDeadLetterEvent(eventId: string): Promise<Event> {
        const response = await apiClient.post(`${this.baseUrl}/events/${eventId}/reprocess`);
        return response.data;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const eventBusService = new EventBusService();
export default eventBusService;
