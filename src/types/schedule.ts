// Schedule types and interfaces

export interface Schedule {
    id: string;
    programId: string;
    programName: string;
    locationId: string;
    locationName: string;
    roomId: string;
    roomName: string;

    // Date & Time
    date: string;
    startTime: string;
    endTime: string;
    duration: number;

    // Recurrence
    isRecurring: boolean;
    recurrencePattern?: RecurrencePattern;
    recurrenceEndDate?: string;

    // Staff Assignment
    instructorIds: string[];
    instructorNames: string[];
    assistantIds: string[];

    // Capacity
    maxCapacity: number;
    enrolled: number;
    available: number;
    waitlist: number;

    // Status
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    publishStatus: 'draft' | 'published';

    // Conflicts
    hasConflicts: boolean;
    conflicts: ScheduleConflict[];

    // Metadata
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    notes?: string;
}

export interface RecurrencePattern {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number;
    endDate?: string;
    occurrences?: number;
}

export interface ScheduleConflict {
    type: 'instructor' | 'room' | 'capacity';
    message: string;
    conflictingScheduleId?: string;
    severity: 'warning' | 'error';
}

export interface ScheduleTemplate {
    id: string;
    name: string;
    description: string;
    programId: string;
    locationId: string;
    roomId: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    instructorIds: string[];
    maxCapacity: number;
    isActive: boolean;
    createdAt: string;
}

export interface ScheduleFilters {
    startDate?: string;
    endDate?: string;
    programId?: string;
    locationId?: string;
    roomId?: string;
    instructorId?: string;
    status?: string;
    publishStatus?: string;
}

export interface BulkScheduleData {
    templateId: string;
    startDate: string;
    endDate: string;
    excludeDates?: string[];
}
