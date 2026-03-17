import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface StudentROI {
    studentId: string
    studentName: string
    skillsAcquired: string[]
    skillsProgress: Record<string, number>
    confidenceLevel: number
    improvementRate: number
    classesAttended: number
    classesCompleted: number
    certificationsEarned: string[]
    achievements: string[]
    nextMilestones: string[]
    estimatedTimeToNextLevel: number
}

export interface ParentROI {
    parentId: string
    children: StudentROI[]
    overallProgress: number
    totalInvestment: number
    valueGenerated: number
    roiPercentage: number
    satisfactionScore: number
    recommendationScore: number
    trends: {
        skillDevelopment: number
        confidenceGrowth: number
        attendanceConsistency: number
    }
}

export interface ROIListResponse {
    success: boolean
    data: {
        roi: ParentROI
        children: StudentROI[]
    }
}

export interface ProgressMetric {
    date: string
    skillsCount: number
    confidenceLevel: number
    classesAttended: number
}

class ParentROIService {
    private readonly MODULE_NAME = 'parent-roi'

    async getParentROI(parentId: string): Promise<ROIListResponse> {
        try {
            const response = await apiClient.get<ROIListResponse>(
                `/parent-roi/${parentId}`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getStudentROI(studentId: string): Promise<{
        success: boolean
        data: StudentROI
    }> {
        try {
            const response = await apiClient.get<any>(
                `/parent-roi/student/${studentId}`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getProgressTrend(studentId: string, dateRange?: {
        startDate: string
        endDate: string
    }): Promise<{
        success: boolean
        data: ProgressMetric[]
    }> {
        try {
            const response = await apiClient.get<any>(
                `/parent-roi/student/${studentId}/progress`,
                { params: dateRange }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getSkillsBreakdown(studentId: string): Promise<{
        success: boolean
        data: {
            skills: Array<{
                name: string
                level: number
                progress: number
                lastUpdated: string
            }>
        }
    }> {
        try {
            const response = await apiClient.get<any>(
                `/parent-roi/student/${studentId}/skills`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getAchievements(studentId: string): Promise<{
        success: boolean
        data: {
            achievements: Array<{
                id: string
                name: string
                description: string
                earnedDate: string
                icon: string
            }>
        }
    }> {
        try {
            const response = await apiClient.get<any>(
                `/parent-roi/student/${studentId}/achievements`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getROIComparison(parentId: string): Promise<{
        success: boolean
        data: {
            parentROI: number
            averageROI: number
            topROI: number
            percentile: number
        }
    }> {
        try {
            const response = await apiClient.get<any>(
                `/parent-roi/${parentId}/comparison`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async generateROIReport(parentId: string): Promise<{
        success: boolean
        data: {
            reportUrl: string
            generatedAt: string
        }
    }> {
        try {
            const response = await apiClient.post<any>(
                `/parent-roi/${parentId}/report`,
                {}
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getNextMilestones(studentId: string): Promise<{
        success: boolean
        data: {
            milestones: Array<{
                name: string
                description: string
                estimatedDaysToAchieve: number
                requiredSkills: string[]
                reward?: string
            }>
        }
    }> {
        try {
            const response = await apiClient.get<any>(
                `/parent-roi/student/${studentId}/milestones`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const parentROIService = new ParentROIService()
export default ParentROIService
