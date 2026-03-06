import { create } from 'zustand';
import type { Student, StudentFilters, StudentStats } from '@/types/student';

interface StudentStore {
    students: Student[];
    selectedStudent: Student | null;
    filters: StudentFilters;
    stats: StudentStats | null;
    loading: boolean;

    setStudents: (students: Student[]) => void;
    setSelectedStudent: (student: Student | null) => void;
    setFilters: (filters: StudentFilters) => void;
    setStats: (stats: StudentStats) => void;
    setLoading: (loading: boolean) => void;

    addStudent: (student: Student) => void;
    updateStudent: (id: string, student: Partial<Student>) => void;
    removeStudent: (id: string) => void;

    clearFilters: () => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
    students: [],
    selectedStudent: null,
    filters: {
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
    },
    stats: null,
    loading: false,

    setStudents: (students) => set({ students }),
    setSelectedStudent: (student) => set({ selectedStudent: student }),
    setFilters: (filters) => set({ filters }),
    setStats: (stats) => set({ stats }),
    setLoading: (loading) => set({ loading }),

    addStudent: (student) => set((state) => ({
        students: [...state.students, student],
    })),

    updateStudent: (id, updatedStudent) => set((state) => ({
        students: state.students.map((s) =>
            s.id === id ? { ...s, ...updatedStudent } : s
        ),
        selectedStudent: state.selectedStudent?.id === id
            ? { ...state.selectedStudent, ...updatedStudent }
            : state.selectedStudent,
    })),

    removeStudent: (id) => set((state) => ({
        students: state.students.filter((s) => s.id !== id),
        selectedStudent: state.selectedStudent?.id === id ? null : state.selectedStudent,
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
