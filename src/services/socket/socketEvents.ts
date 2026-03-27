// Socket event names emitted by the backend
export const SOCKET_EVENTS = {
    // Booking
    BOOKING_CREATED: 'booking:created',
    BOOKING_UPDATED: 'booking:updated',
    BOOKING_DELETED: 'booking:deleted',
    BOOKING_CANCELLED: 'booking:cancelled',

    // Attendance
    ATTENDANCE_CHECKED_IN: 'attendance:checkedIn',
    ATTENDANCE_CHECKED_OUT: 'attendance:checkedOut',
    ATTENDANCE_CREATED: 'attendance:created',
    ATTENDANCE_UPDATED: 'attendance:updated',

    // Programs
    PROGRAM_CREATED: 'program:created',
    PROGRAM_UPDATED: 'program:updated',
    PROGRAM_DELETED: 'program:deleted',

    // Schedule
    SCHEDULE_CREATED: 'schedule:created',
    SCHEDULE_UPDATED: 'schedule:updated',
    SCHEDULE_DELETED: 'schedule:deleted',
    SCHEDULE_GENERATED: 'schedule:generated',
    SCHEDULE_PUBLISHED: 'schedule:published',

    // Payments
    PAYMENT_CREATED: 'payment:created',
    PAYMENT_UPDATED: 'payment:updated',

    // Tickets / Support
    TICKET_CREATED: 'ticket:created',
    TICKET_UPDATED: 'ticket:updated',
    TICKET_DELETED: 'ticket:deleted',

    // Staff
    STAFF_CREATED: 'staff:created',
    STAFF_UPDATED: 'staff:updated',
    STAFF_DELETED: 'staff:deleted',

    // Location
    LOCATION_CREATED: 'location:created',
    LOCATION_UPDATED: 'location:updated',
    LOCATION_DELETED: 'location:deleted',

    // CRM
    CRM_CREATED: 'crm:created',
    CRM_UPDATED: 'crm:updated',

    // Notifications
    NOTIFICATION_NEW: 'notification:new',

    // System
    SYSTEM_ALERT: 'system:alert',
    FORCE_LOGOUT: 'auth:force-logout',
    CONNECTED: 'connected',
    NOTIFICATIONS_PENDING: 'notifications:pending',
} as const;

// Payload shape for CRUD events from backend
export interface SocketCrudPayload {
    event: string;
    entity: string;
    action: string;
    data: Record<string, any>;
    context: {
        tenantId?: string;
        organizationId?: string;
        locationId?: string;
        userId?: string;
        targetUserId?: string;
    };
    timestamp: string;
    actorId?: string;
}

// All entity event prefixes we listen for
export const REALTIME_ENTITIES = [
    'booking',
    'attendance',
    'program',
    'schedule',
    'payment',
    'ticket',
    'staff',
    'location',
    'crm',
    'achievement',
    'feedback',
] as const;

// All CRUD action suffixes
export const CRUD_ACTIONS = ['created', 'updated', 'deleted', 'cancelled', 'checkedIn', 'checkedOut', 'generated', 'published'] as const;

/**
 * Convert a socket event name to an EventBus event type
 * e.g., 'booking:created' → 'booking:data:created'
 */
export function socketEventToEventBusType(socketEvent: string): string {
    const [module, action] = socketEvent.split(':');
    return `${module}:data:${action}`;
}

/**
 * Convert a socket event name to an EventBus action
 * e.g., 'booking:created' → 'CREATE'
 */
export function socketEventToAction(socketEvent: string): string {
    const action = socketEvent.split(':')[1];
    if (!action) return 'UPDATE';
    if (action.includes('created') || action.includes('checkedIn')) return 'CREATE';
    if (action.includes('deleted') || action.includes('cancelled')) return 'DELETE';
    return 'UPDATE';
}

/**
 * Get a human-readable toast message for an event
 */
export function getToastMessage(entity: string, action: string, data?: Record<string, any>): { title: string; description: string } {
    const name = data?.name || data?.title || data?.className || data?.programName || '';
    const entityName = entity.charAt(0).toUpperCase() + entity.slice(1);

    switch (action) {
        case 'created':
            return { title: `New ${entityName}`, description: name ? `"${name}" has been created` : `A new ${entity} has been created` };
        case 'deleted':
        case 'cancelled':
            return { title: `${entityName} Removed`, description: name ? `"${name}" has been ${action}` : `A ${entity} has been ${action}` };
        case 'checkedIn':
            return { title: 'Attendance', description: 'Student checked in' };
        case 'checkedOut':
            return { title: 'Attendance', description: 'Student checked out' };
        case 'generated':
            return { title: 'Schedule Generated', description: 'A new schedule has been generated' };
        case 'published':
            return { title: 'Schedule Published', description: 'Schedule has been published' };
        default:
            return { title: `${entityName} Updated`, description: name ? `"${name}" has been updated` : `A ${entity} has been updated` };
    }
}

/**
 * Determine if an action should trigger a toast notification
 * (updates are skipped to avoid noise)
 */
export function shouldShowToast(action: string): boolean {
    return action !== 'updated';
}
