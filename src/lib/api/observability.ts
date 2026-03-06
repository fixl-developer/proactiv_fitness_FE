import axios from 'axios';
import type {
    SystemLog,
    PerformanceMetric,
    Alert,
    SecurityEvent,
    TraceData,
} from '@/types/observability';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// System Logs
export const getSystemLogs = async (filters?: any): Promise<SystemLog[]> => {
    const response = await axios.get(`${API_URL}/observability/logs`, { params: filters });
    return response.data;
};

// Performance Metrics
export const getPerformanceMetrics = async (
    period: string
): Promise<PerformanceMetric[]> => {
    const response = await axios.get(`${API_URL}/observability/metrics`, {
        params: { period },
    });
    return response.data;
};

// Alerts
export const getAlerts = async (): Promise<Alert[]> => {
    const response = await axios.get(`${API_URL}/observability/alerts`);
    return response.data;
};

export const acknowledgeAlert = async (alertId: string): Promise<void> => {
    await axios.post(`${API_URL}/observability/alerts/${alertId}/acknowledge`);
};

export const resolveAlert = async (alertId: string): Promise<void> => {
    await axios.post(`${API_URL}/observability/alerts/${alertId}/resolve`);
};

// Security Events
export const getSecurityEvents = async (): Promise<SecurityEvent[]> => {
    const response = await axios.get(`${API_URL}/observability/security-events`);
    return response.data;
};

// Traces
export const getTraces = async (filters?: any): Promise<TraceData[]> => {
    const response = await axios.get(`${API_URL}/observability/traces`, { params: filters });
    return response.data;
};

export const getTrace = async (traceId: string): Promise<TraceData> => {
    const response = await axios.get(`${API_URL}/observability/traces/${traceId}`);
    return response.data;
};

// Uptime
export const getUptimeStatus = async (): Promise<any> => {
    const response = await axios.get(`${API_URL}/observability/uptime`);
    return response.data;
};
