// Observability & Monitoring types

export interface SystemLog {
    id: string;
    level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
    message: string;
    service: string;
    timestamp: string;
    metadata?: Record<string, any>;
    traceId?: string;
}

export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: string;
    tags?: Record<string, string>;
}

export interface Alert {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'acknowledged' | 'resolved';
    triggeredAt: string;
    acknowledgedAt?: string;
    resolvedAt?: string;
    source: string;
}

export interface SecurityEvent {
    id: string;
    type: 'login_attempt' | 'unauthorized_access' | 'data_breach' | 'suspicious_activity';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    userId?: string;
    ipAddress: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface TraceData {
    id: string;
    name: string;
    duration: number;
    startTime: string;
    endTime: string;
    spans: TraceSpan[];
    status: 'success' | 'error';
}

export interface TraceSpan {
    id: string;
    name: string;
    duration: number;
    startTime: string;
    endTime: string;
    tags?: Record<string, string>;
}

export interface UptimeStatus {
    status: 'up' | 'down' | 'degraded';
    uptime: number;
    lastCheck: string;
    services: ServiceStatus[];
}

export interface ServiceStatus {
    name: string;
    status: 'up' | 'down';
    responseTime: number;
}
