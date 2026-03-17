import { apiClient } from '../api/client'

export interface AuditLog {
    action: string
    module: string
    userId?: string
    userEmail?: string
    status: 'success' | 'error' | 'warning'
    details?: any
    error?: string
    timestamp: number
    ipAddress?: string
    userAgent?: string
}

class AuditLogger {
    private readonly MODULE_NAME = 'audit-vault'
    private logQueue: AuditLog[] = []
    private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.isOnline = true
                this.flushQueue()
            })
            window.addEventListener('offline', () => {
                this.isOnline = false
            })
        }
    }

    private getUserInfo() {
        try {
            const user = localStorage.getItem('user')
            if (user) {
                const userData = JSON.parse(user)
                return {
                    userId: userData.id,
                    userEmail: userData.email
                }
            }
        } catch (e) {
            // Ignore parsing errors
        }
        return { userId: undefined, userEmail: undefined }
    }

    private async sendLog(log: AuditLog): Promise<void> {
        try {
            await apiClient.post('/audit/logs', log)
        } catch (error: any) {
            // Silently fail for audit logs - don't block user operations
            // If backend endpoint doesn't exist, just log locally
            if (error.response?.status === 404) {
                console.debug('[AUDIT] Endpoint not available, logging locally only')
                return
            }
            console.debug('[AUDIT] Failed to send log:', error.message)
            // Queue for retry only on network errors, not 404s
            if (error.response?.status !== 404) {
                this.logQueue.push(log)
            }
        }
    }

    private async flushQueue(): Promise<void> {
        if (!this.isOnline || this.logQueue.length === 0) {
            return
        }

        const queue = [...this.logQueue]
        this.logQueue = []

        for (const log of queue) {
            await this.sendLog(log)
        }
    }

    async log(auditLog: Omit<AuditLog, 'timestamp' | 'userAgent' | 'ipAddress'>): Promise<void> {
        const { userId, userEmail } = this.getUserInfo()

        const log: AuditLog = {
            ...auditLog,
            userId: auditLog.userId || userId,
            userEmail: auditLog.userEmail || userEmail,
            timestamp: Date.now(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
        }

        console.log('[AUDIT]', log)

        if (this.isOnline) {
            await this.sendLog(log)
        } else {
            this.logQueue.push(log)
        }
    }

    async logLogin(email: string, success: boolean, error?: string): Promise<void> {
        await this.log({
            action: 'LOGIN',
            module: this.MODULE_NAME,
            userEmail: email,
            status: success ? 'success' : 'error',
            error,
            details: { email }
        })
    }

    async logLogout(userId: string): Promise<void> {
        await this.log({
            action: 'LOGOUT',
            module: this.MODULE_NAME,
            userId,
            status: 'success'
        })
    }

    async logRegistration(email: string, success: boolean, error?: string): Promise<void> {
        await this.log({
            action: 'REGISTRATION',
            module: this.MODULE_NAME,
            userEmail: email,
            status: success ? 'success' : 'error',
            error,
            details: { email }
        })
    }

    async logModuleAccess(module: string, action: string, success: boolean, error?: string): Promise<void> {
        await this.log({
            action: `MODULE_ACCESS_${action}`,
            module,
            status: success ? 'success' : 'error',
            error
        })
    }

    async logError(error: any): Promise<void> {
        await this.log({
            action: 'ERROR',
            module: error.module || 'UNKNOWN',
            status: 'error',
            error: error.message,
            details: {
                type: error.type,
                statusCode: error.statusCode,
                details: error.details
            }
        })
    }

    async logApiCall(method: string, endpoint: string, statusCode: number, duration: number): Promise<void> {
        await this.log({
            action: `API_CALL_${method}`,
            module: 'API',
            status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
            details: {
                endpoint,
                statusCode,
                duration
            }
        })
    }

    async logDataAccess(module: string, action: string, resourceId?: string): Promise<void> {
        await this.log({
            action: `DATA_ACCESS_${action}`,
            module,
            status: 'success',
            details: { resourceId }
        })
    }

    async logUnauthorizedAccess(module: string, action: string, reason: string): Promise<void> {
        await this.log({
            action: `UNAUTHORIZED_ACCESS_${action}`,
            module,
            status: 'warning',
            error: reason
        })
    }

    getQueueSize(): number {
        return this.logQueue.length
    }

    isConnected(): boolean {
        return this.isOnline
    }
}

export const auditLogger = new AuditLogger()
export default AuditLogger
