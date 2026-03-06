import { create } from 'zustand';
import type { Program, ProgramFilters, ProgramStats } from '@/types/program';

interface ProgramStore {
    programs: Program[];
    selectedProgram: Program | null;
    filters: ProgramFilters;
    stats: ProgramStats | null;
    loading: boolean;

    setPrograms: (programs: Program[]) => void;
    setSelectedProgram: (program: Program | null) => void;
    setFilters: (filters: ProgramFilters) => void;
    setStats: (stats: ProgramStats) => void;
    setLoading: (loading: boolean) => void;

    addProgram: (program: Program) => void;
    updateProgram: (id: string, program: Partial<Program>) => void;
    removeProgram: (id: string) => void;

    clearFilters: () => void;
}

export const useProgramStore = create<ProgramStore>((set) => ({
    programs: [],
    selectedProgram: null,
    filters: {
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
    },
    stats: null,
    loading: false,

    setPrograms: (programs) => set({ programs }),
    setSelectedProgram: (program) => set({ selectedProgram: program }),
    setFilters: (filters) => set({ filters }),
    setStats: (stats) => set({ stats }),
    setLoading: (loading) => set({ loading }),

    addProgram: (program) => set((state) => ({
        programs: [...state.programs, program],
    })),

    updateProgram: (id, updatedProgram) => set((state) => ({
        programs: state.programs.map((p) =>
            p.id === id ? { ...p, ...updatedProgram } : p
        ),
        selectedProgram: state.selectedProgram?.id === id
            ? { ...state.selectedProgram, ...updatedProgram }
            : state.selectedProgram,
    })),

    removeProgram: (id) => set((state) => ({
        programs: state.programs.filter((p) => p.id !== id),
        selectedProgram: state.selectedProgram?.id === id ? null : state.selectedProgram,
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
