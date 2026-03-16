import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface Payment {
    id: string
    studentId: string
    studentName: string
    amount: number
    currency: string
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash'
    transactionId: string
    description: string
    dueDate: string
    paidDate?: string
    createdAt: string
}

export interface CreatePaymentDTO {
    studentId: string
    amount: number
    currency: string
    paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash'
    description: string
    dueDate: string
}

export interface UpdatePaymentDTO {
    status?: 'pending' | 'completed' | 'failed' | 'refunded'
    paymentMethod?: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash'
}

export interface PaymentListResponse {
    success: boolean
    data: {
        payments: Payment[]
        total: number
        page: number
        limit: number
    }
}

export interface PaymentResponse {
    success: boolean
    data: Payment
}

export interface PaymentStatsResponse {
    success: boolean
    data: {
        totalRevenue: number
        totalPending: number
        totalFailed: number
        completedPayments: number
    }
}

class PaymentService {
    private readonly MODULE_NAME = 'payments'

    async getPayments(page: number = 1, limit: number = 10, filters?: any): Promise<PaymentListResponse> {
        try {
            const response = await apiClient.get<PaymentListResponse>(
                '/payments',
                { params: { page, limit, ...filters } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getPaymentById(id: string): Promise<PaymentResponse> {
        try {
            const response = await apiClient.get<PaymentResponse>(`/payments/${id}`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async createPayment(data: CreatePaymentDTO): Promise<PaymentResponse> {
        try {
            const response = await apiClient.post<PaymentResponse>('/payments', data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updatePayment(id: string, data: UpdatePaymentDTO): Promise<PaymentResponse> {
        try {
            const response = await apiClient.put<PaymentResponse>(`/payments/${id}`, data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async processPayment(id: string): Promise<PaymentResponse> {
        try {
            const response = await apiClient.post<PaymentResponse>(`/payments/${id}/process`, {})
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async refundPayment(id: string, reason?: string): Promise<PaymentResponse> {
        try {
            const response = await apiClient.post<PaymentResponse>(`/payments/${id}/refund`, { reason })
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getStudentPayments(studentId: string): Promise<PaymentListResponse> {
        try {
            const response = await apiClient.get<PaymentListResponse>(
                `/payments/student/${studentId}`
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getPaymentStats(): Promise<PaymentStatsResponse> {
        try {
            const response = await apiClient.get<PaymentStatsResponse>('/payments/stats')
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getPaymentsByDateRange(startDate: string, endDate: string): Promise<PaymentListResponse> {
        try {
            const response = await apiClient.get<PaymentListResponse>(
                '/payments/date-range',
                { params: { startDate, endDate } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const paymentService = new PaymentService()
export default PaymentService
