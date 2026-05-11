import { apiClient } from '../api/client'

export interface PartnerProfile {
    id: string
    name: string
    email: string
    phone: string
    businessName: string
    businessType: string
    location: string
    status: 'active' | 'inactive' | 'suspended'
    joinDate: string
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
    commissionRate: number
    totalRevenue: number
    totalStudents: number
    totalPrograms: number
    rating: number
    documents?: { name: string; url: string }[]
}

export interface PartnerProgram {
    id: string
    partnerId: string
    name: string
    description: string
    category: string
    status: 'active' | 'inactive'
    enrolledStudents: number
    revenue: number
    rating: number
    createdAt: string
}

export interface PartnerStudent {
    id: string
    partnerId: string
    name: string
    email: string
    phone: string
    enrolledPrograms: number
    totalSpent: number
    status: 'active' | 'inactive'
    joinDate: string
    lastActivity: string
}

export interface PartnerNotification {
    id: string
    partnerId: string
    type: 'alert' | 'update' | 'reminder' | 'announcement'
    title: string
    message: string
    isRead: boolean
    createdAt: string
    actionUrl?: string
}

export interface PartnerDocument {
    id: string
    partnerId: string
    name: string
    type: string
    url: string
    uploadedAt: string
    expiresAt?: string
    status: 'active' | 'expired' | 'pending'
}

export interface PartnerContact {
    id: string
    partnerId: string
    name: string
    email: string
    phone: string
    role: string
    isPrimary: boolean
}

export interface PartnerAgreement {
    id: string
    partnerId: string
    type: string
    status: 'active' | 'expired' | 'pending'
    startDate: string
    endDate: string
    terms: string
    signedAt?: string
}

export class PartnerPortalService {
    /**
     * Get partner profile
     */
    static async getPartnerProfile(partnerId: string): Promise<PartnerProfile> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching partner profile:', error)
            throw error
        }
    }

    /**
     * Update partner profile
     */
    static async updatePartnerProfile(partnerId: string, data: Partial<PartnerProfile>): Promise<PartnerProfile> {
        try {
            const response = await apiClient.patch(`/partner/${partnerId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating partner profile:', error)
            throw error
        }
    }

    /**
     * Get partner statistics
     */
    static async getPartnerStats(partnerId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/stats`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching partner stats:', error)
            throw error
        }
    }

    /**
     * Get partner programs
     */
    static async getPartnerPrograms(partnerId: string, filters?: { page?: number; limit?: number }): Promise<{ programs: PartnerProgram[]; total: number }> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/programs`, { params: filters })
            return (response as any)?.data || { programs: [], total: 0 }
        } catch (error) {
            console.error('Error fetching partner programs:', error)
            throw error
        }
    }

    /**
     * Create a partner program
     */
    static async createPartnerProgram(partnerId: string, data: Partial<PartnerProgram>): Promise<PartnerProgram> {
        try {
            const response = await apiClient.post(`/partner/${partnerId}/programs`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating partner program:', error)
            throw error
        }
    }

    /**
     * Update a partner program
     */
    static async updatePartnerProgram(partnerId: string, programId: string, data: Partial<PartnerProgram>): Promise<PartnerProgram> {
        try {
            const response = await apiClient.put(`/partner/${partnerId}/programs/${programId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating partner program:', error)
            throw error
        }
    }

    /**
     * Delete a partner program
     */
    static async deletePartnerProgram(partnerId: string, programId: string): Promise<any> {
        try {
            const response = await apiClient.delete(`/partner/${partnerId}/programs/${programId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error deleting partner program:', error)
            throw error
        }
    }

    /**
     * Get partner students
     */
    static async getPartnerStudents(partnerId: string, filters?: { page?: number; limit?: number }): Promise<{ students: PartnerStudent[]; total: number }> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/students`, { params: filters })
            return (response as any)?.data || { students: [], total: 0 }
        } catch (error) {
            console.error('Error fetching partner students:', error)
            throw error
        }
    }

    /**
     * Create a partner student
     */
    static async createPartnerStudent(partnerId: string, data: Partial<PartnerStudent>): Promise<PartnerStudent> {
        try {
            const response = await apiClient.post(`/partner/${partnerId}/students`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating partner student:', error)
            throw error
        }
    }

    /**
     * Update a partner student
     */
    static async updatePartnerStudent(partnerId: string, studentId: string, data: Partial<PartnerStudent>): Promise<PartnerStudent> {
        try {
            const response = await apiClient.put(`/partner/${partnerId}/students/${studentId}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating partner student:', error)
            throw error
        }
    }

    /**
     * Delete a partner student
     */
    static async deletePartnerStudent(partnerId: string, studentId: string): Promise<any> {
        try {
            const response = await apiClient.delete(`/partner/${partnerId}/students/${studentId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error deleting partner student:', error)
            throw error
        }
    }

    /**
     * Get partner bookings
     */
    static async getPartnerBookings(partnerId: string, filters?: { page?: number; limit?: number }): Promise<{ bookings: any[]; total: number }> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/bookings`, { params: filters })
            return (response as any)?.data || { bookings: [], total: 0 }
        } catch (error) {
            console.error('Error fetching partner bookings:', error)
            throw error
        }
    }

    /**
     * Get partner revenue
     */
    static async getPartnerRevenue(partnerId: string, filters?: { startDate?: string; endDate?: string }): Promise<any> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/revenue`, { params: filters })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching partner revenue:', error)
            throw error
        }
    }

    /**
     * Get partner metrics
     */
    static async getPartnerMetrics(partnerId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/metrics`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching partner metrics:', error)
            throw error
        }
    }

    /**
     * Get partner notifications
     */
    static async getPartnerNotifications(partnerId: string, filters?: { page?: number; limit?: number }): Promise<{ notifications: PartnerNotification[]; total: number }> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/notifications`, { params: filters })
            return (response as any)?.data || { notifications: [], total: 0 }
        } catch (error) {
            console.error('Error fetching partner notifications:', error)
            throw error
        }
    }

    /**
     * Mark notification as read
     */
    static async markNotificationRead(notificationId: string): Promise<PartnerNotification> {
        try {
            const response = await apiClient.patch(`/partner/notifications/${notificationId}/read`, {})
            return (response as any)?.data
        } catch (error) {
            console.error('Error marking notification as read:', error)
            throw error
        }
    }

    /**
     * Get partner documents
     */
    static async getPartnerDocuments(partnerId: string): Promise<PartnerDocument[]> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/documents`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching partner documents:', error)
            throw error
        }
    }

    /**
     * Upload document
     */
    static async uploadDocument(partnerId: string, file: File, type: string): Promise<PartnerDocument> {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type)
            const response = await apiClient.post(`/partner/${partnerId}/documents`, formData)
            return (response as any)?.data
        } catch (error) {
            console.error('Error uploading document:', error)
            throw error
        }
    }

    /**
     * Download a partner document by id. Returns the metadata { url, name, ... }.
     */
    static async downloadPartnerDocument(partnerId: string, documentId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/documents/${documentId}/download`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error downloading document:', error)
            throw error
        }
    }

    /**
     * Submit a resource request (becomes a support ticket, category 'Resource Request')
     */
    static async requestResource(partnerId: string, payload: any): Promise<any> {
        try {
            const response = await apiClient.post(`/partner/${partnerId}/resources/request`, payload)
            return (response as any)?.data
        } catch (error) {
            console.error('Error submitting resource request:', error)
            throw error
        }
    }

    /**
     * Get partner contacts
     */
    static async getPartnerContacts(partnerId: string): Promise<PartnerContact[]> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/contacts`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching partner contacts:', error)
            throw error
        }
    }

    /**
     * Update partner contacts
     */
    static async updatePartnerContacts(partnerId: string, contacts: PartnerContact[]): Promise<PartnerContact[]> {
        try {
            const response = await apiClient.patch(`/partner/${partnerId}/contacts`, { contacts })
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error updating partner contacts:', error)
            throw error
        }
    }

    /**
     * Get partner agreements
     */
    static async getPartnerAgreements(partnerId: string): Promise<PartnerAgreement[]> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/agreements`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching partner agreements:', error)
            throw error
        }
    }
    /**
     * Get marketing campaigns
     */
    static async getMarketingCampaigns(partnerId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/marketing/campaigns`)
            return (response as any)?.data || { campaigns: [], total: 0 }
        } catch (error) {
            console.error('Error fetching marketing campaigns:', error)
            throw error
        }
    }

    /**
     * Create marketing campaign
     */
    static async createMarketingCampaign(partnerId: string, data: any): Promise<any> {
        try {
            const response = await apiClient.post(`/partner/${partnerId}/marketing/campaigns`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating marketing campaign:', error)
            throw error
        }
    }

    /**
     * Get marketing leads
     */
    static async getMarketingLeads(partnerId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/marketing/leads`)
            return (response as any)?.data || { leads: [], total: 0 }
        } catch (error) {
            console.error('Error fetching marketing leads:', error)
            throw error
        }
    }

    /**
     * Get support tickets
     */
    static async getSupportTickets(partnerId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/support/tickets`)
            return (response as any)?.data || { tickets: [], total: 0 }
        } catch (error) {
            console.error('Error fetching support tickets:', error)
            throw error
        }
    }

    /**
     * Create a support ticket (resource request)
     */
    static async createSupportTicket(partnerId: string, data: { subject: string; description: string; priority: string; category: string }): Promise<any> {
        try {
            const response = await apiClient.post(`/partner/${partnerId}/support/tickets`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating support ticket:', error)
            throw error
        }
    }

    /**
     * Add message to a support ticket
     */
    static async addTicketMessage(ticketId: string, data: { message: string; sender?: string; senderType?: string }): Promise<any> {
        try {
            const response = await apiClient.post(`/partner/support/tickets/${ticketId}/messages`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error adding ticket message:', error)
            throw error
        }
    }

    /**
     * Get partner settings
     */
    static async getPartnerSettings(partnerId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/settings`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching partner settings:', error)
            throw error
        }
    }

    /**
     * Update partner settings
     */
    static async updatePartnerSettings(partnerId: string, data: any): Promise<any> {
        try {
            const response = await apiClient.patch(`/partner/${partnerId}/settings`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating partner settings:', error)
            throw error
        }
    }
    // ===== Partner Reports =====

    static async getPartnerReports(partnerId: string, filters?: { period?: string; status?: string; reportType?: string }): Promise<{ reports: any[]; total: number }> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/reports`, { params: filters })
            return (response as any)?.data || { reports: [], total: 0 }
        } catch (error) {
            console.error('Error fetching partner reports:', error)
            throw error
        }
    }

    static async getPartnerReportsSummary(partnerId: string, period?: string): Promise<any> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/reports/summary`, { params: { period } })
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching reports summary:', error)
            throw error
        }
    }

    static async createPartnerReport(partnerId: string, data: {
        reportName: string
        reportType: string
        description?: string
        format?: string
        dateFrom?: string
        dateTo?: string
        dataSources?: string[]
    }): Promise<any> {
        try {
            const response = await apiClient.post(`/partner/${partnerId}/reports`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating partner report:', error)
            throw error
        }
    }

    static async getPartnerReportById(partnerId: string, reportId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/reports/${reportId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching partner report:', error)
            throw error
        }
    }

    static async deletePartnerReport(partnerId: string, reportId: string): Promise<any> {
        try {
            const response = await apiClient.delete(`/partner/${partnerId}/reports/${reportId}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error deleting partner report:', error)
            throw error
        }
    }

    static async downloadPartnerReport(partnerId: string, reportId: string): Promise<any> {
        try {
            const response = await apiClient.get(`/partner/${partnerId}/reports/${reportId}/download`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error downloading partner report:', error)
            throw error
        }
    }
}

export default PartnerPortalService
