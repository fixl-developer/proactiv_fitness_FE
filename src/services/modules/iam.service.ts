import { apiClient } from '../api/client'

export interface User {
    id: string
    email: string
    name: string
    role: string
    status: 'active' | 'inactive' | 'suspended'
    createdAt: string
    lastLogin?: string
    permissions: string[]
}

export interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
    userCount: number
    createdAt: string
}

export interface Permission {
    id: string
    name: string
    description: string
    resource: string
    action: string
}

export interface Session {
    id: string
    userId: string
    token: string
    ipAddress: string
    userAgent: string
    createdAt: string
    expiresAt: string
    isActive: boolean
}

export class IAMService {
    /**
     * Get all users
     */
    static async getUsers(filters?: { page?: number; limit?: number; role?: string; status?: string }): Promise<{ users: User[]; total: number }> {
        try {
            const response = await apiClient.get('/iam/users', { params: filters })
            return (response as any)?.data || { users: [], total: 0 }
        } catch (error) {
            console.error('Error fetching users:', error)
            throw error
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: string): Promise<User> {
        try {
            const response = await apiClient.get(`/iam/users/${userId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching user:', error)
            throw error
        }
    }

    /**
     * Create user
     */
    static async createUser(data: Partial<User>): Promise<User> {
        try {
            const response = await apiClient.post('/iam/users', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    }

    /**
     * Update user
     */
    static async updateUser(userId: string, data: Partial<User>): Promise<User> {
        try {
            const response = await apiClient.patch(`/iam/users/${userId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating user:', error)
            throw error
        }
    }

    /**
     * Delete user
     */
    static async deleteUser(userId: string): Promise<void> {
        try {
            await apiClient.delete(`/iam/users/${userId}`)
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    }

    /**
     * Get all roles
     */
    static async getRoles(): Promise<Role[]> {
        try {
            const response = await apiClient.get('/iam/roles')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching roles:', error)
            throw error
        }
    }

    /**
     * Get role by ID
     */
    static async getRoleById(roleId: string): Promise<Role> {
        try {
            const response = await apiClient.get(`/iam/roles/${roleId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching role:', error)
            throw error
        }
    }

    /**
     * Create role
     */
    static async createRole(data: Partial<Role>): Promise<Role> {
        try {
            const response = await apiClient.post('/iam/roles', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating role:', error)
            throw error
        }
    }

    /**
     * Update role
     */
    static async updateRole(roleId: string, data: Partial<Role>): Promise<Role> {
        try {
            const response = await apiClient.patch(`/iam/roles/${roleId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating role:', error)
            throw error
        }
    }

    /**
     * Delete role
     */
    static async deleteRole(roleId: string): Promise<void> {
        try {
            await apiClient.delete(`/iam/roles/${roleId}`)
        } catch (error) {
            console.error('Error deleting role:', error)
            throw error
        }
    }

    /**
     * Get all permissions
     */
    static async getPermissions(): Promise<Permission[]> {
        try {
            const response = await apiClient.get('/iam/permissions')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching permissions:', error)
            throw error
        }
    }

    /**
     * Assign role to user
     */
    static async assignRole(userId: string, roleId: string): Promise<User> {
        try {
            const response = await apiClient.post(`/iam/users/${userId}/roles`, { roleId })
            return (response as any)?.data
        } catch (error) {
            console.error('Error assigning role:', error)
            throw error
        }
    }

    /**
     * Remove role from user
     */
    static async removeRole(userId: string, roleId: string): Promise<User> {
        try {
            const response = await apiClient.delete(`/iam/users/${userId}/roles/${roleId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error removing role:', error)
            throw error
        }
    }

    /**
     * Get user sessions
     */
    static async getUserSessions(userId: string): Promise<Session[]> {
        try {
            const response = await apiClient.get(`/iam/users/${userId}/sessions`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching sessions:', error)
            throw error
        }
    }

    /**
     * Get all active sessions
     */
    static async getActiveSessions(): Promise<Session[]> {
        try {
            const response = await apiClient.get('/iam/sessions/active')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching active sessions:', error)
            throw error
        }
    }

    /**
     * Revoke session
     */
    static async revokeSession(sessionId: string): Promise<void> {
        try {
            await apiClient.delete(`/iam/sessions/${sessionId}`)
        } catch (error) {
            console.error('Error revoking session:', error)
            throw error
        }
    }

    /**
     * Get user permissions
     */
    static async getUserPermissions(userId: string): Promise<Permission[]> {
        try {
            const response = await apiClient.get(`/iam/users/${userId}/permissions`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching user permissions:', error)
            throw error
        }
    }

    /**
     * Check user permission
     */
    static async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
        try {
            const response = await apiClient.post(`/iam/users/${userId}/check-permission`, { resource, action })
            return (response as any)?.data?.hasPermission || false
        } catch (error) {
            console.error('Error checking permission:', error)
            return false
        }
    }

    /**
     * Get user activity log
     */
    static async getUserActivity(userId: string, filters?: { startDate?: string; endDate?: string }): Promise<any[]> {
        try {
            const response = await apiClient.get(`/iam/users/${userId}/activity`, { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching user activity:', error)
            throw error
        }
    }
}

export default IAMService
