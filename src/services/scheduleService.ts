import apiClient, { ApiResponse } from '@/lib/apiClient'

// ==================== ENUMS ====================

export enum ScheduleStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export enum SessionStatus {
    SCHEDULED = 'scheduled',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    RESCHEDULED = 'rescheduled'
}

export enum ConflictType {
    COACH_DOUBLE_BOOKING = 'coach_double_booking',
    ROOM_DOUBLE_BOOKING = 'room_double_booking',
    EQUIPMENT_CONFLICT = 'equipment_conflict',
    CAPACITY_EXCEEDED = 'capacity_exceeded',
    TIME_OVERLAP = 'time_overlap',
    TRAVEL_TIME_VIOLATION = 'travel_time_violation'
}

// ==================== INTERFACES ====================

export interface TimeSlot {
    startTime: string
    endTime: string
    dayOfWeek: number
}

export interface CoachAssignment {
    coachId: string
    role: 'primary' | 'assistant' | 'substitute'
    confirmedAt?: string
    notes?: string
}

export interface ResourceRequirement {
    resourceType: 'room' | 'equipment' | 'facility'
    resourceId: string
    quantity?: number
    isRequired: boolean
    alternatives?: string[]
}

export interface Conflict {
    type: ConflictType
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    affectedSessions: string[]
    suggestedResolution?: string
    resolvedAt?: string
    resolvedBy?: string
}

export interface Session {
    _id: string
    sessionId: string
    programId: string
    termId: string
    scheduleId: string
    date: string
    startTime: string
    endTime: string
    locationId: string
    roomId?: string
    coaches: CoachAssignment[]
    capacity: number
    enrolled: number
    waitlist: number
    status: SessionStatus
    resources: ResourceRequirement[]
    conflicts?: Conflict[]
    notes?: string
    createdAt: string
    updatedAt: string
}

export interface Schedule {
    _id: string
    name: string
    description?: string
    programId: string
    termId: string
    locationId: string
    timeSlots: TimeSlot[]
    coaches: CoachAssignment[]
    capacity: number
    resources: ResourceRequirement[]
    status: ScheduleStatus
    sessions: string[]
    publishedAt?: string
    createdBy: string
    updatedBy?: string
    createdAt: string
    updatedAt: string
}

export interface CreateScheduleRequest {
    name: string
    description?: string
    programId: string
    termId: string
    locationId: string
    timeSlots: TimeSlot[]
    coaches: CoachAssignment[]
    capacity: number
    resources?: ResourceRequirement[]
}

export interface UpdateScheduleRequest {
    name?: string
    description?: string
    timeSlots?: TimeSlot[]
    coaches?: CoachAssignment[]
    capacity?: number
    resources?: ResourceRequirement[]
    status?: ScheduleStatus
}

export interface AvailabilitySlot {
    dayOfWeek: number
    startTime: string
    endTime: string
    isAvailable: boolean
    reason?: string
}

export interface SubstituteRequest {
    originalCoachId: string
    substituteCoachId?: string
    requestedBy: string
    requestedAt: string
    reason: string
    status: 'requested' | 'confirmed' | 'declined' | 'completed'
    respondedAt?: string
    notes?: string
}

// ==================== SCHEDULE SERVICE ====================

export class ScheduleService {
    /**
     * Get all schedules
     * Backend: GET /schedules
     */
    static async getSchedules(params?: {
        programId?: string
        termId?: string
        locationId?: string
        status?: ScheduleStatus
        startDate?: string
        endDate?: string
        page?: number
        limit?: number
    }): Promise<Schedule[]> {
        try {
            const response = await apiClient.get<Schedule[]>('/schedules', { params })
            return response.data
        } catch (error: any) {
            console.error('Get schedules failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch schedules')
        }
    }

    /**
     * Get schedule by ID
     * Backend: GET /schedules/:id
     */
    static async getScheduleById(id: string): Promise<Schedule> {
        try {
            const response = await apiClient.get<Schedule>(`/schedules/${id}`)
            return response.data
        } catch (error: any) {
            console.error('Get schedule failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch schedule')
        }
    }

    /**
     * Create schedule (Admin only)
     * Backend: POST /schedules
     */
    static async createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
        try {
            const response = await apiClient.post<Schedule>('/schedules', data)
            return response.data
        } catch (error: any) {
            console.error('Create schedule failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to create schedule')
        }
    }

    /**
     * Update schedule (Admin only)
     * Backend: PUT /schedules/:id
     */
    static async updateSchedule(id: string, data: UpdateScheduleRequest): Promise<Schedule> {
        try {
            const response = await apiClient.put<Schedule>(`/schedules/${id}`, data)
            return response.data
        } catch (error: any) {
            console.error('Update schedule failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to update schedule')
        }
    }

    /**
     * Delete schedule (Admin only)
     * Backend: DELETE /schedules/:id
     */
    static async deleteSchedule(id: string): Promise<void> {
        try {
            await apiClient.delete(`/schedules/${id}`)
        } catch (error: any) {
            console.error('Delete schedule failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete schedule')
        }
    }

    /**
     * Publish schedule (Admin only)
     * Backend: PATCH /schedules/:id/publish
     */
    static async publishSchedule(id: string): Promise<Schedule> {
        try {
            const response = await apiClient.patch<Schedule>(`/schedules/${id}/publish`)
            return response.data
        } catch (error: any) {
            console.error('Publish schedule failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to publish schedule')
        }
    }

    /**
     * Generate sessions from schedule
     * Backend: POST /schedules/:id/generate-sessions
     */
    static async generateSessions(id: string, params: {
        startDate: string
        endDate: string
    }): Promise<Session[]> {
        try {
            const response = await apiClient.post<Session[]>(`/schedules/${id}/generate-sessions`, params)
            return response.data
        } catch (error: any) {
            console.error('Generate sessions failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to generate sessions')
        }
    }

    /**
     * Get sessions
     * Backend: GET /sessions
     */
    static async getSessions(params?: {
        scheduleId?: string
        programId?: string
        locationId?: string
        coachId?: string
        date?: string
        startDate?: string
        endDate?: string
        status?: SessionStatus
        page?: number
        limit?: number
    }): Promise<Session[]> {
        try {
            const response = await apiClient.get<Session[]>('/sessions', { params })
            return response.data
        } catch (error: any) {
            console.error('Get sessions failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch sessions')
        }
    }

    /**
     * Get session by ID
     * Backend: GET /sessions/:id
     */
    static async getSessionById(id: string): Promise<Session> {
        try {
            const response = await apiClient.get<Session>(`/sessions/${id}`)
            return response.data
        } catch (error: any) {
            console.error('Get session failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch session')
        }
    }

    /**
     * Update session (Admin only)
     * Backend: PUT /sessions/:id
     */
    static async updateSession(id: string, data: Partial<Session>): Promise<Session> {
        try {
            const response = await apiClient.put<Session>(`/sessions/${id}`, data)
            return response.data
        } catch (error: any) {
            console.error('Update session failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to update session')
        }
    }

    /**
     * Cancel session (Admin only)
     * Backend: PATCH /sessions/:id/cancel
     */
    static async cancelSession(id: string, reason?: string): Promise<Session> {
        try {
            const response = await apiClient.patch<Session>(`/sessions/${id}/cancel`, { reason })
            return response.data
        } catch (error: any) {
            console.error('Cancel session failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to cancel session')
        }
    }

    /**
     * Get coach availability
     * Backend: GET /schedules/coach/:coachId/availability
     */
    static async getCoachAvailability(coachId: string, params: {
        startDate: string
        endDate: string
    }): Promise<AvailabilitySlot[]> {
        try {
            const response = await apiClient.get<AvailabilitySlot[]>(
                `/schedules/coach/${coachId}/availability`,
                { params }
            )
            return response.data
        } catch (error: any) {
            console.error('Get coach availability failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch coach availability')
        }
    }

    /**
     * Check for conflicts
     * Backend: POST /schedules/check-conflicts
     */
    static async checkConflicts(data: {
        scheduleId?: string
        sessionId?: string
        date: string
        startTime: string
        endTime: string
        locationId: string
        roomId?: string
        coachIds: string[]
    }): Promise<Conflict[]> {
        try {
            const response = await apiClient.post<Conflict[]>('/schedules/check-conflicts', data)
            return response.data
        } catch (error: any) {
            console.error('Check conflicts failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to check conflicts')
        }
    }

    /**
     * Request substitute coach
     * Backend: POST /schedules/substitute-request
     */
    static async requestSubstitute(data: {
        sessionId: string
        originalCoachId: string
        reason: string
        notes?: string
    }): Promise<SubstituteRequest> {
        try {
            const response = await apiClient.post<SubstituteRequest>('/schedules/substitute-request', data)
            return response.data
        } catch (error: any) {
            console.error('Request substitute failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to request substitute')
        }
    }

    /**
     * Respond to substitute request
     * Backend: PATCH /schedules/substitute-request/:id
     */
    static async respondToSubstituteRequest(
        id: string,
        data: {
            status: 'confirmed' | 'declined'
            notes?: string
        }
    ): Promise<SubstituteRequest> {
        try {
            const response = await apiClient.patch<SubstituteRequest>(
                `/schedules/substitute-request/${id}`,
                data
            )
            return response.data
        } catch (error: any) {
            console.error('Respond to substitute request failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to respond to substitute request')
        }
    }

    /**
     * Get room availability
     * Backend: GET /schedules/room/:roomId/availability
     */
    static async getRoomAvailability(roomId: string, params: {
        date: string
    }): Promise<AvailabilitySlot[]> {
        try {
            const response = await apiClient.get<AvailabilitySlot[]>(
                `/schedules/room/${roomId}/availability`,
                { params }
            )
            return response.data
        } catch (error: any) {
            console.error('Get room availability failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch room availability')
        }
    }

    /**
     * Bulk update sessions
     * Backend: PATCH /sessions/bulk-update
     */
    static async bulkUpdateSessions(data: {
        sessionIds: string[]
        updates: Partial<Session>
    }): Promise<Session[]> {
        try {
            const response = await apiClient.patch<Session[]>('/sessions/bulk-update', data)
            return response.data
        } catch (error: any) {
            console.error('Bulk update sessions failed:', error)
            throw new Error(error.response?.data?.message || 'Failed to bulk update sessions')
        }
    }
}
