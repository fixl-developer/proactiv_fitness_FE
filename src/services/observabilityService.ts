import { apiClient } from '@/services/api/client';

// Observability Types
export interface Log {
    _id: string;
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    message: string;
    service: string;
    traceId?: string;
    userId?: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}

export interface Trace {
    _id: string;
    traceId: string;
    name: string;
    service: string;
    duration: number;
    status: 'success' | 'error';
    spans: Span[];
    startTime: Date;
    endTime: Date;
}

export interface Span {
    spanId: string;
    parentSpanId?: string;
    name: string;
    duration: number;
    tags?: Record<string, any>;
    startTime: Date;
    endTime: Date;
}

export interface Metric {
    _id: string;
    name: string;
    type: 'counter' | 'gauge' | 'histogram';
    value: number;
    tags?: Record<string, string>;
    timestamp: Date;
}

export interface Alert {
    _id: string;
    name: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    condition: string;
    threshold: number;
    status: 'active' | 'acknowledged' | 'resolved';
    triggeredAt?: Date;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
    message?: string;
    createdAt: Date;
}

export interface SecurityEvent {
    _id: string;
    type: 'login_attempt' | 'unauthorized_access' | 'suspicious_activity' | 'data_breach' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    details: Record<string, any>;
    timestamp: Date;
}

export interface ServiceHealth {
    service: string;
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    lastCheck: Date;
    responseTime: number;
}

export interface MetricStats {
    name: string;
    average: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
    count: number;
    period: string;
}

// Observability Service
class ObservabilityService {
    // Logging
    async getLogs(filters?: {
        level?: string;
        service?: string;
        traceId?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<Log[]> {
        const response = await apiClient.get(`/observability/logs`, { params: filters });
        return response;
    }

    async createLog(data: Partial<Log>): Promise<Log> {
        const response = await apiClient.post(`/observability/logs`, data);
        return response;
    }

    async searchLogs(query: string, filters?: any): Promise<Log[]> {
        const response = await apiClient.post(`/observability/logs/search`, {
            query,
            ...filters
        });
        return response;
    }

    // Tracing
    async getTraces(filters?: {
        service?: string;
        status?: string;
        minDuration?: number;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<Trace[]> {
        const response = await apiClient.get(`/observability/traces`, { params: filters });
        return response;
    }

    async getTraceById(traceId: string): Promise<Trace> {
        const response = await apiClient.get(`/observability/traces/${traceId}`);
        return response;
    }

    async createTrace(data: Partial<Trace>): Promise<Trace> {
        const response = await apiClient.post(`/observability/traces`, data);
        return response;
    }

    // Metrics
    async getMetrics(filters?: {
        name?: string;
        type?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Metric[]> {
        const response = await apiClient.get(`/observability/metrics`, { params: filters });
        return response;
    }

    async recordMetric(data: Partial<Metric>): Promise<Metric> {
        const response = await apiClient.post(`/observability/metrics`, data);
        return response;
    }

    async getMetricStats(name: string, period: string = '1h'): Promise<MetricStats> {
        const response = await apiClient.get(`/observability/metrics/${name}/stats`, {
            params: { period }
        });
        return response;
    }

    // Alerts
    async getAlerts(filters?: {
        severity?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Alert[]> {
        const response = await apiClient.get(`/observability/alerts`, { params: filters });
        return response;
    }

    async createAlert(data: Partial<Alert>): Promise<Alert> {
        const response = await apiClient.post(`/observability/alerts`, data);
        return response;
    }

    async acknowledgeAlert(id: string, userId: string): Promise<Alert> {
        const response = await apiClient.post(`/observability/alerts/${id}/acknowledge`, {
            userId
        });
        return response;
    }

    async resolveAlert(id: string, userId: string, resolution?: string): Promise<Alert> {
        const response = await apiClient.post(`/observability/alerts/${id}/resolve`, {
            userId,
            resolution
        });
        return response;
    }

    // Security Events
    async getSecurityEvents(filters?: {
        type?: string;
        severity?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<SecurityEvent[]> {
        const response = await apiClient.get(`/observability/security-events`, {
            params: filters
        });
        return response;
    }

    async createSecurityEvent(data: Partial<SecurityEvent>): Promise<SecurityEvent> {
        const response = await apiClient.post(`/observability/security-events`, data);
        return response;
    }

    // Service Health
    async getServiceHealth(service?: string): Promise<ServiceHealth | ServiceHealth[]> {
        const url = service
            ? `/observability/health/${service}`
            : `/observability/health`;
        const response = await apiClient.get(url);
        return response;
    }

    async checkServiceHealth(service: string): Promise<ServiceHealth> {
        const response = await apiClient.post(`/observability/health/${service}/check`);
        return response;
    }

    // Rate Limiting
    async getRateLimitStatus(identifier: string, type: 'ip' | 'user' | 'api_key'): Promise<{
        limit: number;
        remaining: number;
        resetAt: Date;
    }> {
        const response = await apiClient.get(`/observability/rate-limit/${type}/${identifier}`);
        return response;
    }
}

export default new ObservabilityService();
