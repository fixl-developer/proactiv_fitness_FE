/**
 * Financial Ledger Service
 * Handles all financial ledger and accounting operations
 * Module 3.5 - Phase 3: Customer & Money
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum LedgerEntryType {
    REVENUE = 'revenue',
    REFUND = 'refund',
    FEE = 'fee',
    DISCOUNT = 'discount',
    ADJUSTMENT = 'adjustment',
    ROYALTY = 'royalty',
    COMMISSION = 'commission'
}

export enum ReconciliationStatus {
    PENDING = 'pending',
    MATCHED = 'matched',
    DISCREPANCY = 'discrepancy',
    RESOLVED = 'resolved'
}

export interface LedgerEntry {
    _id: string;
    entryId: string;
    type: LedgerEntryType;
    amount: number;
    currency: string;
    description: string;
    familyId?: string;
    bookingId?: string;
    invoiceId?: string;
    transactionId?: string;
    businessUnitId: string;
    locationId?: string;
    programId?: string;
    reconciliationStatus: ReconciliationStatus;
    reconciledAt?: Date;
    reconciledBy?: string;
    createdBy: string;
    createdAt: Date;
}

export interface FinancialSummary {
    totalRevenue: number;
    totalRefunds: number;
    totalFees: number;
    totalDiscounts: number;
    netRevenue: number;
    outstandingBalance: number;
    reconciliationRate: number;
}

export interface LedgerFilter {
    businessUnitId?: string;
    locationId?: string;
    programId?: string;
    type?: LedgerEntryType;
    reconciliationStatus?: ReconciliationStatus;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    familyId?: string;
    page?: number;
    limit?: number;
}

export interface CreateLedgerEntryDto {
    type: LedgerEntryType;
    amount: number;
    currency: string;
    description: string;
    familyId?: string;
    bookingId?: string;
    invoiceId?: string;
    transactionId?: string;
    businessUnitId: string;
    locationId?: string;
    programId?: string;
}

// ============================================================================
// FINANCIAL LEDGER SERVICE
// ============================================================================

class FinancialLedgerService {
    private readonly baseUrl = '/financial-ledger';

    /**
     * Get all ledger entries
     */
    async getLedgerEntries(filters?: LedgerFilter): Promise<{ data: LedgerEntry[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.programId) params.append('programId', filters.programId);
            if (filters.type) params.append('type', filters.type);
            if (filters.reconciliationStatus) params.append('reconciliationStatus', filters.reconciliationStatus);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters.minAmount) params.append('minAmount', filters.minAmount.toString());
            if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
            if (filters.familyId) params.append('familyId', filters.familyId);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}/entries?${params.toString()}`);
        return response.data;
    }

    /**
     * Get ledger entry by ID
     */
    async getLedgerEntryById(entryId: string): Promise<LedgerEntry> {
        const response = await apiClient.get(`${this.baseUrl}/entries/${entryId}`);
        return response.data.data;
    }

    /**
     * Create ledger entry
     */
    async createLedgerEntry(data: CreateLedgerEntryDto): Promise<LedgerEntry> {
        const response = await apiClient.post(`${this.baseUrl}/entries`, data);
        return response.data.data;
    }

    /**
     * Update ledger entry
     */
    async updateLedgerEntry(entryId: string, data: Partial<LedgerEntry>): Promise<LedgerEntry> {
        const response = await apiClient.put(`${this.baseUrl}/entries/${entryId}`, data);
        return response.data.data;
    }

    /**
     * Delete ledger entry
     */
    async deleteLedgerEntry(entryId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/entries/${entryId}`);
    }

    /**
     * Reconcile ledger entry
     */
    async reconcileLedgerEntry(entryId: string): Promise<LedgerEntry> {
        const response = await apiClient.post(`${this.baseUrl}/entries/${entryId}/reconcile`);
        return response.data.data;
    }

    /**
     * Mark discrepancy
     */
    async markDiscrepancy(entryId: string, notes: string): Promise<LedgerEntry> {
        const response = await apiClient.post(`${this.baseUrl}/entries/${entryId}/discrepancy`, { notes });
        return response.data.data;
    }

    /**
     * Resolve discrepancy
     */
    async resolveDiscrepancy(entryId: string, resolution: string): Promise<LedgerEntry> {
        const response = await apiClient.post(`${this.baseUrl}/entries/${entryId}/resolve`, { resolution });
        return response.data.data;
    }

    /**
     * Get financial summary
     */
    async getFinancialSummary(
        businessUnitId?: string,
        dateRange?: { startDate: Date; endDate: Date }
    ): Promise<FinancialSummary> {
        const params = new URLSearchParams();
        if (businessUnitId) params.append('businessUnitId', businessUnitId);
        if (dateRange) {
            params.append('startDate', dateRange.startDate.toISOString());
            params.append('endDate', dateRange.endDate.toISOString());
        }

        const response = await apiClient.get(`${this.baseUrl}/summary?${params.toString()}`);
        return response.data.data;
    }

    /**
     * Get revenue report
     */
    async getRevenueReport(
        businessUnitId?: string,
        dateRange?: { startDate: Date; endDate: Date }
    ): Promise<any> {
        const params = new URLSearchParams();
        if (businessUnitId) params.append('businessUnitId', businessUnitId);
        if (dateRange) {
            params.append('startDate', dateRange.startDate.toISOString());
            params.append('endDate', dateRange.endDate.toISOString());
        }

        const response = await apiClient.get(`${this.baseUrl}/reports/revenue?${params.toString()}`);
        return response.data.data;
    }

    /**
     * Export ledger entries
     */
    async exportLedgerEntries(filters?: LedgerFilter, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
        }
        params.append('format', format);

        const response = await apiClient.get(`${this.baseUrl}/export?${params.toString()}`, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Get unreconciled entries
     */
    async getUnreconciledEntries(businessUnitId?: string): Promise<LedgerEntry[]> {
        const response = await this.getLedgerEntries({
            businessUnitId,
            reconciliationStatus: ReconciliationStatus.PENDING
        });
        return response.data;
    }

    /**
     * Get entries with discrepancies
     */
    async getDiscrepancyEntries(businessUnitId?: string): Promise<LedgerEntry[]> {
        const response = await this.getLedgerEntries({
            businessUnitId,
            reconciliationStatus: ReconciliationStatus.DISCREPANCY
        });
        return response.data;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const financialLedgerService = new FinancialLedgerService();
export default financialLedgerService;
