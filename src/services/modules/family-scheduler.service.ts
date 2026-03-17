import { apiClient } from '../api/client'

export interface FamilyScheduleEvent {
    id: string
    childId: string
    eventType: 'class' | 'appointment' | 'activity' | 'holiday' | 'other'
    title: string
    description?: string
    startTime: string
    endTime: string
    location?: string
    instructor?: string
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
    color?: string
    reminders?: {
        type: 'email' | 'sms' | 'push'
        minutesBefore: number
    }[]
}

export interface FamilyScheduleConflict {
    id: string
    childId: string
    conflictType: 'overlap' | 'transportation' | 'sibling'
    event1: FamilyScheduleEvent
    event2: FamilyScheduleEvent
    severity: 'low' | 'medium' | 'high'
    suggestedResolution?: string
}

export interface FamilyScheduleStats {
    totalEvents: number
    upcomingEvents: number
    completedEvents: number
    conflicts: number
    averageEventsPerWeek: number
}

export class FamilySchedulerService {
    /**
     * Get family schedule for a date range
     */
    static async getFamilySchedule(parentId: string, startDate: string, endDate: string): Promise<FamilyScheduleEvent[]> {
        try {
            const response = await apiClient.get<{ data: FamilyScheduleEvent[] }>(`/family-scheduler/${parentId}`, {
                params: { startDate, endDate }
            })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching family schedule:', error)
            throw error
        }
    }

    /**
     * Get child's schedule
     */
    static async getChildSchedule(childId: string, startDate: string, endDate: string): Promise<FamilyScheduleEvent[]> {
        try {
            const response = await apiClient.get(`/family-scheduler/child/${childId}`, {
                params: { startDate, endDate }
            })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching child schedule:', error)
            throw error
        }
    }

    /**
     * Add event to family schedule
     */
    static async addEvent(parentId: string, event: Omit<FamilyScheduleEvent, 'id'>): Promise<FamilyScheduleEvent> {
        try {
            const response = await apiClient.post(`/family-scheduler/${parentId}/events`, event)
            return (response as any)?.data
        } catch (error) {
            console.error('Error adding event:', error)
            throw error
        }
    }

    /**
     * Update family schedule event
     */
    static async updateEvent(eventId: string, updates: Partial<FamilyScheduleEvent>): Promise<FamilyScheduleEvent> {
        try {
            const response = await apiClient.patch(`/family-scheduler/events/${eventId}`, updates)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating event:', error)
            throw error
        }
    }

    /**
     * Delete family schedule event
     */
    static async deleteEvent(eventId: string): Promise<void> {
        try {
            await apiClient.delete(`/family-scheduler/events/${eventId}`)
        } catch (error) {
            console.error('Error deleting event:', error)
            throw error
        }
    }

    /**
     * Check for schedule conflicts
     */
    static async checkConflicts(parentId: string): Promise<FamilyScheduleConflict[]> {
        try {
            const response = await apiClient.get(`/family-scheduler/${parentId}/conflicts`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error checking conflicts:', error)
            throw error
        }
    }

    /**
     * Get schedule statistics
     */
    static async getScheduleStats(parentId: string): Promise<FamilyScheduleStats> {
        try {
            const response = await apiClient.get(`/family-scheduler/${parentId}/stats`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching schedule stats:', error)
            throw error
        }
    }

    /**
     * Sync with external calendar
     */
    static async syncExternalCalendar(parentId: string, calendarType: 'google' | 'outlook' | 'apple', accessToken: string): Promise<{ synced: number; conflicts: number }> {
        try {
            const response = await apiClient.post(`/family-scheduler/${parentId}/sync`, {
                calendarType,
                accessToken
            })
            return (response as any)?.data
        } catch (error) {
            console.error('Error syncing calendar:', error)
            throw error
        }
    }

    /**
     * Get upcoming events for all children
     */
    static async getUpcomingEvents(parentId: string, days: number = 7): Promise<FamilyScheduleEvent[]> {
        try {
            const response = await apiClient.get(`/family-scheduler/${parentId}/upcoming?days=${days}`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching upcoming events:', error)
            throw error
        }
    }

    /**
     * Set reminders for event
     */
    static async setReminders(eventId: string, reminders: { type: 'email' | 'sms' | 'push'; minutesBefore: number }[]): Promise<FamilyScheduleEvent> {
        try {
            const response = await apiClient.patch(`/family-scheduler/events/${eventId}/reminders`, { reminders })
            return (response as any)?.data
        } catch (error) {
            console.error('Error setting reminders:', error)
            throw error
        }
    }

    /**
     * Get schedule suggestions for optimization
     */
    static async getScheduleSuggestions(parentId: string): Promise<{ suggestion: string; impact: string; priority: 'low' | 'medium' | 'high' }[]> {
        try {
            const response = await apiClient.get(`/family-scheduler/${parentId}/suggestions`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching schedule suggestions:', error)
            throw error
        }
    }
}
