import { create } from 'zustand';
import type {
    Franchise,
    FranchiseMetrics,
    Partner,
    MultiBrandWallet,
} from '@/types/enterprise';

interface EnterpriseStore {
    // Franchise
    franchises: Franchise[];
    selectedFranchise: Franchise | null;
    franchiseMetrics: FranchiseMetrics | null;

    setFranchises: (franchises: Franchise[]) => void;
    setSelectedFranchise: (franchise: Franchise | null) => void;
    setFranchiseMetrics: (metrics: FranchiseMetrics | null) => void;
    addFranchise: (franchise: Franchise) => void;
    updateFranchise: (franchiseId: string, franchise: Partial<Franchise>) => void;

    // Partner
    partners: Partner[];
    selectedPartner: Partner | null;

    setPartners: (partners: Partner[]) => void;
    setSelectedPartner: (partner: Partner | null) => void;
    addPartner: (partner: Partner) => void;
    updatePartner: (partnerId: string, partner: Partial<Partner>) => void;

    // Multi-Brand Wallet
    multiBrandWallet: MultiBrandWallet | null;
    setMultiBrandWallet: (wallet: MultiBrandWallet | null) => void;

    loading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useEnterpriseStore = create<EnterpriseStore>((set) => ({
    // Franchise
    franchises: [],
    selectedFranchise: null,
    franchiseMetrics: null,

    setFranchises: (franchises) => set({ franchises }),
    setSelectedFranchise: (selectedFranchise) => set({ selectedFranchise }),
    setFranchiseMetrics: (franchiseMetrics) => set({ franchiseMetrics }),
    addFranchise: (franchise) =>
        set((state) => ({
            franchises: [...state.franchises, franchise],
        })),
    updateFranchise: (franchiseId, updatedFranchise) =>
        set((state) => ({
            franchises: state.franchises.map((f) =>
                f.id === franchiseId ? { ...f, ...updatedFranchise } : f
            ),
        })),

    // Partner
    partners: [],
    selectedPartner: null,

    setPartners: (partners) => set({ partners }),
    setSelectedPartner: (selectedPartner) => set({ selectedPartner }),
    addPartner: (partner) =>
        set((state) => ({
            partners: [...state.partners, partner],
        })),
    updatePartner: (partnerId, updatedPartner) =>
        set((state) => ({
            partners: state.partners.map((p) =>
                p.id === partnerId ? { ...p, ...updatedPartner } : p
            ),
        })),

    // Multi-Brand Wallet
    multiBrandWallet: null,
    setMultiBrandWallet: (multiBrandWallet) => set({ multiBrandWallet }),

    loading: false,
    setLoading: (loading) => set({ loading }),
}));
