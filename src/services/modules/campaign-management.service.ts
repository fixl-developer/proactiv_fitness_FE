import { apiClient } from '../api/client'

export interface Campaign {
    id: string
    name: string
    description: string
    type: 'email' | 'sms' | 'social' | 'push'
    status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused'
    startDate: string
    endDate?: string
    budget: number
    spent: number
    audience: CampaignAudience
    createdAt: string
    createdBy: string
}

export interface CampaignAudience {
    totalSize: number
    segments: string[]
    filters: any
}

export interface CampaignTemplate {
    id: string
    name: string
    description: string
    type: string
    config: any
}

export class CampaignManagementService {
    /**
     * Get all campaigns
     */
    static async getCampaigns(filters?: { status?: string; type?: string }): Promise<Campaign[]> {
        try {
            const response = await apiClient.get('/campaigns', { params: filters })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching campaigns:', error)
            throw error
        }
    }

    /**
     * Get campaign by ID
     */
    static async getCampaignById(campaignId: string): Promise<Campaign> {
        try {
            const response = await apiClient.get(`/campaigns/${campaignId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching campaign:', error)
            throw error
        }
    }

    /**
     * Create campaign
     */
    static async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
        try {
            const response = await apiClient.post('/campaigns', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating campaign:', error)
            throw error
        }
    }

    /**
     * Update campaign
     */
    static async updateCampaign(campaignId: string, data: Partial<Campaign>): Promise<Campaign> {
        try {
            const response = await apiClient.patch(`/campaigns/${campaignId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating campaign:', error)
            throw error
        }
    }

    /**
     * Delete campaign
     */
    static async deleteCampaign(campaignId: string): Promise<void> {
        try {
            await apiClient.delete(`/campaigns/${campaignId}`)
        } catch (error) {
            console.error('Error deleting campaign:', error)
            throw error
        }
    }

    /**
     * Launch campaign
     */
    static async launchCampaign(campaignId: string): Promise<Campaign> {
        try {
            const response = await apiClient.post(`/campaigns/${campaignId}/launch`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error launching campaign:', error)
            throw error
        }
    }

    /**
     * Pause campaign
     */
    static async pauseCampaign(campaignId: string): Promise<Campaign> {
        try {
            const response = await apiClient.post(`/campaigns/${campaignId}/pause`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error pausing campaign:', error)
            throw error
        }
    }

    /**
     * Get campaign analytics
     */
    static async getCampaignAnalytics(campaignId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/campaigns/${campaignId}/analytics`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching campaign analytics:', error)
            throw error
        }
    }

    /**
     * Get campaign templates
     */
    static async getTemplates(type?: string): Promise<CampaignTemplate[]> {
        try {
            const response = await apiClient.get('/campaigns/templates', { params: { type } })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching templates:', error)
            throw error
        }
    }

    /**
     * Create campaign from template
     */
    static async createFromTemplate(templateId: string, data: any): Promise<Campaign> {
        try {
            const response = await apiClient.post(`/campaigns/templates/${templateId}/create`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating from template:', error)
            throw error
        }
    }

    /**
     * Schedule campaign
     */
    static async scheduleCampaign(campaignId: string, schedule: any): Promise<Campaign> {
        try {
            const response = await apiClient.post(`/campaigns/${campaignId}/schedule`, schedule)
            return (response as any)?.data
        } catch (error) {
            console.error('Error scheduling campaign:', error)
            throw error
        }
    }

    /**
     * Get A/B test results
     */
    static async getABTestResults(campaignId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/campaigns/${campaignId}/ab-tests`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching A/B test results:', error)
            throw error
        }
    }

    /**
     * Create A/B test
     */
    static async createABTest(campaignId: string, data: any): Promise<any> {
        try {
            const response = await apiClient.post(`/campaigns/${campaignId}/ab-tests`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating A/B test:', error)
            throw error
        }
    }

    /**
     * Get campaign performance
     */
    static async getCampaignPerformance(campaignId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/campaigns/${campaignId}/performance`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching performance:', error)
            throw error
        }
    }

    /**
     * Clone campaign
     */
    static async cloneCampaign(campaignId: string, name: string): Promise<Campaign> {
        try {
            const response = await apiClient.post(`/campaigns/${campaignId}/clone`, { name })
            return (response as any)?.data
        } catch (error) {
            console.error('Error cloning campaign:', error)
            throw error
        }
    }

    /**
     * Get campaign budget
     */
    static async getCampaignBudget(campaignId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/campaigns/${campaignId}/budget`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching budget:', error)
            throw error
        }
    }

    /**
     * Update campaign budget
     */
    static async updateCampaignBudget(campaignId: string, budget: number): Promise<Campaign> {
        try {
            const response = await apiClient.patch(`/campaigns/${campaignId}/budget`, { budget })
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating budget:', error)
            throw error
        }
    }

    /**
     * Get campaign audience
     */
    static async getCampaignAudience(campaignId: string): Promise<CampaignAudience> {
        try {
            const response = await apiClient.get(`/campaigns/${campaignId}/audience`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching audience:', error)
            throw error
        }
    }

    /**
     * Export campaign data
     */
    static async exportCampaignData(campaignId: string, format: string): Promise<Blob> {
        try {
            const response = await apiClient.get(`/campaigns/${campaignId}/export`, {
                params: { format },
                responseType: 'blob'
            })
            return response as any
        } catch (error) {
            console.error('Error exporting campaign:', error)
            throw error
        }
    }
}

export default CampaignManagementService
