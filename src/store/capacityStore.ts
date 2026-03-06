import { create } from 'zustand';

interface CapacityMetrics {
    totalClasses: number;
    underbookedClasses: number;
    fullClasses: number;
    averageCapacity: number;
    revenueImpact: number;
}

interface Recommendation {
    id: string;
    type: 'merge' | 'split' | 'move' | 'timeshift';
    title: string;
    description: string;
    impact: {
        studentsAffected: number;
        revenueImpact: number;
        capacityImprovement: number;
    };
    classes: string[];
}

interface CapacityStore {
    metrics: CapacityMetrics | null;
    recommendations: Recommendation[];
    underbookedClasses: any[];
    overbookedClasses: any[];
    loading: boolean;

    setMetrics: (metrics: CapacityMetrics) => void;
    setRecommendations: (recommendations: Recommendation[]) => void;
    setUnderbookedClasses: (classes: any[]) => void;
    setOverbookedClasses: (classes: any[]) => void;
    setLoading: (loading: boolean) => void;

    executeRecommendation: (id: string) => void;
    removeRecommendation: (id: string) => void;
}

export const useCapacityStore = create<CapacityStore>((set) => ({
    metrics: null,
    recommendations: [],
    underbookedClasses: [],
    overbookedClasses: [],
    loading: false,

    setMetrics: (metrics) => set({ metrics }),
    setRecommendations: (recommendations) => set({ recommendations }),
    setUnderbookedClasses: (classes) => set({ underbookedClasses: classes }),
    setOverbookedClasses: (classes) => set({ overbookedClasses: classes }),
    setLoading: (loading) => set({ loading }),

    executeRecommendation: (id) => set((state) => ({
        recommendations: state.recommendations.filter((r) => r.id !== id),
    })),

    removeRecommendation: (id) => set((state) => ({
        recommendations: state.recommendations.filter((r) => r.id !== id),
    })),
}));
