import { apiClient } from '@/services/api/client';

export interface WearableDevice {
    deviceId?: string;
    studentId: string;
    tenantId: string;
    deviceType: 'apple-watch' | 'fitbit' | 'garmin' | 'other';
    deviceName: string;
    isConnected?: boolean;
    lastSyncedAt?: Date;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    permissions: {
        heartRate: boolean;
        steps: boolean;
        calories: boolean;
        sleep: boolean;
        workouts: boolean;
    };
}

export interface HealthMetric {
    studentId: string;
    tenantId: string;
    deviceId: string;
    metricType: 'heart-rate' | 'steps' | 'calories' | 'sleep' | 'workout' | 'recovery';
    value: number;
    unit: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

class WearablesService {
    async connectDevice(data: WearableDevice) {
        const response = await apiClient.post(`/wearables/devices`, data);
        return response;
    }

    async listDevices(studentId: string, tenantId: string) {
        const response = await apiClient.get(`/wearables/devices`, {
            params: { studentId, tenantId },
        });
        return response;
    }

    async disconnectDevice(deviceId: string) {
        const response = await apiClient.delete(`/wearables/devices/${deviceId}`);
        return response;
    }

    async syncDevice(deviceId: string) {
        const response = await apiClient.post(`/wearables/devices/${deviceId}/sync`);
        return response;
    }

    async recordMetric(data: HealthMetric) {
        const response = await apiClient.post(`/wearables/metrics`, data);
        return response;
    }

    async getMetrics(filters: {
        studentId: string;
        tenantId: string;
        metricType?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }) {
        const response = await apiClient.get(`/wearables/metrics`, {
            params: filters,
        });
        return response;
    }

    async getAggregatedMetrics(studentId: string, tenantId: string, metricType: string, period: 'day' | 'week' | 'month') {
        const response = await apiClient.get(`/wearables/metrics/aggregated`, {
            params: { studentId, tenantId, metricType, period },
        });
        return response;
    }

    async getRecoveryScore(studentId: string, tenantId: string) {
        const response = await apiClient.get(`/wearables/recovery-score`, {
            params: { studentId, tenantId },
        });
        return response;
    }

    async checkGeofence(studentId: string, latitude: number, longitude: number) {
        const response = await apiClient.post(`/wearables/geofence/check`, {
            studentId,
            latitude,
            longitude,
        });
        return response;
    }
}

export default new WearablesService();
