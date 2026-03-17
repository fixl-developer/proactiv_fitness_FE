import { apiClient } from '../api/client'

export interface Integration {
    id: string
    name: string
    description: string
    status: 'active' | 'inactive' | 'error'
    category: string
    icon: string
    version: string
    lastSync: string
}

export interface Webhook {
    id: string
    url: string
    events: string[]
    status: 'active' | 'inactive'
    lastTriggered: string
    failureCount: number
}

export interface IntegrationAnalytics {
    integrationId: string
    totalRequests: number
    successRate: number
    avgResponseTime: number
    errors: number
}

export class IntegrationManagementService {
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
     * Create new integration
     */
    static async createIntegration(data: any): Promise<Integration> {
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
    static async updateIntegration(integrationId: string, data: any): Promise<Integration> {
        try {
            const response = await apiClient.put(`/integrations/${integrationId}`, data)
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
     * Get integration marketplace
     */
    static async getMarketplace(): Promise<Integration[]> {
        try {
            const response = await apiClient.get('/integrations/marketplace')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching marketplace:', error)
            throw error
        }
    }

    /**
     * Install integration from marketplace
     */
    static async installIntegration(integrationId: string): Promise<Integration> {
        try {
            const response = await apiClient.post(`/integrations/install/${integrationId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error installing integration:', error)
            throw error
        }
    }

    /**
     * Get webhooks for integration
     */
    static async getWebhooks(integrationId: string): Promise<Webhook[]> {
        try {
            const response = await apiClient.get(`/integrations/${integrationId}/webhooks`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching webhooks:', error)
            throw error
        }
    }

    /**
     * Create webhook
     */
    static async createWebhook(integrationId: string, data: any): Promise<Webhook> {
        try {
            const response = await apiClient.post(`/integrations/${integrationId}/webhooks`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating webhook:', error)
            throw error
        }
    }

    /**
     * Update webhook
     */
    static async updateWebhook(integrationId: string, webhookId: string, data: any): Promise<Webhook> {
        try {
            const response = await apiClient.put(`/integrations/${integrationId}/webhooks/${webhookId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating webhook:', error)
            throw error
        }
    }

    /**
     * Delete webhook
     */
    static async deleteWebhook(integrationId: string, webhookId: string): Promise<void> {
        try {
            await apiClient.delete(`/integrations/${integrationId}/webhooks/${webhookId}`)
        } catch (error) {
            console.error('Error deleting webhook:', error)
            throw error
        }
    }

    /**
     * Test webhook
     */
    static async testWebhook(integrationId: string, webhookId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/integrations/${integrationId}/webhooks/${webhookId}/test`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error testing webhook:', error)
            throw error
        }
    }

    /**
     * Get integration analytics
     */
    static async getIntegrationAnalytics(integrationId: string, period?: string): Promise<IntegrationAnalytics> {
        try {
            const response = await apiClient.get(`/integrations/${integrationId}/analytics`, { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching analytics:', error)
            throw error
        }
    }

    /**
     * Sync integration
     */
    static async syncIntegration(integrationId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/integrations/${integrationId}/sync`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error syncing integration:', error)
            throw error
        }
    }

    /**
     * Get integration logs
     */
    static async getIntegrationLogs(integrationId: string, limit?: number): Promise<any[]> {
        try {
            const response = await apiClient.get(`/integrations/${integrationId}/logs`, { params: { limit } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching logs:', error)
            throw error
        }
    }

    /**
     * Retry failed integration
     */
    static async retryIntegration(integrationId: string): Promise<any> {
        try {
            const response = await apiClient.post(`/integrations/${integrationId}/retry`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error retrying integration:', error)
            throw error
        }
    }
}

export default IntegrationManagementService
