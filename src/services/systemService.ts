/**
 * System Service
 * Handles all system-related API calls for admin dashboard
 */

import { apiClient } from '@/services/api/client'

// =============================================
// INTERFACES
// =============================================

export interface SecuritySetting {
    id: string
    setting: string
    value: string
    description?: string
    enabled: boolean
    category: 'authentication' | 'encryption' | 'access-control'
    createdAt?: string
    updatedAt?: string
}

export interface ApiIntegration {
    id: string
    name: string
    endpoint: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    status: 'active' | 'inactive' | 'error'
    responseTime?: number
    lastChecked?: string
    createdAt?: string
    updatedAt?: string
}

export interface DatabaseHealth {
    id: string
    name: string
    host: string
    port: number
    status: 'healthy' | 'warning' | 'critical'
    diskUsage: number
    connections?: number
    lastBackup?: string
    createdAt?: string
    updatedAt?: string
}

export interface FeatureFlag {
    id: string
    name: string
    description?: string
    enabled: boolean
    rolloutPercentage?: number
    targetUsers?: string
    createdAt?: string
    updatedAt?: string
}

export interface Integration {
    id: string
    name: string
    type: 'webhook' | 'api' | 'service'
    url: string
    apiKey?: string
    status: 'active' | 'inactive' | 'error'
    lastSync?: string
    createdAt?: string
    updatedAt?: string
}

export interface SystemLog {
    id: string
    timestamp: string
    level: 'info' | 'warning' | 'error' | 'critical'
    service: string
    message: string
    details?: string
    createdAt?: string
    updatedAt?: string
}

// =============================================
// SECURITY SETTINGS SERVICE
// =============================================

export const SecuritySettingsService = {
    // Get all security settings
    getAll: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/admin/settings/security', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching security settings:', error)
            throw error
        }
    },

    // Get security setting by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/admin/settings/security/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching security setting:', error)
            throw error
        }
    },

    // Create security setting
    create: async (data: Partial<SecuritySetting>) => {
        try {
            const response = await apiClient.post('/api/v1/admin/settings/security', data)
            return response.data
        } catch (error) {
            console.error('Error creating security setting:', error)
            throw error
        }
    },

    // Update security setting
    update: async (id: string, data: Partial<SecuritySetting>) => {
        try {
            const response = await apiClient.put(`/api/v1/admin/settings/security/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating security setting:', error)
            throw error
        }
    },

    // Delete security setting
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/admin/settings/security/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting security setting:', error)
            throw error
        }
    },
}

// =============================================
// API MONITORING SERVICE
// =============================================

export const ApiMonitoringService = {
    // Get all API integrations
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/admin/system/integrations', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching API integrations:', error)
            throw error
        }
    },

    // Get API integration by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/admin/system/integrations/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching API integration:', error)
            throw error
        }
    },

    // Create API integration
    create: async (data: Partial<ApiIntegration>) => {
        try {
            const response = await apiClient.post('/api/v1/admin/system/integrations', data)
            return response.data
        } catch (error) {
            console.error('Error creating API integration:', error)
            throw error
        }
    },

    // Update API integration
    update: async (id: string, data: Partial<ApiIntegration>) => {
        try {
            const response = await apiClient.put(`/api/v1/admin/system/integrations/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating API integration:', error)
            throw error
        }
    },

    // Delete API integration
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/admin/system/integrations/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting API integration:', error)
            throw error
        }
    },
}

// =============================================
// DATABASE HEALTH SERVICE
// =============================================

export const DatabaseHealthService = {
    // Get all database health records
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/admin/system/database', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching database health:', error)
            throw error
        }
    },

    // Get database health by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/admin/system/database/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching database health:', error)
            throw error
        }
    },

    // Create database health record
    create: async (data: Partial<DatabaseHealth>) => {
        try {
            const response = await apiClient.post('/api/v1/admin/system/database', data)
            return response.data
        } catch (error) {
            console.error('Error creating database health record:', error)
            throw error
        }
    },

    // Update database health record
    update: async (id: string, data: Partial<DatabaseHealth>) => {
        try {
            const response = await apiClient.put(`/api/v1/admin/system/database/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating database health record:', error)
            throw error
        }
    },

    // Delete database health record
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/admin/system/database/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting database health record:', error)
            throw error
        }
    },
}

// =============================================
// FEATURE FLAGS SERVICE
// =============================================

export const FeatureFlagsService = {
    // Get all feature flags
    getAll: async (params?: { page?: number; limit?: number; search?: string; enabled?: boolean }) => {
        try {
            const response = await apiClient.get('/api/v1/feature-flags', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching feature flags:', error)
            throw error
        }
    },

    // Get feature flag by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/feature-flags/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching feature flag:', error)
            throw error
        }
    },

    // Create feature flag
    create: async (data: Partial<FeatureFlag>) => {
        try {
            const response = await apiClient.post('/api/v1/feature-flags', data)
            return response.data
        } catch (error) {
            console.error('Error creating feature flag:', error)
            throw error
        }
    },

    // Update feature flag
    update: async (id: string, data: Partial<FeatureFlag>) => {
        try {
            const response = await apiClient.put(`/api/v1/feature-flags/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating feature flag:', error)
            throw error
        }
    },

    // Delete feature flag
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/feature-flags/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting feature flag:', error)
            throw error
        }
    },
}

// =============================================
// INTEGRATION GATEWAY SERVICE
// =============================================

export const IntegrationGatewayService = {
    // Get all integrations
    getAll: async (params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/integration-gateway/integrations', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching integrations:', error)
            throw error
        }
    },

    // Get integration by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/integration-gateway/integrations/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching integration:', error)
            throw error
        }
    },

    // Create integration
    create: async (data: Partial<Integration>) => {
        try {
            const response = await apiClient.post('/api/v1/integration-gateway/integrations', data)
            return response.data
        } catch (error) {
            console.error('Error creating integration:', error)
            throw error
        }
    },

    // Update integration
    update: async (id: string, data: Partial<Integration>) => {
        try {
            const response = await apiClient.put(`/api/v1/integration-gateway/integrations/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating integration:', error)
            throw error
        }
    },

    // Delete integration
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/integration-gateway/integrations/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting integration:', error)
            throw error
        }
    },
}

// =============================================
// SYSTEM LOGS SERVICE
// =============================================

export const SystemLogsService = {
    // Get all system logs
    getAll: async (params?: { page?: number; limit?: number; search?: string; level?: string; service?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/admin/system/logs', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching system logs:', error)
            throw error
        }
    },

    // Get system log by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/admin/system/logs/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching system log:', error)
            throw error
        }
    },

    // Create system log
    create: async (data: Partial<SystemLog>) => {
        try {
            const response = await apiClient.post('/api/v1/admin/system/logs', data)
            return response.data
        } catch (error) {
            console.error('Error creating system log:', error)
            throw error
        }
    },

    // Update system log
    update: async (id: string, data: Partial<SystemLog>) => {
        try {
            const response = await apiClient.put(`/api/v1/admin/system/logs/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating system log:', error)
            throw error
        }
    },

    // Delete system log
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/admin/system/logs/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting system log:', error)
            throw error
        }
    },
}
