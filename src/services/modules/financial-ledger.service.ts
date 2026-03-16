import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface LedgerEntry {
    id: string
    date: string
    description: string
    category: 'income' | 'expense' | 'transfer'
    amount: number
    currency: string
    balance: number
    reference?: string
    notes?: string
    createdAt: string
}

export interface CreateLedgerEntryDTO {
    date: string
    description: string
    category: 'income' | 'expense' | 'transfer'
    amount: number
    currency: string
    reference?: string
    notes?: string
}

export interface LedgerListResponse {
    success: boolean
    data: {
        entries: LedgerEntry[]
        total: number
        page: number
        limit: number
    }
}

export interface LedgerResponse {
    success: boolean
    data: LedgerEntry
}

export interface FinancialSummaryResponse {
    success: boolean
    data: {
        totalIncome: number
        totalExpense: number
        currentBalance: number
        currency: string
    }
}

export interface FinancialReportResponse {
    success: boolean
    data: {
        period: string
        income: number
        expense: number
        netProfit: number
        transactions: number
    }
}

class FinancialLedgerService {
    private readonly MODULE_NAME = 'financial-ledger'

    async getLedgerEntries(page: number = 1, limit: number = 10, filters?: any): Promise<LedgerListResponse> {
        try {
            const response = await apiClient.get<LedgerListResponse>(
                '/financial-ledger',
                { params: { page, limit, ...filters } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getEntryById(id: string): Promise<LedgerResponse> {
        try {
            const response = await apiClient.get<LedgerResponse>(`/financial-ledger/${id}`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async createEntry(data: CreateLedgerEntryDTO): Promise<LedgerResponse> {
        try {
            const response = await apiClient.post<LedgerResponse>('/financial-ledger', data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async updateEntry(id: string, data: Partial<CreateLedgerEntryDTO>): Promise<LedgerResponse> {
        try {
            const response = await apiClient.put<LedgerResponse>(`/financial-ledger/${id}`, data)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async deleteEntry(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.delete<{ success: boolean; message: string }>(`/financial-ledger/${id}`)
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getFinancialSummary(): Promise<FinancialSummaryResponse> {
        try {
            const response = await apiClient.get<FinancialSummaryResponse>('/financial-ledger/summary')
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getFinancialReport(startDate: string, endDate: string): Promise<FinancialReportResponse> {
        try {
            const response = await apiClient.get<FinancialReportResponse>(
                '/financial-ledger/report',
                { params: { startDate, endDate } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getEntriesByCategory(category: 'income' | 'expense' | 'transfer'): Promise<LedgerListResponse> {
        try {
            const response = await apiClient.get<LedgerListResponse>(
                '/financial-ledger/category',
                { params: { category } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getEntriesByDateRange(startDate: string, endDate: string): Promise<LedgerListResponse> {
        try {
            const response = await apiClient.get<LedgerListResponse>(
                '/financial-ledger/date-range',
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

export const financialLedgerService = new FinancialLedgerService()
export default FinancialLedgerService
