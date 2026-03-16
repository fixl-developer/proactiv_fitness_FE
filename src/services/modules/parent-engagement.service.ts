import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface EngagementActivity {
    id: string
    parentId: string
    type: 'message' | 'update' | 'achievement' | 'milestone'
    title: string
    description: string
    studentId: string
    studentName: string
    date: string
    read: boolean
    actionUrl?: string
}

export interface ParentEngagement {
    id: string
    parentId: string
    childrenCount: number
    activeChildren: number
    totalClasses: number
    attendanceRate: number
    communicationScore: number
    engagementLevel: 'high' | 'medium' | 'low'
    lastActivity: string
    preferences: {
        emailNotifications: boolean
        smsNotifications: boolean
        appNotifications: boolean
        frequency: 'daily' | 'weekly' | 'monthly'
    }
}

export interface CreateEngagementDTO {
    parentId: string
    type: 'message' | 'update' | 'achievement' | 'milestone'
    title: string
    description: string
    studentId: string
}

export interface EngagementListResponse {
    success: boolean
    data: {
        activities: EngagementActivity[]
        total: number
        page: number
        limit: number
    }
}

export interface EngagementDetailResponse {
    success: boolean
    data: ParentEngagement
}

class ParentEngagementService {
    private readonly MODULE_NAME = 'parent-engagement'

    async getEngagementActivities(parentId: string, filters?: {
        page?: number
        limit?: number
        type?: string
        read?: boolean
    }): Promise<EngagementListResponse> {
        try {
            const response = await apiClient.get<EngagementListResponse>(
                `/parent-engagement/${parentId}/activities`,
                { params: filters }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getEngagementProfile(parentId: string): Promise<EngagementDetailResponse> {
        try {
            const response = await apiClient.get<EngagementDetailResponse>(
                `/parent-engagement/${parentId}`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async createEngagementActivity(data: CreateEngagementDTO): Promise<{
        success: boolean
        data: EngagementActivity
    }> {
        try {
            const response = await apiClient.post<any>(
                '/parent-engagement/activity',
                data
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async markActivityAsRead(activityId: string): Promise<{ success: boolean }> {
        try {
            const response = await apiClient.put<{ success: boolean }>(
                `/parent-engagement/activity/${activityId}/read`,
                {}
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateEngagementPreferences(parentId: string, preferences: any): Promise<EngagementDetailResponse> {
        try {
            const response = await apiClient.put<EngagementDetailResponse>(
                `/parent-engagement/${parentId}/preferences`,
                { preferences }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getEngagementStats(parentId: string): Promise<{
        success: boolean
        data: {
            totalActivities: number
            unreadActivities: number
            communicationScore: number
            engagementLevel: string
            lastActivityDate: string
        }
    }> {
        try {
            const response = await apiClient.get<any>(
                `/parent-engagement/${parentId}/stats`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async sendMessage(parentId: string, message: string, recipientId: string): Promise<{
        success: boolean
        data: EngagementActivity
    }> {
        try {
            const response = await apiClient.post<any>(
                `/parent-engagement/${parentId}/message`,
                { message, recipientId }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const parentEngagementService = new ParentEngagementService()
export default ParentEngagementService
