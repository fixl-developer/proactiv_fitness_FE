import { apiClient } from '../api/client'

class ReportsService {
    // Enrollment Reports
    async getEnrollmentReport(startDate?: string, endDate?: string) {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await apiClient.get(`/admin/reports/enrollment?${params}`)
        return response.data
    }

    async getEnrollmentByProgram(startDate?: string, endDate?: string) {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await apiClient.get(`/admin/reports/enrollment/by-program?${params}`)
        return response.data
    }

    async getEnrollmentTrends(period: 'monthly' | 'quarterly' | 'yearly') {
        const response = await apiClient.get(`/admin/reports/enrollment/trends?period=${period}`)
        return response.data
    }

    // Performance Reports
    async getPerformanceReport(type: 'location' | 'coach' | 'program', startDate?: string, endDate?: string) {
        const params = new URLSearchParams({ type })
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await apiClient.get(`/admin/reports/performance?${params}`)
        return response.data
    }

    async getCoachPerformance(coachId?: string) {
        const url = coachId
            ? `/admin/reports/performance/coach/${coachId}`
            : '/admin/reports/performance/coaches'
        const response = await apiClient.get(url)
        return response.data
    }

    async getLocationPerformance(locationId?: string) {
        const url = locationId
            ? `/admin/reports/performance/location/${locationId}`
            : '/admin/reports/performance/locations'
        const response = await apiClient.get(url)
        return response.data
    }

    // Audit Reports
    async getAuditLogs(page = 1, limit = 50, filters?: any) {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
        if (filters?.userId) params.append('userId', filters.userId)
        if (filters?.action) params.append('action', filters.action)
        if (filters?.startDate) params.append('startDate', filters.startDate)
        if (filters?.endDate) params.append('endDate', filters.endDate)

        const response = await apiClient.get(`/admin/reports/audit?${params}`)
        return response.data
    }

    async getAuditLogById(id: string) {
        const response = await apiClient.get(`/admin/reports/audit/${id}`)
        return response.data
    }

    async getAuditStatistics(startDate?: string, endDate?: string) {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await apiClient.get(`/admin/reports/audit/statistics?${params}`)
        return response.data
    }

    // Export Reports
    async exportReport(type: string, format: 'csv' | 'pdf' | 'excel', filters?: any) {
        const response = await apiClient.post(`/admin/reports/export`, {
            type,
            format,
            filters
        }, {
            responseType: 'blob'
        })
        return response.data
    }
}

export default new ReportsService()
