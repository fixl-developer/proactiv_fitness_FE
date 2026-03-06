import { create } from 'zustand';
import type { Schedule, ScheduleFilters, ScheduleTemplate } from '@/types/schedule';

interface ScheduleStore {
    schedules: Schedule[];
    selectedSchedule: Schedule | null;
    templates: ScheduleTemplate[];
    filters: ScheduleFilters;
    viewMode: 'day' | 'week' | 'month';
    currentDate: Date;
    loading: boolean;

    setSchedules: (schedules: Schedule[]) => void;
    setSelectedSchedule: (schedule: Schedule | null) => void;
    setTemplates: (templates: ScheduleTemplate[]) => void;
    setFilters: (filters: ScheduleFilters) => void;
    setViewMode: (mode: 'day' | 'week' | 'month') => void;
    setCurrentDate: (date: Date) => void;
    setLoading: (loading: boolean) => void;

    addSchedule: (schedule: Schedule) => void;
    updateSchedule: (id: string, schedule: Partial<Schedule>) => void;
    removeSchedule: (id: string) => void;

    clearFilters: () => void;
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
    schedules: [],
    selectedSchedule: null,
    templates: [],
    filters: {},
    viewMode: 'week',
    currentDate: new Date(),
    loading: false,

    setSchedules: (schedules) => set({ schedules }),
    setSelectedSchedule: (schedule) => set({ selectedSchedule: schedule }),
    setTemplates: (templates) => set({ templates }),
    setFilters: (filters) => set({ filters }),
    setViewMode: (mode) => set({ viewMode: mode }),
    setCurrentDate: (date) => set({ currentDate: date }),
    setLoading: (loading) => set({ loading }),

    addSchedule: (schedule) => set((state) => ({
        schedules: [...state.schedules, schedule],
    })),

    updateSchedule: (id, updatedSchedule) => set((state) => ({
        schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, ...updatedSchedule } : s
        ),
        selectedSchedule: state.selectedSchedule?.id === id
            ? { ...state.selectedSchedule, ...updatedSchedule }
            : state.selectedSchedule,
    })),

    removeSchedule: (id) => set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== id),
        selectedSchedule: state.selectedSchedule?.id === id ? null : state.selectedSchedule,
    })),

    clearFilters: () => set({ filters: {} }),
}));
