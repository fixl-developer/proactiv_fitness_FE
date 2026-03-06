import { apiClient } from './client';
import type { Payment, PaymentFilters, Invoice, Wallet, WalletTransaction, ApiResponse } from '@/types';

export const paymentsApi = {
    // Payments
    getAll: async (filters?: PaymentFilters) => {
        const response = await apiClient.get<ApiResponse<{ payments: Payment[]; total: number }>>(
            '/payments',
            { params: filters }
        );
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
        return response.data.data;
    },

    create: async (data: Partial<Payment>) => {
        const response = await apiClient.post<ApiResponse<Payment>>('/payments', data);
        return response.data.data;
    },

    refund: async (id: string, amount: number, reason: string) => {
        const response = await apiClient.post<ApiResponse<Payment>>(`/payments/${id}/refund`, { amount, reason });
        return response.data.data;
    },

    retry: async (id: string) => {
        const response = await apiClient.post<ApiResponse<Payment>>(`/payments/${id}/retry`);
        return response.data.data;
    },

    // Invoices
    getAllInvoices: async (filters?: any) => {
        const response = await apiClient.get<ApiResponse<{ invoices: Invoice[]; total: number }>>(
            '/invoices',
            { params: filters }
        );
        return response.data.data;
    },

    getInvoiceById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
        return response.data.data;
    },

    createInvoice: async (data: Partial<Invoice>) => {
        const response = await apiClient.post<ApiResponse<Invoice>>('/invoices', data);
        return response.data.data;
    },

    sendInvoice: async (id: string) => {
        const response = await apiClient.post<ApiResponse<Invoice>>(`/invoices/${id}/send`);
        return response.data.data;
    },

    // Wallet
    getWallet: async (userId: string) => {
        const response = await apiClient.get<ApiResponse<Wallet>>(`/wallet/${userId}`);
        return response.data.data;
    },

    getWalletTransactions: async (walletId: string) => {
        const response = await apiClient.get<ApiResponse<WalletTransaction[]>>(`/wallet/${walletId}/transactions`);
        return response.data.data;
    },

    addCredits: async (walletId: string, amount: number, bucketType: string) => {
        const response = await apiClient.post<ApiResponse<Wallet>>(`/wallet/${walletId}/credit`, { amount, bucketType });
        return response.data.data;
    },
};
