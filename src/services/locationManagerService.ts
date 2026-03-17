import apiClient, { ApiResponse } from '@/lib/apiClient'

// Types for Location Manager Dashboard
export interface LocationClass {
    id: string
    name: string
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'
    coach: string
    schedule: string
    capacity: number
    enrolled: number
    status: 'ACTIVE' | 'INACTIVE'
    createdAt: string
}

export interface LocationStaff {
    id: string
    name: string
    email: string
    phone: string
    role: 'COACH' | 'MANAGER' | 'SUPPORT_STAFF'
    status: 'ACTIVE' | 'INACTIVE'
    utilization: number
    satisfaction: number
    createdAt: string
}

export interface Facility {
    id: string
    name: string
    type: string
    capacity: number
    status: 'OPERATIONAL' | 'MAINTENANCE' | 'CLOSED'
    lastMaintenance: string
    nextMaintenance: string
    condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
    issues: number
    createdAt: string
}

export interface LocationAnalytics {
    students: {
        total: number
        growth: Array<{ week: string; attended: number; enrolled: number; noshow: number }>
    }
    classes: {
        performance: Array<{ name: string; students: number; attendance: number; satisfaction: number }>
    }
    peakHours: Array<{ time: string; utilization: number; classes: number }>
}

export interface LocationSettings {
    locationName: string
    locationCode: string
    managerName: string
    managerEmail: string
    managerPhone: string
    businessPhone: string
    address: string
    city: string
    state: string
    zipCode: string
    timezone: string
    currency: string
    operatingHours: string
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

// Location Manager Service
export class LocationManagerService {
    /**
     * Get location dashboard overview
     * Backend: GET /admin/location/dashboard
     */
    static async getDashboardOverview(): Promise<any> {
        try {
            const response = await apiClient.get('/admin/location/dashboard')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch dashboard overview:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch dashboard overview')
        }
    }

    /**
     * Get all classes at location
     * Backend: GET /admin/location/classes
     */
    static async getClasses(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        level?: string,
        status?: string
    ): Promise<PaginatedResponse<LocationClass>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (level) params.append('level', level)
            if (status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<LocationClass>>(
                `/admin/location/classes?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch classes:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch classes')
        }
    }

    /**
     * Get single class details
     * Backend: GET /admin/location/classes/:id
     */
    static async getClass(classId: string): Promise<LocationClass> {
        try {
            const response = await apiClient.get<LocationClass>(
                `/admin/location/classes/${classId}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch class:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch class')
        }
    }

    /**
     * Get all staff at location
     * Backend: GET /admin/location/staff
     */
    static async getStaff(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        role?: string,
        status?: string
    ): Promise<PaginatedResponse<LocationStaff>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (role) params.append('role', role)
            if (status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<LocationStaff>>(
                `/admin/location/staff?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch staff:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch staff')
        }
    }

    /**
     * Get single staff member details
     * Backend: GET /admin/location/staff/:id
     */
    static async getStaffMember(staffId: string): Promise<LocationStaff> {
        try {
            const response = await apiClient.get<LocationStaff>(
                `/admin/location/staff/${staffId}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch staff member:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch staff member')
        }
    }

    /**
     * Get all facilities at location
     * Backend: GET /admin/location/facilities
     */
    static async getFacilities(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        status?: string
    ): Promise<PaginatedResponse<Facility>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (status) params.append('status', status)

            const response = await apiClient.get<PaginatedResponse<Facility>>(
                `/admin/location/facilities?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch facilities:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch facilities')
        }
    }

    /**
     * Get single facility details
     * Backend: GET /admin/location/facilities/:id
     */
    static async getFacility(facilityId: string): Promise<Facility> {
        try {
            const response = await apiClient.get<Facility>(
                `/admin/location/facilities/${facilityId}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch facility:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch facility')
        }
    }

    /**
     * Update facility
     * Backend: PUT /admin/location/facilities/:id
     */
    static async updateFacility(facilityId: string, data: Partial<Facility>): Promise<Facility> {
        try {
            const response = await apiClient.put<Facility>(
                `/admin/location/facilities/${facilityId}`,
                data
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to update facility:', error)
            throw new Error(error.response?.data?.message || 'Failed to update facility')
        }
    }

    /**
     * Get location analytics
     * Backend: GET /admin/location/analytics
     */
    static async getAnalytics(timeRange?: string): Promise<LocationAnalytics> {
        try {
            const params = timeRange ? `?timeRange=${timeRange}` : ''
            const response = await apiClient.get<LocationAnalytics>(
                `/admin/location/analytics${params}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch analytics:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch analytics')
        }
    }

    /**
     * Get location settings
     * Backend: GET /admin/location/settings
     */
    static async getSettings(): Promise<LocationSettings> {
        try {
            const response = await apiClient.get<LocationSettings>('/admin/location/settings')
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch settings:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch settings')
        }
    }

    /**
     * Update location settings
     * Backend: PUT /admin/location/settings
     */
    static async updateSettings(settings: Partial<LocationSettings>): Promise<LocationSettings> {
        try {
            const response = await apiClient.put<LocationSettings>(
                '/admin/location/settings',
                settings
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to update settings:', error)
            throw new Error(error.response?.data?.message || 'Failed to update settings')
        }
    }

    /**
     * Schedule maintenance for facility
     * Backend: POST /admin/location/facilities/:id/schedule-maintenance
     */
    static async scheduleMaintenance(
        facilityId: string,
        maintenanceDate: string,
        notes?: string
    ): Promise<any> {
        try {
            const response = await apiClient.post(
                `/admin/location/facilities/${facilityId}/schedule-maintenance`,
                { maintenanceDate, notes }
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to schedule maintenance:', error)
            throw new Error(error.response?.data?.message || 'Failed to schedule maintenance')
        }
    }
}
