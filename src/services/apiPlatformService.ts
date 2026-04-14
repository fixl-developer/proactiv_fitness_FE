import { apiClient } from '@/services/api/client';

export interface ApiKey {
    _id: string;
    name: string;
    key: string;
    tenantId: string;
    permissions: string[];
    rateLimit: { requestsPerMinute: number; requestsPerDay: number };
    status: 'active' | 'revoked' | 'expired';
    lastUsed?: Date;
    expiresAt?: Date;
    createdAt: Date;
}

export interface ApiEndpoint {
    _id: string;
    path: string;
    method: string;
    category: string;
    description: string;
    authentication: string;
    deprecated: boolean;
    version: string;
}

export interface ApiLog {
    _id: string;
    apiKeyId: string;
    endpoint: string;
    method: string;
    statusCode: number;
    duration: number;
    timestamp: Date;
}

export interface Webhook {
    _id: string;
    tenantId: string;
    url: string;
    events: string[];
    secret: string;
    status: 'active' | 'inactive';
    lastTriggered?: Date;
    createdAt: Date;
}

class ApiPlatformService {
    async createApiKey(data: Partial<ApiKey>): Promise<ApiKey> {
        const response = await apiClient.post(`/api-platform/keys`, data);
        return response.data;
    }

    async getApiKeys(): Promise<ApiKey[]> {
        const response = await apiClient.get(`/api-platform/keys`);
        return response.data;
    }

    async revokeApiKey(id: string): Promise<void> {
        await apiClient.delete(`/api-platform/keys/${id}`);
    }

    async getEndpoints(category?: string): Promise<ApiEndpoint[]> {
        const response = await apiClient.get(`/api-platform/endpoints`, {
            params: { category }
        });
        return response.data;
    }

    async getApiLogs(filters?: any): Promise<ApiLog[]> {
        const response = await apiClient.get(`/api-platform/logs`, { params: filters });
        return response.data;
    }

    async getApiUsage(period: string = '7d'): Promise<any> {
        const response = await apiClient.get(`/api-platform/usage`, { params: { period } });
        return response.data;
    }

    async createWebhook(data: Partial<Webhook>): Promise<Webhook> {
        const response = await apiClient.post(`/api-platform/webhooks`, data);
        return response.data;
    }

    async getWebhooks(): Promise<Webhook[]> {
        const response = await apiClient.get(`/api-platform/webhooks`);
        return response.data;
    }

    async testWebhook(id: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post(`/api-platform/webhooks/${id}/test`);
        return response.data;
    }

    async deleteWebhook(id: string): Promise<void> {
        await apiClient.delete(`/api-platform/webhooks/${id}`);
    }
}

export default new ApiPlatformService();
