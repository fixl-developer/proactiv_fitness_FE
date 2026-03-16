import apiClient, { ApiResponse } from '@/lib/apiClient'

// Types for Regional Admin Dashboard
export interface RegionalLocation {
    id: string
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
    email: string
    manager: string
    students: number
    revenue: number
    occupancyRate: number
    status: 'ACTIVE' | 'INACTIVE'
    createdAt: string
}

export interface RegionalStaff {
    id: string
    name: string
    email: string
    phone: string
    role: 'COACH' | 'MANAGER' | 'SUPPORT_STAFF'
    location: string
    status: 'ACTIVE' | 'INACTIVE'
    utilization: number
    satisfaction: number
    createdAt: string
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
        monthly: Array<{ month: string; amount: number; target: number }>
        byLocation: Array<{ location: string; amount: number }>
    }
    students: {
        total: number
        growth: Array<{ month: string; count: number; newEnrollments: number; churn: number }>
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
    /**
     * Get regional dashboard overview
     * Backend: GET /admin/regional/dashboard
     */
    static async getDashboardOverview(): Promise<any> {
        try {
            const response = await apiClient.get('/admin/regional/dashboard')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch dashboard overview:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch dashboard overview')
        }
    }

    /**
     * Get all locations in region
     * Backend: GET /admin/regional/locations
     */
    static async getLocations(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        status?: string
    ): Promise<PaginatedResponse<RegionalLocation>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<RegionalLocation>>(
                `/admin/regional/locations?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch locations:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch locations')
        }
    }

    /**
     * Get single location details
     * Backend: GET /admin/regional/locations/:id
     */
    static async getLocation(locationId: string): Promise<RegionalLocation> {
        try {
            const response = await apiClient.get<RegionalLocation>(
                `/admin/regional/locations/${locationId}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch location:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch location')
        }
    }

    /**
     * Update location
     * Backend: PUT /admin/regional/locations/:id
     */
    static async updateLocation(
        locationId: string,
        data: Partial<RegionalLocation>
    ): Promise<RegionalLocation> {
        try {
            const response = await apiClient.put<RegionalLocation>(
                `/admin/regional/locations/${locationId}`,
                data
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to update location:', error)
            throw new Error(error.response?.data?.message || 'Failed to update location')
        }
    }

    /**
     * Get all staff in region
     * Backend: GET /admin/regional/staff
     */
    static async getStaff(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        role?: string,
        status?: string
    ): Promise<PaginatedResponse<RegionalStaff>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (role) params.append('role', role)
            if (status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<RegionalStaff>>(
                `/admin/regional/staff?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch staff:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch staff')
        }
    }

    /**
     * Get single staff member details
     * Backend: GET /admin/regional/staff/:id
     */
    static async getStaffMember(staffId: string): Promise<RegionalStaff> {
        try {
            const response = await apiClient.get<RegionalStaff>(
                `/admin/regional/staff/${staffId}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch staff member:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch staff member')
        }
    }

    /**
     * Get regional analytics
     * Backend: GET /admin/regional/analytics
     */
    static async getAnalytics(timeRange?: string): Promise<RegionalAnalytics> {
        try {
            const params = timeRange ? `?timeRange=${timeRange}` : ''
            const response = await apiClient.get<RegionalAnalytics>(
                `/admin/regional/analytics${params}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch analytics:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch analytics')
        }
    }

    /**
     * Get regional reports
     * Backend: GET /admin/regional/reports
     */
    static async getReports(
        page: number = 1,
        pageSize: number = 10,
        type?: string
    ): Promise<PaginatedResponse<RegionalReport>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (type) params.append('type', type)

            const response = await apiClient.get<PaginatedResponse<RegionalReport>>(
                `/admin/regional/reports?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch reports:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch reports')
        }
    }

    /**
     * Generate new report
     * Backend: POST /admin/regional/reports
     */
    static async generateReport(type: string, dateRange?: string): Promise<RegionalReport> {
        try {
            const response = await apiClient.post<RegionalReport>('/admin/regional/reports', {
                type,
                dateRange
            })
            return response.data
        } catch (error: any) {
            console.error('Failed to generate report:', error)
            throw new Error(error.response?.data?.message || 'Failed to generate report')
        }
    }

    /**
     * Export report
     * Backend: GET /admin/regional/reports/:id/export
     */
    static async exportReport(reportId: string, format: 'pdf' | 'csv' | 'xlsx'): Promise<Blob> {
        try {
            const response = await apiClient.get(
                `/admin/regional/reports/${reportId}/export?format=${format}`,
                { responseType: 'blob' }
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to export report:', error)
            throw new Error(error.response?.data?.message || 'Failed to export report')
        }
    }

    /**
     * Get regional settings
     * Backend: GET /admin/regional/settings
     */
    static async getSettings(): Promise<RegionalSettings> {
        try {
            const response = await apiClient.get<RegionalSettings>('/admin/regional/settings')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch settings:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch settings')
        }
    }

    /**
     * Update regional settings
     * Backend: PUT /admin/regional/settings
     */
    static async updateSettings(settings: Partial<RegionalSettings>): Promise<RegionalSettings> {
        try {
            const response = await apiClient.put<RegionalSettings>(
                '/admin/regional/settings',
                settings
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to update settings:', error)
            throw new Error(error.response?.data?.message || 'Failed to update settings')
        }
    }

    /**
     * Test webhook
     * Backend: POST /admin/regional/settings/test-webhook
     */
    static async testWebhook(webhookUrl: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post<{ success: boolean; message: string }>(
                '/admin/regional/settings/test-webhook',
                { webhookUrl }
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to test webhook:', error)
            throw new Error(error.response?.data?.message || 'Failed to test webhook')
        }
    }

    /**
     * Regenerate API key
     * Backend: POST /admin/regional/settings/regenerate-api-key
     */
    static async regenerateApiKey(): Promise<{ apiKey: string }> {
        try {
            const response = await apiClient.post<{ apiKey: string }>(
                '/admin/regional/settings/regenerate-api-key'
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to regenerate API key:', error)
            throw new Error(error.response?.data?.message || 'Failed to regenerate API key')
        }
    }

    /**
     * Get pending approvals
     * Backend: GET /admin/regional/approvals
     */
    static async getPendingApprovals(
        page: number = 1,
        pageSize: number = 10
    ): Promise<PaginatedResponse<any>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())

            const response = await apiClient.get<PaginatedResponse<any>>(
                `/admin/regional/approvals?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch pending approvals:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch pending approvals')
        }
    }

    /**
     * Approve request
     * Backend: POST /admin/regional/approvals/:id/approve
     */
    static async approveRequest(approvalId: string, notes?: string): Promise<any> {
        try {
            const response = await apiClient.post(
                `/admin/regional/approvals/${approvalId}/approve`,
                { notes }
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to approve request:', error)
            throw new Error(error.response?.data?.message || 'Failed to approve request')
        }
    }

    /**
     * Reject request
     * Backend: POST /admin/regional/approvals/:id/reject
     */
    static async rejectRequest(approvalId: string, reason: string): Promise<any> {
        try {
            const response = await apiClient.post(
                `/admin/regional/approvals/${approvalId}/reject`,
                { reason }
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to reject request:', error)
            throw new Error(error.response?.data?.message || 'Failed to reject request')
        }
    }
}
