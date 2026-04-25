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
            const response = await apiClient.get('/staff', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching staff:', error)
            throw error
        }
    },

    // Get staff by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/staff/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching staff member:', error)
            throw error
        }
    },

    // Create staff — transforms flat frontend payload to backend's deeply nested schema.
    // Fills in sensible defaults for required backend fields the minimal admin form doesn't collect
    // (dateOfBirth, gender, nationality, idType, idNumber, address, emergencyContact, payrollInfo).
    // Admin can edit staff afterward to supply real values.
    create: async (data: Partial<StaffMember> & { businessUnitId?: string }) => {
        try {
            // Map UI labels to backend StaffType enum values
            // Backend enum: coach | instructor | manager | admin | receptionist | maintenance | security | cleaner
            const staffTypeMap: Record<string, string> = {
                Coach: 'coach', Trainer: 'coach',
                Manager: 'manager', Admin: 'admin',
                Instructor: 'instructor', Assistant: 'receptionist',
            }
            const empId = `EMP-${Date.now()}`
            const payload: any = {
                personalInfo: {
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    dateOfBirth: '1990-01-01',
                    gender: 'other',
                    nationality: 'Unknown',
                    idNumber: empId,
                    idType: 'national_id',
                },
                contactInfo: {
                    email: data.email || '',
                    phone: data.phone || '',
                    address: {
                        street: 'N/A', city: 'N/A', state: 'N/A',
                        country: 'N/A', postalCode: '00000',
                    },
                    emergencyContact: {
                        name: 'N/A', relationship: 'N/A', phone: data.phone || '+10000000000',
                    },
                },
                staffType: staffTypeMap[data.role || ''] || (data.role || '').toLowerCase() || 'coach',
                locationIds: data.locationId ? [data.locationId] : [],
                primaryLocationId: data.locationId,
                businessUnitId: data.businessUnitId,
                specializations: [],
                skills: [],
                experienceYears: 0,
                maxHoursPerWeek: 40,
                payrollInfo: {
                    employeeId: empId,
                    currency: 'USD',
                    paymentMethod: 'bank_transfer',
                },
            }
            const response = await apiClient.post('/staff', payload)
            return response.data
        } catch (error) {
            console.error('Error creating staff member:', error)
            throw error
        }
    },

    // Update staff — transforms flat payload the same way
    update: async (id: string, data: Partial<StaffMember>) => {
        try {
            const payload: any = {}
            if (data.firstName || data.lastName) {
                payload.personalInfo = {}
                if (data.firstName) payload.personalInfo.firstName = data.firstName
                if (data.lastName) payload.personalInfo.lastName = data.lastName
            }
            if (data.email || data.phone) {
                payload.contactInfo = {}
                if (data.email) payload.contactInfo.email = data.email
                if (data.phone) payload.contactInfo.phone = data.phone
            }
            if (data.role) {
                const updateMap: Record<string, string> = {
                    Coach: 'coach', Trainer: 'coach',
                    Manager: 'manager', Admin: 'admin',
                    Instructor: 'instructor', Assistant: 'receptionist',
                }
                payload.staffType = updateMap[data.role] || data.role.toLowerCase()
            }
            if (data.locationId) {
                payload.locationIds = [data.locationId]
                payload.primaryLocationId = data.locationId
            }
            if (data.status) payload.status = data.status
            const response = await apiClient.put(`/staff/${id}`, payload)
            return response.data
        } catch (error) {
            console.error('Error updating staff member:', error)
            throw error
        }
    },

    // Delete staff
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/staff/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting staff member:', error)
            throw error
        }
    },

    // Get staff statistics
    getStatistics: async () => {
        try {
            const response = await apiClient.get('/staff/statistics/overview')
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
            const response = await apiClient.get('/attendance', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching attendance records:', error)
            throw error
        }
    },

    // Get attendance by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/attendance/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching attendance record:', error)
            throw error
        }
    },

    // Create attendance record
    create: async (data: Partial<AttendanceRecord>) => {
        try {
            const response = await apiClient.post('/attendance', data)
            return response.data
        } catch (error) {
            console.error('Error creating attendance record:', error)
            throw error
        }
    },

    // Update attendance record
    update: async (id: string, data: Partial<AttendanceRecord>) => {
        try {
            const response = await apiClient.put(`/attendance/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating attendance record:', error)
            throw error
        }
    },

    // Delete attendance record
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/attendance/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting attendance record:', error)
            throw error
        }
    },

    // Get attendance statistics
    getStatistics: async (params?: { date?: string; classId?: string }) => {
        try {
            const response = await apiClient.get('/attendance/statistics', { params })
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
            const response = await apiClient.get('/bookings', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching bookings:', error)
            throw error
        }
    },

    // Get booking by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/bookings/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching booking:', error)
            throw error
        }
    },

    // Create booking
    create: async (data: Partial<Booking>) => {
        try {
            const response = await apiClient.post('/bookings', data)
            return response.data
        } catch (error) {
            console.error('Error creating booking:', error)
            throw error
        }
    },

    // Update booking
    update: async (id: string, data: Partial<Booking>) => {
        try {
            const response = await apiClient.put(`/bookings/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating booking:', error)
            throw error
        }
    },

    // Delete booking
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/bookings/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting booking:', error)
            throw error
        }
    },

    // Cancel booking
    cancel: async (id: string) => {
        try {
            const response = await apiClient.patch(`/bookings/${id}/cancel`)
            return response.data
        } catch (error) {
            console.error('Error cancelling booking:', error)
            throw error
        }
    },

    // Get booking statistics
    getStatistics: async (params?: { date?: string }) => {
        try {
            const response = await apiClient.get('/bookings/statistics', { params })
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
