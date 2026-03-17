import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface Invoice {
    id: string
    invoiceNumber: string
    studentId: string
    studentName: string
    amount: number
    currency: string
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    issueDate: string
    dueDate: string
    paidDate?: string
    items: InvoiceItem[]
    notes?: string
    createdAt: string
}

export interface InvoiceItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
}

export interface CreateInvoiceDTO {
    studentId: string
    items: {
        description: string
        quantity: number
        unitPrice: number
    }[]
    dueDate: string
    notes?: string
}

export interface UpdateInvoiceDTO {
    status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    notes?: string
}

export interface InvoiceListResponse {
    success: boolean
    data: {
        invoices: Invoice[]
        total: number
        page: number
        limit: number
    }
}

export interface InvoiceResponse {
    success: boolean
    data: Invoice
}

export interface BillingStatsResponse {
    success: boolean
    data: {
        totalInvoiced: number
        totalPaid: number
        totalOverdue: number
        totalDraft: number
    }
}

class BillingService {
    private readonly MODULE_NAME = 'billing'

    async getInvoices(page: number = 1, limit: number = 10, filters?: any): Promise<InvoiceListResponse> {
        try {
            const response = await apiClient.get<InvoiceListResponse>(
                '/invoices',
                { params: { page, limit, ...filters } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getInvoiceById(id: string): Promise<InvoiceResponse> {
        try {
            const response = await apiClient.get<InvoiceResponse>(`/invoices/${id}`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async createInvoice(data: CreateInvoiceDTO): Promise<InvoiceResponse> {
        try {
            const response = await apiClient.post<InvoiceResponse>('/invoices', data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateInvoice(id: string, data: UpdateInvoiceDTO): Promise<InvoiceResponse> {
        try {
            const response = await apiClient.put<InvoiceResponse>(`/invoices/${id}`, data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async sendInvoice(id: string): Promise<InvoiceResponse> {
        try {
            const response = await apiClient.post<InvoiceResponse>(`/invoices/${id}/send`, {})
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async markAsPaid(id: string): Promise<InvoiceResponse> {
        try {
            const response = await apiClient.post<InvoiceResponse>(`/invoices/${id}/mark-paid`, {})
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getStudentInvoices(studentId: string): Promise<InvoiceListResponse> {
        try {
            const response = await apiClient.get<InvoiceListResponse>(
                `/invoices/student/${studentId}`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getBillingStats(): Promise<BillingStatsResponse> {
        try {
            const response = await apiClient.get<BillingStatsResponse>('/invoices/stats')
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async downloadInvoice(id: string): Promise<Blob> {
        try {
            const response = await apiClient.get<Blob>(`/invoices/${id}/download`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const billingService = new BillingService()
export default BillingService
