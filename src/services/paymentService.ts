/**
 * Payment Service - Handle all payment operations
 * Full backend API integration
 */

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
    PARTIAL_REFUND = 'PARTIAL_REFUND'
}

export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CASH = 'CASH',
    CHECK = 'CHECK',
    ONLINE_PAYMENT = 'ONLINE_PAYMENT'
}

export interface PaymentDetails {
    _id: string;
    transactionId: string;
    bookingId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    paymentMethodDetails?: {
        last4?: string;
        brand?: string;
        expiryMonth?: number;
        expiryYear?: number;
    };
    fees: {
        registration: number;
        processing: number;
        late: number;
        total: number;
    };
    paidAt?: string;
    refundedAt?: string;
    refundAmount?: number;
    refundReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProcessPaymentRequest {
    bookingId: string;
    paymentMethodId: string;
    amount: number;
    savePaymentMethod?: boolean;
}

export interface RefundRequest {
    bookingId: string;
    amount: number;
    reason: string;
    reasonDetails?: string;
}

export interface SavedPaymentMethod {
    _id: string;
    type: PaymentMethod;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
    createdAt: string;
}

class PaymentService {
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    /**
     * Process payment for a booking
     */
    async processPayment(data: ProcessPaymentRequest): Promise<PaymentDetails> {
        const response = await fetch(`${API_URL}/payments/process`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Payment processing failed');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Get payment details by ID
     */
    async getPaymentById(paymentId: string): Promise<PaymentDetails> {
        const response = await fetch(`${API_URL}/payments/${paymentId}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch payment details');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Get payment details by booking ID
     */
    async getPaymentByBookingId(bookingId: string): Promise<PaymentDetails> {
        const response = await fetch(`${API_URL}/payments/booking/${bookingId}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch payment details');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Get payment history for current user
     */
    async getPaymentHistory(filters?: {
        startDate?: string;
        endDate?: string;
        status?: PaymentStatus;
    }): Promise<PaymentDetails[]> {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.status) params.append('status', filters.status);

        const response = await fetch(`${API_URL}/payments/history?${params.toString()}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch payment history');
        }

        const result = await response.json();
        return result.data.payments || [];
    }

    /**
     * Request refund for a payment
     */
    async requestRefund(data: RefundRequest): Promise<PaymentDetails> {
        const response = await fetch(`${API_URL}/payments/refund`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Refund request failed');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Get saved payment methods
     */
    async getSavedPaymentMethods(): Promise<SavedPaymentMethod[]> {
        const response = await fetch(`${API_URL}/payments/methods`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch payment methods');
        }

        const result = await response.json();
        return result.data.methods || [];
    }

    /**
     * Add new payment method
     */
    async addPaymentMethod(data: {
        type: PaymentMethod;
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
        cardholderName: string;
        isDefault?: boolean;
    }): Promise<SavedPaymentMethod> {
        const response = await fetch(`${API_URL}/payments/methods`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add payment method');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Delete payment method
     */
    async deletePaymentMethod(methodId: string): Promise<void> {
        const response = await fetch(`${API_URL}/payments/methods/${methodId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete payment method');
        }
    }

    /**
     * Set default payment method
     */
    async setDefaultPaymentMethod(methodId: string): Promise<SavedPaymentMethod> {
        const response = await fetch(`${API_URL}/payments/methods/${methodId}/set-default`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to set default payment method');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Calculate booking cost with fees
     */
    async calculateBookingCost(bookingData: {
        programId: string;
        sessionId: string;
        participants: number;
    }): Promise<{
        basePrice: number;
        registrationFee: number;
        processingFee: number;
        total: number;
        currency: string;
    }> {
        const response = await fetch(`${API_URL}/payments/calculate`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to calculate cost');
        }

        const result = await response.json();
        return result.data;
    }
}

export const paymentService = new PaymentService();
export default paymentService;
