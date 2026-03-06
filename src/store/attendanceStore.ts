import { create } from 'zustand';
import type { Attendance, AttendanceFilters, AttendanceStats } from '@/types/attendance';

interface AttendanceStore {
    attendance: Attendance[];
    filters: AttendanceFilters;
    stats: AttendanceStats | null;
    loading: boolean;

    setAttendance: (attendance: Attendance[]) => void;
    setFilters: (filters: AttendanceFilters) => void;
    setStats: (stats: AttendanceStats) => void;
    setLoading: (loading: boolean) => void;

    addAttendance: (record: Attendance) => void;
    updateAttendance: (id: string, record: Partial<Attendance>) => void;

    clearFilters: () => void;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
    attendance: [],
    filters: {},
    stats: null,
    loading: false,

    setAttendance: (attendance) => set({ attendance }),
    setFilters: (filters) => set({ filters }),
    setStats: (stats) => set({ stats }),
    setLoading: (loading) => set({ loading }),

    addAttendance: (record) => set((state) => ({
        attendance: [...state.attendance, record],
    })),

    updateAttendance: (id, updatedRecord) => set((state) => ({
        attendance: state.attendance.map((a) =>
            a.id === id ? { ...a, ...updatedRecord } : a
        ),
    })),

    clearFilters: () => set({ filters: {} }),
}));
