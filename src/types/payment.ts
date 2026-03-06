// Payment types and interfaces

export interface Payment {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
    paymentMethod: 'card' | 'cash' | 'bank_transfer' | 'wallet' | 'other';
    transactionId?: string;

    // Payment Details
    description: string;
    invoiceId?: string;

    // Card Details (if applicable)
    cardLast4?: string;
    cardBrand?: string;

    // Dates
    paymentDate: string;
    processedAt?: string;

    // Refund
    refundAmount?: number;
    refundReason?: string;
    refundedAt?: string;

    createdAt: string;
    updatedAt: string;
}

export interface PaymentFilters {
    studentId?: string;
    status?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    studentId: string;
    studentName: string;
    parentEmail: string;

    // Items
    items: InvoiceItem[];

    // Amounts
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    amountPaid: number;
    amountDue: number;

    // Status
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

    // Dates
    issueDate: string;
    dueDate: string;
    paidDate?: string;

    // Payment
    paymentIds: string[];

    createdAt: string;
    updatedAt: string;
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface WalletTransaction {
    id: string;
    walletId: string;
    type: 'credit' | 'debit';
    amount: number;
    bucketType: 'cash' | 'promo' | 'loyalty' | 'subsidy' | 'refund';
    description: string;
    referenceId?: string;
    referenceType?: string;
    balanceBefore: number;
    balanceAfter: number;
    createdAt: string;
}

export interface Wallet {
    id: string;
    userId: string;
    userName: string;

    // Balances by bucket
    cashBalance: number;
    promoBalance: number;
    loyaltyBalance: number;
    subsidyBalance: number;
    refundBalance: number;

    totalBalance: number;

    // Metadata
    createdAt: string;
    updatedAt: string;
}
