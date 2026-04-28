/**
 * User Management Service
 * Handles all user-related API calls for admin dashboard
 *
 * Response shape normalization — same pattern as businessConfigService:
 * List endpoints return { data: T[], pagination: {...} }
 * Single-item endpoints return T directly (unwrapped from body.data).
 */

import { apiClient } from '@/services/api/client'

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    phone?: string
    role: 'admin' | 'staff' | 'coach' | 'parent' | 'student'
    status: 'active' | 'inactive' | 'suspended'
    locationId?: string
    createdAt?: string
    updatedAt?: string
}

export interface CreateUserData {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    role: string
    locationId?: string
}

export interface UpdateUserData {
    firstName?: string
    lastName?: string
    phone?: string
    role?: string
    status?: string
}

export interface Role {
    id: string
    name: string
    description?: string
    permissions: string[]
    roleType?: 'admin' | 'manager' | 'staff' | 'user' | 'custom'
    status?: 'active' | 'inactive' | 'deprecated'
    assignedLocations?: string[]
    assignedBusinessUnits?: string[]
    isSystem?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface Permission {
    id: string
    name: string
    description?: string
    module: string
    action: string
    resourceType?: string
    status?: 'active' | 'inactive' | 'deprecated'
    isSystemPermission?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface ListResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

// =============================================
// HELPERS
// =============================================

function normalizeItem<T extends { id?: string; _id?: string }>(item: any): T {
    if (!item || typeof item !== 'object') return item
    if (!item.id && item._id) {
        return { ...item, id: String(item._id) } as T
    }
    return item as T
}

function normalizeList<T extends { id?: string; _id?: string }>(items: any): T[] {
    if (!Array.isArray(items)) return []
    return items.map(normalizeItem) as T[]
}

function unwrapListResponse<T extends { id?: string; _id?: string }>(
    body: any,
    params?: { page?: number; limit?: number }
): ListResponse<T> {
    const page = params?.page || 1
    const limit = params?.limit || 10

    // Prefer top-level pagination if backend provides it (new IAM RBAC shape):
    // { success, data: [...], pagination: { page, limit, total, totalPages } }
    const topLevelPagination = body?.pagination
    const payload = body?.data !== undefined ? body.data : body

    if (Array.isArray(payload)) {
        if (topLevelPagination && typeof topLevelPagination === 'object') {
            return {
                data: normalizeList<T>(payload),
                pagination: {
                    page: topLevelPagination.page ?? page,
                    limit: topLevelPagination.limit ?? limit,
                    total: topLevelPagination.total ?? payload.length,
                    totalPages:
                        topLevelPagination.totalPages ??
                        Math.max(1, Math.ceil((topLevelPagination.total ?? payload.length) / limit)),
                },
            }
        }
        // Fallback: client-side slice when backend returns a flat array without pagination
        const total = payload.length
        const start = (page - 1) * limit
        const items = payload.slice(start, start + limit)
        return {
            data: normalizeList<T>(items),
            pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        }
    }

    if (payload && typeof payload === 'object') {
        const items = payload.items || payload.data || payload.results || payload.users || []
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
// USER MANAGEMENT
// =============================================

export const UserService = {
    getAll: async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }): Promise<ListResponse<User>> => {
        const cleaned: Record<string, string | number> = {}
        if (params?.page) cleaned.page = params.page
        if (params?.limit) cleaned.limit = params.limit
        if (params?.search && params.search.trim().length >= 2) cleaned.search = params.search.trim()
        if (params?.role) cleaned.role = params.role
        if (params?.status) cleaned.status = params.status

        const body = await apiClient.get('/users', { params: cleaned })
        return unwrapListResponse<User>(body, params)
    },

    getById: async (id: string): Promise<User> => {
        const body = await apiClient.get(`/users/${id}`)
        return unwrapItemResponse<User>(body)
    },

    create: async (data: CreateUserData): Promise<User> => {
        const body = await apiClient.post('/users', data)
        return unwrapItemResponse<User>(body)
    },

    update: async (id: string, data: UpdateUserData): Promise<User> => {
        const body = await apiClient.put(`/users/${id}`, data)
        return unwrapItemResponse<User>(body)
    },

    updateStatus: async (id: string, status: string): Promise<User> => {
        const body = await apiClient.patch(`/users/${id}/status`, { status })
        return unwrapItemResponse<User>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`)
    },
}

// =============================================
// ROLE MANAGEMENT (Updated for Priority 1 Fields)
// =============================================

export const RoleService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        roleType?: string;
    }): Promise<ListResponse<Role>> => {
        const cleaned: Record<string, string | number> = {}
        if (params?.page) cleaned.page = params.page
        if (params?.limit) cleaned.limit = params.limit
        if (params?.search && params.search.trim().length >= 1) cleaned.search = params.search.trim()
        if (params?.status) cleaned.status = params.status
        if (params?.roleType) cleaned.roleType = params.roleType
        const body = await apiClient.get('/roles', { params: cleaned })
        return unwrapListResponse<Role>(body, params)
    },

    getById: async (id: string): Promise<Role> => {
        const body = await apiClient.get(`/roles/${id}`)
        return unwrapItemResponse<Role>(body)
    },

    create: async (data: {
        name: string;
        description?: string;
        permissions?: string[];
        roleType?: string;
        status?: string;
        assignedLocations?: string[];
        assignedBusinessUnits?: string[];
    }): Promise<Role> => {
        const body = await apiClient.post('/roles', data)
        return unwrapItemResponse<Role>(body)
    },

    update: async (id: string, data: {
        name?: string;
        description?: string;
        permissions?: string[];
        roleType?: string;
        status?: string;
        assignedLocations?: string[];
        assignedBusinessUnits?: string[];
    }): Promise<Role> => {
        const body = await apiClient.put(`/roles/${id}`, data)
        return unwrapItemResponse<Role>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/roles/${id}`)
    },
}

// =============================================
// PERMISSION MANAGEMENT (Updated for Priority 1 Fields)
// =============================================

export const PermissionService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        module?: string;
        status?: string;
        resourceType?: string;
    }): Promise<ListResponse<Permission>> => {
        const cleaned: Record<string, string | number> = {}
        if (params?.page) cleaned.page = params.page
        if (params?.limit) cleaned.limit = params.limit
        if (params?.search && params.search.trim().length >= 1) cleaned.search = params.search.trim()
        if (params?.module) cleaned.module = params.module
        if (params?.status) cleaned.status = params.status
        if (params?.resourceType) cleaned.resourceType = params.resourceType
        const body = await apiClient.get('/permissions', { params: cleaned })
        return unwrapListResponse<Permission>(body, params)
    },

    getById: async (id: string): Promise<Permission> => {
        const body = await apiClient.get(`/permissions/${id}`)
        return unwrapItemResponse<Permission>(body)
    },

    create: async (data: {
        name: string;
        description?: string;
        module: string;
        action: string;
        resourceType?: string;
        status?: string;
        isSystemPermission?: boolean;
    }): Promise<Permission> => {
        const body = await apiClient.post('/permissions', data)
        return unwrapItemResponse<Permission>(body)
    },

    update: async (id: string, data: {
        description?: string;
        resourceType?: string;
        status?: string;
    }): Promise<Permission> => {
        const body = await apiClient.put(`/permissions/${id}`, data)
        return unwrapItemResponse<Permission>(body)
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/permissions/${id}`)
    },
}

export default {
    UserService,
    RoleService,
    PermissionService,
}
