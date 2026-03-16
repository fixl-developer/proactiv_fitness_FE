import { apiClient } from '../api/client'

export interface Lead {
    id: string
    email: string
    name: string
    phone?: string
    company?: string
    score: number
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
    source: string
    createdAt: string
    lastContactedAt?: string
}

export interface LeadScore {
    leadId: string
    score: number
    factors: any
    updatedAt: string
}

export interface LeadNurture {
    id: string
    leadId: string
    campaignId: string
    status: 'active' | 'paused' | 'completed'
    stage: number
    createdAt: string
}

export class LeadGenerationService {
    /**
     * Get all leads
     */
    static async getLeads(filters?: { status?: string; source?: string; page?: number }): Promise<{ leads: Lead[]; total: number }> {
        try {
            const response = await apiClient.get('/leads', { params: filters })
            return (response as any)?.data || { leads: [], total: 0 }
        } catch (error) {
            console.error('Error fetching leads:', error)
            throw error
        }
    }

    /**
     * Get lead by ID
     */
    static async getLeadById(leadId: string): Promise<Lead> {
        try {
            const response = await apiClient.get(`/leads/${leadId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching lead:', error)
            throw error
        }
    }

    /**
     * Create lead
     */
    static async createLead(data: Partial<Lead>): Promise<Lead> {
        try {
            const response = await apiClient.post('/leads', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating lead:', error)
            throw error
        }
    }

    /**
     * Update lead
     */
    static async updateLead(leadId: string, data: Partial<Lead>): Promise<Lead> {
        try {
            const response = await apiClient.patch(`/leads/${leadId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating lead:', error)
            throw error
        }
    }

    /**
     * Delete lead
     */
    static async deleteLead(leadId: string): Promise<void> {
        try {
            await apiClient.delete(`/leads/${leadId}`)
        } catch (error) {
            console.error('Error deleting lead:', error)
            throw error
        }
    }

    /**
     * Get lead score
     */
    static async getLeadScore(leadId: string): Promise<LeadScore> {
        try {
            const response = await apiClient.get(`/leads/${leadId}/score`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching lead score:', error)
            throw error
        }
    }

    /**
     * Calculate lead score
     */
    static async calculateLeadScore(leadId: string): Promise<LeadScore> {
        try {
            const response = await apiClient.post(`/leads/${leadId}/score/calculate`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error calculating lead score:', error)
            throw error
        }
    }

    /**
     * Get lead nurture campaigns
     */
    static async getLeadNurtureCampaigns(leadId: string): Promise<LeadNurture[]> {
        try {
            const response = await apiClient.get(`/leads/${leadId}/nurture`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching nurture campaigns:', error)
            throw error
        }
    }

    /**
     * Start lead nurture
     */
    static async startLeadNurture(leadId: string, campaignId: string): Promise<LeadNurture> {
        try {
            const response = await apiClient.post(`/leads/${leadId}/nurture`, { campaignId })
            return (response as any)?.data
        } catch (error) {
            console.error('Error starting nurture:', error)
            throw error
        }
    }

    /**
     * Get lead conversion tracking
     */
    static async getLeadConversionTracking(leadId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/leads/${leadId}/conversion`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching conversion tracking:', error)
            throw error
        }
    }

    /**
     * Track lead conversion
     */
    static async trackLeadConversion(leadId: string, data: any): Promise<any> {
        try {
            const response = await apiClient.post(`/leads/${leadId}/conversion`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error tracking conversion:', error)
            throw error
        }
    }

    /**
     * Get lead segments
     */
    static async getLeadSegments(): Promise<any[]> {
        try {
            const response = await apiClient.get('/leads/segments')
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching segments:', error)
            throw error
        }
    }

    /**
     * Create lead segment
     */
    static async createLeadSegment(data: any): Promise<any> {
        try {
            const response = await apiClient.post('/leads/segments', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating segment:', error)
            throw error
        }
    }

    /**
     * Get lead activity
     */
    static async getLeadActivity(leadId: string): Promise<any[]> {
        try {
            const response = await apiClient.get(`/leads/${leadId}/activity`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching activity:', error)
            throw error
        }
    }

    /**
     * Bulk import leads
     */
    static async bulkImportLeads(file: File): Promise<any> {
        try {
            const formData = new FormData()
            formData.append('file', file)
            const response = await apiClient.post('/leads/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return (response as any)?.data
        } catch (error) {
            console.error('Error importing leads:', error)
            throw error
        }
    }

    /**
     * Export leads
     */
    static async exportLeads(format: string): Promise<Blob> {
        try {
            const response = await apiClient.get('/leads/export', {
                params: { format },
                responseType: 'blob'
            })
            return response as any
        } catch (error) {
            console.error('Error exporting leads:', error)
            throw error
        }
    }
}

export default LeadGenerationService
