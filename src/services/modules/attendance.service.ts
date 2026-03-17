import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface AttendanceRecord {
    id: string
    studentId: string
    classId: string
    date: string
    status: 'present' | 'absent' | 'late' | 'excused'
    checkInTime?: string
    checkOutTime?: string
    notes?: string
    markedBy: string
    markedAt: string
}

export interface CreateAttendanceDTO {
    studentId: string
    classId: string
    date: string
    status: 'present' | 'absent' | 'late' | 'excused'
    checkInTime?: string
    checkOutTime?: string
    notes?: string
}

export interface UpdateAttendanceDTO {
    status?: 'present' | 'absent' | 'late' | 'excused'
    checkInTime?: string
    checkOutTime?: string
    notes?: string
}

export interface AttendanceListResponse {
    success: boolean
    data: {
        records: AttendanceRecord[]
        total: number
        page: number
        limit: number
    }
}

export interface AttendanceDetailResponse {
    success: boolean
    data: AttendanceRecord
}

export interface AttendanceStatsResponse {
    success: boolean
    data: {
        totalClasses: number
        presentDays: number
        absentDays: number
        lateDays: number
        excusedDays: number
        attendancePercentage: number
        trend: Array<{ date: string; status: string }>
    }
}

class AttendanceService {
    private readonly MODULE_NAME = 'attendance'

    async getAttendance(filters?: {
        page?: number
        limit?: number
        studentId?: string
        classId?: string
        dateFrom?: string
        dateTo?: string
        status?: string
    }): Promise<AttendanceListResponse> {
        try {
            const response = await apiClient.get<AttendanceListResponse>(
                '/attendance',
                { params: filters }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getAttendanceById(id: string): Promise<AttendanceDetailResponse> {
        try {
            const response = await apiClient.get<AttendanceDetailResponse>(
                `/attendance/${id}`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async createAttendance(data: CreateAttendanceDTO): Promise<AttendanceDetailResponse> {
        try {
            const response = await apiClient.post<AttendanceDetailResponse>(
                '/attendance',
                data
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateAttendance(id: string, data: UpdateAttendanceDTO): Promise<AttendanceDetailResponse> {
        try {
            const response = await apiClient.put<AttendanceDetailResponse>(
                `/attendance/${id}`,
                data
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async deleteAttendance(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.delete<{ success: boolean; message: string }>(
                `/attendance/${id}`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getAttendanceByStudent(studentId: string, filters?: {
        page?: number
        limit?: number
        dateFrom?: string
        dateTo?: string
    }): Promise<AttendanceListResponse> {
        try {
            const response = await apiClient.get<AttendanceListResponse>(
                `/attendance/student/${studentId}`,
                { params: filters }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getAttendanceByClass(classId: string, filters?: {
        page?: number
        limit?: number
        date?: string
    }): Promise<AttendanceListResponse> {
        try {
            const response = await apiClient.get<AttendanceListResponse>(
                `/attendance/class/${classId}`,
                { params: filters }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getStudentAttendanceStats(studentId: string): Promise<AttendanceStatsResponse> {
        try {
            const response = await apiClient.get<AttendanceStatsResponse>(
                `/attendance/student/${studentId}/stats`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async markBulkAttendance(data: CreateAttendanceDTO[]): Promise<{
        success: boolean
        data: AttendanceRecord[]
        message: string
    }> {
        try {
            const response = await apiClient.post<any>(
                '/attendance/bulk',
                { records: data }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getClassAttendanceReport(classId: string, dateFrom: string, dateTo: string): Promise<{
        success: boolean
        data: {
            classId: string
            dateRange: { from: string; to: string }
            students: Array<{
                studentId: string
                name: string
                present: number
                absent: number
                late: number
                excused: number
                percentage: number
            }>
        }
    }> {
        try {
            const response = await apiClient.get<any>(
                `/attendance/class/${classId}/report`,
                { params: { dateFrom, dateTo } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const attendanceService = new AttendanceService()
export default AttendanceService
