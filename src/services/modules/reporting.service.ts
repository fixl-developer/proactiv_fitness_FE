import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface Report {
    id: string
    name: string
    type: 'attendance' | 'revenue' | 'enrollment' | 'performance' | 'custom'
    description: string
    generatedAt: string
    generatedBy: string
    data: any
    format: 'pdf' | 'excel' | 'json'
}

export interface CreateReportDTO {
    name: string
    type: 'attendance' | 'revenue' | 'enrollment' | 'performance' | 'custom'
    description: string
    filters?: any
    format: 'pdf' | 'excel' | 'json'
}

export interface ReportListResponse {
    success: boolean
    data: {
        reports: Report[]
        total: number
        page: number
        limit: number
    }
}

export interface ReportResponse {
    success: boolean
    data: Report
}

export interface AttendanceReportResponse {
    success: boolean
    data: {
        totalStudents: number
        presentCount: number
        absentCount: number
        attendanceRate: number
        byClass: any[]
    }
}

export interface RevenueReportResponse {
    success: boolean
    data: {
        totalRevenue: number
        totalExpense: number
        netProfit: number
        byMonth: any[]
        byCategory: any[]
    }
}

export interface EnrollmentReportResponse {
    success: boolean
    data: {
        totalEnrolled: number
        newEnrollments: number
        cancelledEnrollments: number
        byClass: any[]
        byLevel: any[]
    }
}

class ReportingService {
    private readonly MODULE_NAME = 'reporting'

    async getReports(page: number = 1, limit: number = 10, filters?: any): Promise<ReportListResponse> {
        try {
            const response = await apiClient.get<ReportListResponse>(
                '/reports',
                { params: { page, limit, ...filters } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getReportById(id: string): Promise<ReportResponse> {
        try {
            const response = await apiClient.get<ReportResponse>(`/reports/${id}`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async generateReport(data: CreateReportDTO): Promise<ReportResponse> {
        try {
            const response = await apiClient.post<ReportResponse>('/reports/generate', data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async deleteReport(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.delete<{ success: boolean; message: string }>(`/reports/${id}`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async downloadReport(id: string): Promise<Blob> {
        try {
            const response = await apiClient.get<Blob>(`/reports/${id}/download`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getAttendanceReport(startDate: string, endDate: string): Promise<AttendanceReportResponse> {
        try {
            const response = await apiClient.get<AttendanceReportResponse>(
                '/reports/attendance',
                { params: { startDate, endDate } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getRevenueReport(startDate: string, endDate: string): Promise<RevenueReportResponse> {
        try {
            const response = await apiClient.get<RevenueReportResponse>(
                '/reports/revenue',
                { params: { startDate, endDate } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getEnrollmentReport(startDate: string, endDate: string): Promise<EnrollmentReportResponse> {
        try {
            const response = await apiClient.get<EnrollmentReportResponse>(
                '/reports/enrollment',
                { params: { startDate, endDate } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async scheduleReport(data: CreateReportDTO & { frequency: 'daily' | 'weekly' | 'monthly' }): Promise<ReportResponse> {
        try {
            const response = await apiClient.post<ReportResponse>('/reports/schedule', data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const reportingService = new ReportingService()
export default ReportingService
