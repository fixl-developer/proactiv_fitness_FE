import apiClient, { ApiResponse } from '@/lib/apiClient'

// Types for Franchise Owner Dashboard
export interface FranchiseLocation {
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

export interface FranchiseStaff {
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

export interface RevenueData {
    total: number
    monthly: Array<{ month: string; revenue: number; target: number; expenses: number }>
    byProgram: Array<{ program: string; amount: number; percentage: number }>
    byPaymentMethod: Array<{ method: string; amount: number; percentage: number }>
    profitMargin: number
    netProfit: number
}

export interface FranchiseAnalytics {
    students: {
        total: number
        growth: Array<{ month: string; count: number; newEnrollments: number; churn: number }>
        byProgram: Array<{ program: string; count: number }>
    }
    classes: {
        total: number
        utilization: Array<{ name: string; utilization: number; capacity: number; enrolled: number }>
        performance: Array<{ program: string; students: number; revenue: number; satisfaction: number }>
    }
    enrollment: {
        funnel: Array<{ stage: string; count: number; percentage: number }>
    }
}

export interface FranchiseSettings {
    franchiseName: string
    franchiseCode: string
    ownerName: string
    ownerEmail: string
    ownerPhone: string
    businessPhone: string
    address: string
    city: string
    state: string
    zipCode: string
    timezone: string
    currency: string
    notificationsEmail: boolean
    notificationsSMS: boolean
    notificationsPush: boolean
    maintenanceMode: boolean
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// Franchise Owner Service
export class FranchiseOwnerService {
    /**
     * Get franchise dashboard overview
     * Backend: GET /admin/franchise/dashboard
     */
    static async getDashboardOverview(): Promise<any> {
        try {
            const response = await apiClient.get('/admin/franchise/dashboard')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch dashboard overview:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch dashboard overview')
        }
    }

    /**
     * Get all locations in franchise
     * Backend: GET /admin/franchise/locations
     */
    static async getLocations(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        status?: string
    ): Promise<PaginatedResponse<FranchiseLocation>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<FranchiseLocation>>(
                `/admin/franchise/locations?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch locations:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch locations')
        }
    }

    /**
     * Get single location details
     * Backend: GET /admin/franchise/locations/:id
     */
    static async getLocation(locationId: string): Promise<FranchiseLocation> {
        try {
            const response = await apiClient.get<FranchiseLocation>(
                `/admin/franchise/locations/${locationId}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch location:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch location')
        }
    }

    /**
     * Get all staff in franchise
     * Backend: GET /admin/franchise/staff
     */
    static async getStaff(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        role?: string,
        status?: string
    ): Promise<PaginatedResponse<FranchiseStaff>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (role) params.append('role', role)
            if (status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<FranchiseStaff>>(
                `/admin/franchise/staff?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch staff:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch staff')
        }
    }

    /**
     * Get single staff member details
     * Backend: GET /admin/franchise/staff/:id
     */
    static async getStaffMember(staffId: string): Promise<FranchiseStaff> {
        try {
            const response = await apiClient.get<FranchiseStaff>(
                `/admin/franchise/staff/${staffId}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch staff member:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch staff member')
        }
    }

    /**
     * Get revenue data
     * Backend: GET /admin/franchise/revenue
     */
    static async getRevenue(timeRange?: string): Promise<any> {
        try {
            const params = timeRange ? `?timeRange=${timeRange}` : ''
            const response = await apiClient.get(
                `/admin/franchise/revenue${params}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch revenue data:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch revenue data')
        }
    }

    /**
     * Get franchise analytics
     * Backend: GET /admin/franchise/analytics
     */
    static async getAnalytics(timeRange?: string): Promise<any> {
        try {
            const params = timeRange ? `?timeRange=${timeRange}` : ''
            const response = await apiClient.get(
                `/admin/franchise/analytics${params}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch analytics:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch analytics')
        }
    }

    /**
     * Get franchise settings
     * Backend: GET /admin/franchise/settings
     */
    static async getSettings(): Promise<FranchiseSettings> {
        try {
            const response = await apiClient.get<FranchiseSettings>('/admin/franchise/settings')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch settings:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch settings')
        }
    }

    /**
     * Update franchise settings
     * Backend: PUT /admin/franchise/settings
     */
    static async updateSettings(settings: Partial<FranchiseSettings>): Promise<FranchiseSettings> {
        try {
            const response = await apiClient.put<FranchiseSettings>(
                '/admin/franchise/settings',
                settings
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to update settings:', error)
            throw new Error(error.response?.data?.message || 'Failed to update settings')
        }
    }

    /**
     * Export revenue report
     * Backend: GET /admin/franchise/revenue/export
     */
    static async exportRevenueReport(format: 'pdf' | 'csv' | 'xlsx'): Promise<Blob> {
        try {
            const response = await apiClient.get(
                `/admin/franchise/revenue/export?format=${format}`,
                { responseType: 'blob' }
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to export revenue report:', error)
            throw new Error(error.response?.data?.message || 'Failed to export revenue report')
        }
    }

    /**
     * Get inventory items
     * Backend: GET /admin/franchise/inventory
     */
    static async getInventory(
    page: number = 1,
    pageSize: number = 10,
    search ?: string,
    category ?: string,
    status ?: string
): Promise < PaginatedResponse < any >> {
    try {
        const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if(search) params.append('search', search)
            if(category) params.append('category', category)
            if(status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<any>>(
            `/admin/franchise/inventory?${params.toString()}`
        )
            return response.data
    } catch(error: any) {
        console.error('Failed to fetch inventory:', error)
        throw new Error(error.response?.data?.message || 'Failed to fetch inventory')
    }
}

    /**
     * Get marketing campaigns
     * Backend: GET /admin/franchise/marketing/campaigns
     */
    static async getCampaigns(
    page: number = 1,
    pageSize: number = 10,
    status ?: string
): Promise < PaginatedResponse < any >> {
    try {
        const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if(status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<any>>(
            `/admin/franchise/marketing/campaigns?${params.toString()}`
        )
            return response.data
    } catch(error: any) {
        console.error('Failed to fetch campaigns:', error)
        throw new Error(error.response?.data?.message || 'Failed to fetch campaigns')
    }
}

    /**
     * Create new campaign
     * Backend: POST /admin/franchise/marketing/campaigns
     */
    static async createCampaign(campaignData: any): Promise < any > {
    try {
        const response = await apiClient.post(
            '/admin/franchise/marketing/campaigns',
            campaignData
        )
            return response.data
    } catch(error: any) {
        console.error('Failed to create campaign:', error)
        throw new Error(error.response?.data?.message || 'Failed to create campaign')
    }
}

    /**
     * Get customer feedback
     * Backend: GET /admin/franchise/feedback
     */
    static async getFeedback(
    page: number = 1,
    pageSize: number = 10,
    rating ?: string,
    status ?: string
): Promise < PaginatedResponse < any >> {
    try {
        const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if(rating) params.append('rating', rating)
            if(status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<any>>(
            `/admin/franchise/feedback?${params.toString()}`
        )
            return response.data
    } catch(error: any) {
        console.error('Failed to fetch feedback:', error)
        throw new Error(error.response?.data?.message || 'Failed to fetch feedback')
    }
}

    /**
     * Publish feedback
     * Backend: POST /admin/franchise/feedback/:id/publish
     */
    static async publishFeedback(feedbackId: string): Promise < any > {
    try {
        const response = await apiClient.post(
            `/admin/franchise/feedback/${feedbackId}/publish`
        )
            return response.data
    } catch(error: any) {
        console.error('Failed to publish feedback:', error)
        throw new Error(error.response?.data?.message || 'Failed to publish feedback')
    }
}

    /**
     * Get financial reports
     * Backend: GET /admin/franchise/financial-reports
     */
    static async getFinancialReports(timeRange ?: string): Promise < any > {
    try {
        const params = timeRange ? `?timeRange=${timeRange}` : ''
            const response = await apiClient.get(
            `/admin/franchise/financial-reports${params}`
        )
            return response.data
    } catch(error: any) {
        console.error('Failed to fetch financial reports:', error)
        throw new Error(error.response?.data?.message || 'Failed to fetch financial reports')
    }
}

    /**
     * Export financial report
     * Backend: GET /admin/franchise/financial-reports/export
     */
    static async exportFinancialReport(format: 'pdf' | 'csv' | 'xlsx'): Promise < Blob > {
    try {
        const response = await apiClient.get(
            `/admin/franchise/financial-reports/export?format=${format}`,
            { responseType: 'blob' }
        )
            return response.data
    } catch(error: any) {
        console.error('Failed to export financial report:', error)
        throw new Error(error.response?.data?.message || 'Failed to export financial report')
    }
}

    // =============================================
    // CRUD Operations
    // =============================================

    /** Create a new location */
    static async createLocation(data: any): Promise<any> {
        try {
            const response = await apiClient.post('/admin/franchise/locations', data)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create location')
        }
    }

    /** Update a location */
    static async updateLocation(locationId: string, data: any): Promise<any> {
        try {
            const response = await apiClient.put(`/admin/franchise/locations/${locationId}`, data)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update location')
        }
    }

    /** Delete a location */
    static async deleteLocation(locationId: string): Promise<any> {
        try {
            const response = await apiClient.delete(`/admin/franchise/locations/${locationId}`)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete location')
        }
    }

    /** Create staff member */
    static async createStaff(data: any): Promise<any> {
        try {
            const response = await apiClient.post('/admin/franchise/staff', data)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create staff member')
        }
    }

    /** Update staff member */
    static async updateStaff(staffId: string, data: any): Promise<any> {
        try {
            const response = await apiClient.put(`/admin/franchise/staff/${staffId}`, data)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update staff member')
        }
    }

    /** Delete staff member */
    static async deleteStaff(staffId: string): Promise<any> {
        try {
            const response = await apiClient.delete(`/admin/franchise/staff/${staffId}`)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete staff member')
        }
    }

    /** Create inventory item */
    static async createInventoryItem(data: any): Promise<any> {
        try {
            const response = await apiClient.post('/admin/franchise/inventory', data)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create inventory item')
        }
    }

    /** Update inventory item */
    static async updateInventoryItem(itemId: string, data: any): Promise<any> {
        try {
            const response = await apiClient.put(`/admin/franchise/inventory/${itemId}`, data)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update inventory item')
        }
    }

    /** Delete inventory item */
    static async deleteInventoryItem(itemId: string): Promise<any> {
        try {
            const response = await apiClient.delete(`/admin/franchise/inventory/${itemId}`)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete inventory item')
        }
    }

    /** Update campaign */
    static async updateCampaign(campaignId: string, data: any): Promise<any> {
        try {
            const response = await apiClient.put(`/admin/franchise/marketing/campaigns/${campaignId}`, data)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update campaign')
        }
    }

    /** Delete campaign */
    static async deleteCampaign(campaignId: string): Promise<any> {
        try {
            const response = await apiClient.delete(`/admin/franchise/marketing/campaigns/${campaignId}`)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete campaign')
        }
    }

    /** Reply to feedback */
    static async replyToFeedback(feedbackId: string, reply: string): Promise<any> {
        try {
            const response = await apiClient.post(`/admin/franchise/feedback/${feedbackId}/reply`, { reply })
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to reply to feedback')
        }
    }

    /** Delete feedback */
    static async deleteFeedback(feedbackId: string): Promise<any> {
        try {
            const response = await apiClient.delete(`/admin/franchise/feedback/${feedbackId}`)
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete feedback')
        }
    }

    /** Change password */
    static async changePassword(currentPassword: string, newPassword: string): Promise<any> {
        try {
            const response = await apiClient.post('/admin/franchise/change-password', { currentPassword, newPassword })
            return response.data
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to change password')
        }
    }
}
