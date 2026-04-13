import { apiClient } from '@/services/api/client';

// Integration Gateway Types
export interface Integration {
    _id: string;
    name: string;
    type: 'payment' | 'accounting' | 'email' | 'sms' | 'calendar' | 'access_control' | 'other';
    provider: string;
    status: 'active' | 'inactive' | 'error';
    config: Record<string, any>;
    credentials: Record<string, any>;
    webhookUrl?: string;
    lastSync?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IntegrationCall {
    _id: string;
    integrationId: string;
    method: string;
    endpoint: string;
    requestData?: any;
    responseData?: any;
    status: 'success' | 'failed';
    duration: number;
    error?: string;
    timestamp: Date;
}

export interface Webhook {
    _id: string;
    integrationId: string;
    event: string;
    url: string;
    secret?: string;
    status: 'active' | 'inactive';
    retryCount: number;
    lastTriggered?: Date;
    createdAt: Date;
}

export interface IntegrationHealth {
    integrationId: string;
    status: 'healthy' | 'degraded' | 'down';
    lastCheck: Date;
    uptime: number;
    errorRate: number;
    avgResponseTime: number;
}

export interface IntegrationStats {
    integrationId: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    avgDuration: number;
    period: string;
}

// Integration Gateway Service
class IntegrationGatewayService {
    // Integration Management
    async createIntegration(data: Partial<Integration>): Promise<Integration> {
        const response = await apiClient.post(`/integrations`, data);
        return response;
    }

    async getIntegrations(filters?: {
        type?: string;
        status?: string;
        provider?: string;
    }): Promise<Integration[]> {
        const response = await apiClient.get(`/integrations`, { params: filters });
        return response;
    }

    async getIntegrationById(id: string): Promise<Integration> {
        const response = await apiClient.get(`/integrations/${id}`);
        return response;
    }

    async updateIntegration(id: string, data: Partial<Integration>): Promise<Integration> {
        const response = await apiClient.put(`/integrations/${id}`, data);
        return response;
    }

    async deleteIntegration(id: string): Promise<void> {
        await apiClient.delete(`/integrations/${id}`);
    }

    async testIntegration(id: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post(`/integrations/${id}/test`);
        return response;
    }

    // Integration Calls
    async getIntegrationCalls(integrationId: string, filters?: {
        status?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<IntegrationCall[]> {
        const response = await apiClient.get(`/integrations/${integrationId}/calls`, {
            params: filters
        });
        return response;
    }

    async retryFailedCall(callId: string): Promise<IntegrationCall> {
        const response = await apiClient.post(`/integrations/calls/${callId}/retry`);
        return response;
    }

    // Webhook Management
    async createWebhook(data: Partial<Webhook>): Promise<Webhook> {
        const response = await apiClient.post(`/integrations/webhooks`, data);
        return response;
    }

    async getWebhooks(integrationId?: string): Promise<Webhook[]> {
        const response = await apiClient.get(`/integrations/webhooks`, {
            params: { integrationId }
        });
        return response;
    }

    async updateWebhook(id: string, data: Partial<Webhook>): Promise<Webhook> {
        const response = await apiClient.put(`/integrations/webhooks/${id}`, data);
        return response;
    }

    async deleteWebhook(id: string): Promise<void> {
        await apiClient.delete(`/integrations/webhooks/${id}`);
    }

    async testWebhook(id: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post(`/integrations/webhooks/${id}/test`);
        return response;
    }

    // Health & Monitoring
    async getIntegrationHealth(integrationId: string): Promise<IntegrationHealth> {
        const response = await apiClient.get(`/integrations/${integrationId}/health`);
        return response;
    }

    async getAllIntegrationsHealth(): Promise<IntegrationHealth[]> {
        const response = await apiClient.get(`/integrations/health`);
        return response;
    }

    // Statistics
    async getIntegrationStats(integrationId: string, period: string = '7d'): Promise<IntegrationStats> {
        const response = await apiClient.get(`/integrations/${integrationId}/stats`, {
            params: { period }
        });
        return response;
    }

    // Sync Operations
    async syncIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post(`/integrations/${integrationId}/sync`);
        return response;
    }
}

export default new IntegrationGatewayService();
