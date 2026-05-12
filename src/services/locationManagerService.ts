import apiClient, { ApiResponse } from '@/lib/apiClient'

// Types for Location Manager Dashboard
export interface LocationClass {
    id: string
    name: string
    level: string
    coach: string
    schedule: string
    capacity: number
    enrolled: number
    students?: number
    room?: string
    status: string
    createdAt: string
}

export interface LocationStaff {
    id: string
    name: string
    email: string
    phone: string
    role: string
    status: string
    utilization: number
    satisfaction: number
    createdAt: string
}

export interface Facility {
    id: string
    name: string
    type: string
    capacity: number
    status: string
    lastMaintenance: string
    nextMaintenance: string
    condition: string
    issues: number
    createdAt: string
}

export interface WaitlistEntry {
    id: string
    studentName: string
    parentName: string
    parentEmail: string
    parentPhone: string
    className: string
    classTime: string
    position: number
    joinedDate: string
    status: string
    priority: string
    notes: string
}

export interface EmergencyContact {
    id: string
    studentName: string
    parentName: string
    contactName: string
    relationship: string
    primaryPhone: string
    alternatePhone: string | null
    email: string
    address: string
    isAuthorizedPickup: boolean
    medicalInfo: string
    lastUpdated: string
    status: string
}

export interface AttendanceRecord {
    id: string
    studentName: string
    className: string
    date: string
    checkInTime: string
    checkOutTime: string | null
    status: string
}

export interface AttendanceData {
    summary: {
        totalEnrolled: number
        presentToday: number
        absentToday: number
        avgAttendance: number
    }
    weeklyTrend: Array<{ week: string; attended: number; enrolled: number; rate: number }>
    classAttendance: Array<{ name: string; enrolled: number; attended: number; rate: number; trend: string }>
    records: AttendanceRecord[]
}

export interface LocationAnalytics {
    totalStudents?: number
    avgAttendance?: number
    classesPerWeek?: number
    satisfaction?: number
    attendanceData?: Array<{ week: string; attended: number; enrolled: number; noshow: number }>
    classPerformance?: Array<{ name: string; students: number; attendance: number; satisfaction: number }>
    peakHours?: Array<{ time: string; utilization: number; classes: number }>
    revenueData?: Array<{ week: string; revenue: number }>
    students?: {
        total: number
        growth: Array<{ week: string; attended: number; enrolled: number; noshow: number }>
    }
    classes?: {
        performance: Array<{ name: string; students: number; attendance: number; satisfaction: number }>
    }
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
            const response: any = await apiClient.get('/admin/location/dashboard')
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

            const response: any = await apiClient.get(
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
            const response: any = await apiClient.get(
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

            const response: any = await apiClient.get(
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
            const response: any = await apiClient.get(
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

            const response: any = await apiClient.get(
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
            const response: any = await apiClient.get(
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
            const response: any = await apiClient.put(
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
            const response: any = await apiClient.get(
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
            const response: any = await apiClient.get('/admin/location/settings')
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
            const response: any = await apiClient.put(
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
            const response: any = await apiClient.post(
                `/admin/location/facilities/${facilityId}/schedule-maintenance`,
                { maintenanceDate, notes }
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to schedule maintenance:', error)
            throw new Error(error.response?.data?.message || 'Failed to schedule maintenance')
        }
    }

    // ==================== CLASS CRUD ====================

    static async createClass(data: Partial<LocationClass>): Promise<LocationClass> {
        try {
            const response: any = await apiClient.post('/admin/location/classes', data)
            return response.data
        } catch (error: any) {
            console.error('Failed to create class:', error)
            throw new Error(error.response?.data?.message || 'Failed to create class')
        }
    }

    static async updateClass(classId: string, data: Partial<LocationClass>): Promise<LocationClass> {
        try {
            const response: any = await apiClient.put(`/admin/location/classes/${classId}`, data)
            return response.data
        } catch (error: any) {
            console.error('Failed to update class:', error)
            throw new Error(error.response?.data?.message || 'Failed to update class')
        }
    }

    static async deleteClass(classId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/location/classes/${classId}`)
        } catch (error: any) {
            console.error('Failed to delete class:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete class')
        }
    }

    // ==================== STAFF CRUD ====================

    static async createStaff(data: any): Promise<LocationStaff> {
        try {
            const response: any = await apiClient.post('/admin/location/staff', data)
            return response.data
        } catch (error: any) {
            console.error('Failed to create staff:', error)
            throw new Error(error.response?.data?.message || 'Failed to create staff')
        }
    }

    static async updateStaff(staffId: string, data: Partial<LocationStaff>): Promise<LocationStaff> {
        try {
            const response: any = await apiClient.put(`/admin/location/staff/${staffId}`, data)
            return response.data
        } catch (error: any) {
            console.error('Failed to update staff:', error)
            throw new Error(error.response?.data?.message || 'Failed to update staff')
        }
    }

    static async deleteStaff(staffId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/location/staff/${staffId}`)
        } catch (error: any) {
            console.error('Failed to delete staff:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete staff')
        }
    }

    // ==================== ATTENDANCE ====================

    static async getAttendance(timeRange?: string, search?: string, classFilter?: string): Promise<any> {
        try {
            const params = new URLSearchParams()
            if (timeRange) params.append('timeRange', timeRange)
            if (search) params.append('search', search)
            if (classFilter && classFilter !== 'all') params.append('class', classFilter)
            const response: any = await apiClient.get(`/admin/location/attendance?${params.toString()}`)
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch attendance:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch attendance')
        }
    }

    static async checkInStudent(data: { studentId: string; sessionId?: string; checkInMethod?: string }): Promise<any> {
        try {
            const response: any = await apiClient.post('/admin/location/attendance/check-in', data)
            return response.data
        } catch (error: any) {
            console.error('Failed to check in student:', error)
            throw new Error(error.response?.data?.message || 'Failed to check in student')
        }
    }

    // ==================== WAITLIST CRUD ====================

    static async getWaitlist(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        status?: string
    ): Promise<PaginatedResponse<WaitlistEntry>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (status && status !== 'all') params.append('status', status)
            const response: any = await apiClient.get(
                `/admin/location/waitlist?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch waitlist:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch waitlist')
        }
    }

    static async addToWaitlist(data: any): Promise<WaitlistEntry> {
        try {
            const response: any = await apiClient.post('/admin/location/waitlist', data)
            return response.data
        } catch (error: any) {
            console.error('Failed to add to waitlist:', error)
            throw new Error(error.response?.data?.message || 'Failed to add to waitlist')
        }
    }

    static async offerWaitlistSpot(entryId: string): Promise<WaitlistEntry> {
        try {
            const response: any = await apiClient.put(`/admin/location/waitlist/${entryId}/offer`)
            return response.data
        } catch (error: any) {
            console.error('Failed to offer spot:', error)
            throw new Error(error.response?.data?.message || 'Failed to offer spot')
        }
    }

    static async removeFromWaitlist(entryId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/location/waitlist/${entryId}`)
        } catch (error: any) {
            console.error('Failed to remove from waitlist:', error)
            throw new Error(error.response?.data?.message || 'Failed to remove from waitlist')
        }
    }

    // ==================== FACILITY CRUD ====================

    static async createFacility(data: Partial<Facility>): Promise<Facility> {
        try {
            const response: any = await apiClient.post('/admin/location/facilities', data)
            return response.data
        } catch (error: any) {
            console.error('Failed to create facility:', error)
            throw new Error(error.response?.data?.message || 'Failed to create facility')
        }
    }

    static async deleteFacility(facilityId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/location/facilities/${facilityId}`)
        } catch (error: any) {
            console.error('Failed to delete facility:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete facility')
        }
    }

    // ==================== EMERGENCY CONTACTS CRUD ====================

    static async getEmergencyContacts(
        page: number = 1,
        pageSize: number = 10,
        search?: string,
        status?: string
    ): Promise<PaginatedResponse<EmergencyContact>> {
        try {
            const params = new URLSearchParams()
            params.append('page', page.toString())
            params.append('pageSize', pageSize.toString())
            if (search) params.append('search', search)
            if (status && status !== 'all') params.append('status', status)
            const response: any = await apiClient.get(
                `/admin/location/emergency-contacts?${params.toString()}`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to fetch emergency contacts:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch emergency contacts')
        }
    }

    static async createEmergencyContact(data: Partial<EmergencyContact>): Promise<EmergencyContact> {
        try {
            const response: any = await apiClient.post('/admin/location/emergency-contacts', data)
            return response.data
        } catch (error: any) {
            console.error('Failed to create emergency contact:', error)
            throw new Error(error.response?.data?.message || 'Failed to create emergency contact')
        }
    }

    static async updateEmergencyContact(contactId: string, data: Partial<EmergencyContact>): Promise<EmergencyContact> {
        try {
            const response: any = await apiClient.put(
                `/admin/location/emergency-contacts/${contactId}`, data
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to update emergency contact:', error)
            throw new Error(error.response?.data?.message || 'Failed to update emergency contact')
        }
    }

    static async verifyEmergencyContact(contactId: string): Promise<EmergencyContact> {
        try {
            const response: any = await apiClient.put(
                `/admin/location/emergency-contacts/${contactId}/verify`
            )
            return response.data
        } catch (error: any) {
            console.error('Failed to verify contact:', error)
            throw new Error(error.response?.data?.message || 'Failed to verify contact')
        }
    }

    static async deleteEmergencyContact(contactId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/location/emergency-contacts/${contactId}`)
        } catch (error: any) {
            console.error('Failed to delete emergency contact:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete emergency contact')
        }
    }

    // ==================== PASSWORD ====================

    static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        try {
            await apiClient.put('/admin/location/password', { currentPassword, newPassword })
        } catch (error: any) {
            console.error('Failed to change password:', error)
            throw new Error(error.response?.data?.message || 'Failed to change password')
        }
    }

    // ==================== BOOKINGS (Phase 1) ====================
    static async getBookings(params: { status?: string; search?: string; page?: number; pageSize?: number } = {}): Promise<any> {
        const query = new URLSearchParams()
        if (params.status) query.set('status', params.status)
        if (params.search) query.set('search', params.search)
        query.set('page', String(params.page || 1))
        query.set('pageSize', String(params.pageSize || 20))
        const res: any = await apiClient.get(`/admin/location/bookings?${query.toString()}`)
        return res?.data || res
    }
    static async createBooking(payload: any): Promise<any> {
        const res: any = await apiClient.post('/admin/location/bookings', payload)
        return res?.data || res
    }
    static async updateBooking(id: string, payload: any): Promise<any> {
        const res: any = await apiClient.put(`/admin/location/bookings/${id}`, payload)
        return res?.data || res
    }
    static async cancelBooking(id: string): Promise<any> {
        const res: any = await apiClient.delete(`/admin/location/bookings/${id}`)
        return res?.data || res
    }

    // ==================== PAYMENTS (Phase 1) ====================
    static async getPayments(params: { status?: string; search?: string; page?: number; pageSize?: number } = {}): Promise<any> {
        const query = new URLSearchParams()
        if (params.status) query.set('status', params.status)
        if (params.search) query.set('search', params.search)
        query.set('page', String(params.page || 1))
        query.set('pageSize', String(params.pageSize || 20))
        const res: any = await apiClient.get(`/admin/location/payments?${query.toString()}`)
        return res?.data || res
    }
    static async recordPayment(bookingId: string, payload: { amount: number; method: string; notes?: string }): Promise<any> {
        const res: any = await apiClient.post(`/admin/location/payments/${bookingId}/record`, payload)
        return res?.data || res
    }

    // ==================== INQUIRIES (Phase 2) ====================
    static async getInquiries(params: { status?: string; search?: string; page?: number; pageSize?: number } = {}): Promise<any> {
        const query = new URLSearchParams()
        if (params.status) query.set('status', params.status)
        if (params.search) query.set('search', params.search)
        query.set('page', String(params.page || 1))
        query.set('pageSize', String(params.pageSize || 20))
        const res: any = await apiClient.get(`/admin/location/inquiries?${query.toString()}`)
        return res?.data || res
    }
    static async createInquiry(payload: any): Promise<any> {
        const res: any = await apiClient.post('/admin/location/inquiries', payload)
        return res?.data || res
    }
    static async respondToInquiry(id: string, payload: { message: string; isInternal?: boolean }): Promise<any> {
        const res: any = await apiClient.post(`/admin/location/inquiries/${id}/respond`, payload)
        return res?.data || res
    }
    static async updateInquiry(id: string, payload: any): Promise<any> {
        const res: any = await apiClient.put(`/admin/location/inquiries/${id}`, payload)
        return res?.data || res
    }

    // ==================== REPORTS (Phase 2) ====================
    static async getReport(params: { type?: string; dateRange?: string } = {}): Promise<any> {
        const query = new URLSearchParams()
        if (params.type) query.set('type', params.type)
        if (params.dateRange) query.set('dateRange', params.dateRange)
        const res: any = await apiClient.get(`/admin/location/reports?${query.toString()}`)
        return res?.data || res
    }
    static async exportReportCsv(dateRange = '30d'): Promise<Blob> {
        const res: any = await apiClient.get(`/admin/location/reports/export?dateRange=${dateRange}&format=csv`, { responseType: 'blob' as any })
        return res?.data || res
    }
}
