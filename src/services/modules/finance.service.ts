import { apiClient } from '../api/client'

interface Payment {
    id: string
    amount: number
    status: string
    method: string
    date: string
    studentName: string
    programName: string
}

interface Invoice {
    id: string
    invoiceNumber: string
    amount: number
    status: string
    dueDate: string
    customerName: string
}

interface RevenueData {
    date: string
    amount: number
    category: string
}

interface LedgerEntry {
    id: string
    date: string
    description: string
    debit: number
    credit: number
    balance: number
    category: string
}

class FinanceService {
    // Payments
    async getAllPayments(page = 1, limit = 20, status?: string) {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
        if (status) params.append('status', status)

        const response = await apiClient.get(`/admin/finance/payments?${params}`)
        return response.data
    }

    async getPaymentById(id: string) {
        const response = await apiClient.get(`/admin/finance/payments/${id}`)
        return response.data
    }

    async processRefund(paymentId: string, amount: number, reason: string) {
        const response = await apiClient.post(`/admin/finance/payments/${paymentId}/refund`, {
            amount,
            reason
        })
        return response.data
    }

    async getPaymentStatistics(startDate?: string, endDate?: string) {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await apiClient.get(`/admin/finance/payments/statistics?${params}`)
        return response.data
    }

    // Invoices
    async getAllInvoices(page = 1, limit = 20) {
        const response = await apiClient.get(`/admin/finance/invoices?page=${page}&limit=${limit}`)
        return response.data
    }

    async generateInvoice(data: any) {
        const response = await apiClient.post('/admin/finance/invoices', data)
        return response.data
    }

    async sendInvoice(invoiceId: string) {
        const response = await apiClient.post(`/admin/finance/invoices/${invoiceId}/send`)
        return response.data
    }

    // Revenue
    async getRevenueData(period: 'daily' | 'weekly' | 'monthly' | 'yearly', startDate?: string, endDate?: string) {
        const params = new URLSearchParams({ period })
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await apiClient.get(`/admin/finance/revenue?${params}`)
        return response.data
    }

    async getRevenueByCategory(startDate?: string, endDate?: string) {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await apiClient.get(`/admin/finance/revenue/by-category?${params}`)
        return response.data
    }

    async getRevenueByLocation(startDate?: string, endDate?: string) {
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await apiClient.get(`/admin/finance/revenue/by-location?${params}`)
        return response.data
    }

    async getRevenueForecast(months: number) {
        const response = await apiClient.get(`/admin/finance/revenue/forecast?months=${months}`)
        return response.data
    }

    // Ledger
    async getLedgerEntries(page = 1, limit = 50, category?: string) {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
        if (category) params.append('category', category)

        const response = await apiClient.get(`/admin/finance/ledger?${params}`)
        return response.data
    }

    async createLedgerEntry(data: Partial<LedgerEntry>) {
        const response = await apiClient.post('/admin/finance/ledger', data)
        return response.data
    }

    async getLedgerBalance() {
        const response = await apiClient.get('/admin/finance/ledger/balance')
        return response.data
    }

    async exportLedger(startDate: string, endDate: string, format: 'csv' | 'pdf') {
        const response = await apiClient.get(`/admin/finance/ledger/export?startDate=${startDate}&endDate=${endDate}&format=${format}`, {
            responseType: 'blob'
        })
        return response.data
    }
}

export default new FinanceService()
