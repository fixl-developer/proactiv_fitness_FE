import { apiClient } from '../lib/api'

// Super Admin Dashboard Types
export interface SuperAdminDashboard {
    totalUsers: number
    activeUsers: number
    totalRevenue: number
    systemUptime: number
    totalTransactions: number
    errorRate: number
    responseTime: number
    databaseSize: number
    storageUsed: number
    cpuUsage: number
    memoryUsage: number
    networkTraffic: number
}

export interface SystemHealth {
    status: 'healthy' | 'warning' | 'critical'
    services: {
        name: string
        status: 'healthy' | 'warning' | 'critical'
        uptime: number
        responseTime?: number
        lastCheck?: string
    }[]
    alerts: {
        id: string
        type: 'info' | 'warning' | 'error' | 'critical'
        message: string
        timestamp: string
        resolved: boolean
    }[]
}

export interface SystemUser {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    status: 'active' | 'inactive' | 'suspended' | 'pending'
    lastLogin: string
    createdAt: string
    permissions: string[]
    loginAttempts: number
    twoFactorEnabled: boolean
}

export interface UserRole {
    id: string
    name: string
    description: string
    permissions: string[]
    userCount: number
    isSystem: boolean
    createdAt: string
    updatedAt: string
}

export interface SecurityEvent {
    id: string
    type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_access' | 'system_change'
    userId: string
    userEmail: string
    ipAddress: string
    userAgent: string
    timestamp: string
    details: any
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface DatabaseMetrics {
    totalSize: number
    usedSpace: number
    freeSpace: number
    totalTables: number
    totalRecords: number
    queryPerformance: {
        avgQueryTime: number
        slowQueries: number
        totalQueries: number
    }
    connections: {
        active: number
        idle: number
        max: number
    }
    backupStatus: {
        lastBackup: string
        nextBackup: string
        backupSize: number
        status: 'success' | 'failed' | 'in_progress'
    }
}

export interface SystemLog {
    id: string
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
    message: string
    timestamp: string
    source: string
    userId?: string
    metadata?: any
    stackTrace?: string
}

export interface PlatformSettings {
    general: {
        siteName: string
        siteUrl: string
        adminEmail: string
        timezone: string
        language: string
        maintenanceMode: boolean
    }
    security: {
        passwordPolicy: {
            minLength: number
            requireUppercase: boolean
            requireLowercase: boolean
            requireNumbers: boolean
            requireSpecialChars: boolean
            expirationDays: number
        }
        sessionTimeout: number
        maxLoginAttempts: number
        twoFactorRequired: boolean
        ipWhitelist: string[]
    }
    features: {
        [key: string]: boolean
    }
    integrations: {
        email: {
            provider: string
            apiKey: string
            fromEmail: string
            enabled: boolean
        }
        sms: {
            provider: string
            apiKey: string
            fromNumber: string
            enabled: boolean
        }
        payment: {
            stripe: {
                publicKey: string
                secretKey: string
                webhookSecret: string
                enabled: boolean
            }
            paypal: {
                clientId: string
                clientSecret: string
                enabled: boolean
            }
        }
    }
}

class SuperAdminService {
    // Dashboard Methods
    async getDashboardData(): Promise<SuperAdminDashboard> {
        try {
            const response = await apiClient.get<{ success: boolean; data: SuperAdminDashboard }>('/superadmin/dashboard')
            return response.data || response
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            throw error
        }
    }

    async getSystemHealth(): Promise<SystemHealth> {
        try {
            const response = await apiClient.get<{ success: boolean; data: SystemHealth }>('/superadmin/system/health')
            return response.data || response
        } catch (error) {
            console.error('Error fetching system health:', error)
            throw error
        }
    }

    // User Management Methods
    async getAllUsers(filters?: any): Promise<{ users: SystemUser[]; total: number; pages: number }> {
        try {
            const params = new URLSearchParams()
            if (filters?.role) params.append('role', filters.role)
            if (filters?.status) params.append('status', filters.status)
            if (filters?.search) params.append('search', filters.search)
            if (filters?.page) params.append('page', filters.page.toString())
            if (filters?.limit) params.append('limit', filters.limit.toString())

            const response = await apiClient.get<{ success: boolean; data: any }>(`/superadmin/users?${params.toString()}`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching users:', error)
            throw error
        }
    }

    async createUser(userData: Partial<SystemUser>): Promise<SystemUser> {
        try {
            const response = await apiClient.post<{ success: boolean; data: SystemUser }>('/superadmin/users', userData)
            return response.data || response
        } catch (error) {
            console.error('Error creating user:', error)
            throw error
        }
    }

    async updateUser(userId: string, updates: Partial<SystemUser>): Promise<SystemUser> {
        try {
            const response = await apiClient.put<{ success: boolean; data: SystemUser }>(`/superadmin/users/${userId}`, updates)
            return response.data || response
        } catch (error) {
            console.error('Error updating user:', error)
            throw error
        }
    }

    async deleteUser(userId: string): Promise<void> {
        try {
            await apiClient.delete(`/superadmin/users/${userId}`)
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    }

    async suspendUser(userId: string, reason: string): Promise<void> {
        try {
            await apiClient.post(`/superadmin/users/${userId}/suspend`, { reason })
        } catch (error) {
            console.error('Error suspending user:', error)
            throw error
        }
    }

    async activateUser(userId: string): Promise<void> {
        try {
            await apiClient.post(`/superadmin/users/${userId}/activate`)
        } catch (error) {
            console.error('Error activating user:', error)
            throw error
        }
    }

    // Role Management Methods
    async getAllRoles(): Promise<UserRole[]> {
        try {
            const response = await apiClient.get<{ success: boolean; data: UserRole[] }>('/superadmin/roles')
            return response.data || response
        } catch (error) {
            console.error('Error fetching roles:', error)
            throw error
        }
    }

    async createRole(roleData: Partial<UserRole>): Promise<UserRole> {
        try {
            const response = await apiClient.post<{ success: boolean; data: UserRole }>('/superadmin/roles', roleData)
            return response.data || response
        } catch (error) {
            console.error('Error creating role:', error)
            throw error
        }
    }

    async updateRole(roleId: string, updates: Partial<UserRole>): Promise<UserRole> {
        try {
            const response = await apiClient.put<{ success: boolean; data: UserRole }>(`/superadmin/roles/${roleId}`, updates)
            return response.data || response
        } catch (error) {
            console.error('Error updating role:', error)
            throw error
        }
    }

    async deleteRole(roleId: string): Promise<void> {
        try {
            await apiClient.delete(`/superadmin/roles/${roleId}`)
        } catch (error) {
            console.error('Error deleting role:', error)
            throw error
        }
    }

    // Security Methods
    async getSecurityEvents(filters?: any): Promise<{ events: SecurityEvent[]; total: number }> {
        try {
            const params = new URLSearchParams()
            if (filters?.type) params.append('type', filters.type)
            if (filters?.riskLevel) params.append('riskLevel', filters.riskLevel)
            if (filters?.userId) params.append('userId', filters.userId)
            if (filters?.startDate) params.append('startDate', filters.startDate)
            if (filters?.endDate) params.append('endDate', filters.endDate)

            const response = await apiClient.get<{ success: boolean; data: any }>(`/superadmin/security/events?${params.toString()}`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching security events:', error)
            throw error
        }
    }

    async getSecurityDashboard(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/security/dashboard')
            return response.data || response
        } catch (error) {
            console.error('Error fetching security dashboard:', error)
            throw error
        }
    }

    // Database Methods
    async getDatabaseMetrics(): Promise<DatabaseMetrics> {
        try {
            const response = await apiClient.get<{ success: boolean; data: DatabaseMetrics }>('/superadmin/database/metrics')
            return response.data || response
        } catch (error) {
            console.error('Error fetching database metrics:', error)
            throw error
        }
    }

    async createBackup(): Promise<any> {
        try {
            const response = await apiClient.post<{ success: boolean; data: any }>('/superadmin/database/backup')
            return response.data || response
        } catch (error) {
            console.error('Error creating backup:', error)
            throw error
        }
    }

    async restoreBackup(backupId: string): Promise<any> {
        try {
            const response = await apiClient.post<{ success: boolean; data: any }>(`/superadmin/database/restore/${backupId}`)
            return response.data || response
        } catch (error) {
            console.error('Error restoring backup:', error)
            throw error
        }
    }

    // System Logs Methods
    async getSystemLogs(filters?: any): Promise<{ logs: SystemLog[]; total: number }> {
        try {
            const params = new URLSearchParams()
            if (filters?.level) params.append('level', filters.level)
            if (filters?.source) params.append('source', filters.source)
            if (filters?.startDate) params.append('startDate', filters.startDate)
            if (filters?.endDate) params.append('endDate', filters.endDate)
            if (filters?.search) params.append('search', filters.search)

            const response = await apiClient.get<{ success: boolean; data: any }>(`/superadmin/logs?${params.toString()}`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching system logs:', error)
            throw error
        }
    }

    // Platform Settings Methods
    async getPlatformSettings(): Promise<PlatformSettings> {
        try {
            const response = await apiClient.get<{ success: boolean; data: PlatformSettings }>('/superadmin/platform/settings')
            return response.data || response
        } catch (error) {
            console.error('Error fetching platform settings:', error)
            throw error
        }
    }

    async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
        try {
            const response = await apiClient.put<{ success: boolean; data: PlatformSettings }>('/superadmin/platform/settings', settings)
            return response.data || response
        } catch (error) {
            console.error('Error updating platform settings:', error)
            throw error
        }
    }

    // System Control Methods
    async enableMaintenanceMode(message?: string): Promise<void> {
        try {
            await apiClient.post('/superadmin/system/maintenance/enable', { message })
        } catch (error) {
            console.error('Error enabling maintenance mode:', error)
            throw error
        }
    }

    async disableMaintenanceMode(): Promise<void> {
        try {
            await apiClient.post('/superadmin/system/maintenance/disable')
        } catch (error) {
            console.error('Error disabling maintenance mode:', error)
            throw error
        }
    }

    async clearCache(cacheType?: string): Promise<void> {
        try {
            await apiClient.post('/superadmin/system/cache/clear', { type: cacheType })
        } catch (error) {
            console.error('Error clearing cache:', error)
            throw error
        }
    }

    async restartService(serviceName: string): Promise<void> {
        try {
            await apiClient.post(`/superadmin/system/services/${serviceName}/restart`)
        } catch (error) {
            console.error('Error restarting service:', error)
            throw error
        }
    }

    // Analytics Methods
    async getGlobalAnalytics(period: string = '30d'): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>(`/superadmin/analytics/global?period=${period}`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching global analytics:', error)
            throw error
        }
    }

    async getUserAnalytics(period: string = '30d'): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>(`/superadmin/analytics/users?period=${period}`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching user analytics:', error)
            throw error
        }
    }

    async getPerformanceAnalytics(period: string = '24h'): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>(`/superadmin/analytics/performance?period=${period}`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching performance analytics:', error)
            throw error
        }
    }

    // Monitoring Methods
    async getSystemMetrics(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/monitoring/metrics')
            return response.data || response
        } catch (error) {
            console.error('Error fetching system metrics:', error)
            throw error
        }
    }

    async getAlerts(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/monitoring/alerts')
            return response.data || response
        } catch (error) {
            console.error('Error fetching alerts:', error)
            throw error
        }
    }

    async acknowledgeAlert(alertId: string): Promise<void> {
        try {
            await apiClient.post(`/superadmin/monitoring/alerts/${alertId}/acknowledge`)
        } catch (error) {
            console.error('Error acknowledging alert:', error)
            throw error
        }
    }

    async resolveAlert(alertId: string): Promise<void> {
        try {
            await apiClient.post(`/superadmin/monitoring/alerts/${alertId}/resolve`)
        } catch (error) {
            console.error('Error resolving alert:', error)
            throw error
        }
    }

    // System Management Methods
    async getSystemOverview(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/system/overview')
            return response.data || response
        } catch (error) {
            console.error('Error fetching system overview:', error)
            throw error
        }
    }

    async getServerStatus(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/system/servers')
            return response.data || response
        } catch (error) {
            console.error('Error fetching server status:', error)
            throw error
        }
    }

    async getPerformanceMetrics(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/system/performance')
            return response.data || response
        } catch (error) {
            console.error('Error fetching performance metrics:', error)
            throw error
        }
    }

    async getResourceUsage(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/system/resources')
            return response.data || response
        } catch (error) {
            console.error('Error fetching resource usage:', error)
            throw error
        }
    }

    async getSystemHealthStatus(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/system/health-status')
            return response.data || response
        } catch (error) {
            console.error('Error fetching system health status:', error)
            throw error
        }
    }

    // Monitoring Methods
    async getRealtimeMetrics(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/monitoring/realtime')
            return response.data || response
        } catch (error) {
            console.error('Error fetching realtime metrics:', error)
            throw error
        }
    }

    async getApplicationPerformance(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/monitoring/performance')
            return response.data || response
        } catch (error) {
            console.error('Error fetching application performance:', error)
            throw error
        }
    }

    // Integration Methods
    async getIntegrations(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/integrations')
            return response.data || response
        } catch (error) {
            console.error('Error fetching integrations:', error)
            throw error
        }
    }

    async getWebhooks(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/integrations/webhooks')
            return response.data || response
        } catch (error) {
            console.error('Error fetching webhooks:', error)
            throw error
        }
    }

    async getPaymentGateways(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/integrations/payments')
            return response.data || response
        } catch (error) {
            console.error('Error fetching payment gateways:', error)
            throw error
        }
    }

    async getEmailServices(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/integrations/email')
            return response.data || response
        } catch (error) {
            console.error('Error fetching email services:', error)
            throw error
        }
    }

    async getSMSServices(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/integrations/sms')
            return response.data || response
        } catch (error) {
            console.error('Error fetching SMS services:', error)
            throw error
        }
    }

    // Backup Methods
    async getBackupSchedules(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/backups/schedules')
            return response.data || response
        } catch (error) {
            console.error('Error fetching backup schedules:', error)
            throw error
        }
    }

    // Analytics Methods
    async getCostAnalytics(period: string = '30d'): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>(`/superadmin/analytics/cost?period=${period}`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching cost analytics:', error)
            throw error
        }
    }

    async getHealthPredictions(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/analytics/health-predictions')
            return response.data || response
        } catch (error) {
            console.error('Error fetching health predictions:', error)
            throw error
        }
    }

    // Compliance Methods
    async getComplianceStatus(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/compliance/status')
            return response.data || response
        } catch (error) {
            console.error('Error fetching compliance status:', error)
            throw error
        }
    }

    // Rate Limiting Methods
    async getRateLimits(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/rate-limits')
            return response.data || response
        } catch (error) {
            console.error('Error fetching rate limits:', error)
            throw error
        }
    }

    // Email Templates Methods
    async getEmailTemplates(): Promise<any> {
        try {
            const response = await apiClient.get<{ success: boolean; data: any }>('/superadmin/email-templates')
            return response.data || response
        } catch (error) {
            console.error('Error fetching email templates:', error)
            throw error
        }
    }

    // Notification Methods
    async getNotifications(filters?: any): Promise<any> {
        try {
            const params = new URLSearchParams()
            if (filters?.type) params.append('type', filters.type)
            if (filters?.status) params.append('status', filters.status)

            const response = await apiClient.get<{ success: boolean; data: any }>(`/superadmin/notifications?${params.toString()}`)
            return response.data || response
        } catch (error) {
            console.error('Error fetching notifications:', error)
            throw error
        }
    }
}

export const superAdminService = new SuperAdminService()