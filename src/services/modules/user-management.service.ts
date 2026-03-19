import { apiClient } from '../api/client'

interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    status: 'active' | 'inactive' | 'suspended'
    createdAt: string
    lastLogin?: string
}

interface Role {
    id: string
    name: string
    description: string
    permissions: string[]
}

interface Permission {
    id: string
    name: string
    description: string
    module: string
}

interface CreateUserData {
    email: string
    firstName: string
    lastName: string
    role: string
    password: string
}

interface UpdateUserData {
    firstName?: string
    lastName?: string
    role?: string
    status?: 'active' | 'inactive' | 'suspended'
}

class UserManagementService {
    /**
     * Get all users with pagination
     */
    async getAllUsers(page: number = 1, limit: number = 20, filters?: any): Promise<{ users: User[], total: number }> {
        try {
            const response = await apiClient.get('/admin/users', {
                params: { page, limit, ...filters }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching users:', error)
            throw error
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: string): Promise<User> {
        try {
            const response = await apiClient.get(`/admin/users/${userId}`)
            return response.data
        } catch (error) {
            console.error('Error fetching user:', error)
            throw error
        }
    }

    /**
     * Create new user
     */
    async createUser(userData: CreateUserData): Promise<User> {
        try {
            const response = await apiClient.post('/admin/users', userData)
            return response.data
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    }

    /**
     * Update user
     */
    async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
        try {
            const response = await apiClient.put(`/admin/users/${userId}`, userData)
            return response.data
        } catch (error) {
            console.error('Error updating user:', error)
            throw error
        }
    }

    /**
     * Delete user
     */
    async deleteUser(userId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/users/${userId}`)
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    }

    /**
     * Get all roles
     */
    async getAllRoles(): Promise<Role[]> {
        try {
            const response = await apiClient.get('/admin/roles')
            return response.data
        } catch (error) {
            console.error('Error fetching roles:', error)
            throw error
        }
    }

    /**
     * Get role by ID
     */
    async getRoleById(roleId: string): Promise<Role> {
        try {
            const response = await apiClient.get(`/admin/roles/${roleId}`)
            return response.data
        } catch (error) {
            console.error('Error fetching role:', error)
            throw error
        }
    }

    /**
     * Create new role
     */
    async createRole(roleData: Omit<Role, 'id'>): Promise<Role> {
        try {
            const response = await apiClient.post('/admin/roles', roleData)
            return response.data
        } catch (error) {
            console.error('Error creating role:', error)
            throw error
        }
    }

    /**
     * Update role
     */
    async updateRole(roleId: string, roleData: Partial<Role>): Promise<Role> {
        try {
            const response = await apiClient.put(`/admin/roles/${roleId}`, roleData)
            return response.data
        } catch (error) {
            console.error('Error updating role:', error)
            throw error
        }
    }

    /**
     * Delete role
     */
    async deleteRole(roleId: string): Promise<void> {
        try {
            await apiClient.delete(`/admin/roles/${roleId}`)
        } catch (error) {
            console.error('Error deleting role:', error)
            throw error
        }
    }

    /**
     * Get all permissions
     */
    async getAllPermissions(): Promise<Permission[]> {
        try {
            const response = await apiClient.get('/admin/permissions')
            return response.data
        } catch (error) {
            console.error('Error fetching permissions:', error)
            throw error
        }
    }

    /**
     * Update role permissions
     */
    async updateRolePermissions(roleId: string, permissions: string[]): Promise<Role> {
        try {
            const response = await apiClient.put(`/admin/roles/${roleId}/permissions`, { permissions })
            return response.data
        } catch (error) {
            console.error('Error updating role permissions:', error)
            throw error
        }
    }

    /**
     * Get user statistics
     */
    async getUserStatistics() {
        try {
            const response = await apiClient.get('/admin/users/statistics')
            return response.data
        } catch (error) {
            console.error('Error fetching user statistics:', error)
            throw error
        }
    }
}

export default new UserManagementService()
