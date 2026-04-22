/**
 * User Management Service
 * Handles all user-related API calls for admin dashboard
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
    createdAt?: string
    updatedAt?: string
}

export interface Permission {
    id: string
    name: string
    description?: string
    module: string
    action: string
    createdAt?: string
    updatedAt?: string
}

// =============================================
// USER MANAGEMENT
// =============================================

export const UserService = {
    // Get all users
    getAll: async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/users', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching users:', error)
            throw error
        }
    },

    // Get user by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/users/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching user:', error)
            throw error
        }
    },

    // Create new user
    create: async (data: CreateUserData) => {
        try {
            const response = await apiClient.post('/api/v1/users', data)
            return response.data
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    },

    // Update user
    update: async (id: string, data: UpdateUserData) => {
        try {
            const response = await apiClient.put(`/api/v1/users/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating user:', error)
            throw error
        }
    },

    // Update user status
    updateStatus: async (id: string, status: string) => {
        try {
            const response = await apiClient.patch(`/api/v1/users/${id}/status`, { status })
            return response.data
        } catch (error) {
            console.error('Error updating user status:', error)
            throw error
        }
    },

    // Delete user
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/users/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    },
}

// =============================================
// ROLE MANAGEMENT
// =============================================

export const RoleService = {
    // Get all roles
    getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/roles', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching roles:', error)
            throw error
        }
    },

    // Get role by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/roles/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching role:', error)
            throw error
        }
    },

    // Create new role
    create: async (data: { name: string; description?: string; permissions?: string[] }) => {
        try {
            const response = await apiClient.post('/api/v1/roles', data)
            return response.data
        } catch (error) {
            console.error('Error creating role:', error)
            throw error
        }
    },

    // Update role
    update: async (id: string, data: { name?: string; description?: string; permissions?: string[] }) => {
        try {
            const response = await apiClient.put(`/api/v1/roles/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating role:', error)
            throw error
        }
    },

    // Delete role
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/roles/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting role:', error)
            throw error
        }
    },
}

// =============================================
// PERMISSION MANAGEMENT
// =============================================

export const PermissionService = {
    // Get all permissions
    getAll: async (params?: { page?: number; limit?: number; search?: string; module?: string }) => {
        try {
            const response = await apiClient.get('/api/v1/permissions', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching permissions:', error)
            throw error
        }
    },

    // Get permission by ID
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/api/v1/permissions/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching permission:', error)
            throw error
        }
    },

    // Create new permission
    create: async (data: { name: string; description?: string; module: string; action: string }) => {
        try {
            const response = await apiClient.post('/api/v1/permissions', data)
            return response.data
        } catch (error) {
            console.error('Error creating permission:', error)
            throw error
        }
    },

    // Update permission
    update: async (id: string, data: { name?: string; description?: string; module?: string; action?: string }) => {
        try {
            const response = await apiClient.put(`/api/v1/permissions/${id}`, data)
            return response.data
        } catch (error) {
            console.error('Error updating permission:', error)
            throw error
        }
    },

    // Delete permission
    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/api/v1/permissions/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting permission:', error)
            throw error
        }
    },
}

export default {
    UserService,
    RoleService,
    PermissionService,
}
