import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/integrations`, data);
        return response.data;
    }

    async getIntegrations(filters?: {
        type?: string;
        status?: string;
        provider?: string;
    }): Promise<Integration[]> {
        const response = await axios.get(`${API_URL}/integrations`, { params: filters });
        return response.data;
    }

    async getIntegrationById(id: string): Promise<Integration> {
        const response = await axios.get(`${API_URL}/integrations/${id}`);
        return response.data;
    }

    async updateIntegration(id: string, data: Partial<Integration>): Promise<Integration> {
        const response = await axios.put(`${API_URL}/integrations/${id}`, data);
        return response.data;
    }

    async deleteIntegration(id: string): Promise<void> {
        await axios.delete(`${API_URL}/integrations/${id}`);
    }

    async testIntegration(id: string): Promise<{ success: boolean; message: string }> {
        const response = await axios.post(`${API_URL}/integrations/${id}/test`);
        return response.data;
    }

    // Integration Calls
    async getIntegrationCalls(integrationId: string, filters?: {
        status?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<IntegrationCall[]> {
        const response = await axios.get(`${API_URL}/integrations/${integrationId}/calls`, {
            params: filters
        });
        return response.data;
    }

    async retryFailedCall(callId: string): Promise<IntegrationCall> {
        const response = await axios.post(`${API_URL}/integrations/calls/${callId}/retry`);
        return response.data;
    }

    // Webhook Management
    async createWebhook(data: Partial<Webhook>): Promise<Webhook> {
        const response = await axios.post(`${API_URL}/integrations/webhooks`, data);
        return response.data;
    }

    async getWebhooks(integrationId?: string): Promise<Webhook[]> {
        const response = await axios.get(`${API_URL}/integrations/webhooks`, {
            params: { integrationId }
        });
        return response.data;
    }

    async updateWebhook(id: string, data: Partial<Webhook>): Promise<Webhook> {
        const response = await axios.put(`${API_URL}/integrations/webhooks/${id}`, data);
        return response.data;
    }

    async deleteWebhook(id: string): Promise<void> {
        await axios.delete(`${API_URL}/integrations/webhooks/${id}`);
    }

    async testWebhook(id: string): Promise<{ success: boolean; message: string }> {
        const response = await axios.post(`${API_URL}/integrations/webhooks/${id}/test`);
        return response.data;
    }

    // Health & Monitoring
    async getIntegrationHealth(integrationId: string): Promise<IntegrationHealth> {
        const response = await axios.get(`${API_URL}/integrations/${integrationId}/health`);
        return response.data;
    }

    async getAllIntegrationsHealth(): Promise<IntegrationHealth[]> {
        const response = await axios.get(`${API_URL}/integrations/health`);
        return response.data;
    }

    // Statistics
    async getIntegrationStats(integrationId: string, period: string = '7d'): Promise<IntegrationStats> {
        const response = await axios.get(`${API_URL}/integrations/${integrationId}/stats`, {
            params: { period }
        });
        return response.data;
    }

    // Sync Operations
    async syncIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
        const response = await axios.post(`${API_URL}/integrations/${integrationId}/sync`);
        return response.data;
    }
}

export default new IntegrationGatewayService();
