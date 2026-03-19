import apiClient from '../api/client'

class SupportService {
    // Tickets
    async getAllTickets(page = 1, limit = 20, filters?: any) {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
        if (filters?.status) params.append('status', filters.status)
        if (filters?.priority) params.append('priority', filters.priority)
        if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo)

        const response = await apiClient.get(`/admin/support/tickets?${params}`)
        return response.data
    }

    async getTicketById(id: string) {
        const response = await apiClient.get(`/admin/support/tickets/${id}`)
        return response.data
    }

    async createTicket(data: {
        subject: string
        description: string
        priority: 'low' | 'medium' | 'high' | 'urgent'
        category: string
        userId?: string
    }) {
        const response = await apiClient.post('/admin/support/tickets', data)
        return response.data
    }

    async updateTicket(id: string, data: any) {
        const response = await apiClient.put(`/admin/support/tickets/${id}`, data)
        return response.data
    }

    async assignTicket(id: string, assignedTo: string) {
        const response = await apiClient.put(`/admin/support/tickets/${id}/assign`, { assignedTo })
        return response.data
    }

    async closeTicket(id: string, resolution: string) {
        const response = await apiClient.put(`/admin/support/tickets/${id}/close`, { resolution })
        return response.data
    }

    async addComment(ticketId: string, comment: string) {
        const response = await apiClient.post(`/admin/support/tickets/${ticketId}/comments`, { comment })
        return response.data
    }

    async getTicketStatistics() {
        const response = await apiClient.get('/admin/support/tickets/statistics')
        return response.data
    }

    // Knowledge Base
    async getAllArticles(page = 1, limit = 20, category?: string) {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
        if (category) params.append('category', category)

        const response = await apiClient.get(`/admin/support/knowledge?${params}`)
        return response.data
    }

    async getArticleById(id: string) {
        const response = await apiClient.get(`/admin/support/knowledge/${id}`)
        return response.data
    }

    async createArticle(data: {
        title: string
        content: string
        category: string
        tags?: string[]
        status: 'draft' | 'published'
    }) {
        const response = await apiClient.post('/admin/support/knowledge', data)
        return response.data
    }

    async updateArticle(id: string, data: any) {
        const response = await apiClient.put(`/admin/support/knowledge/${id}`, data)
        return response.data
    }

    async deleteArticle(id: string) {
        const response = await apiClient.delete(`/admin/support/knowledge/${id}`)
        return response.data
    }

    async getCategories() {
        const response = await apiClient.get('/admin/support/knowledge/categories')
        return response.data
    }

    async searchArticles(query: string) {
        const response = await apiClient.get(`/admin/support/knowledge/search?q=${query}`)
        return response.data
    }
}

export default new SupportService()
