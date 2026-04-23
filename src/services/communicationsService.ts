import apiClient from '@/lib/apiClient'

// Admin Notification Service
export const NotificationService = {
    getAll: (params?: any) => apiClient.get('/api/v1/admin/notifications', { params }),
    getById: (id: string) => apiClient.get(`/api/v1/admin/notifications/${id}`),
    create: (data: any) => apiClient.post('/api/v1/admin/notifications', data),
    update: (id: string, data: any) => apiClient.put(`/api/v1/admin/notifications/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/v1/admin/notifications/${id}`),
    send: (id: string) => apiClient.post(`/api/v1/admin/notifications/${id}/send`, {}),
    bulkSend: (notificationIds: string[]) =>
        apiClient.post('/api/v1/admin/notifications/bulk/send', { notificationIds }),
}

// Template Service
export const TemplateService = {
    getAll: (params?: any) => apiClient.get('/api/v1/communications/templates', { params }),
    getById: (id: string) => apiClient.get(`/api/v1/communications/templates/${id}`),
    create: (data: any) => apiClient.post('/api/v1/communications/templates', data),
    update: (id: string, data: any) => apiClient.put(`/api/v1/communications/templates/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/v1/communications/templates/${id}`),
}

// CRM Service
export const CRMService = {
    getAll: (params?: any) => apiClient.get('/api/v1/crm/families', { params }),
    getById: (id: string) => apiClient.get(`/api/v1/crm/families/${id}`),
    create: (data: any) => apiClient.post('/api/v1/crm/families', data),
    update: (id: string, data: any) => apiClient.put(`/api/v1/crm/families/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/v1/crm/families/${id}`),
}
