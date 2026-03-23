import apiClient from '@/lib/apiClient'

// Types for Regional Admin Dashboard
export interface RegionalLocation {
    id: string
    name: string
    code?: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
    email: string
    manager: string
    students: number
    staff?: number
    revenue: number
    occupancyRate: number
    capacity?: number
    status: 'ACTIVE' | 'INACTIVE'
    rating?: number
    facilities?: string[]
    amenities?: string[]
    createdAt: string
}

export interface RegionalStaff {
    id: string
    name: string
    firstName?: string
    lastName?: string
    email: string
    phone: string
    role: string
    location: string
    locationId?: string
    status: string
    joinDate?: string
    performance?: number
    utilization?: number
    satisfaction?: string
    createdAt?: string
}

export interface RegionalReport {
    id: string
    name: string
    type: 'REVENUE' | 'STUDENTS' | 'LOCATIONS' | 'STAFF'
    generatedAt: string
    generatedBy: string
    data: any
    status: 'COMPLETED' | 'PENDING' | 'FAILED'
}

export interface RegionalSettings {
    regionName: string
    regionCode: string
    regionManager: string
    managerEmail: string
    managerPhone: string
    timezone: string
    currency: string
    language: string
    notificationsEmail: boolean
    notificationsSMS: boolean
    notificationsPush: boolean
    maintenanceMode: boolean
    apiKey: string
    webhookUrl: string
    maxLocations: number
    maxStaff: number
    maxStudents: number
}

export interface RegionalAnalytics {
    revenue: {
        total: number
        monthly: Array<{ month: string; revenue: number; target: number }>
        byLocation: Array<{ location: string; amount: number }>
    }
    students: {
        total: number
        growth: Array<{ month: string; students: number; newEnrollments: number; churn: number }>
        byLocation: Array<{ location: string; count: number }>
    }
    staff: {
        total: number
        byRole: Array<{ role: string; count: number; utilization: number }>
        performance: Array<{ name: string; utilization: number; satisfaction: number; retention: number }>
    }
    locations: {
        total: number
        active: number
        performance: Array<{ location: string; revenue: number; enrollment: number; occupancy: number }>
    }
    totalRevenue?: number
    totalStudents?: number
    revenueGrowth?: number
    occupancyRate?: number
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// Regional Admin Service
export class RegionalAdminService {
    // =============================================
    // DASHBOARD
    // =============================================
    static async getDashboardOverview(): Promise<any> {
        try {
            const response = await apiClient.get('/admin/regional/dashboard')
            return response.data?.data || response.data
        } catch (error: any) {
            console.error('Failed to fetch dashboard overview:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch dashboard overview')
        }
    }

    // =============================================
    // LOCATIONS
    // =============================================
    static async getLocations(page: number = 1, pageSize: number = 20, search?: string, status?: string): Promise<PaginatedResponse<RegionalLocation>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (status && status !== 'all') params.append('status', status)
            const response = await apiClient.get(`/admin/regional/locations?${params.toString()}`)
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch locations:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch locations')
        }
    }

    static async getLocation(locationId: string): Promise<RegionalLocation> {
        try {
            const response = await apiClient.get(`/admin/regional/locations/${locationId}`)
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch location')
        }
    }

    static async createLocation(data: Partial<RegionalLocation>): Promise<RegionalLocation> {
        try {
            const response = await apiClient.post('/admin/regional/locations', data)
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create location')
        }
    }

    static async updateLocation(locationId: string, data: Partial<RegionalLocation>): Promise<RegionalLocation> {
        try {
            const response = await apiClient.put(`/admin/regional/locations/${locationId}`, data)
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update location')
        }
    }

    static async deleteLocation(locationId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/regional/locations/${locationId}`)
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete location')
        }
    }

    // =============================================
    // STAFF
    // =============================================
    static async getStaff(page: number = 1, pageSize: number = 20, search?: string, role?: string, status?: string): Promise<PaginatedResponse<RegionalStaff>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (role && role !== 'all') params.append('role', role)
            if (status && status !== 'all') params.append('status', status)
            const response = await apiClient.get(`/admin/regional/staff?${params.toString()}`)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch staff')
        }
    }

    static async getStaffMember(staffId: string): Promise<RegionalStaff> {
        try {
            const response = await apiClient.get(`/admin/regional/staff/${staffId}`)
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch staff member')
        }
    }

    static async createStaff(data: { firstName: string; lastName: string; email: string; phone?: string; role: string; locationId?: string; password?: string }): Promise<RegionalStaff> {
        try {
            const response = await apiClient.post('/admin/regional/staff', data)
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create staff member')
        }
    }

    static async updateStaff(staffId: string, data: Partial<RegionalStaff>): Promise<RegionalStaff> {
        try {
            const response = await apiClient.put(`/admin/regional/staff/${staffId}`, data)
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update staff member')
        }
    }

    static async deleteStaff(staffId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/regional/staff/${staffId}`)
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete staff member')
        }
    }

    // =============================================
    // ANALYTICS
    // =============================================
    static async getAnalytics(timeRange?: string): Promise<RegionalAnalytics> {
        try {
            const params = timeRange ? `?timeRange=${timeRange}` : ''
            const response = await apiClient.get(`/admin/regional/analytics${params}`)
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch analytics')
        }
    }

    // =============================================
    // REPORTS
    // =============================================
    static async getReports(page: number = 1, pageSize: number = 10, type?: string): Promise<PaginatedResponse<RegionalReport>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (type) params.append('type', type)
            const response = await apiClient.get(`/admin/regional/reports?${params.toString()}`)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch reports')
        }
    }

    static async generateReport(type: string, dateRange?: string): Promise<RegionalReport> {
        try {
            const response = await apiClient.post('/admin/regional/reports', { type, dateRange })
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to generate report')
        }
    }

    static async exportReport(reportId: string, format: 'pdf' | 'csv' | 'xlsx'): Promise<Blob> {
        try {
            const response = await apiClient.get(`/admin/regional/reports/${reportId}/export?format=${format}`, { responseType: 'blob' })
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to export report')
        }
    }

    // =============================================
    // APPROVALS
    // =============================================
    static async getPendingApprovals(page: number = 1, pageSize: number = 20, status?: string, type?: string): Promise<PaginatedResponse<any>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (status && status !== 'all') params.append('status', status)
            if (type && type !== 'all') params.append('type', type)
            const response = await apiClient.get(`/admin/regional/approvals?${params.toString()}`)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch approvals')
        }
    }

    static async approveRequest(approvalId: string, notes?: string): Promise<any> {
        try {
            const response = await apiClient.post(`/admin/regional/approvals/${approvalId}/approve`, { notes })
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to approve request')
        }
    }

    static async rejectRequest(approvalId: string, reason: string): Promise<any> {
        try {
            const response = await apiClient.post(`/admin/regional/approvals/${approvalId}/reject`, { reason })
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to reject request')
        }
    }

    // =============================================
    // SETTINGS
    // =============================================
    static async getSettings(): Promise<RegionalSettings> {
        try {
            const response = await apiClient.get('/admin/regional/settings')
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch settings')
        }
    }

    static async updateSettings(settings: Partial<RegionalSettings>): Promise<RegionalSettings> {
        try {
            const response = await apiClient.put('/admin/regional/settings', settings)
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update settings')
        }
    }

    static async testWebhook(webhookUrl: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post('/admin/regional/settings/test-webhook', { webhookUrl })
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to test webhook')
        }
    }

    static async regenerateApiKey(): Promise<{ apiKey: string }> {
        try {
            const response = await apiClient.post('/admin/regional/settings/regenerate-api-key')
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to regenerate API key')
        }
    }

    // =============================================
    // BUDGET
    // =============================================
    static async getBudget(period?: string): Promise<any> {
        try {
            const params = period ? `?period=${period}` : ''
            const response = await apiClient.get(`/admin/regional/budget${params}`)
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch budget')
        }
    }

    // =============================================
    // COMPLIANCE
    // =============================================
    static async getCompliance(): Promise<any> {
        try {
            const response = await apiClient.get('/admin/regional/compliance')
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch compliance data')
        }
    }

    // =============================================
    // BENCHMARKS
    // =============================================
    static async getBenchmarks(): Promise<any> {
        try {
            const response = await apiClient.get('/admin/regional/benchmarks')
            return response.data?.data || response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch benchmarks')
        }
    }
}
