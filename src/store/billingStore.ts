import { create } from 'zustand';
import type { Invoice } from '@/types/payment';

interface BillingStats {
    totalRevenue: number;
    totalInvoices: number;
    overdueInvoices: number;
    paidInvoices: number;
    pendingAmount: number;
}

interface BillingStore {
    invoices: Invoice[];
    stats: BillingStats | null;
    loading: boolean;

    setInvoices: (invoices: Invoice[]) => void;
    setStats: (stats: BillingStats) => void;
    setLoading: (loading: boolean) => void;

    addInvoice: (invoice: Invoice) => void;
    updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
    deleteInvoice: (id: string) => void;

    getOverdueInvoices: () => Invoice[];
    getInvoicesByStatus: (status: string) => Invoice[];
}

export const useBillingStore = create<BillingStore>((set, get) => ({
    invoices: [],
    stats: null,
    loading: false,

    setInvoices: (invoices) => set({ invoices }),
    setStats: (stats) => set({ stats }),
    setLoading: (loading) => set({ loading }),

    addInvoice: (invoice) => set((state) => ({
        invoices: [...state.invoices, invoice],
    })),

    updateInvoice: (id, updatedInvoice) => set((state) => ({
        invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updatedInvoice } : inv
        ),
    })),

    deleteInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== id),
    })),

    getOverdueInvoices: () => {
        const { invoices } = get();
        return invoices.filter((inv) => inv.status === 'overdue');
    },

    getInvoicesByStatus: (status) => {
        const { invoices } = get();
        return invoices.filter((inv) => inv.status === status);
    },
}));
