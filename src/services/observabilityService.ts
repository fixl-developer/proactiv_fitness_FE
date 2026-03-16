import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.get(`${API_URL}/observability/logs`, { params: filters });
        return response.data;
    }

    async createLog(data: Partial<Log>): Promise<Log> {
        const response = await axios.post(`${API_URL}/observability/logs`, data);
        return response.data;
    }

    async searchLogs(query: string, filters?: any): Promise<Log[]> {
        const response = await axios.post(`${API_URL}/observability/logs/search`, {
            query,
            ...filters
        });
        return response.data;
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
        const response = await axios.get(`${API_URL}/observability/traces`, { params: filters });
        return response.data;
    }

    async getTraceById(traceId: string): Promise<Trace> {
        const response = await axios.get(`${API_URL}/observability/traces/${traceId}`);
        return response.data;
    }

    async createTrace(data: Partial<Trace>): Promise<Trace> {
        const response = await axios.post(`${API_URL}/observability/traces`, data);
        return response.data;
    }

    // Metrics
    async getMetrics(filters?: {
        name?: string;
        type?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Metric[]> {
        const response = await axios.get(`${API_URL}/observability/metrics`, { params: filters });
        return response.data;
    }

    async recordMetric(data: Partial<Metric>): Promise<Metric> {
        const response = await axios.post(`${API_URL}/observability/metrics`, data);
        return response.data;
    }

    async getMetricStats(name: string, period: string = '1h'): Promise<MetricStats> {
        const response = await axios.get(`${API_URL}/observability/metrics/${name}/stats`, {
            params: { period }
        });
        return response.data;
    }

    // Alerts
    async getAlerts(filters?: {
        severity?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Alert[]> {
        const response = await axios.get(`${API_URL}/observability/alerts`, { params: filters });
        return response.data;
    }

    async createAlert(data: Partial<Alert>): Promise<Alert> {
        const response = await axios.post(`${API_URL}/observability/alerts`, data);
        return response.data;
    }

    async acknowledgeAlert(id: string, userId: string): Promise<Alert> {
        const response = await axios.post(`${API_URL}/observability/alerts/${id}/acknowledge`, {
            userId
        });
        return response.data;
    }

    async resolveAlert(id: string, userId: string, resolution?: string): Promise<Alert> {
        const response = await axios.post(`${API_URL}/observability/alerts/${id}/resolve`, {
            userId,
            resolution
        });
        return response.data;
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
        const response = await axios.get(`${API_URL}/observability/security-events`, {
            params: filters
        });
        return response.data;
    }

    async createSecurityEvent(data: Partial<SecurityEvent>): Promise<SecurityEvent> {
        const response = await axios.post(`${API_URL}/observability/security-events`, data);
        return response.data;
    }

    // Service Health
    async getServiceHealth(service?: string): Promise<ServiceHealth | ServiceHealth[]> {
        const url = service
            ? `${API_URL}/observability/health/${service}`
            : `${API_URL}/observability/health`;
        const response = await axios.get(url);
        return response.data;
    }

    async checkServiceHealth(service: string): Promise<ServiceHealth> {
        const response = await axios.post(`${API_URL}/observability/health/${service}/check`);
        return response.data;
    }

    // Rate Limiting
    async getRateLimitStatus(identifier: string, type: 'ip' | 'user' | 'api_key'): Promise<{
        limit: number;
        remaining: number;
        resetAt: Date;
    }> {
        const response = await axios.get(`${API_URL}/observability/rate-limit/${type}/${identifier}`);
        return response.data;
    }
}

export default new ObservabilityService();
