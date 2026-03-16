import { apiClient } from '../api/client'

export interface Integration {
    id: string
    name: string
    type: string
    status: 'active' | 'inactive' | 'error'
    endpoint: string
    apiKey: string
    config: any
    lastSync: string
    createdAt: string
}

export interface APIKey {
    id: string
    name: string
    key: string
    permissions: string[]
    rateLimit: number
    expiresAt?: string
    createdAt: string
    lastUsed?: string
}

export interface RateLimit {
    id: string
    endpoint: string
    limit: number
    window: string
    currentUsage: number
}

export class IntegrationGatewayService {
    /**
     * Get all integrations
     */
    static async getIntegrations(): Promise<Integration[]> {
        try {
            const response = await apiClient.get('/integrations')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching integrations:', error)
            throw error
        }
    }

    /**
     * Get integration by ID
     */
    static async getIntegrationById(integrationId: string): Promise<Integration> {
        try {
            const response = await apiClient.get(`/integrations/${integrationId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching integration:', error)
            throw error
        }
    }

    /**
     * Create integration
     */
    static async createIntegration(data: Partial<Integration>): Promise<Integration> {
        try {
            const response = await apiClient.post('/integrations', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating integration:', error)
            throw error
        }
    }

    /**
     * Update integration
     */
    static async updateIntegration(integrationId: string, data: Partial<Integration>): Promise<Integration> {
        try {
            const response = await apiClient.patch(`/integrations/${integrationId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating integration:', error)
            throw error
        }
    }

    /**
     * Delete integration
     */
    static async deleteIntegration(integrationId: string): Promise<void> {
        try {
            await apiClient.delete(`/integrations/${integrationId}`)
        } catch (error) {
            console.error('Error deleting integration:', error)
            throw error
        }
    }

    /**
     * Test integration
     */
    static async testIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post(`/integrations/${integrationId}/test`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error testing integration:', error)
            throw error
        }
    }

    /**
     * Get API keys
     */
    static async getAPIKeys(): Promise<APIKey[]> {
        try {
            const response = await apiClient.get('/integrations/api-keys')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching API keys:', error)
            throw error
        }
    }

    /**
     * Create API key
     */
    static async createAPIKey(data: Partial<APIKey>): Promise<APIKey> {
        try {
            const response = await apiClient.post('/integrations/api-keys', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating API key:', error)
            throw error
        }
    }

    /**
     * Revoke API key
     */
    static async revokeAPIKey(keyId: string): Promise<void> {
        try {
            await apiClient.delete(`/integrations/api-keys/${keyId}`)
        } catch (error) {
            console.error('Error revoking API key:', error)
            throw error
        }
    }

    /**
     * Get rate limits
     */
    static async getRateLimits(): Promise<RateLimit[]> {
        try {
            const response = await apiClient.get('/integrations/rate-limits')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching rate limits:', error)
            throw error
        }
    }

    /**
     * Update rate limit
     */
    static async updateRateLimit(limitId: string, data: Partial<RateLimit>): Promise<RateLimit> {
        try {
            const response = await apiClient.patch(`/integrations/rate-limits/${limitId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating rate limit:', error)
            throw error
        }
    }

    /**
     * Get integration logs
     */
    static async getIntegrationLogs(integrationId: string, filters?: { startDate?: string; endDate?: string }): Promise<any[]> {
        try {
            const response = await apiClient.get(`/integrations/${integrationId}/logs`, { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching integration logs:', error)
            throw error
        }
    }

    /**
     * Get integration metrics
     */
    static async getIntegrationMetrics(integrationId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/integrations/${integrationId}/metrics`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching integration metrics:', error)
            throw error
        }
    }

    /**
     * Sync integration
     */
    static async syncIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.post(`/integrations/${integrationId}/sync`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error syncing integration:', error)
            throw error
        }
    }

    /**
     * Get webhook endpoints
     */
    static async getWebhookEndpoints(): Promise<any[]> {
        try {
            const response = await apiClient.get('/integrations/webhooks')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching webhook endpoints:', error)
            throw error
        }
    }

    /**
     * Create webhook endpoint
     */
    static async createWebhookEndpoint(data: any): Promise<any> {
        try {
            const response = await apiClient.post('/integrations/webhooks', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating webhook endpoint:', error)
            throw error
        }
    }
}

export default IntegrationGatewayService
