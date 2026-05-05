import { apiClient } from '@/services/api/client'

interface SupportTicketPayload {
    subject: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    category: string
}

interface ContactMessage {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
}

// apiClient methods already return the response BODY
// (`{ success, data, message, pagination }`) — not the axios envelope.
// Earlier this file did `response.data?.data` which is a double-unwrap that
// silently returned `undefined` for every endpoint, so the user/parent support
// pages always saw an empty ticket list even after a successful create. We
// extract `body.data` (single unwrap) and normalise `_id` → `id` so React
// keys + `if (ticket.id)` checks downstream work.
const normalizeTicket = (raw: any) => {
    if (!raw || typeof raw !== 'object') return raw
    return {
        ...raw,
        id: raw.id || raw._id || raw.ticketId || '',
    }
}

const supportService = {
    async getTickets(): Promise<any[]> {
        try {
            const body: any = await apiClient.get('/support/tickets')
            const list = Array.isArray(body?.data) ? body.data : []
            return list.map(normalizeTicket)
        } catch (error) {
            console.error('Failed to fetch support tickets:', error)
            return []
        }
    },

    async createTicket(ticket: SupportTicketPayload): Promise<any> {
        try {
            const body: any = await apiClient.post('/support/tickets', ticket)
            return normalizeTicket(body?.data || {})
        } catch (error) {
            console.error('Failed to create support ticket:', error)
            throw error
        }
    },

    async getTicketById(id: string): Promise<any> {
        try {
            const body: any = await apiClient.get(`/support/tickets/${id}`)
            return normalizeTicket(body?.data || {})
        } catch (error) {
            console.error('Failed to fetch support ticket:', error)
            return {}
        }
    },

    async updateTicket(id: string, data: any): Promise<any> {
        try {
            const body: any = await apiClient.put(`/support/tickets/${id}`, data)
            return normalizeTicket(body?.data || {})
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
            // Backend route is /support/faq (singular) — see support.routes.ts L778.
            // The earlier /support/faqs URL 404'd silently and returned [].
            const body: any = await apiClient.get('/support/faq')
            return Array.isArray(body?.data) ? body.data : []
        } catch (error) {
            console.error('Failed to fetch FAQs:', error)
            return []
        }
    },

    async sendContactMessage(message: ContactMessage): Promise<any> {
        try {
            const body: any = await apiClient.post('/support/contact', message)
            return body?.data || {}
        } catch (error) {
            console.error('Failed to send contact message:', error)
            throw error
        }
    },

    async addReply(ticketId: string, reply: string): Promise<any> {
        try {
            // Backend exposes comments, not replies — keep the public method name
            // for compatibility but hit the right URL + payload shape.
            const body: any = await apiClient.post(`/support/tickets/${ticketId}/comments`, { message: reply })
            return body?.data || {}
        } catch (error) {
            console.error('Failed to add reply:', error)
            throw error
        }
    },

    async getReplies(ticketId: string): Promise<any[]> {
        try {
            const body: any = await apiClient.get(`/support/tickets/${ticketId}/comments`)
            return Array.isArray(body?.data) ? body.data : []
        } catch (error) {
            console.error('Failed to fetch replies:', error)
            return []
        }
    }
}

export default supportService
