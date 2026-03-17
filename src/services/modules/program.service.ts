import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface Program {
    id: string
    name: string
    description: string
    category: string
    ageGroup: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'elite'
    duration: number // in weeks
    capacity: number
    currentEnrollment: number
    instructor: string
    schedule: {
        days: string[]
        time: string
        duration: number // in minutes
    }
    price: number
    curriculum?: string[]
    skills?: string[]
    prerequisites?: string[]
    status: 'active' | 'inactive' | 'archived'
    createdAt: string
    updatedAt: string
}

export interface CreateProgramDTO {
    name: string
    description: string
    category: string
    ageGroup: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'elite'
    duration: number
    capacity: number
    instructor: string
    schedule: {
        days: string[]
        time: string
        duration: number
    }
    price: number
    curriculum?: string[]
    skills?: string[]
    prerequisites?: string[]
}

export interface UpdateProgramDTO {
    name?: string
    description?: string
    level?: 'beginner' | 'intermediate' | 'advanced' | 'elite'
    capacity?: number
    instructor?: string
    schedule?: {
        days: string[]
        time: string
        duration: number
    }
    price?: number
    curriculum?: string[]
    skills?: string[]
    status?: 'active' | 'inactive' | 'archived'
}

export interface ProgramListResponse {
    success: boolean
    data: {
        programs: Program[]
        total: number
        page: number
        limit: number
    }
}

export interface ProgramDetailResponse {
    success: boolean
    data: Program
}

export interface ProgramEnrollmentResponse {
    success: boolean
    data: {
        programId: string
        studentId: string
        enrollmentDate: string
        status: 'active' | 'completed' | 'dropped'
        progress: number
    }
}

class ProgramService {
    private readonly MODULE_NAME = 'programs'

    async getPrograms(filters?: {
        page?: number
        limit?: number
        category?: string
        level?: string
        ageGroup?: string
        status?: string
    }): Promise<ProgramListResponse> {
        try {
            const response = await apiClient.get<ProgramListResponse>(
                '/programs',
                { params: filters }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getProgramById(id: string): Promise<ProgramDetailResponse> {
        try {
            const response = await apiClient.get<ProgramDetailResponse>(
                `/programs/${id}`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async createProgram(data: CreateProgramDTO): Promise<ProgramDetailResponse> {
        try {
            const response = await apiClient.post<ProgramDetailResponse>(
                '/programs',
                data
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateProgram(id: string, data: UpdateProgramDTO): Promise<ProgramDetailResponse> {
        try {
            const response = await apiClient.put<ProgramDetailResponse>(
                `/programs/${id}`,
                data
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async deleteProgram(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.delete<{ success: boolean; message: string }>(
                `/programs/${id}`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getProgramsByCategory(category: string, filters?: {
        page?: number
        limit?: number
        level?: string
    }): Promise<ProgramListResponse> {
        try {
            const response = await apiClient.get<ProgramListResponse>(
                `/programs/category/${category}`,
                { params: filters }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getProgramsByLevel(level: string, filters?: {
        page?: number
        limit?: number
    }): Promise<ProgramListResponse> {
        try {
            const response = await apiClient.get<ProgramListResponse>(
                `/programs/level/${level}`,
                { params: filters }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async enrollStudent(programId: string, studentId: string): Promise<ProgramEnrollmentResponse> {
        try {
            const response = await apiClient.post<ProgramEnrollmentResponse>(
                `/programs/${programId}/enroll`,
                { studentId }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getEnrolledStudents(programId: string, filters?: {
        page?: number
        limit?: number
        status?: string
    }): Promise<{
        success: boolean
        data: {
            students: Array<{
                studentId: string
                name: string
                enrollmentDate: string
                status: string
                progress: number
            }>
            total: number
        }
    }> {
        try {
            const response = await apiClient.get<any>(
                `/programs/${programId}/students`,
                { params: filters }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getProgramStats(): Promise<{
        success: boolean
        data: {
            totalPrograms: number
            activePrograms: number
            totalEnrollments: number
            byCategory: Record<string, number>
            byLevel: Record<string, number>
        }
    }> {
        try {
            const response = await apiClient.get<any>(
                '/programs/stats'
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getCurriculum(programId: string): Promise<{
        success: boolean
        data: {
            programId: string
            curriculum: Array<{
                week: number
                topic: string
                skills: string[]
                objectives: string[]
            }>
        }
    }> {
        try {
            const response = await apiClient.get<any>(
                `/programs/${programId}/curriculum`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const programService = new ProgramService()
export default ProgramService
