import { create } from 'zustand';
import type { Staff, StaffFilters, StaffStats } from '@/types/staff';

interface StaffStore {
    staff: Staff[];
    selectedStaff: Staff | null;
    filters: StaffFilters;
    stats: StaffStats | null;
    loading: boolean;

    setStaff: (staff: Staff[]) => void;
    setSelectedStaff: (staff: Staff | null) => void;
    setFilters: (filters: StaffFilters) => void;
    setStats: (stats: StaffStats) => void;
    setLoading: (loading: boolean) => void;

    addStaff: (member: Staff) => void;
    updateStaff: (id: string, member: Partial<Staff>) => void;
    removeStaff: (id: string) => void;

    clearFilters: () => void;
}

export const useStaffStore = create<StaffStore>((set) => ({
    staff: [],
    selectedStaff: null,
    filters: {
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
    },
    stats: null,
    loading: false,

    setStaff: (staff) => set({ staff }),
    setSelectedStaff: (staff) => set({ selectedStaff: staff }),
    setFilters: (filters) => set({ filters }),
    setStats: (stats) => set({ stats }),
    setLoading: (loading) => set({ loading }),

    addStaff: (member) => set((state) => ({
        staff: [...state.staff, member],
    })),

    updateStaff: (id, updatedMember) => set((state) => ({
        staff: state.staff.map((s) =>
            s.id === id ? { ...s, ...updatedMember } : s
        ),
        selectedStaff: state.selectedStaff?.id === id
            ? { ...state.selectedStaff, ...updatedMember }
            : state.selectedStaff,
    })),

    removeStaff: (id) => set((state) => ({
        staff: state.staff.filter((s) => s.id !== id),
        selectedStaff: state.selectedStaff?.id === id ? null : state.selectedStaff,
    })),

    clearFilters: () => set({
        filters: {
            page: 1,
            limit: 20,
            sortBy: 'name',
            sortOrder: 'asc',
        },
    }),
}));
