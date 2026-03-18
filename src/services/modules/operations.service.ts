import apiClient from '../api/client'

interface Staff {
    id: string
    userId: string
    firstName: string
    lastName: string
    email: string
    phone: string
    role: 'coach' | 'manager' | 'support'
    locationId: string
    specializations: string[]
    certifications: string[]
    hireDate: string
    status: 'active' | 'inactive' | 'on-leave'
}

interface Attendance {
    id: string
    studentId: string
    classId: string
    date: string
    status: 'present' | 'absent' | 'late' | 'excused'
    checkInTime?: string
    checkOutTime?: string
    notes?: string
}

interface Booking {
    id: string
    studentId: string
    programId: string
    scheduleId: string
    bookingDate: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    paymentStatus: 'pending' | 'paid' | 'refunded'
    amount: number
}

class OperationsService {
    // ==================== STAFF MANAGEMENT ====================

    /**
     * Get all staff
     */
    async getAllStaff(filters?: any): Promise<{ staff: Staff[], total: number }> {
        try {
            const response = await apiClient.get('/admin/operations/staff', { params: filters })
            return response.data
        } catch (error) {
            console.error('Error fetching staff:', error)
            throw error
        }
    }

    /**
     * Get staff by ID
     */
    async getStaffById(staffId: string): Promise<Staff> {
        try {
            const response = await apiClient.get(`/admin/operations/staff/${staffId}`)
            return response.data
        } catch (error) {
            console.error('Error fetching staff:', error)
            throw error
        }
    }

    /**
     * Create staff
     */
    async createStaff(staffData: Omit<Staff, 'id'>): Promise<Staff> {
        try {
            const response = await apiClient.post('/admin/operations/staff', staffData)
            return response.data
        } catch (error) {
            console.error('Error creating staff:', error)
            throw error
        }
    }

    /**
     * Update staff
     */
    async updateStaff(staffId: string, staffData: Partial<Staff>): Promise<Staff> {
        try {
            const response = await apiClient.put(`/admin/operations/staff/${staffId}`, staffData)
            return response.data
        } catch (error) {
            console.error('Error updating staff:', error)
            throw error
        }
    }

    /**
     * Delete staff
     */
    async deleteStaff(staffId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/operations/staff/${staffId}`)
        } catch (error) {
            console.error('Error deleting staff:', error)
            throw error
        }
    }

    /**
     * Get staff utilization
     */
    async getStaffUtilization(staffId?: string, period?: string): Promise<any> {
        try {
            const response = await apiClient.get('/admin/operations/staff/utilization', {
                params: { staffId, period }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching staff utilization:', error)
            throw error
        }
    }

    /**
     * Get staff performance
     */
    async getStaffPerformance(staffId: string, period?: string): Promise<any> {
        try {
            const response = await apiClient.get(`/admin/operations/staff/${staffId}/performance`, {
                params: { period }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching staff performance:', error)
            throw error
        }
    }

    // ==================== ATTENDANCE ====================

    /**
     * Get attendance records
     */
    async getAttendance(filters?: any): Promise<{ attendance: Attendance[], total: number }> {
        try {
            const response = await apiClient.get('/admin/operations/attendance', { params: filters })
            return response.data
        } catch (error) {
            console.error('Error fetching attendance:', error)
            throw error
        }
    }

    /**
     * Mark attendance
     */
    async markAttendance(attendanceData: Omit<Attendance, 'id'>): Promise<Attendance> {
        try {
            const response = await apiClient.post('/admin/operations/attendance', attendanceData)
            return response.data
        } catch (error) {
            console.error('Error marking attendance:', error)
            throw error
        }
    }

    /**
     * Update attendance
     */
    async updateAttendance(attendanceId: string, attendanceData: Partial<Attendance>): Promise<Attendance> {
        try {
            const response = await apiClient.put(`/admin/operations/attendance/${attendanceId}`, attendanceData)
            return response.data
        } catch (error) {
            console.error('Error updating attendance:', error)
            throw error
        }
    }

    /**
     * Get attendance statistics
     */
    async getAttendanceStatistics(filters?: any): Promise<any> {
        try {
            const response = await apiClient.get('/admin/operations/attendance/statistics', { params: filters })
            return response.data
        } catch (error) {
            console.error('Error fetching attendance statistics:', error)
            throw error
        }
    }

    /**
     * Bulk mark attendance
     */
    async bulkMarkAttendance(attendanceList: Omit<Attendance, 'id'>[]): Promise<Attendance[]> {
        try {
            const response = await apiClient.post('/admin/operations/attendance/bulk', { attendanceList })
            return response.data
        } catch (error) {
            console.error('Error bulk marking attendance:', error)
            throw error
        }
    }

    // ==================== BOOKINGS ====================

    /**
     * Get all bookings
     */
    async getAllBookings(filters?: any): Promise<{ bookings: Booking[], total: number }> {
        try {
            const response = await apiClient.get('/admin/operations/bookings', { params: filters })
            return response.data
        } catch (error) {
            console.error('Error fetching bookings:', error)
            throw error
        }
    }

    /**
     * Get booking by ID
     */
    async getBookingById(bookingId: string): Promise<Booking> {
        try {
            const response = await apiClient.get(`/admin/operations/bookings/${bookingId}`)
            return response.data
        } catch (error) {
            console.error('Error fetching booking:', error)
            throw error
        }
    }

    /**
     * Create booking
     */
    async createBooking(bookingData: Omit<Booking, 'id'>): Promise<Booking> {
        try {
            const response = await apiClient.post('/admin/operations/bookings', bookingData)
            return response.data
        } catch (error) {
            console.error('Error creating booking:', error)
            throw error
        }
    }

    /**
     * Update booking
     */
    async updateBooking(bookingId: string, bookingData: Partial<Booking>): Promise<Booking> {
        try {
            const response = await apiClient.put(`/admin/operations/bookings/${bookingId}`, bookingData)
            return response.data
        } catch (error) {
            console.error('Error updating booking:', error)
            throw error
        }
    }

    /**
     * Cancel booking
     */
    async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
        try {
            const response = await apiClient.post(`/admin/operations/bookings/${bookingId}/cancel`, { reason })
            return response.data
        } catch (error) {
            console.error('Error cancelling booking:', error)
            throw error
        }
    }

    /**
     * Confirm booking
     */
    async confirmBooking(bookingId: string): Promise<Booking> {
        try {
            const response = await apiClient.post(`/admin/operations/bookings/${bookingId}/confirm`)
            return response.data
        } catch (error) {
            console.error('Error confirming booking:', error)
            throw error
        }
    }

    /**
     * Get booking statistics
     */
    async getBookingStatistics(period?: string): Promise<any> {
        try {
            const response = await apiClient.get('/admin/operations/bookings/statistics', { params: { period } })
            return response.data
        } catch (error) {
            console.error('Error fetching booking statistics:', error)
            throw error
        }
    }
}

export default new OperationsService()
