import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface Schedule {
    id: string
    className: string
    classId: string
    coachId: string
    coachName: string
    dayOfWeek: string
    startTime: string
    endTime: string
    capacity: number
    enrolled: number
    location: string
    level: 'beginner' | 'intermediate' | 'advanced'
    status: 'active' | 'inactive' | 'cancelled'
    description?: string
    createdAt: string
}

export interface CreateScheduleDTO {
    className: string
    classId: string
    coachId: string
    dayOfWeek: string
    startTime: string
    endTime: string
    capacity: number
    location: string
    level: 'beginner' | 'intermediate' | 'advanced'
    description?: string
}

export interface UpdateScheduleDTO {
    className?: string
    coachId?: string
    dayOfWeek?: string
    startTime?: string
    endTime?: string
    capacity?: number
    location?: string
    level?: 'beginner' | 'intermediate' | 'advanced'
    status?: 'active' | 'inactive' | 'cancelled'
    description?: string
}

export interface ScheduleListResponse {
    success: boolean
    data: {
        schedules: Schedule[]
        total: number
        page: number
        limit: number
    }
}

export interface ScheduleResponse {
    success: boolean
    data: Schedule
}

class SchedulingService {
    private readonly MODULE_NAME = 'scheduling'

    async getSchedules(page: number = 1, limit: number = 10, filters?: any): Promise<ScheduleListResponse> {
        try {
            const response = await apiClient.get<ScheduleListResponse>(
                '/scheduling',
                { params: { page, limit, ...filters } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getScheduleById(id: string): Promise<ScheduleResponse> {
        try {
            const response = await apiClient.get<ScheduleResponse>(`/scheduling/${id}`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async createSchedule(data: CreateScheduleDTO): Promise<ScheduleResponse> {
        try {
            const response = await apiClient.post<ScheduleResponse>('/scheduling', data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateSchedule(id: string, data: UpdateScheduleDTO): Promise<ScheduleResponse> {
        try {
            const response = await apiClient.put<ScheduleResponse>(`/scheduling/${id}`, data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async deleteSchedule(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.delete<{ success: boolean; message: string }>(`/scheduling/${id}`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getCoachSchedules(coachId: string): Promise<ScheduleListResponse> {
        try {
            const response = await apiClient.get<ScheduleListResponse>(
                `/scheduling/coaches/${coachId}/schedule`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getSchedulesByDay(dayOfWeek: string): Promise<ScheduleListResponse> {
        try {
            const response = await apiClient.get<ScheduleListResponse>(
                '/scheduling/day',
                { params: { dayOfWeek } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getSchedulesByLevel(level: string): Promise<ScheduleListResponse> {
        try {
            const response = await apiClient.get<ScheduleListResponse>(
                '/scheduling/level',
                { params: { level } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getAvailableSlots(classId: string): Promise<{ success: boolean; data: { available: number; total: number } }> {
        try {
            const response = await apiClient.get<{ success: boolean; data: { available: number; total: number } }>(
                `/scheduling/${classId}/available-slots`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const schedulingService = new SchedulingService()
export default SchedulingService
