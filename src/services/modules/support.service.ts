import { apiClient } from '@/services/api/client'

interface SupportTicket {
    subject: string
    description: string
    priority: 'low' | 'medium' | 'high'
    category: string
}

interface ContactMessage {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
}

const supportService = {
    async getTickets(): Promise<any[]> {
        try {
            const response = await apiClient.get('/support/tickets')
            return response.data?.data || []
        } catch (error) {
            console.error('Failed to fetch support tickets:', error)
            return []
        }
    },

    async createTicket(ticket: SupportTicket): Promise<any> {
        try {
            const response = await apiClient.post('/support/tickets', ticket)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to create support ticket:', error)
            throw error
        }
    },

    async getTicketById(id: string): Promise<any> {
        try {
            const response = await apiClient.get(`/support/tickets/${id}`)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to fetch support ticket:', error)
            return {}
        }
    },

    async updateTicket(id: string, data: any): Promise<any> {
        try {
            const response = await apiClient.put(`/support/tickets/${id}`, data)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to update support ticket:', error)
            throw error
        }
    },

    async deleteTicket(id: string): Promise<void> {
        try {
            await apiClient.delete(`/support/tickets/${id}`)
        } catch (error) {
            console.error('Failed to delete support ticket:', error)
            throw error
        }
    },

    async getFAQs(): Promise<any[]> {
        try {
            const response = await apiClient.get('/support/faqs')
            return response.data?.data || []
        } catch (error) {
            console.error('Failed to fetch FAQs:', error)
            return []
        }
    },

    async sendContactMessage(message: ContactMessage): Promise<any> {
        try {
            const response = await apiClient.post('/support/contact', message)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to send contact message:', error)
            throw error
        }
    },

    async addReply(ticketId: string, reply: string): Promise<any> {
        try {
            const response = await apiClient.post(`/support/tickets/${ticketId}/replies`, { reply })
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to add reply:', error)
            throw error
        }
    },

    async getReplies(ticketId: string): Promise<any[]> {
        try {
            const response = await apiClient.get(`/support/tickets/${ticketId}/replies`)
            return response.data?.data || []
        } catch (error) {
            console.error('Failed to fetch replies:', error)
            return []
        }
    }
}

export default supportService
