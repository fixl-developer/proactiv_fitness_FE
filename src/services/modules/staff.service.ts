import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface Staff {
    id: string
    name: string
    email: string
    phone: string
    role: string
    position: string
    department: string
    status: 'active' | 'inactive' | 'on-leave'
    joinDate: string
    salary?: number
    qualifications?: string[]
    certifications?: string[]
    availability?: {
        monday: string[]
        tuesday: string[]
        wednesday: string[]
        thursday: string[]
        friday: string[]
        saturday: string[]
        sunday: string[]
    }
    performance?: {
        rating: number
        reviews: number
        lastReviewDate: string
    }
}

export interface CreateStaffDTO {
    name: string
    email: string
    phone: string
    role: string
    position: string
    department: string
    joinDate: string
    qualifications?: string[]
}

export interface UpdateStaffDTO {
    name?: string
    phone?: string
    position?: string
    status?: 'active' | 'inactive' | 'on-leave'
    availability?: Staff['availability']
}

export interface StaffListResponse {
    success: boolean
    data: {
        staff: Staff[]
        total: number
        page: number
        limit: number
    }
}

export interface StaffDetailResponse {
    success: boolean
    data: Staff
}

class StaffService {
    private readonly MODULE_NAME = 'staff'

    async getStaff(filters?: {
        page?: number
        limit?: number
        role?: string
        status?: string
        department?: string
    }): Promise<StaffListResponse> {
        try {
            const response = await apiClient.get<StaffListResponse>(
                '/staff',
                { params: filters }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getStaffById(id: string): Promise<StaffDetailResponse> {
        try {
            const response = await apiClient.get<StaffDetailResponse>(
                `/staff/${id}`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async createStaff(data: CreateStaffDTO): Promise<StaffDetailResponse> {
        try {
            const response = await apiClient.post<StaffDetailResponse>(
                '/staff',
                data
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateStaff(id: string, data: UpdateStaffDTO): Promise<StaffDetailResponse> {
        try {
            const response = await apiClient.put<StaffDetailResponse>(
                `/staff/${id}`,
                data
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async deleteStaff(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.delete<{ success: boolean; message: string }>(
                `/staff/${id}`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getStaffByRole(role: string): Promise<StaffListResponse> {
        try {
            const response = await apiClient.get<StaffListResponse>(
                '/staff',
                { params: { role } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getStaffAvailability(id: string): Promise<{ success: boolean; data: Staff['availability'] }> {
        try {
            const response = await apiClient.get<{ success: boolean; data: Staff['availability'] }>(
                `/staff/${id}/availability`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateStaffAvailability(id: string, availability: Staff['availability']): Promise<StaffDetailResponse> {
        try {
            const response = await apiClient.put<StaffDetailResponse>(
                `/staff/${id}/availability`,
                { availability }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getStaffPerformance(id: string): Promise<{ success: boolean; data: Staff['performance'] }> {
        try {
            const response = await apiClient.get<{ success: boolean; data: Staff['performance'] }>(
                `/staff/${id}/performance`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getStaffStats(): Promise<{
        success: boolean; data: {
            totalStaff: number
            activeStaff: number
            onLeave: number
            byRole: Record<string, number>
            byDepartment: Record<string, number>
        }
    }> {
        try {
            const response = await apiClient.get<any>(
                '/staff/stats'
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const staffService = new StaffService()
export default StaffService
