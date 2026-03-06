import { create } from 'zustand';
import type { Report, ReportTemplate, AnalyticsDashboard } from '@/types/reporting';

interface ReportingState {
    reports: Report[];
    templates: ReportTemplate[];
    dashboards: AnalyticsDashboard[];
    selectedReport: Report | null;
    selectedDashboard: AnalyticsDashboard | null;

    // Actions
    setReports: (reports: Report[]) => void;
    setTemplates: (templates: ReportTemplate[]) => void;
    setDashboards: (dashboards: AnalyticsDashboard[]) => void;
    setSelectedReport: (report: Report | null) => void;
    setSelectedDashboard: (dashboard: AnalyticsDashboard | null) => void;
    addReport: (report: Report) => void;
    updateReport: (reportId: string, updates: Partial<Report>) => void;
    removeReport: (reportId: string) => void;
    addDashboard: (dashboard: AnalyticsDashboard) => void;
    updateDashboard: (dashboardId: string, updates: Partial<AnalyticsDashboard>) => void;
    removeDashboard: (dashboardId: string) => void;
}

export const useReportingStore = create<ReportingState>((set) => ({
    reports: [],
    templates: [],
    dashboards: [],
    selectedReport: null,
    selectedDashboard: null,

    setReports: (reports) => set({ reports }),
    setTemplates: (templates) => set({ templates }),
    setDashboards: (dashboards) => set({ dashboards }),
    setSelectedReport: (selectedReport) => set({ selectedReport }),
    setSelectedDashboard: (selectedDashboard) => set({ selectedDashboard }),

    addReport: (report) =>
        set((state) => ({
            reports: [...state.reports, report],
        })),

    updateReport: (reportId, updates) =>
        set((state) => ({
            reports: state.reports.map((r) => (r.id === reportId ? { ...r, ...updates } : r)),
            selectedReport:
                state.selectedReport?.id === reportId
                    ? { ...state.selectedReport, ...updates }
                    : state.selectedReport,
        })),

    removeReport: (reportId) =>
        set((state) => ({
            reports: state.reports.filter((r) => r.id !== reportId),
            selectedReport: state.selectedReport?.id === reportId ? null : state.selectedReport,
        })),

    addDashboard: (dashboard) =>
        set((state) => ({
            dashboards: [...state.dashboards, dashboard],
        })),

    updateDashboard: (dashboardId, updates) =>
        set((state) => ({
            dashboards: state.dashboards.map((d) =>
                d.id === dashboardId ? { ...d, ...updates } : d
            ),
            selectedDashboard:
                state.selectedDashboard?.id === dashboardId
                    ? { ...state.selectedDashboard, ...updates }
                    : state.selectedDashboard,
        })),

    removeDashboard: (dashboardId) =>
        set((state) => ({
            dashboards: state.dashboards.filter((d) => d.id !== dashboardId),
            selectedDashboard:
                state.selectedDashboard?.id === dashboardId ? null : state.selectedDashboard,
        })),
}));
