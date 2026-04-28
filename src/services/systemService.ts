/**
 * System Service
 * Handles all system-related API calls for admin dashboard
 *
 * Response shape normalization — list endpoints return { data, pagination }, singles return unwrapped T.
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
    type: 'payment' | 'email' | 'sms' | 'analytics' | 'webhook' | 'api' | 'service'
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

export interface ListResponse<T> {
    data: T[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
}

// =============================================
// HELPERS
// =============================================

function normalizeItem<T extends { id?: string; _id?: string }>(item: any): T {
    if (!item || typeof item !== 'object') return item
    if (!item.id && item._id) return { ...item, id: String(item._id) } as T
    return item as T
}

function normalizeList<T extends { id?: string; _id?: string }>(items: any): T[] {
    if (!Array.isArray(items)) return []
    return items.map(normalizeItem) as T[]
}

function unwrapListResponse<T extends { id?: string; _id?: string }>(body: any, params?: { page?: number; limit?: number }): ListResponse<T> {
    const page = params?.page || 1
    const limit = params?.limit || 10
    const payload = body?.data !== undefined ? body.data : body

    if (Array.isArray(payload)) {
        const total = payload.length
        const start = (page - 1) * limit
        return {
            data: normalizeList<T>(payload.slice(start, start + limit)),
            pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        }
    }

    if (payload && typeof payload === 'object') {
        const items = payload.items || payload.data || payload.results || []
        return {
            data: normalizeList<T>(items),
            pagination: {
                page: payload.page ?? page,
                limit: payload.limit ?? limit,
                total: payload.total ?? items.length,
                totalPages: payload.totalPages ?? Math.max(1, Math.ceil((payload.total ?? items.length) / limit)),
            },
        }
    }

    return { data: [], pagination: { page, limit, total: 0, totalPages: 1 } }
}

function unwrapItemResponse<T extends { id?: string; _id?: string }>(body: any): T {
    const payload = body?.data !== undefined ? body.data : body
    return normalizeItem<T>(payload)
}

// =============================================
// SECURITY SETTINGS SERVICE
// =============================================

export const SecuritySettingsService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<ListResponse<SecuritySetting>> => {
        const body = await apiClient.get('/admin/settings/security', { params })
        return unwrapListResponse<SecuritySetting>(body, params)
    },

    getById: async (id: string): Promise<SecuritySetting> => {
        const body = await apiClient.get(`/admin/settings/security/${id}`)
        return unwrapItemResponse<SecuritySetting>(body)
    },

    create: async (data: Partial<SecuritySetting>): Promise<SecuritySetting> => {
        const body = await apiClient.post('/admin/settings/security', data)
        return unwrapItemResponse<SecuritySetting>(body)
    },

    update: async (id: string, data: Partial<SecuritySetting>): Promise<SecuritySetting> => {
        const body = await apiClient.put(`/admin/settings/security/${id}`, data)
        return unwrapItemResponse<SecuritySetting>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/settings/security/${id}`)
    },
}

// =============================================
// API MONITORING SERVICE
// =============================================

export const ApiMonitoringService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ListResponse<ApiIntegration>> => {
        const body = await apiClient.get('/admin/system/integrations', { params })
        return unwrapListResponse<ApiIntegration>(body, params)
    },

    getById: async (id: string): Promise<ApiIntegration> => {
        const body = await apiClient.get(`/admin/system/integrations/${id}`)
        return unwrapItemResponse<ApiIntegration>(body)
    },

    create: async (data: Partial<ApiIntegration>): Promise<ApiIntegration> => {
        const body = await apiClient.post('/admin/system/integrations', data)
        return unwrapItemResponse<ApiIntegration>(body)
    },

    update: async (id: string, data: Partial<ApiIntegration>): Promise<ApiIntegration> => {
        const body = await apiClient.put(`/admin/system/integrations/${id}`, data)
        return unwrapItemResponse<ApiIntegration>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/system/integrations/${id}`)
    },
}

// =============================================
// DATABASE HEALTH SERVICE
// =============================================

export const DatabaseHealthService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ListResponse<DatabaseHealth>> => {
        const body = await apiClient.get('/admin/system/database', { params })
        return unwrapListResponse<DatabaseHealth>(body, params)
    },

    getById: async (id: string): Promise<DatabaseHealth> => {
        const body = await apiClient.get(`/admin/system/database/${id}`)
        return unwrapItemResponse<DatabaseHealth>(body)
    },

    create: async (data: Partial<DatabaseHealth>): Promise<DatabaseHealth> => {
        const body = await apiClient.post('/admin/system/database', data)
        return unwrapItemResponse<DatabaseHealth>(body)
    },

    update: async (id: string, data: Partial<DatabaseHealth>): Promise<DatabaseHealth> => {
        const body = await apiClient.put(`/admin/system/database/${id}`, data)
        return unwrapItemResponse<DatabaseHealth>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/system/database/${id}`)
    },
}

// =============================================
// FEATURE FLAGS SERVICE
// =============================================

export const FeatureFlagsService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; enabled?: boolean }): Promise<ListResponse<FeatureFlag>> => {
        const body = await apiClient.get('/feature-flags', { params })
        return unwrapListResponse<FeatureFlag>(body, params)
    },

    getById: async (id: string): Promise<FeatureFlag> => {
        const body = await apiClient.get(`/feature-flags/${id}`)
        return unwrapItemResponse<FeatureFlag>(body)
    },

    create: async (data: Partial<FeatureFlag>): Promise<FeatureFlag> => {
        const body = await apiClient.post('/feature-flags', data)
        return unwrapItemResponse<FeatureFlag>(body)
    },

    update: async (id: string, data: Partial<FeatureFlag>): Promise<FeatureFlag> => {
        const body = await apiClient.put(`/feature-flags/${id}`, data)
        return unwrapItemResponse<FeatureFlag>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/feature-flags/${id}`)
    },
}

// =============================================
// INTEGRATION GATEWAY SERVICE
//
// Backend `Integration` model expects a nested shape:
//   { integrationType, provider, name, description?, config: { environment, apiKey?, apiSecret?, webhookUrl? } }
// The admin Integration Gateway page uses a simpler flat shape:
//   { name, type, url, apiKey, status }
// These mappers translate between the two so the form stays simple while the
// backend stores the canonical shape that other consumers depend on.
// Identifier note: backend writes/reads by `integrationId` (UUID), not Mongo
// `_id`; mapped → `id` so the frontend never has to know the difference.
// =============================================

const FRONT_TYPE_TO_BACK: Record<string, string> = {
    payment: 'payment_gateway',
    email: 'email_sms',
    sms: 'email_sms',
    analytics: 'third_party_api',
    webhook: 'third_party_api',
    api: 'third_party_api',
    service: 'third_party_api',
}
const BACK_TYPE_TO_FRONT: Record<string, Integration['type']> = {
    payment_gateway: 'payment',
    email_sms: 'email',
    third_party_api: 'api',
    accounting: 'service',
    calendar: 'service',
    access_control: 'service',
}

function mapIntegrationToBackend(data: Partial<Integration>): any {
    const payload: any = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.type !== undefined) {
        payload.integrationType = FRONT_TYPE_TO_BACK[data.type as string] || 'third_party_api'
        payload.provider = data.type
    }
    if (data.status !== undefined) payload.status = data.status
    if (data.url !== undefined || data.apiKey !== undefined) {
        payload.config = {
            environment: 'sandbox',
            apiKey: data.apiKey,
            webhookUrl: data.url,
        }
    }
    return payload
}

function mapIntegrationFromBackend(item: any): Integration {
    if (!item || typeof item !== 'object') return item
    return {
        id: String(item.integrationId || item._id || item.id),
        name: item.name,
        type: BACK_TYPE_TO_FRONT[item.integrationType] || (item.integrationType as Integration['type']) || 'api',
        url: item.config?.webhookUrl || '',
        apiKey: item.config?.apiKey || '',
        status: item.status || 'pending',
        lastSync: item.healthCheck?.lastChecked,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    }
}

export const IntegrationGatewayService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }): Promise<ListResponse<Integration>> => {
        const body = await apiClient.get('/integration-gateway/integrations', { params })
        const payload = body?.data !== undefined ? body.data : body
        const items: any[] = Array.isArray(payload) ? payload : (payload?.items || payload?.data || [])
        const search = (params?.search || '').toLowerCase()
        const filtered = search
            ? items.filter(i => `${i.name || ''} ${i.provider || ''}`.toLowerCase().includes(search))
            : items
        const mapped = filtered.map(mapIntegrationFromBackend)
        const page = params?.page || 1
        const limit = params?.limit || 10
        const total = mapped.length
        const start = (page - 1) * limit
        return {
            data: mapped.slice(start, start + limit),
            pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        }
    },

    getById: async (id: string): Promise<Integration> => {
        const body = await apiClient.get(`/integration-gateway/integrations/${id}`)
        return mapIntegrationFromBackend(body?.data ?? body)
    },

    create: async (data: Partial<Integration>): Promise<Integration> => {
        const body = await apiClient.post('/integration-gateway/integrations', mapIntegrationToBackend(data))
        return mapIntegrationFromBackend(body?.data ?? body)
    },

    update: async (id: string, data: Partial<Integration>): Promise<Integration> => {
        const body = await apiClient.put(`/integration-gateway/integrations/${id}`, mapIntegrationToBackend(data))
        return mapIntegrationFromBackend(body?.data ?? body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/integration-gateway/integrations/${id}`)
    },
}

// =============================================
// SYSTEM LOGS SERVICE
// =============================================

export const SystemLogsService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; level?: string; service?: string }): Promise<ListResponse<SystemLog>> => {
        const body = await apiClient.get('/admin/system/logs', { params })
        return unwrapListResponse<SystemLog>(body, params)
    },

    getById: async (id: string): Promise<SystemLog> => {
        const body = await apiClient.get(`/admin/system/logs/${id}`)
        return unwrapItemResponse<SystemLog>(body)
    },

    create: async (data: Partial<SystemLog>): Promise<SystemLog> => {
        const body = await apiClient.post('/admin/system/logs', data)
        return unwrapItemResponse<SystemLog>(body)
    },

    update: async (id: string, data: Partial<SystemLog>): Promise<SystemLog> => {
        const body = await apiClient.put(`/admin/system/logs/${id}`, data)
        return unwrapItemResponse<SystemLog>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/admin/system/logs/${id}`)
    },
}
