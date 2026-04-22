/**
 * Operations Service
 * Handles all operations-related API calls for admin dashboard
 */

import { apiClient } from '@/services/api/client'

// =============================================
// INTERFACES
// =============================================

export interface StaffMember {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    role: string
    locationId?: string
    status: 'active' | 'inactive'
    hireDate?: string
    certifications?: string[]
    createdAt?: string
    updatedAt?: string
}

export interface AttendanceRecord {
    id: string
    studentId: string
    classId: string
    date: string
    status: 'present' | 'absent' | 'late'
    notes?: string
    checkInTime?: string
    createdAt?: string
    updatedAt?: string
}

export interface Booking {
    id: string
    customerId: string
    programId: string
    sessionId: string
    date: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    paymentStatus: 'pending' | 'paid' | 'refunded'
    notes?: string
    createdAt?: string
    updatedAt?: string
}

// =============================================
// STAFF SERVICE
// =============================================

export const StaffService = {
    // Get all staff
    getAll: async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string; locationId?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/staff', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching staff:', error)
            throw error
        }
    },

    // Get staff by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/staff/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching staff member:', error)
            throw error
        }
    },

    // Create staff
    create: async (data: Partial<StaffMember>) => {
        try {
            const response = await apiClient.post('/api/v1/staff', data)
            return response.data
        } catch (error) {
            console.error('Error creating staff member:', error)
            throw error
        }
    },

    // Update staff
    update: async (id: string, data: Partial<StaffMember>) => {
        try {
            const response = await apiClient.put(`/api/v1/staff/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating staff member:', error)
            throw error
        }
    },

    // Delete staff
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/staff/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting staff member:', error)
            throw error
        }
    },

    // Get staff statistics
    getStatistics: async () => {
        try {
            const response = await apiClient.get('/api/v1/staff/statistics')
            return response.data
        } catch (error) {
            console.error('Error fetching staff statistics:', error)
            throw error
        }
    },
}

// =============================================
// ATTENDANCE SERVICE
// =============================================

export const AttendanceService = {
    // Get all attendance records
    getAll: async (params?: { page?: number; limit?: number; search?: string; date?: string; status?: string; classId?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/attendance', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching attendance records:', error)
            throw error
        }
    },

    // Get attendance by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/attendance/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching attendance record:', error)
            throw error
        }
    },

    // Create attendance record
    create: async (data: Partial<AttendanceRecord>) => {
        try {
            const response = await apiClient.post('/api/v1/attendance', data)
            return response.data
        } catch (error) {
            console.error('Error creating attendance record:', error)
            throw error
        }
    },

    // Update attendance record
    update: async (id: string, data: Partial<AttendanceRecord>) => {
        try {
            const response = await apiClient.put(`/api/v1/attendance/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating attendance record:', error)
            throw error
        }
    },

    // Delete attendance record
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/attendance/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting attendance record:', error)
            throw error
        }
    },

    // Get attendance statistics
    getStatistics: async (params?: { date?: string; classId?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/attendance/statistics', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching attendance statistics:', error)
            throw error
        }
    },
}

// =============================================
// BOOKING SERVICE
// =============================================

export const BookingService = {
    // Get all bookings
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; paymentStatus?: string; date?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/bookings', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching bookings:', error)
            throw error
        }
    },

    // Get booking by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/bookings/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching booking:', error)
            throw error
        }
    },

    // Create booking
    create: async (data: Partial<Booking>) => {
        try {
            const response = await apiClient.post('/api/v1/bookings', data)
            return response.data
        } catch (error) {
            console.error('Error creating booking:', error)
            throw error
        }
    },

    // Update booking
    update: async (id: string, data: Partial<Booking>) => {
        try {
            const response = await apiClient.put(`/api/v1/bookings/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating booking:', error)
            throw error
        }
    },

    // Delete booking
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/bookings/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting booking:', error)
            throw error
        }
    },

    // Cancel booking
    cancel: async (id: string) => {
        try {
            const response = await apiClient.patch(`/api/v1/bookings/${id}/cancel`)
            return response.data
        } catch (error) {
            console.error('Error cancelling booking:', error)
            throw error
        }
    },

    // Get booking statistics
    getStatistics: async (params?: { date?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/bookings/statistics', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching booking statistics:', error)
            throw error
        }
    },
}

export default {
    StaffService,
    AttendanceService,
    BookingService,
}
