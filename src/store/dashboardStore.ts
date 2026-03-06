import { create } from 'zustand';
import type { DashboardMetrics, DashboardFilters } from '@/types/dashboard';

interface DashboardState {
    metrics: DashboardMetrics | null;
    filters: DashboardFilters;
    loading: boolean;
    error: string | null;

    setMetrics: (metrics: DashboardMetrics) => void;
    setFilters: (filters: DashboardFilters) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    resetFilters: () => void;
}

const defaultFilters: DashboardFilters = {
    dateRange: 'month',
};

export const useDashboardStore = create<DashboardState>((set) => ({
    metrics: null,
    filters: defaultFilters,
    loading: false,
    error: null,

    setMetrics: (metrics) => set({ metrics }),
    setFilters: (filters) => set({ filters }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    resetFilters: () => set({ filters: defaultFilters }),
}));
