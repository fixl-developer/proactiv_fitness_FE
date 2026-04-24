/**
 * Reports Service
 * Handles all reports-related API calls for admin dashboard
 */

import { apiClient } from '@/services/api/client'

// =============================================
// ENROLLMENT REPORT INTERFACES
// =============================================

export interface EnrollmentReport {
    id: string
    date: string
    programId: string
    locationId: string
    enrollmentCount: number
    status: 'active' | 'inactive' | 'completed'
    notes?: string
    createdAt?: string
    updatedAt?: string
}

// =============================================
// PERFORMANCE ANALYTICS INTERFACES
// =============================================

export interface PerformanceAnalytics {
    id: string
    date: string
    metric: 'attendance' | 'completion' | 'satisfaction' | 'progress'
    value: number
    locationId?: string
    notes?: string
    createdAt?: string
    updatedAt?: string
}

// =============================================
// AUDIT LOG INTERFACES
// =============================================

export interface AuditLog {
    id: string
    date: string
    action: 'create' | 'update' | 'delete' | 'view' | 'export'
    entityType: 'user' | 'payment' | 'booking' | 'staff'
    entityId: string
    userId: string
    changes?: string
    status: 'success' | 'failed'
    createdAt?: string
    updatedAt?: string
}

// =============================================
// ENROLLMENT REPORTS SERVICE
// =============================================

export const EnrollmentReportService = {
    // Get all enrollment reports
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        try {
            const response = await apiClient.get('/reports/enrollment', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching enrollment reports:', error)
            throw error
        }
    },

    // Get enrollment report by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/reports/enrollment/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching enrollment report:', error)
            throw error
        }
    },

    // Create enrollment report
    create: async (data: Partial<EnrollmentReport>) => {
        try {
            const response = await apiClient.post('/reports/enrollment', data)
            return response.data
        } catch (error) {
            console.error('Error creating enrollment report:', error)
            throw error
        }
    },

    // Update enrollment report
    update: async (id: string, data: Partial<EnrollmentReport>) => {
        try {
            const response = await apiClient.put(`/reports/enrollment/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating enrollment report:', error)
            throw error
        }
    },

    // Delete enrollment report
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/reports/enrollment/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting enrollment report:', error)
            throw error
        }
    },
}

// =============================================
// PERFORMANCE ANALYTICS SERVICE
// =============================================

export const PerformanceAnalyticsService = {
    // Get all performance analytics
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        try {
            const response = await apiClient.get('/reports/performance', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching performance analytics:', error)
            throw error
        }
    },

    // Get performance analytics by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/reports/performance/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching performance analytics:', error)
            throw error
        }
    },

    // Create performance analytics
    create: async (data: Partial<PerformanceAnalytics>) => {
        try {
            const response = await apiClient.post('/reports/performance', data)
            return response.data
        } catch (error) {
            console.error('Error creating performance analytics:', error)
            throw error
        }
    },

    // Update performance analytics
    update: async (id: string, data: Partial<PerformanceAnalytics>) => {
        try {
            const response = await apiClient.put(`/reports/performance/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating performance analytics:', error)
            throw error
        }
    },

    // Delete performance analytics
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/reports/performance/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting performance analytics:', error)
            throw error
        }
    },
}

// =============================================
// AUDIT LOGS SERVICE
// =============================================

export const AuditLogService = {
    // Get all audit logs
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        try {
            const response = await apiClient.get('/reports/audit', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching audit logs:', error)
            throw error
        }
    },

    // Get audit log by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/reports/audit/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching audit log:', error)
            throw error
        }
    },

    // Create audit log
    create: async (data: Partial<AuditLog>) => {
        try {
            const response = await apiClient.post('/reports/audit', data)
            return response.data
        } catch (error) {
            console.error('Error creating audit log:', error)
            throw error
        }
    },

    // Update audit log
    update: async (id: string, data: Partial<AuditLog>) => {
        try {
            const response = await apiClient.put(`/reports/audit/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating audit log:', error)
            throw error
        }
    },

    // Delete audit log
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/reports/audit/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting audit log:', error)
            throw error
        }
    },
}
