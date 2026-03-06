import { create } from 'zustand';
import type {
    DataExportRequest,
    DataDeletionRequest,
    RetentionPolicy,
} from '@/types/dataManagement';

interface DataManagementState {
    exportRequests: DataExportRequest[];
    deletionRequests: DataDeletionRequest[];
    retentionPolicies: RetentionPolicy[];

    // Actions
    setExportRequests: (requests: DataExportRequest[]) => void;
    setDeletionRequests: (requests: DataDeletionRequest[]) => void;
    setRetentionPolicies: (policies: RetentionPolicy[]) => void;
    addExportRequest: (request: DataExportRequest) => void;
    addDeletionRequest: (request: DataDeletionRequest) => void;
    updateExportRequest: (requestId: string, updates: Partial<DataExportRequest>) => void;
    updateDeletionRequest: (requestId: string, updates: Partial<DataDeletionRequest>) => void;
    updateRetentionPolicy: (policyId: string, updates: Partial<RetentionPolicy>) => void;
}

export const useDataManagementStore = create<DataManagementState>((set) => ({
    exportRequests: [],
    deletionRequests: [],
    retentionPolicies: [],

    setExportRequests: (exportRequests) => set({ exportRequests }),
    setDeletionRequests: (deletionRequests) => set({ deletionRequests }),
    setRetentionPolicies: (retentionPolicies) => set({ retentionPolicies }),

    addExportRequest: (request) =>
        set((state) => ({
            exportRequests: [...state.exportRequests, request],
        })),

    addDeletionRequest: (request) =>
        set((state) => ({
            deletionRequests: [...state.deletionRequests, request],
        })),

    updateExportRequest: (requestId, updates) =>
        set((state) => ({
            exportRequests: state.exportRequests.map((r) =>
                r.id === requestId ? { ...r, ...updates } : r
            ),
        })),

    updateDeletionRequest: (requestId, updates) =>
        set((state) => ({
            deletionRequests: state.deletionRequests.map((r) =>
                r.id === requestId ? { ...r, ...updates } : r
            ),
        })),

    updateRetentionPolicy: (policyId, updates) =>
        set((state) => ({
            retentionPolicies: state.retentionPolicies.map((p) =>
                p.id === policyId ? { ...p, ...updates } : p
            ),
        })),
}));
