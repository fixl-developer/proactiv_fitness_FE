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

// Map backend staffType (lowercase enum) back to UI label
const STAFF_TYPE_TO_ROLE: Record<string, string> = {
    coach: 'Coach',
    instructor: 'Instructor',
    manager: 'Manager',
    admin: 'Admin',
    receptionist: 'Assistant',
    maintenance: 'Assistant',
    security: 'Assistant',
    cleaner: 'Assistant',
}

// Flatten the deeply-nested Staff document the backend returns into the flat
// shape the admin Staff page expects.
const flattenStaffDoc = (doc: any) => {
    if (!doc) return doc
    const personal = doc.personalInfo || {}
    const contact = doc.contactInfo || {}
    return {
        // Backend's PUT/DELETE /staff/:staffId looks records up by the generated
        // `staffId` string, not by Mongo _id — so use staffId for routing IDs.
        id: doc.staffId || doc.id || doc._id,
        staffId: doc.staffId,
        _id: doc.id || doc._id,
        firstName: personal.firstName || '',
        lastName: personal.lastName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        role: STAFF_TYPE_TO_ROLE[String(doc.staffType || '').toLowerCase()] || doc.staffType || '',
        staffType: doc.staffType,
        businessUnitId: doc.businessUnitId || '',
        locationId: doc.primaryLocationId || (Array.isArray(doc.locationIds) && doc.locationIds[0]) || '',
        status: doc.status === 'active' ? 'active' : 'inactive',
        hireDate: doc.hireDate ? String(doc.hireDate).slice(0, 10) : '',
        certifications: Array.isArray(doc.certifications) ? doc.certifications.map((c: any) => c.name || c).filter(Boolean) : [],
        createdAt: doc.createdAt,
    }
}

export const StaffService = {
    // Get all staff — unwraps the paginated response and flattens nested fields
    // so the page can consume a plain array of `{id, firstName, lastName, ...}`.
    getAll: async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string; locationId?: string }) => {
        try {
            const response = await apiClient.get('/staff', { params })
            // After the BaseController fix, response shape is:
            //   { success, message, data: { data: [...staff], pagination: {...} } }
            // Unwrap to expose the array + pagination at the top level so the
            // page's existing fallback chain finds it under `payload.data`.
            const body: any = response?.data ?? response
            const list = Array.isArray(body?.data) ? body.data
                : Array.isArray(body?.items) ? body.items
                    : Array.isArray(body) ? body
                        : []
            return {
                data: list.map(flattenStaffDoc),
                pagination: body?.pagination,
            }
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
            // Map flat string[] certifications from the admin form into the nested
            // ICertification shape the Staff sub-doc schema demands (certificationId,
            // name, issuingOrganization, issueDate, expiryDate, certificateNumber, status).
            const todayISO = new Date().toISOString().slice(0, 10)
            const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
            const certifications = Array.isArray(data.certifications)
                ? data.certifications.filter(Boolean).map((name, idx) => ({
                    certificationId: `${empId}-CERT-${idx + 1}`,
                    name: String(name),
                    issuingOrganization: 'N/A',
                    issueDate: todayISO,
                    expiryDate: oneYearFromNow,
                    certificateNumber: `${empId}-CERT-${idx + 1}`,
                    status: 'valid',
                }))
                : []
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
                status: data.status === 'inactive' ? 'inactive' : 'active',
                // hireDate is required by the Staff model — fall back to today if not supplied
                hireDate: data.hireDate || todayISO,
                locationIds: data.locationId ? [data.locationId] : [],
                primaryLocationId: data.locationId,
                businessUnitId: data.businessUnitId,
                specializations: [],
                skills: [],
                certifications,
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
    // Backend response: { success, data: [...records], pagination: {...} }
    // Page expects: { data: [...records], pagination: {...} } — preserve both layers.
    getAll: async (params?: { page?: number; limit?: number; search?: string; date?: string; status?: string; classId?: string }) => {
        try {
            const response: any = await apiClient.get('/attendance', { params })
            return {
                data: Array.isArray(response?.data) ? response.data : [],
                pagination: response?.pagination,
            }
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

// Backend booking docs use nested fields (sessionDate, payment.status, bookedBy,
// participants[]). Flatten + alias for the admin table so existing column code
// finds {customerId, sessionId, programId, date, status, paymentStatus, customerName}.
const flattenBookingDoc = (doc: any) => {
    if (!doc) return doc
    const participant = Array.isArray(doc.participants) && doc.participants.length > 0 ? doc.participants[0] : null
    const sessionDateRaw = doc.sessionDate || doc.date || doc.createdAt
    return {
        id: doc.id || doc._id || doc.bookingId,
        bookingId: doc.bookingId,
        customerId: doc.bookedBy || doc.familyId || doc.customerId || '',
        customerName: participant?.name || doc.customerName || '',
        programId: doc.programId || '',
        programName: doc.programName || '',
        sessionId: doc.sessionId || '',
        date: sessionDateRaw ? new Date(sessionDateRaw).toISOString() : '',
        sessionDate: sessionDateRaw ? new Date(sessionDateRaw).toISOString() : '',
        status: doc.status || 'pending',
        paymentStatus: doc.payment?.status || doc.paymentStatus || 'pending',
        notes: Array.isArray(doc.specialRequests) ? doc.specialRequests.join(' ') : (doc.notes || ''),
        bookingType: doc.bookingType || '',
        locationId: doc.locationId || '',
        createdAt: doc.createdAt,
    }
}

export const BookingService = {
    // Get all bookings — unwrap pagination + flatten nested fields for the admin page
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; paymentStatus?: string; date?: string }) => {
        try {
            const response = await apiClient.get('/bookings', { params })
            const body: any = response?.data ?? response
            const list = Array.isArray(body?.data) ? body.data
                : Array.isArray(body?.items) ? body.items
                    : Array.isArray(body) ? body
                        : []
            return {
                data: list.map(flattenBookingDoc),
                pagination: body?.pagination,
            }
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
