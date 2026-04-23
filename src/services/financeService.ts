import apiClient from '@/lib/apiClient'

// Payment Service
export const PaymentService = {
    getAll: (params?: any) => apiClient.get('/payments', { params }),
    getById: (id: string) => apiClient.get(`/payments/${id}`),
    create: (data: any) => apiClient.post('/payments/process', data),
    update: (id: string, data: any) => apiClient.put(`/payments/${id}`, data),
    delete: (id: string) => apiClient.delete(`/payments/${id}`),
    refund: (transactionId: string, data: any) => apiClient.post(`/payments/refund/${transactionId}`, data),
}

// Revenue Service
export const RevenueService = {
    getAll: (params?: any) => apiClient.get('/finance/revenue', { params }),
    getById: (id: string) => apiClient.get(`/finance/revenue/${id}`),
    create: (data: any) => apiClient.post('/finance/revenue', data),
    update: (id: string, data: any) => apiClient.put(`/finance/revenue/${id}`, data),
    delete: (id: string) => apiClient.delete(`/finance/revenue/${id}`),
}

// Ledger Service
export const LedgerService = {
    getAll: (params?: any) => apiClient.get('/finance/ledger', { params }),
    getById: (id: string) => apiClient.get(`/finance/ledger/${id}`),
    create: (data: any) => apiClient.post('/finance/ledger', data),
    update: (id: string, data: any) => apiClient.put(`/finance/ledger/${id}`, data),
    delete: (id: string) => apiClient.delete(`/finance/ledger/${id}`),
}
