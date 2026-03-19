import apiClient from '../api/client'

class CommunicationsService {
    // Notifications
    async getAllNotifications(page = 1, limit = 20) {
        const response = await apiClient.get(`/admin/communications/notifications?page=${page}&limit=${limit}`)
        return response.data
    }

    async sendNotification(data: {
        title: string
        message: string
        recipients: string[]
        type: 'email' | 'sms' | 'push'
        priority?: 'low' | 'medium' | 'high'
    }) {
        const response = await apiClient.post('/admin/communications/notifications', data)
        return response.data
    }

    async scheduleNotification(data: any) {
        const response = await apiClient.post('/admin/communications/notifications/schedule', data)
        return response.data
    }

    async getNotificationStatistics() {
        const response = await apiClient.get('/admin/communications/notifications/statistics')
        return response.data
    }

    // Templates
    async getAllTemplates(type?: 'email' | 'sms') {
        const params = type ? `?type=${type}` : ''
        const response = await apiClient.get(`/admin/communications/templates${params}`)
        return response.data
    }

    async getTemplateById(id: string) {
        const response = await apiClient.get(`/admin/communications/templates/${id}`)
        return response.data
    }

    async createTemplate(data: {
        name: string
        type: 'email' | 'sms'
        subject?: string
        body: string
        variables?: string[]
    }) {
        const response = await apiClient.post('/admin/communications/templates', data)
        return response.data
    }

    async updateTemplate(id: string, data: any) {
        const response = await apiClient.put(`/admin/communications/templates/${id}`, data)
        return response.data
    }

    async deleteTemplate(id: string) {
        const response = await apiClient.delete(`/admin/communications/templates/${id}`)
        return response.data
    }

    // CRM
    async getCRMContacts(page = 1, limit = 20, filters?: any) {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
        if (filters?.status) params.append('status', filters.status)
        if (filters?.segment) params.append('segment', filters.segment)

        const response = await apiClient.get(`/admin/communications/crm/contacts?${params}`)
        return response.data
    }

    async getContactById(id: string) {
        const response = await apiClient.get(`/admin/communications/crm/contacts/${id}`)
        return response.data
    }

    async createContact(data: any) {
        const response = await apiClient.post('/admin/communications/crm/contacts', data)
        return response.data
    }

    async updateContact(id: string, data: any) {
        const response = await apiClient.put(`/admin/communications/crm/contacts/${id}`, data)
        return response.data
    }

    async getCRMSegments() {
        const response = await apiClient.get('/admin/communications/crm/segments')
        return response.data
    }

    async createCampaign(data: {
        name: string
        type: 'email' | 'sms'
        segmentId: string
        templateId: string
        scheduledDate?: string
    }) {
        const response = await apiClient.post('/admin/communications/crm/campaigns', data)
        return response.data
    }

    async getCampaigns() {
        const response = await apiClient.get('/admin/communications/crm/campaigns')
        return response.data
    }
}

export default new CommunicationsService()
