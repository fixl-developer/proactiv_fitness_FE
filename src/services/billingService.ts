/**
 * Billing Engine Service
 * Handles all billing and invoicing operations
 * Module 3.3 - Phase 3: Customer & Money
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum BillingCycle {
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    ANNUALLY = 'annually',
    ONE_TIME = 'one_time'
}

export enum InvoiceStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    SENT = 'sent',
    PAID = 'paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export enum BillingItemType {
    PROGRAM_FEE = 'program_fee',
    REGISTRATION_FEE = 'registration_fee',
    LATE_FEE = 'late_fee',
    CANCELLATION_FEE = 'cancellation_fee',
    DISCOUNT = 'discount',
    CREDIT = 'credit',
    REFUND = 'refund',
    ADJUSTMENT = 'adjustment'
}

export interface BillingItem {
    type: BillingItemType;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxRate?: number;
    taxAmount?: number;
    discountAmount?: number;
    programId?: string;
    bookingId?: string;
}

export interface Invoice {
    _id: string;
    invoiceNumber: string;
    familyId: string;
    businessUnitId: string;
    billingPeriod: {
        startDate: Date;
        endDate: Date;
    };
    status: InvoiceStatus;
    issueDate: Date;
    dueDate: Date;
    paidDate?: Date;
    items: BillingItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    paymentTerms: string;
    paymentMethods: string[];
    sentDate?: Date;
    remindersSent: number;
    lastReminderDate?: Date;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface BillingSchedule {
    _id: string;
    familyId: string;
    billingCycle: BillingCycle;
    nextBillingDate: Date;
    isActive: boolean;
    autoPayEnabled: boolean;
    paymentMethodId?: string;
    consolidateCharges: boolean;
    prorationEnabled: boolean;
    lateFeeEnabled: boolean;
    lateFeeAmount: number;
    lateFeeDays: number;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface InvoiceFilter {
    familyId?: string;
    businessUnitId?: string;
    status?: InvoiceStatus;
    startDate?: Date;
    endDate?: Date;
    isOverdue?: boolean;
    searchText?: string;
    page?: number;
    limit?: number;
}

export interface CreateInvoiceDto {
    familyId: string;
    businessUnitId: string;
    billingPeriod: {
        startDate: Date;
        endDate: Date;
    };
    items: BillingItem[];
    dueDate: Date;
    paymentTerms?: string;
}

export interface BillingStatistics {
    totalInvoices: number;
    totalRevenue: number;
    paidAmount: number;
    outstandingAmount: number;
    overdueAmount: number;
    invoicesByStatus: Record<InvoiceStatus, number>;
    averageInvoiceValue: number;
    paymentRate: number;
    averagePaymentTime: number;
}

// ============================================================================
// BILLING SERVICE
// ============================================================================

class BillingService {
    private readonly baseUrl = '/billing';

    /**
     * Get all invoices with filtering
     */
    async getInvoices(filters?: InvoiceFilter): Promise<{ data: Invoice[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.familyId) params.append('familyId', filters.familyId);
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.status) params.append('status', filters.status);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters.isOverdue !== undefined) params.append('isOverdue', filters.isOverdue.toString());
            if (filters.searchText) params.append('searchText', filters.searchText);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}/invoices?${params.toString()}`);
        return response.data;
    }

    /**
     * Get invoice by ID
     */
    async getInvoiceById(invoiceId: string): Promise<Invoice> {
        const response = await apiClient.get(`${this.baseUrl}/invoices/${invoiceId}`);
        return response.data;
    }

    /**
     * Create new invoice
     */
    async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
        const response = await apiClient.post(`${this.baseUrl}/invoices`, data);
        return response.data;
    }

    /**
     * Update invoice
     */
    async updateInvoice(invoiceId: string, data: Partial<Invoice>): Promise<Invoice> {
        const response = await apiClient.put(`${this.baseUrl}/invoices/${invoiceId}`, data);
        return response.data;
    }

    /**
     * Delete invoice
     */
    async deleteInvoice(invoiceId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/invoices/${invoiceId}`);
    }

    /**
     * Send invoice
     */
    async sendInvoice(invoiceId: string): Promise<Invoice> {
        const response = await apiClient.post(`${this.baseUrl}/invoices/${invoiceId}/send`);
        return response.data;
    }

    /**
     * Mark invoice as paid
     */
    async markInvoiceAsPaid(invoiceId: string, paymentDetails: { amount: number; paymentMethodId: string; transactionId?: string }): Promise<Invoice> {
        const response = await apiClient.post(`${this.baseUrl}/invoices/${invoiceId}/pay`, paymentDetails);
        return response.data;
    }

    /**
     * Cancel invoice
     */
    async cancelInvoice(invoiceId: string, reason?: string): Promise<Invoice> {
        const response = await apiClient.post(`${this.baseUrl}/invoices/${invoiceId}/cancel`, { reason });
        return response.data;
    }

    /**
     * Get family invoices
     */
    async getFamilyInvoices(familyId: string, filters?: Partial<InvoiceFilter>): Promise<Invoice[]> {
        const response = await this.getInvoices({ ...filters, familyId });
        return response.data;
    }

    /**
     * Get overdue invoices
     */
    async getOverdueInvoices(familyId?: string): Promise<Invoice[]> {
        const response = await this.getInvoices({ familyId, isOverdue: true });
        return response.data;
    }

    /**
     * Get billing statistics
     */
    async getBillingStatistics(businessUnitId?: string, dateRange?: { startDate: Date; endDate: Date }): Promise<BillingStatistics> {
        const params = new URLSearchParams();
        if (businessUnitId) params.append('businessUnitId', businessUnitId);
        if (dateRange) {
            params.append('startDate', dateRange.startDate.toISOString());
            params.append('endDate', dateRange.endDate.toISOString());
        }

        const response = await apiClient.get(`${this.baseUrl}/statistics?${params.toString()}`);
        return response.data;
    }

    /**
     * Get billing schedule
     */
    async getBillingSchedule(familyId: string): Promise<BillingSchedule> {
        const response = await apiClient.get(`${this.baseUrl}/schedules/${familyId}`);
        return response.data;
    }

    /**
     * Create billing schedule
     */
    async createBillingSchedule(data: Partial<BillingSchedule>): Promise<BillingSchedule> {
        const response = await apiClient.post(`${this.baseUrl}/schedules`, data);
        return response.data;
    }

    /**
     * Update billing schedule
     */
    async updateBillingSchedule(scheduleId: string, data: Partial<BillingSchedule>): Promise<BillingSchedule> {
        const response = await apiClient.put(`${this.baseUrl}/schedules/${scheduleId}`, data);
        return response.data;
    }

    /**
     * Download invoice PDF
     */
    async downloadInvoicePDF(invoiceId: string): Promise<Blob> {
        const response = await apiClient.get(`${this.baseUrl}/invoices/${invoiceId}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Send invoice reminder
     */
    async sendInvoiceReminder(invoiceId: string): Promise<void> {
        await apiClient.post(`${this.baseUrl}/invoices/${invoiceId}/remind`);
    }

    /**
     * Apply discount to invoice
     */
    async applyDiscount(invoiceId: string, discountCode: string): Promise<Invoice> {
        const response = await apiClient.post(`${this.baseUrl}/invoices/${invoiceId}/discount`, { discountCode });
        return response.data;
    }

    /**
     * Add item to invoice
     */
    async addInvoiceItem(invoiceId: string, item: BillingItem): Promise<Invoice> {
        const response = await apiClient.post(`${this.baseUrl}/invoices/${invoiceId}/items`, item);
        return response.data;
    }

    /**
     * Remove item from invoice
     */
    async removeInvoiceItem(invoiceId: string, itemIndex: number): Promise<Invoice> {
        const response = await apiClient.delete(`${this.baseUrl}/invoices/${invoiceId}/items/${itemIndex}`);
        return response.data;
    }

    /**
     * Generate invoice for family
     */
    async generateInvoice(familyId: string, billingPeriod: { startDate: Date; endDate: Date }): Promise<Invoice> {
        const response = await apiClient.post(`${this.baseUrl}/invoices/generate`, {
            familyId,
            billingPeriod
        });
        return response.data;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const billingService = new BillingService();
export default billingService;
