import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

// ==================== INTERFACES ====================

export interface CoachListItem {
    _id: string
    staffId: string
    personalInfo: {
        firstName: string
        lastName: string
    }
    contactInfo: {
        email: string
        phone?: string
    }
    staffType: string
    status: string
    specializations: string[]
    skills: string[]
    experienceYears: number
    locationIds: string[]
    primaryLocationId?: string
    createdAt: string
    performanceMetrics: any[]
}

export interface CreateCoachPayload {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
    specializations?: string[]
    skills?: string[]
    experienceYears?: number
    locationId?: string
    organizationId?: string
    maxHoursPerWeek?: number
}

export interface CoachStats {
    totalCoaches: number
    activeCoaches: number
    onLeaveCoaches: number
    avgExperience: number
}

// ==================== SERVICE ====================

class CoachAdminService {
    private readonly MODULE_NAME = 'coach-admin'

    /**
     * Get all coaches with optional filters
     */
    async getCoaches(params?: {
        page?: number
        limit?: number
        status?: string
        locationId?: string
        searchText?: string
    }): Promise<{ data: CoachListItem[]; total: number; page: number; totalPages: number }> {
        try {
            const response = await apiClient.get<any>('/staff/coaches', { params })
            const result = response?.data || response
            return {
                data: result?.docs || result?.data || result || [],
                total: result?.totalDocs || result?.total || 0,
                page: result?.page || 1,
                totalPages: result?.totalPages || 1
            }
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    /**
     * Create a new coach (creates both User + Staff records)
     */
    async createCoach(data: CreateCoachPayload): Promise<any> {
        try {
            const response = await apiClient.post<any>('/staff/coaches', data)
            return response?.data || response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    /**
     * Update an existing coach's staff record
     */
    async updateCoach(staffId: string, data: Partial<{
        personalInfo: { firstName: string; lastName: string }
        contactInfo: { email: string; phone: string }
        specializations: string[]
        skills: string[]
        experienceYears: number
        status: string
        maxHoursPerWeek: number
    }>): Promise<any> {
        try {
            const response = await apiClient.put<any>(`/staff/${staffId}`, data)
            return response?.data || response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    /**
     * Delete (deactivate) a coach
     */
    async deleteCoach(staffId: string): Promise<any> {
        try {
            const response = await apiClient.delete<any>(`/staff/${staffId}`)
            return response?.data || response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    /**
     * Get coach statistics
     */
    async getCoachStatistics(): Promise<CoachStats> {
        try {
            const response = await apiClient.get<any>('/staff/coaches/statistics')
            return response?.data || response || {
                totalCoaches: 0,
                activeCoaches: 0,
                onLeaveCoaches: 0,
                avgExperience: 0
            }
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    /**
     * Get a single coach by staffId
     */
    async getCoachById(staffId: string): Promise<CoachListItem | null> {
        try {
            const response = await apiClient.get<any>(`/staff/${staffId}`)
            return response?.data || response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const coachAdminService = new CoachAdminService()
export default CoachAdminService
