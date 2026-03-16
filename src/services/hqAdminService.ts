import apiClient, { ApiResponse } from '@/lib/apiClient'

// Types for HQ Admin Dashboard
export interface SystemUser {
    id: string
    name: string
    email: string
    phone?: string
    role: string
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    lastLogin?: string
    createdAt: string
    updatedAt?: string
}

export interface Location {
    id: string
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
    email: string
    manager: string
    status: 'ACTIVE' | 'INACTIVE'
    capacity: number
    currentEnrollment: number
    revenue: number
    createdAt: string
}

export interface Franchise {
    id: string
    name: string
    owner: string
    email: string
    phone: string
    locations: number
    revenue: number
    status: 'ACTIVE' | 'INACTIVE'
    joinDate: string
    createdAt: string
}

export interface AnalyticsData {
    revenue: {
        total: number
        monthly: Array<{ month: string; amount: number }>
        byLocation: Array<{ location: string; amount: number }>
    }
    users: {
        total: number
        growth: Array<{ month: string; count: number }>
        byRole: Array<{ role: string; count: number }>
    }
    programs: {
        total: number
        distribution: Array<{ program: string; count: number }>
        enrollment: Array<{ program: string; enrolled: number; capacity: number }>
    }
    locations: {
        total: number
        active: number
        performance: Array<{ location: string; revenue: number; enrollment: number }>
    }
}

export interface SystemSettings {
    general: {
        platformName: string
        supportEmail: string
        supportPhone: string
        timezone: string
    }
    email: {
        smtpServer: string
        smtpPort: number
        senderEmail: string
        senderName: string
    }
    security: {
        passwordMinLength: number
        passwordRequireSpecialChar: boolean
        sessionTimeout: number
        twoFactorEnabled: boolean
    }
}

export interface AuditLog {
    id: string
    timestamp: string
    user: string
    action: string
    resource: string
    resourceId: string
    status: 'SUCCESS' | 'FAILED'
    ipAddress: string
    details?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// HQ Admin Service
export class HQAdminService {
    /**
     * Get all system users
     * Backend: GET /admin/hq/users
     */
    static async getUsers(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        role?: string,
        status?: string
    ): Promise<PaginatedResponse<SystemUser>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (role) params.append('role', role)
            if (status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<SystemUser>>(
                `/admin/hq/users?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch users:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch users')
        }
    }

    /**
     * Get single user details
     * Backend: GET /admin/hq/users/:id
     */
    static async getUser(userId: string): Promise<SystemUser> {
        try {
            const response = await apiClient.get<SystemUser>(`/admin/hq/users/${userId}`)
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch user:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch user')
        }
    }

    /**
     * Create new system user
     * Backend: POST /admin/hq/users
     */
    static async createUser(userData: Partial<SystemUser>): Promise<SystemUser> {
        try {
            const response = await apiClient.post<SystemUser>('/admin/hq/users', userData)
            return response.data
        } catch (error: any) {
            console.error('Failed to create user:', error)
            throw new Error(error.response?.data?.message || 'Failed to create user')
        }
    }

    /**
     * Update system user
     * Backend: PUT /admin/hq/users/:id
     */
    static async updateUser(userId: string, userData: Partial<SystemUser>): Promise<SystemUser> {
        try {
            const response = await apiClient.put<SystemUser>(`/admin/hq/users/${userId}`, userData)
            return response.data
        } catch (error: any) {
            console.error('Failed to update user:', error)
            throw new Error(error.response?.data?.message || 'Failed to update user')
        }
    }

    /**
     * Delete system user
     * Backend: DELETE /admin/hq/users/:id
     */
    static async deleteUser(userId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/hq/users/${userId}`)
        } catch (error: any) {
            console.error('Failed to delete user:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete user')
        }
    }

    /**
     * Get all locations
     * Backend: GET /admin/hq/locations
     */
    static async getLocations(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        status?: string
    ): Promise<PaginatedResponse<Location>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<Location>>(
                `/admin/hq/locations?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch locations:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch locations')
        }
    }

    /**
     * Get single location details
     * Backend: GET /admin/hq/locations/:id
     */
    static async getLocation(locationId: string): Promise<Location> {
        try {
            const response = await apiClient.get<Location>(`/admin/hq/locations/${locationId}`)
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch location:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch location')
        }
    }

    /**
     * Get all franchises
     * Backend: GET /admin/hq/franchises
     */
    static async getFranchises(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        status?: string
    ): Promise<PaginatedResponse<Franchise>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<Franchise>>(
                `/admin/hq/franchises?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch franchises:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch franchises')
        }
    }

    /**
     * Get single franchise details
     * Backend: GET /admin/hq/franchises/:id
     */
    static async getFranchise(franchiseId: string): Promise<Franchise> {
        try {
            const response = await apiClient.get<Franchise>(`/admin/hq/franchises/${franchiseId}`)
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch franchise:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch franchise')
        }
    }

    /**
     * Get analytics data
     * Backend: GET /admin/hq/analytics
     */
    static async getAnalytics(): Promise<AnalyticsData> {
        try {
            const response = await apiClient.get<AnalyticsData>('/admin/hq/analytics')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch analytics:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch analytics')
        }
    }

    /**
     * Get system settings
     * Backend: GET /admin/hq/settings
     */
    static async getSettings(): Promise<SystemSettings> {
        try {
            const response = await apiClient.get<SystemSettings>('/admin/hq/settings')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch settings:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch settings')
        }
    }

    /**
     * Update system settings
     * Backend: PUT /admin/hq/settings
     */
    static async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
        try {
            const response = await apiClient.put<SystemSettings>('/admin/hq/settings', settings)
            return response.data
        } catch (error: any) {
            console.error('Failed to update settings:', error)
            throw new Error(error.response?.data?.message || 'Failed to update settings')
        }
    }

    /**
     * Get audit logs
     * Backend: GET /admin/hq/audit-logs
     */
    static async getAuditLogs(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        action?: string,
        status?: string,
        startDate?: string,
        endDate?: string
    ): Promise<PaginatedResponse<AuditLog>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (action) params.append('action', action)
            if (status) params.append('status', status)
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)

            const response = await apiClient.get<PaginatedResponse<AuditLog>>(
                `/admin/hq/audit-logs?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch audit logs:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch audit logs')
        }
    }

    /**
     * Get dashboard overview
     * Backend: GET /admin/hq/dashboard
     */
    static async getDashboardOverview(): Promise<any> {
        try {
            const response = await apiClient.get('/admin/hq/dashboard')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch dashboard overview:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch dashboard overview')
        }
    }

    /**
     * Get API keys
     */
    static async getAPIKeys(): Promise<any[]> {
        try {
            const response = await apiClient.get<any[]>('/admin/hq/api-keys')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch API keys:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch API keys')
        }
    }

    /**
     * Create API key
     */
    static async createAPIKey(data: { name: string; permissions?: string[] } | string): Promise<any> {
        try {
            const response = await apiClient.post<any>('/admin/hq/api-keys', data)
            return response.data
        } catch (error: any) {
            console.error('Failed to create API key:', error)
            throw new Error(error.response?.data?.message || 'Failed to create API key')
        }
    }

    /**
     * Delete API key
     */
    static async deleteAPIKey(keyId: string | number): Promise<void> {
        try {
            await apiClient.delete(`/admin/hq/api-keys/${keyId}`)
        } catch (error: any) {
            console.error('Failed to delete API key:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete API key')
        }
    }

    /**
     * Get system health
     */
    static async getSystemHealth(): Promise<any> {
        try {
            const response = await apiClient.get<any>('/admin/hq/health')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch system health:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch system health')
        }
    }

    /**
     * Get notifications
     */
    static async getNotifications(): Promise<any[]> {
        try {
            const response = await apiClient.get<any[]>('/admin/hq/notifications')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch notifications:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch notifications')
        }
    }

    /**
     * Update notification settings
     */
    static async updateNotificationSettings(settings: any): Promise<any> {
        try {
            const response = await apiClient.put<any>('/admin/hq/notifications/settings', settings)
            return response.data
        } catch (error: any) {
            console.error('Failed to update notification settings:', error)
            throw new Error(error.response?.data?.message || 'Failed to update notification settings')
        }
    }

    /**
     * Get reports
     */
    static async getReports(params?: any): Promise<any[]> {
        try {
            const response = await apiClient.get<any[]>('/admin/hq/reports', { params })
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch reports:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch reports')
        }
    }
}
