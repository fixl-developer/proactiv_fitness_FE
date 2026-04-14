/**
 * Audit Vault Service
 * Handles all audit logging and compliance operations
 * Module 6.1 - Phase 6: Safety & Compliance
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum AuditCategory {
    CONSENT = 'consent',
    CUSTODY = 'custody',
    FINANCIAL = 'financial',
    CERTIFICATION = 'certification',
    AUTOMATION = 'automation',
    IMPERSONATION = 'impersonation',
    AUTHENTICATION = 'authentication',
    AUTHORIZATION = 'authorization',
    DATA_ACCESS = 'data_access',
    SYSTEM = 'system'
}

export enum AuditSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export interface AuditLog {
    _id: string;
    tenantId: string;
    countryId?: string;
    regionId?: string;
    businessUnitId?: string;
    locationId?: string;
    timestamp: Date;
    sequenceNumber: number;
    previousHash?: string;
    currentHash: string;
    actorId: string;
    actorType: 'user' | 'system' | 'api';
    actorEmail?: string;
    actorName?: string;
    actionType: string;
    category: AuditCategory;
    severity: AuditSeverity;
    resourceType: string;
    resourceId: string;
    resourceName?: string;
    context: Record<string, any>;
    metadata: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
        requestId?: string;
        source: string;
        version: string;
    };
    changes?: {
        before?: Record<string, any>;
        after?: Record<string, any>;
        fields: string[];
    };
    retentionCategory: string;
    legalHoldFlag: boolean;
    anonymized: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuditFilter {
    category?: AuditCategory;
    severity?: AuditSeverity;
    actorId?: string;
    resourceType?: string;
    resourceId?: string;
    businessUnitId?: string;
    locationId?: string;
    startDate?: Date;
    endDate?: Date;
    searchText?: string;
    page?: number;
    limit?: number;
}

export interface CreateAuditLogDto {
    actionType: string;
    category: AuditCategory;
    severity: AuditSeverity;
    resourceType: string;
    resourceId: string;
    resourceName?: string;
    context: Record<string, any>;
    changes?: {
        before?: Record<string, any>;
        after?: Record<string, any>;
        fields: string[];
    };
    businessUnitId?: string;
    locationId?: string;
}

export interface AuditStatistics {
    totalLogs: number;
    logsByCategory: Record<AuditCategory, number>;
    logsBySeverity: Record<AuditSeverity, number>;
    topActors: {
        actorId: string;
        actorName: string;
        actionCount: number;
    }[];
    topResources: {
        resourceType: string;
        accessCount: number;
    }[];
    criticalEvents: number;
    legalHoldCount: number;
}

export interface AuditReport {
    reportId: string;
    reportType: string;
    period: string;
    generatedAt: Date;
    summary: {
        totalEvents: number;
        criticalEvents: number;
        complianceScore: number;
    };
    details: any;
}

// ============================================================================
// AUDIT SERVICE
// ============================================================================

class AuditService {
    private readonly baseUrl = '/audit';

    /**
     * Get all audit logs
     */
    async getAuditLogs(filters?: AuditFilter): Promise<{ data: AuditLog[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.category) params.append('category', filters.category);
            if (filters.severity) params.append('severity', filters.severity);
            if (filters.actorId) params.append('actorId', filters.actorId);
            if (filters.resourceType) params.append('resourceType', filters.resourceType);
            if (filters.resourceId) params.append('resourceId', filters.resourceId);
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters.searchText) params.append('searchText', filters.searchText);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}/logs?${params.toString()}`);
        return response.data;
    }

    /**
     * Get audit log by ID
     */
    async getAuditLogById(logId: string): Promise<AuditLog> {
        const response = await apiClient.get(`${this.baseUrl}/logs/${logId}`);
        return response.data;
    }

    /**
     * Create audit log
     */
    async createAuditLog(data: CreateAuditLogDto): Promise<AuditLog> {
        const response = await apiClient.post(`${this.baseUrl}/logs`, data);
        return response.data;
    }

    /**
     * Get audit trail for resource
     */
    async getResourceAuditTrail(resourceType: string, resourceId: string): Promise<AuditLog[]> {
        const response = await this.getAuditLogs({ resourceType, resourceId });
        return response.data;
    }

    /**
     * Get user activity
     */
    async getUserActivity(userId: string, startDate?: Date, endDate?: Date): Promise<AuditLog[]> {
        const response = await this.getAuditLogs({
            actorId: userId,
            startDate,
            endDate
        });
        return response.data;
    }

    /**
     * Get critical events
     */
    async getCriticalEvents(businessUnitId?: string, days: number = 7): Promise<AuditLog[]> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const response = await this.getAuditLogs({
            severity: AuditSeverity.CRITICAL,
            businessUnitId,
            startDate,
            endDate
        });
        return response.data;
    }

    /**
     * Get audit statistics
     */
    async getAuditStatistics(
        businessUnitId?: string,
        dateRange?: { startDate: Date; endDate: Date }
    ): Promise<AuditStatistics> {
        const params = new URLSearchParams();
        if (businessUnitId) params.append('businessUnitId', businessUnitId);
        if (dateRange) {
            params.append('startDate', dateRange.startDate.toISOString());
            params.append('endDate', dateRange.endDate.toISOString());
        }

        const response = await apiClient.get(`${this.baseUrl}/statistics?${params.toString()}`);
        return response.data;
    }

    /**
     * Export audit logs
     */
    async exportAuditLogs(
        filters?: AuditFilter,
        format: 'csv' | 'xlsx' | 'json' = 'csv'
    ): Promise<Blob> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.category) params.append('category', filters.category);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
        }
        params.append('format', format);

        const response = await apiClient.get(`${this.baseUrl}/export?${params.toString()}`, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Generate audit report
     */
    async generateAuditReport(
        reportType: string,
        period: string,
        businessUnitId?: string
    ): Promise<AuditReport> {
        const response = await apiClient.post(`${this.baseUrl}/reports/generate`, {
            reportType,
            period,
            businessUnitId
        });
        return response.data;
    }

    /**
     * Get compliance report
     */
    async getComplianceReport(period: string, businessUnitId?: string): Promise<any> {
        const params = new URLSearchParams();
        params.append('period', period);
        if (businessUnitId) params.append('businessUnitId', businessUnitId);

        const response = await apiClient.get(`${this.baseUrl}/reports/compliance?${params.toString()}`);
        return response.data;
    }

    /**
     * Verify audit chain integrity
     */
    async verifyAuditChain(startDate: Date, endDate: Date): Promise<{ valid: boolean; errors: string[] }> {
        const response = await apiClient.post(`${this.baseUrl}/verify-chain`, {
            startDate,
            endDate
        });
        return response.data;
    }

    /**
     * Set legal hold
     */
    async setLegalHold(logIds: string[], reason: string): Promise<void> {
        await apiClient.post(`${this.baseUrl}/legal-hold`, {
            logIds,
            reason
        });
    }

    /**
     * Remove legal hold
     */
    async removeLegalHold(logIds: string[], reason: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/legal-hold`, {
            data: { logIds, reason }
        });
    }

    /**
     * Get logs with legal hold
     */
    async getLogsWithLegalHold(): Promise<AuditLog[]> {
        const response = await apiClient.get(`${this.baseUrl}/logs/legal-hold`);
        return response.data;
    }

    /**
     * Search audit logs
     */
    async searchAuditLogs(query: string, filters?: Partial<AuditFilter>): Promise<AuditLog[]> {
        const response = await this.getAuditLogs({
            ...filters,
            searchText: query
        });
        return response.data;
    }

    /**
     * Get consent logs
     */
    async getConsentLogs(minorId?: string, guardianId?: string): Promise<AuditLog[]> {
        const filters: AuditFilter = {
            category: AuditCategory.CONSENT
        };

        const response = await this.getAuditLogs(filters);
        return response.data;
    }

    /**
     * Get financial logs
     */
    async getFinancialLogs(transactionId?: string, startDate?: Date, endDate?: Date): Promise<AuditLog[]> {
        const response = await this.getAuditLogs({
            category: AuditCategory.FINANCIAL,
            startDate,
            endDate
        });
        return response.data;
    }

    /**
     * Get impersonation logs
     */
    async getImpersonationLogs(targetUserId?: string): Promise<AuditLog[]> {
        const response = await this.getAuditLogs({
            category: AuditCategory.IMPERSONATION
        });
        return response.data;
    }

    /**
     * Get data access logs
     */
    async getDataAccessLogs(resourceType: string, resourceId: string): Promise<AuditLog[]> {
        const response = await this.getAuditLogs({
            category: AuditCategory.DATA_ACCESS,
            resourceType,
            resourceId
        });
        return response.data;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const auditService = new AuditService();
export default auditService;
