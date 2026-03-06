import { create } from 'zustand';
import type { Payment, Invoice, Wallet } from '@/types/payment';

interface PaymentStore {
    payments: Payment[];
    invoices: Invoice[];
    wallet: Wallet | null;
    loading: boolean;

    setPayments: (payments: Payment[]) => void;
    setInvoices: (invoices: Invoice[]) => void;
    setWallet: (wallet: Wallet) => void;
    setLoading: (loading: boolean) => void;

    addPayment: (payment: Payment) => void;
    updatePayment: (id: string, payment: Partial<Payment>) => void;

    addInvoice: (invoice: Invoice) => void;
    updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
    payments: [],
    invoices: [],
    wallet: null,
    loading: false,

    setPayments: (payments) => set({ payments }),
    setInvoices: (invoices) => set({ invoices }),
    setWallet: (wallet) => set({ wallet }),
    setLoading: (loading) => set({ loading }),

    addPayment: (payment) => set((state) => ({
        payments: [...state.payments, payment],
    })),

    updatePayment: (id, updatedPayment) => set((state) => ({
        payments: state.payments.map((p) =>
            p.id === id ? { ...p, ...updatedPayment } : p
        ),
    })),

    addInvoice: (invoice) => set((state) => ({
        invoices: [...state.invoices, invoice],
    })),

    updateInvoice: (id, updatedInvoice) => set((state) => ({
        invoices: state.invoices.map((i) =>
            i.id === id ? { ...i, ...updatedInvoice } : i
        ),
    })),
}));
