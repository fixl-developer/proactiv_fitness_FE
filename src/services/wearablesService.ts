import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/wearables/devices`, data);
        return response.data;
    }

    async listDevices(studentId: string, tenantId: string) {
        const response = await axios.get(`${API_URL}/wearables/devices`, {
            params: { studentId, tenantId },
        });
        return response.data;
    }

    async disconnectDevice(deviceId: string) {
        const response = await axios.delete(`${API_URL}/wearables/devices/${deviceId}`);
        return response.data;
    }

    async syncDevice(deviceId: string) {
        const response = await axios.post(`${API_URL}/wearables/devices/${deviceId}/sync`);
        return response.data;
    }

    async recordMetric(data: HealthMetric) {
        const response = await axios.post(`${API_URL}/wearables/metrics`, data);
        return response.data;
    }

    async getMetrics(filters: {
        studentId: string;
        tenantId: string;
        metricType?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }) {
        const response = await axios.get(`${API_URL}/wearables/metrics`, {
            params: filters,
        });
        return response.data;
    }

    async getAggregatedMetrics(studentId: string, tenantId: string, metricType: string, period: 'day' | 'week' | 'month') {
        const response = await axios.get(`${API_URL}/wearables/metrics/aggregated`, {
            params: { studentId, tenantId, metricType, period },
        });
        return response.data;
    }

    async getRecoveryScore(studentId: string, tenantId: string) {
        const response = await axios.get(`${API_URL}/wearables/recovery-score`, {
            params: { studentId, tenantId },
        });
        return response.data;
    }

    async checkGeofence(studentId: string, latitude: number, longitude: number) {
        const response = await axios.post(`${API_URL}/wearables/geofence/check`, {
            studentId,
            latitude,
            longitude,
        });
        return response.data;
    }
}

export default new WearablesService();
