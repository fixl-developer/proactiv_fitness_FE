/**
 * Reporting & Analytics Service
 * Handles all reporting and analytics operations
 * Module 6.2 - Phase 6: Safety & Compliance
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum ReportType {
    FINANCIAL = 'financial',
    ATTENDANCE = 'attendance',
    ENROLLMENT = 'enrollment',
    PERFORMANCE = 'performance',
    COMPLIANCE = 'compliance',
    OPERATIONAL = 'operational',
    CUSTOM = 'custom'
}

export enum ReportFormat {
    PDF = 'pdf',
    EXCEL = 'excel',
    CSV = 'csv',
    JSON = 'json'
}

export enum ReportFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    ANNUALLY = 'annually',
    ON_DEMAND = 'on_demand'
}

export interface Report {
    _id: string;
    reportId: string;
    name: string;
    description?: string;
    type: ReportType;
    format: ReportFormat;
    frequency: ReportFrequency;
    parameters: Record<string, any>;
    filters: Record<string, any>;
    businessUnitId?: string;
    locationIds: string[];
    generatedAt: Date;
    generatedBy: string;
    fileUrl?: string;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ReportTemplate {
    _id: string;
    templateId: string;
    name: string;
    description?: string;
    type: ReportType;
    defaultFormat: ReportFormat;
    defaultFrequency: ReportFrequency;
    parameters: {
        name: string;
        type: string;
        required: boolean;
        defaultValue?: any;
        options?: any[];
    }[];
    filters: {
        name: string;
        type: string;
        required: boolean;
    }[];
    isPublic: boolean;
    usageCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ScheduledReport {
    _id: string;
    scheduleId: string;
    reportTemplateId: string;
    name: string;
    frequency: ReportFrequency;
    schedule: {
        dayOfWeek?: number;
        dayOfMonth?: number;
        time: string;
        timezone: string;
    };
    parameters: Record<string, any>;
    filters: Record<string, any>;
    recipients: string[];
    format: ReportFormat;
    isActive: boolean;
    lastRunAt?: Date;
    nextRunAt: Date;
    businessUnitId?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Dashboard {
    _id: string;
    dashboardId: string;
    name: string;
    description?: string;
    widgets: DashboardWidget[];
    layout: {
        columns: number;
        rows: number;
    };
    isPublic: boolean;
    businessUnitId?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DashboardWidget {
    widgetId: string;
    type: 'chart' | 'table' | 'metric' | 'map' | 'list';
    title: string;
    dataSource: string;
    configuration: Record<string, any>;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    refreshInterval?: number;
}

export interface AnalyticsData {
    metric: string;
    value: number;
    change?: number;
    changePercentage?: number;
    trend: 'up' | 'down' | 'stable';
    period: string;
    breakdown?: {
        label: string;
        value: number;
    }[];
}

export interface CreateReportDto {
    name: string;
    description?: string;
    type: ReportType;
    format: ReportFormat;
    parameters: Record<string, any>;
    filters: Record<string, any>;
    businessUnitId?: string;
    locationIds?: string[];
}

export interface CreateScheduledReportDto {
    reportTemplateId: string;
    name: string;
    frequency: ReportFrequency;
    schedule: {
        dayOfWeek?: number;
        dayOfMonth?: number;
        time: string;
        timezone: string;
    };
    parameters: Record<string, any>;
    filters: Record<string, any>;
    recipients: string[];
    format: ReportFormat;
    businessUnitId?: string;
}

export interface ReportFilter {
    type?: ReportType;
    status?: string;
    businessUnitId?: string;
    startDate?: Date;
    endDate?: Date;
    generatedBy?: string;
    page?: number;
    limit?: number;
}

// ============================================================================
// REPORTING SERVICE
// ============================================================================

class ReportingService {
    private readonly baseUrl = '/reporting';

    /**
     * Get all reports
     */
    async getReports(filters?: ReportFilter): Promise<{ data: Report[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.type) params.append('type', filters.type);
            if (filters.status) params.append('status', filters.status);
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters.generatedBy) params.append('generatedBy', filters.generatedBy);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}/reports?${params.toString()}`);
        return response.data;
    }

    /**
     * Get report by ID
     */
    async getReportById(reportId: string): Promise<Report> {
        const response = await apiClient.get(`${this.baseUrl}/reports/${reportId}`);
        return response.data;
    }

    /**
     * Generate report
     */
    async generateReport(data: CreateReportDto): Promise<Report> {
        const response = await apiClient.post(`${this.baseUrl}/reports/generate`, data);
        return response.data;
    }

    /**
     * Download report
     */
    async downloadReport(reportId: string): Promise<Blob> {
        const response = await apiClient.get(`${this.baseUrl}/reports/${reportId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Delete report
     */
    async deleteReport(reportId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/reports/${reportId}`);
    }

    /**
     * Get report templates
     */
    async getReportTemplates(type?: ReportType): Promise<ReportTemplate[]> {
        const params = type ? `?type=${type}` : '';
        const response = await apiClient.get(`${this.baseUrl}/templates${params}`);
        return response.data;
    }

    /**
     * Get template by ID
     */
    async getTemplateById(templateId: string): Promise<ReportTemplate> {
        const response = await apiClient.get(`${this.baseUrl}/templates/${templateId}`);
        return response.data;
    }

    /**
     * Create report template
     */
    async createReportTemplate(data: Partial<ReportTemplate>): Promise<ReportTemplate> {
        const response = await apiClient.post(`${this.baseUrl}/templates`, data);
        return response.data;
    }

    /**
     * Update report template
     */
    async updateReportTemplate(templateId: string, data: Partial<ReportTemplate>): Promise<ReportTemplate> {
        const response = await apiClient.put(`${this.baseUrl}/templates/${templateId}`, data);
        return response.data;
    }

    /**
     * Delete report template
     */
    async deleteReportTemplate(templateId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/templates/${templateId}`);
    }

    /**
     * Get scheduled reports
     */
    async getScheduledReports(businessUnitId?: string): Promise<ScheduledReport[]> {
        const params = businessUnitId ? `?businessUnitId=${businessUnitId}` : '';
        const response = await apiClient.get(`${this.baseUrl}/scheduled${params}`);
        return response.data;
    }

    /**
     * Create scheduled report
     */
    async createScheduledReport(data: CreateScheduledReportDto): Promise<ScheduledReport> {
        const response = await apiClient.post(`${this.baseUrl}/scheduled`, data);
        return response.data;
    }

    /**
     * Update scheduled report
     */
    async updateScheduledReport(scheduleId: string, data: Partial<ScheduledReport>): Promise<ScheduledReport> {
        const response = await apiClient.put(`${this.baseUrl}/scheduled/${scheduleId}`, data);
        return response.data;
    }

    /**
     * Delete scheduled report
     */
    async deleteScheduledReport(scheduleId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/scheduled/${scheduleId}`);
    }

    /**
     * Run scheduled report now
     */
    async runScheduledReport(scheduleId: string): Promise<Report> {
        const response = await apiClient.post(`${this.baseUrl}/scheduled/${scheduleId}/run`);
        return response.data;
    }

    /**
     * Get dashboards
     */
    async getDashboards(businessUnitId?: string): Promise<Dashboard[]> {
        const params = businessUnitId ? `?businessUnitId=${businessUnitId}` : '';
        const response = await apiClient.get(`${this.baseUrl}/dashboards${params}`);
        return response.data;
    }

    /**
     * Get dashboard by ID
     */
    async getDashboardById(dashboardId: string): Promise<Dashboard> {
        const response = await apiClient.get(`${this.baseUrl}/dashboards/${dashboardId}`);
        return response.data;
    }

    /**
     * Create dashboard
     */
    async createDashboard(data: Partial<Dashboard>): Promise<Dashboard> {
        const response = await apiClient.post(`${this.baseUrl}/dashboards`, data);
        return response.data;
    }

    /**
     * Update dashboard
     */
    async updateDashboard(dashboardId: string, data: Partial<Dashboard>): Promise<Dashboard> {
        const response = await apiClient.put(`${this.baseUrl}/dashboards/${dashboardId}`, data);
        return response.data;
    }

    /**
     * Delete dashboard
     */
    async deleteDashboard(dashboardId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/dashboards/${dashboardId}`);
    }

    /**
     * Get analytics data
     */
    async getAnalyticsData(
        metric: string,
        period: string,
        filters?: Record<string, any>
    ): Promise<AnalyticsData> {
        const response = await apiClient.post(`${this.baseUrl}/analytics`, {
            metric,
            period,
            filters
        });
        return response.data;
    }

    /**
     * Get financial summary
     */
    async getFinancialSummary(period: string, businessUnitId?: string): Promise<any> {
        const params = new URLSearchParams();
        params.append('period', period);
        if (businessUnitId) params.append('businessUnitId', businessUnitId);

        const response = await apiClient.get(`${this.baseUrl}/analytics/financial?${params.toString()}`);
        return response.data;
    }

    /**
     * Get enrollment trends
     */
    async getEnrollmentTrends(period: string, businessUnitId?: string): Promise<any> {
        const params = new URLSearchParams();
        params.append('period', period);
        if (businessUnitId) params.append('businessUnitId', businessUnitId);

        const response = await apiClient.get(`${this.baseUrl}/analytics/enrollment?${params.toString()}`);
        return response.data;
    }

    /**
     * Get attendance analytics
     */
    async getAttendanceAnalytics(period: string, businessUnitId?: string): Promise<any> {
        const params = new URLSearchParams();
        params.append('period', period);
        if (businessUnitId) params.append('businessUnitId', businessUnitId);

        const response = await apiClient.get(`${this.baseUrl}/analytics/attendance?${params.toString()}`);
        return response.data;
    }

    /**
     * Get performance metrics
     */
    async getPerformanceMetrics(period: string, businessUnitId?: string): Promise<any> {
        const params = new URLSearchParams();
        params.append('period', period);
        if (businessUnitId) params.append('businessUnitId', businessUnitId);

        const response = await apiClient.get(`${this.baseUrl}/analytics/performance?${params.toString()}`);
        return response.data;
    }

    /**
     * Export analytics data
     */
    async exportAnalytics(
        metric: string,
        period: string,
        format: 'csv' | 'xlsx' = 'csv'
    ): Promise<Blob> {
        const response = await apiClient.post(`${this.baseUrl}/analytics/export`, {
            metric,
            period,
            format
        }, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Get KPI summary
     */
    async getKPISummary(businessUnitId?: string): Promise<{
        revenue: AnalyticsData;
        enrollment: AnalyticsData;
        attendance: AnalyticsData;
        satisfaction: AnalyticsData;
    }> {
        const params = businessUnitId ? `?businessUnitId=${businessUnitId}` : '';
        const response = await apiClient.get(`${this.baseUrl}/kpi${params}`);
        return response.data;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const reportingService = new ReportingService();
export default reportingService;
