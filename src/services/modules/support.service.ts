import { apiClient } from '../api/client'

export interface SupportTicket {
    id: string
    ticketNumber: string
    customerId: string
    customerName: string
    customerEmail: string
    subject: string
    description: string
    status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed' | 'reopened'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    category: string
    assignedTo?: string
    assignedToName?: string
    createdAt: string
    updatedAt: string
    resolvedAt?: string
    closedAt?: string
    responseTime?: number
    resolutionTime?: number
    satisfaction?: number
    tags?: string[]
    attachments?: { name: string; url: string }[]
}

export interface SupportInquiry {
    id: string
    inquiryNumber: string
    customerId: string
    customerName: string
    inquiryType: 'general' | 'technical' | 'billing' | 'feedback' | 'complaint'
    subject: string
    message: string
    status: 'new' | 'acknowledged' | 'investigating' | 'resolved'
    linkedTicketId?: string
    createdAt: string
    updatedAt: string
}

export interface TicketStats {
    totalTickets: number
    openTickets: number
    resolvedTickets: number
    pendingTickets: number
    averageResponseTime: number
    averageResolutionTime: number
    satisfactionScore: number
    resolutionRate: number
}

export interface Escalation {
    id: string
    ticketId: string
    reason: string
    escalatedFrom: string
    escalatedTo: string
    escalationLevel: 1 | 2 | 3
    status: 'pending' | 'acknowledged' | 'resolved'
    createdAt: string
    resolvedAt?: string
}

export class SupportService {
    /**
     * Get support tickets with pagination and filters
     */
    static async getTickets(filters?: {
        status?: string
        priority?: string
        assignedTo?: string
        page?: number
        limit?: number
    }): Promise<{ tickets: SupportTicket[]; total: number }> {
        try {
            const response = await apiClient.get('/support/tickets', { params: filters })
            return (response as any)?.data || { tickets: [], total: 0 }
        } catch (error) {
            console.error('Error fetching tickets:', error)
            throw error
        }
    }

    /**
     * Get ticket by ID
     */
    static async getTicketById(id: string): Promise<SupportTicket> {
        try {
            const response = await apiClient.get(`/support/tickets/${id}`)
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching ticket:', error)
            throw error
        }
    }

    /**
     * Create new support ticket
     */
    static async createTicket(data: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
        try {
            const response = await apiClient.post('/support/tickets', data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating ticket:', error)
            throw error
        }
    }

    /**
     * Update support ticket
     */
    static async updateTicket(id: string, data: Partial<SupportTicket>): Promise<SupportTicket> {
        try {
            const response = await apiClient.patch(`/support/tickets/${id}`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error updating ticket:', error)
            throw error
        }
    }

    /**
     * Close support ticket
     */
    static async closeTicket(id: string): Promise<SupportTicket> {
        try {
            const response = await apiClient.patch(`/support/tickets/${id}/close`, {})
            return (response as any)?.data
        } catch (error) {
            console.error('Error closing ticket:', error)
            throw error
        }
    }

    /**
     * Reopen support ticket
     */
    static async reopenTicket(id: string): Promise<SupportTicket> {
        try {
            const response = await apiClient.patch(`/support/tickets/${id}/reopen`, {})
            return (response as any)?.data
        } catch (error) {
            console.error('Error reopening ticket:', error)
            throw error
        }
    }

    /**
     * Assign ticket to staff member
     */
    static async assignTicket(id: string, staffId: string): Promise<SupportTicket> {
        try {
            const response = await apiClient.patch(`/support/tickets/${id}/assign`, { staffId })
            return (response as any)?.data
        } catch (error) {
            console.error('Error assigning ticket:', error)
            throw error
        }
    }

    /**
     * Get tickets by status
     */
    static async getTicketsByStatus(status: string): Promise<SupportTicket[]> {
        try {
            const response = await apiClient.get('/support/tickets', { params: { status } })
            return (response as any)?.data?.tickets || []
        } catch (error) {
            console.error('Error fetching tickets by status:', error)
            throw error
        }
    }

    /**
     * Get tickets by priority
     */
    static async getTicketsByPriority(priority: string): Promise<SupportTicket[]> {
        try {
            const response = await apiClient.get('/support/tickets', { params: { priority } })
            return (response as any)?.data?.tickets || []
        } catch (error) {
            console.error('Error fetching tickets by priority:', error)
            throw error
        }
    }

    /**
     * Get ticket statistics
     */
    static async getTicketStats(): Promise<TicketStats> {
        try {
            const response = await apiClient.get('/support/tickets/stats')
            return (response as any)?.data
        } catch (error) {
            console.error('Error fetching ticket stats:', error)
            throw error
        }
    }

    /**
     * Search tickets
     */
    static async searchTickets(query: string): Promise<SupportTicket[]> {
        try {
            const response = await apiClient.get('/support/tickets/search', { params: { q: query } })
            return (response as any)?.data?.tickets || []
        } catch (error) {
            console.error('Error searching tickets:', error)
            throw error
        }
    }

    /**
     * Get ticket history
     */
    static async getTicketHistory(id: string): Promise<any[]> {
        try {
            const response = await apiClient.get(`/support/tickets/${id}/history`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching ticket history:', error)
            throw error
        }
    }

    /**
     * Create escalation
     */
    static async createEscalation(ticketId: string, data: Omit<Escalation, 'id' | 'createdAt'>): Promise<Escalation> {
        try {
            const response = await apiClient.post(`/support/tickets/${ticketId}/escalate`, data)
            return (response as any)?.data
        } catch (error) {
            console.error('Error creating escalation:', error)
            throw error
        }
    }

    /**
     * Get escalations
     */
    static async getEscalations(filters?: { status?: string; page?: number; limit?: number }): Promise<{ escalations: Escalation[]; total: number }> {
        try {
            const response = await apiClient.get('/support/escalations', { params: filters })
            return (response as any)?.data || { escalations: [], total: 0 }
        } catch (error) {
            console.error('Error fetching escalations:', error)
            throw error
        }
    }

    /**
     * Add comment to ticket
     */
    static async addComment(ticketId: string, comment: string, isInternal: boolean = false): Promise<any> {
        try {
            const response = await apiClient.post(`/support/tickets/${ticketId}/comments`, { comment, isInternal })
            return (response as any)?.data
        } catch (error) {
            console.error('Error adding comment:', error)
            throw error
        }
    }

    /**
     * Get ticket comments
     */
    static async getTicketComments(ticketId: string): Promise<any[]> {
        try {
            const response = await apiClient.get(`/support/tickets/${ticketId}/comments`)
            return (response as any)?.data || []
        } catch (error) {
            console.error('Error fetching comments:', error)
            throw error
        }
    }
}


export default SupportService
