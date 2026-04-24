import apiClient from '@/lib/apiClient'

// Admin Notification Service
export const NotificationService = {
    getAll: (params?: any) => apiClient.get('/admin/notifications', { params }),
    getById: (id: string) => apiClient.get(`/admin/notifications/${id}`),
    create: (data: any) => apiClient.post('/admin/notifications', data),
    update: (id: string, data: any) => apiClient.put(`/admin/notifications/${id}`, data),
    delete: (id: string) => apiClient.delete(`/admin/notifications/${id}`),
    send: (id: string) => apiClient.post(`/admin/notifications/${id}/send`, {}),
    bulkSend: (notificationIds: string[]) =>
        apiClient.post('/admin/notifications/bulk/send', { notificationIds }),
}

// Template Service
export const TemplateService = {
    getAll: (params?: any) => apiClient.get('/communications/templates', { params }),
    getById: (id: string) => apiClient.get(`/communications/templates/${id}`),
    create: (data: any) => apiClient.post('/communications/templates', data),
    update: (id: string, data: any) => apiClient.put(`/communications/templates/${id}`, data),
    delete: (id: string) => apiClient.delete(`/communications/templates/${id}`),
}

// CRM Service
export const CRMService = {
    getAll: (params?: any) => apiClient.get('/crm/families', { params }),
    getById: (id: string) => apiClient.get(`/crm/families/${id}`),
    create: (data: any) => apiClient.post('/crm/families', data),
    update: (id: string, data: any) => apiClient.put(`/crm/families/${id}`, data),
    delete: (id: string) => apiClient.delete(`/crm/families/${id}`),
}
